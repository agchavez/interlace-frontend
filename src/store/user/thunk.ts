import { AppThunk, RootState } from "..";
import backendApi from "../../config/apiConfig";
import { GetDistributionCenterResponse } from "../../interfaces/user";
import { setDistributionCenters } from "./userSlice";

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