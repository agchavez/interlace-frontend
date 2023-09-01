import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, styled } from "@mui/material";
import { FunctionComponent, useRef } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { Rastra } from '../../../interfaces/tracking';
import { RastraSelect } from "./RastraSelect";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAppDispatch, useAppSelector } from "../../../store";
import { addSeguimiento, setSeguimientoActual } from "../../../store/seguimiento/seguimientoSlice";

interface CreateCheckProps {
    open: boolean;
    handleClose?: ((event: object, reason: "backdropClick" | "escapeKeyDown") => void) | undefined;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const rastras: Rastra[] = [
    {
        id: 1,
        transportista: "Rigoberto agui",
        placa: "C048",
        tractor: "ICH00",
        cabezal: "HN-GC00"
    },
    {
        id: 2,
        transportista: "Edwin Mejia",
        placa: "C066",
        tractor: "ICH00",
        cabezal: "HN-GC00"
    },
    {
        id: 3,
        transportista: "Onan Contreras",
        placa: "C110",
        cabezal: "HN-GC00",
        tractor: "Onan Contreras"
    },
    {
        id: 4,
        transportista: "Loginhsa",
        placa: "M11",
        cabezal: "HN-GC00",
        tractor: "ILI00"
    }
]

const CreateCheckModal: FunctionComponent<CreateCheckProps> = ({ open, handleClose }) => {
    const schema = yup.object().shape({
        rastraId: yup.number().required("Este campo es requerido").min(1, "Seleccione una rastra")
    })

    const { seguimientos } = useAppSelector(state => state.seguimiento)

    const dispach = useAppDispatch()

    const formRef = useRef<HTMLFormElement>(null);

    const { control, handleSubmit, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            rastraId: 0
        }
    })

    const handleSubmitForm = (data: { rastraId: number }) => {
        const rastra = rastras.find(rastra => rastra.id === data.rastraId)
        if (rastra) {
            const idSeguimiento = Math.max(...seguimientos.map(s => s.id), 0) + 1
            dispach(addSeguimiento({
                id: idSeguimiento,
                rastra: rastra,
                detalles: []
            }));
            dispach(setSeguimientoActual(seguimientos.length))
        }
    }

    const handleClickCreate = () => {
        formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
        handleClose && handleClose({}, "backdropClick");
        reset();
    }

    return (
        <>
            <BootstrapDialog open={open} onClose={handleClose} fullWidth={true} maxWidth="sm">
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Elija una rastra
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
                                    <form onSubmit={handleSubmit(handleSubmitForm)} ref={formRef}>
                                        <RastraSelect rastras={rastras} control={control} name="rastraId" />
                                    </form>
                                </Grid>
                            </Grid>
                        </Container>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleClickCreate}>
                        Crear
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </>
    );
}

export default CreateCheckModal;