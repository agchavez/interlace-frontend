import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Chip,
} from '@mui/material';
import {
    LocalShipping as TruckIcon,
    CheckCircle as CheckIcon,
    Login as ArrivalIcon,
} from '@mui/icons-material';

const API_URL = import.meta.env.VITE_JS_APP_API_URL || '';

export default function PublicArrivalPage() {
    const { truckCode } = useParams<{ truckCode: string }>();

    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [registering, setRegistering] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!truckCode) return;
        setLoading(true);
        fetch(`${API_URL}/api/truck-cycle-public/truck-status/${truckCode}/`)
            .then((r) => r.json())
            .then((data) => {
                if (data.error) setError(data.error);
                else setStatus(data);
            })
            .catch(() => setError('Error de conexión'))
            .finally(() => setLoading(false));
    }, [truckCode]);

    const handleArrival = async () => {
        if (!truckCode) return;
        setRegistering(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/api/truck-cycle-public/arrival/${truckCode}/`, { method: 'POST' });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Error al registrar llegada');
            } else {
                setSuccess(data.message);
                setStatus((prev: any) => prev ? { ...prev, can_register_arrival: false, status: 'IN_RELOAD_QUEUE', status_display: 'En Cola de Recarga' } : prev);
            }
        } catch {
            setError('Error de conexión');
        } finally {
            setRegistering(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
            <Container maxWidth="sm">
                <Card elevation={8} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    {/* Header */}
                    <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 3, textAlign: 'center' }}>
                        <TruckIcon sx={{ fontSize: 48, mb: 1 }} />
                        <Typography variant="h5" fontWeight={700}>
                            Registro de Llegada
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            CD La Granja — Cola de Recargas
                        </Typography>
                    </Box>

                    <CardContent sx={{ p: 4 }}>
                        {loading && (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <CircularProgress />
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                    Buscando camión...
                                </Typography>
                            </Box>
                        )}

                        {error && !loading && (
                            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                        )}

                        {success && (
                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                                <Typography variant="h6" fontWeight={600} color="success.main">
                                    {success}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Su camión ha sido registrado en la cola de recargas.
                                </Typography>
                            </Box>
                        )}

                        {status && !loading && !success && (
                            <Box>
                                {/* Truck info */}
                                <Box sx={{ textAlign: 'center', mb: 3 }}>
                                    <Typography variant="h4" fontWeight={700} color="primary.main">
                                        {status.truck_code}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Placa: {status.truck_plate}
                                    </Typography>
                                </Box>

                                {status.has_active_pauta && (
                                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                                        <Chip
                                            label={status.status_display}
                                            color={status.can_register_arrival ? 'success' : 'default'}
                                            sx={{ mb: 1 }}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            Transporte: {status.transport_number}
                                        </Typography>
                                    </Box>
                                )}

                                {status.can_register_arrival ? (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        size="large"
                                        fullWidth
                                        startIcon={registering ? <CircularProgress size={20} color="inherit" /> : <ArrivalIcon />}
                                        onClick={handleArrival}
                                        disabled={registering}
                                        sx={{ py: 2, fontSize: '1.1rem', fontWeight: 700, borderRadius: 2 }}
                                    >
                                        {registering ? 'Registrando...' : 'Registrar Llegada'}
                                    </Button>
                                ) : (
                                    <Alert severity="info">
                                        {status.has_active_pauta
                                            ? `Este camión está en estado "${status.status_display}". No se puede registrar llegada en este momento.`
                                            : 'No hay pautas activas para este camión.'}
                                    </Alert>
                                )}
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}
