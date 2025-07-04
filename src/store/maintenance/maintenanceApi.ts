import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { RootState } from "..";
import { BaseApiResponse } from "../../interfaces/api";
import {
  Trailer,
  TrailerQuerySearch,
  OperatorQuerySearch,
  Operator,
  Driver,
  DriverQuerySearch,
  LocationType,
  LocationTypeQuerySearch,
  Transporter,
  TransporterQuerySearch,
  ProductPeriodQueryParams,
  Period,
  Route,
  RouteQuerySearch,
  CreateLocationBody,
  DistributorCenter, DistributorCenterQueryParams, CountryType, CountryQueryParams,
  PeriodQueryParams,
} from "../../interfaces/maintenance";
import { Product, ProductQuerySearch } from "../../interfaces/tracking";
import { LotType, LotTypeQuerySearch } from '../../interfaces/maintenance';

export const maintenanceApi = createApi({
  reducerPath: "maintenanceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_JS_APP_API_URL + "/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },

  }),
  tagTypes: ["Location", "Period"],
  endpoints: (builder) => ({
    getTrailer: builder.query<BaseApiResponse<Trailer>, TrailerQuerySearch>({
      query: (params) => ({
        url: `/trailer/`,
        method: "GET",
        params: {
          ...params,
          id: params.id ? params.id : undefined,
        },
      }),
      keepUnusedDataFor: 120000,
    }),
    registerTrailer: builder.mutation<Trailer, string>({
      query: (body) => ({
        url: `/trailer/`,
        method: "POST",
        body: {
          code: body,
        },
      }),
    }),
    getTransporter: builder.query<
      BaseApiResponse<Transporter>,
      TransporterQuerySearch
    >({
      query: (params) => ({
        url: `/transporter/`,
        method: "GET",
        params: {
          ...params,
          id: params.id ? params.id : undefined,
        },
      }),
      keepUnusedDataFor: 120000,
    }),
    getOperatorByDistributionCenter: builder.query<
      BaseApiResponse<Operator>,
      OperatorQuerySearch
    >({
      query: (params) => ({
        url: `/operator/`,
        method: "GET",
        params: {
          ...params,
          distributor_center: params.distributorCenter,
        },
      }),
      keepUnusedDataFor: 120000,
    }),
    getDriver: builder.query<BaseApiResponse<Driver>, DriverQuerySearch>({
      query: (params) => ({
        url: `/driver/`,
        method: "GET",
        params,
      }),
      keepUnusedDataFor: 120000,
    }),

    getProduct: builder.query<BaseApiResponse<Product>, ProductQuerySearch>({
      query: (params) => ({
        url: `/product/`,
        method: "GET",
        params: { ...params, id: params.id !== null ? params.id : undefined },
      }),
      keepUnusedDataFor: 120000,
    }),
    getLocations: builder.query<
      BaseApiResponse<LocationType>,
      LocationTypeQuerySearch
    >({
      query: (params) => {
        return {
          url: `/location/`,
          method: "GET",
          params: {
            ...params,
            id: params.id ? params.id : undefined,
          },
        };
      },
      keepUnusedDataFor: 120000,
      // providesTags: ["Location"],
    }),

    postLocations: builder.mutation<LocationType, CreateLocationBody>({
      query: (body) => {
        return {
          url: `/location/`,
          method: "POST",
          body: body,
        };
      },
      invalidatesTags: ["Location"],
    }),
    getProductPeriod: builder.query<Period, ProductPeriodQueryParams>({
      query: (params) => {
        return {
          url: `/period/last-period/`,
          method: "GET",
          params: {
            product: params.product,
          },
        };
      },
      keepUnusedDataFor: 120000,
    }),
    getRoute: builder.query<BaseApiResponse<Route>, RouteQuerySearch>({
      query: (params) => {
        return {
          url: `/route/`,
          method: "GET",
          params: {
            ...params,
            id: params.id ? params.id : undefined,
            distributor_center: params.distributor_center
              ? params.distributor_center
              : undefined,
          },
        };
      },
    }),
    getLot: builder.query<BaseApiResponse<LotType>, LotTypeQuerySearch>({
      query: (params) => {
        return {
          url: `/lot/`,
          method: "GET",
          params: {
            ...params,
            id: params.id ? params.id : undefined,
          },
        };
      }
    }),
    postLot: builder.mutation<LotType, {code: string}>({
      query: ({code}) => {
        return {
          url: `/lot/`,
          method: "POST",
          body: {
            code
          },
        };
      }
    }),
    getPeriodList: builder.query<BaseApiResponse<Period>, PeriodQueryParams>({
      query: (params) => ({
        url: `/period/`,
        method: "GET",
        params: {
          limit: params.limit,
          offset: params.offset,
          search: params.search,
        },
      }),
      // Si quieres tags para invalidar:
      providesTags: (result) =>
          result
              ? [
                ...result.results.map(({ id }) => ({ type: "Period" as const, id })),
                { type: "Period", id: "LIST" },
              ]
              : [{ type: "Period", id: "LIST" }],
    }),

    createPeriod: builder.mutation<Period, Partial<Period>>({
      query: (body) => ({
        url: `/period/`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Period", id: "LIST" }],
    }),

    updatePeriod: builder.mutation<Period, { id: number; data: Partial<Period> }>({
      query: ({ id, data }) => ({
        url: `/period/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Period", id }],
    }),

    deletePeriod: builder.mutation<void, number>({
      query: (id) => ({
        url: `/period/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Period", id }],
    }),
    massImportPeriods: builder.mutation<void, FormData>({
      query: (formData) => ({
        url: "/period/load-excel/", // Ajusta la URL a tu endpoint real
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Period", id: "LIST" }],
    }),
  }),
});

export const distributorCenterApi = createApi({
  reducerPath: "distributorCenterApi",
  tagTypes: ['dc'],
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_JS_APP_API_URL + "/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // 1) Traer la lista de DistributorCenters
    getDistributorCenters: builder.query<
      BaseApiResponse<DistributorCenter>,
      DistributorCenterQueryParams
    >({
      query: ({ limit, offset, search }) => ({
        url: "distribution-center/",
        params: { limit, offset, search },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'dc' as const, id })),
              { type: 'dc', id: 'LIST' },
            ]
          : [{ type: 'dc', id: 'LIST' }],
    }),

    // 2) Crear un nuevo
    createDistributorCenter: builder.mutation<DistributorCenter, Partial<DistributorCenter>>({
      query: (body) => ({
        url: "distribution-center/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: 'dc', id: 'LIST' }],
    }),

    // 3) Actualizar uno existente
    updateDistributorCenter: builder.mutation<
      DistributorCenter,
      { id: number; data: Partial<DistributorCenter> }
    >({
      query: ({ id, data }) => ({
        url: `distribution-center/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'dc', id }],
    }),

    // 4) Eliminar
    deleteDistributorCenter: builder.mutation<void, number>({
      query: (id) => ({
        url: `distribution-center/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'dc', id }],
    }),

    // 5) Traer países (para el autocomplete)
    getCountries: builder.query<
      BaseApiResponse<CountryType>,
      CountryQueryParams
    >({
      query: ({ limit, offset, search }) => ({
        url: "country/",
        params: { limit, offset, search },
      }),
    }),
  }),
});

export const {
  useGetDistributorCentersQuery,
  useCreateDistributorCenterMutation,
  useUpdateDistributorCenterMutation,
  useDeleteDistributorCenterMutation,

  // Para países
  useGetCountriesQuery,
} = distributorCenterApi;

export const {
  useGetTrailerQuery,
  useGetTransporterQuery,
  useGetOperatorByDistributionCenterQuery,
  useGetDriverQuery,
  useGetProductQuery,
  useGetLocationsQuery,
  useGetProductPeriodQuery,
  useRegisterTrailerMutation,
  useGetRouteQuery,
  usePostLocationsMutation,
  useGetLotQuery,
  usePostLotMutation,
  useGetPeriodListQuery,
  useCreatePeriodMutation,
  useUpdatePeriodMutation,
  useDeletePeriodMutation,
    useMassImportPeriodsMutation
} = maintenanceApi;
