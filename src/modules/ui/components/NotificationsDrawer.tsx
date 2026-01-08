import React, { useState, useEffect } from 'react';
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
    Badge,
    useTheme,
    useMediaQuery,
    CircularProgress,
} from '@mui/material';
import DocumentIcon from '@mui/icons-material/Description';
import AlertIcon from '@mui/icons-material/Warning';
import ConfirmationIcon from '@mui/icons-material/CheckCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import {Notificacion} from "../../../interfaces/auth";
import { StandardDrawerHeader } from './StandardDrawerHeader';
import { useMarkNotificationAsReadMutation } from '../../../store/auth/notificationApi';
import { useAppSelector } from '../../../store/store';
import {
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    getNotificationPermission,
    getCurrentSubscription
} from '../../../utils/pushNotifications';

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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [markAsRead] = useMarkNotificationAsReadMutation();
    const { token } = useAppSelector((state) => state.auth);

    const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Verificar el estado de permisos y suscripción al abrir el drawer
    useEffect(() => {
        const checkSubscriptionStatus = async () => {
            if (open) {
                const permission = getNotificationPermission();
                setPushPermission(permission);

                // Verificar si hay una suscripción activa
                const subscription = await getCurrentSubscription();
                setIsSubscribed(!!subscription);

                console.log('Estado de suscripción:', {
                    permission,
                    hasSubscription: !!subscription
                });
            }
        };

        checkSubscriptionStatus();
    }, [open]);

    const handleNotificationClick = async (noti: Notificacion) => {
        // Marcar como leída si no lo está
        if (!noti.read) {
            try {
                await markAsRead(noti.id).unwrap();
            } catch (error) {
                console.error('Error al marcar notificación como leída:', error);
            }
        }
        // Navegar a la página de detalles
        navigate(`/notifications/?id=${noti.id}`);
        onClose();
    };

    const handlePushSubscription = async () => {
        if (!token) {
            toast.error('Debes iniciar sesión para suscribirte a notificaciones');
            return;
        }

        setIsSubscribing(true);

        try {
            if (isSubscribed) {
                // Desuscribirse
                console.log('Intentando desuscribirse...');
                const success = await unsubscribeFromPushNotifications(token);
                if (success) {
                    setIsSubscribed(false);
                    toast.success('Te has desuscrito de las notificaciones push');
                } else {
                    toast.error('No se pudo desuscribir. Intenta de nuevo');
                }
            } else {
                // Suscribirse
                console.log('Intentando suscribirse...');
                console.log('VAPID KEY:', import.meta.env.VITE_VAPID_PUBLIC_KEY);
                console.log('API URL:', import.meta.env.VITE_JS_APP_API_URL);

                // Primero pedir permiso si no lo tiene
                if (pushPermission !== 'granted') {
                    const permission = await Notification.requestPermission();
                    console.log('Permiso obtenido:', permission);
                    setPushPermission(permission);

                    if (permission !== 'granted') {
                        toast.error('Debes permitir las notificaciones en tu navegador');
                        return;
                    }
                }

                const subscription = await subscribeToPushNotifications(token);
                console.log('Resultado de suscripción:', subscription);

                if (subscription) {
                    setIsSubscribed(true);
                    setPushPermission('granted');
                    toast.success('¡Estás suscrito a las notificaciones push!');
                } else {
                    toast.error('No se pudo completar la suscripción. Verifica la consola para más detalles');
                }
            }
        } catch (error: any) {
            console.error('Error al gestionar suscripción push:', error);
            toast.error(error?.message || 'Ocurrió un error. Intenta de nuevo');
        } finally {
            setIsSubscribing(false);
        }
    };

    const renderNotificationsList = (notifications: Notificacion[] = []) => {
        if (!notifications.length) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 8,
                        px: 3,
                    }}
                >
                    <NotificationsNoneIcon
                        sx={{
                            fontSize: 80,
                            color: 'text.disabled',
                            mb: 2,
                            opacity: 0.5,
                        }}
                    />
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        align="center"
                        sx={{ mb: 1, fontWeight: 500 }}
                    >
                        No hay notificaciones
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ fontSize: '0.8125rem' }}
                    >
                        Te mantendremos informado cuando algo importante suceda
                    </Typography>
                </Box>
            );
        }

        return (
            <List sx={{ p: 0 }}>
                {notifications.map((noti, index) => (
                    <React.Fragment key={noti.id}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 0,
                                bgcolor: !noti.read ? 'rgba(220, 187, 32, 0.05)' : 'transparent',
                            }}
                        >
                            <CardActionArea
                                sx={{
                                    minHeight: 52,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        bgcolor: 'rgba(220, 187, 32, 0.08)',
                                    },
                                }}
                                onClick={() => handleNotificationClick(noti)}
                            >
                                <CardHeader
                                    avatar={
                                        <Badge
                                            variant="dot"
                                            color="primary"
                                            invisible={noti.read}
                                            sx={{
                                                '& .MuiBadge-badge': {
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                }
                                            }}
                                        >
                                            <Avatar
                                                aria-label="notification icon"
                                                sx={{
                                                    bgcolor: !noti.read ? 'primary.main' : 'grey.400',
                                                    width: 40,
                                                    height: 40,
                                                }}
                                            >
                                                {getIcon(noti.module, noti.type)}
                                            </Avatar>
                                        </Badge>
                                    }
                                    title={
                                        <Typography
                                            variant="body2"
                                            color="secondary"
                                            fontWeight={!noti.read ? 600 : 500}
                                            sx={{
                                                fontSize: '0.8125rem',
                                                lineHeight: 1.4,
                                            }}
                                        >
                                            {noti.title}
                                        </Typography>
                                    }
                                    subheader={
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                fontWeight={300}
                                                sx={{
                                                    fontSize: '0.8125rem',
                                                    lineHeight: 1.3,
                                                    mb: 0.5,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {noti.subtitle}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 400,
                                                }}
                                            >
                                                {formatDistanceToNow(new Date(noti.created_at), {
                                                    addSuffix: true,
                                                    locale: es,
                                                    includeSeconds: false
                                                })}
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{ py: 1.5 }}
                                />
                            </CardActionArea>
                        </Card>
                        {index < notifications.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                ))}
            </List>
        );
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose} sx={{ zIndex: 1300 }}>
            <Box
                sx={{
                    width: { xs: '100vw', sm: 400 },
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    bgcolor: 'background.default',
                }}
            >
                <StandardDrawerHeader
                    title={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>Notificaciones</span>
                            {unreadCount > 0 && (
                                <Badge
                                    badgeContent={unreadCount}
                                    color="primary"
                                    max={99}
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            height: 20,
                                            minWidth: 20,
                                        }
                                    }}
                                >
                                    <Box sx={{ width: 0 }} />
                                </Badge>
                            )}
                        </Box>
                    }
                    icon={<NotificationsIcon />}
                    onClose={onClose}
                />
                <Divider />
                <Box
                    sx={{
                        flexGrow: 1,
                        overflow: 'auto',
                        bgcolor: 'background.paper',
                    }}
                >
                    {renderNotificationsList(notifications)}
                </Box>
                <Divider />
                <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                    {/* Botón de suscripción push */}
                    <Button
                        variant={isSubscribed ? 'text' : 'outlined'}
                        color={isSubscribed ? 'success' : 'primary'}
                        fullWidth
                        size="small"
                        onClick={handlePushSubscription}
                        disabled={isSubscribing || pushPermission === 'denied'}
                        startIcon={
                            isSubscribing ? (
                                <CircularProgress size={16} />
                            ) : isSubscribed ? (
                                <NotificationsActiveIcon fontSize="small" />
                            ) : pushPermission === 'denied' ? (
                                <NotificationsOffIcon fontSize="small" />
                            ) : (
                                <NotificationsIcon fontSize="small" />
                            )
                        }
                        sx={{
                            minHeight: 36,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            textTransform: 'none',
                            mb: notifications.length > 0 ? 1 : 0,
                            justifyContent: 'flex-start',
                            px: 1.5,
                        }}
                    >
                        {isSubscribed
                            ? 'Push activas'
                            : pushPermission === 'denied'
                            ? 'Push bloqueadas'
                            : 'Activar push'}
                    </Button>

                    {/* Botón ver todas */}
                    {notifications.length > 0 && (
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="medium"
                            onClick={() => {
                                navigate('/notifications');
                                onClose();
                            }}
                            sx={{
                                minHeight: 42,
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                textTransform: 'none',
                            }}
                        >
                            Ver Todas
                        </Button>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
};

export default NotificationsDrawer;