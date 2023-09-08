import backendApi from '../../config/apiConfig';
import { AppThunk } from '../store';
import { DistributionCenter, BaseaAPIResponse, GroupsResponse, } from '../../interfaces/maintenance';
import { setDistributionCenters, setOutputType, setGroups } from './maintenanceSlice';
import { OutputType } from '../../interfaces/tracking';
import { toast } from 'sonner';


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