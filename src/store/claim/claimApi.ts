
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "..";
import { BaseApiResponse } from "../../interfaces/api";

export interface Claim {
  id: number;
  tracker: number;
  assigned_to: number | null;
  claim_type: "FALTANTE" | "SOBRANTE" | "DAÑOS_CALIDAD_TRANSPORTE";
  description: string;
  status: "PENDIENTE" | "EN_REVISION" | "RECHAZADO" | "APROBADO";
  claim_number?: string;
  discard_doc?: string;
  observations?: string;
  claim_file?: string;
  credit_memo_file?: string;
  observations_file?: string;
  photos_container_closed: { id: number, url: string }[];
  photos_container_one_open: { id: number, url: string }[];
  photos_container_two_open: { id: number, url: string }[];
  photos_container_top: { id: number, url: string }[];
  photos_during_unload: { id: number, url: string }[];
  photos_pallet_damage: { id: number, url: string }[];
  photos_damaged_product_base: { id: number, url: string }[];
  photos_damaged_product_dents: { id: number, url: string }[];
  photos_damaged_boxes: { id: number, url: string }[];
  photos_grouped_bad_product: { id: number, url: string }[];
  photos_repalletized: { id: number, url: string }[];
  created_at: string;
  updated_at: string;
}
export interface ClaimQueryParams {
  search?: string;
  ordering?: string;
  tipo?: "FALTANTE" | "SOBRANTE" | "DAÑOS_CALIDAD_TRANSPORTE";
  status?: "PENDIENTE" | "EN_REVISION" | "RECHAZADO" | "APROBADO";
  distributor_center?: number[];
  date_after?: string;
  date_before?: string;
}

export const claimApi = createApi({
  reducerPath: "claimApi",
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
  tagTypes: ["Claims"],
  endpoints: (builder) => ({
    getClaims: builder.query<BaseApiResponse<Claim>, ClaimQueryParams | void>({
      query: (params) => ({
        url: "/claim/",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: "Claims" as const, id })),
              { type: "Claims", id: "LIST" },
            ]
          : [{ type: "Claims", id: "LIST" }],
    }),

    getClaimById: builder.query<Claim, number>({
      query: (id) => ({
        url: `/claim/${id}/`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Claims", id }],
    }),

    getMyClaims: builder.query<BaseApiResponse<Claim>, void>({
      query: () => ({
        url: "/claim/mis-claims/",
        method: "GET",
      }),
      providesTags: [{ type: "Claims", id: "USER_CLAIMS" }],
    }),

    createClaim: builder.mutation<Claim, FormData>({
      query: (formData) => ({
        url: "/claim/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Claims", id: "LIST" }, { type: "Claims", id: "USER_CLAIMS" }],
    }),

    updateClaim: builder.mutation<Claim, { id: number, formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/claim/${id}/`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Claims", id }, { type: "Claims", id: "LIST" }, { type: "Claims", id: "USER_CLAIMS" }],
    }),

    changeClaimStatus: builder.mutation<Claim, { id: number; new_state: string; changed_by_id?: number }>({
      query: ({ id, new_state, changed_by_id }) => ({
        url: `/claim/${id}/change-state/`,
        method: "POST",
        body: { new_state, changed_by_id },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Claims", id },
        { type: "Claims", id: "LIST" },
        { type: "Claims", id: "USER_CLAIMS" },
      ],
    }),
  }),
});

export const {
  useGetClaimsQuery,
  useGetClaimByIdQuery,
  useGetMyClaimsQuery,
  useCreateClaimMutation,
  useUpdateClaimMutation,
  useChangeClaimStatusMutation,
} = claimApi;