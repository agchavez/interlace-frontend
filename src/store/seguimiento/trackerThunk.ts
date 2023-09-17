import backendApi from '../../config/apiConfig';
import { AddDetalleBody, AddDetalleData, CreateTrackingBody, Tracker, TrackerDetailResponse, TrackerProductDetail } from '../../interfaces/tracking';
import { AppThunk } from '../store';
'../../interfaces/tracking';
import { toast } from 'sonner';
import { DetalleCarga, DetalleCargaPalet, Seguimiento, addDetalleCarga, addSeguimiento, setLoading, setSeguimientos, updateSeguimiento } from './seguimientoSlice';
import { AxiosResponse } from 'axios';


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
        toast.error('Error al cargar los trackings');
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

const parseTrackerSeguimiento = (tracker: Tracker): Seguimiento => {
    const seguimiento: Seguimiento = {
        id: tracker.id,
        rastra: tracker.tariler_data,
        detalles: tracker.tracker_detail.map(det => parseDetail(det)),
        transporter: tracker.transporter_data,
        plateNumber: tracker.plate_number,
        documentNumber: tracker.input_document_number,
        transferNumber: tracker.transfer_number,
        // no se recibe
        transportNumber: 1,
        documentNumberExit: tracker.output_document_number,
        outputType: tracker.output_type,
        timeStart: tracker.input_date !== null ? new Date(tracker.input_date || 0) : null,
        timeEnd: tracker.output_date !== null ? new Date(tracker.output_date || 0) : null,
        driver: tracker.driver,
        originLocationData: tracker.location_data,
        originLocation: tracker.origin_location || undefined,
        accounted: tracker.accounted
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
        history: tracker_detail.tracker_product_detail.map(det => parseProductDetail(det))
    }
    return seguimiento_detalle;
}

const parseProductDetail = (tracker_detail: TrackerProductDetail): DetalleCargaPalet => {
    const seguimiento_detalle_pallet: DetalleCargaPalet = {
        amount: tracker_detail.quantity,
        date: new Date(tracker_detail.expiration_date),
        id: tracker_detail.id,
        pallets: tracker_detail.quantity
    }
    return seguimiento_detalle_pallet;
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