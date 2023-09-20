import backendApi from '../../config/apiConfig';
import { AddDetalleBody, AddDetalleData, AddDetallePalletData, AddDetallePalletResponse, AddOutProductBody, AddOutProductData, CreateTrackingBody, Tracker, TrackerDeailOutput, TrackerDetailResponse, TrackerProductDetail, UpdateDetallePalletData } from '../../interfaces/tracking';
import { AppThunk } from '../store';
'../../interfaces/tracking';
import { toast } from 'sonner';
import { DetalleCarga, DetalleCargaPalet, DetalleCargaSalida, Seguimiento, addDetalleCarga, addDetalleCargaPallet, addDetalleCargaSalida, addSeguimiento, removeDetalleCarga, removeDetalleCargaPallet, removeDetalleCargaSalida, removeSeguimiento, setLoading, setSeguimientoActual, setSeguimientos, updateDetalleCargaPallet, updateSeguimiento } from './seguimientoSlice';
import { AxiosResponse } from 'axios';
import { format } from 'date-fns';


// listar data inicial de mantenimiento
export const getOpenTrackings = (): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(setLoading(true))
        const { token } = getState().auth;
        const { data } = await backendApi.get<Tracker[]>(`/tracker/my-trackers/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const seguimientos = data.map(tracker => parseTrackerSeguimiento(tracker))
        dispatch(setSeguimientos(seguimientos))
    } catch (error) {
        toast.error('Error al cargar los trackings');
    } finally {
        dispatch(setLoading(false))
    }
}

export const createTracking = (body: CreateTrackingBody): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(setLoading(true))
        const { token } = getState().auth;
        const { data: tracker } = await backendApi.post<Tracker, AxiosResponse<Tracker>>(`/tracker/`, body, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        dispatch(addSeguimiento(parseTrackerSeguimiento(tracker)))
        toast.success('Seguimiento creado exitosamente');
    } catch (error) {
        toast.error('Error al cargar los trackings');
    } finally {
        dispatch(setLoading(false))
    }
}

export const updateTracking = (indexSeguimiento: number, trackingId: number, body: Partial<CreateTrackingBody>): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(setLoading(true))
        const { token } = getState().auth;
        const { data: tracker } = await backendApi.patch<Tracker, AxiosResponse<Tracker>>(`/tracker/${trackingId}/`, body, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        dispatch(updateSeguimiento({
            index: indexSeguimiento,
            ...parseTrackerSeguimiento(tracker)
        }))
    } catch (error) {
        toast.error('Error al actualizar el seguimiento');
    } finally {
        dispatch(setLoading(false))
    }
}

export const removeTracking = (indexSeguimiento: number, trackingId: number): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(setLoading(true))
        const { token } = getState().auth;
        const { status } = await backendApi.delete<Tracker, AxiosResponse<Tracker>>(`/tracker/${trackingId}/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        if (status === 204)
            dispatch(removeSeguimiento(indexSeguimiento))
        dispatch(setSeguimientoActual(0))
        toast.success('Seguimiento eliminado');
    } catch (error) {
        toast.error('Error al eliminar el Seguimiento');
    } finally {
        dispatch(setLoading(false))
    }
}


export const addDetalle = (index: number, data: AddDetalleData): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(setLoading(true))
        const { token } = getState().auth;
        const { seguimientos, seguimeintoActual } = getState().seguimiento;
        if (seguimeintoActual === undefined) return;
        if (!seguimientos) return;
        const tracker = seguimientos[seguimeintoActual || 0]
        if (!tracker) {
            return;
        }
        const seguimiento = seguimientos[seguimeintoActual]
        const detalle = seguimiento.detalles.find(detalle => detalle.sap_code === data.product.sap_code)
        const quantityToEndpoint = + data.quantity + (detalle?.amount || 0);
        const body: AddDetalleBody = {
            quantity: quantityToEndpoint,
            product: data.product.id,
            tracker: tracker.id
        }
        const { data: detail } = await backendApi.post<TrackerDetailResponse, AxiosResponse<TrackerDetailResponse>>(`/tracker-detail/`, body, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        if (detalle) {
            dispatch(addDetalleCarga({
                index: index,
                ...detalle,
                amount: data.quantity
            }))
        } else {
            dispatch(addDetalleCarga(
                {
                    //  index seguimiento
                    index: index,
                    ...parseDetail(detail),
                }))
        }
    } catch (error) {
        toast.error('Error al cargar los trackings');
    } finally {
        dispatch(setLoading(false))
    }
}

export const removeDetalle = (segIdx: number, detalleIdx: number, id: number): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(setLoading(true))
        const { token } = getState().auth;
        const { seguimientos, seguimeintoActual } = getState().seguimiento;
        if (seguimeintoActual === undefined) return;
        if (!seguimientos) return;
        const tracker = seguimientos[seguimeintoActual || 0]
        if (!tracker) return;
        const { status } = await backendApi.delete<TrackerDetailResponse, AxiosResponse<TrackerDetailResponse>>(`/tracker-detail/${id}/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        if (status === 204) {
            dispatch(removeDetalleCarga({ segIdx, detalleIdx }))
        }
    } catch (error) {
        toast.error('Error al eliminar el detale');
    } finally {
        dispatch(setLoading(false))
    }
}

export const addDetallePallet = (indexSeg: number, indexDet: number, data: AddDetallePalletData): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(setLoading(true))
        const { token } = getState().auth;
        const { seguimientos } = getState().seguimiento;
        if (!seguimientos) return;
        const seguimiento = seguimientos[indexSeg]
        if (!seguimiento) return;
        const { data: detailProduct } = await backendApi.post<AddDetallePalletResponse, AxiosResponse<AddDetallePalletResponse>>(`/tracker-detail-product/`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        dispatch(addDetalleCargaPallet({
            ...parseProductDetail(detailProduct),
            segIndex: indexSeg,
            detalleIndex: indexDet
        }))
    } catch (error) {
        toast.error('Error al agregar');
    } finally {
        dispatch(setLoading(false))
    }
}

export const updateDetallePallet = (indexSeg: number, indexDet: number, indexPallet: number, data: UpdateDetallePalletData): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(setLoading(true))
        const { token } = getState().auth;
        const { seguimientos } = getState().seguimiento;
        if (!seguimientos) return;
        const seguimiento = seguimientos[indexSeg]
        if (!seguimiento) return;
        const { data: detailProduct } = await backendApi.patch<AddDetallePalletResponse, AxiosResponse<AddDetallePalletResponse>>(`/tracker-detail-product/${data.id}/`, { ...data, expiration_date: data.expiration_date ? format(data.expiration_date, "yyyy-MM-dd") : null }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        dispatch(updateDetalleCargaPallet({
            ...parseProductDetail(detailProduct),
            segIndex: indexSeg,
            detalleIndex: indexDet,
            paletIndex: indexPallet,
        }))
    } catch (error) {
        toast.error('Error al actualizar');
    } finally {
        dispatch(setLoading(false))
    }
}

export const removeDetallePallet = (indexSeg: number, indexDet: number, indexPallet: number, id: number): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(setLoading(true))
        const { token } = getState().auth;
        const { seguimientos } = getState().seguimiento;
        if (!seguimientos) return;
        const seguimiento = seguimientos[indexSeg]
        if (!seguimiento) return;
        const { status } = await backendApi.delete<AddDetallePalletResponse, AxiosResponse<AddDetallePalletResponse>>(`/tracker-detail-product/${id}/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        if (status === 204) dispatch(removeDetalleCargaPallet({
            segIndex: indexSeg,
            detalleIndex: indexDet,
            paletIndex: indexPallet,
        }))
        toast.success('Eliminado correctamente');
    } catch (error) {
        toast.error('Error al eliminar');
    } finally {
        dispatch(setLoading(false))
    }
}


export const completeTracker = (): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(setLoading(true))
        const { token, } = getState().auth;
        const { seguimientos, seguimeintoActual } = getState().seguimiento
        if (seguimeintoActual === undefined) return;
        const seguimiento = seguimientos[seguimeintoActual];
        if (!seguimiento) return;
        const idSeguimiento = seguimiento.id;
        const { status } = await backendApi.post(`/tracker/${idSeguimiento}/complete/`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        if (status === 200) {
            dispatch(removeSeguimiento(seguimeintoActual))
        }
        toast.success("Seguimiento marcado como completado")
    } catch (err) {
        toast.error("Error al completar el seguimiento")
    } finally {
        dispatch(setLoading(false))
    }
}

export const addOutProduct = (indexSeguimiento: number, data:AddOutProductData ): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(setLoading(true))
        const { token } = getState().auth;
        const body: AddOutProductBody = {
            tracker: data.tracker,
            quantity: data.quantity,
            product: data.product.id
        }
        const { status, data: trackerDetail } = await backendApi.post<TrackerDeailOutput, AxiosResponse<TrackerDeailOutput>>(`/tracker-detail-output/`, body, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        if (status === 201) {
            dispatch(addDetalleCargaSalida({
                segIndex: indexSeguimiento, 
                product:data.product, 
                amount: data.quantity,
                idDetalle: trackerDetail.id
            }))
        }
        toast.success("Producto de salida agregado")
    } catch (err) {
        toast.error("Error al agregar producto de salida")
    } finally {
        dispatch(setLoading(false))
    }
}

export const removeOutProduct = (indexSeguimiento: number, detalle:DetalleCargaSalida ): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(setLoading(true))
        const { token } = getState().auth;
        const { status } = await backendApi.delete(`/tracker-detail-output/${detalle.idDetalle}/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        if (status < 400) {
            dispatch(removeDetalleCargaSalida({segIndex: indexSeguimiento, product: detalle}))
        }
        toast.success("Producto de salida quitado")
    } catch (err) {
        toast.error("Error al eliminar producto de salida")
    } finally {
        dispatch(setLoading(false))
    }
}

export const parseTrackerSeguimiento = (tracker: Tracker): Seguimiento => {
    const seguimiento: Seguimiento = {
        id: tracker.id,
        rastra: tracker.tariler_data,
        detalles: tracker.tracker_detail.map(det => parseDetail(det)).reverse(),
        transporter: tracker.transporter_data,
        plateNumber: tracker.plate_number,
        documentNumber: tracker.input_document_number,
        transferNumber: tracker.transfer_number,
        created_at: tracker.created_at,
        userName: tracker.user_name,
        completed_date: tracker.completed_date,
        status: tracker.status,
        // no se recibe
        transportNumber: 1,
        documentNumberExit: tracker.output_document_number,
        outputType: tracker.output_type,
        timeStart: tracker.input_date !== null ? new Date(tracker.input_date || 0).toISOString() : null,
        timeEnd: tracker.output_date !== null ? new Date(tracker.output_date || 0).toISOString() : null,
        driver: tracker.driver,
        originLocationData: tracker.location_data,
        originLocation: tracker.origin_location || undefined,
        accounted: tracker.accounted,
        detallesSalida: tracker.tracker_detail_output.map(out => parseOutputDetailSalida(out))
    }
    tracker.destination_location !== null && (seguimiento.outputLocation = tracker.destination_location);
    tracker.operator_1 !== null && (seguimiento.opm1 = tracker.operator_1);
    tracker.operator_2 !== null && (seguimiento.opm2 = tracker.operator_2);
    return seguimiento;
}


const parseDetail = (tracker_detail: TrackerDetailResponse): DetalleCarga => {
    const seguimiento_detalle: DetalleCarga = {
        amount: tracker_detail.quantity,
        id: tracker_detail.id,
        created_at: tracker_detail.created_at,
        name: tracker_detail.product_data.name,
        brand: tracker_detail.product_data.brand,
        bar_code: tracker_detail.product_data.bar_code,
        sap_code: tracker_detail.product_data.sap_code,
        boxes_pre_pallet: tracker_detail.product_data.boxes_pre_pallet,
        useful_life: tracker_detail.product_data.useful_life,
        history: tracker_detail.tracker_product_detail.map(det => parseProductDetail(det)).reverse(),
        block: tracker_detail.product_data.block,
        block_days: tracker_detail.product_data.block_days,
        block_t1: tracker_detail.product_data.block_t1,
        class_product: tracker_detail.product_data.class_product,
        code_feature: tracker_detail.product_data.code_feature,
        concadenated_type: tracker_detail.product_data.concadenated_type,
        cost: tracker_detail.product_data.cost,
        days_not_accept_product: tracker_detail.product_data.days_not_accept_product,
        description_sap: tracker_detail.product_data.description_sap,
        division: tracker_detail.product_data.division,
        helectrolitos: tracker_detail.product_data.helectrolitos,
        hl_per_unit: tracker_detail.product_data.hl_per_unit,
        lib_to_ton: tracker_detail.product_data.lib_to_ton,
        packaging: tracker_detail.product_data.packaging,
        pre_block: tracker_detail.product_data.pre_block,
        pre_block_days: tracker_detail.product_data.pre_block_days,
        pre_block_days_next: tracker_detail.product_data.pre_block_days_next,
        size: tracker_detail.product_data.size,
        standard_cost: tracker_detail.product_data.standard_cost,
        ton: tracker_detail.product_data.ton,
        weight: tracker_detail.product_data.weight
    }
    return seguimiento_detalle;
}

const parseProductDetail = (tracker_detail: TrackerProductDetail): DetalleCargaPalet => {
    const seguimiento_detalle_pallet: DetalleCargaPalet = {
        amount: tracker_detail.quantity,

        date: new Date(tracker_detail.expiration_date).toISOString(),

        id: tracker_detail.id,
        pallets: tracker_detail.quantity
    }
    return seguimiento_detalle_pallet;
}

const parseOutputDetailSalida = (tracker_detail: TrackerDeailOutput): DetalleCargaSalida => {
    const detalleSalida: DetalleCargaSalida = {
        ...tracker_detail.product_data,
        id: tracker_detail.id,
        amount: tracker_detail.quantity,
        created_at: tracker_detail.created_at,
        idDetalle: tracker_detail.id
    }
    return detalleSalida;
}

// const parseSeguimientoTracker = (seguimiento: Seguimiento):Tracker  => {
//     return {
//         id: seguimiento.id,
//         tariler_data: seguimiento.rastra,
//         tracker_detail: seguimiento.detalles,
//         transporter_data: seguimiento.transporter,
//         plate_number: seguimiento.plateNumber,
//         origin_location: seguimiento.originLocation,
//         destination_location: seguimiento.outputLocation,
//         input_document_number: seguimiento.documentNumber,
//         transfer_number: seguimiento.transferNumber,
//         // no se recibe
//         output_document_number: seguimiento.documentNumberExit,
//         output_type: seguimiento.outputType,
//         input_date: seguimiento.timeStart,
//         output_date: seguimiento.timeEnd
//     }
// }