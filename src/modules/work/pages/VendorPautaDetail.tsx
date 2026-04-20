import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box, Container, Typography, Button, IconButton, CircularProgress,
    Alert, Snackbar, Paper,
    useTheme, useMediaQuery,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Inventory as BoxIcon,
    LocalShipping as TruckIcon,
    CheckCircle as DoneIcon,
    Flag as ArrivalIcon,
    MeetingRoom as BayIcon,
    Route as RouteIcon,
    Category as CategoryIcon,
    ViewModule as PalletIcon,
    PieChartOutline as FractionIcon,
    Undo as ReturnIcon,
    Login as ReentryIcon,
    PlayArrow as StartTripIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import {
    useGetPautaQuery,
    useGetBaysQuery,
    useGetPautasQuery,
    useArrivalPautaMutation,
    useReloadReentryMutation,
    useProcessReturnMutation,
    useStartTripMutation,
} from '../../truck-cycle/services/truckCycleApi';
import PautaStatusBadge from '../../truck-cycle/components/PautaStatusBadge';
import BayGridPicker, { type BayOccupancy, type DockPosition } from '../../truck-cycle/components/BayGridPicker';
import SwipeToConfirm from '../../ui/components/SwipeToConfirm';
import PautaTimeline from '../components/PautaTimeline';
import { useAppSelector } from '../../../store/store';
import { format } from 'date-fns';
import type { PautaStatus, Bay } from '../../truck-cycle/interfaces/truckCycle';

function StatTile({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: React.ReactNode }) {
    return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
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

export default function VendorPautaDetail() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const currentDcId = useAppSelector((s) => s.auth.user?.centro_distribucion);

    const { data: pauta, isLoading, error } = useGetPautaQuery(Number(id));
    const [arrival, { isLoading: arriving }] = useArrivalPautaMutation();
    const [reloadReentry, { isLoading: reentering }] = useReloadReentryMutation();
    const [processReturn, { isLoading: processingReturn }] = useProcessReturnMutation();
    const [startTrip, { isLoading: startingTrip }] = useStartTripMutation();

    // Verificar si el viaje ya fue iniciado (T9B_TRIP_START existe).
    const tripStarted = useMemo(() => {
        const ts = (pauta as any)?.timestamps || [];
        return ts.some((t: any) => t.event_type === 'T9B_TRIP_START');
    }, [pauta]);

    const dockPosition = useMemo<DockPosition>(() => {
        const key = `bayDock_${currentDcId ?? 'default'}`;
        const stored = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
        return (stored === 'top' || stored === 'bottom' || stored === 'left' || stored === 'right') ? stored : 'top';
    }, [currentDcId]);

    const { data: baysData } = useGetBaysQuery();
    const bays = baysData?.results || [];

    const today = format(new Date(), 'yyyy-MM-dd');
    const OCCUPIED_STATUSES = 'IN_BAY,MOVING_TO_BAY,PENDING_COUNT,COUNTING,COUNTED,PENDING_CHECKOUT,CHECKOUT_SECURITY,CHECKOUT_OPS';
    const { data: occupiedData } = useGetPautasQuery(
        { operational_date_after: today, operational_date_before: today, status: OCCUPIED_STATUSES, limit: 200 } as any,
        { pollingInterval: 20_000 },
    );
    const occupiedPautas = occupiedData?.results || [];
    const occupied: Record<number, BayOccupancy> = useMemo(() => {
        const map: Record<number, BayOccupancy> = {};
        for (const p of occupiedPautas) {
            if (p.bay_id != null) {
                map[p.bay_id] = {
                    transportNumber: p.transport_number,
                    truckCode: p.truck_code,
                    truckPlate: p.truck_plate,
                    status: p.status,
                };
            }
        }
        return map;
    }, [occupiedPautas]);

    const [selectedBay, setSelectedBay] = useState<Bay | null>(null);

    const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success',
    });
    const showSnack = (message: string, severity: 'success' | 'error' = 'success') =>
        setSnack({ open: true, message, severity });

    const handleStartTrip = async () => {
        if (!pauta) return;
        try {
            await startTrip(pauta.id).unwrap();
            showSnack('Viaje iniciado — buen viaje');
        } catch (err: any) {
            showSnack(err?.data?.error || err?.data?.detail || 'Error', 'error');
        }
    };

    const handleArrival = async () => {
        if (!pauta) return;
        try {
            await arrival(pauta.id).unwrap();
            showSnack('Regreso registrado');
        } catch (err: any) {
            showSnack(err?.data?.error || err?.data?.detail || 'Error', 'error');
        }
    };

    const handleReentry = async () => {
        if (!pauta || !selectedBay) return;
        try {
            await reloadReentry({ id: pauta.id, truck_id: pauta.truck, bay_id: selectedBay.id }).unwrap();
            showSnack(`Re-ingreso registrado en ${selectedBay.code}`);
            setTimeout(() => navigate(-1), 500);
        } catch (err: any) {
            showSnack(err?.data?.error || err?.data?.detail || 'Error', 'error');
        }
    };

    const handleReturn = async () => {
        if (!pauta) return;
        try {
            await processReturn(pauta.id).unwrap();
            showSnack('Retorno procesado');
            setTimeout(() => navigate(-1), 500);
        } catch (err: any) {
            showSnack(err?.data?.error || err?.data?.detail || 'Error', 'error');
        }
    };

    const handleBayTap = (bay: Bay) => {
        const occByOther = occupied[bay.id] && occupied[bay.id].transportNumber !== pauta?.transport_number;
        if (occByOther) {
            showSnack(`Bahía ${bay.code} ocupada por T-${occupied[bay.id].transportNumber}`, 'error');
            return;
        }
        setSelectedBay(bay);
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

    const canStartTrip = pauta.status === 'DISPATCHED' && !tripStarted;
    const canArrival = pauta.status === 'DISPATCHED' && tripStarted;
    const canReentry = pauta.status === 'IN_RELOAD_QUEUE' && pauta.is_reload && !pauta.reentered_at;
    const canProcessReturn = pauta.status === 'PENDING_RETURN';
    const isClosed = ['RETURN_PROCESSED', 'CLOSED'].includes(pauta.status);

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
                    {/* Hero */}
                    <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 2 }}>
                        <Box sx={{ position: 'relative', background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`, color: '#fff', p: { xs: 2.5, sm: 3 }, overflow: 'hidden' }}>
                            <TruckIcon sx={{ position: 'absolute', right: -10, bottom: -10, fontSize: 140, opacity: 0.12, transform: 'rotate(-12deg)', pointerEvents: 'none' }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: { xs: 56, sm: 64 }, height: { xs: 56, sm: 64 }, borderRadius: 2, bgcolor: alpha('#fff', 0.18), display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${alpha('#fff', 0.25)}` }}>
                                    <TruckIcon sx={{ fontSize: { xs: '1.8rem', sm: '2.2rem' } }} />
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 2, fontSize: '0.65rem' }}>
                                        Mi camión
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

                    {/* Timeline — solo en preparación (antes del despacho) */}
                    {[
                        'PENDING_PICKING', 'PICKING_ASSIGNED', 'PICKING_IN_PROGRESS', 'PICKING_DONE',
                        'MOVING_TO_BAY', 'IN_BAY', 'PENDING_COUNT', 'COUNTING', 'COUNTED',
                        'PENDING_CHECKOUT', 'CHECKOUT_SECURITY', 'CHECKOUT_OPS',
                    ].includes(pauta.status) && (
                        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight={800} sx={{ flex: 1 }}>
                                    Progreso del transporte
                                </Typography>
                                <PautaStatusBadge status={pauta.status as PautaStatus} />
                            </Box>
                            <PautaTimeline
                                status={pauta.status as PautaStatus}
                                timestamps={(pauta as any).timestamps || []}
                            />
                        </Paper>
                    )}

                    {/* Instrucciones según estado */}
                    {canStartTrip && (
                        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.06), border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}` }}>
                            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5 }}>
                                🚛 Listo para salir
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tu viaje ya fue despachado. Cuando subas al camión y estés listo para salir, desliza "Iniciar viaje".
                            </Typography>
                        </Paper>
                    )}

                    {canArrival && (
                        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.06), border: `1px solid ${alpha(theme.palette.info.main, 0.35)}` }}>
                            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5 }}>
                                🚚 En ruta
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Estás en ruta con este transporte. Cuando regreses al CD, desliza "Marcar regreso".
                            </Typography>
                        </Paper>
                    )}

                    {/* Mapa para re-ingreso */}
                    {canReentry && (
                        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <BayIcon sx={{ color: theme.palette.primary.main }} />
                                <Typography variant="subtitle1" fontWeight={800} sx={{ flex: 1 }}>
                                    ¿En qué bahía estacionarás?
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                Toca la bahía donde dejaste el camión. Las ocupadas están bloqueadas.
                            </Typography>
                            <BayGridPicker
                                bays={bays}
                                value={selectedBay}
                                onChange={handleBayTap}
                                occupied={occupied}
                                dockPosition={dockPosition}
                                disabledBayIds={bays
                                    .filter((b) => occupied[b.id] && occupied[b.id].transportNumber !== pauta.transport_number)
                                    .map((b) => b.id)}
                            />
                        </Paper>
                    )}

                    {canProcessReturn && (
                        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.06) }}>
                            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5 }}>
                                📦 Con devolución
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Traes producto de retorno. Marca "Procesar retorno" cuando el producto haya sido descargado.
                            </Typography>
                        </Paper>
                    )}

                    {isClosed && (
                        <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.1), border: `1px solid ${alpha(theme.palette.success.main, 0.35)}`, mb: 2 }}>
                            <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: theme.palette.success.main, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <DoneIcon />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={800} color={theme.palette.success.dark}>
                                    Viaje cerrado
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    No hay más acciones disponibles.
                                </Typography>
                            </Box>
                        </Paper>
                    )}
                </Container>
            </Box>

            {(canStartTrip || canArrival || canReentry || canProcessReturn) && (
                <Box sx={{ position: 'sticky', bottom: 0, zIndex: 5, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
                    <Container maxWidth="md" sx={{ py: 2 }}>
                        {canStartTrip && (
                            <SwipeToConfirm
                                label="Desliza para iniciar viaje"
                                loadingLabel="Iniciando..."
                                onConfirm={handleStartTrip}
                                loading={startingTrip}
                                color="primary"
                                icon={<StartTripIcon />}
                            />
                        )}
                        {canArrival && (
                            <SwipeToConfirm
                                label="Desliza para marcar llegada"
                                loadingLabel="Registrando..."
                                onConfirm={handleArrival}
                                loading={arriving}
                                color="primary"
                                icon={<ArrivalIcon />}
                            />
                        )}
                        {canReentry && (
                            <SwipeToConfirm
                                label={selectedBay ? `Confirmar: ${selectedBay.code}` : 'Selecciona bahía arriba'}
                                loadingLabel="Registrando..."
                                onConfirm={handleReentry}
                                loading={reentering}
                                disabled={!selectedBay}
                                color="success"
                                icon={<ReentryIcon />}
                            />
                        )}
                        {canProcessReturn && (
                            <SwipeToConfirm
                                label="Desliza para procesar retorno"
                                loadingLabel="Procesando..."
                                onConfirm={handleReturn}
                                loading={processingReturn}
                                color="warning"
                                icon={<ReturnIcon />}
                            />
                        )}
                    </Container>
                </Box>
            )}

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
