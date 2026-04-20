import { Navigate } from 'react-router-dom';
import { Box, Typography, Button, Alert, Container } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useAppSelector } from '../../../store/store';
import {
    getDevRoleOverride, ROLE_TO_GROUP, ROLE_TO_PERMISSION, WORK_ROLE_LABEL,
    type WorkRoleCode,
} from '../utils/workRole';

type Props = {
    role: WorkRoleCode;
    children: React.ReactNode;
};

export default function WorkRoleGuard({ role, children }: Props) {
    const user = useAppSelector((s) => s.auth.user);

    if (!user) return <Navigate to="/auth/login" replace />;

    // Dev override: si el tester fijó un rol en localStorage, se respeta para pruebas.
    const devRole = getDevRoleOverride();
    if (devRole && devRole === role) return <>{children}</>;

    const isAdmin = Boolean(user.is_superuser || user.is_staff);
    const hasGroup = user.list_groups?.includes(ROLE_TO_GROUP[role]) ?? false;
    const hasPerm = user.list_permissions?.includes(ROLE_TO_PERMISSION[role]) ?? false;

    if (isAdmin || hasGroup || hasPerm) return <>{children}</>;

    return (
        <Container maxWidth="sm" sx={{ py: 6 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
                No tienes acceso a la pantalla de <b>{WORK_ROLE_LABEL[role]}</b>.
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Pídele a un administrador que te asigne al grupo <b>{ROLE_TO_GROUP[role]}</b> o
                el permiso <b>{ROLE_TO_PERMISSION[role]}</b>.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button startIcon={<BackIcon />} variant="outlined" href="/work">Volver</Button>
            </Box>
        </Container>
    );
}
