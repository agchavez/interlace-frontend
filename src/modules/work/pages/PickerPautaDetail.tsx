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
    PlayArrow as StartIcon,
    CheckCircle as DoneIcon,
    PanTool as TakeIcon,
    Route as RouteIcon,
    Timer as TimerIcon,
    Category as CategoryIcon,
    ViewModule as PalletIcon,
    PieChartOutline as FractionIcon,
} from '@mui/icons-material';
import SwipeToConfirm from '../../ui/components/SwipeToConfirm';
import { alpha } from '@mui/material/styles';
import {
    useGetPautaQuery,
    useStartPickingMutation,
    useCompletePickingMutation,
    useTakeAsPickerMutation,
} from '../../truck-cycle/services/truckCycleApi';
import PautaStatusBadge from '../../truck-cycle/components/PautaStatusBadge';
import type { PautaStatus } from '../../truck-cycle/interfaces/truckCycle';

function StatTile({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: React.ReactNode }) {
    return (
        <Box sx={{ p: 2, textAlign: 'center', position: 'relative' }}>
            <Box
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: alpha(color, 0.12),
                    color,
                    mb: 1,
                }}
            >
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

export default function PickerPautaDetail() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: pauta, isLoading, error, refetch } = useGetPautaQuery(Number(id));

    // Timestamps del picking (inicio y fin).
    const pickingStartedAt = useMemo(() => {
        if (!pauta?.timestamps) return null;
        const t0 = (pauta.timestamps as any[]).find((t) => t.event_type === 'T0_PICKING_START');
        return t0?.timestamp ?? null;
    }, [pauta]);
    const pickingEndedAt = useMemo(() => {
        if (!pauta?.timestamps) return null;
        const t1 = (pauta.timestamps as any[]).find((t) => t.event_type === 'T1_PICKING_END');
        return t1?.timestamp ?? null;
    }, [pauta]);

    const isPicking = pauta?.status === 'PICKING_IN_PROGRESS';
    const elapsed = useLiveElapsed(isPicking ? pickingStartedAt : null);

    // Duración total cuando ya completó.
    const finalDuration = useMemo(() => {
        if (!pickingStartedAt || !pickingEndedAt) return null;
        const diff = Math.max(0, (new Date(pickingEndedAt).getTime() - new Date(pickingStartedAt).getTime()) / 1000);
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = Math.floor(diff % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }, [pickingStartedAt, pickingEndedAt]);
    const [takeAsPicker, { isLoading: taking }] = useTakeAsPickerMutation();
    const [startPicking, { isLoading: starting }] = useStartPickingMutation();
    const [completePicking, { isLoading: completing }] = useCompletePickingMutation();

    const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });
    const showSnack = (message: string, severity: 'success' | 'error' = 'success') =>
        setSnack({ open: true, message, severity });

    const handleAction = async (action: 'take' | 'start' | 'complete') => {
        if (!pauta) return;
        try {
            if (action === 'take') {
                await takeAsPicker(pauta.id).unwrap();
                showSnack('Pauta tomada');
            } else if (action === 'start') {
                await startPicking(pauta.id).unwrap();
                showSnack('Picking iniciado');
            } else {
                await completePicking(pauta.id).unwrap();
                showSnack('Picking completado');
                setTimeout(() => navigate(-1), 700);
                return;
            }
            refetch();
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

    const canTake = pauta.status === 'PENDING_PICKING';
    const canStart = pauta.status === 'PICKING_ASSIGNED';
    const canComplete = pauta.status === 'PICKING_IN_PROGRESS';
    const isTerminal = pauta.status === 'PICKING_DONE' || pauta.status === 'CLOSED' || pauta.status === 'CANCELLED';

    return (
        <Box sx={{ height: 'calc(100dvh - 60px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <Box
                sx={{
                    flexShrink: 0,
                    bgcolor: 'primary.main',
                    color: '#fff',
                }}
            >
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

            {/* Content (scroll interno) */}
            <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f5f5f5' }}>
              <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3 } }}>
                {/* Banner de tiempo — cambia según estado */}
                {(() => {
                    // En progreso → timer en vivo (naranja).
                    if (isPicking && pickingStartedAt) {
                        return (
                            <Box
                                sx={{
                                    p: 2.5,
                                    mb: 2,
                                    borderRadius: 2,
                                    background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.35)}`,
                                }}
                            >
                                <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: alpha('#fff', 0.2), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TimerIcon sx={{ fontSize: '1.6rem' }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ opacity: 0.85, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                        Tiempo en picking
                                    </Typography>
                                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: { xs: '2rem', sm: '2.5rem' }, lineHeight: 1.1, letterSpacing: 1 }}>
                                        {elapsed}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.7rem' }}>
                                        Meta
                                    </Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                        {pauta.total_boxes} cajas
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    }

                    // Completada → tiempo final (verde).
                    if (finalDuration) {
                        return (
                            <Box
                                sx={{
                                    p: 2.5,
                                    mb: 2,
                                    borderRadius: 2,
                                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.35)}`,
                                }}
                            >
                                <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: alpha('#fff', 0.2), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <DoneIcon sx={{ fontSize: '1.6rem' }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ opacity: 0.85, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                        Tiempo total de picking
                                    </Typography>
                                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: { xs: '2rem', sm: '2.5rem' }, lineHeight: 1.1, letterSpacing: 1 }}>
                                        {finalDuration}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.7rem' }}>
                                        Completado
                                    </Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                        {pauta.total_boxes} cajas
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    }

                    // Asignada pero sin iniciar → info simple.
                    if (pauta.status === 'PICKING_ASSIGNED') {
                        return (
                            <Box
                                sx={{
                                    p: 2,
                                    mb: 2,
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                }}
                            >
                                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.15), color: theme.palette.primary.main, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TimerIcon />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                                        Pauta lista
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight={800} color={theme.palette.primary.dark}>
                                        Desliza "Iniciar" para arrancar el cronómetro
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    }

                    return null;
                })()}

                {/* Hero card — camión + ruta + stats */}
                <Paper
                    elevation={2}
                    sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        mb: 2,
                    }}
                >
                    {/* Hero del camión */}
                    <Box
                        sx={{
                            position: 'relative',
                            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                            color: '#fff',
                            p: { xs: 2.5, sm: 3 },
                            overflow: 'hidden',
                        }}
                    >
                        {/* Silueta decorativa del camión */}
                        <TruckIcon
                            sx={{
                                position: 'absolute',
                                right: -10,
                                bottom: -10,
                                fontSize: 140,
                                opacity: 0.12,
                                transform: 'rotate(-12deg)',
                                pointerEvents: 'none',
                            }}
                        />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    width: { xs: 56, sm: 64 },
                                    height: { xs: 56, sm: 64 },
                                    borderRadius: 2,
                                    bgcolor: alpha('#fff', 0.18),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: `2px solid ${alpha('#fff', 0.25)}`,
                                }}
                            >
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

                    {/* Ruta banner */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            px: 2.5,
                            py: 1.5,
                            bgcolor: alpha(theme.palette.primary.main, 0.06),
                            borderBottom: 1,
                            borderColor: 'divider',
                        }}
                    >
                        <RouteIcon sx={{ color: theme.palette.primary.main }} />
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, fontSize: '0.65rem' }}>
                                RUTA
                            </Typography>
                            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1, fontFamily: 'monospace' }}>
                                {pauta.route_code || '—'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Stats grid 2x2 */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            '& > *': {
                                borderRight: 1,
                                borderBottom: 1,
                                borderColor: 'divider',
                            },
                            '& > *:nth-of-type(2n)': { borderRight: 0 },
                            '& > *:nth-last-of-type(-n+2)': { borderBottom: 0 },
                        }}
                    >
                        <StatTile
                            label="Cajas"
                            value={pauta.total_boxes}
                            color={theme.palette.primary.main}
                            icon={<BoxIcon />}
                        />
                        <StatTile
                            label="SKUs"
                            value={pauta.total_skus}
                            color={theme.palette.primary.main}
                            icon={<CategoryIcon />}
                        />
                        <StatTile
                            label="Tarimas"
                            value={pauta.total_pallets}
                            color={theme.palette.primary.main}
                            icon={<PalletIcon />}
                        />
                        <StatTile
                            label="Fracciones"
                            value={(pauta as any).assembled_fractions ?? 0}
                            color={theme.palette.primary.main}
                            icon={<FractionIcon />}
                        />
                    </Box>
                </Paper>

                {pauta.notes && (
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            Notas
                        </Typography>
                        <Typography variant="body2">{pauta.notes}</Typography>
                    </Paper>
                )}

                {isTerminal && (
                    <Paper
                        elevation={0}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2.5,
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            border: `1px solid ${alpha(theme.palette.success.main, 0.35)}`,
                            mb: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                bgcolor: theme.palette.success.main,
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <DoneIcon />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={800} color={theme.palette.success.dark}>
                                Pauta {pauta.status === 'PICKING_DONE' ? 'completada' : 'cerrada'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                No hay más acciones disponibles en este rol.
                            </Typography>
                        </Box>
                    </Paper>
                )}
              </Container>
            </Box>

            {/* Sticky action bar */}
            {(canTake || canStart || canComplete) && (
                <Box
                    sx={{
                        position: 'sticky',
                        bottom: 0,
                        zIndex: 5,
                        bgcolor: 'background.paper',
                        borderTop: 1,
                        borderColor: 'divider',
                    }}
                >
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
                        {canStart && (
                            <SwipeToConfirm
                                label="Desliza para iniciar"
                                loadingLabel="Iniciando..."
                                onConfirm={() => handleAction('start')}
                                loading={starting}
                                color="primary"
                                icon={<StartIcon />}
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
