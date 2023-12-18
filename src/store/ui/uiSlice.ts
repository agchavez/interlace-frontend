import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DashboardQueryParams } from '../../interfaces/login';
import { format } from "date-fns";
import { GraphQueryParams, InventarioMovimentQueryParams, OrderQueryParams, TrackerQueryParams } from '../../interfaces/tracking';
import { FormFilterShiftManage } from "../../modules/report/components/FilterShiftManage";
import { FormFilterT2 } from '../../modules/tracker_t2/components/FilterPreSale';
import { FormFilterInventory } from "../../modules/inventory/components/FilterInventory";
import { es } from "date-fns/locale";
import { TypeChart } from "../../modules/home/components/TATGraph";


enum FilterDate {
    TODAY = 'Hoy',
    WEEK = 'Esta semana',
    MONTH = 'Este mes',
    YEAR = 'Este año',
}


const actualYear = parseInt(format(new Date(), "yyyy", { locale: es }));
export interface uiState {
    loading: boolean;
    dashboardQueryParams: DashboardQueryParams;
    manageQueryParams: TrackerQueryParams;
    orderQueryParams: OrderQueryParams;
    reportPallets: FormFilterShiftManage;
    managerT2QueryParams: FormFilterT2;
    inventoryQueryParams: InventarioMovimentQueryParams;
    graphQueryParams: GraphQueryParams;
}

const storageGraphqueryParams = (()=>{
    const ls = localStorage.getItem("graph_params")
    if(ls === null) return
    const datos = JSON.parse(ls) as GraphQueryParams
    return datos
})()

const initialState: uiState = {
    loading: false,
    dashboardQueryParams: {
        filterDate: FilterDate.TODAY,
        start_date: format(new Date(), "yyyy-MM-dd 00:00:00"),
        end_date: format(new Date(), "yyyy-MM-dd 23:59:59"),
    },
    reportPallets: {
        date_after: format(new Date(), "yyyy-MM-dd 00:00:00"),
        date_before: format(new Date(), "yyyy-MM-dd 23:59:59"),
        shift: undefined,
        distribution_center: undefined,
        product: undefined,
        expiration_date: null,
    },
    manageQueryParams: {
        limit: 15,
        offset: 0,
        status: "COMPLETE",
        date_before: format(new Date(), "yyyy-MM-dd 23:59:59"),
        date_after: format(new Date(), "yyyy-MM-dd 00:00:00"),
        filter_date: FilterDate.TODAY,
    },
    orderQueryParams: {
        limit: 10,
        offset: 0,
        status: "PENDING",
    },
    managerT2QueryParams: {
        date_after: format(new Date(), "yyyy-MM-dd 00:00:00"),
        date_before: format(new Date(), "yyyy-MM-dd 23:59:59"),
        search: "",
        status: ['APPLIED']
    },
    inventoryQueryParams: {
        limit: 10,
        offset: 0,
        productos: [],
        distributor_center: [],
        module: [],
    },
    graphQueryParams: {
        year: storageGraphqueryParams?.year||actualYear,
        actualYear: actualYear, 
        typeChart: storageGraphqueryParams?.typeChart || TypeChart.BAR,
        distributor_center: storageGraphqueryParams?.distributor_center || [],
        encountered: storageGraphqueryParams? true: false,
    }
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
        },
        setInventoryQueryParams: (state, action: PayloadAction<FormFilterInventory>) => {
            state.inventoryQueryParams = action.payload
        },
        setGraphQueryParams: (state, action: PayloadAction<GraphQueryParams>) => {
            state.graphQueryParams = action.payload
            localStorage.setItem("graph_params", JSON.stringify(action.payload))
        },
    }
})


export const {
    setLoading,
    setDashboardQueryParams,
    setManageQueryParams,
    setQueryReportPallets,
    setOrderQueryParams,
    setManagerT2QueryParams, 
    setInventoryQueryParams,
    setGraphQueryParams
} = uiSlice.actions;