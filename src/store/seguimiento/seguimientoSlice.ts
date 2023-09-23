import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from 'sonner'
import { Product, TarilerData, TransporterData } from '../../interfaces/tracking';
import { LocationType } from "../../interfaces/maintenance";

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
    tiempoEntrada?: string;
    tiempoSalida?: string;
    opm1?: string;
    opm2?: string;
}

export interface DetalleCargaPalet {
    id?: number;
    pallets?: number;
    date?: string;
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

interface RemoveDetalle {
    segIdx: number;
    detalleIdx: number;
}

export interface DetalleCarga extends Product {
    amount: number;
    history?: DetalleCargaPalet[];
    productId: number;
}

export interface DetalleCargaSalida extends Product {
    amount: number;
    idDetalle: number;
}

export interface DetalleCargaIdx extends DetalleCarga {
    index: number,
}

export interface Seguimiento {
    id: number,
    rastra: TarilerData,
    transporter: TransporterData,
    userName?: string;
    completed?: string;
    plateNumber: string;
    completed_date: string | null;
    originLocation?: number;
    outputLocation?: number;
    driver?: number| null;
    documentNumber: number;
    status: string;
    transportNumber: number;
    transferNumber: number;
    created_at: string;
    documentNumberExit: number;
    outputType: number;
    timeStart: string | null;
    timeEnd: string | null;
    opm1?: number;
    opm2?: number;
    detalles: DetalleCarga[]
    detallesSalida?: DetalleCargaSalida[]
    originLocationData: LocationType | null;
    accounted: number | null;
}

export interface SeguimientoIDX extends Partial<Seguimiento> {
    index: number
}

interface seguimientoInterface {
    seguimientos: Seguimiento[]
    seguimeintoActual?: number;
    loading: boolean;
}

const initialState: seguimientoInterface = {
    seguimientos: [],
    loading: false,
}

export const seguimientoSlice = createSlice({
    name: "seguimiento",
    initialState,
    reducers: {
        addSeguimiento: (state, action: PayloadAction<Seguimiento>) => {
            // Si el seguimiento ya existe no se agrega
            if (state.seguimientos.findIndex((seg) => seg.rastra.code === action.payload.rastra.code) !== -1) {
                toast.error("Ya existe un seguimiento con este codigo de rastra");
                return
            }
            state.seguimientos.push(action.payload);
            const seguimientoActualValue = state.seguimientos.length - 1;
            state.seguimeintoActual = seguimientoActualValue;
        },
        setSeguimientos: (state, action: PayloadAction<Seguimiento[]>) => {
            state.seguimientos = action.payload
            state.seguimeintoActual = 0
        },
        removeSeguimiento: (state, action: PayloadAction<number>) => {
            state.seguimientos.splice(action.payload, 1)
            state.seguimeintoActual = 0
        },
        setSeguimientoActual: (state, action: PayloadAction<number>) => {
            state.seguimeintoActual = action.payload
        },
        updateSeguimiento: (state, action: PayloadAction<SeguimientoIDX>) => {
            state.seguimientos[action.payload.index] = { ...state.seguimientos[action.payload.index], ...action.payload }
        },
        addDetalleCarga: (state, action: PayloadAction<DetalleCargaIdx>) => {
            // No se puede agregar un producto que ya existe en el seguimiento validar por codigo sap
            if (state.seguimientos[action.payload.index].detalles.findIndex((det) => det.id === action.payload.id) !== -1) {
                // Aumentar la cantidad del producto
                const detalle = state.seguimientos[action.payload.index].detalles.find((det) => det.id === action.payload.id)
                if (detalle) {
                    detalle.amount = Number(detalle.amount) + Number(action.payload.amount)
                }

            } else {

                state.seguimientos[action.payload.index].detalles = [action.payload, ...state.seguimientos[action.payload.index].detalles]
            }
        },
        removeDetalleCarga: (state, action: PayloadAction<RemoveDetalle>) => {
            const { segIdx, detalleIdx } = action.payload
            const seguimiento = state.seguimientos[segIdx];
            const cortado = seguimiento.detalles.filter((_, indice) => indice !== detalleIdx)
            seguimiento.detalles = cortado
        },
        addDetalleCargaPallet: (state, action: PayloadAction<AddDetalleCargaPalletData>) => {
            const { segIndex, detalleIndex } = action.payload
            state.seguimientos[segIndex].detalles[detalleIndex].history = [action.payload, ...state.seguimientos[segIndex].detalles[detalleIndex].history || []]
        },
        updateDetalleCargaPallet: (state, action: PayloadAction<DetalleCargaPaletModifyData>) => {
            const { segIndex, detalleIndex, paletIndex } = action.payload
            const seguimiento = state.seguimientos[segIndex];
            const detalle = seguimiento.detalles[detalleIndex];
            if (detalle.history) {
                detalle.history[paletIndex] = action.payload
            }
        },
        removeDetalleCargaPallet: (state, action: PayloadAction<DetalleCargaPaletRemoveData>) => {
            const { segIndex, detalleIndex, paletIndex } = action.payload
            const seguimiento = state.seguimientos[segIndex];
            const detalle = seguimiento.detalles[detalleIndex];
            if (detalle.history) {
                const cortado = detalle.history.filter((_, indice) => indice !== paletIndex);
                detalle.history = cortado;
            }
        },
        addDetalleCargaSalida: (state, action: PayloadAction<{ segIndex: number, product: Product, amount: number, idDetalle: number }>) => {
            const { segIndex, product, amount, idDetalle } = action.payload
            const seguimiento = state.seguimientos[segIndex];
            if (seguimiento.detallesSalida) {
                const index = seguimiento.detallesSalida.findIndex((det) => det.id === product.id)
                if (index !== -1) {
                    seguimiento.detallesSalida[index].amount = amount
                } else {
                    seguimiento.detallesSalida.push({ ...product, amount, idDetalle: idDetalle})
                }
            } else {
                seguimiento.detallesSalida = [{ ...product, amount, idDetalle }]
            }
            toast.success("Producto de salida agregado")
        },
        removeDetalleCargaSalida: (state, action: PayloadAction<{ segIndex: number, product: Product }>) => {
            const { segIndex, product } = action.payload
            const seguimiento = state.seguimientos[segIndex];
            if (seguimiento.detallesSalida) {
                const cortado = seguimiento.detallesSalida.filter((det) => det.id !== product.id);
                seguimiento.detallesSalida = cortado;
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
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
    removeDetalleCarga,
    addDetalleCargaSalida,
    removeDetalleCargaSalida,
    setLoading,
    setSeguimientos
} = seguimientoSlice.actions;