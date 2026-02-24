import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../../store';
import type {
  PersonnelProfile,
  PersonnelProfileList,
  PersonnelProfileListResponse,
  PersonnelProfileCreateUpdate,
  PersonnelFilterParams,
  ProfileCheckResponse,
  ProfileCompletionData,
  CompleteProfileResponse,
  PersonnelDashboard,
  Certification,
  CertificationListResponse,
  CertificationFilterParams,
  MedicalRecord,
  MedicalRecordListResponse,
  PerformanceMetric,
  PerformanceMetricListResponse,
  PerformanceFilterParams,
  Area,
  Department,
  EvaluationStatistics,
  MyProfileUpdate,
} from '../../../interfaces/personnel';

export const personnelApi = createApi({
  reducerPath: 'personnelApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_JS_APP_API_URL + '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['PersonnelProfiles', 'Certifications', 'MedicalRecords', 'PerformanceMetrics', 'MetricTypes', 'Evaluations'],
  endpoints: (builder) => ({
    // ==========================================
    // Personnel Profiles
    // ==========================================
    getPersonnelProfiles: builder.query<PersonnelProfileListResponse, PersonnelFilterParams>({
      query: (params) => ({
        url: '/profiles/',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'PersonnelProfiles' as const, id })),
              { type: 'PersonnelProfiles', id: 'LIST' },
            ]
          : [{ type: 'PersonnelProfiles', id: 'LIST' }],
    }),

    getPersonnelProfile: builder.query<PersonnelProfile, number>({
      query: (id) => ({
        url: `/profiles/${id}/`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'PersonnelProfiles', id }],
    }),

    createPersonnelProfile: builder.mutation<PersonnelProfile, PersonnelProfileCreateUpdate>({
      query: (data) => ({
        url: '/profiles/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'PersonnelProfiles', id: 'LIST' }],
    }),

    updatePersonnelProfile: builder.mutation<
      PersonnelProfile,
      { id: number; data: Partial<PersonnelProfileCreateUpdate> }
    >({
      query: ({ id, data }) => ({
        url: `/profiles/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PersonnelProfiles', id },
        { type: 'PersonnelProfiles', id: 'LIST' },
      ],
    }),

    updatePersonnelWithUser: builder.mutation<
      any,
      { id: number; user_data?: any; profile_data?: any }
    >({
      query: ({ id, user_data, profile_data }) => ({
        url: `/profiles/${id}/update-with-user/`,
        method: 'PATCH',
        body: { user_data, profile_data },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PersonnelProfiles', id },
        { type: 'PersonnelProfiles', id: 'LIST' },
      ],
    }),

    deactivatePersonnelProfile: builder.mutation<void, number>({
      query: (id) => ({
        url: `/profiles/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'PersonnelProfiles', id },
        { type: 'PersonnelProfiles', id: 'LIST' },
      ],
    }),

    // ==========================================
    // Profile Completion
    // ==========================================
    getMyProfile: builder.query<PersonnelProfile | ProfileCheckResponse, void>({
      query: () => ({
        url: '/profiles/my_profile/',
        method: 'GET',
      }),
      providesTags: ['PersonnelProfiles'],
    }),

    getProfileCompletionData: builder.query<ProfileCompletionData, void>({
      query: () => ({
        url: '/profiles/profile_completion_data/',
        method: 'GET',
      }),
    }),

    completeMyProfile: builder.mutation<CompleteProfileResponse, PersonnelProfileCreateUpdate>({
      query: (data) => ({
        url: '/profiles/complete_my_profile/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PersonnelProfiles'],
    }),

    updateMyProfile: builder.mutation<{ message: string; profile: PersonnelProfile }, MyProfileUpdate>({
      query: (data) => ({
        url: '/profiles/update_my_profile/',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['PersonnelProfiles'],
    }),

    // ==========================================
    // Dashboard & Stats
    // ==========================================
    getPersonnelDashboard: builder.query<PersonnelDashboard, { distributor_center?: number } | void>({
      query: (params) => ({
        url: '/profiles/dashboard/',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['PersonnelProfiles'],
    }),

    getSupervisedPersonnel: builder.query<PersonnelProfileList[], void>({
      query: () => ({
        url: '/profiles/supervised_personnel/',
        method: 'GET',
      }),
      providesTags: ['PersonnelProfiles'],
    }),

    getSubordinatesTree: builder.query<any, number>({
      query: (id) => ({
        url: `/profiles/${id}/subordinates_tree/`,
        method: 'GET',
      }),
    }),

    // Get personnel eligible for token creation (filtered by requester's hierarchy)
    getEligibleForToken: builder.query<PersonnelProfileList[], { token_type?: string }>({
      query: (params) => ({
        url: '/profiles/eligible_for_token/',
        method: 'GET',
        params,
      }),
      providesTags: ['PersonnelProfiles'],
    }),

    getPerformanceSummary: builder.query<any, { id: number; period?: string; months?: number }>({
      query: ({ id, period, months }) => ({
        url: `/profiles/${id}/performance_summary/`,
        method: 'GET',
        params: { period, months },
      }),
    }),

    getCertificationsExpiring: builder.query<PersonnelProfileList[], { days?: number }>({
      query: (params) => ({
        url: '/profiles/certifications_expiring/',
        method: 'GET',
        params,
      }),
      providesTags: ['Certifications'],
    }),

    // ==========================================
    // Certifications
    // ==========================================
    getCertifications: builder.query<CertificationListResponse, CertificationFilterParams>({
      query: (params) => ({
        url: '/certifications/',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'Certifications' as const, id })),
              { type: 'Certifications', id: 'LIST' },
            ]
          : [{ type: 'Certifications', id: 'LIST' }],
    }),

    getCertification: builder.query<Certification, number>({
      query: (id) => ({
        url: `/certifications/${id}/`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Certifications', id }],
    }),

    createCertification: builder.mutation<Certification, Partial<Certification>>({
      query: (data) => {
        // Si hay un archivo, usar FormData
        if (data.certificate_document) {
          const formData = new FormData();
          Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (key === 'certificate_document' && value instanceof File) {
                formData.append(key, value);
              } else if (typeof value === 'number' || typeof value === 'boolean') {
                formData.append(key, value.toString());
              } else {
                formData.append(key, value as string);
              }
            }
          });
          return {
            url: '/certifications/',
            method: 'POST',
            body: formData,
          };
        }
        // Si no hay archivo, enviar JSON normal
        return {
          url: '/certifications/',
          method: 'POST',
          body: data,
        };
      },
      invalidatesTags: [{ type: 'Certifications', id: 'LIST' }],
    }),

    revokeCertification: builder.mutation<Certification, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/certifications/${id}/revoke/`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Certifications', id },
        { type: 'Certifications', id: 'LIST' },
      ],
    }),

    renewCertification: builder.mutation<Certification, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/certifications/${id}/renew/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Certifications', id },
        { type: 'Certifications', id: 'LIST' },
      ],
    }),

    // ==========================================
    // Medical Records
    // ==========================================
    getMedicalRecords: builder.query<MedicalRecordListResponse, { personnel?: number }>({
      query: (params) => ({
        url: '/medical-records/',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'MedicalRecords' as const, id })),
              { type: 'MedicalRecords', id: 'LIST' },
            ]
          : [{ type: 'MedicalRecords', id: 'LIST' }],
    }),

    createMedicalRecord: builder.mutation<MedicalRecord, Partial<MedicalRecord>>({
      query: (data) => ({
        url: '/medical-records/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'MedicalRecords', id: 'LIST' }],
    }),

    // ==========================================
    // Performance Metrics
    // ==========================================
    getPerformanceMetrics: builder.query<PerformanceMetricListResponse, PerformanceFilterParams>({
      query: (params) => ({
        url: '/performance/',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'PerformanceMetrics' as const, id })),
              { type: 'PerformanceMetrics', id: 'LIST' },
            ]
          : [{ type: 'PerformanceMetrics', id: 'LIST' }],
    }),

    createPerformanceMetric: builder.mutation<PerformanceMetric, Partial<PerformanceMetric>>({
      query: (data) => ({
        url: '/performance/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'PerformanceMetrics', id: 'LIST' }],
    }),

    // ==========================================
    // Catalogs
    // ==========================================
    getAreas: builder.query<Area[], void>({
      query: () => ({
        url: '/areas/',
        method: 'GET',
      }),
    }),

    getDepartments: builder.query<Department[], { area?: number; search?: string }>({
      query: (params) => ({
        url: '/departments/',
        method: 'GET',
        params,
      }),
    }),

    createDepartment: builder.mutation<Department, Partial<Department>>({
      query: (data) => ({
        url: '/departments/',
        method: 'POST',
        body: data,
      }),
      // Invalidate departments cache to refetch
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data: newDepartment } = await queryFulfilled;
          // Optimistically update the cache
          dispatch(
            personnelApi.util.updateQueryData('getDepartments', { area: arg.area }, (draft) => {
              draft.push(newDepartment);
            })
          );
        } catch {}
      },
    }),

    // ==========================================
    // Emergency Contacts
    // ==========================================
    getEmergencyContacts: builder.query<any[], { personnel?: number }>({
      query: (params) => ({
        url: '/emergency-contacts/',
        method: 'GET',
        params,
      }),
    }),

    createEmergencyContact: builder.mutation<any, any>({
      query: (data) => ({
        url: '/emergency-contacts/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PersonnelProfiles'],
    }),

    updateEmergencyContact: builder.mutation<any, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/emergency-contacts/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['PersonnelProfiles'],
    }),

    deleteEmergencyContact: builder.mutation<void, number>({
      query: (id) => ({
        url: `/emergency-contacts/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PersonnelProfiles'],
    }),

    // ==========================================
    // Certification Types
    // ==========================================
    getCertificationTypes: builder.query<any, void>({
      query: () => ({
        url: '/certification-types/',
        method: 'GET',
      }),
      providesTags: ['Certifications'],
    }),

    createCertificationType: builder.mutation<any, { name: string; code: string }>({
      query: (data) => ({
        url: '/certification-types/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Certifications'],
    }),

    // ==========================================
    // Users Without Profile
    // ==========================================
    getUsersWithoutProfile: builder.query<any[], { search?: string }>({
      query: (params) => ({
        url: '/profiles/users_without_profile/',
        method: 'GET',
        params,
      }),
    }),

    // Create Personnel with User
    createPersonnelWithUser: builder.mutation<any, { user_data: any; profile_data: any }>({
      query: (data) => ({
        url: '/profiles/create_with_user/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'PersonnelProfiles', id: 'LIST' }],
    }),

    // Assign User to Personnel
    assignUserToPersonnel: builder.mutation<any, { personnel_id: number; user_data: any }>({
      query: ({ personnel_id, user_data }) => ({
        url: `/profiles/${personnel_id}/assign-user/`,
        method: 'POST',
        body: user_data,
      }),
      invalidatesTags: (result, error, { personnel_id }) => [
        { type: 'PersonnelProfiles', id: personnel_id },
        { type: 'PersonnelProfiles', id: 'LIST' },
      ],
    }),

    // ==========================================
    // Performance Metric Types (New System)
    // ==========================================
    getMetricTypes: builder.query<any, { is_active?: boolean; position_type?: string }>({
      query: (params) => ({
        url: '/metric-types/',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map(({ id }: any) => ({ type: 'MetricTypes' as const, id })),
              { type: 'MetricTypes', id: 'LIST' },
            ]
          : [{ type: 'MetricTypes', id: 'LIST' }],
    }),

    getMetricType: builder.query<any, number>({
      query: (id) => ({
        url: `/metric-types/${id}/`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'MetricTypes', id }],
    }),

    createMetricType: builder.mutation<any, any>({
      query: (data) => ({
        url: '/metric-types/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'MetricTypes', id: 'LIST' }],
    }),

    updateMetricType: builder.mutation<any, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/metric-types/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'MetricTypes', id },
        { type: 'MetricTypes', id: 'LIST' },
      ],
    }),

    deleteMetricType: builder.mutation<void, number>({
      query: (id) => ({
        url: `/metric-types/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'MetricTypes', id: 'LIST' }],
    }),

    getMetricTypesForPosition: builder.query<any[], string>({
      query: (position_type) => ({
        url: '/metric-types/for_position_type/',
        method: 'GET',
        params: { position_type },
      }),
      providesTags: ['MetricTypes'],
    }),

    reorderMetricTypes: builder.mutation<any, any[]>({
      query: (order_data) => ({
        url: '/metric-types/reorder/',
        method: 'POST',
        body: order_data,
      }),
      invalidatesTags: [{ type: 'MetricTypes', id: 'LIST' }],
    }),

    // ==========================================
    // Performance Evaluations (New System)
    // ==========================================
    getEvaluations: builder.query<any, any>({
      query: (params) => ({
        url: '/evaluations/',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map(({ id }: any) => ({ type: 'Evaluations' as const, id })),
              { type: 'Evaluations', id: 'LIST' },
            ]
          : [{ type: 'Evaluations', id: 'LIST' }],
    }),

    getEvaluation: builder.query<any, number>({
      query: (id) => ({
        url: `/evaluations/${id}/`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Evaluations', id }],
    }),

    createEvaluation: builder.mutation<any, any>({
      query: (data) => ({
        url: '/evaluations/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Evaluations', id: 'LIST' }],
    }),

    updateEvaluation: builder.mutation<any, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/evaluations/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Evaluations', id },
        { type: 'Evaluations', id: 'LIST' },
      ],
    }),

    submitEvaluation: builder.mutation<any, number>({
      query: (id) => ({
        url: `/evaluations/${id}/submit/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Evaluations', id },
        { type: 'Evaluations', id: 'LIST' },
      ],
    }),

    getEvaluationStatistics: builder.query<EvaluationStatistics, PerformanceFilterParams>({
      query: (params) => ({
        url: '/evaluations/statistics/',
        method: 'GET',
        params,
      }),
    }),
  }),
});

export const {
  // Personnel Profiles
  useGetPersonnelProfilesQuery,
  useGetPersonnelProfileQuery,
  useCreatePersonnelProfileMutation,
  useUpdatePersonnelProfileMutation,
  useUpdatePersonnelWithUserMutation,
  useDeactivatePersonnelProfileMutation,
  // Profile Completion
  useGetMyProfileQuery,
  useGetProfileCompletionDataQuery,
  useCompleteMyProfileMutation,
  useUpdateMyProfileMutation,
  // Dashboard
  useGetPersonnelDashboardQuery,
  useGetSupervisedPersonnelQuery,
  useGetSubordinatesTreeQuery,
  useGetEligibleForTokenQuery,
  useGetPerformanceSummaryQuery,
  useGetCertificationsExpiringQuery,
  // Certifications
  useGetCertificationsQuery,
  useGetCertificationQuery,
  useCreateCertificationMutation,
  useRevokeCertificationMutation,
  useRenewCertificationMutation,
  // Medical Records
  useGetMedicalRecordsQuery,
  useCreateMedicalRecordMutation,
  // Performance Metrics
  useGetPerformanceMetricsQuery,
  useCreatePerformanceMetricMutation,
  // Catalogs
  useGetAreasQuery,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  // Emergency Contacts
  useGetEmergencyContactsQuery,
  useCreateEmergencyContactMutation,
  useUpdateEmergencyContactMutation,
  useDeleteEmergencyContactMutation,
  // Certification Types
  useGetCertificationTypesQuery,
  useCreateCertificationTypeMutation,
  // Users Without Profile
  useGetUsersWithoutProfileQuery,
  useCreatePersonnelWithUserMutation,
  useAssignUserToPersonnelMutation,
  // Metric Types (New System)
  useGetMetricTypesQuery,
  useGetMetricTypeQuery,
  useCreateMetricTypeMutation,
  useUpdateMetricTypeMutation,
  useDeleteMetricTypeMutation,
  useGetMetricTypesForPositionQuery,
  useReorderMetricTypesMutation,
  // Evaluations (New System)
  useGetEvaluationsQuery,
  useGetEvaluationQuery,
  useCreateEvaluationMutation,
  useUpdateEvaluationMutation,
  useSubmitEvaluationMutation,
  useGetEvaluationStatisticsQuery,
} = personnelApi;
