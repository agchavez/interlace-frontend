import { Dialog, DialogActions, DialogContent, Typography, TextField, Button, Box, LinearProgress } from '@mui/material'
import { FC, useRef } from "react"
import BootstrapDialogTitle from "../../ui/components/BoostrapDialog"
import { useAppSelector, useAppDispatch } from '../../../store/store';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup'
import { OutputDetailT2 } from '../../../interfaces/trackingT2';
import { updateStatusT2TrackingDetail } from '../../../store/seguimiento/t2TrackingThunk';

const schema = yup.object().shape({
    motivo: yup.string().required('Ingrese el motivo del rechazo')
    .min(10, 'El motivo debe tener al menos 10 caracteres')
})

interface RejectedItemModalProps {
    isOpen: boolean
    onClose: () => void
    data: OutputDetailT2 | undefined
}
export const RejectedItemModal: FC<RejectedItemModalProps> = ({ isOpen, onClose, data }) => {
    const {
         loading
    } = useAppSelector((state) => state.seguimiento.t2Tracking);
    const ref = useRef<HTMLFormElement>(null);
    const {register, handleSubmit, formState: { errors }, reset
    } = useForm<{motivo:string}>(
        {
            defaultValues: {
                motivo: ''
            },
            resolver: yupResolver(schema)
        }
    );
    const dispatch = useAppDispatch();
    const handleClickRechazar = (dataForm:{motivo:string}) => {
        if (data === undefined) return;
        dispatch(updateStatusT2TrackingDetail({id: data?.id, status: "REJECTED",  reason: dataForm.motivo}, handleClose))
    };

    const handleClose = () => {
        reset();    
        onClose();
    }

  return (
    <>
    <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="md">
        <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
            <Typography variant="h6" component="div" fontWeight={400}>
                ¿Está seguro que desea rechazar el item?
            </Typography>
        </BootstrapDialogTitle>
        <DialogContent dividers>
            <Typography variant="body1" gutterBottom>
                Ingrese el motivo del rechazo del producto {data?.product_name}
            </Typography>
            <form onSubmit={handleSubmit(handleClickRechazar)} ref={ref}>
            <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Motivo"
                type="text"
                fullWidth
                multiline
                rows={4}
                {...register('motivo')}
                error={errors.motivo ? true : false}
                helperText={errors.motivo?.message}
            />
            </form>
        </DialogContent>
        <DialogActions>
            {
                loading ? <Box sx={{ width: '100%' }}>
                    <LinearProgress
                        value={100}
                    />
                </Box>
                    : <>
                        <Button onClick={
                            () => {
                                if (ref.current) {
                                    ref.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
                                }
                            }
                        } variant="outlined" color="error">
                            Rechazar
                        </Button>
                    </>
            }
        </DialogActions>
    </Dialog>


    </>
  )
}
