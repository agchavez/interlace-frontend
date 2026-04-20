import { Box, Card, CardActionArea, Typography, Chip, useTheme, alpha } from '@mui/material';
import {
    LocalShipping as TruckIcon,
    Inventory as BoxIcon,
    MeetingRoom as BayIcon,
} from '@mui/icons-material';
import type { PautaListItem, PautaStatus } from '../../truck-cycle/interfaces/truckCycle';
import PautaProgressStepper from './PautaProgressStepper';
import PautaStatusBadge from '../../truck-cycle/components/PautaStatusBadge';

const PREP_STATUSES: PautaStatus[] = [
    'PENDING_PICKING', 'PICKING_ASSIGNED', 'PICKING_IN_PROGRESS', 'PICKING_DONE',
    'MOVING_TO_BAY', 'IN_BAY', 'PENDING_COUNT', 'COUNTING', 'COUNTED',
    'PENDING_CHECKOUT', 'CHECKOUT_SECURITY', 'CHECKOUT_OPS',
];

interface Props {
    pauta: PautaListItem;
    onClick: (pauta: PautaListItem) => void;
}

export default function VendorPautaCard({ pauta, onClick }: Props) {
    const theme = useTheme();
    const isDone = ['RETURN_PROCESSED', 'CLOSED'].includes(pauta.status);
    const isActive = ['DISPATCHED', 'IN_RELOAD_QUEUE', 'PENDING_RETURN'].includes(pauta.status);
    const isInPrep = PREP_STATUSES.includes(pauta.status as PautaStatus);

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 2,
                borderLeft: `6px solid ${
                    isDone
                        ? theme.palette.success.main
                        : isActive
                        ? theme.palette.primary.main
                        : theme.palette.grey[400]
                }`,
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
                    <PautaStatusBadge status={pauta.status as PautaStatus} />
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

                {pauta.bay_code && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <BayIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
                        <Typography variant="body2" fontWeight={700}>
                            {pauta.bay_code}
                        </Typography>
                    </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, mt: 1.25, flexWrap: 'wrap' }}>
                    <Chip size="small" icon={<BoxIcon />} label={`${pauta.total_boxes} cajas`} />
                </Box>

                {/* Progress stepper — solo cuando está en preparación */}
                {isInPrep && (
                    <Box sx={{ mt: 2, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                        <PautaProgressStepper status={pauta.status as PautaStatus} />
                    </Box>
                )}
            </CardActionArea>
        </Card>
    );
}
