import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Chip, Divider, LinearProgress, IconButton, Tooltip, ButtonBase } from '@mui/material';
import { todayInHonduras, HN_TIMEZONE } from '../../../utils/timezone';
import {
    LocalShipping as TruckIcon,
    Inventory as BoxIcon,
    CheckCircle as DoneIcon,
    HourglassTop as QueueIcon,
    ContentPasteSearch as CountIcon,
    Fullscreen as FullscreenIcon,
    FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import {
    useGetWorkstationQuery,
    useGetReloadQueueQuery,
    useGetKPISummaryQuery,
} from '../services/truckCycleApi';
import { useTruckCycleSocket } from '../hooks/useTruckCycleSocket';
import type { PautaStatus, PautaListItem } from '../interfaces/truckCycle';

// ─── Status config ───────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
    PENDING_PICKING: '#78909c', PICKING_ASSIGNED: '#29b6f6',
    PICKING_IN_PROGRESS: '#039be5', PICKING_DONE: '#0277bd',
    IN_BAY: '#ffa726', PENDING_COUNT: '#ffb74d',
    COUNTING: '#ff9800', COUNTED: '#f57c00',
    MOVING_TO_PARKING: '#00acc1', PARKED: '#00838f',
    PENDING_CHECKOUT: '#ab47bc', CHECKOUT_SECURITY: '#9c27b0',
    CHECKOUT_OPS: '#7b1fa2', DISPATCHED: '#66bb6a',
    IN_RELOAD_QUEUE: '#26c6da', PENDING_RETURN: '#ef5350',
    RETURN_PROCESSED: '#e53935', IN_AUDIT: '#fdd835',
    AUDIT_COMPLETE: '#c0ca33', CLOSED: '#9e9e9e', CANCELLED: '#d32f2f',
};

const STATUS_LABELS: Record<PautaStatus, string> = {
    PENDING_PICKING: 'Pend. Picking', PICKING_ASSIGNED: 'Picker Asignado',
    PICKING_IN_PROGRESS: 'Picking', PICKING_DONE: 'Picking OK',
    MOVING_TO_BAY: 'A Bahia', IN_BAY: 'En Bahia', PENDING_COUNT: 'Pend. Conteo',
    COUNTING: 'Contando', COUNTED: 'Contado',
    MOVING_TO_PARKING: 'A Estac.', PARKED: 'Estacionado',
    PENDING_CHECKOUT: 'Pend. Checkout', CHECKOUT_SECURITY: 'Seg.',
    CHECKOUT_OPS: 'Ops.', DISPATCHED: 'Despachado',
    IN_RELOAD_QUEUE: 'Cola Recarga', PENDING_RETURN: 'Pend. Retorno',
    RETURN_PROCESSED: 'Retorno OK', IN_AUDIT: 'Auditoria',
    AUDIT_COMPLETE: 'Audit. OK', CLOSED: 'Cerrada', CANCELLED: 'Cancelada',
};

const PIPELINE_ORDER: string[] = [
    'PENDING_PICKING', 'PICKING_ASSIGNED', 'PICKING_IN_PROGRESS', 'PICKING_DONE',
    'IN_BAY', 'PENDING_COUNT', 'COUNTING', 'COUNTED',
    'MOVING_TO_PARKING', 'PARKED',
    'PENDING_CHECKOUT', 'CHECKOUT_SECURITY', 'CHECKOUT_OPS', 'DISPATCHED',
    'IN_RELOAD_QUEUE', 'PENDING_RETURN', 'RETURN_PROCESSED',
    'IN_AUDIT', 'AUDIT_COMPLETE', 'CLOSED', 'CANCELLED',
];

// ─── Clock ───────────────────────────────────────────────────────────────────
function useClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    return now;
}

function elapsedLabel(from: string | null | undefined) {
    if (!from) return '--';
    const mins = Math.round((Date.now() - new Date(from).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function WorkstationPage() {
    const clock = useClock();
    const navigate = useNavigate();
    // Fecha operativa anclada a Honduras — independiente del TZ del cliente.
    const operationalDate = useMemo(() => todayInHonduras(), []);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // WebSocket para actualizaciones instantáneas + polling como fallback
    useTruckCycleSocket();
    const { data: workstation, isLoading } = useGetWorkstationQuery({ operational_date: operationalDate }, { pollingInterval: 30_000 });
    const { data: reloadQueue } = useGetReloadQueueQuery({ operational_date: operationalDate }, { pollingInterval: 30_000 });
    const { data: kpi } = useGetKPISummaryQuery({ operational_date: operationalDate }, { pollingInterval: 30_000 });

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
        }
    }, []);

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    const statusColumns = useMemo(() => {
        if (!workstation) return [] as { status: string; label: string; color: string; pautas: PautaListItem[] }[];
        return Object.entries(workstation)
            .filter(([, g]) => g.count > 0)
            .map(([s, g]) => ({
                status: s, label: STATUS_LABELS[s as PautaStatus] ?? s,
                color: STATUS_COLORS[s] ?? '#78909c', pautas: g.pautas,
            }))
            .sort((a, b) => (PIPELINE_ORDER.indexOf(a.status) ?? 99) - (PIPELINE_ORDER.indexOf(b.status) ?? 99));
    }, [workstation]);

    const countByStatus = (statuses: string[]) => {
        if (!workstation) return 0;
        return statuses.reduce((sum, s) => sum + (workstation[s]?.count ?? 0), 0);
    };

    const queueItems: PautaListItem[] = Array.isArray(reloadQueue) ? reloadQueue : (reloadQueue as any)?.results ?? [];

    const kpiCards = [
        { label: 'Total', value: kpi?.total_pautas ?? 0, icon: <TruckIcon fontSize="large" />, color: '#3b82f6' },
        { label: 'Picking', value: countByStatus(['PICKING_ASSIGNED', 'PICKING_IN_PROGRESS', 'PICKING_DONE']), icon: <BoxIcon fontSize="large" />, color: '#0ea5e9' },
        { label: 'Conteo', value: countByStatus(['PENDING_COUNT', 'COUNTING', 'COUNTED']), icon: <CountIcon fontSize="large" />, color: '#f59e0b' },
        { label: 'Despachados', value: countByStatus(['DISPATCHED']), icon: <DoneIcon fontSize="large" />, color: '#22c55e' },
        { label: 'Recarga', value: countByStatus(['IN_RELOAD_QUEUE']), icon: <QueueIcon fontSize="large" />, color: '#06b6d4' },
    ];

    return (
        <Box sx={{
            position: isFullscreen ? 'fixed' : 'relative',
            top: isFullscreen ? 0 : 'auto',
            left: isFullscreen ? 0 : 'auto',
            width: isFullscreen ? '100vw' : '100%',
            height: isFullscreen ? '100vh' : 'calc(100vh - 64px)',
            bgcolor: '#0f172a',
            color: '#e2e8f0',
            p: { xs: 2, md: 3 },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: isFullscreen ? 9999 : 'auto',
        }}>
            {/* ── HEADER ──────────────────────────────────────────────── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0 }}>
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight={800}
                        sx={{ color: '#f1f5f9', letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', md: '2rem', lg: '2.25rem' } }}
                    >
                        Workstation
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Ciclo del Camion &middot; {operationalDate}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography
                        variant="h3"
                        fontWeight={700}
                        sx={{ color: '#38bdf8', fontVariantNumeric: 'tabular-nums', fontSize: { xs: '1.75rem', md: '2.5rem', lg: '3rem' } }}
                    >
                        {clock.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: HN_TIMEZONE })}
                    </Typography>
                    <Tooltip title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa (TV)'}>
                        <IconButton onClick={toggleFullscreen} sx={{ color: '#94a3b8' }}>
                            {isFullscreen ? <FullscreenExitIcon fontSize="large" /> : <FullscreenIcon fontSize="large" />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {isLoading && <LinearProgress sx={{ mb: 1, flexShrink: 0, bgcolor: '#1e293b', '& .MuiLinearProgress-bar': { bgcolor: '#38bdf8' } }} />}

            {/* ── KPI STRIP ──────────────────────────────────────────── */}
            <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, mb: 2, flexShrink: 0, flexWrap: 'wrap' }}>
                {kpiCards.map((k) => (
                    <Box key={k.label} sx={{
                        flex: '1 1 0',
                        minWidth: { xs: 120, sm: 150 },
                        bgcolor: '#1e293b',
                        borderRadius: 2,
                        p: { xs: 1.5, md: 2, lg: 2.5 },
                        borderBottom: `4px solid ${k.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 1, md: 2 },
                    }}>
                        <Box sx={{ color: k.color, display: 'flex', opacity: 0.8 }}>{k.icon}</Box>
                        <Box>
                            <Typography fontWeight={800} sx={{
                                color: '#f1f5f9',
                                lineHeight: 1,
                                fontSize: { xs: '1.75rem', md: '2.5rem', lg: '3rem' },
                            }}>
                                {k.value}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: { xs: '0.65rem', md: '0.8rem' } }}>
                                {k.label}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* ── STATUS PIPELINE ────────────────────────────────────── */}
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', mb: 2 }}>
                {statusColumns.length > 0 ? (
                    <Grid container spacing={1.5} sx={{ height: '100%' }}>
                        {statusColumns.map(({ status, label, color, pautas }) => (
                            <Grid item xs={6} sm={4} md={3} lg={2} key={status} sx={{ display: 'flex' }}>
                                <Box sx={{ bgcolor: '#1e293b', borderRadius: 2, overflow: 'hidden', width: '100%', display: 'flex', flexDirection: 'column' }}>
                                    {/* Header clickeable — abre el detalle del status. */}
                                    <ButtonBase
                                        onClick={() => navigate(`/truck-cycle/workstation/status/${status}`)}
                                        sx={{
                                            bgcolor: color,
                                            px: 1.5, py: { xs: 0.5, md: 0.75 },
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            width: '100%',
                                            transition: 'filter .15s ease',
                                            '&:hover': { filter: 'brightness(1.15)' },
                                        }}
                                    >
                                        <Typography variant="caption" fontWeight={700} sx={{ color: '#fff', fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
                                            {label}
                                        </Typography>
                                        <Chip label={pautas.length} size="small" sx={{
                                            height: 20, bgcolor: 'rgba(0,0,0,0.3)', color: '#fff',
                                            fontWeight: 700, fontSize: '0.7rem', minWidth: 28,
                                        }} />
                                    </ButtonBase>
                                    {/* Cards — cada una navega a la pauta detail. */}
                                    <Box sx={{
                                        p: 0.75,
                                        flex: 1, overflow: 'auto',
                                        '&::-webkit-scrollbar': { width: 3 },
                                        '&::-webkit-scrollbar-thumb': { bgcolor: color, borderRadius: 2 },
                                    }}>
                                        {pautas.map((p) => (
                                            <ButtonBase
                                                key={p.id}
                                                onClick={() => navigate(`/truck-cycle/pautas/${p.id}`)}
                                                sx={{
                                                    display: 'block', textAlign: 'left', width: '100%',
                                                    bgcolor: 'rgba(255,255,255,0.04)',
                                                    borderRadius: 1,
                                                    px: 1, py: 0.5, mb: 0.5,
                                                    borderLeft: `3px solid ${color}`,
                                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography fontWeight={700} sx={{ color: '#f1f5f9', fontSize: { xs: '0.75rem', md: '0.85rem' }, lineHeight: 1.3 }}>
                                                        {p.transport_number}
                                                    </Typography>
                                                    <Typography sx={{ color: '#f59e0b', fontSize: { xs: '0.55rem', md: '0.65rem' }, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                                                        {elapsedLabel(p.last_status_change ?? p.created_at)}
                                                    </Typography>
                                                </Box>
                                                <Typography sx={{ color: '#94a3b8', fontSize: { xs: '0.6rem', md: '0.7rem' } }}>
                                                    {p.truck_plate} &middot; {p.total_boxes} cajas
                                                </Typography>
                                            </ButtonBase>
                                        ))}
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200 }}>
                        <Typography variant="h5" sx={{ color: '#334155' }}>
                            No hay pautas activas para hoy
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* ── RELOAD QUEUE ────────────────────────────────────────── */}
            <Divider sx={{ borderColor: '#334155', mb: 1 }} />
            <Box sx={{ flexShrink: 0 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#06b6d4', mb: 1, fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
                    Cola de Recarga ({queueItems.length})
                </Typography>
                <Box sx={{
                    display: 'flex',
                    gap: { xs: 1, md: 1.5 },
                    overflowX: 'auto',
                    pb: 0.5,
                    '&::-webkit-scrollbar': { height: 5 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: '#06b6d4', borderRadius: 3 },
                }}>
                    {queueItems.length > 0 ? queueItems.map((p, idx) => (
                        <Box key={p.id} sx={{
                            flex: '0 0 auto',
                            minWidth: { xs: 160, md: 200 },
                            bgcolor: '#1e293b',
                            borderRadius: 2,
                            borderLeft: '4px solid #06b6d4',
                            px: 2, py: 1,
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                <Typography fontWeight={800} sx={{ color: '#06b6d4', fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                                    #{idx + 1}
                                </Typography>
                                <Typography fontWeight={600} sx={{ color: '#f1f5f9', fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
                                    {p.transport_number}
                                </Typography>
                            </Box>
                            <Typography sx={{ color: '#94a3b8', fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
                                {p.truck_plate} &middot; Espera: {elapsedLabel(p.last_status_change ?? p.created_at)}
                            </Typography>
                        </Box>
                    )) : (
                        <Typography variant="body2" sx={{ color: '#475569' }}>
                            Sin camiones en cola
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
