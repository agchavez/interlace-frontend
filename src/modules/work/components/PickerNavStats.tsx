import { useEffect, useState } from 'react';
import { Box, Typography, useTheme, alpha, Tooltip, ButtonBase } from '@mui/material';
import {
    CheckCircle as DoneIcon,
    Inventory as BoxIcon,
    Timer as TimerIcon,
    Speed as SpeedIcon,
    PlayCircleFilled as PlayIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useGetPickerStatsQuery } from '../../truck-cycle/services/truckCycleApi';
import { NavStat, navStatsGridSx, statSx } from './NavStatShared';

function formatHms(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function InProgressTimer({ pautaId, startedAt, transportNumber }: { pautaId: number; startedAt: string; transportNumber: string }) {
    const theme = useTheme();
    const navigate = useNavigate();
    const [elapsed, setElapsed] = useState('00:00:00');
    useEffect(() => {
        const update = () => {
            const diff = Math.max(0, (Date.now() - new Date(startedAt).getTime()) / 1000);
            setElapsed(formatHms(diff));
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [startedAt]);

    return (
        <Tooltip title={`Abrir pauta en progreso · T-${transportNumber}`} arrow>
            <ButtonBase
                onClick={() => navigate(`/work/picker/${pautaId}`)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1,
                    borderRadius: 1.5,
                    height: '100%',
                    background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                    color: '#fff',
                    boxShadow: `0 2px 6px ${alpha(theme.palette.warning.main, 0.35)}`,
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 10px ${alpha(theme.palette.warning.main, 0.55)}`,
                    },
                }}
            >
                <PlayIcon sx={{ fontSize: '1.1rem' }} />
                <Box sx={{ lineHeight: 1, textAlign: 'left' }}>
                    <Typography
                        component="div"
                        sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '0.95rem', lineHeight: 1 }}
                    >
                        {elapsed}
                    </Typography>
                    <Typography
                        component="div"
                        sx={{ fontSize: '0.55rem', opacity: 0.9, letterSpacing: 0.5, textTransform: 'uppercase', lineHeight: 1, mt: 0.25 }}
                    >
                        T-{transportNumber}
                    </Typography>
                </Box>
            </ButtonBase>
        </Tooltip>
    );
}

/**
 * Stats del picker compactas para mostrar en el Navbar global.
 * Se usa solo cuando la ruta actual es del módulo /work/picker.
 */
export default function PickerNavStats() {
    const theme = useTheme();
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: stats } = useGetPickerStatsQuery(
        { operational_date: today },
        { pollingInterval: 15_000 },
    );

    if (!stats) return null;

    const primary = theme.palette.primary.main;

    const iconSizeResp = { xs: '0.95rem', md: '1.15rem' };
    const hasTrailing = Boolean(stats.in_progress?.started_at);

    return (
        <Box sx={navStatsGridSx(hasTrailing)}>
            <Box sx={statSx.cell1}>
                <NavStat
                    icon={<DoneIcon sx={{ fontSize: iconSizeResp }} />}
                    label="Pautas completadas"
                    shortLabel="Pautas"
                    value={stats.completed_count}
                    accent={primary}
                />
            </Box>
            <Box sx={statSx.cell2}>
                <NavStat
                    icon={<TimerIcon sx={{ fontSize: iconSizeResp }} />}
                    label="Promedio por pauta"
                    shortLabel="Prom"
                    value={stats.avg_picking_minutes != null ? `${stats.avg_picking_minutes}'` : '—'}
                    accent={primary}
                />
            </Box>
            <Box sx={statSx.cell3}>
                <NavStat
                    icon={<BoxIcon sx={{ fontSize: iconSizeResp }} />}
                    label="Cajas totales"
                    shortLabel="Cajas"
                    value={stats.total_boxes}
                    accent={primary}
                />
            </Box>
            <Box sx={statSx.cell4}>
                <NavStat
                    icon={<SpeedIcon sx={{ fontSize: iconSizeResp }} />}
                    label="Cajas por hora"
                    shortLabel="Cajas/h"
                    value={stats.boxes_per_hour != null ? stats.boxes_per_hour : '—'}
                    accent={primary}
                />
            </Box>
            {hasTrailing && stats.in_progress?.started_at && (
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
