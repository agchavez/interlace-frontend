import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../interfaces/user";
import {DistributorCenter} from "../../interfaces/maintenance";

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'checking';
export type LogOutType = 'timeout' | 'logout';

interface userInterface {
    editingUser: User | null;
    loading: boolean;
    distributionCenters: DistributorCenter[];
}

const initialState: userInterface = {
    editingUser: null,
    loading: false,
    distributionCenters: []
}

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setDistributionCenters: (state, action:PayloadAction<DistributorCenter[]>) => {
            state.distributionCenters = action.payload
        },
        setEditingUser: (state, action:PayloadAction<User>) => {
            state.editingUser = action.payload
        },
        setLoadingUser: (state, action:PayloadAction<boolean>) => {
            state.loading = action.payload
        }
    }
})

export const {
    setDistributionCenters,
    setEditingUser,
    setLoadingUser
} = userSlice.actions;