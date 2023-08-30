import { AxiosError } from "axios";
import { setStatus, login, logout } from ".";
import { AppThunk } from "..";
import backendApi from "../../config/apiConfig";
import { LoginResponseOk } from "../../interfaces/login";

export const checkToken = (): AppThunk => {
    return async (dispatch, ) =>{
        dispatch(setStatus('checking'));
        try {
            const token = localStorage.getItem('token');
            if (token) {
                dispatch(setStatus('authenticated'));
                return;
            }
            const resp = await backendApi.get<LoginResponseOk>(
                `/auth/refreshToken`,
                { headers: {'Authorization': `Bearer ${token}`} }
            );
            dispatch(login(resp.data)) 
        } catch (error) {
            if (error instanceof AxiosError) {
                console.log(error.response?.data)
            }
            dispatch(logout());
        }
    }
}