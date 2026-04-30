/**
 * Viewer del PDF de un WorkstationDocument por qr_token.
 *
 * Flujo desde QR:
 *   1) Operador escanea QR con cualquier celular.
 *   2) Browser abre /wd/<qr_token>.
 *   3) Si no hay sesión Interlace, AppRouter redirige a /auth/login?next=/wd/<token>.
 *   4) Tras login, vuelve aquí, fetcheamos meta + descargamos el PDF inline.
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Container, Chip } from '@mui/material';
import { useGetDocumentMetaQuery } from '../services/workstationApi';
import { useAppSelector } from '../../../store';

const API_URL = import.meta.env.VITE_JS_APP_API_URL;

export default function WorkstationDocumentViewerPage() {
    const { token: qrToken } = useParams<{ token: string }>();
    const jwt = useAppSelector(s => s.auth.token);
    const { data: meta, isLoading, error } = useGetDocumentMetaQuery(qrToken || '', { skip: !qrToken });
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        // Fetcheamos el PDF como blob para poder embeberlo con el JWT (un <embed src=...>
        // directo no manda el header Authorization).
        let revoked: string | null = null;
        let cancelled = false;
        async function load() {
            if (!qrToken || !jwt) return;
            try {
                const resp = await fetch(`${API_URL}/api/workstation-doc/${qrToken}/file/`, {
                    headers: { Authorization: `Bearer ${jwt}` },
                });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const blob = await resp.blob();
                if (cancelled) return;
                const url = URL.createObjectURL(blob);
                revoked = url;
                setPdfUrl(url);
            } catch (e) {
                console.error('Error cargando PDF:', e);
            }
        }
        load();
        return () => {
            cancelled = true;
            if (revoked) URL.revokeObjectURL(revoked);
        };
    }, [qrToken, jwt]);

    if (!qrToken) return <Alert severity="error">Token inválido</Alert>;
    if (isLoading) return <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box>;
    if (error) return (
        <Container sx={{ py: 4 }}>
            <Alert severity="error">No se pudo cargar el documento. Puede haber sido eliminado o no tener permisos.</Alert>
        </Container>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Chip label={meta?.doc_type_display || meta?.doc_type} size="small" sx={{ bgcolor: 'background.paper' }} />
                    <Typography variant="h6" fontWeight={700}>{meta?.name}</Typography>
                </Box>
                <Typography variant="caption">
                    {meta?.distributor_center} · {meta?.role_display}
                </Typography>
            </Box>
            <Box sx={{ flex: 1, bgcolor: '#525659' }}>
                {pdfUrl ? (
                    <embed src={pdfUrl} type="application/pdf" width="100%" height="100%" />
                ) : (
                    <Box sx={{ p: 6, textAlign: 'center', color: '#fff' }}>
                        <CircularProgress sx={{ color: '#fff' }} />
                        <Typography sx={{ mt: 2 }}>Cargando PDF…</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
