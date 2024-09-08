import { AxiosError } from "axios";
import { setStatus, login, logout, setLoadingAuth, setDistributionCenters } from ".";
import { AppThunk } from "..";
import backendApi from "../../config/apiConfig";
import { LoginResponseOk, User } from "../../interfaces/login";
import { errorApiHandler } from "../../utils/error";
import { setOpenChangeDistributionCenter } from "../ui/uiSlice";
export const checkToken = (): AppThunk => {
    return async (dispatch,) => {
        dispatch(setStatus('checking'));
        try {
            const token = localStorage.getItem('token');
            const resp = await backendApi.post<LoginResponseOk>(
                `/auth/refresh-token/`,
                { 'refresh_token': token }
            );
            if (resp.status > 400) {
                dispatch(logout())
            } else {
                dispatch(login(resp.data))
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                console.log(error.response?.data)
            }
            dispatch(logout());
        }
    }
}

export const startUpdateToken = (
    onSucess: () => void,
): AppThunk =>  {
    return async (dispatch) => {
        dispatch(setLoadingAuth(true));
        try {
            const token = localStorage.getItem('token');
            const resp = await backendApi.post<LoginResponseOk>(
                `/auth/refresh-token/`,
                { 'refresh_token': token }
            );
            if (resp.status > 400) {
                dispatch(logout())
            } else {
                dispatch(login(resp.data))
                onSucess();
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                console.log(error.response?.data)
            }
            dispatch(logout());
        }
        finally {
            dispatch(setLoadingAuth(false));
        }

    }
}

// cambiar centro de distribucion asignado al usuario
export const changeDistributionCenter = (
    distributionCenter: number,
): AppThunk => {
    return async (dispatch, getState) => {
        try {
            const { auth } = getState();
            const resp = await backendApi.put<User>(
                `/users/update-profile/`,
                { centro_distribucion: distributionCenter },
                { headers: { 'Authorization': `Bearer ${auth.token}` }
            });
            dispatch(setDistributionCenters({ distributionCenter, name: resp.data.centro_distribucion_name }));
            dispatch(setOpenChangeDistributionCenter(false));
        } catch (error) {
            errorApiHandler(error, "No se pudo cambiar el centro de distribución");
        }
    }
}