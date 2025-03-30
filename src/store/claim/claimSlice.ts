import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Claim } from "./claimApi";

interface ClaimState {
  claims: Claim[];
  selectedClaim: Claim | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
}

const initialState: ClaimState = {
  claims: [],
  selectedClaim: null,
  loading: false,
  error: null,
  totalCount: 0
};

export const claimSlice = createSlice({
  name: "claim",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setClaims: (state, action: PayloadAction<Claim[]>) => {
      state.claims = action.payload;
    },
    setSelectedClaim: (state, action: PayloadAction<Claim | null>) => {
      state.selectedClaim = action.payload;
    },
    setTotalCount: (state, action: PayloadAction<number>) => {
      state.totalCount = action.payload;
    },
    addClaim: (state, action: PayloadAction<Claim>) => {
      state.claims.push(action.payload);
    },
    updateClaimInList: (state, action: PayloadAction<Claim>) => {
      const index = state.claims.findIndex(claim => claim.id === action.payload.id);
      if (index !== -1) {
        state.claims[index] = action.payload;
      }
    },
    resetClaimState: (state) => {
      state.selectedClaim = null;
      state.error = null;
    },
    clearClaims: (state) => {
      state.claims = [];
      state.totalCount = 0;
    }
  }
});

export const {
  setLoading,
  setError,
  setClaims,
  setSelectedClaim,
  setTotalCount,
  addClaim,
  updateClaimInList,
  resetClaimState,
  clearClaims
} = claimSlice.actions;

export default claimSlice.reducer;