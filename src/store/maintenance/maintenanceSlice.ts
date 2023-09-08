import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DistributionCenter, Group } from '../../interfaces/maintenance';
interface MaintenanceState {
    loading: boolean;
    disctributionCenters: DistributionCenter[];
    groups: Group[];
}

const initialState: MaintenanceState = {
    loading: false,
    disctributionCenters: [],
    groups:[],
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
    }
})

export const { setDistributionCenters, setGroups } = maintenanceSlice.actions;
