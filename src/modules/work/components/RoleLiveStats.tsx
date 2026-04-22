import { Box, Paper, Typography, useTheme, alpha, CircularProgress } from '@mui/material';
import { useGetMetricsLiveQuery } from '../../personnel/services/personnelApi';
import { format } from 'date-fns';

type Role = 'picker' | 'counter' | 'yard';

const TITLES: Record<Role, string> = {
    picker:  'Turno Picker — Centro',
    counter: 'Turno Contador — Centro',
    yard:    'Turno Chofer de Patio — Centro',
};

type StatDef = { label: string; value: string };

function formatNumber(n: number | null | undefined, digits = 1): string {
    if (n === null || n === undefined) return '—';
    return n.toLocaleString('es-HN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

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
                { label: 'Pallets/HR',        value: formatNumber(data.picker.pallets_per_hour) },
                { label: 'Cargas armadas',    value: formatInt(data.picker.loads_assembled) },
                { label: 'Tiempo/pauta (min)', value: formatNumber(data.picker.avg_time_per_pauta_min) },
                { label: '% Errores carga',   value: data.picker.load_error_rate_pct !== null ? `${formatNumber(data.picker.load_error_rate_pct)}%` : '—' },
            ]
            : role === 'counter'
            ? [
                { label: 'Pallets/HR',          value: formatNumber(data.counter.pallets_per_hour) },
                { label: 'Tiempo/camión (min)', value: formatNumber(data.counter.avg_time_per_truck_min) },
                { label: '% Errores conteo',    value: data.counter.error_rate_pct !== null ? `${formatNumber(data.counter.error_rate_pct)}%` : '—' },
                { label: 'Conteos hoy',         value: formatInt(data.counter.samples_count) },
            ]
            : [
                { label: 'Camiones movidos',    value: formatInt(data.yard.trucks_moved) },
                { label: 'Estac→Bahía (min)',   value: formatNumber(data.yard.avg_park_to_bay_min) },
                { label: 'Bahía→Estac (min)',   value: formatNumber(data.yard.avg_bay_to_park_min) },
                { label: 'Total movim. (min)',  value: formatNumber(data.yard.avg_total_move_min) },
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
                {stats.map((s) => (
                    <Box key={s.label} sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.1, fontFeatureSettings: '"tnum"' }}>
                            {s.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {s.label}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
}
