import { createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import { RootState } from '..'
import { LoginResponseOk, LoginBody, DashboardResponse, DashboardQueryParams } from '../../interfaces/login';
import { DashboardCdQuery, DashboardCds } from '../../interfaces/home';
import {BaseApiResponse} from "../../interfaces/api";
import {Notificacion, NotificacionQuery} from "../../interfaces/auth";
import {refreshToken} from "./thunks.ts";

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_JS_APP_API_URL + '/api',
        prepareHeaders: (headers, {getState}) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }),
    tagTypes: ['Auth'],
    endpoints: (builder) => ({
        refreshToken: builder.query<LoginResponseOk, unknown>({
            query: ()=>{
                return (
                    {
                        url: '/auth/refresh-token/',
                        method: 'GET',
                    }
                )
            }
        }),
        login: builder.mutation<LoginResponseOk, LoginBody>({
            query: (data) => {
                return (
                    {
                        url: '/auth/login/',
                        method: 'POST',
                        body: {
                            ...data
                        }
                    }
                )
            }
        }),
        logout: builder.mutation<LoginResponseOk, unknown>({
            query: () => {
                return (
                    {
                        url: '/auth/logout/',
                        method: 'POST',
                        body: {}
                    }
                )
            }
        }),
        getdashboard: builder.query<DashboardResponse, DashboardQueryParams>({
            query: (params) => {
                return (
                    {
                        url: '/tracker/dashboard/',
                        method: 'GET',
                        params: {
                            date_after: params.start_date,
                            date_before: params.end_date
                        }
                    }
                )
            }
        }),
        getDashboardCD: builder.query<DashboardCds[], DashboardCdQuery>({
            query: (params) => {
                return (
                    {
                        url: '/dashboard/',
                        method: 'GET',
                        params: {
                            date_range: params.date_range.toString()
                        }
                    }
                )
            },
            keepUnusedDataFor: 0
        })


    })
})

export const notificationApi = createApi({
    reducerPath: 'notificacionApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_JS_APP_API_URL + '/api',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }),
    tagTypes: ['Notificacion'],
    endpoints: (builder) => ({
        getNotificaciones: builder.query<BaseApiResponse<Notificacion>, NotificacionQuery>({
            query: (params) => ({
                url: '/notificacion/',
                method: 'GET',
                params,
            }),
            onQueryStarted: (_, { dispatch }) => {
                dispatch(refreshToken());
            },
            providesTags: (result) =>
                result
                    ? [...result.results.map(({ id }) => ({ type: 'Notificacion' as const, id })), 'Notificacion']
                    : ['Notificacion'],
        }),
        getNotificacion: builder.query<Notificacion, number>({
            query: (id) => ({
                url: `/notificacion/${id}/`,
                method: 'GET',
            }),
            onQueryStarted: (_, { dispatch }) => {
                dispatch(refreshToken());
            },
            providesTags: (result) => [{ type: 'Notificacion', id: result?.id }],
        }),
    })
});






export const {
    useGetNotificacionesQuery,
    useGetNotificacionQuery,
} = notificationApi;

export const {
    useLoginMutation,
    useRefreshTokenQuery,
    useLogoutMutation,
    useGetdashboardQuery,
    useGetDashboardCDQuery
} = authApi;