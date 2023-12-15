import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


import { RootState } from '..'
import { BaseApiResponse } from '../../interfaces/api';
import { Tracker, TrackerQueryParams, TrackerProductDetail, TrackerProductDetailQueryParams, LastTrackerOutputQueryParams, NearExpirationProductResponse, NearExpirationQueryParams, LastTrackerOutputResult } from '../../interfaces/tracking';
import { format } from 'date-fns';
import { DatesT2Tracking, OutputT2, OutputT2QueryParams } from '../../interfaces/trackingT2';
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
                    ...params, productos:params.productos.map(pro => pro.id)
                }
            }),
            keepUnusedDataFor: 120000
        }),
    })
})

export const t2TrackingApi = createApi({
    reducerPath: 't2TrackingApi',
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
        getDatesT2Tracking : builder.query<BaseApiResponse<DatesT2Tracking>, {id: number, output_id: number}>({
            query: ({id, output_id}) => ({
                url: `/tracker-detail-product/available-dates/?product_id=${id}&output_id=${output_id}`,
                method: 'GET',
            }),
            keepUnusedDataFor: 120000
        }),
        getT2Tracking: builder.query<BaseApiResponse<OutputT2>, OutputT2QueryParams>({
            query: (params) => {
              const {
                status,
                ...rest
              } = params;
          
              const formattedStatus = status
                ? status.map((s) => `status=${s}`).join('&')
                : null;
          
              return ({
                url: `/output-t2/?${formattedStatus}`,
                method: 'GET',
                params: {
                  ...rest,
                },
              });
            },
            keepUnusedDataFor: 120000,
          }),
          getT2TrackingById: builder.query<OutputT2, string>({
            query: (id) => ({
                url: `/output-t2/${id}/`,
                method: 'GET',
            }),
            keepUnusedDataFor: 120000
        }),
    })
})

export const {
    useGetDatesT2TrackingQuery,
    useGetT2TrackingQuery,
    useGetT2TrackingByIdQuery
} = t2TrackingApi


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