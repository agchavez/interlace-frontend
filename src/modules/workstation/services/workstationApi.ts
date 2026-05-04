/**
 * RTK Query slice para el módulo Workstation (modelo de bloques).
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../store/store';
import { getTvToken } from '../../tv/utils/tvToken';
import type {
    ProhibitionCatalogItem,
    RiskCatalogItem,
    Workstation,
    WorkstationBlock,
    WorkstationDocument,
    WorkstationImage,
    WorkstationListItem,
} from '../interfaces/workstation';

const API_URL = import.meta.env.VITE_JS_APP_API_URL;

export interface WorkstationFilters {
    distributor_center?: number;
    role?: string;
    is_active?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
}

export interface DocumentMeta {
    id: number;
    name: string;
    doc_type: string;
    doc_type_display: string;
    workstation_id: number;
    workstation_label: string;
    distributor_center: string;
    role: string;
    role_display: string;
}

export interface BlockPayload {
    type: string;
    config: Record<string, any>;
    grid_x: number;
    grid_y: number;
    grid_w: number;
    grid_h: number;
    is_active?: boolean;
}

export const workstationApi = createApi({
    reducerPath: 'workstationApi',
    tagTypes: ['Workstation', 'WorkstationList', 'RiskCatalog', 'ProhibitionCatalog'],
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/api`,
        prepareHeaders: (headers, { getState }) => {
            // En modo TV el usuario humano no existe — autenticamos con
            // X-TV-Token para que el backend resuelva la sesión TV.
            const tvToken = getTvToken();
            if (tvToken) {
                headers.set('X-TV-Token', tvToken);
                return headers;
            }
            const token = (getState() as RootState).auth.token;
            if (token) headers.set('Authorization', `Bearer ${token}`);
            return headers;
        },
    }),
    endpoints: (builder) => ({
        // Workstations
        getWorkstations: builder.query<WorkstationListItem[], WorkstationFilters | void>({
            query: (params) => ({ url: '/workstations/', params: params || {} }),
            transformResponse: (raw: WorkstationListItem[] | { results: WorkstationListItem[] }) =>
                Array.isArray(raw) ? raw : (raw?.results ?? []),
            providesTags: ['WorkstationList'],
        }),
        getWorkstation: builder.query<Workstation, number>({
            query: (id) => `/workstations/${id}/`,
            providesTags: (_r, _e, id) => [{ type: 'Workstation', id }],
        }),
        createWorkstation: builder.mutation<Workstation, Partial<Workstation>>({
            query: (body) => ({ url: '/workstations/', method: 'POST', body }),
            invalidatesTags: ['WorkstationList'],
        }),
        // Idempotente: si la WS para (CD, role) ya existe la devuelve, sino la crea.
        // Evita el 400 unique-together cuando el cache de la lista está stale.
        ensureWorkstation: builder.mutation<Workstation, { distributor_center: number; role: string }>({
            query: (body) => ({ url: '/workstations/ensure-for-role/', method: 'POST', body }),
            invalidatesTags: ['WorkstationList'],
        }),
        // Top / Bottom performers para el bloque PERFORMERS de la TV.
        getPerformers: builder.query<{
            metric: { code: string; name: string; unit: string; direction: string } | null;
            top: Array<{ personnel_id: number; name: string; photo_url: string | null; value: number }>;
            bottom: Array<{ personnel_id: number; name: string; photo_url: string | null; value: number }>;
            period?: string;
            error?: string;
        }, { workstationId: number; metric_code: string; top_count?: number; bottom_count?: number; period?: 'today' | 'week' }>({
            query: ({ workstationId, ...params }) => ({
                url: `/workstations/${workstationId}/performers/`,
                params,
            }),
        }),
        updateWorkstation: builder.mutation<Workstation, { id: number; data: Partial<Workstation> }>({
            query: ({ id, data }) => ({ url: `/workstations/${id}/`, method: 'PATCH', body: data }),
            invalidatesTags: (_r, _e, { id }) => [{ type: 'Workstation', id }, 'WorkstationList'],
        }),
        deleteWorkstation: builder.mutation<void, number>({
            query: (id) => ({ url: `/workstations/${id}/`, method: 'DELETE' }),
            invalidatesTags: ['WorkstationList'],
        }),

        // Bloques: reemplazo masivo (raro, solo se usa en init)
        setBlocks: builder.mutation<Workstation, { id: number; blocks: BlockPayload[] }>({
            query: ({ id, blocks }) => ({
                url: `/workstations/${id}/set_blocks/`,
                method: 'POST',
                body: { blocks },
            }),
            invalidatesTags: (_r, _e, { id }) => [{ type: 'Workstation', id }, 'WorkstationList'],
        }),
        applyTemplate: builder.mutation<Workstation, number>({
            query: (id) => ({ url: `/workstations/${id}/apply_template/`, method: 'POST' }),
            invalidatesTags: (_r, _e, id) => [{ type: 'Workstation', id }, 'WorkstationList'],
        }),
        // Bloques individuales (usados por las secciones del drawer)
        createBlock: builder.mutation<WorkstationBlock, Partial<WorkstationBlock> & { workstation: number }>({
            query: (body) => ({ url: '/workstation-blocks/', method: 'POST', body }),
            invalidatesTags: (_r, _e, body) => [{ type: 'Workstation', id: body.workstation }],
        }),
        updateBlock: builder.mutation<WorkstationBlock, { id: number; workstationId: number; data: Partial<WorkstationBlock> }>({
            query: ({ id, data }) => ({ url: `/workstation-blocks/${id}/`, method: 'PATCH', body: data }),
            invalidatesTags: (_r, _e, { workstationId }) => [{ type: 'Workstation', id: workstationId }],
        }),
        deleteBlock: builder.mutation<void, { id: number; workstationId: number }>({
            query: ({ id }) => ({ url: `/workstation-blocks/${id}/`, method: 'DELETE' }),
            invalidatesTags: (_r, _e, { workstationId }) => [{ type: 'Workstation', id: workstationId }],
        }),

        // Catálogos
        getRiskCatalog: builder.query<RiskCatalogItem[], void>({
            query: () => '/workstation-risk-catalog/',
            transformResponse: (raw: RiskCatalogItem[] | { results: RiskCatalogItem[] }) =>
                Array.isArray(raw) ? raw : (raw?.results ?? []),
            providesTags: ['RiskCatalog'],
        }),
        getProhibitionCatalog: builder.query<ProhibitionCatalogItem[], void>({
            query: () => '/workstation-prohibition-catalog/',
            transformResponse: (raw: ProhibitionCatalogItem[] | { results: ProhibitionCatalogItem[] }) =>
                Array.isArray(raw) ? raw : (raw?.results ?? []),
            providesTags: ['ProhibitionCatalog'],
        }),

        // Documentos (PDF)
        uploadDocument: builder.mutation<WorkstationDocument, {
            workstationId: number; doc_type: string; name: string; file: File;
        }>({
            query: ({ workstationId, doc_type, name, file }) => {
                const fd = new FormData();
                fd.append('workstation', String(workstationId));
                fd.append('doc_type', doc_type);
                fd.append('name', name);
                fd.append('file', file);
                return { url: '/workstation-documents/', method: 'POST', body: fd };
            },
            invalidatesTags: (_r, _e, { workstationId }) => [{ type: 'Workstation', id: workstationId }],
        }),
        deleteDocument: builder.mutation<void, { id: number; workstationId: number }>({
            query: ({ id }) => ({ url: `/workstation-documents/${id}/`, method: 'DELETE' }),
            invalidatesTags: (_r, _e, { workstationId }) => [{ type: 'Workstation', id: workstationId }],
        }),

        // Imágenes
        uploadImage: builder.mutation<WorkstationImage, {
            workstationId: number; name: string; alt?: string; file: File;
        }>({
            query: ({ workstationId, name, alt, file }) => {
                const fd = new FormData();
                fd.append('workstation', String(workstationId));
                fd.append('name', name);
                if (alt) fd.append('alt', alt);
                fd.append('file', file);
                return { url: '/workstation-images/', method: 'POST', body: fd };
            },
            invalidatesTags: (_r, _e, { workstationId }) => [{ type: 'Workstation', id: workstationId }],
        }),
        deleteImage: builder.mutation<void, { id: number; workstationId: number }>({
            query: ({ id }) => ({ url: `/workstation-images/${id}/`, method: 'DELETE' }),
            invalidatesTags: (_r, _e, { workstationId }) => [{ type: 'Workstation', id: workstationId }],
        }),

        // Viewer PDF por qr_token
        getDocumentMeta: builder.query<DocumentMeta, string>({
            query: (qrToken) => `/workstation-doc/${qrToken}/`,
        }),

        // KPIs disponibles (con KpiTarget vigente) para el CD del workstation.
        // Lo usa el drawer en la sección Disparadores.
        getAvailableKpis: builder.query<{
            items: Array<{
                code: string; name: string; meta: string; disparador: string;
                unit: string; direction: 'HIGHER_IS_BETTER' | 'LOWER_IS_BETTER';
            }>;
            diagnostics: {
                distributor_center_id: number | null;
                total_targets: number;
                legacy_targets: number;
                targets_with_metric: number;
                inactive_metric_type: number;
                not_yet_effective: number;
                expired: number;
                today: string;
            };
        }, number>({
            query: (workstationId) => `/workstations/${workstationId}/available_kpis/`,
            providesTags: (_r, _e, id) => [{ type: 'Workstation', id }],
        }),
    }),
});

export const {
    useGetWorkstationsQuery,
    useGetWorkstationQuery,
    useCreateWorkstationMutation,
    useEnsureWorkstationMutation,
    useGetPerformersQuery,
    useUpdateWorkstationMutation,
    useDeleteWorkstationMutation,
    useSetBlocksMutation,
    useApplyTemplateMutation,
    useCreateBlockMutation,
    useUpdateBlockMutation,
    useDeleteBlockMutation,
    useGetRiskCatalogQuery,
    useGetProhibitionCatalogQuery,
    useUploadDocumentMutation,
    useDeleteDocumentMutation,
    useUploadImageMutation,
    useDeleteImageMutation,
    useGetDocumentMetaQuery,
    useGetAvailableKpisQuery,
} = workstationApi;
