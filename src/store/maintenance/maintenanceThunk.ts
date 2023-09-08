import backendApi from '../../config/apiConfig';
import { AppThunk } from '../store';
import { DistributionCenter, GroupsResponse, } from '../../interfaces/maintenance';
import { setDistributionCenters, setGroups } from './maintenanceSlice';


// listar data inicial de mantenimiento
export const getMaintenanceData = (): AppThunk => async (dispatch) => {
    try {
        const { data:dataDistributionCenters } = await backendApi.get<DistributionCenter[]>('/distribution-center/');
        dispatch(setDistributionCenters(dataDistributionCenters));
        const { data:dataGroups } = await backendApi.get<GroupsResponse>('/groups/');
        dispatch(setGroups(dataGroups.results));
    } catch (error) {
        console.log(error);
    }
}