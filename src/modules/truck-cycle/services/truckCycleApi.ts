import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../../store';
import type {
    PaginatedResponse,
    Truck,
    TruckFilterParams,
    Bay,
    KPITarget,
    PalletComplexUpload,
    UploadPreviewResponse,
    PautaListItem,
    PautaDetail,
    PautaFilterParams,
    WorkstationData,
    KPISummary,
    Inconsistency,
    PautaPhoto,
    PalletTicket,
    PickerStats,
    CounterStats,
    ValidatorStats,
    YardDriverStats,
    VendorStats,
} from '../interfaces/truckCycle';

export const truckCycleApi = createApi({
    reducerPath: 'truckCycleApi',
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
    tagTypes: ['Trucks', 'Bays', 'KPITargets', 'Uploads', 'Pautas', 'Inconsistencies', 'Photos', 'PalletTickets'],
    endpoints: (builder) => ({
        // ==================== TRUCKS ====================
        getTrucks: builder.query<PaginatedResponse<Truck>, TruckFilterParams | void>({
            query: (params) => ({ url: '/truck-cycle-truck/', params: { limit: 1000, offset: 0, ...(params || {}) } }),
            providesTags: ['Trucks'],
        }),
        createTruck: builder.mutation<Truck, Partial<Truck>>({
            query: (data) => ({ url: '/truck-cycle-truck/', method: 'POST', body: data }),
            invalidatesTags: ['Trucks'],
        }),
        updateTruck: builder.mutation<Truck, { id: number; data: Partial<Truck> }>({
            query: ({ id, data }) => ({ url: `/truck-cycle-truck/${id}/`, method: 'PATCH', body: data }),
            invalidatesTags: ['Trucks'],
        }),
        deleteTruck: builder.mutation<void, number>({
            query: (id) => ({ url: `/truck-cycle-truck/${id}/`, method: 'DELETE' }),
            invalidatesTags: ['Trucks'],
        }),

        // ==================== BAYS ====================
        getBays: builder.query<PaginatedResponse<Bay>, void>({
            query: () => ({ url: '/truck-cycle-bay/', params: { limit: 1000, offset: 0 } }),
            providesTags: ['Bays'],
        }),
        createBay: builder.mutation<Bay, Partial<Bay>>({
            query: (data) => ({ url: '/truck-cycle-bay/', method: 'POST', body: data }),
            invalidatesTags: ['Bays'],
        }),
        updateBay: builder.mutation<Bay, { id: number; data: Partial<Bay> }>({
            query: ({ id, data }) => ({ url: `/truck-cycle-bay/${id}/`, method: 'PATCH', body: data }),
            invalidatesTags: ['Bays'],
        }),
        deleteBay: builder.mutation<void, number>({
            query: (id) => ({ url: `/truck-cycle-bay/${id}/`, method: 'DELETE' }),
            invalidatesTags: ['Bays'],
        }),

        // ==================== KPI TARGETS ====================
        getKPITargets: builder.query<PaginatedResponse<KPITarget>, void>({
            query: () => ({ url: '/truck-cycle-kpi-target/', params: { limit: 1000, offset: 0 } }),
            providesTags: ['KPITargets'],
        }),
        createKPITarget: builder.mutation<KPITarget, Partial<KPITarget>>({
            query: (data) => ({ url: '/truck-cycle-kpi-target/', method: 'POST', body: data }),
            invalidatesTags: ['KPITargets'],
        }),
        updateKPITarget: builder.mutation<KPITarget, { id: number; data: Partial<KPITarget> }>({
            query: ({ id, data }) => ({ url: `/truck-cycle-kpi-target/${id}/`, method: 'PATCH', body: data }),
            invalidatesTags: ['KPITargets'],
        }),

        // ==================== UPLOADS ====================
        getUploads: builder.query<PaginatedResponse<PalletComplexUpload>, void>({
            query: () => ({ url: '/truck-cycle-upload/' }),
            providesTags: ['Uploads'],
        }),
        downloadTemplate: builder.query<Blob, void>({
            query: () => ({
                url: '/truck-cycle-upload/template/',
                responseHandler: (response: Response) => response.blob(),
            }),
        }),
        previewUpload: builder.mutation<UploadPreviewResponse, FormData>({
            query: (formData) => ({
                url: '/truck-cycle-upload/preview/',
                method: 'POST',
                body: formData,
            }),
            transformErrorResponse: (response) => response,
        }),
        confirmUpload: builder.mutation<PalletComplexUpload, { uploadId: number; operational_date?: string }>({
            query: ({ uploadId, operational_date }) => ({
                url: `/truck-cycle-upload/${uploadId}/confirm/`,
                method: 'POST',
                body: operational_date ? { operational_date } : {},
            }),
            invalidatesTags: ['Uploads', 'Pautas'],
        }),

        // ==================== PAUTAS ====================
        getPautas: builder.query<PaginatedResponse<PautaListItem>, PautaFilterParams>({
            query: (params) => ({ url: '/truck-cycle-pauta/', params }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.results.map(({ id }) => ({ type: 'Pautas' as const, id })),
                        { type: 'Pautas', id: 'LIST' },
                    ]
                    : [{ type: 'Pautas', id: 'LIST' }],
        }),
        getPauta: builder.query<PautaDetail, number>({
            query: (id) => ({ url: `/truck-cycle-pauta/${id}/` }),
            providesTags: (_result, _error, id) => [{ type: 'Pautas', id }],
        }),
        getWorkstation: builder.query<WorkstationData, { operational_date?: string } | void>({
            query: (params) => ({ url: '/truck-cycle-pauta/workstation/', params: params || undefined }),
            providesTags: ['Pautas'],
        }),
        getReloadQueue: builder.query<PaginatedResponse<PautaListItem>, { operational_date?: string } | void>({
            query: (params) => ({ url: '/truck-cycle-pauta/reload_queue/', params: params || undefined }),
            providesTags: ['Pautas'],
        }),
        getKPISummary: builder.query<KPISummary, { operational_date?: string }>({
            query: (params) => ({ url: '/truck-cycle-pauta/kpi_summary/', params }),
        }),

        // ==================== PAUTA TRANSITIONS ====================
        assignPicker: builder.mutation<PautaDetail, { id: number; personnel_id: number }>({
            query: ({ id, ...body }) => ({
                url: `/truck-cycle-pauta/${id}/assign_picker/`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        takeAsPicker: builder.mutation<PautaDetail, { id: number; personnel_id?: number }>({
            query: ({ id, personnel_id }) => ({
                url: `/truck-cycle-pauta/${id}/take_as_picker/`,
                method: 'POST',
                body: personnel_id ? { personnel_id } : {},
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        getPickerStats: builder.query<PickerStats, { operational_date?: string; personnel_id?: number } | void>({
            query: (params) => ({ url: '/truck-cycle-pauta/picker_stats/', params: params || undefined }),
            providesTags: ['Pautas'],
        }),
        takeAsCounter: builder.mutation<PautaDetail, number>({
            query: (id) => ({ url: `/truck-cycle-pauta/${id}/take_as_counter/`, method: 'POST' }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        getCounterStats: builder.query<CounterStats, { operational_date?: string; personnel_id?: number } | void>({
            query: (params) => ({ url: '/truck-cycle-pauta/counter_stats/', params: params || undefined }),
            providesTags: ['Pautas'],
        }),
        takeAsSecurity: builder.mutation<PautaDetail, { id: number; exit_pass_consumables?: boolean }>({
            query: ({ id, ...body }) => ({ url: `/truck-cycle-pauta/${id}/take_as_security/`, method: 'POST', body }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        getSecurityStats: builder.query<ValidatorStats, { operational_date?: string; personnel_id?: number } | void>({
            query: (params) => ({ url: '/truck-cycle-pauta/security_stats/', params: params || undefined }),
            providesTags: ['Pautas'],
        }),
        takeAsOps: builder.mutation<PautaDetail, number>({
            query: (id) => ({ url: `/truck-cycle-pauta/${id}/take_as_ops/`, method: 'POST' }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        getOpsStats: builder.query<ValidatorStats, { operational_date?: string; personnel_id?: number } | void>({
            query: (params) => ({ url: '/truck-cycle-pauta/ops_stats/', params: params || undefined }),
            providesTags: ['Pautas'],
        }),
        takeAsYardDriver: builder.mutation<PautaDetail, number>({
            query: (id) => ({ url: `/truck-cycle-pauta/${id}/take_as_yard_driver/`, method: 'POST' }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        takeBayForReturn: builder.mutation<PautaDetail, number>({
            query: (id) => ({ url: `/truck-cycle-pauta/${id}/take_bay_for_return/`, method: 'POST' }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        parkTruck: builder.mutation<PautaDetail, number>({
            query: (id) => ({ url: `/truck-cycle-pauta/${id}/park_truck/`, method: 'POST' }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        getYardStats: builder.query<YardDriverStats, { operational_date?: string; personnel_id?: number } | void>({
            query: (params) => ({ url: '/truck-cycle-pauta/yard_stats/', params: params || undefined }),
            providesTags: ['Pautas'],
        }),
        getVendorStats: builder.query<VendorStats, { operational_date?: string } | void>({
            query: (params) => ({ url: '/truck-cycle-pauta/vendor_stats/', params: params || undefined }),
            providesTags: ['Pautas'],
        }),
        startTrip: builder.mutation<PautaDetail, number>({
            query: (id) => ({ url: `/truck-cycle-pauta/${id}/start_trip/`, method: 'POST' }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        startPicking: builder.mutation<PautaDetail, number>({
            query: (id) => ({ url: `/truck-cycle-pauta/${id}/start_picking/`, method: 'POST' }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        completePicking: builder.mutation<PautaDetail, number>({
            query: (id) => ({ url: `/truck-cycle-pauta/${id}/complete_picking/`, method: 'POST' }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        assignBay: builder.mutation<PautaDetail, { id: number; bay_id: number; yard_driver_id?: number }>({
            query: ({ id, ...body }) => ({
                url: `/truck-cycle-pauta/${id}/assign_bay/`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        assignYardDriver: builder.mutation<PautaDetail, { id: number; personnel_id: number }>({
            query: ({ id, ...body }) => ({
                url: `/truck-cycle-pauta/${id}/assign_yard_driver/`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        positionAtBay: builder.mutation<PautaDetail, { id: number; bay_id: number }>({
            query: ({ id, ...body }) => ({
                url: `/truck-cycle-pauta/${id}/position_at_bay/`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        reloadReentry: builder.mutation<PautaDetail, { id: number; truck_id: number; bay_id: number }>({
            query: ({ id, ...body }) => ({
                url: `/truck-cycle-pauta/${id}/reload_reentry/`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        completeLoading: builder.mutation<PautaDetail, number>({
            query: (id) => ({ url: `/truck-cycle-pauta/${id}/complete_loading/`, method: 'POST' }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        assignCounter: builder.mutation<PautaDetail, { id: number; personnel_id: number }>({
            query: ({ id, ...body }) => ({
                url: `/truck-cycle-pauta/${id}/assign_counter/`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        completeCount: builder.mutation<PautaDetail, number>({
            query: (id) => ({ url: `/truck-cycle-pauta/${id}/complete_count/`, method: 'POST' }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        checkoutSecurity: builder.mutation<PautaDetail, { id: number; validator_id: number }>({
            query: ({ id, ...body }) => ({
                url: `/truck-cycle-pauta/${id}/checkout_security/`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        checkoutOps: builder.mutation<PautaDetail, { id: number; validator_id: number }>({
            query: ({ id, ...body }) => ({
                url: `/truck-cycle-pauta/${id}/checkout_ops/`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        dispatchPauta: builder.mutation<PautaDetail, { id: number; driver_id?: number }>({
            query: ({ id, driver_id }) => ({
                url: `/truck-cycle-pauta/${id}/dispatch/`,
                method: 'POST',
                body: driver_id ? { driver_id } : {},
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        arrivalPauta: builder.mutation<PautaDetail, number>({
            query: (id) => ({ url: `/truck-cycle-pauta/${id}/arrival/`, method: 'POST' }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        processReturn: builder.mutation<PautaDetail, number>({
            query: (id) => ({ url: `/truck-cycle-pauta/${id}/process_return/`, method: 'POST' }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        closePauta: builder.mutation<PautaDetail, number>({
            query: (id) => ({ url: `/truck-cycle-pauta/${id}/close/`, method: 'POST' }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        startAudit: builder.mutation<PautaDetail, number>({
            query: (id) => ({ url: `/truck-cycle-pauta/${id}/start_audit/`, method: 'POST' }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),
        completeAudit: builder.mutation<PautaDetail, number>({
            query: (id) => ({ url: `/truck-cycle-pauta/${id}/complete_audit/`, method: 'POST' }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Pautas', id }, { type: 'Pautas', id: 'LIST' }],
        }),

        // ==================== INCONSISTENCIES ====================
        getInconsistencies: builder.query<PaginatedResponse<Inconsistency>, { pauta?: number }>({
            query: (params) => ({ url: '/truck-cycle-inconsistency/', params }),
            providesTags: ['Inconsistencies'],
        }),
        createInconsistency: builder.mutation<Inconsistency, Partial<Inconsistency>>({
            query: (data) => ({ url: '/truck-cycle-inconsistency/', method: 'POST', body: data }),
            invalidatesTags: ['Inconsistencies', 'Pautas'],
        }),
        deleteInconsistency: builder.mutation<void, number>({
            query: (id) => ({ url: `/truck-cycle-inconsistency/${id}/`, method: 'DELETE' }),
            invalidatesTags: ['Inconsistencies', 'Pautas'],
        }),

        // ==================== PHOTOS ====================
        uploadPhoto: builder.mutation<PautaPhoto, FormData>({
            query: (formData) => ({
                url: '/truck-cycle-photo/',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Photos', 'Pautas'],
        }),
        getPhotos: builder.query<PaginatedResponse<PautaPhoto>, { pauta?: number }>({
            query: (params) => ({ url: '/truck-cycle-photo/', params }),
            providesTags: ['Photos'],
        }),

        // ==================== PALLET TICKETS ====================
        getPalletTickets: builder.query<PaginatedResponse<PalletTicket>, { pauta?: number }>({
            query: (params) => ({ url: '/truck-cycle-pallet-ticket/', params }),
            providesTags: ['PalletTickets'],
        }),
        scanPalletTicket: builder.mutation<PalletTicket, { id: number }>({
            query: ({ id }) => ({
                url: `/truck-cycle-pallet-ticket/${id}/scan/`,
                method: 'POST',
            }),
            invalidatesTags: ['PalletTickets'],
        }),
        generatePalletTickets: builder.mutation<{ message: string; ticket_ids: number[]; pauta_id: number }, { pauta_id: number }>({
            query: (data) => ({
                url: '/truck-cycle-pallet-ticket/generate_for_pauta/',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PalletTickets', 'Pautas'],
        }),
    }),
});

// Export all hooks
export const {
    // Trucks
    useGetTrucksQuery,
    useCreateTruckMutation,
    useUpdateTruckMutation,
    useDeleteTruckMutation,
    // Bays
    useGetBaysQuery,
    useCreateBayMutation,
    useUpdateBayMutation,
    useDeleteBayMutation,
    // KPI
    useGetKPITargetsQuery,
    useCreateKPITargetMutation,
    useUpdateKPITargetMutation,
    // Uploads
    useGetUploadsQuery,
    useDownloadTemplateQuery,
    useLazyDownloadTemplateQuery,
    usePreviewUploadMutation,
    useConfirmUploadMutation,
    // Pautas
    useGetPautasQuery,
    useGetPautaQuery,
    useGetWorkstationQuery,
    useGetReloadQueueQuery,
    useGetKPISummaryQuery,
    // Transitions
    useAssignPickerMutation,
    useTakeAsPickerMutation,
    useGetPickerStatsQuery,
    useTakeAsCounterMutation,
    useGetCounterStatsQuery,
    useTakeAsSecurityMutation,
    useGetSecurityStatsQuery,
    useTakeAsOpsMutation,
    useGetOpsStatsQuery,
    useTakeAsYardDriverMutation,
    useTakeBayForReturnMutation,
    useParkTruckMutation,
    useGetYardStatsQuery,
    useGetVendorStatsQuery,
    useStartTripMutation,
    useStartPickingMutation,
    useCompletePickingMutation,
    useAssignBayMutation,
    useAssignYardDriverMutation,
    usePositionAtBayMutation,
    useReloadReentryMutation,
    useCompleteLoadingMutation,
    useAssignCounterMutation,
    useCompleteCountMutation,
    useCheckoutSecurityMutation,
    useCheckoutOpsMutation,
    useDispatchPautaMutation,
    useArrivalPautaMutation,
    useProcessReturnMutation,
    useClosePautaMutation,
    useStartAuditMutation,
    useCompleteAuditMutation,
    // Inconsistencies
    useGetInconsistenciesQuery,
    useCreateInconsistencyMutation,
    useDeleteInconsistencyMutation,
    // Photos
    useUploadPhotoMutation,
    useGetPhotosQuery,
    // Pallet Tickets
    useGetPalletTicketsQuery,
    useScanPalletTicketMutation,
    useGeneratePalletTicketsMutation,
} = truckCycleApi;
