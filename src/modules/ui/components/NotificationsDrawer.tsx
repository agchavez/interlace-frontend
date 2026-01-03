import React from 'react';
import {
    Drawer,
    List,
    Divider,
    Typography,
    Box,
    Button,
    Card,
    CardActionArea,
    CardHeader,
    Avatar,
} from '@mui/material';
import DocumentIcon from '@mui/icons-material/Description';
import AlertIcon from '@mui/icons-material/Warning';
import ConfirmationIcon from '@mui/icons-material/CheckCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {Notificacion} from "../../../interfaces/auth";
import { StandardDrawerHeader } from './StandardDrawerHeader';

const iconsActionsNotifi: Record<string, Record<string, JSX.Element>> = {
    DOCUMENTOS: {
        ALERTA: <AlertIcon />,
        CONFIRMACION: <ConfirmationIcon />,
    },
    // Add more modules and types as needed
};

const getIcon = (modulo: string, tipo: string) => {
    return iconsActionsNotifi[modulo]?.[tipo] || <DocumentIcon />;
};

interface NotificationsDrawerProps {
    open: boolean;
    onClose: () => void;
    notifications: Notificacion[];
}

const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ open, onClose, notifications }) => {
    const navigate = useNavigate();

    const renderNotificationsList = (notifications: Notificacion[] = []) => {
        if (!notifications.length) {
            return <Typography sx={{ p: 2 }}>No hay notificaciones</Typography>;
        }

        return (
            <List>
                {notifications.map((noti) => (
                    <React.Fragment key={noti.id}>
                        <Card elevation={0}>
                            <CardActionArea
                                sx={{
                                    bgcolor: 'background.paper',
                                    transition: 'background-color 0.3s',
                                    animation: 'none',
                                }}
                                onClick={() => {
                                    navigate(`/notifications/?id=${noti.id}`);
                                }}
                            >
                                <CardHeader
                                    avatar={
                                        <Avatar aria-label="recipe">
                                            {getIcon(noti.module, noti.type)}
                                        </Avatar>
                                    }
                                    title={<Typography variant="subtitle1" color="secondary" fontWeight={500}>{noti.title}</Typography>}
                                    subheader={
                                        <>
                                            <Typography variant="subtitle1" color="secondary" fontWeight={300}>{noti.subtitle}</Typography>
                                            <Typography variant="subtitle2" color="text.secondary" display={'flex'} justifyContent={'space-between'} fontWeight={300}>
                                                {formatDistanceToNow(new Date(noti.created_at), { addSuffix: true, locale: es, includeSeconds: false })}
                                                {!noti.read && (
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            bgcolor: 'primary.main',
                                                            borderRadius: '50%',
                                                            width: 10,
                                                            height: 10,
                                                        }}
                                                    ></Box>
                                                )}
                                            </Typography>
                                        </>
                                    }
                                />
                            </CardActionArea>
                        </Card>
                        <Divider component="li" />
                    </React.Fragment>
                ))}
            </List>
        );
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose} sx={{ zIndex: 1300 }}>
            <Box sx={{ width: { xs: 280, sm: 360 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <StandardDrawerHeader
                    title="Notificaciones"
                    icon={<NotificationsIcon />}
                    onClose={onClose}
                />
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>{renderNotificationsList(notifications)}</Box>
                <Box sx={{ p: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => navigate('/notifications')}
                    >
                        Ver Todos
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default NotificationsDrawer;