import backendApi from "../../config/apiConfig";
import { AppThunk } from "../store";
import { handleApiError } from "../../utils/error";
import { OutputT2, T2TrackingDetailBody, OutputDetailT2 } from '../../interfaces/trackingT2';
import { removeSeguimientoT2, setLoadT2Tracking, setLoadingT2TrackingDetail, setT2Trackings, updateDetailT2Tracking } from "./seguimientoSlice";
import { toast } from 'sonner';

export const getT2Trackings = (): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(setLoadT2Tracking(true));
        const { token } = getState().auth;
        const { data } = await backendApi.get<OutputT2[]>(`/output-t2/my-outputs/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });
        // en el caso de estar en un sttus de REJECTED, se debe mostraran solo los detalles que esten en estado REJECTED
        data.forEach((t2) => {
            if (t2.status === 'REJECTED') {
                t2.output_detail_t2 = t2.output_detail_t2.filter((detail) => detail.status === 'REJECTED');
            }
        });

        dispatch(setT2Trackings(data));
    } catch (error) {
        handleApiError(error);
    }finally {
        dispatch(setLoadT2Tracking(false));
    }
}

// actualizar detalles de t2 tracking detail
export const updateT2TrackingDetail = (id: number,dataBody : T2TrackingDetailBody): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(setLoadingT2TrackingDetail(true));
        const { token } = getState().auth;
        const { data} = await backendApi.post<OutputDetailT2>(`/output-detail-t2/${id}/massive-create/`, dataBody, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        dispatch(updateDetailT2Tracking(data));

    } catch (error) {
        handleApiError(error);
    } finally {
        dispatch(setLoadingT2TrackingDetail(false));
    }
}

type StatusT2 = 'CHECKED' | 'AUTHORIZED' | 'REJECTED' | 'APPLIED';
// Cambiar estado de t2 tracking seleccionado
export const changeStatusT2Tracking = (status: StatusT2, onClose: () => void
    ): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(setLoadT2Tracking(true));
        const { token } = getState().auth;
        const {
            t2TrackingActual
        } = getState().seguimiento.t2Tracking;
        if (!t2TrackingActual) return;
        // si es APPLIED llamar otro endpoint
        if (status === 'APPLIED') {
            const { data} = await backendApi.post<OutputT2>(`/output-t2/${t2TrackingActual.id}/apply/`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            dispatch(removeSeguimientoT2(data.id));
            toast.success('Movimientos de salida', {
                description: 'Se ha registrado correctamente la salida de los productos',
            });
            onClose();
            return;
        }
        const { data} = await backendApi.patch<OutputT2>(`/output-t2/${t2TrackingActual.id}/`, {status}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        // Si es status AUTHORIZED, NO ELIMINAR EL SEGUIMIENTO
        if (status !== 'AUTHORIZED') {
            dispatch(removeSeguimientoT2(data.id));
        }
        toast.success('Actualización de estado', {
            description: 'Se ha actualizado correctamente el estado del seguimiento',
        });
        onClose();
    } catch (error) {
        handleApiError(error);
    } finally {
        dispatch(setLoadT2Tracking(false));
    }
}

// actualizar statado del detalle de t2 tracking
export const updateStatusT2TrackingDetail = (
    id: number, status: 'AUTHORIZED' | 'CHECKED' | 'REJECTED', reason?: string, onClose?: () => void
): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(setLoadingT2TrackingDetail(true));
        const { token } = getState().auth;
        if (status === 'REJECTED' && !reason) {
            toast.error('Error', {
                description: 'Debe ingresar una razón para rechazar el movimiento',
            });
            return;
        }
        const { data} = await backendApi.patch<OutputDetailT2>(`/output-detail-t2/${id}/`, {
            status,
            observations: reason,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        dispatch(updateDetailT2Tracking(data));
        
        onClose && onClose();
    } catch (error) {
        handleApiError(error);
    } finally {
        dispatch(setLoadingT2TrackingDetail(false));
    }
}

