import { AppThunk, RootState } from "..";
import backendApi from "../../config/apiConfig";
import { GetAUserResponse, GetDistributionCenterResponse } from "../../interfaces/user";
import { setDistributionCenters, setEditingUser, setLoadingUser } from "./userSlice";
import { errorApiHandler } from '../../utils/error';
import { toast } from "sonner";

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


// Restablecer contraseña de usuario
export const startResetPassword = (id:number, password:string, onCompleted:()=>void): AppThunk => {
    return async (dispatch, getState) => {
        try {
            dispatch(setLoadingUser(true))
            const { auth } = getState() as RootState;
            const resp = await backendApi.patch<GetAUserResponse>(
                import.meta.env.VITE_JS_APP_API_URL + `/api/users/${id}/`, 
                { password }, 
                { headers: { 'Authorization': `Bearer ${auth.token}` } })
            if (resp.status === 200){
                 onCompleted()
                 toast.success("Contraseña restablecida con éxito")
            }

        } catch (error) {
            errorApiHandler(error, "No se pudo restablecer la contraseña")
        }finally{
            dispatch(setLoadingUser(false))
        }
        
    }
}
