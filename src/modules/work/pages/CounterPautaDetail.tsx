import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    IconButton,
    CircularProgress,
    Alert,
    Snackbar,
    Paper,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Inventory as BoxIcon,
    LocalShipping as TruckIcon,
    CheckCircle as DoneIcon,
    PanTool as TakeIcon,
    Route as RouteIcon,
    Timer as TimerIcon,
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
    useCompleteCountMutation,
    useTakeAsCounterMutation,
} from '../../truck-cycle/services/truckCycleApi';
import PautaStatusBadge from '../../truck-cycle/components/PautaStatusBadge';
import SwipeToConfirm from '../../ui/components/SwipeToConfirm';
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

function useLiveElapsed(since: string | null | undefined): string {
    const [value, setValue] = useState('00:00:00');
    useEffect(() => {
        if (!since) { setValue('00:00:00'); return; }
        const update = () => {
            const diff = Math.max(0, (Date.now() - new Date(since).getTime()) / 1000);
            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = Math.floor(diff % 60);
            setValue(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [since]);
    return value;
}

export default function CounterPautaDetail() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: pauta, isLoading, error, refetch } = useGetPautaQuery(Number(id));
    const [takeAsCounter, { isLoading: taking }] = useTakeAsCounterMutation();
    const [completeCount, { isLoading: completing }] = useCompleteCountMutation();

    // Solo las inconsistencias de la fase VERIFICATION — son las que registra el contador.
    const inconsistencies = ((pauta as any)?.inconsistencies || []).filter(
        (inc: any) => inc.phase === 'VERIFICATION',
    );

    const countStartedAt = useMemo(() => {
        if (!pauta?.timestamps) return null;
        const t = (pauta.timestamps as any[]).find((t) => t.event_type === 'T5_COUNT_START');
        return t?.timestamp ?? null;
    }, [pauta]);
    const countEndedAt = useMemo(() => {
        if (!pauta?.timestamps) return null;
        const t = (pauta.timestamps as any[]).find((t) => t.event_type === 'T6_COUNT_END');
        return t?.timestamp ?? null;
    }, [pauta]);

    const isCounting = pauta?.status === 'COUNTING';
    const elapsed = useLiveElapsed(isCounting ? countStartedAt : null);

    const finalDuration = useMemo(() => {
        if (!countStartedAt || !countEndedAt) return null;
        const diff = Math.max(0, (new Date(countEndedAt).getTime() - new Date(countStartedAt).getTime()) / 1000);
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = Math.floor(diff % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }, [countStartedAt, countEndedAt]);

    const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success',
    });
    const showSnack = (message: string, severity: 'success' | 'error' = 'success') =>
        setSnack({ open: true, message, severity });

    const handleAction = async (action: 'take' | 'complete') => {
        if (!pauta) return;
        try {
            if (action === 'take') {
                await takeAsCounter(pauta.id).unwrap();
                showSnack('Pauta tomada para conteo');
                refetch();
            } else {
                await completeCount(pauta.id).unwrap();
                showSnack('Conteo completado');
                setTimeout(() => navigate(-1), 500);
            }
        } catch (err: any) {
            showSnack(err?.data?.error || err?.data?.detail || 'Error al ejecutar la acción', 'error');
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

    const canTake = pauta.status === 'PENDING_COUNT';
    const canComplete = pauta.status === 'COUNTING';
    const isTerminal = ['COUNTED', 'CLOSED', 'CANCELLED'].includes(pauta.status);

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
                    {/* Banner de tiempo */}
                    {(() => {
                        if (isCounting && countStartedAt) {
                            return (
                                <Box sx={{ p: 2.5, mb: 2, borderRadius: 2, background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`, color: '#fff', display: 'flex', alignItems: 'center', gap: 2, boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.35)}` }}>
                                    <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: alpha('#fff', 0.2), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <TimerIcon sx={{ fontSize: '1.6rem' }} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                            Tiempo en conteo
                                        </Typography>
                                        <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: { xs: '2rem', sm: '2.5rem' }, lineHeight: 1.1, letterSpacing: 1 }}>
                                            {elapsed}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.7rem' }}>Meta</Typography>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                            {pauta.total_boxes} cajas
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        }
                        if (finalDuration) {
                            return (
                                <Box sx={{ p: 2.5, mb: 2, borderRadius: 2, background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`, color: '#fff', display: 'flex', alignItems: 'center', gap: 2, boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.35)}` }}>
                                    <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: alpha('#fff', 0.2), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <DoneIcon sx={{ fontSize: '1.6rem' }} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                            Tiempo total de conteo
                                        </Typography>
                                        <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: { xs: '2rem', sm: '2.5rem' }, lineHeight: 1.1, letterSpacing: 1 }}>
                                            {finalDuration}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.7rem' }}>Contadas</Typography>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                            {pauta.total_boxes} cajas
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        }
                        if (pauta.status === 'PENDING_COUNT') {
                            return (
                                <Box sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.08), border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.15), color: theme.palette.primary.main, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <TimerIcon />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                                            Lista para contar
                                        </Typography>
                                        <Typography variant="subtitle1" fontWeight={800} color={theme.palette.primary.dark}>
                                            Desliza "Tomar" para iniciar el conteo
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        }
                        return null;
                    })()}

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

                    {/* Sección de verificación — visible en COUNTING y COUNTED */}
                    {(isCounting || isTerminal) && (
                        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <WarningIcon sx={{ color: theme.palette.warning.main }} />
                                <Typography variant="subtitle1" fontWeight={800} sx={{ flex: 1 }}>
                                    Verificación
                                </Typography>
                                {inconsistencies.length > 0 && (
                                    <Box sx={{ bgcolor: alpha(theme.palette.warning.main, 0.15), color: theme.palette.warning.dark, px: 1, py: 0.25, borderRadius: 1, fontWeight: 700, fontSize: '0.75rem' }}>
                                        {inconsistencies.length} {inconsistencies.length === 1 ? 'inconsistencia' : 'inconsistencias'}
                                    </Box>
                                )}
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                {inconsistencies.length === 0
                                    ? 'Revisa productos uno a uno, escanea códigos de barra y registra faltantes/sobrantes/daños con evidencia fotográfica.'
                                    : 'Ya registraste inconsistencias. Puedes agregar más o revisarlas desde la pantalla de verificación.'}
                            </Typography>

                            <Button
                                fullWidth
                                variant="contained"
                                color="warning"
                                endIcon={<OpenIcon />}
                                onClick={() => navigate(`/truck-cycle/verify/${pauta.id}?phase=VERIFICATION`)}
                                sx={{ py: 1.5, fontWeight: 800 }}
                            >
                                Abrir pantalla de verificación
                            </Button>
                        </Paper>
                    )}

                    {isTerminal && (
                        <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.1), border: `1px solid ${alpha(theme.palette.success.main, 0.35)}`, mb: 2 }}>
                            <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: theme.palette.success.main, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <DoneIcon />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={800} color={theme.palette.success.dark}>
                                    Conteo completado
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    No hay más acciones disponibles en este rol.
                                </Typography>
                            </Box>
                        </Paper>
                    )}
                </Container>
            </Box>

            {(canTake || canComplete) && (
                <Box sx={{ position: 'sticky', bottom: 0, zIndex: 5, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
                    <Container maxWidth="md" sx={{ py: 2 }}>
                        {canTake && (
                            <SwipeToConfirm
                                label="Desliza para tomar"
                                loadingLabel="Tomando..."
                                onConfirm={() => handleAction('take')}
                                loading={taking}
                                color="primary"
                                icon={<TakeIcon />}
                            />
                        )}
                        {canComplete && (
                            <SwipeToConfirm
                                label="Desliza para completar"
                                loadingLabel="Completando..."
                                onConfirm={() => handleAction('complete')}
                                loading={completing}
                                color="success"
                                icon={<DoneIcon />}
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
