import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Rastra } from "../../interfaces/tracking";
import { toast } from 'sonner'

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
    index: number,
}

export interface Seguimiento {
    id: number,
    rastra: Rastra,
    datos?: DatosGeneralesSeguimiento,
    datosOperador?: DatosOperador,
    detalles: DetalleCarga[]
}

export interface SeguimientoIDX extends Seguimiento {
    index:number
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
        updateSeguimiento: (state, action: PayloadAction<SeguimientoIDX>) => {
            state.seguimientos[action.payload.index] = action.payload
        },
        addDetalleCarga: (state, action: PayloadAction<DetalleCargaIdx>) => {
            // No se puede agregar un producto que ya existe en el seguimiento validar por codigo sap
            if (state.seguimientos[action.payload.index].detalles.findIndex((det) => det.sap === action.payload.sap) !== -1) {
                toast.error("El producto ya existe en el seguimiento")
                return;
            }
            state.seguimientos[action.payload.index].detalles = [action.payload, ...state.seguimientos[action.payload.index].detalles]
        },
        addDetalleCargaPallet: (state, action: PayloadAction<AddDetalleCargaPalletData>) => {
            const {segIndex, detalleIndex} = action.payload
            state.seguimientos[segIndex].detalles[detalleIndex].history = [action.payload, ...state.seguimientos[segIndex].detalles[detalleIndex].history || []]
        },
        updateDetalleCargaPallet: (state, action: PayloadAction<DetalleCargaPaletModifyData>) => {
            const {segIndex, detalleIndex, paletIndex} = action.payload
            const seguimiento = state.seguimientos[segIndex];
            const detalle = seguimiento.detalles[detalleIndex];
            if(detalle.history) {
                detalle.history[paletIndex]= action.payload
            }
        },
        removeDetalleCargaPallet: (state, action: PayloadAction<DetalleCargaPaletRemoveData>) => {
            const {segIndex, detalleIndex, paletIndex} = action.payload
            const seguimiento = state.seguimientos[segIndex];
            const detalle = seguimiento.detalles[detalleIndex];
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
    addDetalleCargaPallet,
    updateDetalleCargaPallet,
    removeDetalleCargaPallet,
} = seguimientoSlice.actions;