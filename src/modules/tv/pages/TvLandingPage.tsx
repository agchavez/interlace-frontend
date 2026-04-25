import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import QRCode from 'qrcode.react';
import useWebSocket from 'react-use-websocket';
import {
    useCreateTvSessionMutation,
    type TvSessionPublic,
} from '../services/tvApi';
import { setTvSession, getTvToken, getTvDashboard } from '../utils/tvToken';

const WS_URL = import.meta.env.VITE_JS_APP_API_URL_WS as string;

/**
 * Pantalla que abre la TV — crea una sesión PENDING, muestra el code + QR y
 * se queda escuchando por WS a que un usuario escanée y confirme la vinculación.
 * Cuando llega el evento `session.paired`, guarda el token y navega al
 * dashboard configurado.
 */
export default function TvLandingPage() {
    const navigate = useNavigate();
    const [createSession] = useCreateTvSessionMutation();
    const [session, setSession] = useState<TvSessionPublic | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [ticker, setTicker] = useState(0); // para recalcular el countdown

    // Si ya hay token guardado, saltar al dashboard directo.
    useEffect(() => {
        if (getTvToken()) {
            const dash = (getTvDashboard() || 'WORKSTATION').toLowerCase();
            navigate(`/tv/dashboard/${dash}`, { replace: true });
        }
    }, [navigate]);

    // Crea la sesión una vez al montar.
    useEffect(() => {
        let active = true;
        createSession()
            .unwrap()
            .then((s) => { if (active) setSession(s); })
            .catch((e) => { if (active) setError(e?.data?.error || 'No se pudo crear la sesión.'); });
        return () => { active = false; };
    }, [createSession]);

    // Reloj para el contador de expiración.
    useEffect(() => {
        const id = setInterval(() => setTicker((t) => t + 1), 1000);
        return () => clearInterval(id);
    }, []);

    const wsUrl = session ? `${WS_URL}/ws/tv/${session.code}/` : null;
    const { lastMessage, readyState } = useWebSocket(wsUrl, {
        reconnectAttempts: 999,
        reconnectInterval: 3000,
        retryOnError: true,
        shouldReconnect: () => true,
    }, !!wsUrl);

    useEffect(() => {
        if (!lastMessage?.data) return;
        try {
            const msg = JSON.parse(lastMessage.data);
            if (msg.type === 'session.paired') {
                setTvSession({
                    token: msg.access_token,
                    dashboard: msg.dashboard,
                    code: session!.code,
                    label: msg.label,
                });
                navigate(`/tv/dashboard/${msg.dashboard.toLowerCase()}`, { replace: true });
            } else if (msg.type === 'session.invalid') {
                setError('La sesión expiró. Recarga la página.');
            }
        } catch {
            // ignore
        }
    }, [lastMessage, navigate, session]);

    const qrUrl = useMemo(() => {
        if (!session) return '';
        return `${window.location.origin}/tv/pair/${session.code}`;
    }, [session]);

    const expiresInSec = useMemo(() => {
        if (!session) return 0;
        return Math.max(0, Math.floor((new Date(session.expires_at).getTime() - Date.now()) / 1000));
    }, [session, ticker]);

    if (error) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f172a', color: '#e2e8f0', p: 4 }}>
                <Box sx={{ maxWidth: 400, textAlign: 'center' }}>
                    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                    <Button variant="contained" onClick={() => window.location.reload()}>Reintentar</Button>
                </Box>
            </Box>
        );
    }

    if (!session) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f172a' }}>
                <CircularProgress sx={{ color: '#38bdf8' }} size={48} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh', width: '100%',
                bgcolor: '#0f172a', color: '#e2e8f0',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                p: { xs: 3, md: 6 },
            }}
        >
            <Typography variant="h3" fontWeight={900} sx={{ mb: 1, letterSpacing: '-0.02em' }}>
                Interlace TV
            </Typography>
            <Typography variant="h6" sx={{ color: '#94a3b8', mb: 5 }}>
                Escanea el código para vincular esta pantalla
            </Typography>

            <Box sx={{ bgcolor: '#fff', p: 3, borderRadius: 3, mb: 4 }}>
                <QRCode
                    value={qrUrl}
                    size={280}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                        src: '/logo-qr.png',
                        height: 60,
                        width: 60,
                        excavate: true,
                    }}
                />
            </Box>

            <Typography variant="h4" fontWeight={800}
                sx={{ fontFamily: 'monospace', letterSpacing: 4, bgcolor: '#1e293b', px: 3, py: 1.5, borderRadius: 2, mb: 3 }}
            >
                {session.code}
            </Typography>

            <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                {readyState === 1 ? '● Conectado, esperando vinculación…' : '◌ Conectando al servidor…'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#475569', mb: 3 }}>
                Expira en {Math.floor(expiresInSec / 60)}:{String(expiresInSec % 60).padStart(2, '0')}
            </Typography>

            {/* Atajo: configurar desde esta misma pantalla (útil para testing o
                cuando el que configura es el que está frente a la TV). */}
            <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/tv/pair/${session.code}`)}
                sx={{
                    color: '#cbd5e1',
                    borderColor: '#334155',
                    '&:hover': { borderColor: '#64748b', bgcolor: 'rgba(255,255,255,0.04)' },
                }}
            >
                Configurar desde aquí
            </Button>
        </Box>
    );
}
