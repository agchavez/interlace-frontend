import { createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import { RootState } from '..'
import { LoginResponseOk, LoginBody, DashboardResponse, DashboardQueryParams } from '../../interfaces/login';
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

    })
})

export const {
    useLoginMutation,
    useRefreshTokenQuery,
    useLogoutMutation,
    useGetdashboardQuery
} = authApi;