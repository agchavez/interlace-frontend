import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useGetPautaQuery } from '../services/truckCycleApi';
import PalletPrintContent from '../components/PalletPrintContent';

export default function PalletPrintPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: pauta, isLoading, error } = useGetPautaQuery(Number(id));

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !pauta) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">Error al cargar la pauta.</Alert>
                <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    Volver
                </Button>
            </Box>
        );
    }

    if (pauta.pallet_tickets.length === 0) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="warning">No hay tickets generados para esta pauta.</Alert>
                <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    Volver
                </Button>
            </Box>
        );
    }

    return (
        <PalletPrintContent
            pauta={{
                transport_number: pauta.transport_number,
                trip_number: pauta.trip_number,
                truck_code: pauta.truck_code,
                truck_plate: pauta.truck_plate,
                route_code: pauta.route_code,
                total_boxes: pauta.total_boxes,
                total_pallets: pauta.total_pallets,
            }}
            tickets={pauta.pallet_tickets}
        />
    );
}
