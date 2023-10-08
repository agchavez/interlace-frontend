import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


import { RootState } from '..'
import { BaseApiResponse } from '../../interfaces/api';
import { Tracker, TrackerQueryParams, TrackerProductDetail, TrackerProductDetailQueryParams, LastTrackerOutputQueryParams, LastTrackerOutputResult } from '../../interfaces/tracking';
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
                params: {
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

export const trackerPalletsApi = createApi({
    reducerPath: 'trackerPalletsApi',
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
        getTrackerPallets: builder.query<BaseApiResponse<TrackerProductDetail>, TrackerProductDetailQueryParams>({
            query: (params) => ({
                url: `/tracker-detail-product/`,
                method: 'GET',
                params: {
                    ...params
                }
            }),
            keepUnusedDataFor: 120000
        }),
    })
})

export const trackerOutputApi = createApi({
    reducerPath: 'trackerOutputApi',
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
        getLastTrackerOutput: builder.query<LastTrackerOutputResult, LastTrackerOutputQueryParams>({
            query: (params) => ({
                url: `/tracker/last-output/`,
                method: 'GET',
                params: {
                    ...params
                }
            }),
            keepUnusedDataFor: 120000
        }),
    })
})

export const {
    useGetTrackerQuery,
    useGetTrackerByIdQuery
} = trackerApi


export const {
    useGetTrackerPalletsQuery
} = trackerPalletsApi

export const {
    useGetLastTrackerOutputQuery
} = trackerOutputApi