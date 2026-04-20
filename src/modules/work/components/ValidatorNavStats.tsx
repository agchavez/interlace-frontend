import { Box, useTheme } from '@mui/material';
import {
    CheckCircle as DoneIcon,
    Inventory as BoxIcon,
    Timer as TimerIcon,
    Speed as SpeedIcon,
} from '@mui/icons-material';
import type { ValidatorStats } from '../../truck-cycle/interfaces/truckCycle';
import { NavStat, navStatsGridSx, statSx } from './NavStatShared';

export default function ValidatorNavStats({ stats }: { stats: ValidatorStats | undefined }) {
    const theme = useTheme();
    if (!stats) return null;
    const primary = theme.palette.primary.main;
    const iconSize = { xs: '0.95rem', md: '1.15rem' };

    return (
        <Box sx={navStatsGridSx(false)}>
            <Box sx={statSx.cell1}>
                <NavStat
                    icon={<DoneIcon sx={{ fontSize: iconSize }} />}
                    label="Pautas validadas"
                    shortLabel="Pautas"
                    value={stats.completed_count}
                    accent={primary}
                />
            </Box>
            <Box sx={statSx.cell2}>
                <NavStat
                    icon={<TimerIcon sx={{ fontSize: iconSize }} />}
                    label="Promedio por validación"
                    shortLabel="Prom"
                    value={stats.avg_validation_minutes != null ? `${stats.avg_validation_minutes}'` : '—'}
                    accent={primary}
                />
            </Box>
            <Box sx={statSx.cell3}>
                <NavStat
                    icon={<BoxIcon sx={{ fontSize: iconSize }} />}
                    label="Cajas validadas"
                    shortLabel="Cajas"
                    value={stats.total_boxes}
                    accent={primary}
                />
            </Box>
            <Box sx={statSx.cell4}>
                <NavStat
                    icon={<SpeedIcon sx={{ fontSize: iconSize }} />}
                    label="Pautas por hora"
                    shortLabel="Pautas/h"
                    value={stats.pautas_per_hour != null ? stats.pautas_per_hour : '—'}
                    accent={primary}
                />
            </Box>
        </Box>
    );
}
