import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../interfaces/user";
import { GetDistributionCenterResponse } from "../../interfaces/user";

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'checking';
export type LogOutType = 'timeout' | 'logout';

interface userInterface {
    editingUser: User | null;
    distributionCenters: GetDistributionCenterResponse[];
}

const initialState: userInterface = {
    editingUser: null,
    distributionCenters: []
}

export const userSlice = createSlice({
    name: "distributionCenters",
    initialState,
    reducers: {
        setDistributionCenters: (state, action:PayloadAction<GetDistributionCenterResponse[]>) => {
            state.distributionCenters = action.payload
        },
        setEditingUser: (state, action:PayloadAction<User>) => {
            state.editingUser = action.payload
        },
    }
})

export const {
    setDistributionCenters,
    setEditingUser
} = userSlice.actions;