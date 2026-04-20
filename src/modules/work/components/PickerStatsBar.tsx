import { useEffect, useState } from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import {
    Inventory as BoxIcon,
    Speed as SpeedIcon,
    Timer as TimerIcon,
    CheckCircle as DoneIcon,
    PlayCircleFilled as PlayIcon,
} from '@mui/icons-material';
import type { PickerStats } from '../../truck-cycle/interfaces/truckCycle';

interface Props {
    stats?: PickerStats;
}

function formatHms(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function InProgressChip({ startedAt, transportNumber }: { startedAt: string; transportNumber: string }) {
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
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                py: 0.5,
                bgcolor: alpha('#ffeb3b', 0.25),
                border: `1px solid ${alpha('#ffeb3b', 0.6)}`,
                borderRadius: 1,
                color: '#fff',
                minWidth: 0,
            }}
        >
            <PlayIcon sx={{ fontSize: '1.1rem' }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.6rem', lineHeight: 1, letterSpacing: 0.5 }} noWrap>
                    En progreso · T-{transportNumber}
                </Typography>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.1 }}>
                    {elapsed}
                </Typography>
            </Box>
        </Box>
    );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <Box sx={{ color: '#fff', opacity: 0.85, display: 'flex' }}>{icon}</Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ opacity: 0.75, fontSize: '0.6rem', lineHeight: 1, letterSpacing: 0.5 }} noWrap>
                    {label}
                </Typography>
                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.1 }}>
                    {value}
                </Typography>
            </Box>
        </Box>
    );
}

export default function PickerStatsBar({ stats }: Props) {
    const theme = useTheme();
    if (!stats) return null;

    const { completed_count, total_boxes, avg_picking_minutes, boxes_per_hour, in_progress } = stats;

    return (
        <Box
            sx={{
                bgcolor: alpha(theme.palette.common.black, 0.25),
                borderTop: `1px solid ${alpha('#fff', 0.1)}`,
                color: '#fff',
                py: 1,
                px: { xs: 1.5, sm: 2 },
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1.25, sm: 2.5 },
                overflowX: 'auto',
                '&::-webkit-scrollbar': { display: 'none' },
            }}
        >
            <StatItem icon={<DoneIcon fontSize="small" />} label="Completadas" value={completed_count} />
            <StatItem icon={<BoxIcon fontSize="small" />} label="Cajas" value={total_boxes} />
            <StatItem
                icon={<TimerIcon fontSize="small" />}
                label="Prom/pauta"
                value={avg_picking_minutes != null ? `${avg_picking_minutes} min` : '—'}
            />
            <StatItem
                icon={<SpeedIcon fontSize="small" />}
                label="Cajas/hora"
                value={boxes_per_hour != null ? boxes_per_hour : '—'}
            />
            {in_progress?.started_at && (
                <Box sx={{ ml: 'auto' }}>
                    <InProgressChip startedAt={in_progress.started_at} transportNumber={in_progress.transport_number} />
                </Box>
            )}
        </Box>
    );
}
