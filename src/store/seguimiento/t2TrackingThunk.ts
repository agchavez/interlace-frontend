import backendApi from "../../config/apiConfig";
import { AppThunk } from "../store";
import { handleApiError } from "../../utils/error";
import { OutputT2, T2TrackingDetailBody, OutputDetailT2 } from '../../interfaces/trackingT2';
import { setLoadingT2TrackingDetail, setT2Trackings, updateDetailT2Tracking } from "./seguimientoSlice";
import { BaseaAPIResponse } from '../../interfaces/maintenance';


export const getT2Trackings = (): AppThunk => async (dispatch, getState) => {
    try {
        const { token } = getState().auth;
        const { data } = await backendApi.get<BaseaAPIResponse<OutputT2>>(`/output-t2/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });
        dispatch(setT2Trackings(data.results));
    } catch (error) {
        handleApiError(error);
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
