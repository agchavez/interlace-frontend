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
    Badge,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import DocumentIcon from '@mui/icons-material/Description';
import AlertIcon from '@mui/icons-material/Warning';
import ConfirmationIcon from '@mui/icons-material/CheckCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {Notificacion} from "../../../interfaces/auth";
import { StandardDrawerHeader } from './StandardDrawerHeader';
import { useMarkNotificationAsReadMutation } from '../../../store/auth/notificationApi';

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

    const unreadCount = notifications.filter(n => !n.read).length;

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
                {notifications.length > 0 && (
                    <>
                        <Divider />
                        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
                                onClick={() => {
                                    navigate('/notifications');
                                    onClose();
                                }}
                                sx={{
                                    minHeight: 48,
                                    fontSize: '0.8125rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                }}
                            >
                                Ver Todas las Notificaciones
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        </Drawer>
    );
};

export default NotificationsDrawer;