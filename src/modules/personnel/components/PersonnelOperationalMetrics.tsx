import { useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Card,
    CardContent,
    Chip,
    Divider,
    useTheme,
    alpha,
} from '@mui/material';
import {
    AutoAwesome as AutoIcon,
    Timer as TimerIcon,
    Speed as SpeedIcon,
    ReportProblem as ErrorIcon,
    LocalShipping as TruckIcon,
    Inventory as BoxIcon,
} from '@mui/icons-material';
import { format, subDays } from 'date-fns';
import {
    useGetMetricsLiveQuery,
    useGetMetricSamplesQuery,
    type MetricValueWithBand,
} from '../services/personnelApi';
import { bandColor, formatMetricValue } from '../../work/utils/bands';

type Props = {
    personnelId: number;
    positionType?: string | null;
};

function fmt(n: number | null | undefined, digits = 1): string {
    if (n === null || n === undefined) return '—';
    return n.toLocaleString('es-HN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function fmtInt(n: number | null | undefined): string {
    if (n === null || n === undefined) return '—';
    return n.toLocaleString('es-HN');
}

function MetricCard({
    icon,
    label,
    metric,
    suffix = '',
    digits = 1,
}: {
    icon: React.ReactNode;
    label: string;
    metric: MetricValueWithBand | undefined;
    suffix?: string;
    digits?: number;
}) {
    const theme = useTheme();
    const color = metric ? bandColor(theme, metric.band) : theme.palette.text.disabled;
    const valueStr = metric && metric.value !== null && metric.value !== undefined
        ? `${formatMetricValue(metric, digits)}${suffix}`
        : '—';

    return (
        <Card variant="outlined" sx={{ borderLeft: `4px solid ${color}`, height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: alpha(color, 0.15),
                            color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {label}
                        </Typography>
                        <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.2, fontFeatureSettings: '"tnum"', color }}>
                            {valueStr}
                        </Typography>
                        {metric?.target != null && (
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
                                meta {fmt(metric.target, digits)}{suffix}
                                {metric.trigger != null && ` · disp ${fmt(metric.trigger, digits)}${suffix}`}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

function RawStatCard({
    icon,
    label,
    value,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
}) {
    const theme = useTheme();
    return (
        <Card variant="outlined" sx={{ borderLeft: `4px solid ${color}`, height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: alpha(color, 0.15), color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {label}
                        </Typography>
                        <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.2, fontFeatureSettings: '"tnum"' }}>
                            {value}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

export default function PersonnelOperationalMetrics({ personnelId, positionType }: Props) {
    const theme = useTheme();
    const today = format(new Date(), 'yyyy-MM-dd');
    const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');

    const { data: live } = useGetMetricsLiveQuery(
        { personnel_id: personnelId, operational_date: today },
    );

    const { data: samplesData } = useGetMetricSamplesQuery({
        personnel: personnelId,
        operational_date__gte: sevenDaysAgo,
        limit: 50,
    });

    const samples = samplesData?.results || [];

    // Agrupar samples por metric_code → últimos valores + promedio últimos 7 días
    const samplesByMetric = useMemo(() => {
        const map: Record<string, { name: string; unit: string; values: number[]; lastValue?: number; lastDate?: string }> = {};
        for (const s of samples) {
            const code = s.metric_code;
            if (!map[code]) {
                map[code] = { name: s.metric_name, unit: s.metric_unit, values: [] };
            }
            map[code].values.push(Number(s.numeric_value));
            const prevDate = map[code].lastDate;
            if (!prevDate || s.operational_date > prevDate) {
                map[code].lastDate = s.operational_date;
                map[code].lastValue = Number(s.numeric_value);
            }
        }
        return map;
    }, [samples]);

    const isPicker = ['PICKER', 'LOADER'].includes(positionType || '');
    const isCounter = positionType === 'COUNTER' || positionType === 'WAREHOUSE_ASSISTANT';
    const isYard = positionType === 'YARD_DRIVER';
    const showAll = !isPicker && !isCounter && !isYard;

    const hasData = samples.length > 0 || live !== undefined;

    return (
        <Paper
            variant="outlined"
            sx={{
                mb: 3,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
            }}
        >
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <AutoIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                        Métricas Operativas Automáticas
                    </Typography>
                    <Chip label="HOY" size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>
                    Calculadas desde el Ciclo del Camión cuando la persona toma/completa pautas. Colores según metas del centro.
                </Typography>

                {!hasData && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                            Aún no hay métricas operativas para esta persona.
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Se generan automáticamente al completar pautas (T1, T6, T1B, T8B).
                        </Typography>
                    </Box>
                )}

                {/* Picker */}
                {hasData && (isPicker || showAll) && live?.picker && (
                    <>
                        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1, mt: 1, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
                            Picker — hoy
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5, mb: 2 }}>
                            <MetricCard icon={<SpeedIcon />} label="Pallets/HR" metric={live.picker.pallets_per_hour} />
                            <MetricCard icon={<BoxIcon />} label="Cargas armadas" metric={live.picker.loads_assembled} digits={0} />
                            <MetricCard icon={<TimerIcon />} label="Tiempo/pauta" metric={live.picker.avg_time_per_pauta_min} suffix=" min" digits={0} />
                            <MetricCard icon={<ErrorIcon />} label="% Errores carga" metric={live.picker.load_error_rate_pct} suffix="%" />
                        </Box>
                    </>
                )}

                {/* Counter */}
                {hasData && (isCounter || showAll) && live?.counter && (
                    <>
                        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1, mt: 1, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
                            Contador — hoy
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5, mb: 2 }}>
                            <MetricCard icon={<SpeedIcon />} label="Pallets contados/h" metric={live.counter.pallets_per_hour} />
                            <MetricCard icon={<TimerIcon />} label="Tiempo/camión" metric={live.counter.avg_time_per_truck_min} suffix=" min" digits={0} />
                            <MetricCard icon={<ErrorIcon />} label="% Errores conteo" metric={live.counter.error_rate_pct} suffix="%" />
                            <RawStatCard icon={<BoxIcon />} label="Conteos hoy" value={fmtInt(live.counter.samples_count)} color={theme.palette.primary.main} />
                        </Box>
                    </>
                )}

                {/* Yard */}
                {hasData && (isYard || showAll) && live?.yard && (
                    <>
                        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1, mt: 1, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
                            Chofer de patio — hoy
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5, mb: 2 }}>
                            <MetricCard icon={<TruckIcon />} label="Camiones movidos" metric={live.yard.trucks_moved} digits={0} />
                            <MetricCard icon={<TimerIcon />} label="Estac→Bahía" metric={live.yard.avg_park_to_bay_min} suffix=" min" digits={0} />
                            <MetricCard icon={<TimerIcon />} label="Bahía→Estac" metric={live.yard.avg_bay_to_park_min} suffix=" min" digits={0} />
                            <MetricCard icon={<TimerIcon />} label="Total movim." metric={live.yard.avg_total_move_min} suffix=" min" digits={0} />
                        </Box>
                    </>
                )}

                {/* Histórico últimos 7 días */}
                {Object.keys(samplesByMetric).length > 0 && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
                            Histórico últimos 7 días
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1 }}>
                            {Object.entries(samplesByMetric).map(([code, m]) => {
                                const avg = m.values.length ? m.values.reduce((a, b) => a + b, 0) / m.values.length : 0;
                                return (
                                    <Box
                                        key={code}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 1,
                                            bgcolor: 'background.paper',
                                            border: 1,
                                            borderColor: 'divider',
                                        }}
                                    >
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                                            {m.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.25 }}>
                                            <Typography variant="h6" fontWeight={800} sx={{ fontFeatureSettings: '"tnum"' }}>
                                                {fmt(avg)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {m.unit} · prom {m.values.length} muestras
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </>
                )}
            </Box>
        </Paper>
    );
}
