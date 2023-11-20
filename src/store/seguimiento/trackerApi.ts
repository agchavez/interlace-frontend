import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


import { RootState } from '..'
import { BaseApiResponse } from '../../interfaces/api';
import { Tracker, TrackerQueryParams, TrackerProductDetail, TrackerProductDetailQueryParams, LastTrackerOutputQueryParams, NearExpirationProductResponse, NearExpirationQueryParams, LastTrackerOutputResult } from '../../interfaces/tracking';
import { format } from 'date-fns';
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
                    ...params,
                    date_after: params.date_after ? format(new Date(params.date_after), 'yyyy-MM-dd') : null,
                    date_before: params.date_before ? format(new Date(params.date_before), 'yyyy-MM-dd') : null,
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

export const trackerDetailApi = createApi({
    reducerPath: 'trackerDetailApi',
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
        getTrackerDetail: builder.query<TrackerProductDetail, TrackerProductDetailQueryParams>({
            query: (params) => ({
                url: `/tracker-detail-product/${params.id}/`,
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

export const nearExpirationProductsApi = createApi({
    reducerPath: 'nearExpirationProductsApi',
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
        getNearExpirationProducts: builder.query<BaseApiResponse<NearExpirationProductResponse>, NearExpirationQueryParams>({
            query: (params) => ({
                url: `/report/next-win/`,
                method: 'GET',
                params: {
                    ...params,
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
    useGetTrackerDetailQuery
} = trackerDetailApi

export const {
    useGetTrackerPalletsQuery
} = trackerPalletsApi

export const {
    useGetLastTrackerOutputQuery
} = trackerOutputApi


export const {
    useGetNearExpirationProductsQuery
} = nearExpirationProductsApi