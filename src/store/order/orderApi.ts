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
        return {
          url: `/order/`,
          method: "GET",
          params,
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
