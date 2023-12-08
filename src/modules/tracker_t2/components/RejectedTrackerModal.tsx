import { Box, Button, Dialog, DialogActions, DialogContent, LinearProgress, Typography } from '@mui/material';
import { FC, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/store';
import { Alert } from '@mui/material';
import { changeStatusT2Tracking } from '../../../store/seguimiento/t2TrackingThunk';
import BootstrapDialogTitle from '../../ui/components/BoostrapDialog';

interface RejectedTrackerModalProps {
    isOpen: boolean
    onClose: () => void
}
export const RejectedTrackerModal: FC<RejectedTrackerModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const {
        t2TrackingActual, loading
    } = useAppSelector((state) => state.seguimiento.t2Tracking);
    // validar si hay almenos un item con status diferente de REJECTED
    const isSomeRejected = useMemo(() => {
        return t2TrackingActual?.output_detail_t2.some((item) => item.status !== 'REJECTED')
    }, [t2TrackingActual]);


    const handleClickCompletar = () => {
        dispatch(changeStatusT2Tracking("REJECTED", onClose))
    }

    return (
        <>
            <Dialog open={isOpen} onClose={loading ? undefined : onClose}
                fullWidth maxWidth="md">
                <BootstrapDialogTitle id="customized-dialog-title" onClose={loading ? undefined : onClose}>
                    <Typography variant="h6" component="div" fontWeight={400}>
                        Rechazar salida de producto
                    </Typography>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" gutterBottom>
                        Al rechazar la salida de producto, se retornará al estado anterior para su revisión y corrección.
                    </Typography>
                    {isSomeRejected ? null :
                        <Alert severity="warning">
                            Debe rechazar al menos un item para poder continuar.
                        </Alert>
                    }

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
                                    disabled={!isSomeRejected}
                                >
                                    Rechazar
                                </Button>
                            </>
                    }
                </DialogActions>

            </Dialog>

        </>
    )
}
