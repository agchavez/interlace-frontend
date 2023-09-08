import { AppThunk, RootState } from "..";
import backendApi from "../../config/apiConfig";
import { GetAUserResponse, GetDistributionCenterResponse } from "../../interfaces/user";
import { setDistributionCenters, setEditingUser } from "./userSlice";

export const getDistributionCenters = (): AppThunk => {
    return async (dispatch, getState) => {
        try {
            const { auth } = getState() as RootState;
            const resp = await backendApi.get<GetDistributionCenterResponse[]>(
                import.meta.env.VITE_JS_APP_API_URL + `/api/distribution-center/`, 
                { headers: { 'Authorization': `Bearer ${auth.token}` } })
            dispatch(setDistributionCenters(resp.data))
        } catch (error) {
            console.log(error)
        }
    }
}

export const getAUser = (id:number): AppThunk => {
    return async (dispatch, getState) => {
        try {
            const { auth } = getState() as RootState;
            const resp = await backendApi.get<GetAUserResponse>(
                import.meta.env.VITE_JS_APP_API_URL + `/api/users/${id}/`, 
                { headers: { 'Authorization': `Bearer ${auth.token}` } })
            dispatch(setEditingUser({...resp.data, lastName: resp.data.last_name, firstName:resp.data.first_name, centroDistribucion:resp.data.centro_distribucion}))
        } catch (error) {
            console.log(error)
        }
    }
}