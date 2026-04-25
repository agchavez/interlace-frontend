import { useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { useAppDispatch } from '../../../store/store';
import { personnelApi } from '../../personnel/services/personnelApi';

/**
 * Escucha el WS de truck_cycle del CD y al recibir 'metrics_updated' (o
 * 'pauta_updated', que puede afectar agregados) invalida los queries de
 * métricas para refetch instantáneo. Reemplaza el polling.
 */
export function useMetricsSocket(dcId: number | undefined | null) {
    const dispatch = useAppDispatch();
    const WS_URL = import.meta.env.VITE_JS_APP_API_URL_WS as string;
    const url = dcId ? `${WS_URL}/ws/truck-cycle/${dcId}/` : null;

    const { lastMessage } = useWebSocket(
        url,
        {
            reconnectAttempts: 999,
            reconnectInterval: 3000,
            retryOnError: true,
            shouldReconnect: () => true,
        },
        !!url,
    );

    useEffect(() => {
        if (!lastMessage?.data) return;
        try {
            const msg = JSON.parse(lastMessage.data);
            if (msg.type === 'metrics_updated' || msg.type === 'pauta_updated') {
                dispatch(
                    personnelApi.util.invalidateTags([
                        'MetricsLive', 'MetricsWorkstation', 'MetricsHourly', 'MetricSamples',
                    ]),
                );
            }
        } catch {
            /* ignore */
        }
    }, [lastMessage, dispatch]);
}
