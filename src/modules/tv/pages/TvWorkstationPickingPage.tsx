/**
 * Dashboard "ESTACIÓN DE TRABAJO DEL OPERADOR · Picking".
 *
 * Versión UI-only (sin datos reales todavía — lo que se muestra en tablas,
 * íconos y gráficos está hardcoded como placeholder para validar el diseño).
 *
 * Layout replicando el PPT:
 *   ┌────────────────── Header naranja ──────────────────┐
 *   │ Riesgos │ Prohibiciones │ Layout │ Disparadores    │
 *   ├─────────────────────────┬──────────────────────────┤
 *   │     SIC / Pi Crítico    │    Planes de Reacción    │
 *   └─────────────────────────┴──────────────────────────┘
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Alert, Button, Grid, alpha } from '@mui/material';
import {
    Warning as HazardIcon,
    Block as BlockIcon,
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
import useWebSocket from 'react-use-websocket';
import QRCode from 'qrcode.react';
import { useGetTvWorkstationQuery, useHeartbeatMutation } from '../services/tvApi';
import { getTvToken, getTvCode, getTvLabel, clearTvSession, updateTvDashboard } from '../utils/tvToken';
import { HN_TIMEZONE, todayInHonduras } from '../../../utils/timezone';

const WS_URL = import.meta.env.VITE_JS_APP_API_URL_WS as string;

// Paleta tomada del PPT original.
const C = {
    orange:      '#f5a623',   // headers
    orangeDark:  '#d97706',
    cream:       '#fef3d6',   // fondo tarjetas
    white:       '#ffffff',
    hazardYellow:'#fbbf24',
    prohibitRed: '#dc2626',
    green:       '#22c55e',
    yellow:      '#eab308',
    red:         '#ef4444',
    text:        '#1f2937',
    textSoft:    '#6b7280',
    border:      '#e5e7eb',
};

// Datos estáticos (placeholder) — luego se conectan a backend por TV-token.
const RIESGOS = [
    { label: 'Tropiezo',           Icon: TropiezoIcon },
    { label: 'Cortadura',          Icon: CortaduraIcon },
    { label: 'Caída mismo nivel',  Icon: CaidaIcon },
    { label: 'Explosión de botellas', Icon: ExplosionIcon },
    { label: 'Resbalón',           Icon: ResbalonIcon },
    { label: 'Atropello',          Icon: AtropelloIcon },
];

const PROHIBICIONES = [
    { label: 'Ingerir alimentos',                Icon: AlimentosIcon },
    { label: 'Uso de dispositivos electrónicos', Icon: PhoneIconMUI },
    { label: 'Fumar en áreas no autorizadas',    Icon: FumarIcon },
    { label: 'Uso de Joyerías en almacén',       Icon: JoyeriaIcon },
];

const DISPARADORES = [
    { indicador: 'Productividad de picking', d5pq: 220, dra: 180 },
];

// QRs del workstation — agregar más aquí y aparecen automáticamente donde se consumen.
const QR_LINKS = {
    cinco_porque: 'https://forms.office.com/Pages/ResponsePage.aspx?id=GUvwznZ3lEq4mzdcd6j5NiDsrZ8MsghAjBKaKKCfxVpURjNCM0YxUzMyNVdHNVlHUVBFMUZQVkMwTyQlQCN0PWcu',
    // relato_anomalia: '...', // agregar cuando se tenga
    // dto: '...', sop: '...', safety: '...', opls: '...', check_5s: '...',
} as const;

// SIC/Pi Crítico: ficticio, celdas coloreadas por zona verde/amarilla/roja.
// 14 columnas × 12 filas. Zonas: top 6 rows = verde, 4 filas = amarillo, 2 = rojo.
const SIC_COLS = 14;
const SIC_ROWS = 12;
const SIC_ZONES: ('green' | 'yellow' | 'red')[] = [
    ...Array(6).fill('green'), ...Array(4).fill('yellow'), ...Array(2).fill('red'),
];

function useClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
    return now;
}

export default function TvWorkstationPickingPage() {
    const navigate = useNavigate();
    const clock = useClock();
    const token = getTvToken();
    const code = getTvCode();
    const label = getTvLabel();
    const [heartbeat] = useHeartbeatMutation();

    // Pulling de /tv/sessions/workstation/ — trae current_shift del backend,
    // calculado con la hora HN + los turnos configurados en el CD.
    const operationalDate = useMemo(() => todayInHonduras(), []);
    const { data } = useGetTvWorkstationQuery(
        { operational_date: operationalDate },
        { pollingInterval: 60_000, skip: !token },
    );
    const currentShift = data?.current_shift || null;

    // Heartbeat cada 60s para que el backend sepa que la TV sigue viva.
    useEffect(() => {
        if (!token) return;
        const id = setInterval(() => { heartbeat(); }, 60_000);
        return () => clearInterval(id);
    }, [token, heartbeat]);

    // WS para detectar revocación o cambio de dashboard.
    const wsUrl = code ? `${WS_URL}/ws/tv/${code}/` : null;
    const { lastMessage } = useWebSocket(wsUrl, {
        reconnectAttempts: 999, reconnectInterval: 3000,
        retryOnError: true, shouldReconnect: () => true,
    }, !!wsUrl);

    useEffect(() => {
        if (!lastMessage?.data) return;
        try {
            const msg = JSON.parse(lastMessage.data);
            if (msg.type === 'session.revoked') {
                clearTvSession();
                navigate('/tv', { replace: true });
            } else if (msg.type === 'session.updated') {
                if (msg.dashboard) updateTvDashboard(msg.dashboard, msg.label);
                if (msg.dashboard && msg.dashboard !== 'WORKSTATION_PICKING') {
                    navigate(`/tv/dashboard/${String(msg.dashboard).toLowerCase()}`, { replace: true });
                }
            }
        } catch { /* ignore */ }
    }, [lastMessage, navigate]);

    const hnClock = useMemo(
        () => clock.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit', timeZone: HN_TIMEZONE }),
        [clock],
    );

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

    return (
        <Box sx={{
            position: 'fixed', inset: 0,
            bgcolor: C.orange,
            color: C.text,
            p: { xs: 1.5, md: 2 },
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999,
        }}>
            {/* ─────────── Header naranja ─────────── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5, flexShrink: 0 }}>
                <Typography variant="h3" fontWeight={900} sx={{
                    color: C.white, flex: 1, textAlign: 'center', letterSpacing: '0.02em',
                    fontSize: { xs: '1.5rem', md: '2.25rem', lg: '2.75rem' },
                    textShadow: '2px 2px 4px rgba(0,0,0,0.15)',
                }}>
                    ESTACIÓN DE TRABAJO DEL OPERADOR
                </Typography>
                <Box sx={{ bgcolor: C.white, borderRadius: 1.5, px: 1.5, py: 0.75, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography fontWeight={900} sx={{ color: C.text, fontSize: '1rem', lineHeight: 1 }}>DPO</Typography>
                    <Typography sx={{ color: C.textSoft, fontSize: '0.55rem', letterSpacing: 1 }}>ES EL CAMINO</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.75, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1.5 }}>
                    <ClockIcon sx={{ color: C.white, fontSize: '1.25rem' }} />
                    <Typography fontWeight={800} sx={{ color: C.white, fontFamily: 'monospace', fontSize: '1.1rem' }}>
                        {hnClock}
                    </Typography>
                </Box>
            </Box>

            {/* ─────────── Primera fila: 3 tarjetas con misma altura ─────────── */}
            <Grid container spacing={1.5} sx={{ mb: 1.5, flexShrink: 0, alignItems: 'stretch' }}>
                <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
                    <SectionCard title="Riesgos del área" fullHeight>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                            {RIESGOS.map((r) => <HazardBadge key={r.label} label={r.label} Icon={r.Icon} />)}
                        </Box>
                    </SectionCard>
                </Grid>
                <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
                    <SectionCard title="Prohibiciones del área" fullHeight>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                            {PROHIBICIONES.map((p) => <ProhibitionBadge key={p.label} label={p.label} Icon={p.Icon} />)}
                        </Box>
                    </SectionCard>
                </Grid>
                <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
                    <SectionCard title="Disparador resolución de problemas" fullHeight>
                        <DisparadoresTable rows={DISPARADORES} />
                    </SectionCard>
                </Grid>
            </Grid>

            {/* ─────────── Segunda fila: SIC/Pi + Planes de Reacción ─────────── */}
            <Grid container spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
                <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                    <SectionCard title="SIC/Pi Crítico" fullHeight>
                        <SicPiChart
                            operationalDate={operationalDate}
                            currentShift={currentShift}
                            shiftsToday={data?.shifts_today || []}
                        />
                    </SectionCard>
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                    <SectionCard title="Planes de Reacción" fullHeight>
                        <PlanesReaccion />
                    </SectionCard>
                </Grid>
            </Grid>
        </Box>
    );
}

// ────────── Card con header naranja ──────────

function SectionCard({ title, children, fullHeight }: { title: string; children: React.ReactNode; fullHeight?: boolean }) {
    return (
        <Box sx={{
            bgcolor: C.white,
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            height: fullHeight ? '100%' : undefined,
            width: '100%',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        }}>
            <Box sx={{ bgcolor: C.orange, px: 2, py: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{
                    color: C.white, textAlign: 'center', letterSpacing: '0.01em',
                    fontSize: { xs: '1rem', md: '1.2rem', lg: '1.35rem' },
                }}>
                    {title}
                </Typography>
            </Box>
            <Box sx={{ p: 1.75, flex: 1, bgcolor: C.cream, minHeight: 0, overflow: 'auto' }}>
                {children}
            </Box>
        </Box>
    );
}

// ────────── Iconos de riesgo (triángulo amarillo con ícono negro) ──────────

function HazardBadge({ label, Icon }: { label: string; Icon: React.ElementType }) {
    return (
        <Box sx={{ textAlign: 'center', p: 0.5 }}>
            <Box sx={{
                position: 'relative', mx: 'auto',
                width: { xs: 52, md: 68, lg: 78 }, height: { xs: 52, md: 68, lg: 78 },
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <HazardIcon sx={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    color: C.hazardYellow,
                    stroke: C.text, strokeWidth: 0.5,
                }} />
                <Icon sx={{ color: C.text, fontSize: { xs: '1.35rem', md: '1.7rem', lg: '2rem' }, mt: 0.5, zIndex: 1 }} />
            </Box>
            <Typography sx={{
                fontSize: { xs: '0.75rem', md: '0.85rem', lg: '0.95rem' },
                color: C.text, fontWeight: 600, mt: 0.75, lineHeight: 1.15,
            }}>
                {label}
            </Typography>
        </Box>
    );
}

// ────────── Iconos de prohibición (círculo rojo tachado) ──────────

function ProhibitionBadge({ label, Icon }: { label: string; Icon: React.ElementType }) {
    return (
        <Box sx={{ textAlign: 'center', p: 0.5 }}>
            <Box sx={{
                position: 'relative', mx: 'auto',
                width: { xs: 52, md: 68, lg: 78 }, height: { xs: 52, md: 68, lg: 78 },
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                border: `5px solid ${C.prohibitRed}`,
                '&::after': {
                    content: '""', position: 'absolute', inset: 0, margin: 'auto',
                    width: '130%', height: '5px', background: C.prohibitRed,
                    transform: 'rotate(45deg)',
                },
            }}>
                <Icon sx={{ color: C.text, fontSize: { xs: '1.45rem', md: '1.85rem', lg: '2.15rem' } }} />
            </Box>
            <Typography sx={{
                fontSize: { xs: '0.75rem', md: '0.85rem', lg: '0.95rem' },
                color: C.text, fontWeight: 600, mt: 0.75, lineHeight: 1.15,
            }}>
                {label}
            </Typography>
        </Box>
    );
}

// ────────── Tabla Disparadores ──────────

function DisparadoresTable({ rows }: { rows: Array<{ indicador: string; d5pq: number; dra: number }> }) {
    return (
        <Box sx={{ width: '100%' }}>
            <Typography sx={{ fontSize: '0.8rem', color: C.textSoft, mb: 1, fontStyle: 'italic' }}>
                Meta: 270 Cajas/Hr — el 5 Porqué se ejecuta al bajar a 220 y el Relato de Anomalía a 180 Cajas/Hr.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 0.5, mb: 0.5 }}>
                <HeaderCell>Indicador</HeaderCell>
                <HeaderCell>Disparador 5PQ</HeaderCell>
                <HeaderCell>Disparados RA</HeaderCell>
            </Box>
            {rows.map((r, i) => (
                <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 0.5, mb: 0.5 }}>
                    <DataCell main>{r.indicador}</DataCell>
                    <DataCell>{r.d5pq}</DataCell>
                    <DataCell>{r.dra}</DataCell>
                </Box>
            ))}
            {/* Fila vacía para placeholder */}
            {[0, 1].map((i) => (
                <Box key={`empty-${i}`} sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 0.5, mb: 0.5 }}>
                    <DataCell />
                    <DataCell />
                    <DataCell />
                </Box>
            ))}
        </Box>
    );
}

function HeaderCell({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={{ bgcolor: C.orange, color: C.white, px: 1, py: 1, borderRadius: 0.5, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>{children}</Typography>
        </Box>
    );
}

function DataCell({ children, main }: { children?: React.ReactNode; main?: boolean }) {
    return (
        <Box sx={{
            bgcolor: C.cream, border: `1px solid ${alpha(C.orange, 0.3)}`,
            px: 1, py: 1.25, borderRadius: 0.5, textAlign: 'center', minHeight: 48,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Typography sx={{ fontSize: main ? '0.95rem' : '1.3rem', fontWeight: 700, color: C.text, lineHeight: 1.2 }}>
                {children || '\u00A0'}
            </Typography>
        </Box>
    );
}

// ────────── SIC/Pi Crítico (gráfico por zonas) ──────────

function SicPiChart({ operationalDate, currentShift, shiftsToday }: {
    operationalDate: string;
    currentShift: { name: string; day_of_week: string; start_time: string; end_time: string } | null;
    shiftsToday: Array<{ name: string; day_of_week: string; start_time: string; end_time: string }>;
}) {
    const fechaPretty = new Date(operationalDate + 'T00:00:00').toLocaleDateString('es-HN', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: HN_TIMEZONE,
    });

    // Fallback cuando no hay turno activo: muestra los turnos de hoy si los hay.
    let turnoPretty: string;
    if (currentShift) {
        turnoPretty = `${currentShift.name} · ${currentShift.start_time}–${currentShift.end_time}`;
    } else if (shiftsToday.length > 0) {
        turnoPretty = `Fuera de turno · hoy: ${shiftsToday.map((s) => `${s.name} ${s.start_time}-${s.end_time}`).join(', ')}`;
    } else {
        turnoPretty = 'Sin turnos configurados hoy';
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <AutoField label="Indicador" value="Productividad de picking" />
                <AutoField label="Fecha" value={fechaPretty} />
                <AutoField label="Turno" value={turnoPretty} highlight={!!currentShift} />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flex: 1, minHeight: 200 }}>
                {/* Labels de zona a la izquierda */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', width: 90 }}>
                    <Box sx={{ flex: 6, bgcolor: C.green, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0.5, px: 0.5 }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.1 }}>
                            Dentro de meta
                        </Typography>
                    </Box>
                    <Box sx={{ flex: 4, bgcolor: C.yellow, color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0.5, px: 0.5 }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.1 }}>
                            Zona de alerta · 5 Porqué
                        </Typography>
                    </Box>
                    <Box sx={{ flex: 2, bgcolor: C.red, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0.5, px: 0.5 }}>
                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.1 }}>
                            Fuera de meta · RA
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{
                    flex: 1, position: 'relative', bgcolor: '#d1d5db',
                    borderRadius: 1, p: 0.5, overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${SIC_COLS}, 1fr)`,
                    gridTemplateRows: `repeat(${SIC_ZONES.length}, 1fr)`,
                    gap: '2px',
                }}>
                    {SIC_ZONES.map((zone, row) =>
                        Array.from({ length: SIC_COLS }).map((_, col) => (
                            <Box key={`${row}-${col}`} sx={{
                                bgcolor: zone === 'green' ? C.green : zone === 'yellow' ? C.yellow : C.red,
                                border: '1px solid rgba(255,255,255,0.3)',
                            }} />
                        )),
                    )}
                </Box>
            </Box>

            <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '80px repeat(10, 1fr)', gap: 0.5 }}>
                    <Box sx={{ bgcolor: '#d1d5db', px: 0.5, py: 0.25, borderRadius: 0.5, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700 }}>Meta</Typography>
                    </Box>
                    {Array.from({ length: 10 }).map((_, i) => <EmptyMini key={`m-${i}`} />)}
                    <Box sx={{ bgcolor: '#d1d5db', px: 0.5, py: 0.25, borderRadius: 0.5, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700 }}>Real</Typography>
                    </Box>
                    {Array.from({ length: 10 }).map((_, i) => <EmptyMini key={`r-${i}`} />)}
                    <Box sx={{ bgcolor: '#d1d5db', px: 0.5, py: 0.25, borderRadius: 0.5, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700 }}>Alcance</Typography>
                    </Box>
                    {Array.from({ length: 10 }).map((_, i) => <EmptyMini key={`a-${i}`} />)}
                </Box>
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

function EmptyMini() {
    return <Box sx={{ bgcolor: C.white, border: `1px solid ${C.border}`, borderRadius: 0.25, minHeight: 18 }} />;
}

// ────────── Planes de Reacción ──────────

function PlanesReaccion() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ bgcolor: '#1e40af', color: C.white, px: 2, py: 1, borderRadius: 0.5 }}>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.02em' }}>
                    KPI: PRODUCTIVIDAD DE PICKING
                </Typography>
            </Box>

            <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, mb: 0.5 }}>
                    1. PLANES DE ACTIVACIÓN EN ZONA AMARILLA
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: C.textSoft, mb: 0.75 }}>
                    Cuando la herramienta nos muestre que la cantidad de venta está ubicada en la zona amarilla, se ejecutarán las siguientes acciones:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch' }}>
                    <Box sx={{ flex: 1, bgcolor: C.yellow, color: C.text, p: 1.25, borderRadius: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: '0.95rem', fontWeight: 800 }}>ZONA AMARILLA</Typography>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mt: 0.5 }}>
                            Reubicación de stock para picking en zona cercana
                        </Typography>
                    </Box>
                    <Box sx={{ bgcolor: C.white, border: `2px solid ${C.orangeDark}`, borderRadius: 1, p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.5, minWidth: 150 }}>
                        <QRCode
                            value={QR_LINKS.cinco_porque}
                            size={120}
                            level="H"
                            includeMargin={false}
                            imageSettings={{ src: '/logo-qr.png', height: 24, width: 24, excavate: true }}
                        />
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: C.text, textAlign: 'center', lineHeight: 1.1 }}>
                            5 PORQUÉ
                        </Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: C.textSoft, textAlign: 'center', lineHeight: 1 }}>
                            Escanea para reportar
                        </Typography>
                    </Box>
                </Box>
                <Typography sx={{ fontSize: '0.65rem', color: C.textSoft, mt: 0.75 }}>
                    <b>· Reubicación de stock para picking en zona cercana:</b> al detectarse que el armado de carga tiene un bajo rendimiento en productividad, el operador de picking solicita y el asistente de almacén coordina la reubicación del stock necesario para el picking a una zona más cercana de la zona de trabajo del operador, de tal forma que se reduzcan los tiempos de desplazamiento y mejore la productividad.
                </Typography>
            </Box>

            <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, mb: 0.5 }}>
                    2. PLANES DE ACTIVACIÓN EN ZONA ROJA
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: C.textSoft, mb: 0.75 }}>
                    Cuando la herramienta nos muestre que la cantidad de venta está ubicada en la zona roja, se ejecutarán las siguientes acciones:
                </Typography>
                <Box sx={{ bgcolor: '#991b1b', color: C.white, p: 1, borderRadius: 0.5, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 800 }}>ZONA ROJA</Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        Armado de carga en parejas
                    </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.65rem', color: C.textSoft, mt: 0.5 }}>
                    <b>· Armado de carga en parejas:</b> ante una situación crítica de baja productividad, el operador de picking solicita el apoyo al supervisor de turno para que se agilice el trabajo entre dos personas que realicen cada uno el traslado y armado de un mix de carga a la vez.
                </Typography>
            </Box>
        </Box>
    );
}
