/**
 * Workstation operativa por rol. Replica el layout del dashboard TV
 * (/tv/dashboard/workstation_picking) pero para uso dentro de la plataforma,
 * con datos reales de /metric-samples/live/ y /metric-samples/workstation/.
 *
 * Accesible desde /work/{role}/workstation. Supervisor/MANAGING lo usan para
 * monitorear el desempeño del rol en el CD hoy.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, alpha, Chip, CircularProgress, ToggleButton, ToggleButtonGroup, Button, Drawer, IconButton, Divider } from '@mui/material';
import { Close as CloseIcon, Groups as GroupsIcon, Person as PersonIcon, Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon } from '@mui/icons-material';
import {
    Warning as HazardIcon,
    DirectionsRun as TropiezoIcon,
    ContentCut as CortaduraIcon,
    PersonOff as CaidaIcon,
    LocalBar as ExplosionIcon,
    WaterDrop as ResbalonIcon,
    LocalShipping as AtropelloIcon,
    Fastfood as AlimentosIcon,
    PhoneIphone as PhoneIconMUI,
    SmokingRooms as FumarIcon,
    Diamond as JoyeriaIcon,
    Schedule as ClockIcon,
} from '@mui/icons-material';
import QRCode from 'qrcode.react';
import { format } from 'date-fns';
import { useGetMetricsLiveQuery, useGetRoleWorkstationQuery, useGetMetricsHourlyQuery } from '../../personnel/services/personnelApi';
import { useAppSelector } from '../../../store/store';
import { HN_TIMEZONE, todayInHonduras } from '../../../utils/timezone';
import { useMetricsSocket } from '../hooks/useMetricsSocket';
import {
    useGetWorkstationsQuery,
    useGetWorkstationQuery,
} from '../../workstation/services/workstationApi';
import WorkstationFixedLayout from '../../workstation/components/WorkstationFixedLayout';
import type { SicChartBlockConfig } from '../../workstation/interfaces/workstation';

type Role = 'picker' | 'counter' | 'yard';

const C = {
    orange:       '#f5a623',
    orangeDark:   '#d97706',
    cream:        '#fef3d6',
    white:        '#ffffff',
    hazardYellow: '#fbbf24',
    prohibitRed:  '#dc2626',
    green:        '#22c55e',
    yellow:       '#eab308',
    red:          '#ef4444',
    text:         '#1f2937',
    textSoft:     '#6b7280',
    border:       '#e5e7eb',
};

const ROLE_TITLE: Record<Role, string> = {
    picker: 'Picking',
    counter: 'Conteo',
    yard: 'Chofer de Patio',
};

// KPI principal del rol (el que va al gráfico SIC/Pi).
const ROLE_PRIMARY_METRIC: Record<Role, string> = {
    picker: 'picker_pallets_per_hour',
    counter: 'counter_pallets_per_hour',
    yard: 'yard_trucks_moved',
};

const RIESGOS = [
    { label: 'Tropiezo', Icon: TropiezoIcon },
    { label: 'Cortadura', Icon: CortaduraIcon },
    { label: 'Caída mismo nivel', Icon: CaidaIcon },
    { label: 'Explosión de botellas', Icon: ExplosionIcon },
    { label: 'Resbalón', Icon: ResbalonIcon },
    { label: 'Atropello', Icon: AtropelloIcon },
];

const PROHIBICIONES = [
    { label: 'Ingerir alimentos', Icon: AlimentosIcon },
    { label: 'Uso de dispositivos electrónicos', Icon: PhoneIconMUI },
    { label: 'Fumar en áreas no autorizadas', Icon: FumarIcon },
    { label: 'Uso de Joyerías en almacén', Icon: JoyeriaIcon },
];

const QR_LINKS = {
    cinco_porque: 'https://forms.office.com/Pages/ResponsePage.aspx?id=GUvwznZ3lEq4mzdcd6j5NiDsrZ8MsghAjBKaKKCfxVpURjNCM0YxUzMyNVdHNVlHUVBFMUZQVkMwTyQlQCN0PWcu',
} as const;

const SIC_COLS = 14;
const SIC_ZONES: ('green' | 'yellow' | 'red')[] = [
    ...Array(6).fill('green'), ...Array(4).fill('yellow'), ...Array(2).fill('red'),
];

function useClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    return now;
}

type Props = { role: Role };

export default function RoleWorkstationPage({ role }: Props) {
    const navigate = useNavigate();
    const clock = useClock();
    const dcId = useAppSelector((s) => s.auth.user?.centro_distribucion);
    const operationalDate = useMemo(() => todayInHonduras(), []);

    const [view, setView] = useState<'group' | 'individual'>('group');
    const [selectedPerson, setSelectedPerson] = useState<{ id: number; name: string; code: string } | null>(null);
    const [selectedMetricCode, setSelectedMetricCode] = useState<string | null>(null);
    const [personDrawerOpen, setPersonDrawerOpen] = useState(false);
    const [autoRotate, setAutoRotate] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // WebSocket: invalida queries al recibir metrics_updated (reemplaza polling).
    useMetricsSocket(dcId);

    // Full-screen API del navegador.
    useEffect(() => {
        const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);
    const toggleFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    };

    const { data: live, isLoading: loadingLive } = useGetMetricsLiveQuery({
        operational_date: operationalDate,
        ...(dcId ? { distributor_center: dcId } : {}),
        ...(view === 'individual' && selectedPerson ? { personnel_id: selectedPerson.id } : {}),
    });
    const { data: ws, isLoading: loadingWs } = useGetRoleWorkstationQuery({
        role, operational_date: operationalDate,
        ...(dcId ? { distributor_center: dcId } : {}),
    });

    // Workstation config (riesgos, prohibiciones, planes, QRs) configurada
    // desde el CD. Mapea role → CHOICES del backend (PICKER, COUNTER, YARD).
    const wsRole = role.toUpperCase();  // 'picker' → 'PICKER'
    const { data: wsList = [] } = useGetWorkstationsQuery(
        { role: wsRole, ...(dcId ? { distributor_center: dcId } : {}), is_active: true },
        { skip: !dcId },
    );
    const configuredWsId = wsList[0]?.id;
    const { data: configuredWs } = useGetWorkstationQuery(configuredWsId!, { skip: !configuredWsId });

    // Bloques que necesitamos para auto-rotación de KPI / data live.
    const sicBlock = configuredWs?.blocks.find(b => b.type === 'SIC_CHART' && b.is_active);
    const sicConfiguredCodes = new Set(
        ((sicBlock?.config as SicChartBlockConfig | undefined)?.metric_codes) ?? [],
    );
    const sicMetricsToShow = (ws?.metrics ?? []).filter(
        m => sicConfiguredCodes.size === 0 || sicConfiguredCodes.has(m.code),
    );

    // KPI por defecto: primero del SIC configurado; si no hay config, el del rol.
    const sicDefaultCode = sicMetricsToShow[0]?.code || ROLE_PRIMARY_METRIC[role];
    const primaryCode = selectedMetricCode || sicDefaultCode;
    const primaryHeader = ws?.metrics.find((m) => m.code === primaryCode);

    // Auto-rotación cada N seg, sobre los KPIs configurados en SIC.
    // Si SicChartBlockConfig.cycle_seconds está definido, lo usa; sino 10s.
    const cycleSeconds = (sicBlock?.config as SicChartBlockConfig | undefined)?.cycle_seconds || 10;
    useEffect(() => {
        if (!autoRotate || sicMetricsToShow.length < 2) return;
        const id = setInterval(() => {
            setSelectedMetricCode((curr) => {
                const metrics = sicMetricsToShow;
                const currentIdx = curr
                    ? metrics.findIndex((m) => m.code === curr)
                    : metrics.findIndex((m) => m.code === sicDefaultCode);
                const nextIdx = (currentIdx + 1) % metrics.length;
                return metrics[nextIdx].code;
            });
        }, cycleSeconds * 1000);
        return () => clearInterval(id);
    }, [autoRotate, sicMetricsToShow, sicDefaultCode, cycleSeconds]);

    const hnClock = useMemo(
        () => clock.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit', timeZone: HN_TIMEZONE }),
        [clock],
    );

    // Series de disparadores: muestra el KPI principal + secundarios con meta/disparador.
    const disparadores = useMemo(() => {
        if (!ws?.metrics) return [];
        return ws.metrics.map((m) => ({
            indicador: m.name,
            meta: m.target,
            d5pq: m.target,
            dra: m.trigger,
            unit: m.unit,
        }));
    }, [ws]);

    return (
        <Box sx={{
            bgcolor: C.orange,
            color: C.text,
            p: { xs: 1, md: 1.25 },
            display: 'flex', flexDirection: 'column',
            height: 'calc(100vh - 60px)',
            overflow: 'hidden',
        }}>
            {/* ─────────── Header naranja ─────────── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexShrink: 0 }}>
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight={900} sx={{
                        color: C.white, letterSpacing: '0.02em',
                        fontSize: { xs: '1.1rem', md: '1.5rem' },
                        textShadow: '2px 2px 4px rgba(0,0,0,0.15)',
                    }}>
                        ESTACIÓN DE TRABAJO · {ROLE_TITLE[role].toUpperCase()}
                    </Typography>
                </Box>
                <IconButton
                    size="small"
                    onClick={toggleFullscreen}
                    sx={{ color: C.white, bgcolor: 'rgba(0,0,0,0.1)', '&:hover': { bgcolor: 'rgba(0,0,0,0.2)' } }}
                    title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                >
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
                <Box sx={{ bgcolor: C.white, borderRadius: 1, px: 1, py: 0.4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography fontWeight={900} sx={{ color: C.text, fontSize: '0.85rem', lineHeight: 1 }}>DPO</Typography>
                    <Typography sx={{ color: C.textSoft, fontSize: '0.5rem', letterSpacing: 1 }}>ES EL CAMINO</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.25 }}>
                    <Typography sx={{ color: C.white, fontSize: '0.65rem', fontWeight: 600, textTransform: 'capitalize', opacity: 0.9, lineHeight: 1 }}>
                        {new Date(operationalDate + 'T00:00:00').toLocaleDateString('es-HN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: HN_TIMEZONE })}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1 }}>
                        <ClockIcon sx={{ color: C.white, fontSize: '1rem' }} />
                        <Typography fontWeight={800} sx={{ color: C.white, fontFamily: 'monospace', fontSize: '0.95rem' }}>
                            {hnClock}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* ─────────── Barra de toggle Grupo/Individual ─────────── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexShrink: 0, flexWrap: 'wrap' }}>
                <ToggleButtonGroup
                    value={view}
                    exclusive
                    size="small"
                    onChange={(_, v) => {
                        if (!v) return;
                        setView(v);
                        if (v === 'individual' && !selectedPerson) setPersonDrawerOpen(true);
                    }}
                    sx={{ bgcolor: C.white, '& .MuiToggleButton-root.Mui-selected': { bgcolor: C.orangeDark, color: C.white, '&:hover': { bgcolor: C.orangeDark } } }}
                >
                    <ToggleButton value="group"><GroupsIcon sx={{ fontSize: 16, mr: 0.5 }} /> Grupo</ToggleButton>
                    <ToggleButton value="individual"><PersonIcon sx={{ fontSize: 16, mr: 0.5 }} /> Individual</ToggleButton>
                </ToggleButtonGroup>
                {view === 'individual' && (
                    <Button
                        variant="contained"
                        size="small"
                        onClick={() => setPersonDrawerOpen(true)}
                        sx={{ bgcolor: C.white, color: C.text, '&:hover': { bgcolor: alpha(C.white, 0.9) } }}
                    >
                        {selectedPerson ? `${selectedPerson.name.split(' ').slice(0, 2).join(' ')} · ${selectedPerson.code}` : 'Elegir persona'}
                    </Button>
                )}
                <Box sx={{ flex: 1 }} />
                <Button
                    size="small"
                    onClick={() => setAutoRotate((v) => !v)}
                    sx={{
                        bgcolor: autoRotate ? C.orangeDark : C.white,
                        color: autoRotate ? C.white : C.text,
                        '&:hover': { bgcolor: autoRotate ? C.orangeDark : alpha(C.white, 0.9) },
                        fontWeight: 700, fontSize: '0.7rem',
                    }}
                >
                    {autoRotate ? '⏯ Auto 10s · ON' : '⏯ Auto · OFF'}
                </Button>
            </Box>

            {(loadingLive || loadingWs) && (
                <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress sx={{ color: C.white }} /></Box>
            )}

            {/* ─────────── Body: mismo layout fijo que la TV (Ricardo's order). ───────────
                Si no hay workstation configurada para este (CD, rol) mostramos un hint. */}
            <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
                {configuredWs ? (
                    <WorkstationFixedLayout workstation={configuredWs} mode="embedded" />
                ) : (
                    <Box sx={{
                        height: '100%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 2,
                        color: C.text, p: 4,
                    }}>
                        <Box sx={{ textAlign: 'center', maxWidth: 480 }}>
                            <Typography variant="h6" fontWeight={700}>Estación sin configurar</Typography>
                            <Typography sx={{ mt: 1 }}>
                                Pedile al admin del CD que configure los riesgos, planes y QRs en
                                <b> Mantenimiento → Centro de Distribución → Estaciones de Trabajo</b>.
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Drawer para elegir persona (vista individual) */}
            <Drawer
                anchor="right"
                open={personDrawerOpen}
                onClose={() => setPersonDrawerOpen(false)}
                PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}
            >
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: `1px solid ${C.border}` }}>
                    <PersonIcon sx={{ color: C.orangeDark }} />
                    <Typography variant="h6" fontWeight={800} sx={{ flex: 1 }}>
                        Elegir persona
                    </Typography>
                    <IconButton size="small" onClick={() => setPersonDrawerOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        {ws?.personnel.length ?? 0} persona(s) con datos hoy en {ROLE_TITLE[role]}.
                    </Typography>
                    {(ws?.personnel ?? []).map((p: any) => (
                        <Box
                            key={p.id}
                            onClick={() => {
                                setSelectedPerson({ id: p.id, name: p.name, code: p.code });
                                setPersonDrawerOpen(false);
                            }}
                            sx={{
                                p: 1.5, mb: 1, borderRadius: 1, cursor: 'pointer',
                                border: `1px solid ${selectedPerson?.id === p.id ? C.orangeDark : C.border}`,
                                bgcolor: selectedPerson?.id === p.id ? alpha(C.orange, 0.08) : C.white,
                                '&:hover': { bgcolor: alpha(C.orange, 0.12) },
                            }}
                        >
                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: C.text }}>
                                {p.name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: C.textSoft, mb: 0.75 }}>
                                {p.code}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {ws?.metrics.map((m: any) => {
                                    const v = p.values[m.code];
                                    if (v?.value === null || v?.value === undefined) return null;
                                    const bg = v.band === 'GREEN' ? C.green : v.band === 'YELLOW' ? C.yellow : v.band === 'RED' ? C.red : '#9ca3af';
                                    return (
                                        <Box key={m.code} sx={{
                                            px: 0.75, py: 0.25, bgcolor: bg, color: v.band === 'YELLOW' ? C.text : C.white,
                                            borderRadius: 0.5, fontSize: '0.65rem', fontWeight: 700,
                                        }}>
                                            {m.name.split(' ')[0]} {v.value}{m.unit ? ` ${m.unit}` : ''}
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    ))}
                    {(!ws || ws.personnel.length === 0) && (
                        <Typography sx={{ textAlign: 'center', color: C.textSoft, py: 4 }}>
                            No hay personas con datos hoy.
                        </Typography>
                    )}
                </Box>
                <Divider />
                <Box sx={{ p: 2 }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => {
                            setSelectedPerson(null);
                            setView('group');
                            setPersonDrawerOpen(false);
                        }}
                    >
                        Ver grupo completo
                    </Button>
                </Box>
            </Drawer>
        </Box>
    );
}

const LIVE_FIELD_BY_CODE: Record<string, string> = {
    picker_pallets_per_hour:  'pallets_per_hour',
    picker_loads_assembled:   'loads_assembled',
    picker_time_per_pauta:    'avg_time_per_pauta_min',
    picker_load_error_rate:   'load_error_rate_pct',
    counter_pallets_per_hour: 'pallets_per_hour',
    counter_time_per_truck:   'avg_time_per_truck_min',
    counter_error_rate:       'error_rate_pct',
    yard_trucks_moved:        'trucks_moved',
    yard_time_park_to_bay:    'avg_park_to_bay_min',
    yard_time_bay_to_park:    'avg_bay_to_park_min',
    yard_time_total_move:     'avg_total_move_min',
};

function liveValueFor(live: any, role: Role, code: string): number | null {
    if (!live) return null;
    const section = role === 'picker' ? live.picker : role === 'counter' ? live.counter : live.yard;
    if (!section) return null;
    const key = LIVE_FIELD_BY_CODE[code];
    if (!key || !section[key]) return null;
    return section[key].value;
}

// ────────── Card con header naranja ──────────

function SectionCard({ title, children, fullHeight }: { title: string; children: React.ReactNode; fullHeight?: boolean }) {
    return (
        <Box sx={{
            bgcolor: C.white,
            borderRadius: 1.5,
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            height: fullHeight ? '100%' : undefined,
            width: '100%',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        }}>
            <Box sx={{ bgcolor: C.orange, px: 1.5, py: 0.5 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{
                    color: C.white, textAlign: 'center', letterSpacing: '0.01em',
                    fontSize: { xs: '0.8rem', md: '0.95rem' },
                }}>
                    {title}
                </Typography>
            </Box>
            <Box sx={{ p: 0.5, flex: 1, bgcolor: C.cream, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {children}
            </Box>
        </Box>
    );
}

function HazardBadge({ label, Icon }: { label: string; Icon: React.ElementType }) {
    return (
        <Box sx={{ textAlign: 'center', p: 0.25 }}>
            <Box sx={{
                position: 'relative', mx: 'auto',
                width: { xs: 36, md: 44 }, height: { xs: 36, md: 44 },
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <HazardIcon sx={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    color: C.hazardYellow, stroke: C.text, strokeWidth: 0.5,
                }} />
                <Icon sx={{ color: C.text, fontSize: { xs: '0.95rem', md: '1.2rem' }, mt: 0.25, zIndex: 1 }} />
            </Box>
            <Typography sx={{ fontSize: { xs: '0.6rem', md: '0.7rem' }, color: C.text, fontWeight: 600, mt: 0.25, lineHeight: 1.1 }}>
                {label}
            </Typography>
        </Box>
    );
}

function ProhibitionBadge({ label, Icon }: { label: string; Icon: React.ElementType }) {
    return (
        <Box sx={{ textAlign: 'center', p: 0.25 }}>
            <Box sx={{
                position: 'relative', mx: 'auto',
                width: { xs: 36, md: 44 }, height: { xs: 36, md: 44 },
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                border: `3px solid ${C.prohibitRed}`,
                '&::after': {
                    content: '""', position: 'absolute', inset: 0, margin: 'auto',
                    width: '130%', height: '3px', background: C.prohibitRed,
                    transform: 'rotate(45deg)',
                },
            }}>
                <Icon sx={{ color: C.text, fontSize: { xs: '1rem', md: '1.2rem' } }} />
            </Box>
            <Typography sx={{ fontSize: { xs: '0.6rem', md: '0.7rem' }, color: C.text, fontWeight: 600, mt: 0.25, lineHeight: 1.1 }}>
                {label}
            </Typography>
        </Box>
    );
}

function DisparadoresTable({ rows }: { rows: Array<{ indicador: string; meta: number | null; d5pq: number | null; dra: number | null; unit: string }> }) {
    return (
        <Box sx={{ width: '100%' }}>
            <Typography sx={{ fontSize: '0.75rem', color: C.textSoft, mb: 1, fontStyle: 'italic' }}>
                Valores vigentes del CD según configuración de Metas KPI.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 0.5, mb: 0.5 }}>
                <HeaderCell>Indicador</HeaderCell>
                <HeaderCell>Meta</HeaderCell>
                <HeaderCell>Disparador</HeaderCell>
            </Box>
            {rows.map((r, i) => (
                <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 0.5, mb: 0.5 }}>
                    <DataCell main>{r.indicador}</DataCell>
                    <DataCell>{r.meta != null ? `${r.meta} ${r.unit}` : '—'}</DataCell>
                    <DataCell>{r.dra != null ? `${r.dra} ${r.unit}` : '—'}</DataCell>
                </Box>
            ))}
        </Box>
    );
}

function HeaderCell({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={{ bgcolor: C.orange, color: C.white, px: 1, py: 1, borderRadius: 0.5, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{children}</Typography>
        </Box>
    );
}

function DataCell({ children, main }: { children?: React.ReactNode; main?: boolean }) {
    return (
        <Box sx={{
            bgcolor: C.cream, border: `1px solid ${alpha(C.orange, 0.3)}`,
            px: 0.75, py: 0.5, borderRadius: 0.5, textAlign: 'center', minHeight: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Typography sx={{ fontSize: main ? '0.75rem' : '0.9rem', fontWeight: 700, color: C.text, lineHeight: 1.2 }}>
                {children || ' '}
            </Typography>
        </Box>
    );
}

// Componente helper para las zonas de la izquierda con animación de "pulse"
// cuando la zona es la activa (la hora actual cayó en esa banda).
function ZoneLabel({ active, flex, bg, textColor, label }: {
    active: boolean;
    flex: number;
    bg: string;
    textColor: string;
    label: string;
}) {
    return (
        <Box sx={{
            flex, bgcolor: bg, color: textColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 0.5, px: 0.5,
            opacity: active ? 1 : 0.25,
            transform: active ? 'scale(1.03)' : 'scale(1)',
            transition: 'opacity 0.35s ease, transform 0.35s ease, box-shadow 0.35s ease',
            boxShadow: active ? `0 0 12px ${alpha(bg, 0.6)}` : 'none',
            animation: active ? 'zonePulse 2s ease-in-out infinite' : 'none',
            '@keyframes zonePulse': {
                '0%, 100%': { boxShadow: `0 0 8px ${alpha(bg, 0.5)}` },
                '50%':      { boxShadow: `0 0 18px ${alpha(bg, 0.85)}` },
            },
        }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, textAlign: 'center', lineHeight: 1.1 }}>
                {label}
            </Typography>
        </Box>
    );
}

// ────────── SIC/Pi Crítico: zonas verde/amarillo/rojo, columnas = horas ──────────

function SicPiChart({ operationalDate, metricCode, distributorCenterId, personnelId, target, trigger, unit, direction, liveValue }: {
    operationalDate: string;
    metricCode: string;
    distributorCenterId?: number;
    personnelId?: number;
    target: number | null;
    trigger: number | null;
    unit: string;
    direction: 'HIGHER_IS_BETTER' | 'LOWER_IS_BETTER' | null;
    liveValue: number | null;
}) {
    const { data: hourly } = useGetMetricsHourlyQuery(
        {
            metric_code: metricCode,
            operational_date: operationalDate,
            ...(distributorCenterId ? { distributor_center: distributorCenterId } : {}),
            ...(personnelId ? { personnel_id: personnelId } : {}),
        },
        { pollingInterval: 30_000 },
    );

    // Rango de horas del turno vigente del CD.
    const allHours = hourly?.hours ?? [];
    const shift = hourly?.shift;
    const firstHour = shift?.start_hour ?? 6;
    const endHourRaw = shift ? Math.max(shift.start_hour, shift.end_hour - 1) : 19;
    // Turnos que cruzan medianoche: end_hour viene > 23 desde backend.
    const crossesMidnight = endHourRaw >= 24;
    const visibleHours = (() => {
        if (!crossesMidnight) {
            return allHours.filter((h) => h.hour >= firstHour && h.hour <= endHourRaw);
        }
        const until = endHourRaw - 24;
        return [
            ...allHours.filter((h) => h.hour >= firstHour),
            ...allHours.filter((h) => h.hour <= until),
        ];
    })();
    const lastHour = crossesMidnight ? endHourRaw - 24 : endHourRaw;
    const cols = Math.max(1, visibleHours.length);

    // Hora actual dentro del turno → se usa para el badge grande.
    const currentHour = shift?.current_hour ?? new Date().getHours();
    const currentHourData = visibleHours.find((h) => h.hour === currentHour);
    const bigValue = currentHourData?.value ?? liveValue;
    const bigBand = currentHourData?.band ?? null;

    // Banda del valor grande (para el borde del badge y resaltar zona).
    const activeBand: 'green' | 'yellow' | 'red' | null = (() => {
        if (bigBand === 'GREEN') return 'green';
        if (bigBand === 'YELLOW') return 'yellow';
        if (bigBand === 'RED') return 'red';
        // fallback: calcular desde liveValue contra target
        if (bigValue === null || target === null) return null;
        if (direction === 'LOWER_IS_BETTER') {
            if (bigValue <= Number(target)) return 'green';
            if (trigger !== null && bigValue <= Number(trigger)) return 'yellow';
            return 'red';
        }
        if (bigValue >= Number(target)) return 'green';
        if (trigger !== null && bigValue >= Number(trigger)) return 'yellow';
        return 'red';
    })();
    const activeColor = activeBand === 'green' ? C.green : activeBand === 'yellow' ? C.yellow : activeBand === 'red' ? C.red : '#9ca3af';

    // Para cada hora, % de su valor sobre el target (define cuántas filas se
    // "llenan" en esa columna).
    const totalRows = SIC_ZONES.length; // 12
    const fillRows = (hourValue: number | null): number => {
        if (hourValue === null || target === null) return 0;
        if (direction === 'LOWER_IS_BETTER') {
            // LOWER: a menor valor, más filas verdes (se "llena" mejor)
            // valor=target → todo el verde (6 filas). valor=trigger → verde+amarillo (10).
            // valor mucho mayor → todo rojo (12).
            if (hourValue <= Number(target)) return 6;
            if (trigger !== null && hourValue <= Number(trigger)) return 10;
            return 12;
        }
        // HIGHER: si valor >= target → cumple meta (6 filas verdes). Lineal dentro del verde.
        const pctOfTarget = hourValue / Number(target);
        if (pctOfTarget >= 1) return 6;
        if (trigger !== null && hourValue >= Number(trigger)) {
            // interp entre trigger (fila 6+algo) y target (fila 6)
            return 6;
        }
        return Math.min(12, Math.max(0, Math.round(12 - pctOfTarget * 12)));
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '100%', minHeight: 0, position: 'relative', overflow: 'hidden' }}>
            {/* Badge grande con valor de la hora actual */}
            {bigValue !== null && (
                <Box
                    key={`${Number(bigValue).toFixed(1)}-${activeColor}`}
                    sx={{
                    position: 'absolute',
                    top: 0, right: 0, zIndex: 3,
                    bgcolor: C.white,
                    border: `4px solid ${activeColor}`,
                    borderRadius: 2,
                    px: 2, py: 0.75,
                    boxShadow: `0 4px 16px ${alpha(activeColor, 0.35)}`,
                    textAlign: 'center',
                    minWidth: 110,
                    animation: 'badgeIn 0.5s ease, badgePulse 3s ease-in-out infinite 0.5s',
                    '@keyframes badgeIn': {
                        '0%':   { transform: 'scale(0.7)', opacity: 0 },
                        '60%':  { transform: 'scale(1.08)' },
                        '100%': { transform: 'scale(1)', opacity: 1 },
                    },
                    '@keyframes badgePulse': {
                        '0%, 100%': { boxShadow: `0 4px 16px ${alpha(activeColor, 0.35)}` },
                        '50%':      { boxShadow: `0 4px 24px ${alpha(activeColor, 0.7)}` },
                    },
                }}>
                    <Typography sx={{ fontSize: '0.55rem', color: shift && !shift.is_active_now ? C.red : C.textSoft, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, lineHeight: 1.2 }}>
                        {shift
                            ? (shift.is_active_now
                                ? `Turno ${shift.name} · ${String(currentHour).padStart(2, '0')}:00`
                                : `Fuera de turno · ${String(currentHour).padStart(2, '0')}:00`)
                            : 'Hora actual'}
                    </Typography>
                    <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: activeColor, lineHeight: 1, fontFeatureSettings: '"tnum"', mt: 0.25 }}>
                        {Number(bigValue).toFixed(1)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: C.text, fontWeight: 700, lineHeight: 1 }}>
                        {unit}
                    </Typography>
                </Box>
            )}

            <Box sx={{ display: 'flex', gap: 0.5, flex: 1, minHeight: 0 }}>
                {/* Labels de zona — solo la zona activa (según hora actual) queda brillante */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', width: 95 }}>
                    <ZoneLabel
                        active={activeBand === 'green'}
                        flex={6}
                        bg={C.green}
                        textColor={C.white}
                        label={`Meta${target !== null ? ` ${direction === 'LOWER_IS_BETTER' ? '≤' : '≥'}${target}` : ''}`}
                    />
                    <ZoneLabel
                        active={activeBand === 'yellow'}
                        flex={4}
                        bg={C.yellow}
                        textColor={C.text}
                        label={`Alerta${trigger !== null ? ` ${direction === 'LOWER_IS_BETTER' ? '≤' : '≥'}${trigger}` : ''}`}
                    />
                    <ZoneLabel
                        active={activeBand === 'red'}
                        flex={2}
                        bg={C.red}
                        textColor={C.white}
                        label="Fuera meta"
                    />
                </Box>

                {/* Grid: columnas = horas, filas = zonas */}
                <Box sx={{
                    flex: 1, position: 'relative', bgcolor: '#d1d5db',
                    borderRadius: 1, p: 0.5, overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${totalRows}, 1fr)`,
                    gap: '2px',
                }}>
                    {SIC_ZONES.map((zone, row) =>
                        visibleHours.map((h, col) => {
                            const rows = fillRows(h.value);
                            const filled = row >= totalRows - rows;
                            const baseColor = zone === 'green' ? C.green : zone === 'yellow' ? C.yellow : C.red;
                            const isCurrent = h.hour === currentHour;
                            return (
                                <Box
                                    key={`${row}-${col}`}
                                    title={h.value !== null ? `${String(h.hour).padStart(2, '0')}:00 · ${h.value} ${unit}` : `${String(h.hour).padStart(2, '0')}:00 · sin datos`}
                                    sx={{
                                        bgcolor: baseColor,
                                        border: isCurrent
                                            ? `2px solid ${C.orangeDark}`
                                            : '1px solid rgba(255,255,255,0.35)',
                                        opacity: filled ? 0.95 : 0.22,
                                        boxShadow: isCurrent ? `inset 0 0 0 1px ${C.white}` : 'none',
                                        transition: 'opacity 0.5s ease, background-color 0.5s ease, transform 0.4s ease',
                                        transform: isCurrent && filled ? 'scale(1.02)' : 'scale(1)',
                                    }}
                                />
                            );
                        }),
                    )}

                    {/* Overlay: etiquetas con valor + % sobre cada columna */}
                    <Box sx={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        display: 'flex', gap: '2px', p: 0.5,
                    }}>
                        {visibleHours.map((h) => {
                            const rows = fillRows(h.value);
                            // Capear la posición al 82% para que la etiqueta nunca se salga
                            // del área visible cuando la columna está llena.
                            const rawBottomPct = (rows / totalRows) * 100;
                            const bottomPct = Math.min(82, rawBottomPct);
                            const insideCap = rawBottomPct > 82;
                            const pctOfTarget = target && h.value !== null
                                ? Math.round((Number(h.value) / Number(target)) * 100)
                                : null;
                            const isCurrent = h.hour === currentHour;
                            return (
                                <Box key={`lbl-${h.hour}`} sx={{ flex: 1, position: 'relative' }}>
                                    {h.value !== null && (
                                        <Box sx={{
                                            position: 'absolute',
                                            bottom: `calc(${bottomPct}% + 4px)`,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            // Si el valor está al tope, la etiqueta queda "dentro"
                                            // de la columna llena → le ponemos borde blanco sólido.
                                            outline: insideCap ? `2px solid ${C.white}` : 'none',
                                            bgcolor: isCurrent ? C.orangeDark : 'rgba(0,0,0,0.82)',
                                            color: C.white,
                                            fontSize: isCurrent ? '1.15rem' : '0.95rem',
                                            fontWeight: 900,
                                            px: 1, py: 0.4,
                                            borderRadius: 0.75,
                                            whiteSpace: 'nowrap',
                                            textAlign: 'center',
                                            lineHeight: 1.05,
                                            boxShadow: isCurrent
                                                ? `0 3px 12px ${alpha(C.orangeDark, 0.7)}`
                                                : '0 2px 5px rgba(0,0,0,0.3)',
                                            transition: 'all 0.4s ease',
                                            border: isCurrent ? `2px solid ${C.white}` : 'none',
                                        }}>
                                            {Number(h.value).toFixed(1)}
                                            {pctOfTarget !== null && (
                                                <Typography component="span" sx={{
                                                    display: 'block',
                                                    fontSize: isCurrent ? '0.8rem' : '0.7rem',
                                                    opacity: 0.9, lineHeight: 1, fontWeight: 700,
                                                }}>
                                                    {pctOfTarget}%
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>

            {/* Eje X: horas (resalta hora actual) */}
            <Box sx={{ display: 'flex', gap: '2px', mt: 0.35, pl: '99px', flexShrink: 0, height: 18 }}>
                {visibleHours.map((h) => {
                    const isCurrent = h.hour === currentHour;
                    return (
                        <Typography
                            key={h.hour}
                            sx={{
                                flex: 1, textAlign: 'center',
                                fontSize: isCurrent ? '0.75rem' : '0.55rem',
                                color: isCurrent ? C.white : (h.count > 0 ? C.text : C.textSoft),
                                bgcolor: isCurrent ? C.orangeDark : 'transparent',
                                borderRadius: 0.25,
                                fontWeight: isCurrent ? 900 : (h.count > 0 ? 800 : 600),
                                fontFamily: 'monospace',
                                lineHeight: 1.1,
                            }}
                        >
                            {String(h.hour).padStart(2, '0')}
                        </Typography>
                    );
                })}
            </Box>
        </Box>
    );
}

function AutoField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <Box sx={{ flex: '1 1 auto', minWidth: 160, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: C.text, minWidth: 65 }}>
                {label}
            </Typography>
            <Box sx={{
                flex: 1, px: 1, py: 0.5, borderRadius: 0.5,
                bgcolor: highlight ? alpha(C.orange, 0.15) : C.white,
                border: `1px solid ${highlight ? C.orange : C.border}`,
            }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: C.text, textTransform: 'capitalize' }} noWrap>
                    {value}
                </Typography>
            </Box>
        </Box>
    );
}

// ────────── Planes de Reacción ──────────

function PlanesReaccion({ kpiName }: { kpiName: string }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ bgcolor: '#1e40af', color: C.white, px: 2, py: 1, borderRadius: 0.5 }}>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    KPI: {kpiName}
                </Typography>
            </Box>

            <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, mb: 0.5 }}>
                    1. ZONA AMARILLA (alerta)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box sx={{ flex: 1, bgcolor: C.yellow, color: C.text, p: 1.25, borderRadius: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>
                            Ejecutar 5 Porqué
                        </Typography>
                    </Box>
                    <Box sx={{ bgcolor: C.white, border: `2px solid ${C.orangeDark}`, borderRadius: 1, p: 0.75, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.25, minWidth: 120 }}>
                        <QRCode value={QR_LINKS.cinco_porque} size={88} level="H" includeMargin={false} />
                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: C.text }}>5 PORQUÉ</Typography>
                    </Box>
                </Box>
            </Box>

            <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, mb: 0.5 }}>
                    2. ZONA ROJA (crítica)
                </Typography>
                <Box sx={{ bgcolor: '#991b1b', color: C.white, p: 1, borderRadius: 0.5, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 800 }}>RELATO DE ANOMALÍA</Typography>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                        Escalar a supervisor · apoyo en parejas
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

// ────────── Hint cuando la estación no está configurada ──────────

function ConfigHint() {
    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 60,
            color: C.textSoft, p: 1, textAlign: 'center',
        }}>
            <Typography sx={{ fontSize: '0.78rem', fontStyle: 'italic', lineHeight: 1.3 }}>
                Sin configurar · pedí al admin del CD que configure esta estación
                en Mantenimiento → Centros de Distribución → Estaciones de Trabajo.
            </Typography>
        </Box>
    );
}

