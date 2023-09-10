import { createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

import { RootState } from '..'
import { UserResponse, UserQuerySearch, CreateUserResponse, CreateUserBody, GetDistributionCenterResponse } from '../../interfaces/user';

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_JS_APP_API_URL + '/api',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        }
    }),
    tagTypes: ['Users'],
    endpoints: (builder) => ({
        getUser: builder.query<UserResponse, UserQuerySearch>({
            query: (params) => ({
                url: `/users/`,
                method: 'GET',
                params
            })
        }),
        getAUser: builder.query<UserResponse, number>({
            query: (id) => ({
                url: `/users/${id}/`,
                method: 'GET'
            })
        }),
        insertUser: builder.mutation<CreateUserResponse, CreateUserBody>({
            query: (data) => ({
                url: `/users/`,
                method: 'POST',
                body: {...data, groups:[data.group], employee_number: data.employee_number || null} 
            }),
            invalidatesTags: (data)=> [{type: 'Users', id:data?.email}]
        }),
        patchUser: builder.mutation<CreateUserResponse, {id:number, user:Partial<CreateUserBody>}>({
            query: (user) => ({
                url: `/users/${user.id}/`,
                method: 'PATCH',
                body: {...user.user, groups:[user.user.group], employee_number: user.user.employee_number || null}
            }),
            invalidatesTags: (data)=> [{type: 'Users', id:data?.id}]
        }),
        getDistributionCenter: builder.query<GetDistributionCenterResponse[], unknown>({
            query: () => ({
                url:`/distribution-center/`,
                method: 'GET',
            })
        })
    })
})

export const { 
    useGetUserQuery,
    useGetAUserQuery,
    useInsertUserMutation,
    useGetDistributionCenterQuery,
    usePatchUserMutation,
} = userApi

