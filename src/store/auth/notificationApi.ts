// src/store/apis/notificationApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '..';

// Interfaces
export interface Notification {
    id: number;
    titulo: string;
    descripcion: string;
    leido: boolean;
}

export interface NotificationsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Notification[];
}

export const notificationApiALL = createApi({
    reducerPath: 'notificationApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_JS_APP_API_URL + '/api',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Notifications'],
    endpoints: (builder) => ({
        // No leídas
        getUnreadNotifications: builder.query<NotificationsResponse, void>({
            query: () => `/notification/?read=false`,
            providesTags: ['Notifications'],
        }),

        // Todas (paginación opcional)
        getAllNotifications: builder.query<NotificationsResponse, { limit?: number; offset?: number }>({
            query: ({ limit = 15, offset = 0 }) =>
                `/notification/?limit=${limit}&offset=${offset}`,
            providesTags: ['Notifications'],
        }),

        // Marcar como leída
        markNotificationAsRead: builder.mutation<Notification, number>({
            query: (id) => ({
                url: `/notification/${id}/mark_read/`,
                method: 'POST',
            }),
            invalidatesTags: ['Notifications'],
        }),

        // Marcar todas como leídas
        markAllNotificationsAsRead: builder.mutation<void, void>({
            query: () => ({
                url: `/notification/mark_all_read/`,
                method: 'POST',
            }),
            invalidatesTags: ['Notifications'],
        }),
    }),
});

export const {
    useGetUnreadNotificationsQuery,
    useGetAllNotificationsQuery,
    useMarkNotificationAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
} = notificationApiALL;
