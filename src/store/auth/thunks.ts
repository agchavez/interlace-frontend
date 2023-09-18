import { AxiosError } from "axios";
import { setStatus, login, logout, setLoadingAuth } from ".";
import { AppThunk } from "..";
import backendApi from "../../config/apiConfig";
import { LoginResponseOk } from "../../interfaces/login";
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