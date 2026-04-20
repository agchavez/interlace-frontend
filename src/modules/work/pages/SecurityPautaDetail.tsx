import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box, Container, Typography, Button, IconButton, CircularProgress,
    Alert, Snackbar, Paper, FormControlLabel, Checkbox,
    useTheme, useMediaQuery,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Inventory as BoxIcon,
    LocalShipping as TruckIcon,
    CheckCircle as DoneIcon,
    Security as SecurityIcon,
    Send as DispatchIcon,
    Route as RouteIcon,
    Category as CategoryIcon,
    ViewModule as PalletIcon,
    PieChartOutline as FractionIcon,
    MeetingRoom as BayIcon,
    ReportProblem as WarningIcon,
    OpenInNew as OpenIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import {
    useGetPautaQuery,
    useTakeAsSecurityMutation,
    useDispatchPautaMutation,
} from '../../truck-cycle/services/truckCycleApi';
import PautaStatusBadge from '../../truck-cycle/components/PautaStatusBadge';
import SwipeToConfirm from '../../ui/components/SwipeToConfirm';
import DriverSelectDialog from '../components/DriverSelectDialog';
import type { PautaStatus } from '../../truck-cycle/interfaces/truckCycle';

function StatTile({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: React.ReactNode }) {
    return (
        <Box sx={{ p: 2, textAlign: 'center', position: 'relative' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', bgcolor: alpha(color, 0.12), color, mb: 1 }}>
                {icon}
            </Box>
            <Typography variant="h4" fontWeight={900} sx={{ lineHeight: 1, fontFeatureSettings: '"tnum"' }}>
                {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.65rem', mt: 0.5, display: 'block' }}>
                {label}
            </Typography>
        </Box>
    );
}

export default function SecurityPautaDetail() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: pauta, isLoading, error } = useGetPautaQuery(Number(id));
    const [takeAsSecurity, { isLoading: validating }] = useTakeAsSecurityMutation();
    const [dispatchPauta, { isLoading: dispatching }] = useDispatchPautaMutation();
    const [exitPass, setExitPass] = useState(false);
    const [driverDialogOpen, setDriverDialogOpen] = useState(false);

    const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success',
    });
    const showSnack = (message: string, severity: 'success' | 'error' = 'success') =>
        setSnack({ open: true, message, severity });

    const inconsistencies = ((pauta as any)?.inconsistencies || []).filter(
        (inc: any) => inc.phase === 'CHECKOUT',
    );

    const handleValidate = async () => {
        if (!pauta) return;
        try {
            await takeAsSecurity({ id: pauta.id, exit_pass_consumables: exitPass }).unwrap();
            showSnack('Validación de seguridad registrada');
            setTimeout(() => navigate(-1), 500);
        } catch (err: any) {
            showSnack(err?.data?.error || err?.data?.detail || 'Error al validar', 'error');
        }
    };

    const existingDriverAssignment = ((pauta as any)?.assignments || []).find(
        (a: any) => a.role === 'DELIVERY_DRIVER' && a.is_active,
    );

    const runDispatch = async (driverId?: number) => {
        if (!pauta) return;
        try {
            await dispatchPauta({ id: pauta.id, driver_id: driverId }).unwrap();
            showSnack('Transporte despachado');
            setDriverDialogOpen(false);
            setTimeout(() => navigate(-1), 500);
        } catch (err: any) {
            showSnack(err?.data?.error || err?.data?.detail || 'Error al despachar', 'error');
        }
    };

    const handleDispatch = async () => {
        if (!pauta) return;
        if (existingDriverAssignment) {
            await runDispatch();
        } else {
            setDriverDialogOpen(true);
        }
    };

    if (isLoading) {
        return (
            <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error || !pauta) {
        return (
            <Container maxWidth="sm" sx={{ py: 4 }}>
                <Alert severity="error">No se pudo cargar la pauta.</Alert>
                <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    Volver
                </Button>
            </Container>
        );
    }

    const canValidate = pauta.status === 'COUNTED' || pauta.status === 'PENDING_CHECKOUT';
    const canDispatch = pauta.status === 'CHECKOUT_SECURITY' || pauta.status === 'CHECKOUT_OPS';
    const isDispatched = ['DISPATCHED', 'IN_RELOAD_QUEUE', 'CLOSED'].includes(pauta.status);

    return (
        <Box sx={{ height: 'calc(100dvh - 60px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ flexShrink: 0, bgcolor: 'primary.main', color: '#fff' }}>
                <Container maxWidth="md" sx={{ display: 'flex', alignItems: 'center', gap: 1, py: { xs: 1.5, sm: 2 } }}>
                    <IconButton size="small" onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
                        <BackIcon />
                    </IconButton>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant={isMobile ? 'subtitle1' : 'h5'} fontWeight={800} sx={{ lineHeight: 1.1 }}>
                            T-{pauta.transport_number}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.85 }}>
                            Viaje {pauta.trip_number} {pauta.is_reload ? '· Recarga' : '· Carga'}
                        </Typography>
                    </Box>
                    <PautaStatusBadge status={pauta.status as PautaStatus} />
                </Container>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f5f5f5' }}>
                <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3 } }}>
                    {/* Hero card */}
                    <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 2 }}>
                        <Box sx={{ position: 'relative', background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`, color: '#fff', p: { xs: 2.5, sm: 3 }, overflow: 'hidden' }}>
                            <TruckIcon sx={{ position: 'absolute', right: -10, bottom: -10, fontSize: 140, opacity: 0.12, transform: 'rotate(-12deg)', pointerEvents: 'none' }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: { xs: 56, sm: 64 }, height: { xs: 56, sm: 64 }, borderRadius: 2, bgcolor: alpha('#fff', 0.18), display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${alpha('#fff', 0.25)}` }}>
                                    <TruckIcon sx={{ fontSize: { xs: '1.8rem', sm: '2.2rem' } }} />
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 2, fontSize: '0.65rem' }}>
                                        Camión asignado
                                    </Typography>
                                    <Typography variant="h4" fontWeight={900} sx={{ lineHeight: 1, mt: 0.25 }}>
                                        {pauta.truck_code || '—'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5, letterSpacing: 1 }}>
                                        {pauta.truck_plate}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1.5, px: 2.5, py: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.06), borderBottom: 1, borderColor: 'divider', flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <RouteIcon sx={{ color: theme.palette.primary.main }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, fontSize: '0.65rem' }}>RUTA</Typography>
                                    <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1, fontFamily: 'monospace' }}>
                                        {pauta.route_code || '—'}
                                    </Typography>
                                </Box>
                            </Box>
                            {pauta.bay_code && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                                    <BayIcon sx={{ color: theme.palette.primary.main }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, fontSize: '0.65rem' }}>BAHÍA</Typography>
                                        <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1 }}>
                                            {pauta.bay_code}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                '& > *': { borderRight: 1, borderBottom: 1, borderColor: 'divider' },
                                '& > *:nth-of-type(2n)': { borderRight: 0 },
                                '& > *:nth-last-of-type(-n+2)': { borderBottom: 0 },
                            }}
                        >
                            <StatTile label="Cajas" value={pauta.total_boxes} color={theme.palette.primary.main} icon={<BoxIcon />} />
                            <StatTile label="SKUs" value={pauta.total_skus} color={theme.palette.primary.main} icon={<CategoryIcon />} />
                            <StatTile label="Tarimas" value={pauta.total_pallets} color={theme.palette.primary.main} icon={<PalletIcon />} />
                            <StatTile label="Fracciones" value={(pauta as any).assembled_fractions ?? 0} color={theme.palette.primary.main} icon={<FractionIcon />} />
                        </Box>
                    </Paper>

                    {/* Revisión solo durante la validación — una vez validado, seguridad ya no edita */}
                    {canValidate && (
                        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <WarningIcon sx={{ color: theme.palette.warning.main }} />
                                <Typography variant="subtitle1" fontWeight={800} sx={{ flex: 1 }}>
                                    Revisión de seguridad
                                </Typography>
                                {inconsistencies.length > 0 && (
                                    <Box sx={{ bgcolor: alpha(theme.palette.warning.main, 0.15), color: theme.palette.warning.dark, px: 1, py: 0.25, borderRadius: 1, fontWeight: 700, fontSize: '0.75rem' }}>
                                        {inconsistencies.length} {inconsistencies.length === 1 ? 'observación' : 'observaciones'}
                                    </Box>
                                )}
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                Revisa el camión, toma fotos y registra observaciones de seguridad si es necesario.
                            </Typography>
                            <Button
                                fullWidth
                                variant="contained"
                                color="warning"
                                endIcon={<OpenIcon />}
                                onClick={() => navigate(`/truck-cycle/verify/${pauta.id}?phase=CHECKOUT`)}
                                sx={{ py: 1.5, fontWeight: 800 }}
                            >
                                Abrir pantalla de revisión
                            </Button>
                        </Paper>
                    )}

                    {/* Cuando está por despachar — solo muestra resumen de observaciones (no link a edición) */}
                    {canDispatch && inconsistencies.length > 0 && (
                        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.04) }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <WarningIcon sx={{ color: theme.palette.warning.main }} />
                                <Typography variant="subtitle1" fontWeight={800} sx={{ flex: 1 }}>
                                    Observaciones registradas
                                </Typography>
                                <Box sx={{ bgcolor: alpha(theme.palette.warning.main, 0.2), color: theme.palette.warning.dark, px: 1, py: 0.25, borderRadius: 1, fontWeight: 700, fontSize: '0.75rem' }}>
                                    {inconsistencies.length}
                                </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {inconsistencies.length === 1
                                    ? 'Se registró 1 observación durante la validación.'
                                    : `Se registraron ${inconsistencies.length} observaciones durante la validación.`}
                            </Typography>
                        </Paper>
                    )}

                    {/* Exit pass consumibles */}
                    {canValidate && (
                        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={exitPass}
                                        onChange={(e) => setExitPass(e.target.checked)}
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1" fontWeight={700}>
                                            Pase de salida con consumibles
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Marcar si el camión transporta artículos consumibles que requieren pase.
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Paper>
                    )}

                    {isDispatched && (
                        <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.1), border: `1px solid ${alpha(theme.palette.success.main, 0.35)}`, mb: 2 }}>
                            <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: theme.palette.success.main, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <DispatchIcon />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={800} color={theme.palette.success.dark}>
                                    Transporte despachado
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    El camión ya salió. No hay más acciones disponibles.
                                </Typography>
                            </Box>
                        </Paper>
                    )}
                </Container>
            </Box>

            {(canValidate || canDispatch) && (
                <Box sx={{ position: 'sticky', bottom: 0, zIndex: 5, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
                    <Container maxWidth="md" sx={{ py: 2 }}>
                        {canValidate && (
                            <SwipeToConfirm
                                label="Desliza para validar"
                                loadingLabel="Validando..."
                                onConfirm={handleValidate}
                                loading={validating}
                                color="primary"
                                icon={<SecurityIcon />}
                            />
                        )}
                        {canDispatch && (
                            <SwipeToConfirm
                                label="Desliza para despachar"
                                loadingLabel="Despachando..."
                                onConfirm={handleDispatch}
                                loading={dispatching}
                                color="success"
                                icon={<DispatchIcon />}
                            />
                        )}
                    </Container>
                </Box>
            )}

            <DriverSelectDialog
                open={driverDialogOpen}
                onClose={() => setDriverDialogOpen(false)}
                onConfirm={(driverId) => runDispatch(driverId)}
                loading={dispatching}
                suggestedDriverId={(pauta as any).truck_primary_driver_id ?? null}
                suggestedDriverName={(pauta as any).truck_primary_driver_name ?? null}
                truckCode={pauta.truck_code}
            />

            <Snackbar
                open={snack.open}
                autoHideDuration={2500}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} variant="filled">
                    {snack.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
