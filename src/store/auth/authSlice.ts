import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LoginResponseOk, User } from "../../interfaces/login";

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'checking';
export type LogOutType = 'timeout' | 'logout';

interface authInterface {
    user: User | null;
    token: string;
    tokenExpires: Date | null;
    logoutType: LogOutType | null;
    isAuthenticated: boolean;
    status: AuthStatus;
    loading: boolean;
    openLogoutModal: boolean;
}

const initialState: authInterface = {
    user: null,
    logoutType: null,
    tokenExpires: null,
    token: localStorage.getItem('token') || '',
    isAuthenticated: false,
    status: 'authenticated',
    loading: false,
    openLogoutModal: false,
}

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action:PayloadAction<LoginResponseOk>) => {
            state.user = action.payload.user;
            state.token = action.payload.token.access;
            state.isAuthenticated = action.payload.user?true:false;
            state.status = "authenticated";
            state.loading = false
        },
        logout: (state) => {
            state.user = null
            state.token = ''
            state.isAuthenticated = false
            state.status = 'unauthenticated'
            state.openLogoutModal = false
            state.logoutType = null
            state.tokenExpires = null
            localStorage.removeItem("token")
        },
        updateProfile: (state, action: PayloadAction<LoginResponseOk>) =>{
            state.user = action.payload.user;
            state.loading = false;
        },
        setStatus: (state, action: PayloadAction<AuthStatus>) => {
            state.status = action.payload;
            state.user= {
                    "id": "cc9fc03d-2379-476f-b56d-346b15e8f125",
                    "list_groups": [],
                    "list_permissions": [
                        "contenttypes.view_contenttype",
                        "sessions.add_session",
                        "maintenance.view_centrodistribucion",
                        "auth.view_group",
                        "user.change_detailgroup",
                        "user.view_usermodel",
                        "contenttypes.add_contenttype",
                        "maintenance.delete_centrodistribucion",
                        "sessions.change_session",
                        "auth.view_permission",
                        "user.delete_detailgroup",
                        "auth.add_permission",
                        "auth.change_group",
                        "auth.change_permission",
                        "auth.delete_group",
                        "contenttypes.delete_contenttype",
                        "user.change_usermodel",
                        "auth.delete_permission",
                        "maintenance.change_centrodistribucion",
                        "admin.change_logentry",
                        "admin.add_logentry",
                        "user.view_detailgroup",
                        "user.add_usermodel",
                        "sessions.view_session",
                        "user.add_detailgroup",
                        "admin.view_logentry",
                        "sessions.delete_session",
                        "admin.delete_logentry",
                        "user.delete_usermodel",
                        "contenttypes.change_contenttype",
                        "maintenance.add_centrodistribucion",
                        "auth.add_group"
                    ],
                    "centro_distribucion": null,
                    "last_login": new Date("2023-08-30T06:32:08.853477-06:00"),
                    "is_superuser": true,
                    "username": "agchavez",
                    "is_staff": true,
                    "is_active": true,
                    "date_joined": new Date("2023-08-28T20:02:34.782965-06:00"),
                    "first_name": "RICARDO",
                    "last_name": "SALINAS",
                    "email": "agchavez@unah.hn",
                    "created_at": new Date("2023-08-28T20:02:34.935469-06:00"),
                    "groups": [],
                    "user_permissions": []
                };
            }
    }
})

export const {
    login,
    logout,
    updateProfile,
    setStatus,
} = authSlice.actions;