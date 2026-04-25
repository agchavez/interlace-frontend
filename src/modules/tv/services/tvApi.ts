import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../../store/store';
import { getTvToken } from '../utils/tvToken';
import type { PautaListItem } from '../../truck-cycle/interfaces/truckCycle';

const API_URL = import.meta.env.VITE_JS_APP_API_URL;

export interface TvSessionPublic {
    code: string;
    status: 'PENDING' | 'PAIRED' | 'EXPIRED' | 'REVOKED';
    expires_at: string;
    dashboard: string;
    label: string;
    config: Record<string, unknown>;
}

export interface TvSessionPaired extends TvSessionPublic {
    access_token: string;
    distributor_center: number | null;
    distributor_center_name: string | null;
}

export interface TvCurrentShift {
    name: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
}

export interface TvWorkstationData {
    operational_date: string;
    workstation: Record<string, { label: string; count: number; pautas: PautaListItem[] }>;
    reload_queue: PautaListItem[];
    dashboard: string;
    label: string;
    distributor_center: number | null;
    current_shift: TvCurrentShift | null;
    shifts_today: TvCurrentShift[];
    day_code: string | null;
}

export interface TvSessionAdmin {
    id: number;
    code: string;
    status: string;
    label: string;
    created_at: string;
    paired_at: string | null;
    expires_at: string;
    last_seen_at: string | null;
    dashboard: string;
    distributor_center: number | null;
    distributor_center_name: string | null;
    paired_by: number | null;
    paired_by_name: string | null;
    config: Record<string, unknown>;
}

export const TV_DASHBOARDS: Array<{ value: string; label: string }> = [
    { value: 'WORKSTATION',         label: 'Workstation · Torre de control' },
    { value: 'WORKSTATION_PICKING', label: 'Workstation Picking · legacy' },
    { value: 'WORKSTATION_PICKER',  label: 'Workstation Picker · KPIs por turno' },
    { value: 'WORKSTATION_COUNTER', label: 'Workstation Contador · KPIs por turno' },
    { value: 'WORKSTATION_YARD',    label: 'Workstation Chofer de Patio · KPIs por turno' },
];

export const tvApi = createApi({
    reducerPath: 'tvApi',
    tagTypes: ['TvSessions'],
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/api`,
        prepareHeaders: (headers, { getState, endpoint }) => {
            // Endpoints TV-token usan X-TV-Token; los de vinculación JWT del usuario.
            const tvEndpoints = new Set([
                'getTvWorkstation',
                'heartbeat',
            ]);
            if (tvEndpoints.has(endpoint)) {
                const token = getTvToken();
                if (token) headers.set('X-TV-Token', token);
                return headers;
            }
            const jwt = (getState() as RootState).auth?.token;
            if (jwt) headers.set('Authorization', `Bearer ${jwt}`);
            return headers;
        },
    }),
    endpoints: (builder) => ({
        createTvSession: builder.mutation<TvSessionPublic, void>({
            query: () => ({ url: '/tv/sessions/', method: 'POST' }),
        }),
        getTvSession: builder.query<TvSessionPublic, string>({
            query: (code) => ({ url: `/tv/sessions/${code}/` }),
        }),
        pairTvSession: builder.mutation<TvSessionPaired, {
            code: string;
            distributor_center: number;
            dashboard?: string;
            label?: string;
            ttl_days?: number;
            config?: Record<string, unknown>;
        }>({
            query: ({ code, ...body }) => ({
                url: `/tv/sessions/${code}/pair/`, method: 'POST', body,
            }),
            invalidatesTags: ['TvSessions'],
        }),
        getMyTvSessions: builder.query<TvSessionAdmin[], {
            distributor_center?: number;
            include_inactive?: boolean;
        } | void>({
            query: (params) => ({
                url: '/tv/sessions/mine/',
                params: params
                    ? {
                        ...(params.distributor_center != null ? { distributor_center: params.distributor_center } : {}),
                        ...(params.include_inactive ? { include_inactive: 1 } : {}),
                    }
                    : undefined,
            }),
            providesTags: ['TvSessions'],
        }),
        updateTvSessionConfig: builder.mutation<TvSessionAdmin, {
            code: string;
            dashboard?: string;
            label?: string;
            config?: Record<string, unknown>;
        }>({
            query: ({ code, ...body }) => ({
                url: `/tv/sessions/${code}/update_config/`, method: 'POST', body,
            }),
            invalidatesTags: ['TvSessions'],
        }),
        revokeTvSession: builder.mutation<{ status: string }, string>({
            query: (code) => ({ url: `/tv/sessions/${code}/revoke/`, method: 'POST' }),
            invalidatesTags: ['TvSessions'],
        }),
        // TvToken-authed
        getTvWorkstation: builder.query<TvWorkstationData, { operational_date?: string } | void>({
            query: (params) => ({ url: '/tv/sessions/workstation/', params: params || undefined }),
        }),
        heartbeat: builder.mutation<{ ok: boolean; server_time: string }, void>({
            query: () => ({ url: '/tv/sessions/heartbeat/', method: 'POST' }),
        }),
    }),
});

export const {
    useCreateTvSessionMutation,
    useGetTvSessionQuery,
    usePairTvSessionMutation,
    useGetMyTvSessionsQuery,
    useUpdateTvSessionConfigMutation,
    useRevokeTvSessionMutation,
    useGetTvWorkstationQuery,
    useHeartbeatMutation,
} = tvApi;
