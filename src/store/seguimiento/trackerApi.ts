import { createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'


import { RootState } from '..'
import { BaseApiResponse } from '../../interfaces/api';
import { Tracker, TrackerQueryParams } from '../../interfaces/tracking';
export const trackerApi = createApi({
    reducerPath: 'trackerApi',
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
    endpoints: (builder) => ({
        getTracker: builder.query<BaseApiResponse<Tracker>, TrackerQueryParams>({
            query: (params) => ({
                url: `/tracker/`,
                method: 'GET',
                params:{
                    ...params
                }
            }),
            keepUnusedDataFor: 120000
        }),
        getTrackerById: builder.query<Tracker, string>({
            query: (id) => ({
                url: `/tracker/${id}/`,
                method: 'GET',
            }),
            keepUnusedDataFor: 120000
        }),
    })
})

export const { 
    useGetTrackerQuery,
    useGetTrackerByIdQuery
} = trackerApi
