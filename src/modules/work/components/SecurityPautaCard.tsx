import { Box, Card, CardActionArea, Typography, Chip, useTheme, alpha } from '@mui/material';
import {
    LocalShipping as TruckIcon,
    Inventory as BoxIcon,
    CheckCircle as DoneIcon,
} from '@mui/icons-material';
import type { PautaListItem } from '../../truck-cycle/interfaces/truckCycle';

interface Props {
    pauta: PautaListItem;
    onClick: (pauta: PautaListItem) => void;
}

const STATUS_LABEL: Record<string, string> = {
    COUNTED: 'Listo para validar',
    PENDING_CHECKOUT: 'Pendiente',
    CHECKOUT_SECURITY: 'Validado',
    CHECKOUT_OPS: 'Validado',
    DISPATCHED: 'Despachado',
};

const STATUS_COLOR: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'info'> = {
    COUNTED: 'warning',
    PENDING_CHECKOUT: 'warning',
    CHECKOUT_SECURITY: 'success',
    CHECKOUT_OPS: 'success',
    DISPATCHED: 'success',
};

export default function SecurityPautaCard({ pauta, onClick }: Props) {
    const theme = useTheme();
    const isDone = ['CHECKOUT_SECURITY', 'CHECKOUT_OPS', 'DISPATCHED'].includes(pauta.status);

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
                    {pauta.bay_code ? ` · Bahía ${pauta.bay_code}` : ''}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mt: 1.25, flexWrap: 'wrap' }}>
                    <Chip size="small" icon={<BoxIcon />} label={`${pauta.total_boxes} cajas`} />
                    <Chip size="small" label={`${pauta.total_skus} SKUs`} variant="outlined" />
                </Box>
            </CardActionArea>
        </Card>
    );
}
