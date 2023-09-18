
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Typography, styled } from "@mui/material";
import { FunctionComponent } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch } from "../../../store";
import { removeTracking } from "../../../store/seguimiento/trackerThunk";


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
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
            Eliminar Seguimiento
        </DialogTitle>
        <IconButton
            aria-label="close"
            onClick={() => handleClose && handleClose({}, "backdropClick")}
            sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
                textDecoration: 'underline', // Agrega un subrayado para hacerlo parecer un enlace
                cursor: 'pointer', // Cambia el cursor al estilo "mano" para indicar que es interactivo
            }}
            color="primary"
        >
            <CloseIcon />
        </IconButton>
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