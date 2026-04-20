import { useEffect, useState } from 'react';
import { Box, Card, CardActionArea, Typography, Chip, useTheme, alpha } from '@mui/material';
import {
    LocalShipping as TruckIcon,
    Inventory as BoxIcon,
    Timer as TimerIcon,
    CheckCircle as DoneIcon,
} from '@mui/icons-material';
import type { PautaListItem } from '../../truck-cycle/interfaces/truckCycle';

interface Props {
    pauta: PautaListItem;
    onClick: (pauta: PautaListItem) => void;
}

function useElapsed(since?: string | null): string | null {
    const [value, setValue] = useState<string | null>(null);
    useEffect(() => {
        if (!since) { setValue(null); return; }
        const update = () => {
            const diff = Math.max(0, Date.now() - new Date(since).getTime());
            const m = Math.floor(diff / 60_000);
            const s = Math.floor((diff % 60_000) / 1_000);
            setValue(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [since]);
    return value;
}

const STATUS_LABEL: Record<string, string> = {
    PENDING_PICKING: 'Pendiente',
    PICKING_ASSIGNED: 'Asignada',
    PICKING_IN_PROGRESS: 'En picking',
    PICKING_DONE: 'Completada',
};

const STATUS_COLOR: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'info'> = {
    PENDING_PICKING: 'default',
    PICKING_ASSIGNED: 'info',
    PICKING_IN_PROGRESS: 'warning',
    PICKING_DONE: 'success',
};

export default function PickerPautaCard({ pauta, onClick }: Props) {
    const theme = useTheme();
    const elapsed = useElapsed(pauta.status === 'PICKING_IN_PROGRESS' ? pauta.last_status_change : null);
    const isDone = pauta.status === 'PICKING_DONE';

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 2,
                borderLeft: `6px solid ${isDone ? theme.palette.success.main : theme.palette.primary.main}`,
                bgcolor: isDone ? alpha(theme.palette.success.main, 0.06) : 'background.paper',
                '&:hover': { boxShadow: 3 },
            }}
        >
            <CardActionArea onClick={() => onClick(pauta)} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                            T-{pauta.transport_number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                            Viaje {pauta.trip_number} {pauta.is_reload ? '· Recarga' : '· Carga'}
                        </Typography>
                    </Box>
                    <Chip
                        size="small"
                        label={STATUS_LABEL[pauta.status] || pauta.status}
                        color={STATUS_COLOR[pauta.status] || 'default'}
                        icon={isDone ? <DoneIcon /> : undefined}
                    />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <TruckIcon fontSize="small" color="secondary" />
                    <Typography variant="body2" fontWeight={600} noWrap>
                        {pauta.truck_code || '?'} · {pauta.truck_plate}
                    </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Ruta: {pauta.route_code || '—'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mt: 1.25, flexWrap: 'wrap' }}>
                    <Chip size="small" icon={<BoxIcon />} label={`${pauta.total_boxes} cajas`} />
                    <Chip size="small" label={`${pauta.total_skus} SKUs`} variant="outlined" />
                    {elapsed && (
                        <Chip size="small" icon={<TimerIcon />} label={elapsed} color="warning" variant="outlined" sx={{ fontFamily: 'monospace' }} />
                    )}
                </Box>
            </CardActionArea>
        </Card>
    );
}
