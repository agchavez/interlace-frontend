import { useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardActionArea,
    CircularProgress,
    Alert,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Inventory as PickerIcon,
    ContentPasteSearch as CounterIcon,
    Security as SecurityIcon,
    Engineering as OpsIcon,
    MeetingRoom as YardIcon,
    LocalShipping as VendorIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../../store/store';
import { useGetMyProfileQuery } from '../../personnel/services/personnelApi';
import { GROUP_TO_ROLE, WORK_ROLE_TO_PATH } from '../utils/workRole';
import { useDevRoleOverride } from '../utils/useDevRoleOverride';

const ROLE_CARDS: Array<{ code: string; label: string; path: string; icon: React.ReactNode; color: string; enabled: boolean }> = [
    { code: 'PICKER',       label: 'Picker',            path: '/work/picker',   icon: <PickerIcon />,   color: '#1976d2', enabled: true },
    { code: 'COUNTER',      label: 'Contador',          path: '/work/counter',  icon: <CounterIcon />,  color: '#0288d1', enabled: true },
    { code: 'SECURITY',     label: 'Seguridad',         path: '/work/security', icon: <SecurityIcon />, color: '#9c27b0', enabled: true },
    { code: 'OPS',          label: 'Operaciones',       path: '/work/ops',      icon: <OpsIcon />,      color: '#6a1b9a', enabled: true },
    { code: 'YARD_DRIVER',  label: 'Chofer de Patio',   path: '/work/yard',     icon: <YardIcon />,     color: '#ed6c02', enabled: true },
    { code: 'VENDOR',       label: 'Chofer Vendedor',   path: '/work/vendor',   icon: <VendorIcon />,   color: '#2e7d32', enabled: true },
];

// Mapeo position_type del personnel → path del módulo work.
const POSITION_TYPE_TO_PATH: Record<string, string> = {
    PICKER: '/work/picker',
    LOADER: '/work/picker', // temporal: LOADER se considera picker hasta que se reclasifiquen
    COUNTER: '/work/counter',
    SECURITY_GUARD: '/work/security',
    YARD_DRIVER: '/work/yard',
    DELIVERY_DRIVER: '/work/vendor',
    WAREHOUSE_ASSISTANT: '/work/counter', // ayudantes por defecto al conteo
};

export default function WorkHome() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const user = useAppSelector((s) => s.auth.user);
    const isAdmin = Boolean(user?.is_superuser || user?.is_staff);
    const devRole = useDevRoleOverride();

    const { data: profile, isLoading } = useGetMyProfileQuery();

    const positionType = useMemo(() => {
        if (profile && 'position_type' in profile) return (profile as any).position_type as string;
        return undefined;
    }, [profile]);

    // 1) Dev override: redirige al rol seleccionado.
    if (devRole) {
        return <Navigate to={WORK_ROLE_TO_PATH[devRole]} replace />;
    }

    // 2) Usuario en un grupo de /work/*: redirige a su pantalla.
    const workGroup = (user?.list_groups || []).find((g) => g in GROUP_TO_ROLE);
    if (workGroup) {
        return <Navigate to={WORK_ROLE_TO_PATH[GROUP_TO_ROLE[workGroup]]} replace />;
    }

    // 3) Fallback: position_type del personnel profile.
    if (!isAdmin && positionType && POSITION_TYPE_TO_PATH[positionType]) {
        return <Navigate to={POSITION_TYPE_TO_PATH[positionType]} replace />;
    }

    if (isLoading) {
        return (
            <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 3 }}>
            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} gutterBottom>
                Operaciones
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {isAdmin
                    ? 'Selecciona el rol cuya pantalla quieres simular.'
                    : 'No detectamos tu rol operativo. Elige una pantalla:'}
            </Typography>

            {!positionType && !isAdmin && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Tu usuario no tiene un perfil operativo asociado. Contacta a tu supervisor.
                </Alert>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                {ROLE_CARDS.map((role) => (
                    <Card
                        key={role.code}
                        variant="outlined"
                        sx={{
                            opacity: role.enabled ? 1 : 0.5,
                            pointerEvents: role.enabled ? 'auto' : 'none',
                        }}
                    >
                        <CardActionArea onClick={() => navigate(role.path)} sx={{ p: 2, textAlign: 'center' }}>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    mx: 'auto',
                                    mb: 1,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: role.color,
                                    color: '#fff',
                                }}
                            >
                                {role.icon}
                            </Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                                {role.label}
                            </Typography>
                            {!role.enabled && (
                                <Typography variant="caption" color="text.disabled">
                                    (próximamente)
                                </Typography>
                            )}
                        </CardActionArea>
                    </Card>
                ))}
            </Box>

            {isAdmin && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Button variant="text" onClick={() => navigate('/truck-cycle/operations')}>
                        Volver a Operaciones (admin)
                    </Button>
                </Box>
            )}
        </Container>
    );
}
