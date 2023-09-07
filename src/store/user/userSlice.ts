import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../interfaces/login";
import { GetDistributionCenterResponse } from "../../interfaces/user";

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'checking';
export type LogOutType = 'timeout' | 'logout';

interface userInterface {
    user: User | null;
    distributionCenters: GetDistributionCenterResponse[];
}

const initialState: userInterface = {
    user: null,
    distributionCenters: []
}

export const userSlice = createSlice({
    name: "distributionCenters",
    initialState,
    reducers: {
        setDistributionCenters: (state, action:PayloadAction<GetDistributionCenterResponse[]>) => {
            state.distributionCenters = action.payload
        },
    }
})

export const {
    setDistributionCenters,
} = userSlice.actions;