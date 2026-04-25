/**
 * Workstation por rol en modo TV. Reusa <RoleWorkstationPage> y agrega:
 * - heartbeat al backend para que la TV se vea "viva" en /tv/sessions.
 * - WS al pairing-channel: si el admin cambia el dashboard o revoca la TV,
 *   se navega/limpia automáticamente.
 *
 * Rutas:
 *   /tv/dashboard/workstation_picker   role=picker
 *   /tv/dashboard/workstation_counter  role=counter
 *   /tv/dashboard/workstation_yard     role=yard
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert, Button } from '@mui/material';
import useWebSocket from 'react-use-websocket';
import { useHeartbeatMutation } from '../services/tvApi';
import { getTvToken, getTvCode, clearTvSession, updateTvDashboard } from '../utils/tvToken';
import RoleWorkstationPage from '../../work/pages/RoleWorkstationPage';

const WS_URL = import.meta.env.VITE_JS_APP_API_URL_WS as string;

type Props = { role: 'picker' | 'counter' | 'yard' };

export default function TvRoleWorkstationPage({ role }: Props) {
    const navigate = useNavigate();
    const token = getTvToken();
    const code = getTvCode();
    const [heartbeat] = useHeartbeatMutation();

    useEffect(() => {
        if (!token) return;
        const id = setInterval(() => { heartbeat(); }, 60_000);
        return () => clearInterval(id);
    }, [token, heartbeat]);

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
                const target = String(msg.dashboard || '').toLowerCase();
                const expected = `workstation_${role}`;
                if (target && target !== expected) {
                    navigate(`/tv/dashboard/${target}`, { replace: true });
                }
            }
        } catch { /* ignore */ }
    }, [lastMessage, navigate, role]);

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

    // RoleWorkstationPage está pensado para uso dentro del shell autenticado de
    // la app (que es lo que hace la TV cuando el browser tiene sesión).
    return <RoleWorkstationPage role={role} />;
}
