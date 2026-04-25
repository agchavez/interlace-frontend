import { Box, Paper, Typography, useTheme, alpha, CircularProgress } from '@mui/material';
import { useGetMetricsLiveQuery, type MetricValueWithBand } from '../../personnel/services/personnelApi';
import { format } from 'date-fns';
import { bandColor, formatMetricValue } from '../utils/bands';

type Role = 'picker' | 'counter' | 'yard';

const TITLES: Record<Role, string> = {
    picker:  'Turno Picker — Centro',
    counter: 'Turno Contador — Centro',
    yard:    'Turno Chofer de Patio — Centro',
};

type StatDef = { label: string; metric?: MetricValueWithBand; rawValue?: number | null; suffix?: string };

function formatInt(n: number | null | undefined): string {
    if (n === null || n === undefined) return '—';
    return n.toLocaleString('es-HN');
}

type Props = {
    role: Role;
    distributorCenterId?: number | null;
};

export default function RoleLiveStats({ role, distributorCenterId }: Props) {
    const theme = useTheme();
    const today = format(new Date(), 'yyyy-MM-dd');

    const { data, isLoading } = useGetMetricsLiveQuery(
        {
            operational_date: today,
            ...(distributorCenterId ? { distributor_center: distributorCenterId } : {}),
        },
        { pollingInterval: 30_000 },
    );

    const stats: StatDef[] = !data
        ? []
        : role === 'picker'
            ? [
                { label: 'Pallets/HR',         metric: data.picker.pallets_per_hour },
                { label: 'Cargas armadas',     metric: data.picker.loads_assembled },
                { label: 'Tiempo/pauta (min)', metric: data.picker.avg_time_per_pauta_min },
                { label: '% Errores carga',    metric: data.picker.load_error_rate_pct, suffix: '%' },
            ]
            : role === 'counter'
            ? [
                { label: 'Pallets/HR',           metric: data.counter.pallets_per_hour },
                { label: 'Tiempo/camión (min)',  metric: data.counter.avg_time_per_truck_min },
                { label: '% Errores conteo',     metric: data.counter.error_rate_pct, suffix: '%' },
                { label: 'Conteos hoy',          rawValue: data.counter.samples_count },
            ]
            : [
                { label: 'Camiones movidos',    metric: data.yard.trucks_moved },
                { label: 'Estac→Bahía (min)',   metric: data.yard.avg_park_to_bay_min },
                { label: 'Bahía→Estac (min)',   metric: data.yard.avg_bay_to_park_min },
                { label: 'Total movim. (min)',  metric: data.yard.avg_total_move_min },
            ];

    return (
        <Paper
            elevation={0}
            sx={{
                p: 1.5,
                mb: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary' }}>
                    {TITLES[role]}
                </Typography>
                {isLoading && <CircularProgress size={12} />}
            </Box>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 1,
                }}
            >
                {stats.map((s) => {
                    const valueStr = s.metric
                        ? `${formatMetricValue(s.metric)}${s.suffix ?? ''}`
                        : s.rawValue !== undefined
                            ? formatInt(s.rawValue)
                            : '—';
                    const color = s.metric ? bandColor(theme, s.metric.band) : theme.palette.text.primary;
                    return (
                        <Box key={s.label} sx={{ textAlign: 'center' }}>
                            <Typography
                                variant="h6"
                                fontWeight={900}
                                sx={{
                                    lineHeight: 1.1,
                                    fontFeatureSettings: '"tnum"',
                                    color,
                                }}
                            >
                                {valueStr}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                {s.label}
                            </Typography>
                            {s.metric?.target != null && (
                                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.disabled', display: 'block', lineHeight: 1 }}>
                                    meta {s.metric.target}{s.suffix ?? s.metric.unit ? (s.suffix ?? '') : ''}
                                </Typography>
                            )}
                        </Box>
                    );
                })}
            </Box>
        </Paper>
    );
}
