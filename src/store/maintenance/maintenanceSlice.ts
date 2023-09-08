import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DistributionCenter } from '../../interfaces/maintenance';
import { OutputType } from '../../interfaces/tracking';

interface MaintenanceState {
    loading: boolean;
    disctributionCenters: DistributionCenter[];
    outputType: OutputType[];
}

const initialState: MaintenanceState = {
    loading: false,
    disctributionCenters: [],
    outputType: []
}

export const maintenanceSlice = createSlice({
    name: "maintenance",
    initialState,
    reducers: {
        setDistributionCenters: (state, action: PayloadAction<DistributionCenter[]>) => {
            state.disctributionCenters = action.payload;
        },
        setOutputType: (state, action: PayloadAction<OutputType[]>) => {
            state.outputType = action.payload;
        }

    }

})

export const { 
    setOutputType,
    setDistributionCenters,
 } = maintenanceSlice.actions;