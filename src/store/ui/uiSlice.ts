import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DashboardQueryParams } from '../../interfaces/login';
import { format } from "date-fns";
import { TrackerQueryParams } from '../../interfaces/tracking';


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
}

const initialState: uiState = {
    loading: false,
    dashboardQueryParams: {
        filterDate: FilterDate.TODAY,
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: format(new Date(), "yyyy-MM-dd")
    },
    manageQueryParams: {
        limit: 15,
        offset: 0,
        status: "COMPLETE",
        date_before: format(new Date(), "yyyy-MM-dd"),
        date_after: format(new Date(), "yyyy-MM-dd"),
        filter_date: FilterDate.TODAY,
        
    }
}

export const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setLoading: (state, action:PayloadAction<boolean>) => {
            state.loading = action.payload
        },
        setDashboardQueryParams: (state, action:PayloadAction<DashboardQueryParams>) => {
            state.dashboardQueryParams = action.payload
        },
        setManageQueryParams: (state, action:PayloadAction<TrackerQueryParams>) => {
            state.manageQueryParams = action.payload
        }

    }
})


export const {
    setLoading,
    setDashboardQueryParams,
    setManageQueryParams
} = uiSlice.actions;