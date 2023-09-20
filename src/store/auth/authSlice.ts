import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LoginResponseOk, User } from "../../interfaces/login";

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'checking';
export type LogOutType = 'timeout' | 'logout';

interface authInterface {
    user: User | null;
    token: string;
    expiredIn: string | null;
    tokenExpires: number | null;
    logoutType: LogOutType | null;
    isAuthenticated: boolean;
    status: AuthStatus;
    loading: boolean;
    openLogoutModal: boolean;
}

const initialState: authInterface = {
    user: null,
    expiredIn: null,
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
        login: (state, action:PayloadAction<LoginResponseOk>) => {
            localStorage.setItem("token", action.payload.token.refresh)
            state.user = action.payload.user;
            state.token = action.payload.token.access;
            state.tokenExpires = action.payload.token.exp;
            state.expiredIn = new Date(action.payload.token.exp * 1000).toISOString();
            state.isAuthenticated = action.payload.user?true:false;
            state.status = "authenticated";
            state.loading = false;
            state.openLogoutModal = false;
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
            state.openLogoutModal = false;
        },
        updateProfile: (state, action: PayloadAction<LoginResponseOk>) =>{
            state.user = action.payload.user;
            state.loading = false;
        },
        setStatus: (state, action: PayloadAction<AuthStatus>) => {
            state.status = action.payload;
            
            },
        setLoadingAuth: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        closeLogoutModal: (state) => {
            state.openLogoutModal = false;
        },
        openTimeoutModal: (state) => {
            state.openLogoutModal = true;
            state.logoutType = 'timeout';
        },
    }
})

export const {
    login,
    logout,
    updateProfile,
    setStatus,
    setLoadingAuth,
    closeLogoutModal,
    openTimeoutModal,
} = authSlice.actions;