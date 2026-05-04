/**
 * Detalle de una jornada de Reempaque (vista supervisor o auditoría).
 *
 * Muestra: operario, hora inicio/fin, duración, métrica final, lista
 * completa de lotes registrados con SKU + cantidad + vencimiento.
 */
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Inventory2 as BoxIcon,
    Schedule as ClockIcon,
    Person as PersonIcon,
    TrendingUp as TrendIcon,
    EventAvailable as DateIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';

import { useGetSessionQuery } from '../services/repackApi';

const C = {
    primary:    '#7b1fa2',
    primaryBg:  'rgba(123,31,162,0.08)',
    border:     'rgba(123,31,162,0.25)',
    text:       '#1f2937',
    soft:       '#6b7280',
    success:    '#16a34a',
    warning:    '#f59e0b',
    danger:     '#dc2626',
};


export default function RepackSessionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const sessionId = Number(id);
    const { data: session, isLoading, error } = useGetSessionQuery(sessionId, { skip: !sessionId });

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error || !session) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">No se pudo cargar la jornada.</Alert>
            </Container>
        );
    }

    const statusColor = session.status === 'ACTIVE'
        ? 'warning' : session.status === 'COMPLETED' ? 'success' : 'default';

    return (
        <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'grey.100' }}>
                    <BackIcon />
                </IconButton>
                <Avatar sx={{ bgcolor: C.primary, width: 44, height: 44 }}>
                    <BoxIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                        Reempaque · Detalle de jornada #{session.id}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                        {session.personnel_name}
                    </Typography>
                </Box>
                <Chip label={session.status_display} color={statusColor} sx={{ fontWeight: 700 }} />
            </Box>

            {/* ── Stats principales ── */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <StatCard
                    icon={<DateIcon />} label="Fecha operativa"
                    value={format(new Date(session.operational_date), 'dd MMM yyyy')}
                />
                <StatCard
                    icon={<ClockIcon />} label="Inicio"
                    value={format(new Date(session.started_at), 'HH:mm:ss')}
                />
                <StatCard
                    icon={<ClockIcon />} label="Fin"
                    value={session.ended_at ? format(new Date(session.ended_at), 'HH:mm:ss') : '—'}
                />
                <StatCard
                    icon={<ClockIcon />} label="Duración"
                    value={fmtDuration(session.duration_seconds)}
                />
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <StatCard icon={<BoxIcon />} label="Total cajas"     value={String(session.total_boxes)} highlight />
                <StatCard icon={<BoxIcon />} label="Lotes"           value={String(session.entries_count)} />
                <StatCard
                    icon={<TrendIcon />}
                    label="Cajas / hora"
                    value={session.boxes_per_hour ? `${session.boxes_per_hour}` : '—'}
                    highlight
                />
                <StatCard
                    icon={<PersonIcon />}
                    label="Operario"
                    value={session.personnel_name}
                />
            </Grid>

            {/* ── Notas ── */}
            {session.notes && (
                <Card sx={{ borderRadius: 3, mb: 3 }}>
                    <CardContent>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            Notas
                        </Typography>
                        <Typography variant="body2">
                            {session.notes}
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* ── Lotes ── */}
            <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                            Lotes registrados ({session.entries?.length || 0})
                        </Typography>
                        {session.status === 'ACTIVE' && (
                            <Button
                                variant="outlined" size="small"
                                onClick={() => navigate('/work/repack')}
                                sx={{ textTransform: 'none' }}
                            >
                                Ir a la jornada
                            </Button>
                        )}
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {(session.entries?.length || 0) === 0 ? (
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Sin lotes registrados.
                            </Typography>
                        </Box>
                    ) : (
                        <Stack spacing={1}>
                            {session.entries!.map((e) => (
                                <Box
                                    key={e.id}
                                    sx={{
                                        display: 'flex', alignItems: 'center', gap: 2,
                                        p: 1.5, borderRadius: 2,
                                        bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider',
                                    }}
                                >
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="body2" fontWeight={700} noWrap>
                                            {e.product_name || '—'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            SAP: {e.material_code} · Vence: {format(new Date(e.expiration_date), 'dd MMM yyyy')}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                                        <Typography sx={{ fontWeight: 800, color: C.primary, fontFamily: 'monospace' }}>
                                            {e.box_count}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">cajas</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
}


function StatCard({
    icon, label, value, highlight,
}: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
    return (
        <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 2, height: '100%' }} elevation={highlight ? 3 : 1}>
                <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Avatar sx={{
                            bgcolor: highlight ? C.primaryBg : 'grey.100',
                            color: highlight ? C.primary : C.soft,
                            width: 36, height: 36,
                        }}>
                            {icon}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" sx={{
                                color: 'text.secondary', textTransform: 'uppercase',
                                fontWeight: 600, letterSpacing: 0.5, fontSize: '0.65rem',
                            }}>
                                {label}
                            </Typography>
                            <Typography
                                variant="h6"
                                fontWeight={800}
                                sx={{
                                    lineHeight: 1.1,
                                    color: highlight ? C.primary : C.text,
                                    fontFamily: highlight ? 'monospace' : undefined,
                                    fontSize: '1.1rem',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}
                            >
                                {value}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Grid>
    );
}


function fmtDuration(secs: number): string {
    if (secs <= 0) return '—';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
}
