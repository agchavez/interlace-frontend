import React, { useState, useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { toast } from 'sonner';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';
import NotificationsNoneTwoToneIcon from '@mui/icons-material/NotificationsNoneTwoTone';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Navbar from './Navbar';
import NotificationsDrawer from './NotificationsDrawer';
import { useAppSelector } from '../../../store/store';
import {Notificacion} from "../../../interfaces/auth";

enum tipos {
    new_notification = 'new_notification',
    data_notification = 'data_notification',
    notificacion_leida = 'notificacion_leida',
    notificaciones_leidas = 'notificaciones_leidas',
    chat_message= 'chat_message'
}

const NotificationManager: React.FC = () => {
    const [notifications, setNotifications] = useState<Notificacion[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { token, user } = useAppSelector(state => state.auth);
    const tokenPayload = token;
    const isAuthenticated = !!token && !!user?.id;

    const { lastMessage } = useWebSocket(
        isAuthenticated 
            ? `${import.meta.env.VITE_JS_APP_API_URL_WS}/ws/notification/${user?.id}/` 
            : null,
        {
            queryParams: { token: tokenPayload },
            onClose: () => {
                setNotifications([]);
            },
            onError: () => {
                setNotifications([]);
            },
            reconnectAttempts: 30,
            reconnectInterval: 30000,
            shouldReconnect: (closeEvent) => {
                if (closeEvent.code === 1000) {
                    return false;
                }
                return true;
            },
            retryOnError: true,
            // Only connect when authenticated
            share: isAuthenticated,
        }
    );

    const playSound = (type?: string) => {
        try {
            let soundFile = '/sounds/notification.mp3'; // sonido por defecto

            // Sonidos específicos según el tipo
            switch (type) {
                case 'ALERTA':
                case 'ERROR':
                case 'ADVERTENCIA':
                    soundFile = '/sounds/alert.mp3';
                    break;
                case 'CONFIRMACION':
                case 'APROBACION':
                    soundFile = '/sounds/success.mp3';
                    break;
                default:
                    soundFile = '/sounds/notification.mp3';
            }

            const audio = new Audio(soundFile);
            audio.volume = 0.5; // Volumen al 50%
            audio.play().catch(err => {
                console.warn('No se pudo reproducir el sonido:', err);
            });
        } catch (error) {
            console.warn('Error al reproducir sonido:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'ALERTA':
                return <NotificationsActiveIcon style={{ color: '#d32f2f' }} />;
            case 'ERROR':
                return <ErrorOutlineIcon style={{ color: '#d32f2f' }} />;
            case 'ADVERTENCIA':
                return <WarningAmberIcon style={{ color: '#ed6c02' }} />;
            case 'CONFIRMACION':
            case 'APROBACION':
                return <CheckCircleOutlineIcon style={{ color: '#2e7d32' }} />;
            case 'UBICACION':
                return <LocationOnIcon style={{ color: '#1976d2' }} />;
            case 'TAREA':
                return <AssignmentIcon style={{ color: '#9c27b0' }} />;
            case 'INFORMACION':
                return <InfoOutlinedIcon style={{ color: '#0288d1' }} />;
            default:
                return <NotificationsNoneTwoToneIcon style={{ color: '#DCBB20' }} />;
        }
    };

    const showNotificationToast = (notification: Notificacion) => {
        const notificationType = notification.type;

        // Configuración del toast según el tipo
        const toastConfig = {
            description: notification.subtitle || notification.description,
            icon: getNotificationIcon(notificationType),
            duration: notificationType === 'ALERTA' || notificationType === 'ERROR' ? 8000 : 5000,
        };

        // Mostrar toast con estilo específico
        switch (notificationType) {
            case 'ERROR':
                toast.error(notification.title, toastConfig);
                break;
            case 'ALERTA':
            case 'ADVERTENCIA':
                toast(notification.title, toastConfig);
                break;
            case 'CONFIRMACION':
            case 'APROBACION':
                toast.success(notification.title, toastConfig);
                break;
            default:
                toast(notification.title, toastConfig);
        }
    };

    useEffect(() => {
        if (lastMessage) {
            const data = JSON.parse(lastMessage.data);
            switch (data.type) {
                case tipos.new_notification:
                    const notification = data.data as Notificacion;
                    showNotificationToast(notification);
                    setNotifications((prev) => [...prev, notification]);
                    playSound(notification.type);
                    break;
                case tipos.data_notification:
                    if (data.data.length === 0) {
                        break;
                    }
                    toast(`Tienes ${data.data.length} notificaciones sin leer`, {
                        description: 'Haz clic en el ícono de notificaciones para verlas',
                        icon: <NotificationsNoneTwoToneIcon style={{ color: '#DCBB20' }} />,
                        duration: 4000,
                    });
                    setNotifications(() => data.data as Notificacion[]);
                    playSound();
                    break;
                case tipos.notificacion_leida:
                    setNotifications((prev) => prev.filter((noti) => noti.id !== data.data.id));
                    break;
                case tipos.notificaciones_leidas:
                    setNotifications([]);
                    break;
                case tipos.chat_message:
                    toast('Nuevo mensaje', {
                        description: data.message,
                        icon: <DescriptionTwoToneIcon style={{ color: '#1976d2' }} />,
                    });
                    break;
                default:
                    break;
            }
        }
    }, [lastMessage]);

    return (
        <>
            <Navbar notificationCount={notifications.length} onDrawerOpen={() => setDrawerOpen(true)} />
            <NotificationsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} notifications={notifications} />
        </>
    );
};

export default NotificationManager;