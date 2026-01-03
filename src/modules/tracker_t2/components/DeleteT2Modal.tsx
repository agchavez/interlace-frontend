import { FC } from "react";
import BootstrapDialogTitle from "../../ui/components/BootstrapDialogTitle";
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { deleteT2Tracking } from "../../../store/seguimiento/t2TrackingThunk";
import { useNavigate } from "react-router-dom";

interface DeleteT2ModalProps {
    isOpen: boolean;
    onClose: () => void;
    id: string;
}
export const DeleteT2Modal: FC<DeleteT2ModalProps> = ({ isOpen, onClose, id }) => {
    const { loading } = useAppSelector((state) => state.seguimiento.t2Tracking);
    const dispatch = useAppDispatch();
    const navigae = useNavigate();
    const handleDelete = () => {
        dispatch(deleteT2Tracking(id, () => navigae('/tracker-t2/manage', { replace: true })));
    }

    return (
        <>
            <Dialog open={isOpen} onClose={loading ? undefined : onClose}
                fullWidth maxWidth="sm">
                <BootstrapDialogTitle id="customized-dialog-title" onClose={loading ? undefined : onClose}>
                    <Typography variant="h6" component="div" fontWeight={400}>
                        ¿Está seguro que desea eliminar este registro?
                    </Typography>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Alert severity={'error'}>
                        Este cambio no se puede deshacer
                    </Alert>

                </DialogContent>
                <DialogActions>
                    {!loading ? <Button onClick={handleDelete}
                        variant="contained"
                        color="error"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : undefined}

                    >

                        Eliminar
                    </Button>
                        : <CircularProgress size={40} />
                    }

                </DialogActions>
            </Dialog>
        </>
    )
}
