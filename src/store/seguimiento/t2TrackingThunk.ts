import backendApi from "../../config/apiConfig";
import { AppThunk } from "../store";
import { handleApiError } from "../../utils/error";
import { OutputT2 } from '../../interfaces/trackingT2';
import { setT2Trackings } from "./seguimientoSlice";
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
