import { Action, ThunkAction, configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { authSlice } from './auth'
import { seguimientoSlice } from "./seguimiento/seguimientoSlice";
import { authApi } from "./auth/authApi";
export const store = configureStore({
    reducer: {
        [authSlice.name]: authSlice.reducer,
        [seguimientoSlice.name]: seguimientoSlice.reducer,
        authApi: authApi.reducer
    }, 
    devTools: import.meta.env.DEV,
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(authApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch: () => typeof store.dispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type AppDispatch = typeof store.dispatch;
export type AppThunk = ThunkAction<
    Promise<void>,
    RootState,
    unknown,
    Action<unknown>
>;