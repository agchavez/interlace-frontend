import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from '../store';
import { InventarioMoviment, InventarioMovimentQueryParams } from '../../interfaces/tracking';
import { BaseApiResponse } from '../../interfaces/api';
import { format } from "date-fns";

export const inventoryApi = createApi({
    reducerPath: "inventoryApi",
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
        getInventory: builder.query<BaseApiResponse<InventarioMoviment>, InventarioMovimentQueryParams>({
            query: (params) => {
              const par = {...params, product: params.productos.map(pr=>pr.id), distributor_center: params.distributor_center.map(dc => dc.id)}
              return({
                url: "/inventory-movement/",
                params:{
                  ...par,
                  date_before: params.date_before && format(new Date(params.date_before), 'yyyy-MM-dd'),
                  date_after: params.date_after && format(new Date(params.date_after), 'yyyy-MM-dd'),
                }
            })},
        }),
    }),
});

export const { useGetInventoryQuery } = inventoryApi;
