import { Alert, Box, Button, Dialog, DialogActions, DialogContent, LinearProgress, Typography } from '@mui/material';
import { FC, useMemo } from "react"
import BootstrapDialogTitle from "../../ui/components/BootstrapDialogTitle"
import { useAppSelector, useAppDispatch } from '../../../store/store';
import { Status } from '../../../interfaces/trackingT2';
import { changeStatusT2Tracking } from '../../../store/seguimiento/t2TrackingThunk';

interface CompleteModalProps {
    isOpen: boolean
    onClose: () => void
}
export const CompleteModal: FC<CompleteModalProps> = ({ isOpen, onClose }) => {
    const {
        t2TrackingActual, loading
    } = useAppSelector((state) => state.seguimiento.t2Tracking);

    const isAllChecked = useMemo(() => {
        if (t2TrackingActual?.status === "REJECTED"){
            return t2TrackingActual?.output_detail_t2.every((item) => item.status !== 'REJECTED')
        }
        return t2TrackingActual?.output_detail_t2.every((item) => item.status === (t2TrackingActual?.status === 'CREATED' ? 'CHECKED' : 'AUTHORIZED'))
    }, [t2TrackingActual]);
    const dispatch = useAppDispatch();
    const handleClickCompletar = () => {
        if (t2TrackingActual?.status === undefined) return;
        const status: Status = ['CREATED', 'REJECTED'].includes(t2TrackingActual.status)
            ? 'CHECKED' :
            t2TrackingActual?.status === 'CHECKED'
                ? 'AUTHORIZED' 
                : 'APPLIED'
        dispatch(changeStatusT2Tracking(status, onClose))
    };

    return (
        <>
            <Dialog open={isOpen} onClose={loading ? undefined : onClose}
                fullWidth maxWidth="md">
                <BootstrapDialogTitle id="customized-dialog-title" onClose={loading ? undefined : onClose}>
                    <Typography variant="h6" component="div" fontWeight={400}>
                        ¿Está seguro que desea completar el seguimiento?
                    </Typography>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" gutterBottom>
                        Al completar la revisión no podrá editarlo nuevamente, todos los items se marcarán como revisados.
                    </Typography>
                    <Alert severity={isAllChecked ? 'success' : 'warning'}>
                        {isAllChecked ?
                            t2TrackingActual?.status && ["CREATED", "REJECTED"].includes(t2TrackingActual?.status) ? 'Todos los items están revisados' : 'Todos los items están autorizados'
                            : t2TrackingActual?.status && ["CREATED", "REJECTED"].includes(t2TrackingActual?.status) ? 'No todos los items están revisados' : 'No todos los items están autorizados'}
                    </Alert>

                </DialogContent>
                <DialogActions>
                    {
                        loading ? <Box>
                            <LinearProgress
                                value={100}
                            />
                        </Box>
                            : <>
                                <Button autoFocus onClick={onClose} variant="outlined" color="error">
                                    Cancelar
                                </Button>
                                <Button onClick={handleClickCompletar} variant="outlined" color="success"
                                    disabled={!isAllChecked && t2TrackingActual?.status === 'CHECKED'}>
                                    {
                                        t2TrackingActual?.status === 'CHECKED' ?
                                            'Autorizar' :
                                        t2TrackingActual?.status === 'AUTHORIZED' ?
                                            'Aplicar' :
                                        'Completar'

                                    }
                                </Button> 
                            </>
                    }
                </DialogActions>

            </Dialog>


        </>
    )
}
