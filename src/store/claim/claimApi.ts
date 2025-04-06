
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "..";
import { BaseApiResponse } from "../../interfaces/api";
import { Tracker } from "../../interfaces/tracking";
import { Trailer, Transporter } from "../../interfaces/maintenance";


export interface ClaimProduct {
  id:           number;
  product_name: string;
  product_id:   number;
  created_at:   Date;
  quantity:     number;
  claim:        number;
  product:      number;
}

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
  claim_file?: ClaimFile;
  credit_memo_file?: ClaimFile;
  observations_file?: ClaimFile;
  photos_container_closed: DocumentFromClaim[];
  photos_container_one_open: DocumentFromClaim[];
  photos_container_two_open: DocumentFromClaim[];
  photos_container_top: DocumentFromClaim[];
  photos_during_unload: DocumentFromClaim[];
  photos_pallet_damage: DocumentFromClaim[];
  photos_damaged_product_base: DocumentFromClaim[];
  photos_damaged_product_dents: DocumentFromClaim[];
  photos_damaged_boxes: DocumentFromClaim[];
  photos_grouped_bad_product: DocumentFromClaim[];
  photos_repalletized: DocumentFromClaim[];
  claim_products: ClaimProduct[];
  created_at: string;
  updated_at: string;
  tracking?: Tracker;
  trailer: Trailer;
  transporter: Transporter;
  reject_reason: string|null;
  type: "CLAIM" | "ALERT_QUALITY";
}

export interface ClaimProduct {
  id: number;
  product_name: string;
  product_id: number;
  quantity: number;
  claim: number;
  product: number;
  sap_code: string;
  created_at: Date;
  batch: string;
}

export interface ClaimFile {
  name: string;
  file: string | null;
  extension: string | null;
  type: string | null;
  created_at: string | null;
  access_url: string;
  subfolder: string | null;
}
export interface DocumentFromClaim {
  id: number;
  name: string;
  file: string | null;
  extension: string | null;
  type: string | null;
  created_at: string | null;
  access_url: string;
  folder: string | null;
  subfolder: string | null;
}
export interface ClaimQueryParams {
  search?: string;
  ordering?: string;
  tipo?: "FALTANTE" | "SOBRANTE" | "DAÑOS_CALIDAD_TRANSPORTE";
  status?: "PENDIENTE" | "EN_REVISION" | "RECHAZADO" | "APROBADO";
  distributor_center?: number[];
  date_after?: string;
  date_before?: string;
  limit?: number;
  offset?: number;
  id?: number;
  claim_type?: "LOCAL" | "IMPORT";
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

    getMyClaims: builder.query<BaseApiResponse<Claim>, ClaimQueryParams | void>({
      query: (params) => ({
        url: "/claim/mis-claims/",
        method: "GET",
        params: params || {},
      }),
      providesTags: [{ type: "Claims", id: "USER_CLAIMS" }],
    }),
    downloadDocument: builder.query<Blob, { filename: string, claim_id: number }>({
      query: (params) => ({
        url: `/claim/${params.claim_id}/download-file/`,
        method: "GET",
        params: {filename: params.filename},
        responseHandler: async (response) => {
          const blob = await response.blob();
          return blob;
        },
      }),
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
        url: `/claim/${id}/update-claim/`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Claims", id }, { type: "Claims", id: "LIST" }, { type: "Claims", id: "USER_CLAIMS" }],
    }),
getClaimByTracker: builder.query<Claim, number>({
        query: (id) => ({
            url: `/claim/tracker/${id}/`,
            method: "GET",
        }),
        providesTags: (_result, _error, id) => [{ type: "Claims", id }],
    }),
    changeClaimStatus: builder.mutation<Claim, {id: number, formData: FormData}>({
      query: ({id, formData}) => ({
        url: `/claim/${id}/change-state/`,
        method: "POST",
        body: formData,
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
  useDownloadDocumentQuery,
  useCreateClaimMutation,
  useUpdateClaimMutation,
  useChangeClaimStatusMutation,
} = claimApi;