import { createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

import { RootState } from '..'
import { UserResponse, UserQuerySearch, CreateUserResponse, CreateUserBody } from '../../interfaces/user';

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
        insertUser: builder.mutation<CreateUserResponse, CreateUserBody>({
            query: (data) => ({
                url: `/users/`,
                method: 'POST',
                body: data
            }),
            invalidatesTags: (data)=> [{type: 'Users', id:data?.email}]
        }),
    })
})

export const { 
    useGetUserQuery,
    useInsertUserMutation
} = userApi

