import { createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import { RootState } from '..'
import { LoginResponseOk, LoginBody } from '../../interfaces/login';
export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.BACKEND_URL + '/api',
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
                        url: '/auth/login',
                        method: 'POST',
                        body: {
                            ...data
                        }
                    }
                )
            }
        })
    })
})

export const {
    useLoginMutation,
    useRefreshTokenQuery
} = authApi;