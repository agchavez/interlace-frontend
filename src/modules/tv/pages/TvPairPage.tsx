import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box, Container, Typography, TextField, Button, MenuItem, Alert,
    CircularProgress, Paper, Snackbar,
} from '@mui/material';
import { Tv as TvIcon, CheckCircle as DoneIcon } from '@mui/icons-material';
import {
    useGetTvSessionQuery,
    usePairTvSessionMutation,
    TV_DASHBOARDS,
} from '../services/tvApi';
import { useAppSelector } from '../../../store/store';

/**
 * Pantalla a la que llega el teléfono tras escanear el QR. Requiere auth del
 * usuario. Muestra el code, pide CD + dashboard + etiqueta y confirma. La TV
 * recibe el evento PAIRED por WS y se redirige sola.
 */
export default function TvPairPage() {
    const { code = '' } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const user = useAppSelector((s) => s.auth.user);
    const status = useAppSelector((s) => s.auth.status);
    const distributorCenters = useAppSelector((s) => s.user.distributionCenters);

    const { data: session, isLoading: loadingSession, error: sessionErr } = useGetTvSessionQuery(code, { skip: !code });
    const [pair, { isLoading: pairing }] = usePairTvSessionMutation();

    const [dc, setDc] = useState<number | ''>('');
    const [label, setLabel] = useState('');
    const [ttl, setTtl] = useState(7);
    const [dashboard, setDashboard] = useState<string>(TV_DASHBOARDS[0]?.value || 'WORKSTATION');
    const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });
    const [paired, setPaired] = useState(false);

    // Si no está autenticado, mandarlo al login preservando el next.
    useEffect(() => {
        if (status === 'unauthenticated') {
            navigate(`/auth/login?next=/tv/pair/${code}`, { replace: true });
        }
    }, [status, code, navigate]);

    // Pre-llenar CD del usuario.
    useEffect(() => {
        if (user?.centro_distribucion && dc === '') {
            setDc(user.centro_distribucion);
        }
    }, [user?.centro_distribucion, dc]);

    const availableDCs = useMemo(() => {
        const ids = new Set(user?.distributions_centers || []);
        return (distributorCenters || []).filter((d) => ids.has(d.id));
    }, [distributorCenters, user?.distributions_centers]);

    const isExpired = session?.status === 'EXPIRED';
    const isAlreadyPaired = session?.status === 'PAIRED';

    const handleSubmit = async () => {
        if (!dc) {
            setSnack({ open: true, msg: 'Selecciona un CD.', severity: 'error' });
            return;
        }
        try {
            await pair({
                code, distributor_center: Number(dc),
                dashboard, label, ttl_days: ttl,
            }).unwrap();
            setPaired(true);
            setSnack({ open: true, msg: '¡Vinculada! La TV ya debe cargar el dashboard.', severity: 'success' });
        } catch (err: any) {
            setSnack({ open: true, msg: err?.data?.error || 'Error al vincular.', severity: 'error' });
        }
    };

    if (status === 'checking' || loadingSession) {
        return (
            <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (sessionErr) {
        return (
            <Container maxWidth="sm" sx={{ py: 6 }}>
                <Alert severity="error">No se encontró la sesión de TV. Revisa el código.</Alert>
            </Container>
        );
    }

    if (paired) {
        return (
            <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
                <DoneIcon sx={{ fontSize: 72, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" fontWeight={800} gutterBottom>
                    TV vinculada correctamente
                </Typography>
                <Typography color="text.secondary">
                    La pantalla ya está mostrando el dashboard. Puedes cerrar esta ventana.
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <TvIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
                <Typography variant="h5" fontWeight={800}>
                    Vincular TV
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Código <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 2 }}>{code}</Box>
                </Typography>
            </Box>

            {isExpired && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    El código expiró. Recarga la pantalla de la TV para generar uno nuevo.
                </Alert>
            )}
            {isAlreadyPaired && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Esta TV ya fue vinculada por alguien más.
                </Alert>
            )}

            {!isExpired && !isAlreadyPaired && (
                <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                    <TextField
                        select fullWidth label="Dashboard que mostrará"
                        value={dashboard} onChange={(e) => setDashboard(e.target.value)}
                        sx={{ mb: 2 }}
                        helperText={TV_DASHBOARDS.length === 1 ? 'Por ahora solo hay uno disponible — podrás cambiarlo luego.' : undefined}
                    >
                        {TV_DASHBOARDS.map((d) => (
                            <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select fullWidth label="Centro de distribución"
                        value={dc} onChange={(e) => setDc(Number(e.target.value))}
                        sx={{ mb: 2 }}
                    >
                        {availableDCs.length === 0 && (
                            <MenuItem value="" disabled>No tienes CDs disponibles</MenuItem>
                        )}
                        {availableDCs.map((d) => (
                            <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth label="Etiqueta (opcional)"
                        placeholder="Ej. TV Muelle 3, Pantalla Operaciones"
                        value={label} onChange={(e) => setLabel(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        select fullWidth label="Duración del token" value={ttl}
                        onChange={(e) => setTtl(Number(e.target.value))}
                        sx={{ mb: 3 }}
                    >
                        <MenuItem value={1}>1 día</MenuItem>
                        <MenuItem value={7}>7 días</MenuItem>
                        <MenuItem value={14}>14 días</MenuItem>
                        <MenuItem value={30}>30 días</MenuItem>
                    </TextField>

                    <Button
                        fullWidth variant="contained" size="large"
                        onClick={handleSubmit} disabled={pairing || !dc}
                    >
                        {pairing ? <CircularProgress size={22} color="inherit" /> : 'Vincular esta TV'}
                    </Button>
                </Paper>
            )}

            <Snackbar
                open={snack.open}
                autoHideDuration={3500}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} variant="filled">
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Container>
    );
}
