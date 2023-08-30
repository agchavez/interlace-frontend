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
            state.status = action.payload
        }
    }
})

export const {
    login,
    logout,
    updateProfile,
    setStatus,
} = authSlice.actions;