import React, { useState, useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { toast } from 'sonner';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';
import NotificationsNoneTwoToneIcon from '@mui/icons-material/NotificationsNoneTwoTone';
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

    const { lastMessage } = useWebSocket(`${import.meta.env.VITE_JS_APP_API_URL_WS}/ws/notification/${user?.id}/`, {
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
    });

    const playSound = () => {
        const audio = new Audio('/public/alert.wav');
        audio.play();
    };


    useEffect(() => {
        if (lastMessage) {
            const data = JSON.parse(lastMessage.data);
            switch (data.type) {
                case tipos.new_notification:
                    toast('Tienes una nueva notificación', {
                        description: data.data.titulo,
                        icon: <DescriptionTwoToneIcon />,
                    });
                    setNotifications((prev) => [...prev, data.data]);
                    playSound();
                    break;
                case tipos.data_notification:
                    if (data.data.length === 0) {
                        break;
                    }
                    toast(`Tienes ${data.data.length} notificaciones sin leer`, {
                        description: 'Revisa tus notificaciones',
                        icon: <NotificationsNoneTwoToneIcon />,
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
                            icon: <DescriptionTwoToneIcon />,
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