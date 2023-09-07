import backendApi from '../../config/apiConfig';
import { AppThunk } from '../store';
import { DistributionCenter } from '../../interfaces/maintenance';
import { setDistributionCenters } from './maintenanceSlice';


// listar data inicial de mantenimiento
export const getMaintenanceData = (): AppThunk => async (dispatch) => {
    try {
        const { data } = await backendApi.get<DistributionCenter[]>('/distribution-center/');
        dispatch(setDistributionCenters(data));
    } catch (error) {
        console.log(error);
    }
}