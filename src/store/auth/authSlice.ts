import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {LoginResponse, LoginResponseOk, User} from "../../interfaces/login";

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
    expiresIn: number | null;
}

const initialState: authInterface = {
    user: null,
    expiredIn: null,
    logoutType: null,
    tokenExpires: null,
    token: '',
    isAuthenticated: false,
    status: 'checking',
    loading: false,
    openLogoutModal: false,
    expiresIn: null,
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
        setDistributionCenters: (state, action: PayloadAction<{
            distributionCenter: number;
            name: string;
        }>) => {
            state.user!.centro_distribucion = action.payload.distributionCenter;
            state.user!.centro_distribucion_name = action.payload.name;
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

        loginUser: (state, action: PayloadAction<LoginResponse>) => {
            if (action.payload.token) {
                state.user = action.payload.user;
                state.token = action.payload.token.access;
                state.isAuthenticated = true;
                state.status = 'authenticated';
                state.expiresIn = action.payload.token.exp;
                state.loading = false;
            }
        },

        veryFyToken: (state, action: PayloadAction<LoginResponse>) => {
            if (action.payload.token) {
                state.token = action.payload.token.access;
                state.isAuthenticated = true;
                state.status = 'authenticated';
                state.expiresIn = action.payload.token.exp;
                state.openLogoutModal = false;
                state.loading = false;
            }
        },
        checkAuth: (state, action: PayloadAction<AuthStatus>) => {
            state.status = action.payload;
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
    setDistributionCenters,
    loginUser,
    veryFyToken,
    checkAuth
} = authSlice.actions;