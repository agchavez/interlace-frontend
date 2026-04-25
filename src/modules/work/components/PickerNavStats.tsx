import { useEffect, useState } from 'react';
import { Box, Typography, useTheme, alpha, Tooltip, ButtonBase } from '@mui/material';
import {
    CheckCircle as DoneIcon,
    Speed as SpeedIcon,
    Timer as TimerIcon,
    ReportProblem as ErrorIcon,
    PlayCircleFilled as PlayIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useGetPickerStatsQuery } from '../../truck-cycle/services/truckCycleApi';
import { useGetMetricsLiveQuery, type MetricValueWithBand } from '../../personnel/services/personnelApi';
import { useAppSelector } from '../../../store/store';
import { NavStat, navStatsGridSx, statSx } from './NavStatShared';
import { bandColor, formatMetricValue } from '../utils/bands';

function formatHms(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function fmt(n: number | null | undefined, digits = 1): string {
    if (n === null || n === undefined) return '—';
    return n.toLocaleString('es-HN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function val(m: MetricValueWithBand | undefined, suffix = '', digits = 1): string {
    if (!m || m.value === null || m.value === undefined) return '—';
    return `${formatMetricValue(m, digits)}${suffix}`;
}

function InProgressTimer({ pautaId, startedAt, transportNumber }: { pautaId: number; startedAt: string; transportNumber: string }) {
    const theme = useTheme();
    const navigate = useNavigate();
    const [elapsed, setElapsed] = useState('00:00:00');
    useEffect(() => {
        const update = () => setElapsed(formatHms(Math.max(0, (Date.now() - new Date(startedAt).getTime()) / 1000)));
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [startedAt]);

    return (
        <Tooltip title={`Abrir pauta en progreso · T-${transportNumber}`} arrow>
            <ButtonBase
                onClick={() => navigate(`/work/picker/${pautaId}`)}
                sx={{
                    display: 'flex', alignItems: 'center', gap: 0.75, px: 1, borderRadius: 1.5, height: '100%',
                    background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                    color: '#fff', boxShadow: `0 2px 6px ${alpha(theme.palette.warning.main, 0.35)}`,
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 4px 10px ${alpha(theme.palette.warning.main, 0.55)}` },
                }}
            >
                <PlayIcon sx={{ fontSize: '1.1rem' }} />
                <Box sx={{ lineHeight: 1, textAlign: 'left' }}>
                    <Typography component="div" sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '0.95rem', lineHeight: 1 }}>
                        {elapsed}
                    </Typography>
                    <Typography component="div" sx={{ fontSize: '0.55rem', opacity: 0.9, letterSpacing: 0.5, textTransform: 'uppercase', lineHeight: 1, mt: 0.25 }}>
                        T-{transportNumber}
                    </Typography>
                </Box>
            </ButtonBase>
        </Tooltip>
    );
}

/**
 * Stats agregadas del picker del CD en vivo. Las 4 celdas consumen
 * /metric-samples/live/ (nueva arquitectura de métricas). El timer "en
 * progreso" sigue usando picker_stats para no duplicar lógica.
 */
export default function PickerNavStats() {
    const theme = useTheme();
    const today = format(new Date(), 'yyyy-MM-dd');
    const dcId = useAppSelector((s) => s.auth.user?.centro_distribucion);

    const { data: live } = useGetMetricsLiveQuery(
        { operational_date: today, ...(dcId ? { distributor_center: dcId } : {}) },
        { pollingInterval: 30_000 },
    );
    const { data: stats } = useGetPickerStatsQuery({ operational_date: today }, { pollingInterval: 15_000 });

    const iconSize = { xs: '0.95rem', md: '1.15rem' };
    const hasTrailing = Boolean(stats?.in_progress?.started_at);

    const p = live?.picker;

    return (
        <Box sx={navStatsGridSx(hasTrailing)}>
            <Box sx={statSx.cell1}>
                <NavStat
                    icon={<SpeedIcon sx={{ fontSize: iconSize }} />}
                    label="Pallets por hora"
                    shortLabel="Pallets/h"
                    value={val(p?.pallets_per_hour)}
                    accent={p ? bandColor(theme, p.pallets_per_hour.band) : theme.palette.primary.main}
                />
            </Box>
            <Box sx={statSx.cell2}>
                <NavStat
                    icon={<DoneIcon sx={{ fontSize: iconSize }} />}
                    label="Cargas armadas"
                    shortLabel="Cargas"
                    value={val(p?.loads_assembled, '', 0)}
                    accent={p ? bandColor(theme, p.loads_assembled.band) : theme.palette.primary.main}
                />
            </Box>
            <Box sx={statSx.cell3}>
                <NavStat
                    icon={<TimerIcon sx={{ fontSize: iconSize }} />}
                    label="Tiempo por pauta"
                    shortLabel="T/Pauta"
                    value={val(p?.avg_time_per_pauta_min, `'`, 0)}
                    accent={p ? bandColor(theme, p.avg_time_per_pauta_min.band) : theme.palette.primary.main}
                />
            </Box>
            <Box sx={statSx.cell4}>
                <NavStat
                    icon={<ErrorIcon sx={{ fontSize: iconSize }} />}
                    label="% Errores de carga"
                    shortLabel="% Err"
                    value={val(p?.load_error_rate_pct, '%')}
                    accent={p ? bandColor(theme, p.load_error_rate_pct.band) : theme.palette.primary.main}
                />
            </Box>
            {hasTrailing && stats?.in_progress?.started_at && (
                <Box sx={statSx.trailing}>
                    <InProgressTimer
                        pautaId={stats.in_progress.id}
                        startedAt={stats.in_progress.started_at}
                        transportNumber={stats.in_progress.transport_number}
                    />
                </Box>
            )}
        </Box>
    );
}
