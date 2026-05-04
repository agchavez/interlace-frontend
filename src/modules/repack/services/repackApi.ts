import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { RootState } from '../../../store';
import type { RepackEntry, RepackSession } from '../interfaces/repack';


interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}


export const repackApi = createApi({
    reducerPath: 'repackApi',
    tagTypes: ['RepackSession', 'RepackActiveSession', 'RepackEntry'],
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_JS_APP_API_URL + '/api',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth?.token;
            if (token) headers.set('Authorization', `Bearer ${token}`);
            return headers;
        },
    }),
    endpoints: (builder) => ({
        // ──── Sesiones ────
        listSessions: builder.query<
            PaginatedResponse<RepackSession>,
            { operational_date?: string; personnel?: number; status?: string; limit?: number; offset?: number } | void
        >({
            query: (params) => ({ url: '/repack-session/', params: params || {} }),
            providesTags: ['RepackSession'],
        }),
        getSession: builder.query<RepackSession, number>({
            query: (id) => `/repack-session/${id}/`,
            providesTags: (_r, _e, id) => [{ type: 'RepackSession', id }],
        }),
        getActiveSession: builder.query<RepackSession | null, void>({
            query: () => '/repack-session/active/',
            providesTags: ['RepackActiveSession'],
        }),
        startSession: builder.mutation<RepackSession, { personnel_id?: number; notes?: string; operational_date?: string }>({
            query: (body) => ({ url: '/repack-session/start/', method: 'POST', body }),
            invalidatesTags: ['RepackSession', 'RepackActiveSession'],
        }),
        finishSession: builder.mutation<RepackSession, number>({
            query: (id) => ({ url: `/repack-session/${id}/finish/`, method: 'POST' }),
            invalidatesTags: (_r, _e, id) => [
                'RepackSession', 'RepackActiveSession', { type: 'RepackSession', id },
            ],
        }),
        cancelSession: builder.mutation<RepackSession, number>({
            query: (id) => ({ url: `/repack-session/${id}/cancel/`, method: 'POST' }),
            invalidatesTags: (_r, _e, id) => [
                'RepackSession', 'RepackActiveSession', { type: 'RepackSession', id },
            ],
        }),

        // ──── Entries ────
        // box_count > 0 = registro de lote real (product + expiration_date).
        // box_count < 0 = ajuste rápido (product/expiration opcionales).
        // El backend valida y rechaza box_count == 0.
        addEntry: builder.mutation<RepackEntry, {
            session: number;
            product?: number | null;
            material_code?: string;
            product_name?: string;
            box_count: number;
            expiration_date?: string | null;
            notes?: string;
        }>({
            query: (body) => ({ url: '/repack-entry/', method: 'POST', body }),
            invalidatesTags: (_r, _e, body) => [
                'RepackEntry',
                'RepackActiveSession',
                { type: 'RepackSession', id: body.session },
            ],
        }),
        deleteEntry: builder.mutation<void, { id: number; sessionId: number }>({
            query: ({ id }) => ({ url: `/repack-entry/${id}/`, method: 'DELETE' }),
            invalidatesTags: (_r, _e, { sessionId }) => [
                'RepackEntry',
                'RepackActiveSession',
                { type: 'RepackSession', id: sessionId },
            ],
        }),
    }),
});

export const {
    useListSessionsQuery,
    useGetSessionQuery,
    useGetActiveSessionQuery,
    useStartSessionMutation,
    useFinishSessionMutation,
    useCancelSessionMutation,
    useAddEntryMutation,
    useDeleteEntryMutation,
} = repackApi;
