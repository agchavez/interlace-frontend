import backendApi from '../../config/apiConfig';
import { AppThunk } from '../store';
import { DistributionCenter, BaseaAPIResponse } from '../../interfaces/maintenance';
import { setDistributionCenters, setOutputType } from './maintenanceSlice';
import { OutputType } from '../../interfaces/tracking';
import { toast } from 'sonner';


// listar data inicial de mantenimiento
export const getMaintenanceData = (): AppThunk => async (dispatch) => {
    try {
        const { data } = await backendApi.get<DistributionCenter[]>('/distribution-center/');
        const { data: dataOutput } = await backendApi.get<BaseaAPIResponse<OutputType>>('/output-type/');
        dispatch(setDistributionCenters(data));
        dispatch(setOutputType(dataOutput.results));
    } catch (error) {
        toast.error('Error al cargar los datos de mantenimiento');
    }
}