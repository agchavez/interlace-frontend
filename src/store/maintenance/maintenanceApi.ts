import { createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

import { RootState } from '..'
import { BaseApiResponse } from '../../interfaces/api';
import { Trailer, TrailerQuerySearch, OperatorQuerySearch, Operator, Driver, DriverQuerySearch } from '../../interfaces/maintenance';
import { Product, ProductQuerySearch } from '../../interfaces/tracking';

export const maintenanceApi = createApi({
    reducerPath: 'maintenanceApi',
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
        getTrailer: builder.query<BaseApiResponse<Trailer>, TrailerQuerySearch>({
            query: (params) => ({
                url: `/trailer/`,
                method: 'GET',
                params
            }),
            keepUnusedDataFor: 120000
        }),
        getOperatorByDistributionCenter: builder.query<BaseApiResponse<Operator>, OperatorQuerySearch>({
            query: (params) => ({
                url: `/operator/`,
                method: 'GET',
                params: {
                    ...params,
                    distributor_center: params.distributorCenter
                }
            }),
            keepUnusedDataFor: 120000
        }),
        getDriver: builder.query<BaseApiResponse<Driver>, DriverQuerySearch>({
            query: (params) => ({
                url: `/driver/`,
                method: 'GET',
                params
            }),
            keepUnusedDataFor: 120000
        }),

        getProduct: builder.query<BaseApiResponse<Product>, ProductQuerySearch>({
            query: (params) => ({
                url: `/product/`,
                method: 'GET',
                params
            }),
            keepUnusedDataFor: 120000
        }),


    })
})

export const {
    useGetTrailerQuery,
    useGetOperatorByDistributionCenterQuery,
    useGetDriverQuery,
    useGetProductQuery
    
} = maintenanceApi
