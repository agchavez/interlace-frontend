import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DistributionCenter, Group, Period } from '../../interfaces/maintenance';
import { OutputType } from '../../interfaces/tracking';
interface MaintenanceState {
    loading: boolean;
    disctributionCenters: DistributionCenter[];
    groups: Group[];
    outputType: OutputType[];
    period?: Period;
}

const initialState: MaintenanceState = {
    loading: false,
    disctributionCenters: [],
    groups:[],
    outputType: [],
}

export const maintenanceSlice = createSlice({
    name: "maintenance",
    initialState,
    reducers: {
        setDistributionCenters: (state, action: PayloadAction<DistributionCenter[]>) => {
            state.disctributionCenters = action.payload;
        },
        setGroups: (state, action: PayloadAction<Group[]>) => {
            state.groups = action.payload;
        },
        setOutputType: (state, action: PayloadAction<OutputType[]>) => {
            state.outputType = action.payload;
        },
        setLoadingMain: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setPeriod:(state, action: PayloadAction<Period>) => {
            state.period = action.payload;
        },
    }
})

export const { 
  setOutputType,
  setDistributionCenters, 
  setGroups ,
  setLoadingMain,
  setPeriod
} = maintenanceSlice.actions;