import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DistributionCenter } from '../../interfaces/maintenance';

interface MaintenanceState {
    loading: boolean;
    disctributionCenters: DistributionCenter[];
}

const initialState: MaintenanceState = {
    loading: false,
    disctributionCenters: []
}

export const maintenanceSlice = createSlice({
    name: "maintenance",
    initialState,
    reducers: {
        setDistributionCenters: (state, action: PayloadAction<DistributionCenter[]>) => {
            state.disctributionCenters = action.payload;
        }
    }
})

export const { setDistributionCenters } = maintenanceSlice.actions;
