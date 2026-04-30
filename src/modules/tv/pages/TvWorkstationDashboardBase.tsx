/**
 * Wrapper compartido por las 4 TVs de Workstation (Picking/Picker/Counter/Yard).
 *
 * Maneja: token, heartbeat, WS de pareo (revocación / cambio de dashboard) y
 * delega el render al componente de layout V2 con la config recibida del
 * endpoint TV (`workstation_config`).
 */
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert, Button, Typography } from '@mui/material';
import useWebSocket from 'react-use-websocket';
import { useGetTvWorkstationQuery, useHeartbeatMutation } from '../services/tvApi';
import { getTvToken, getTvCode, clearTvSession, updateTvDashboard } from '../utils/tvToken';
import { todayInHonduras } from '../../../utils/timezone';
import WorkstationFixedLayout from '../../workstation/components/WorkstationFixedLayout';
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

interface Props {
    role: WorkstationRole;
}

export default function TvWorkstationDashboardBase({ role }: Props) {
    const navigate = useNavigate();
    const token = getTvToken();
    const code = getTvCode();
    const [heartbeat] = useHeartbeatMutation();

    const operationalDate = useMemo(() => todayInHonduras(), []);
    const { data, refetch } = useGetTvWorkstationQuery(
        { operational_date: operationalDate },
        { pollingInterval: 60_000, skip: !token },
    );

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
                // Admin tocó el config del workstation o KpiTarget del CD —
                // refetcheamos sin esperar al polling de 60s.
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

    const ws = data?.workstation_config;
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

    return <WorkstationFixedLayout workstation={ws} mode="tv" />;
}
