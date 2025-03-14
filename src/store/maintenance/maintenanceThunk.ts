import backendApi from '../../config/apiConfig';
import { AppThunk } from '../store';
import {DistributionCenter, BaseaAPIResponse, GroupsResponse} from '../../interfaces/maintenance';
import { setDistributionCenters, setOutputType, setGroups, setLoadingMain } from './maintenanceSlice';
import { OutputType, Product } from '../../interfaces/tracking';
import { toast } from 'sonner';
import { addDetalleCarga } from '../seguimiento/seguimientoSlice';
import { handleApiError } from '../../utils/error';
import {BaseApiResponse} from "../../interfaces/api";


// listar data inicial de mantenimiento
export const getMaintenanceData = (): AppThunk => async (dispatch, getState) => {
    try {
        const { token } = getState().auth;
        const { data: dataDistributionCenters } = await backendApi.get<BaseApiResponse<DistributionCenter>>('/distribution-center/?limit=1000', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        dispatch(setDistributionCenters(dataDistributionCenters.results || []));
        const { data: dataGroups } = await backendApi.get<GroupsResponse>('/groups/', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        dispatch(setGroups(dataGroups.results));
        const { data: dataOutput } = await backendApi.get<BaseaAPIResponse<OutputType>>('/output-type/', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        dispatch(setOutputType(dataOutput.results));
    } catch (error) {
        toast.error('Error al cargar los datos de mantenimiento');
        handleApiError(error)
    }
}

// Buscar articulos por codigo de barras
export const getArticlesByBarcode = (barcode: string, index: number): AppThunk => async (dispatch, getState) => {
    try {
    
        dispatch(setLoadingMain(true))
        const { token } = getState().auth;
        const { data } = await backendApi.get<BaseaAPIResponse<Product>>(`/product/?bar_code=${barcode}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (data!.count === 0) {
            toast.error('No se encontraron articulos con ese codigo de barras');

        } else {

            dispatch(addDetalleCarga({
                ...data!.results[0],
                amount: 1,
                history: [],
                index,
                productId: data!.results[0].id
            }));
            toast.success('Producto de entrada agregado / actualizado');
        }
    } catch (error) {
        toast.error('Error al buscar el articulo');
    }
    finally {
        dispatch(setLoadingMain(false))
    }


}