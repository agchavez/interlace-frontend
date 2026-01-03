
import { Box, Button, Container, Dialog, DialogActions, DialogContent, Grid, IconButton, Typography, styled } from "@mui/material";
import { FunctionComponent } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch } from "../../../store";
import { removeTracking } from "../../../store/seguimiento/trackerThunk";
import DialogTitle from "../../ui/components/BootstrapDialogTitle"

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

interface DeleteCheckProps {
    index: number;
    open: boolean;
    handleClose?: ((event: object, reason: "backdropClick" | "escapeKeyDown") => void) | undefined;
    seguimientoId: number
}

export const EliminarSeguimientoModal: FunctionComponent<DeleteCheckProps> = ({ open, handleClose, index, seguimientoId }) => {
    const dispatch = useAppDispatch()
    const handleClickDelete = () => {
        handleClose && handleClose({}, "backdropClick");
        dispatch(removeTracking(index, seguimientoId))
    }
    return <BootstrapDialog open={open} onClose={handleClose} fullWidth={true} maxWidth="sm">
        <DialogTitle id="customized-dialog-title" onClose={() => handleClose && handleClose({}, "backdropClick")}>
            <Typography variant="h6" fontWeight={600} color={'#fff'}>
                Eliminar Seguimiento
            </Typography>
        </DialogTitle>
        <DialogContent dividers >
            <Box >
                <Container maxWidth="xl">
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography>
                                ¿Está seguro que desea eliminar este seguimiento?
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button variant="contained" color="error" size="medium" onClick={handleClickDelete}>
                <Typography variant="body2" component="span" fontWeight={400} color={'gray.700'}>
                    Eliminar
                </Typography>
            </Button>
        </DialogActions>
    </BootstrapDialog>
}