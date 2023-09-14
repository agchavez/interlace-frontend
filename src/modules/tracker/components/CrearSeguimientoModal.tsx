import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, styled } from "@mui/material";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAppDispatch, useAppSelector } from "../../../store";
import { addSeguimiento } from "../../../store/seguimiento/seguimientoSlice";
import { TrailerSelect, TransporterSelect } from "../../ui/components";
import { Trailer, Transporter } from '../../../interfaces/maintenance';

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


const CreateCheckModal: FunctionComponent<CreateCheckProps> = ({ open, handleClose }) => {
    const schema = yup.object().shape({
        rastraId: yup.number().required("Este campo es requerido").min(1, "Seleccione una rastra"),
        transporter: yup.number().required("Este campo es requerido").min(1, "Seleccione un transportista")
    })

    const [trailer, settrailer] = useState<Trailer | null>(null)
    const [transporter, setTransporter] = useState<Transporter | null>(null)
    const { seguimientos } = useAppSelector(state => state.seguimiento)

    const dispach = useAppDispatch()

    const formRef = useRef<HTMLFormElement>(null);

    const { handleSubmit, reset, setFocus, control } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            rastraId: 0,
            transporter: 0
        }
    })

    const handleChangeTrailer = (value: Trailer | null) => {
        if (value) {
            settrailer(value)
        }
    }

    const handleChangeTDriver = (value: Transporter | null) => {
        if (value) {
            setTransporter(value)
        }
    }


    const handleSubmitForm = () => {
        if (trailer && transporter) {
            const idSeguimiento = Math.max(...seguimientos.map(s => s.id), 0) + 1
            dispach(addSeguimiento({
                id: idSeguimiento,
                rastra: trailer,
                transporter: transporter,
                detalles: []
            }));
            //dispach(setSeguimientoActual(seguimientos.length))
        }
    }

    const handleClickCreate = () => {
        formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
        handleClose && handleClose({}, "backdropClick");
        reset();
    }

    useEffect(() => {
        setTimeout(() => {
            setFocus("rastraId")
        }, 100);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

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
                                        <Grid container>
                                            <Grid item xs={6}>
                                                <TrailerSelect
                                                    control={control}
                                                    name="rastraId"
                                                    placeholder="Seleccione una rastra"
                                                    onChange={handleChangeTrailer}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TransporterSelect
                                                    control={control}
                                                    name="transporter"
                                                    placeholder="Seleccione un transportista"
                                                    onChange={handleChangeTDriver}
                                                />
                                            </Grid>
                                        </Grid>
                                    </form>
                                </Grid>
                            </Grid>
                        </Container>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClickCreate}>
                        Crear
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </>
    );
}

export default CreateCheckModal;