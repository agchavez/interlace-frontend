import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DashboardQueryParams } from '../../interfaces/login';
import { format } from "date-fns";
import { OrderQueryParams, TrackerQueryParams } from '../../interfaces/tracking';
import { FormFilterShiftManage } from "../../modules/report/components/FilterShiftManage";
import { FormFilterT2 } from '../../modules/tracker_t2/components/FilterPreSale';


enum FilterDate {
    TODAY = 'Hoy',
    WEEK = 'Esta semana',
    MONTH = 'Este mes',
    YEAR = 'Este año',
}



export interface uiState {
    loading: boolean;
    dashboardQueryParams: DashboardQueryParams;
    manageQueryParams: TrackerQueryParams;
    orderQueryParams: OrderQueryParams;
    reportPallets: FormFilterShiftManage;
    managerT2QueryParams: FormFilterT2;
}

const initialState: uiState = {
    loading: false,
    dashboardQueryParams: {
        filterDate: FilterDate.TODAY,
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: format(new Date(), "yyyy-MM-dd")
    },
    reportPallets: {
        date_after: format(new Date(), "yyyy-MM-dd"),
        date_before: format(new Date(), "yyyy-MM-dd"),
        shift: undefined,
        distribution_center: undefined,
        product: undefined,
        expiration_date: null,
    },
    manageQueryParams: {
        limit: 15,
        offset: 0,
        status: "COMPLETE",
        date_before: format(new Date(), "yyyy-MM-dd"),
        date_after: format(new Date(), "yyyy-MM-dd"),
        filter_date: FilterDate.TODAY,
    },
    orderQueryParams: {
        limit: 10,
        offset: 0,
        status: "PENDING",
    },
    managerT2QueryParams: {
        date_after: format(new Date(), "yyyy-MM-dd"),
        date_before: format(new Date(), "yyyy-MM-dd"),
        search: "",
        status: ['APPLIED']
    },
}

export const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        },
        setDashboardQueryParams: (state, action: PayloadAction<DashboardQueryParams>) => {
            state.dashboardQueryParams = action.payload
        },
        setManageQueryParams: (state, action: PayloadAction<TrackerQueryParams>) => {
            state.manageQueryParams = action.payload
        },
        setQueryReportPallets: (state, action: PayloadAction<FormFilterShiftManage>) => {
            state.reportPallets = action.payload
        },
        setOrderQueryParams: (state, action: PayloadAction<OrderQueryParams>) => {
            state.orderQueryParams = action.payload
        },
        setManagerT2QueryParams: (state, action: PayloadAction<FormFilterT2>) => {
            state.managerT2QueryParams = action.payload
        }


    }
})


export const {
    setLoading,
    setDashboardQueryParams,
    setManageQueryParams,
    setQueryReportPallets,
    setOrderQueryParams,
    setManagerT2QueryParams
} = uiSlice.actions;