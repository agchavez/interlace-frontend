import backendApi from '../../config/apiConfig';
import { AppThunk } from '../store';
import { DistributionCenter, BaseaAPIResponse, GroupsResponse, } from '../../interfaces/maintenance';
import { setDistributionCenters, setOutputType, setGroups, setLoadingMain } from './maintenanceSlice';
import { OutputType, Product } from '../../interfaces/tracking';
import { toast } from 'sonner';
import { addDetalleCarga } from '../seguimiento/seguimientoSlice';


// listar data inicial de mantenimiento
export const getMaintenanceData = (): AppThunk => async (dispatch) => {
    try {
        const { data:dataDistributionCenters } = await backendApi.get<DistributionCenter[]>('/distribution-center/');
        dispatch(setDistributionCenters(dataDistributionCenters));
        const { data:dataGroups } = await backendApi.get<GroupsResponse>('/groups/');
        dispatch(setGroups(dataGroups.results));
        const { data: dataOutput } = await backendApi.get<BaseaAPIResponse<OutputType>>('/output-type/');
        dispatch(setOutputType(dataOutput.results));
    } catch (error) {
        toast.error('Error al cargar los datos de mantenimiento');
    }
}

// Buscar articulos por codigo de barras
export const getArticlesByBarcode = (barcode: string, index: number): AppThunk => async (dispatch, getState) => {
    try {
        console.log('index', index);
        
        dispatch(setLoadingMain(true))
        const { token } = getState().auth;
        const { data } = await backendApi.get<BaseaAPIResponse<Product>>(`/product/?bar_code=${barcode}`, {
            headers: { 
                Authorization: `Bearer ${token}`
            }
        });
        if (data!.count === 0) {
            toast.error('No se encontraron articulos con ese codigo de barras');
        
        }else{
            
            dispatch(addDetalleCarga({
                ...data!.results[0],
                amount: 1,
            history: [],
                index,
            }));
            toast.success('Producto de entrada agregado / actualizado');
        }
    } catch (error) {
        toast.error('Error al buscar el articulo');
    }
    finally{
        dispatch(setLoadingMain(false))
    }

    
}