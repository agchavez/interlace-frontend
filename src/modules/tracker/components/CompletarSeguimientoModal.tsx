
import { Box, Button, Container, Dialog, DialogActions, DialogContent, Grid, Typography, styled } from "@mui/material";
import { FunctionComponent } from "react";
import { useAppDispatch } from "../../../store";
import { completeTracker, chanceStatusTracking } from '../../../store/seguimiento/trackerThunk';
import { useAppSelector } from '../../../store/store';
import { removeSeguimientoActual } from "../../../store/seguimiento/seguimientoSlice";
import BootstrapDialogTitle from "../../ui/components/BootstrapDialogTitle";


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

interface DeleteCheckProps {
    open: boolean;
    copleted: boolean;
    handleClose?: ((event: object, reason: "backdropClick" | "escapeKeyDown") => void) | undefined;
}

export const CompletarSeguimientoModal: FunctionComponent<DeleteCheckProps> = ({ open, handleClose, copleted }) => {
    const dispatch = useAppDispatch();
    const {seguimeintoActual, seguimientos} = useAppSelector((state) => state.seguimiento)
    const handleClickDelete = () => {
        if(copleted){
        dispatch(completeTracker())
        handleClose && handleClose({}, "backdropClick");
        return;
        }
        if(seguimeintoActual !== undefined){
            dispatch(chanceStatusTracking('PENDING', seguimientos[seguimeintoActual].id, () => dispatch(removeSeguimientoActual())))
            handleClose && handleClose({}, "backdropClick");
        }
    }

    return <BootstrapDialog open={open} onClose={handleClose} fullWidth={true} maxWidth="sm">
        <BootstrapDialogTitle id="customized-dialog-title" onClose={() => handleClose && handleClose({}, "backdropClick")}>
            <Typography variant="h6" fontWeight={600} color={'#fff'}>
                {copleted ? "Completar Seguimiento" : "Mover a pendientes"}
            </Typography>
        </BootstrapDialogTitle>
        <DialogContent dividers >
            <Box >
                <Container maxWidth="xl">
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography>
                                ¿Está seguro que desea {copleted ? "completar" : "mover a pendientes"} este seguimiento?
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button variant="contained" color="primary" size="medium" onClick={handleClickDelete}>
                <Typography variant="body2" component="span" fontWeight={400} color={'gray.700'}>
                    Confirmar
                </Typography>
            </Button>
        </DialogActions>
    </BootstrapDialog>
}