import { Action, ThunkAction, configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { authSlice } from './auth'
import { seguimientoSlice } from "./seguimiento/seguimientoSlice";
import { userApi } from './user/userApi';
import { maintenanceApi } from './maintenance/maintenanceApi';
import { maintenanceSlice } from './maintenance/maintenanceSlice';
export const store = configureStore({
    reducer: {
        [authSlice.name]: authSlice.reducer,
        [maintenanceSlice.name]: maintenanceSlice.reducer,
        [seguimientoSlice.name]: seguimientoSlice.reducer,
        [userApi.reducerPath]: userApi.reducer,
        [maintenanceApi.reducerPath]: maintenanceApi.reducer
    }, 
    middleware: (getDefaultMiddleware) => getDefaultMiddleware()
        .concat(userApi.middleware)
        .concat(maintenanceApi.middleware)
        ,
    devTools: true
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