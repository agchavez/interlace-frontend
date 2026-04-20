import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Grid, Chip, Divider, LinearProgress, Alert, Button,
    Drawer, IconButton, ButtonBase,
} from '@mui/material';
import {
    LocalShipping as TruckIcon,
    Inventory as BoxIcon,
    CheckCircle as DoneIcon,
    HourglassTop as QueueIcon,
    ContentPasteSearch as CountIcon,
    Close as CloseIcon,
    Person as PersonIcon,
    Group as TeamIcon,
    Route as RouteIcon,
    MeetingRoom as BayIcon,
    Schedule as TimeIcon,
    ReportProblem as WarningIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import useWebSocket from 'react-use-websocket';
import { useGetTvWorkstationQuery, useHeartbeatMutation } from '../services/tvApi';
import { getTvToken, getTvCode, getTvLabel, clearTvSession, updateTvDashboard } from '../utils/tvToken';
import { todayInHonduras, HN_TIMEZONE } from '../../../utils/timezone';
import type { PautaStatus, PautaListItem } from '../../truck-cycle/interfaces/truckCycle';

const WS_URL = import.meta.env.VITE_JS_APP_API_URL_WS as string;

const STATUS_COLORS: Record<string, string> = {
    PENDING_PICKING: '#78909c', PICKING_ASSIGNED: '#29b6f6',
    PICKING_IN_PROGRESS: '#039be5', PICKING_DONE: '#0277bd',
    MOVING_TO_BAY: '#ff9800', IN_BAY: '#ffa726', PENDING_COUNT: '#ffb74d',
    COUNTING: '#ff9800', COUNTED: '#f57c00',
    PENDING_CHECKOUT: '#ab47bc', CHECKOUT_SECURITY: '#9c27b0',
    CHECKOUT_OPS: '#7b1fa2', DISPATCHED: '#66bb6a',
    IN_RELOAD_QUEUE: '#26c6da', PENDING_RETURN: '#ef5350',
    RETURN_PROCESSED: '#e53935', IN_AUDIT: '#fdd835',
    AUDIT_COMPLETE: '#c0ca33', CLOSED: '#9e9e9e', CANCELLED: '#d32f2f',
};

const STATUS_LABELS: Record<string, string> = {
    PENDING_PICKING: 'Pend. Picking', PICKING_ASSIGNED: 'Picker Asignado',
    PICKING_IN_PROGRESS: 'Picking', PICKING_DONE: 'Picking OK',
    MOVING_TO_BAY: 'A Bahía', IN_BAY: 'En Bahía', PENDING_COUNT: 'Pend. Conteo',
    COUNTING: 'Contando', COUNTED: 'Contado',
    PENDING_CHECKOUT: 'Pend. Checkout', CHECKOUT_SECURITY: 'Seg.',
    CHECKOUT_OPS: 'Ops.', DISPATCHED: 'Despachado',
    IN_RELOAD_QUEUE: 'Cola Recarga', PENDING_RETURN: 'Pend. Retorno',
    RETURN_PROCESSED: 'Retorno OK', IN_AUDIT: 'Auditoría',
    AUDIT_COMPLETE: 'Audit. OK', CLOSED: 'Cerrada', CANCELLED: 'Cancelada',
};

const PIPELINE_ORDER: string[] = [
    'PENDING_PICKING', 'PICKING_ASSIGNED', 'PICKING_IN_PROGRESS', 'PICKING_DONE',
    'MOVING_TO_BAY', 'IN_BAY', 'PENDING_COUNT', 'COUNTING', 'COUNTED',
    'PENDING_CHECKOUT', 'CHECKOUT_SECURITY', 'CHECKOUT_OPS', 'DISPATCHED',
    'IN_RELOAD_QUEUE', 'PENDING_RETURN', 'RETURN_PROCESSED',
    'IN_AUDIT', 'AUDIT_COMPLETE', 'CLOSED', 'CANCELLED',
];

function useClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
    return now;
}

function elapsedLabel(from: string | null | undefined) {
    if (!from) return '--';
    const mins = Math.round((Date.now() - new Date(from).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function TvWorkstationPage() {
    const navigate = useNavigate();
    const clock = useClock();
    const token = getTvToken();
    const code = getTvCode();
    const label = getTvLabel();
    // Estado del drawer de detalle — se abre al clickear una columna o tarjeta.
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const operationalDate = useMemo(() => todayInHonduras(), []);
    const { data, isLoading, refetch, error } = useGetTvWorkstationQuery(
        { operational_date: operationalDate },
        { pollingInterval: 30_000, skip: !token },
    );
    const [heartbeat] = useHeartbeatMutation();

    // Heartbeat cada 60s para que el backend sepa que la TV sigue viva.
    useEffect(() => {
        if (!token) return;
        const id = setInterval(() => { heartbeat(); }, 60_000);
        return () => clearInterval(id);
    }, [token, heartbeat]);

    // WS para recibir cambios de config (cambio de dashboard, revocación).
    const wsUrl = code ? `${WS_URL}/ws/tv/${code}/` : null;
    const { lastMessage } = useWebSocket(wsUrl, {
        reconnectAttempts: 999,
        reconnectInterval: 3000,
        retryOnError: true,
        shouldReconnect: () => true,
    }, !!wsUrl);

    useEffect(() => {
        if (!lastMessage?.data) return;
        try {
            const msg = JSON.parse(lastMessage.data);
            if (msg.type === 'session.revoked') {
                clearTvSession();
                navigate('/tv', { replace: true });
            } else if (msg.type === 'session.updated') {
                // Sincroniza localStorage con lo que el admin cambió.
                if (msg.dashboard) updateTvDashboard(msg.dashboard, msg.label);
                if (msg.dashboard && msg.dashboard !== 'WORKSTATION') {
                    navigate(`/tv/dashboard/${String(msg.dashboard).toLowerCase()}`, { replace: true });
                } else {
                    refetch();
                }
            }
        } catch { /* ignore */ }
    }, [lastMessage, navigate, refetch]);

    // Si el token fue rechazado por el servidor, volver a la vinculación.
    useEffect(() => {
        if (!error) return;
        const status = (error as any)?.status;
        if (status === 401 || status === 403) {
            clearTvSession();
            navigate('/tv', { replace: true });
        }
    }, [error, navigate]);

    // OJO: este useMemo debe quedar antes del early return de !token, o React
    // tira "Rendered fewer hooks than expected".
    const statusColumns = useMemo(() => {
        if (!data) return [] as { status: string; label: string; color: string; pautas: PautaListItem[] }[];
        return Object.entries(data.workstation)
            .filter(([, g]) => g.count > 0)
            .map(([s, g]) => ({
                status: s,
                label: STATUS_LABELS[s] ?? s,
                color: STATUS_COLORS[s] ?? '#78909c',
                pautas: g.pautas,
            }))
            .sort((a, b) => PIPELINE_ORDER.indexOf(a.status) - PIPELINE_ORDER.indexOf(b.status));
    }, [data]);

    if (!token) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f172a', color: '#e2e8f0', p: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Alert severity="warning" sx={{ mb: 2 }}>Esta TV no está vinculada.</Alert>
                    <Button variant="contained" onClick={() => navigate('/tv')}>Ir a la vinculación</Button>
                </Box>
            </Box>
        );
    }

    const countByStatus = (statuses: string[]) => {
        if (!data) return 0;
        return statuses.reduce((sum, s) => sum + (data.workstation[s]?.count ?? 0), 0);
    };

    const kpiCards = [
        { label: 'Picking', value: countByStatus(['PICKING_ASSIGNED', 'PICKING_IN_PROGRESS', 'PICKING_DONE']), icon: <BoxIcon fontSize="large" />, color: '#0ea5e9' },
        { label: 'Conteo', value: countByStatus(['PENDING_COUNT', 'COUNTING', 'COUNTED']), icon: <CountIcon fontSize="large" />, color: '#f59e0b' },
        { label: 'Despachados', value: countByStatus(['DISPATCHED']), icon: <DoneIcon fontSize="large" />, color: '#22c55e' },
        { label: 'Recarga', value: countByStatus(['IN_RELOAD_QUEUE']), icon: <QueueIcon fontSize="large" />, color: '#06b6d4' },
    ];

    const queueItems = data?.reload_queue || [];

    return (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: '#0f172a', color: '#e2e8f0', p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 9999 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0 }}>
                <Box>
                    <Typography variant="h3" fontWeight={900} sx={{ color: '#f1f5f9', letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', md: '2.25rem', lg: '2.5rem' } }}>
                        Workstation
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {label ? `${label} · ` : ''}{operationalDate}
                    </Typography>
                </Box>
                <Typography variant="h3" fontWeight={700} sx={{ color: '#38bdf8', fontVariantNumeric: 'tabular-nums', fontSize: { xs: '2rem', md: '2.75rem', lg: '3.25rem' } }}>
                    {clock.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: HN_TIMEZONE })}
                </Typography>
            </Box>

            {isLoading && <LinearProgress sx={{ mb: 1, bgcolor: '#1e293b', '& .MuiLinearProgress-bar': { bgcolor: '#38bdf8' } }} />}

            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexShrink: 0, flexWrap: 'wrap' }}>
                {kpiCards.map((k) => (
                    <Box key={k.label} sx={{
                        flex: '1 1 0', minWidth: 150,
                        bgcolor: '#1e293b', borderRadius: 2,
                        p: { xs: 2, md: 2.5 },
                        borderBottom: `4px solid ${k.color}`,
                        display: 'flex', alignItems: 'center', gap: 2,
                    }}>
                        <Box sx={{ color: k.color, opacity: 0.8, display: 'flex' }}>{k.icon}</Box>
                        <Box>
                            <Typography fontWeight={800} sx={{ color: '#f1f5f9', lineHeight: 1, fontSize: { xs: '2rem', md: '2.75rem', lg: '3rem' } }}>
                                {k.value}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: { xs: '0.7rem', md: '0.85rem' } }}>
                                {k.label}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', mb: 2 }}>
                {statusColumns.length > 0 ? (
                    <Grid container spacing={1.5} sx={{ height: '100%' }}>
                        {statusColumns.map(({ status, label, color, pautas }) => (
                            <Grid item xs={6} sm={4} md={3} lg={2} key={status} sx={{ display: 'flex' }}>
                                <Box sx={{ bgcolor: '#1e293b', borderRadius: 2, overflow: 'hidden', width: '100%', display: 'flex', flexDirection: 'column' }}>
                                    {/* Header clickeable → abre el drawer con el detalle del status */}
                                    <ButtonBase
                                        onClick={() => setSelectedStatus(status)}
                                        sx={{
                                            bgcolor: color, px: 1.5, py: 0.75,
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            width: '100%',
                                            transition: 'filter .15s ease',
                                            '&:hover': { filter: 'brightness(1.15)' },
                                        }}
                                    >
                                        <Typography variant="caption" fontWeight={700} sx={{ color: '#fff', fontSize: '0.75rem' }}>
                                            {label}
                                        </Typography>
                                        <Chip label={pautas.length} size="small" sx={{ height: 20, bgcolor: 'rgba(0,0,0,0.3)', color: '#fff', fontWeight: 700, fontSize: '0.7rem', minWidth: 28 }} />
                                    </ButtonBase>
                                    <Box sx={{ p: 0.75, flex: 1, overflow: 'auto' }}>
                                        {pautas.map((p) => (
                                            <ButtonBase
                                                key={p.id}
                                                onClick={() => setSelectedStatus(status)}
                                                sx={{
                                                    display: 'block', textAlign: 'left', width: '100%',
                                                    bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 1,
                                                    px: 1, py: 0.5, mb: 0.5,
                                                    borderLeft: `3px solid ${color}`,
                                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography fontWeight={700} sx={{ color: '#f1f5f9', fontSize: '0.85rem', lineHeight: 1.3 }}>
                                                        {p.transport_number}
                                                    </Typography>
                                                    <Typography sx={{ color: '#f59e0b', fontSize: '0.65rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                                                        {elapsedLabel(p.last_status_change ?? p.created_at)}
                                                    </Typography>
                                                </Box>
                                                <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                                                    {p.truck_plate} · {p.total_boxes} cajas
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

            <Divider sx={{ borderColor: '#334155', mb: 1 }} />
            <Box sx={{ flexShrink: 0 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#06b6d4', mb: 1, fontSize: '0.9rem' }}>
                    Cola de Recarga ({queueItems.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 0.5 }}>
                    {queueItems.length > 0 ? queueItems.map((p, idx) => (
                        <Box key={p.id} sx={{ flex: '0 0 auto', minWidth: 200, bgcolor: '#1e293b', borderRadius: 2, borderLeft: '4px solid #06b6d4', px: 2, py: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                <Typography fontWeight={800} sx={{ color: '#06b6d4', fontSize: '1.5rem' }}>#{idx + 1}</Typography>
                                <Typography fontWeight={600} sx={{ color: '#f1f5f9', fontSize: '0.9rem' }}>{p.transport_number}</Typography>
                            </Box>
                            <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                {p.truck_plate} · Espera: {elapsedLabel(p.last_status_change ?? p.created_at)}
                            </Typography>
                        </Box>
                    )) : (
                        <Typography variant="body2" sx={{ color: '#475569' }}>Sin camiones en cola</Typography>
                    )}
                </Box>
            </Box>

            <TruckIcon sx={{ display: 'none' }} />

            {/* Drawer con el detalle del status seleccionado — se monta desde
                los datos que ya tenemos, sin navegación y sin extra API. */}
            <StatusDetailDrawer
                open={!!selectedStatus}
                onClose={() => setSelectedStatus(null)}
                status={selectedStatus}
                pautas={selectedStatus && data ? data.workstation[selectedStatus]?.pautas || [] : []}
            />
        </Box>
    );
}

// ────────── Drawer de detalle ──────────

function StatusDetailDrawer({
    open, onClose, status, pautas,
}: { open: boolean; onClose: () => void; status: string | null; pautas: PautaListItem[] }) {
    if (!status) return null;
    const label = STATUS_LABELS[status] || status;
    const color = STATUS_COLORS[status] || '#78909c';
    const totalBoxes = pautas.reduce((s, p) => s + (p.total_boxes || 0), 0);

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            // El contenedor TV usa zIndex 9999, hay que subir el Drawer por encima
            // o queda detrás y pareciera que el click no hace nada.
            sx={{ zIndex: 10_000 }}
            PaperProps={{ sx: { width: { xs: '100vw', md: '50vw', lg: '40vw' }, bgcolor: '#0f172a', color: '#e2e8f0' } }}
        >
            <Box sx={{ p: 2, background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.75)} 100%)` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={onClose} size="small" sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.2)', '&:hover': { bgcolor: 'rgba(0,0,0,0.35)' } }}>
                        <CloseIcon />
                    </IconButton>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ opacity: 0.9, letterSpacing: 1.5 }}>STATUS</Typography>
                        <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1.1 }}>{label}</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                    <Chip label={`${pautas.length} transportes`} sx={{ bgcolor: 'rgba(0,0,0,0.25)', color: '#fff', fontWeight: 700 }} />
                    <Chip label={`${totalBoxes} cajas`} sx={{ bgcolor: 'rgba(0,0,0,0.25)', color: '#fff', fontWeight: 700 }} />
                </Box>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {pautas.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 4 }}>
                        Sin transportes en esta etapa.
                    </Typography>
                ) : (
                    pautas.map((p) => <TvPautaCard key={p.id} pauta={p} color={color} />)
                )}
            </Box>
        </Drawer>
    );
}

const ROLE_COLORS: Record<string, string> = {
    PICKER: '#29b6f6', COUNTER: '#ff9800', YARD_DRIVER: '#ffa726',
    DELIVERY_DRIVER: '#66bb6a', SECURITY: '#ab47bc', OPERATIONS: '#7b1fa2',
    OPM: '#7b1fa2', VERIFIER: '#f57c00',
};

function TvPautaCard({ pauta, color }: { pauta: PautaListItem; color: string }) {
    const elapsedFrom = pauta.status_started_at ?? pauta.last_status_change ?? pauta.created_at;
    const roles = pauta.roles || {};
    const roleEntries = Object.entries(roles);
    const inconsistencies = pauta.inconsistencies_count || 0;

    return (
        <Box sx={{
            bgcolor: '#1e293b', borderRadius: 2, mb: 1.5, p: 2,
            borderLeft: `4px solid ${color}`,
        }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="h6" fontWeight={800} sx={{ color: '#f1f5f9', lineHeight: 1.1 }}>
                        T-{pauta.transport_number}
                        {pauta.is_reload && <Chip size="small" label="Recarga" sx={{ ml: 1, height: 18, fontSize: '0.6rem', bgcolor: alpha('#06b6d4', 0.25), color: '#67e8f9' }} />}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        {pauta.truck_code || '—'} · {pauta.truck_plate}
                    </Typography>
                </Box>
                <Chip
                    icon={<TimeIcon sx={{ fontSize: '0.9rem' }} />}
                    label={elapsedLabel(elapsedFrom)}
                    size="small"
                    sx={{ bgcolor: alpha(color, 0.25), color: '#fff', fontWeight: 700, '& .MuiChip-icon': { color: '#fff' } }}
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1, mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94a3b8' }}>
                    <BoxIcon sx={{ fontSize: '0.9rem' }} />
                    <Typography variant="caption" fontWeight={700}>{pauta.total_boxes} cajas</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94a3b8' }}>
                    <Typography variant="caption" fontWeight={700}>{pauta.total_skus} SKUs</Typography>
                </Box>
                {pauta.route_code && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94a3b8' }}>
                        <RouteIcon sx={{ fontSize: '0.9rem' }} />
                        <Typography variant="caption" fontFamily="monospace" fontWeight={700}>{pauta.route_code}</Typography>
                    </Box>
                )}
                {pauta.bay_code && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94a3b8' }}>
                        <BayIcon sx={{ fontSize: '0.9rem' }} />
                        <Typography variant="caption" fontWeight={700}>{pauta.bay_code}</Typography>
                    </Box>
                )}
                {inconsistencies > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#f59e0b' }}>
                        <WarningIcon sx={{ fontSize: '0.9rem' }} />
                        <Typography variant="caption" fontWeight={700}>{inconsistencies}</Typography>
                    </Box>
                )}
            </Box>

            {roleEntries.length > 0 && (
                <Box sx={{ pt: 1, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                        <TeamIcon sx={{ fontSize: '0.85rem', color: '#64748b' }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                            Asignados
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {roleEntries.map(([role, info]) => {
                            const rc = ROLE_COLORS[role] || '#78909c';
                            return (
                                <Chip
                                    key={role}
                                    size="small"
                                    icon={<PersonIcon sx={{ fontSize: '0.85rem' }} />}
                                    label={`${info.role_display}: ${info.name}`}
                                    sx={{
                                        bgcolor: alpha(rc, 0.2), color: rc,
                                        fontWeight: 600, fontSize: '0.7rem',
                                        '& .MuiChip-icon': { color: rc },
                                    }}
                                />
                            );
                        })}
                    </Box>
                </Box>
            )}
        </Box>
    );
}
