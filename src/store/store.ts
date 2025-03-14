import { Action, ThunkAction, configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import {authSlice} from './auth'
import { seguimientoSlice } from "./seguimiento/seguimientoSlice";
import {authApi, notificationApi} from "./auth/authApi";
import { userApi } from './user/userApi';

import { userSlice } from "./user/userSlice";
import {distributorCenterApi, maintenanceApi} from './maintenance/maintenanceApi';
import { maintenanceSlice } from './maintenance/maintenanceSlice';
import { nearExpirationProductsApi, trackerApi, trackerDetailApi, trackerOutputApi, trackerPalletsApi, t2TrackingApi } from './seguimiento/trackerApi';
import { uiSlice } from './ui/uiSlice';
import { orderApi, orderSlice } from "./order";
import { inventoryApi } from "./inventory/api";

export const store = configureStore({
    reducer: {
        [authSlice.name]: authSlice.reducer,
        [maintenanceSlice.name]: maintenanceSlice.reducer,
        [seguimientoSlice.name]: seguimientoSlice.reducer,
        authApi: authApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
        [userSlice.name]: userSlice.reducer,
        [maintenanceApi.reducerPath]: maintenanceApi.reducer,
        [trackerApi.reducerPath]: trackerApi.reducer,
        [uiSlice.name]: uiSlice.reducer,
        [trackerPalletsApi.reducerPath]: trackerPalletsApi.reducer,
        [trackerOutputApi.reducerPath]: trackerOutputApi.reducer,
        [trackerDetailApi.reducerPath]: trackerDetailApi.reducer,
        [nearExpirationProductsApi.reducerPath]: nearExpirationProductsApi.reducer,
        [orderApi.reducerPath]: orderApi.reducer,
        [orderSlice.name]: orderSlice.reducer,
        [inventoryApi.reducerPath]: inventoryApi.reducer,
        [t2TrackingApi.reducerPath]: t2TrackingApi.reducer,
        [notificationApi.reducerPath]: notificationApi.reducer,
        [distributorCenterApi.reducerPath]: distributorCenterApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware()
        .concat(userApi.middleware)
        .concat(authApi.middleware)
        .concat(maintenanceApi.middleware)
        .concat(trackerApi.middleware)
        .concat(trackerPalletsApi.middleware)
        .concat(trackerOutputApi.middleware)
        .concat(nearExpirationProductsApi.middleware)
        .concat(trackerDetailApi.middleware)
        .concat(orderApi.middleware)
        .concat(inventoryApi.middleware)
        .concat(t2TrackingApi.middleware)
        .concat(notificationApi.middleware)
        .concat(distributorCenterApi.middleware)
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