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
  ExternalPerson,
  ExternalPersonCreatePayload,
  ExternalPersonListResponse,
  Material,
  MaterialCreatePayload,
  MaterialListResponse,
  UnitOfMeasure,
  UnitOfMeasureCreatePayload,
  UnitOfMeasureListResponse,
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
  tagTypes: ['Tokens', 'TokenDetail', 'PendingApprovals', 'MyTokens', 'PendingValidation', 'ExternalPersons', 'Materials', 'UnitsOfMeasure'],
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

    // ============ EXTERNAL PERSONS ============

    // List external persons
    getExternalPersons: builder.query<ExternalPersonListResponse, { search?: string; is_active?: boolean; limit?: number; offset?: number }>({
      query: (params) => ({
        url: '/external-persons/',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({
                type: 'ExternalPersons' as const,
                id,
              })),
              { type: 'ExternalPersons', id: 'LIST' },
            ]
          : [{ type: 'ExternalPersons', id: 'LIST' }],
    }),

    // Get single external person
    getExternalPerson: builder.query<ExternalPerson, number>({
      query: (id) => `/external-persons/${id}/`,
      providesTags: (result, error, id) => [{ type: 'ExternalPersons', id }],
    }),

    // Create external person
    createExternalPerson: builder.mutation<ExternalPerson, ExternalPersonCreatePayload>({
      query: (data) => ({
        url: '/external-persons/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'ExternalPersons', id: 'LIST' }],
    }),

    // Update external person
    updateExternalPerson: builder.mutation<ExternalPerson, { id: number; data: Partial<ExternalPersonCreatePayload> }>({
      query: ({ id, data }) => ({
        url: `/external-persons/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ExternalPersons', id },
        { type: 'ExternalPersons', id: 'LIST' },
      ],
    }),

    // Delete external person
    deleteExternalPerson: builder.mutation<void, number>({
      query: (id) => ({
        url: `/external-persons/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'ExternalPersons', id: 'LIST' }],
    }),

    // ============ MATERIALS ============

    // List materials
    getMaterials: builder.query<MaterialListResponse, { search?: string; category?: string; requires_return?: boolean; limit?: number; offset?: number }>({
      query: (params) => ({
        url: '/materials/',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({
                type: 'Materials' as const,
                id,
              })),
              { type: 'Materials', id: 'LIST' },
            ]
          : [{ type: 'Materials', id: 'LIST' }],
    }),

    // Get single material
    getMaterial: builder.query<Material, number>({
      query: (id) => `/materials/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Materials', id }],
    }),

    // Create material
    createMaterial: builder.mutation<Material, MaterialCreatePayload>({
      query: (data) => ({
        url: '/materials/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Materials', id: 'LIST' }],
    }),

    // Update material
    updateMaterial: builder.mutation<Material, { id: number; data: Partial<MaterialCreatePayload> }>({
      query: ({ id, data }) => ({
        url: `/materials/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Materials', id },
        { type: 'Materials', id: 'LIST' },
      ],
    }),

    // Delete material
    deleteMaterial: builder.mutation<void, number>({
      query: (id) => ({
        url: `/materials/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Materials', id: 'LIST' }],
    }),

    // Get material categories
    getMaterialCategories: builder.query<string[], void>({
      query: () => '/materials/categories/',
    }),

    // ============ UNITS OF MEASURE ============

    // List units of measure
    getUnitsOfMeasure: builder.query<UnitOfMeasureListResponse, { search?: string; limit?: number; offset?: number }>({
      query: (params) => ({
        url: '/units/',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({
                type: 'UnitsOfMeasure' as const,
                id,
              })),
              { type: 'UnitsOfMeasure', id: 'LIST' },
            ]
          : [{ type: 'UnitsOfMeasure', id: 'LIST' }],
    }),

    // Get single unit
    getUnitOfMeasure: builder.query<UnitOfMeasure, number>({
      query: (id) => `/units/${id}/`,
      providesTags: (result, error, id) => [{ type: 'UnitsOfMeasure', id }],
    }),

    // Create unit
    createUnitOfMeasure: builder.mutation<UnitOfMeasure, UnitOfMeasureCreatePayload>({
      query: (data) => ({
        url: '/units/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'UnitsOfMeasure', id: 'LIST' }],
    }),

    // Update unit
    updateUnitOfMeasure: builder.mutation<UnitOfMeasure, { id: number; data: Partial<UnitOfMeasureCreatePayload> }>({
      query: ({ id, data }) => ({
        url: `/units/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'UnitsOfMeasure', id },
        { type: 'UnitsOfMeasure', id: 'LIST' },
      ],
    }),

    // Delete unit
    deleteUnitOfMeasure: builder.mutation<void, number>({
      query: (id) => ({
        url: `/units/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'UnitsOfMeasure', id: 'LIST' }],
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
  // External Persons
  useGetExternalPersonsQuery,
  useGetExternalPersonQuery,
  useCreateExternalPersonMutation,
  useUpdateExternalPersonMutation,
  useDeleteExternalPersonMutation,
  // Materials
  useGetMaterialsQuery,
  useGetMaterialQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
  useGetMaterialCategoriesQuery,
  // Units of Measure
  useGetUnitsOfMeasureQuery,
  useGetUnitOfMeasureQuery,
  useCreateUnitOfMeasureMutation,
  useUpdateUnitOfMeasureMutation,
  useDeleteUnitOfMeasureMutation,
} = tokenApi;
