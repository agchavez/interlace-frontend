import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Usuario, LoginResponse } from "../../interfaces/login";

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'checking';
export type LogOutType = 'timeout' | 'logout';

interface authInterface {
    user: Usuario | null;
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
    status: 'checking',
    loading: false,
    openLogoutModal: false,
}

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action:PayloadAction<LoginResponse>) => {
            console.log("accion")
            state.user = action.payload.usuario;
            state.token = action.payload.token;
            state.isAuthenticated = action.payload.success;
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
        updateProfile: (state, action: PayloadAction<Usuario>) =>{
            state.user = action.payload;
            state.loading = false;
        }
    }
})

export const {
    login,
    logout,
    updateProfile,
} = authSlice.actions;