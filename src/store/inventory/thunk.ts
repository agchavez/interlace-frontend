import backendApi from '../../config/apiConfig';
import { AppThunk } from '../store';
import { InventarioMovimentResult } from '../../interfaces/tracking';
import { errorApiHandler, handleApiError } from '../../utils/error';
export const createLocationAndRoute = (
    file: File,
    reason: string,
    onCompleted: (data: InventarioMovimentResult) => void,
    onError: () => void
): AppThunk => {
    return async (_, getState) => {
        try {
            
        
        const { auth } = getState();
        const token = auth.token;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('reason', reason);
        const resp = await backendApi.post<InventarioMovimentResult>('/inventory-movement/batch-create-excel/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            },
        });
        if (resp.status !== 200) {
            handleApiError(resp);
            return;
        }

        onCompleted(resp.data);

    } catch (error) {
        errorApiHandler(error, 'Error al crear el ajuste de inventario');
        onError();
    }



    }
}