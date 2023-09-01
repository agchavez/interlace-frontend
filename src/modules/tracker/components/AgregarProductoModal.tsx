import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, TableCell, TableRow, TextField, Typography, styled } from "@mui/material";
import { Fragment, FunctionComponent, useRef, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { Rastra } from '../../../interfaces/tracking';
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAppDispatch, useAppSelector } from "../../../store";
import { DetalleCargaPalet, addSeguimiento } from "../../../store/seguimiento/seguimientoSlice";

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

const AgregarProductoModal: FunctionComponent<CreateCheckProps> = ({ open, handleClose }) => {
    const [detalles, setDetalles] = useState<DetalleCargaPalet[]>([])
    const schema = yup.object().shape({
        name: yup.string().required("Este campo es requerido"),
        sap: yup.number().required("Este campo es requerido"),
        amount: yup.number().required("Este campo es requerido"),
        basic: yup.number().required("Este campo es requerido"),
    })

    const formRef = useRef<HTMLFormElement>(null);

    const { handleSubmit, register, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            sap: 0,
            amount: 0,
            basic: 0,
        }
    })

    const handleSubmitForm = (data) => {
        handleClose && handleClose({}, "backdropClick")
    }

    const handleClickCreate = () => {
        formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
    }

    return (
        <>
            <BootstrapDialog open={open} onClose={handleClose} fullWidth={true} maxWidth="lg">
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Agregar
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
                <DialogContent dividers>
                    <Box>
                        <Container maxWidth="xl">
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <form onSubmit={handleSubmit(handleSubmitForm)} ref={formRef}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6} lg={4} xl={3}>
                                                <TextField
                                                    fullWidth
                                                    id="outlined-basic"
                                                    label="Producto"
                                                    variant="outlined"
                                                    size="small"
                                                    {...register("name")}
                                                    error={errors.name ? true : false}
                                                    helperText={errors.name?.message}
                                                // value={seguimiento?.datos?.placa}
                                                // onChange={(e) => updateSeguimientoDatos({ placa: e.target.value })}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6} lg={4} xl={3}>
                                                <TextField
                                                    fullWidth
                                                    id="outlined-basic"
                                                    label="No. SAP"
                                                    variant="outlined"
                                                    size="small"
                                                    type="number"
                                                    {...register("sap")}
                                                    error={errors.sap ? true : false}
                                                    helperText={errors.sap?.message}
                                                // value={seguimiento?.datos?.placa}
                                                // onChange={(e) => updateSeguimientoDatos({ placa: e.target.value })}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6} lg={4} xl={3}>
                                                <TextField
                                                    fullWidth
                                                    id="outlined-basic"
                                                    label="Basic"
                                                    variant="outlined"
                                                    size="small"
                                                    type="number"
                                                    {...register("basic")}
                                                    error={errors.basic ? true : false}
                                                    helperText={errors.basic?.message}
                                                // onChange={(e) => updateSeguimientoDatos({ nDocumento: +e.target.value })}
                                                // value={seguimiento?.datos?.nDocumento}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6} lg={4} xl={3}>
                                                <TextField
                                                    fullWidth
                                                    id="outlined-basic"
                                                    label="Cantidad"
                                                    variant="outlined"
                                                    size="small"
                                                    type="number"
                                                    {...register("amount")}
                                                    error={errors.amount ? true : false}
                                                    helperText={errors.amount?.message}
                                                // onChange={(e) => updateSeguimientoDatos({ nDocumento: +e.target.value })}
                                                // value={seguimiento?.datos?.nDocumento}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sx={{ marginTop: 4 }}>
                                                <Divider >
                                                    <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                                                        Pallets
                                                    </Typography>
                                                </Divider>
                                            </Grid>
                                            <Grid item xs={12}>
                                                {
                                                    detalles.map(detalle => {
                                                        <DetallePalet detalle={detalle} />
                                                    })
                                                }
                                            </Grid>
                                        </Grid>
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

interface DetallePaletProps {
    detalle: DetalleCargaPalet
}

function DetallePalet({ detalle }: DetallePaletProps) {
    return (
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
            <TableCell align="right">{detalle.date.toString()}</TableCell>
            <TableCell align="right">{detalle.amount}</TableCell>
        </TableRow>
    )
}


export default AgregarProductoModal;