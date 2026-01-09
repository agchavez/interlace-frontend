/**
 * RTK Query API para el módulo de Tokens
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../../store';
import {
  TokenListResponse,
  TokenListItem,
  TokenDetail,
  TokenCreatePayload,
  TokenFilterParams,
  ApprovalPayload,
  RejectPayload,
  ValidatePayload,
  PublicTokenView,
} from '../interfaces/token';

export const tokenApi = createApi({
  reducerPath: 'tokenApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_JS_APP_API_URL + '/api/tokens',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Tokens', 'TokenDetail', 'PendingApprovals', 'MyTokens', 'PendingValidation'],
  endpoints: (builder) => ({
    // List tokens with filters
    getTokens: builder.query<TokenListResponse, TokenFilterParams>({
      query: (params) => ({
        url: '/',
        params: {
          ...params,
          // Handle array params
          token_type: Array.isArray(params.token_type)
            ? params.token_type.join(',')
            : params.token_type,
          status: Array.isArray(params.status)
            ? params.status.join(',')
            : params.status,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({
                type: 'Tokens' as const,
                id,
              })),
              { type: 'Tokens', id: 'LIST' },
            ]
          : [{ type: 'Tokens', id: 'LIST' }],
    }),

    // Get single token detail
    getToken: builder.query<TokenDetail, number>({
      query: (id) => `/${id}/`,
      providesTags: (result, error, id) => [{ type: 'TokenDetail', id }],
    }),

    // Create new token
    createToken: builder.mutation<TokenDetail, TokenCreatePayload>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Tokens', id: 'LIST' },
        { type: 'PendingApprovals', id: 'LIST' },
        { type: 'MyTokens', id: 'LIST' },
      ],
    }),

    // Approve level 1 (supports FormData for signature/photo)
    approveLevel1: builder.mutation<TokenDetail, { id: number; payload: ApprovalPayload | FormData }>({
      query: ({ id, payload }) => ({
        url: `/${id}/approve_l1/`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TokenDetail', id },
        { type: 'Tokens', id: 'LIST' },
        { type: 'PendingApprovals', id: 'LIST' },
      ],
    }),

    // Approve level 2 (supports FormData for signature/photo)
    approveLevel2: builder.mutation<TokenDetail, { id: number; payload: ApprovalPayload | FormData }>({
      query: ({ id, payload }) => ({
        url: `/${id}/approve_l2/`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TokenDetail', id },
        { type: 'Tokens', id: 'LIST' },
        { type: 'PendingApprovals', id: 'LIST' },
      ],
    }),

    // Approve level 3 (supports FormData for signature/photo)
    approveLevel3: builder.mutation<TokenDetail, { id: number; payload: ApprovalPayload | FormData }>({
      query: ({ id, payload }) => ({
        url: `/${id}/approve_l3/`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TokenDetail', id },
        { type: 'Tokens', id: 'LIST' },
        { type: 'PendingApprovals', id: 'LIST' },
      ],
    }),

    // Reject token
    rejectToken: builder.mutation<TokenDetail, { id: number; payload: RejectPayload }>({
      query: ({ id, payload }) => ({
        url: `/${id}/reject/`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TokenDetail', id },
        { type: 'Tokens', id: 'LIST' },
        { type: 'PendingApprovals', id: 'LIST' },
      ],
    }),

    // Cancel token
    cancelToken: builder.mutation<TokenDetail, number>({
      query: (id) => ({
        url: `/${id}/cancel/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'TokenDetail', id },
        { type: 'Tokens', id: 'LIST' },
        { type: 'MyTokens', id: 'LIST' },
      ],
    }),

    // Validate token (Security) - supports FormData for signature/photo
    validateToken: builder.mutation<TokenDetail, ValidatePayload | FormData>({
      query: (payload) => ({
        url: '/validate/',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [
        { type: 'Tokens', id: 'LIST' },
        { type: 'PendingValidation', id: 'LIST' },
      ],
    }),

    // Get tokens pending validation (for Security)
    getPendingValidation: builder.query<TokenListItem[], void>({
      query: () => '/pending_validation/',
      providesTags: [{ type: 'PendingValidation', id: 'LIST' }],
    }),

    // Get pending approvals for current user
    getPendingApprovals: builder.query<TokenListItem[], void>({
      query: () => '/pending_my_approval/',
      providesTags: [{ type: 'PendingApprovals', id: 'LIST' }],
    }),

    // Get my tokens (as beneficiary or requester)
    getMyTokens: builder.query<TokenListItem[], void>({
      query: () => '/my_tokens/',
      providesTags: [{ type: 'MyTokens', id: 'LIST' }],
    }),

    // Public token view (no auth required)
    getPublicToken: builder.query<PublicTokenView, string>({
      query: (tokenCode) => ({
        url: `/public/${tokenCode}/`,
      }),
    }),

    // Get token by code (display_number or token_code) - for validation page
    getTokenByCode: builder.query<PublicTokenView, string>({
      query: (code) => ({
        url: `/by_code/${code}/`,
      }),
      providesTags: ['Tokens'],
    }),

    // Get tokens by personnel (for personnel detail page)
    getTokensByPersonnel: builder.query<TokenListResponse, { personnelId: number; limit?: number; offset?: number }>({
      query: ({ personnelId, limit = 10, offset = 0 }) => ({
        url: '/',
        params: {
          personnel: personnelId,
          limit,
          offset,
          ordering: '-created_at',
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({
                type: 'Tokens' as const,
                id,
              })),
              { type: 'Tokens', id: 'PERSONNEL_LIST' },
            ]
          : [{ type: 'Tokens', id: 'PERSONNEL_LIST' }],
    }),

    // Complete uniform delivery with signature and photos
    completeUniformDelivery: builder.mutation<TokenDetail, { id: number; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/${id}/complete_uniform_delivery/`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TokenDetail', id },
        { type: 'Tokens', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTokensQuery,
  useGetTokenQuery,
  useCreateTokenMutation,
  useApproveLevel1Mutation,
  useApproveLevel2Mutation,
  useApproveLevel3Mutation,
  useRejectTokenMutation,
  useCancelTokenMutation,
  useValidateTokenMutation,
  useGetPendingApprovalsQuery,
  useGetPendingValidationQuery,
  useGetMyTokensQuery,
  useGetPublicTokenQuery,
  useGetTokenByCodeQuery,
  useLazyGetTokenByCodeQuery,
  useGetTokensByPersonnelQuery,
  useCompleteUniformDeliveryMutation,
} = tokenApi;
