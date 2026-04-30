import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box, Container, Typography, Paper, Chip, IconButton, Grid,
    Button, CircularProgress, Alert, alpha, useTheme, useMediaQuery,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Inventory as BoxIcon,
    Category as SkuIcon,
    ViewModule as PalletIcon,
    PieChartOutline as FractionIcon,
    LocalShipping as TruckIcon,
    Route as RouteIcon,
    MeetingRoom as BayIcon,
    Schedule as TimeIcon,
    Person as PersonIcon,
    ChevronRight as GoIcon,
    Refresh as RefreshIcon,
    ReportProblem as WarningIcon,
    PhotoCamera as PhotoIcon,
    Group as TeamIcon,
} from '@mui/icons-material';
import { useGetPautasQuery } from '../services/truckCycleApi';
import { todayInHonduras } from '../../../utils/timezone';
import type { PautaListItem, PautaStatus } from '../interfaces/truckCycle';

// Descripción humana de cada etapa del ciclo — lo que está pasando ahora.
const STATUS_META: Record<string, { label: string; color: string; description: string; nextAction?: string }> = {
    PENDING_PICKING:    { label: 'Pendiente de Picking',  color: '#78909c', description: 'Transporte aún no inicia el picking. Esperando que un picker lo tome.', nextAction: 'Tomar como picker' },
    PICKING_ASSIGNED:   { label: 'Picker asignado',       color: '#29b6f6', description: 'Ya hay un picker asignado; el picking aún no empieza.', nextAction: 'Iniciar picking' },
    PICKING_IN_PROGRESS:{ label: 'Picking en progreso',   color: '#039be5', description: 'El picker está ensamblando la carga.', nextAction: 'Completar picking' },
    PICKING_DONE:       { label: 'Picking completado',    color: '#0277bd', description: 'Carga lista. Esperando que yard driver mueva el transporte a bahía.', nextAction: 'Asignar bahía / mover' },
    MOVING_TO_BAY:      { label: 'Moviendo a bahía',      color: '#ff9800', description: 'Chofer de patio llevando el transporte a la bahía asignada.', nextAction: 'Confirmar en bahía' },
    IN_BAY:             { label: 'En bahía',              color: '#ffa726', description: 'Transporte parqueado en la bahía de carga.', nextAction: 'Iniciar carga' },
    PENDING_COUNT:      { label: 'Pendiente de conteo',   color: '#ffb74d', description: 'Carga completada; esperando que un contador haga el conteo.', nextAction: 'Tomar como contador' },
    COUNTING:           { label: 'Conteo en progreso',    color: '#ff9800', description: 'El contador está verificando la carga.', nextAction: 'Completar conteo' },
    COUNTED:            { label: 'Conteo completado',     color: '#f57c00', description: 'Conteo verificado. Listo para checkout.', nextAction: 'Checkout de seguridad' },
    PENDING_CHECKOUT:   { label: 'Pendiente de checkout', color: '#ab47bc', description: 'Esperando revisión de seguridad.', nextAction: 'Checkout de seguridad' },
    CHECKOUT_SECURITY:  { label: 'Revisión seguridad',    color: '#9c27b0', description: 'Seguridad validando el transporte antes del despacho.', nextAction: 'Validar operaciones' },
    CHECKOUT_OPS:       { label: 'Revisión operaciones',  color: '#7b1fa2', description: 'Operaciones validando previo a despacho.', nextAction: 'Despachar' },
    DISPATCHED:         { label: 'Despachado',            color: '#66bb6a', description: 'Transporte despachado y en ruta.', nextAction: 'Marcar llegada al CD' },
    IN_RELOAD_QUEUE:    { label: 'Regresó al CD',         color: '#26c6da', description: 'Chofer de regreso al CD para recarga.', nextAction: 'Confirmar bahía de re-ingreso' },
    PENDING_RETURN:     { label: 'Con devolución',        color: '#ef5350', description: 'Transporte trae producto de retorno que hay que procesar.', nextAction: 'Procesar retorno' },
    RETURN_PROCESSED:   { label: 'Retorno procesado',     color: '#e53935', description: 'Retorno ya procesado. Listo para auditar.', nextAction: 'Iniciar auditoría' },
    IN_AUDIT:           { label: 'En auditoría',          color: '#fdd835', description: 'Auditando cierre del viaje.', nextAction: 'Completar auditoría' },
    AUDIT_COMPLETE:     { label: 'Auditoría completada',  color: '#c0ca33', description: 'Auditoría cerrada. Listo para cerrar la pauta.', nextAction: 'Cerrar pauta' },
    CLOSED:             { label: 'Cerrada',               color: '#9e9e9e', description: 'Pauta cerrada. No hay más acciones.' },
    CANCELLED:          { label: 'Cancelada',             color: '#d32f2f', description: 'Pauta cancelada.' },
};

function elapsedLabel(from: string | null | undefined): string {
    if (!from) return '—';
    const mins = Math.round((Date.now() - new Date(from).getTime()) / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

function StatPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.75, borderRadius: 1.5, bgcolor: alpha(color, 0.12), border: `1px solid ${alpha(color, 0.3)}` }}>
            <Box sx={{ color, display: 'flex' }}>{icon}</Box>
            <Box sx={{ lineHeight: 1 }}>
                <Typography sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', fontWeight: 700, lineHeight: 1 }}>
                    {label}
                </Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: 'text.primary', fontFeatureSettings: '"tnum"', lineHeight: 1.2 }}>
                    {value}
                </Typography>
            </Box>
        </Box>
    );
}

export default function WorkstationStatusDetailPage() {
    const { status = '' } = useParams<{ status: string }>();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const today = useMemo(() => todayInHonduras(), []);

    const meta = STATUS_META[status];

    const { data, isLoading, isFetching, refetch } = useGetPautasQuery(
        {
            operational_date_after: today,
            operational_date_before: today,
            status,
            limit: 200,
        } as any,
        { pollingInterval: 15_000 },
    );

    const pautas: PautaListItem[] = data?.results || [];

    const totalBoxes = pautas.reduce((s, p) => s + (p.total_boxes || 0), 0);
    const avgElapsedMin = pautas.length
        ? Math.round(pautas.reduce((s, p) => s + (Date.now() - new Date(p.last_status_change ?? p.created_at).getTime()) / 60000, 0) / pautas.length)
        : 0;

    if (!meta) {
        return (
            <Container maxWidth="md" sx={{ py: 6 }}>
                <Alert severity="error">Estado desconocido: {status}</Alert>
                <Button startIcon={<BackIcon />} onClick={() => navigate('/truck-cycle/workstation')} sx={{ mt: 2 }}>
                    Volver al Workstation
                </Button>
            </Container>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#0f172a' }}>
            {/* Header — color del status. */}
            <Box sx={{
                background: `linear-gradient(135deg, ${meta.color} 0%, ${alpha(meta.color, 0.75)} 100%)`,
                color: '#fff',
                px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 },
                boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
            }}>
                <Container maxWidth="xl" disableGutters>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <IconButton size="small" onClick={() => navigate('/truck-cycle/workstation')} sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.2)', '&:hover': { bgcolor: 'rgba(0,0,0,0.35)' } }}>
                            <BackIcon />
                        </IconButton>
                        <Typography variant="caption" sx={{ letterSpacing: 1.5, fontWeight: 600, opacity: 0.9 }}>
                            WORKSTATION · {today}
                        </Typography>
                        <Tooltip title="Refrescar" placement="bottom">
                            <IconButton size="small" onClick={() => refetch()} sx={{ color: '#fff', ml: 'auto' }}>
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={900} sx={{ lineHeight: 1.15, mb: 0.5 }}>
                        {meta.label}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 720 }}>
                        {meta.description}
                    </Typography>
                    {meta.nextAction && (
                        <Chip
                            size="small"
                            label={`Siguiente acción: ${meta.nextAction}`}
                            sx={{ mt: 1.5, bgcolor: 'rgba(0,0,0,0.25)', color: '#fff', fontWeight: 600 }}
                        />
                    )}
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Stats */}
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
                    <StatPill icon={<TruckIcon fontSize="small" />} label="Transportes" value={pautas.length} color={meta.color} />
                    <StatPill icon={<BoxIcon fontSize="small" />} label="Cajas" value={totalBoxes} color={theme.palette.info.main} />
                    <StatPill icon={<TimeIcon fontSize="small" />} label="Tiempo promedio" value={pautas.length ? (avgElapsedMin < 60 ? `${avgElapsedMin}m` : `${Math.floor(avgElapsedMin / 60)}h ${avgElapsedMin % 60}m`) : '—'} color={theme.palette.warning.main} />
                </Box>

                {/* Lista */}
                {isLoading && (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                )}

                {!isLoading && pautas.length === 0 && (
                    <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                        <TruckIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="h6" color="text.secondary">
                            No hay transportes en esta etapa
                        </Typography>
                    </Paper>
                )}

                {!isLoading && pautas.length > 0 && (
                    <Grid container spacing={2}>
                        {pautas.map((p) => (
                            <Grid item xs={12} md={6} lg={4} key={p.id}>
                                <PautaRow pauta={p} color={meta.color} onClick={() => navigate(`/truck-cycle/pautas/${p.id}`)} />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {isFetching && !isLoading && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'right' }}>
                        Actualizando…
                    </Typography>
                )}
            </Container>
        </Box>
    );
}

// ────────── Card de una pauta individual ──────────

const ROLE_COLORS: Record<string, string> = {
    PICKER:          '#29b6f6',
    COUNTER:         '#ff9800',
    YARD_DRIVER:     '#ffa726',
    DELIVERY_DRIVER: '#2e7d32',
    SECURITY:        '#9c27b0',
    OPERATIONS:      '#7b1fa2',
    OPM:             '#7b1fa2',
    VERIFIER:        '#f57c00',
};

function PautaRow({ pauta, color, onClick }: { pauta: PautaListItem; color: string; onClick: () => void }) {
    // Tiempo en esta etapa — usa status_started_at si el backend lo devuelve,
    // si no cae al last_status_change.
    const elapsedFrom = pauta.status_started_at ?? pauta.last_status_change ?? pauta.created_at;
    const elapsed = elapsedLabel(elapsedFrom);
    const roles = pauta.roles || {};
    const roleEntries = Object.entries(roles);
    const fractions = (pauta.assembled_fractions ?? 0);
    const inconsistencies = pauta.inconsistencies_count || 0;
    const photos = pauta.photos_count || 0;

    return (
        <Paper
            variant="outlined"
            onClick={onClick}
            sx={{
                p: 2, borderRadius: 3, cursor: 'pointer',
                borderLeft: `4px solid ${color}`,
                transition: 'box-shadow 0.15s ease, transform 0.15s ease',
                '&:hover': { boxShadow: 3, transform: 'translateY(-1px)' },
            }}
        >
            {/* Header: transport + estado de tiempo */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                            T-{pauta.transport_number}
                        </Typography>
                        {pauta.is_reload && (
                            <Chip size="small" label="Recarga" color="info" sx={{ height: 18, fontSize: '0.65rem' }} />
                        )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {pauta.truck_code || '—'} · {pauta.truck_plate}
                        {pauta.trip_number ? ` · Viaje ${pauta.trip_number}` : ''}
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Chip
                        icon={<TimeIcon sx={{ fontSize: '0.9rem' }} />}
                        label={elapsed}
                        size="small"
                        sx={{ bgcolor: alpha(color, 0.12), color, fontWeight: 700, '& .MuiChip-icon': { color } }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
                        en esta etapa
                    </Typography>
                </Box>
            </Box>

            {/* Stats (cajas/skus/tarimas/fracciones) */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5, mt: 1.5, mb: 1.5 }}>
                <MiniStat icon={<BoxIcon sx={{ fontSize: '0.9rem' }} />} label="Cajas" value={pauta.total_boxes} />
                <MiniStat icon={<SkuIcon sx={{ fontSize: '0.9rem' }} />} label="SKUs" value={pauta.total_skus} />
                <MiniStat icon={<PalletIcon sx={{ fontSize: '0.9rem' }} />} label="P. Completas" value={pauta.total_pallets} />
                <MiniStat icon={<FractionIcon sx={{ fontSize: '0.9rem' }} />} label="Fracc." value={fractions} />
            </Box>

            {/* Bloque de personas asignadas */}
            {roleEntries.length > 0 && (
                <Box sx={{ mt: 1.5, p: 1.25, borderRadius: 2, bgcolor: 'action.hover' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                        <TeamIcon sx={{ fontSize: '0.85rem', color: 'text.secondary' }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                            Asignados
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {roleEntries.map(([role, info]) => {
                            const col = ROLE_COLORS[role] || '#78909c';
                            return (
                                <Chip
                                    key={role}
                                    size="small"
                                    icon={<PersonIcon sx={{ fontSize: '0.85rem' }} />}
                                    label={`${info.role_display}: ${info.name}`}
                                    sx={{
                                        bgcolor: alpha(col, 0.12),
                                        color: col,
                                        fontWeight: 600,
                                        '& .MuiChip-icon': { color: col },
                                    }}
                                />
                            );
                        })}
                    </Box>
                </Box>
            )}

            {/* Footer: ruta, bahía, hallazgos */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mt: 1.5 }}>
                {pauta.route_code && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <RouteIcon sx={{ fontSize: '0.9rem' }} />
                        <Typography variant="caption" fontFamily="monospace" fontWeight={700}>
                            {pauta.route_code}
                        </Typography>
                    </Box>
                )}
                {pauta.bay_code && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <BayIcon sx={{ fontSize: '0.9rem' }} />
                        <Typography variant="caption" fontWeight={700}>{pauta.bay_code}</Typography>
                    </Box>
                )}
                {inconsistencies > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'warning.main' }}>
                        <WarningIcon sx={{ fontSize: '0.9rem' }} />
                        <Typography variant="caption" fontWeight={700}>{inconsistencies}</Typography>
                    </Box>
                )}
                {photos > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <PhotoIcon sx={{ fontSize: '0.9rem' }} />
                        <Typography variant="caption">{photos}</Typography>
                    </Box>
                )}
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                    <Typography variant="caption" fontWeight={700}>Ver detalle</Typography>
                    <GoIcon sx={{ fontSize: '1rem' }} />
                </Box>
            </Box>
        </Paper>
    );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.5, borderRadius: 1, bgcolor: 'action.hover' }}>
            <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
            <Box sx={{ lineHeight: 1 }}>
                <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 700, lineHeight: 1 }}>
                    {label}
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, lineHeight: 1, fontFeatureSettings: '"tnum"' }}>
                    {value}
                </Typography>
            </Box>
        </Box>
    );
}

function Tooltip({ title, children, placement }: { title: string; children: React.ReactElement; placement?: 'top' | 'bottom' | 'left' | 'right' }) {
    // Stub to avoid extra imports — MUI Tooltip would also work, but we keep it light.
    return <span title={title}>{children}</span>;
}
