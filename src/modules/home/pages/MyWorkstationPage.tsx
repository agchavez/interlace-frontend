import { Box, Container, Typography, Alert, Button, Paper, Chip, useTheme, alpha, CircularProgress } from '@mui/material';
import { Workspaces as WorkspaceIcon, Badge as BadgeIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../store';
import { useGetMyProfileQuery } from '../../personnel/services/personnelApi';
import PersonnelOperationalMetrics from '../../personnel/components/PersonnelOperationalMetrics';
import { useMetricsSocket } from '../../work/hooks/useMetricsSocket';

const POSITION_LABELS: Record<string, string> = {
    PICKER: 'Picker',
    LOADER: 'Cargador',
    COUNTER: 'Contador',
    WAREHOUSE_ASSISTANT: 'Ayudante de Almacén',
    SECURITY_GUARD: 'Guardia de Seguridad',
    YARD_DRIVER: 'Chofer de Patio',
    DELIVERY_DRIVER: 'Chofer Vendedor',
    OPM: 'Operador de Montacargas',
    ADMINISTRATIVE: 'Administrativo',
    OTHER: 'Otro',
};

export default function MyWorkstationPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const user = useAppSelector((s) => s.auth.user);
    const { data: profile, isLoading } = useGetMyProfileQuery();

    // WebSocket en vivo de métricas del CD.
    useMetricsSocket(user?.centro_distribucion ?? null);

    const personnelId = user?.personnel_profile_id;
    const hasProfile = personnelId && profile && 'position_type' in profile;
    const positionType = hasProfile ? (profile as any).position_type : null;
    const positionLabel = positionType ? POSITION_LABELS[positionType] ?? positionType : null;

    const todayLabel = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2.5, sm: 3 },
                    mb: 2.5,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    color: '#fff',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <WorkspaceIcon sx={{ position: 'absolute', right: -10, bottom: -10, fontSize: 140, opacity: 0.15 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 56, height: 56, borderRadius: 2,
                        bgcolor: alpha('#fff', 0.18),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `2px solid ${alpha('#fff', 0.25)}`,
                    }}>
                        <WorkspaceIcon sx={{ fontSize: '1.8rem' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 2, fontSize: '0.7rem' }}>
                            Mi Workstation
                        </Typography>
                        <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1.1 }}>
                            Hola {user?.first_name || ''}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', mt: 0.5, textTransform: 'capitalize' }}>
                            {todayLabel}
                        </Typography>
                    </Box>
                    {positionLabel && (
                        <Chip
                            icon={<BadgeIcon sx={{ color: '#fff !important' }} />}
                            label={positionLabel}
                            sx={{
                                bgcolor: alpha('#fff', 0.2),
                                color: '#fff',
                                fontWeight: 700,
                                border: `1px solid ${alpha('#fff', 0.3)}`,
                            }}
                        />
                    )}
                </Box>
            </Paper>

            {!hasProfile && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    No tenés un perfil operativo asociado. Tu workstation personal aparecerá cuando se te asigne uno.
                    <Box sx={{ mt: 1 }}>
                        <Button size="small" onClick={() => navigate('/personnel/my-profile')}>
                            Ver mi perfil
                        </Button>
                    </Box>
                </Alert>
            )}

            {hasProfile && personnelId && (
                <PersonnelOperationalMetrics
                    personnelId={personnelId}
                    positionType={positionType}
                />
            )}

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/personnel/my-profile')}
                    startIcon={<BadgeIcon />}
                >
                    Mi perfil completo
                </Button>
                {positionType && ['PICKER', 'LOADER', 'COUNTER', 'YARD_DRIVER'].includes(positionType) && (
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/work')}
                    >
                        Ir a Operaciones
                    </Button>
                )}
            </Box>
        </Container>
    );
}
