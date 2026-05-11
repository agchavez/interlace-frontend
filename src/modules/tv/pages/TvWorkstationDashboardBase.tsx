/**
 * Wrapper compartido por las 4 TVs de Workstation (Picking/Picker/Counter/Yard).
 *
 * Maneja: token, heartbeat, WS de pareo (revocación / cambio de dashboard) y
 * delega el render al componente de layout V2 con la config recibida del
 * endpoint TV (`workstation_config`). Incluye la misma barra de filtros que
 * /work/<role>/workstation para que el operador en la TV pueda revisar data
 * histórica (otra fecha/turno/persona) sin salir de la pantalla.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert, Button, Typography } from '@mui/material';
import useWebSocket from 'react-use-websocket';
import { useGetTvWorkstationQuery, useHeartbeatMutation } from '../services/tvApi';
import { getTvToken, getTvCode, clearTvSession, updateTvDashboard } from '../utils/tvToken';
import { todayInHonduras } from '../../../utils/timezone';
import WorkstationFixedLayout from '../../workstation/components/WorkstationFixedLayout';
import WorkstationFiltersBar, { type PersonOption } from '../../work/components/WorkstationFiltersBar';
import { useGetRoleWorkstationQuery } from '../../personnel/services/personnelApi';
import { useMetricsSocket } from '../../work/hooks/useMetricsSocket';
import type { WorkstationRole } from '../../workstation/interfaces/workstation';

const WS_URL = import.meta.env.VITE_JS_APP_API_URL_WS as string;

/** Mapping role → dashboard string que el backend usa en TvSession.dashboard */
const ROLE_TO_DASHBOARD: Record<WorkstationRole, string> = {
    PICKING: 'WORKSTATION_PICKING',
    PICKER:  'WORKSTATION_PICKER',
    COUNTER: 'WORKSTATION_COUNTER',
    YARD:    'WORKSTATION_YARD',
    REPACK:  'WORKSTATION_REPACK',
};

/** Mapping role → role usado por /metric-samples/workstation/ */
const ROLE_TO_METRICS_ROLE: Record<WorkstationRole, 'picker' | 'counter' | 'yard' | 'repack' | null> = {
    PICKING: 'picker',
    PICKER:  'picker',
    COUNTER: 'counter',
    YARD:    'yard',
    REPACK:  'repack',
};

interface Props {
    role: WorkstationRole;
}

export default function TvWorkstationDashboardBase({ role }: Props) {
    const navigate = useNavigate();
    const token = getTvToken();
    const code = getTvCode();
    const [heartbeat] = useHeartbeatMutation();

    const today = useMemo(() => todayInHonduras(), []);

    // Estado de filtros (mismo modelo que RoleWorkstationPage).
    const [operationalDate, setOperationalDate] = useState<string>(today);
    const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<number[]>([]);
    const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);

    const { data, refetch } = useGetTvWorkstationQuery(
        { operational_date: operationalDate },
        { pollingInterval: 60_000, skip: !token },
    );

    const ws = data?.workstation_config;
    const dcId = ws?.distributor_center ?? null;
    const metricsRole = ROLE_TO_METRICS_ROLE[role];

    // Lista de personnel para el autocomplete del filtro (se carga del endpoint
    // workstation con la fecha+shift+CD actuales). Sirve para resolver nombres
    // sin filtrar la data — el filtrado por persona ocurre downstream en los
    // bloques (SicChart, etc).
    const { data: wsData } = useGetRoleWorkstationQuery(
        {
            role: metricsRole ?? 'picker',
            operational_date: operationalDate,
            ...(dcId ? { distributor_center: dcId } : {}),
            ...(selectedShiftId ? { shift_id: selectedShiftId } : {}),
        },
        { skip: !metricsRole || !dcId },
    );
    const personnelOptions: PersonOption[] = useMemo(
        () => (wsData?.personnel ?? []).map((p) => ({ id: p.id, name: p.name, code: p.code })),
        [wsData],
    );

    // WS de métricas — invalida queries del SIC/Performers/etc. al recibir
    // 'metrics_updated' o 'pauta_updated'. Reemplaza el polling.
    useMetricsSocket(dcId);

    // Heartbeat
    useEffect(() => {
        if (!token) return;
        const id = setInterval(() => { heartbeat(); }, 60_000);
        return () => clearInterval(id);
    }, [token, heartbeat]);

    // WS para revocación/cambio de dashboard
    const wsUrl = code ? `${WS_URL}/ws/tv/${code}/` : null;
    const { lastMessage } = useWebSocket(
        wsUrl,
        { reconnectAttempts: 999, reconnectInterval: 3000, retryOnError: true, shouldReconnect: () => true },
        !!wsUrl,
    );

    useEffect(() => {
        if (!lastMessage?.data) return;
        try {
            const msg = JSON.parse(lastMessage.data);
            if (msg.type === 'session.revoked') {
                clearTvSession();
                navigate('/tv', { replace: true });
            } else if (msg.type === 'session.updated') {
                if (msg.dashboard) updateTvDashboard(msg.dashboard, msg.label);
                const expected = ROLE_TO_DASHBOARD[role];
                if (msg.dashboard && msg.dashboard !== expected) {
                    navigate(`/tv/dashboard/${String(msg.dashboard).toLowerCase()}`, { replace: true });
                }
            } else if (msg.type === 'workstation.config.updated') {
                refetch();
            }
        } catch { /* ignore */ }
    }, [lastMessage, navigate, role, refetch]);

    if (!token) {
        return (
            <Box sx={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: '#0f172a', color: '#e2e8f0', p: 4,
            }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Alert severity="warning" sx={{ mb: 2 }}>Esta TV no está vinculada.</Alert>
                    <Button variant="contained" onClick={() => navigate('/tv')}>Ir a la vinculación</Button>
                </Box>
            </Box>
        );
    }

    if (!ws) {
        return (
            <Box sx={{
                position: 'fixed', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                bgcolor: '#f5a623', color: '#fff', p: 4,
            }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight={700}>Estación de trabajo sin configurar</Typography>
                    <Typography sx={{ mt: 1 }}>
                        Pedí al administrador que configure la estación para este Centro de Distribución.
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{
            position: 'fixed', inset: 0,
            bgcolor: '#f5a623',
            display: 'flex', flexDirection: 'column',
            overflow: 'auto',
        }}>
            {/* Barra de filtros encima del layout */}
            <Box sx={{ p: 1.5, flexShrink: 0 }}>
                <WorkstationFiltersBar
                    personnelOptions={personnelOptions}
                    selectedPersonnelIds={selectedPersonnelIds}
                    onPersonnelChange={setSelectedPersonnelIds}
                    date={operationalDate}
                    onDateChange={setOperationalDate}
                    dcId={dcId}
                    shiftId={selectedShiftId}
                    onShiftChange={setSelectedShiftId}
                />
            </Box>
            <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
                <WorkstationFixedLayout
                    workstation={ws}
                    mode="embedded"
                    operationalDate={operationalDate}
                    personnelId={selectedPersonnelIds.length === 1 ? selectedPersonnelIds[0] : undefined}
                    shiftId={selectedShiftId}
                />
            </Box>
        </Box>
    );
}
