import { createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

import { RootState } from '..'
import { UserResponse, UserQuerySearch, CreateUserResponse, CreateUserBody, GetDistributionCenterResponse } from '../../interfaces/user';

// ── Tipos para Carga Masiva ──────────────────────────────────────────────────

export interface BulkUploadRowError {
  campo: string;
  mensaje: string;
}

/** Datos de una persona del archivo (personal + laboral + EPP + acceso opcional) */
export interface BulkPersonnelData {
  tipo: 'SOLO_PERSONAL' | 'CON_USUARIO';
  first_name: string;
  last_name: string;
  employee_code: string;
  personal_id: string | null;
  birth_date: string | null;
  gender: 'M' | 'F' | null;
  marital_status: string;
  phone: string;
  email: string;           // email de contacto
  address: string;
  city: string;
  hire_date: string | null;
  contract_type: string | null;
  area: string | null;
  hierarchy_level: string | null;
  position: string;
  position_type: string | null;
  shirt_size: string | null;
  pants_size: string | null;
  shoe_size: string | null;
  glove_size: string | null;
  helmet_size: string | null;
  // Solo para CON_USUARIO
  email_sistema: string | null;
  username: string | null;
  grupo_sistema: string | null;
}

export interface BulkUploadValidRow extends BulkPersonnelData {
  fila: number;
}

export interface BulkUploadErrorRow {
  fila: number;
  datos: BulkPersonnelData;
  errores: BulkUploadRowError[];
}

/** Lo que se envía al confirm — idéntico a valid_row + password para CON_USUARIO */
export interface BulkUploadConfirmRow extends BulkPersonnelData {
  password?: string;
}

export interface BulkUploadPreviewResponse {
  centro_distribucion: number;
  centro_distribucion_name: string;
  total_filas: number;
  filas_validas: number;
  filas_con_error: number;
  valid_rows: BulkUploadValidRow[];
  error_rows: BulkUploadErrorRow[];
}

export interface BulkUploadConfirmResponse {
  status: 'success';
  created: number;
  registros: Array<{
    employee_code: string;
    full_name: string;
    tipo: 'SOLO_PERSONAL' | 'CON_USUARIO';
    tiene_usuario: boolean;
    username: string | null;
  }>;
}

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_JS_APP_API_URL + '/api',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        }
    }),
    tagTypes: ['Users'],
    endpoints: (builder) => ({
        getUser: builder.query<UserResponse, UserQuerySearch>({
            query: (params) => ({
                url: `/users/`,
                method: 'GET',
                params
            })
        }),
        getAUser: builder.query<UserResponse, number>({
            query: (id) => ({
                url: `/users/${id}/`,
                method: 'GET'
            })
        }),
        insertUser: builder.mutation<CreateUserResponse, CreateUserBody>({
            query: (data) => ({
                url: `/users/`,
                method: 'POST',
                body: {...data, groups:[data.group], employee_number: data.employee_number || null} 
            }),
            invalidatesTags: (data)=> [{type: 'Users', id:data?.email}]
        }),
        patchUser: builder.mutation<CreateUserResponse, {id:number, user:Partial<CreateUserBody>}>({
            query: (user) => ({
                url: `/users/${user.id}/`,
                method: 'PATCH',
                body: {...user.user, groups:[user.user.group], employee_number: user.user.employee_number || null}
            }),
            invalidatesTags: (data)=> [{type: 'Users', id:data?.id}]
        }),
        getDistributionCenter: builder.query<GetDistributionCenterResponse[], unknown>({
            query: () => ({
                url:`/distribution-center/`,
                method: 'GET',
            })
        }),
        generateUsername: builder.mutation<{
            suggestions: Array<{ username: string; available: boolean }>;
            first_name: string;
            last_name: string;
        }, { first_name: string; last_name: string }>({
            query: (data) => ({
                url: `/users/generate-username/`,
                method: 'POST',
                body: data
            })
        }),
        checkUsername: builder.mutation<{
            username: string;
            available: boolean;
            message: string;
            error?: string;
        }, { username: string }>({
            query: (data) => ({
                url: `/users/check-username/`,
                method: 'POST',
                body: data
            })
        }),

        // ── Carga Masiva ─────────────────────────────────────────────────────

        bulkUploadPreview: builder.mutation<BulkUploadPreviewResponse, FormData>({
            query: (formData) => ({
                url: `/users/bulk-upload-preview/`,
                method: 'POST',
                body: formData,
            }),
        }),

        bulkUploadConfirm: builder.mutation<BulkUploadConfirmResponse, {
            centro_distribucion: number;
            rows: BulkUploadConfirmRow[];  // BulkPersonnelData + password opcional
        }>({
            query: (data) => ({
                url: `/users/bulk-upload-confirm/`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'Users', id: 'LIST' }],
        }),
    })
})

export const {
    useGetUserQuery,
    useGetAUserQuery,
    useInsertUserMutation,
    useGetDistributionCenterQuery,
    usePatchUserMutation,
    useGenerateUsernameMutation,
    useCheckUsernameMutation,
    useBulkUploadPreviewMutation,
    useBulkUploadConfirmMutation,
} = userApi

