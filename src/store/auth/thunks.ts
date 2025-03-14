import { AxiosError } from "axios";
import { setStatus, login, logout, setLoadingAuth, setDistributionCenters, loginUser, veryFyToken, checkAuth } from ".";
import {AppThunk, RootState, store} from "..";
import backendApi from "../../config/apiConfig";
import {LoginResponse, LoginResponseOk, User} from "../../interfaces/login";
import { errorApiHandler } from "../../utils/error";
import { setOpenChangeDistributionCenter } from "../ui/uiSlice";
import {createAsyncThunk} from "@reduxjs/toolkit";
import masterApi from "../../config/apiConfig"
import { notificationApi } from "./authApi";

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


export const refreshToken = createAsyncThunk(
    'auth/startCheckingToken',
    async (_, { dispatch, getState }) => {
        const { auth } = getState() as RootState;
        const { user, token: accessToken } = auth;
        // Token del localstorage
        const token = localStorage.getItem('token') || '';
        try {

            if (token === '') {
                dispatch(checkAuth('unauthenticated'));
                return;
            }

            const resp = await masterApi.post<LoginResponse>(
                import.meta.env.VITE_JS_APP_API_URL + `/api/auth/refresh-token/`,
                {
                    "refresh_token": token,
                    'access_token': token !== accessToken ? accessToken : undefined
                },
                { headers: { 'Authorization': `Bearer ${auth.token}` } }
            );

            if (user === null) {
                dispatch(loginUser(resp.data));
            } else {
                dispatch(veryFyToken(resp.data));
            }
        } catch (error) {

            if (error instanceof AxiosError) {
                console.log(error.response?.data);
            }
            dispatch(logout());
        }
    }
);


// Función para actualizar manualmente leido de la notificación seleccionada
export const updateMarckViewNoti = (idNoti: number): AppThunk => {
    return async (dispatch, state) => {
        try {
            const {user} = state().auth;
            // Obtener el estado actual de la caché de Redux Toolkit Query
            const stateDoc = notificationApi.endpoints.getNotificaciones.select({
                user: user?.id || 0,
                limit: 15,
                offset: 0,
                read: false,
                search: ''
            })(store.getState());

            if (stateDoc.isSuccess) {
                // Obtener el documento actual
                const currentDocument = stateDoc.data;
                // Actualizar la parte de last_location del documento
                const newValue = currentDocument.results.map((item) => {
                    if (item.id === idNoti) {
                        return { ...item, read: true }
                    }
                    return item;
                });
                // Actualizar manualmente los datos en la caché de Redux Toolkit Query
                dispatch(notificationApi.util.updateQueryData('getNotificaciones', { user: user?.id || 0, limit: 15,
                    offset: 0,
                    read: false,
                    search: '' }, () => {
                    return {
                        ...currentDocument,
                        results: newValue
                    };
                }));
            }
            const notiall = notificationApi.endpoints.getNotificaciones.select({
                user: user?.id || 0,
                limit: 15,
                offset: 0,
                search: ''
            })(store.getState());

            if (notiall.isSuccess) {
                const newValue = notiall.data.results.map((item) => {
                    if (item.id === idNoti) {
                        return { ...item, leido: true }
                    }
                    return item;
                });
                dispatch(notificationApi.util.updateQueryData('getNotificaciones', {
                    user: user?.id || 0,
                    limit: 15,
                    offset: 0,
                    search: '' }, () => {
                    return {
                        ...notiall.data,
                        results: newValue
                    };
                }));
            }
        } catch (error) {
            errorApiHandler(error, "Error al actualizar la última nortificacion del documento");
        }
    }
}


