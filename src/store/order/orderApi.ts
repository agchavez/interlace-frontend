import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { RootState } from "..";
import { Order } from "../../interfaces/orders";
import { BaseApiResponse } from "../../interfaces/api";
import { OrderQueryParams } from "../../interfaces/tracking";

export const orderApi = createApi({
  reducerPath: "orderApi",
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
    getOrder: builder.query<BaseApiResponse<Order>, OrderQueryParams>({
      query: (params) => {
        const { status_choice, ...rest } = params;
        const status_choice_proc = status_choice?.map((status) => 'status_choice=' + status) || '';
        return {
          url: `/order/?${status_choice_proc && status_choice_proc.join('&')}`,
          method: "GET",
          params: {
            ...rest,

          }
        };
      },
    }),
    getOrderById: builder.query<Order, number>({
      query: (id) => {
        return {
          url: `/order/${id}/`,
          method: "GET",
        };
      }
    }),
  }),
});

export const { 
  useGetOrderQuery,
  useGetOrderByIdQuery, 
} = orderApi;
