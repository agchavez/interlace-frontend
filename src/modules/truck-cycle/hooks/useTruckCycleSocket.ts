import { useEffect, useCallback } from 'react';
import useWebSocket from 'react-use-websocket';
import { useAppSelector, useAppDispatch } from '../../../store';
import { truckCycleApi } from '../services/truckCycleApi';

/**
 * Hook para recibir actualizaciones en tiempo real del Ciclo del Camión via WebSocket.
 * Al recibir un mensaje 'pauta_updated', invalida los tags de RTK Query para refetch.
 */
export function useTruckCycleSocket() {
    const dispatch = useAppDispatch();
    const { token, user, status } = useAppSelector((state) => state.auth);
    const dcId = user?.centro_distribucion;

    const wsUrl = dcId && token && status === 'authenticated'
        ? `${import.meta.env.VITE_JS_APP_API_URL_WS}/ws/truck-cycle/${dcId}/?token=${token}`
        : null;

    const { lastMessage } = useWebSocket(wsUrl, {
        reconnectAttempts: 30,
        reconnectInterval: 15000,
        retryOnError: true,
        shouldReconnect: (closeEvent) => closeEvent.code !== 1000,
        share: true,
    }, !!wsUrl);

    const handleMessage = useCallback(() => {
        if (!lastMessage?.data) return;
        try {
            const data = JSON.parse(lastMessage.data);
            if (data.type === 'pauta_updated') {
                // Invalidar tags para que RTK Query refetchee
                dispatch(truckCycleApi.util.invalidateTags(['Pautas']));
            }
        } catch {
            // Ignore malformed messages
        }
    }, [lastMessage, dispatch]);

    useEffect(() => {
        handleMessage();
    }, [handleMessage]);
}
