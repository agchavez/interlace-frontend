import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Rastra } from "../../interfaces/tracking";

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'checking';
export type LogOutType = 'timeout' | 'logout';

export interface DatosGeneralesSeguimiento {
    placa?: string;
    locEnvio?: string;
    conductor?: string;
    nDocumento?: number;
    nTransporte?:  number;
    nTraslado?:  number;
    nDocumentoSalida?: number;
}

export interface DatosOperador {
    tiempoEntrada?: Date;
    tiempoSalida?: Date;
    opm1?: string;
    opm2?:string;
}

interface DetalleCargaPalet {
    pallets: string;
    date: Date;
    amount: number
}

export interface DetalleCarga {
    name:string;
    sap: number;
    basic: number;
    amount:number;
    history: DetalleCargaPalet[]
}

interface Seguimiento {
    id: number,
    rastra: Rastra,
    datos?: DatosGeneralesSeguimiento,
    datosOperador?: DatosOperador,
    detalles: DetalleCarga[]
}

interface seguimientoInterface {
    seguimientos: Seguimiento[]
    seguimeintoActual?: Seguimiento;
}

const initialState: seguimientoInterface = {
    seguimientos: [],
}

export const seguimientoSlice = createSlice({
    name: "seguimiento",
    initialState,
    reducers: {
        addSeguimiento: (state, action: PayloadAction<Seguimiento>) => {
            state.seguimientos.push(action.payload)
        },
        removeSeguimiento: (state, action: PayloadAction<number>) => {
            state.seguimientos = state.seguimientos.filter(seg => seg.id !== action.payload)
        },
        setSeguimientoActual: (state, action: PayloadAction<number>) => {
            state.seguimeintoActual = state.seguimientos[state.seguimientos.findIndex((seg) => seg.id == action.payload)]
        },
        updateSeguimiento: (state, action: PayloadAction<Seguimiento>) => {
            if (!state.seguimeintoActual) throw new Error("No se ha seleccionado un Seguimiento")
            const index = state.seguimientos.findIndex((seg) => seg.id === action.payload.id)
            if (index === -1) throw new Error("Seguimiento no encontrado")
            state.seguimientos[index] = action.payload
            state.seguimeintoActual = state.seguimientos[index]
        }
    }
})

export const {
    addSeguimiento,
    setSeguimientoActual, 
    removeSeguimiento,
    updateSeguimiento
} = seguimientoSlice.actions;