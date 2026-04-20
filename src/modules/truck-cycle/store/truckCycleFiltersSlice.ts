import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { format } from 'date-fns';

export type OperationsPhaseKey = 'picking' | 'bay' | 'counting' | 'checkout' | 'audit' | 'dispatched';

interface PautaListFilters {
    date: string;
    status?: string;
    transport_number?: string;
}

interface TruckCycleFiltersState {
    operations: {
        date: string;
        phases: OperationsPhaseKey[];
    };
    pautaList: PautaListFilters;
    checkout: { date: string };
    counting: { date: string };
    picking: { date: string };
}

const today = () => format(new Date(), 'yyyy-MM-dd');

const initialState: TruckCycleFiltersState = {
    operations: { date: today(), phases: [] },
    pautaList: { date: today() },
    checkout: { date: today() },
    counting: { date: today() },
    picking: { date: today() },
};

export const truckCycleFiltersSlice = createSlice({
    name: 'truckCycleFilters',
    initialState,
    reducers: {
        setOperationsDate(state, action: PayloadAction<string>) {
            state.operations.date = action.payload;
        },
        toggleOperationsPhase(state, action: PayloadAction<OperationsPhaseKey>) {
            const idx = state.operations.phases.indexOf(action.payload);
            if (idx === -1) state.operations.phases.push(action.payload);
            else state.operations.phases.splice(idx, 1);
        },
        setOperationsPhases(state, action: PayloadAction<OperationsPhaseKey[]>) {
            state.operations.phases = action.payload;
        },
        clearOperationsPhases(state) {
            state.operations.phases = [];
        },
        setPautaListDate(state, action: PayloadAction<string>) {
            state.pautaList.date = action.payload;
        },
        setPautaListStatus(state, action: PayloadAction<string | undefined>) {
            state.pautaList.status = action.payload;
        },
        setPautaListTransportNumber(state, action: PayloadAction<string | undefined>) {
            state.pautaList.transport_number = action.payload;
        },
        clearPautaListFilters(state) {
            state.pautaList = { date: today() };
        },
        setCheckoutDate(state, action: PayloadAction<string>) {
            state.checkout.date = action.payload;
        },
        setCountingDate(state, action: PayloadAction<string>) {
            state.counting.date = action.payload;
        },
        setPickingDate(state, action: PayloadAction<string>) {
            state.picking.date = action.payload;
        },
    },
});

export const {
    setOperationsDate,
    toggleOperationsPhase,
    setOperationsPhases,
    clearOperationsPhases,
    setPautaListDate,
    setPautaListStatus,
    setPautaListTransportNumber,
    clearPautaListFilters,
    setCheckoutDate,
    setCountingDate,
    setPickingDate,
} = truckCycleFiltersSlice.actions;

export default truckCycleFiltersSlice.reducer;
