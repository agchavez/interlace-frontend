import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Rastra } from "../../interfaces/tracking";

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'checking';
export type LogOutType = 'timeout' | 'logout';

export interface DatosGeneralesSeguimiento {
    placa?: string;
    locEnvio?: string;
    conductor?: string;
    nDocumento?: number;
    nTransporte?: number;
    nTraslado?: number;
    nDocumentoSalida?: number;
}

export interface DatosOperador {
    tiempoEntrada?: Date;
    tiempoSalida?: Date;
    opm1?: string;
    opm2?: string;
}

export interface DetalleCargaPalet {
    id?: number;
    pallets?: number;
    date?: Date;
    amount?: number
}

export interface DetalleCargaPaletIdx extends DetalleCargaPalet {
    palletIndex: number;
}

export interface DetalleCargaPaletModifyData extends DetalleCargaPalet {
    detalleIndex: number;
    segIndex: number;
    paletIndex: number;
}

export interface DetalleCargaPaletRemoveData {
    detalleIndex: number;
    segIndex: number;
    paletIndex: number;
}

interface AddDetalleCargaPalletData extends DetalleCargaPalet {
    segIndex: number;
    detalleIndex: number;
}

export interface DetalleCarga {
    id?: number;
    name?: string;
    sap?: number;
    basic?: number;
    amount?: number;
    history?: DetalleCargaPalet[]
}

export interface DetalleCargaIdx extends DetalleCarga {
    index: number
}

export interface Seguimiento {
    id: number,
    rastra: Rastra,
    datos?: DatosGeneralesSeguimiento,
    datosOperador?: DatosOperador,
    detalles: DetalleCarga[]
}

interface seguimientoInterface {
    seguimientos: Seguimiento[]
    seguimeintoActual?: number;
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
            state.seguimeintoActual = action.payload
        },
        updateSeguimiento: (state, action: PayloadAction<Seguimiento>) => {
            if (!state.seguimeintoActual) throw new Error("No se ha seleccionado un Seguimiento")
            const index = state.seguimientos.findIndex((seg) => seg.id === action.payload.id)
            if (index === -1) throw new Error("Seguimiento no encontrado")
            state.seguimientos[index] = action.payload
        },
        addDetalleCarga: (state, action: PayloadAction<DetalleCarga>) => {
            if (!state.seguimeintoActual) throw new Error("No se ha seleccionado un Seguimiento")
            const index1 = state.seguimientos.findIndex((seg) => seg.id === state.seguimeintoActual)
            if (index1 === -1) throw new Error("Seguimiento no encontrado")
            state.seguimientos[index1].detalles.push(action.payload)
        },
        updateDetalleCarga: (state, action: PayloadAction<DetalleCargaIdx>) => {
            if (!state.seguimeintoActual) throw new Error("No se ha seleccionado un Seguimiento")
            const index1 = state.seguimientos.findIndex((seg) => seg.id === state.seguimeintoActual)
            if (index1 === -1) throw new Error("Seguimiento no encontrado")
            state.seguimientos[index1].detalles[action.payload.index] = action.payload
        },
        addDetalleCargaPallet: (state, action: PayloadAction<AddDetalleCargaPalletData>) => {
            if (!state.seguimeintoActual) throw new Error("No se ha seleccionado un Seguimiento")
            const {segIndex, detalleIndex} = action.payload
            state.seguimientos[segIndex].detalles[detalleIndex].history?.push(action.payload)
        },
        updateDetalleCargaPallet: (state, action: PayloadAction<DetalleCargaPaletModifyData>) => {
            const {segIndex, detalleIndex, paletIndex} = action.payload
            const seguimiento = state.seguimientos[segIndex];
            if (!seguimiento) throw new Error("No se ha seleccionado un Seguimiento");
            const detalle = seguimiento.detalles[detalleIndex];
            if (!detalle) throw new Error("No se ha seleccionado un Seguimiento");
            if(detalle.history) {
                detalle.history[paletIndex]= action.payload
            }
        },
        removeDetalleCargaPallet: (state, action: PayloadAction<DetalleCargaPaletRemoveData>) => {
            const {segIndex, detalleIndex, paletIndex} = action.payload
            const seguimiento = state.seguimientos[segIndex];
            if (!seguimiento) throw new Error("No se ha seleccionado un Seguimiento");
            const detalle = seguimiento.detalles[detalleIndex];
            if (!detalle) throw new Error("No se ha seleccionado un Seguimiento");
            if(detalle.history) {
                const cortado = detalle.history.filter((_, indice) => indice !== paletIndex);
                detalle.history= cortado;
            }
        }
    }
})

export const {
    addSeguimiento,
    setSeguimientoActual,
    removeSeguimiento,
    updateSeguimiento,
    addDetalleCarga,
    updateDetalleCarga,
    addDetalleCargaPallet,
    updateDetalleCargaPallet,
    removeDetalleCargaPallet,
} = seguimientoSlice.actions;