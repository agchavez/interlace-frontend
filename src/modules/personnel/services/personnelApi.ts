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
  CertificationBulkPreviewResponse,
  CertificationBulkConfirmResponse,
  CertificationBulkRow,
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
  tagTypes: [
    'PersonnelProfiles', 'Certifications', 'MedicalRecords',
    'PerformanceMetrics', 'MetricTypes', 'Evaluations',
    'MetricSamples', 'MetricsLive', 'MetricsWorkstation', 'MetricsHourly',
  ],
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
    // Endpoint ligero para autocompletes / dropdowns.
    // Devuelve solo id, employee_code, full_name, position, position_type.
    getPersonnelAutocomplete: builder.query<
      PersonnelAutocompleteItem[],
      {
        search?: string;
        position_type?: string;
        hierarchy_level?: string;
        primary_distributor_center?: number;
        is_active?: boolean;
        limit?: number;
      }
    >({
      query: (params) => ({
        url: '/profiles/autocomplete/',
        method: 'GET',
        params,
      }),
      keepUnusedDataFor: 120,
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
    getEligibleForToken: builder.query<PersonnelProfileList[], { token_type?: string; search?: string; limit?: number; distributor_center?: number }>({
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

    completeCertification: builder.mutation<Certification, { id: number; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/certifications/${id}/complete/`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Certifications', id },
        { type: 'Certifications', id: 'LIST' },
      ],
    }),

    markCertificationInProgress: builder.mutation<Certification, number>({
      query: (id) => ({
        url: `/certifications/${id}/mark_in_progress/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Certifications', id },
        { type: 'Certifications', id: 'LIST' },
      ],
    }),

    markCertificationNotCompleted: builder.mutation<Certification, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/certifications/${id}/mark_not_completed/`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Certifications', id },
        { type: 'Certifications', id: 'LIST' },
      ],
    }),

    previewCertificationBulk: builder.mutation<CertificationBulkPreviewResponse, FormData>({
      query: (formData) => ({
        url: '/certifications/bulk_upload_preview/',
        method: 'POST',
        body: formData,
      }),
    }),

    confirmCertificationBulk: builder.mutation<CertificationBulkConfirmResponse, { rows: CertificationBulkRow[]; initial_status?: 'PENDING' | 'IN_PROGRESS' }>({
      query: ({ rows, initial_status = 'PENDING' }) => ({
        url: '/certifications/bulk_upload_confirm/',
        method: 'POST',
        body: { rows, initial_status },
      }),
      invalidatesTags: [{ type: 'Certifications', id: 'LIST' }],
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

    // ==========================================
    // Metric Samples (truck_cycle auto-feed)
    // ==========================================
    getMetricSamples: builder.query<
      { count: number; results: MetricSampleItem[] },
      {
        personnel?: number;
        metric_type?: number;
        operational_date?: string;
        operational_date__gte?: string;
        operational_date__lte?: string;
        source?: string;
        limit?: number;
        offset?: number;
      }
    >({
      query: (params) => ({
        url: '/metric-samples/',
        method: 'GET',
        params,
      }),
      providesTags: ['MetricSamples'],
    }),

    getMetricsLive: builder.query<
      MetricsLiveResponse,
      { personnel_id?: number; operational_date?: string; distributor_center?: number }
    >({
      query: (params) => ({
        url: '/metric-samples/live/',
        method: 'GET',
        params,
      }),
      providesTags: ['MetricsLive'],
    }),

    getRoleWorkstation: builder.query<
      WorkstationResponse,
      { role: 'picker' | 'counter' | 'yard'; operational_date?: string; distributor_center?: number }
    >({
      query: (params) => ({
        url: '/metric-samples/workstation/',
        method: 'GET',
        params,
      }),
      providesTags: ['MetricsWorkstation'],
    }),

    getMetricsHourly: builder.query<
      MetricsHourlyResponse,
      { metric_code: string; operational_date?: string; distributor_center?: number; personnel_id?: number }
    >({
      query: (params) => ({
        url: '/metric-samples/hourly/',
        method: 'GET',
        params,
      }),
      providesTags: ['MetricsHourly'],
    }),
  }),
});

export interface MetricsHourlyHour {
  hour: number;
  value: number | null;
  band: Band;
  count: number;
}
export interface ShiftInfo {
  name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  start_hour: number;
  end_hour: number;
  is_active_now: boolean;
  current_hour: number;
}

export interface MetricsHourlyResponse {
  date: string;
  metric_code: string;
  metric_name: string;
  unit: string;
  target: number | null;
  trigger: number | null;
  direction: Direction;
  hours: MetricsHourlyHour[];
  shift: ShiftInfo | null;
}

export interface WorkstationMetricHeader {
  code: string;
  name: string;
  unit: string;
  direction: Direction;
  target: number | null;
  trigger: number | null;
}

export interface WorkstationPersonRow {
  id: number;
  name: string;
  code: string;
  position_type: string;
  values: Record<string, MetricValueWithBand>;
}

export interface WorkstationResponse {
  date: string;
  role: 'picker' | 'counter' | 'yard';
  distributor_center: number | null;
  metrics: WorkstationMetricHeader[];
  personnel: WorkstationPersonRow[];
}

export interface MetricSampleItem {
  id: number;
  personnel: number;
  personnel_name: string;
  personnel_code: string;
  position_type: string;
  metric_type: number;
  metric_code: string;
  metric_name: string;
  metric_unit: string;
  operational_date: string;
  numeric_value: string;
  source: string;
  pauta_id: number | null;
  context: Record<string, unknown>;
  created_at: string;
}

export type Band = 'GREEN' | 'YELLOW' | 'RED' | 'GRAY';
export type Direction = 'HIGHER_IS_BETTER' | 'LOWER_IS_BETTER' | null;

export interface MetricValueWithBand {
  value: number | null;
  target: number | null;
  trigger: number | null;
  direction: Direction;
  unit: string | null;
  band: Band;
}

export interface MetricsLiveResponse {
  date: string;
  personnel_id: number | null;
  distributor_center: number | null;
  picker: {
    pallets_per_hour: MetricValueWithBand;
    loads_assembled: MetricValueWithBand;
    fractions_assembled: number;
    avg_time_per_pauta_min: MetricValueWithBand;
    load_error_rate_pct: MetricValueWithBand;
    samples_count: number;
  };
  counter: {
    pallets_per_hour: MetricValueWithBand;
    avg_time_per_truck_min: MetricValueWithBand;
    error_rate_pct: MetricValueWithBand;
    samples_count: number;
  };
  yard: {
    trucks_moved: MetricValueWithBand;
    avg_park_to_bay_min: MetricValueWithBand;
    avg_bay_to_park_min: MetricValueWithBand;
    avg_total_move_min: MetricValueWithBand;
    samples_count: number;
  };
}

export interface PersonnelAutocompleteItem {
  id: number;
  employee_code: string;
  full_name: string;
  first_name: string;
  last_name: string;
  position: string;
  position_type: string;
}

export const {
  // Personnel Profiles
  useGetPersonnelProfilesQuery,
  useGetPersonnelAutocompleteQuery,
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
  useCompleteCertificationMutation,
  useMarkCertificationInProgressMutation,
  useMarkCertificationNotCompletedMutation,
  usePreviewCertificationBulkMutation,
  useConfirmCertificationBulkMutation,
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
  // Métricas automáticas (truck_cycle)
  useGetMetricSamplesQuery,
  useGetMetricsLiveQuery,
  useGetRoleWorkstationQuery,
  useGetMetricsHourlyQuery,
} = personnelApi;
