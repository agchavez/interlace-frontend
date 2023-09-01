import { Autocomplete, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, TextField,styled } from "@mui/material";
import { FunctionComponent, useRef, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
// import { Rastra } from '../../../interfaces/tracking';
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
// import { useAppDispatch, useAppSelector } from "../../../store";
// import { DetalleCargaPalet, addSeguimiento } from "../../../store/seguimiento/seguimientoSlice";
import { productos } from "../../../utils/data";
import { useAppDispatch } from '../../../store/store';
import { addDetalleCarga } from "../../../store/seguimiento/seguimientoSlice";
import { Producto } from "../../../interfaces/tracking";

interface CreateCheckProps {
    open: boolean;
    handleClose?: ((event: object, reason: "backdropClick" | "escapeKeyDown") => void) | undefined;
}

interface FormValues {
    producto: Producto | null;
    cantidad: number;
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
    const schema = yup.object<FormValues>().shape({
        producto: yup.object<Producto | null>().nullable().required("Este campo es requerido"),
        cantidad: yup.number().required("Este campo es requerido").min(1, "La cantidad debe ser mayor a 0")

    })
    const dispatch = useAppDispatch();

    const formRef = useRef<HTMLFormElement>(null);

    const { handleSubmit, register, formState: { errors }, setValue, reset, setFocus } = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        defaultValues: {
            producto: null,
            cantidad: 0
        }
    })
    // FOcus al abrir el modal
    useEffect(() => {
        setFocus("producto")
    }, [setFocus])

    const handleSubmitForm = (data : FormValues) => {
        dispatch(addDetalleCarga({
            id: data.producto?.codigo,
            name: data.producto?.descripcion,
            sap: data.producto?.codigo,
            basic: undefined,
            amount: data.cantidad,
            history: []
        }))
        reset();
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
                                            <Grid item xs={12} md={9}>
                                                <Autocomplete
                                                    id="combo-box-demo"
                                                    options={productos}
                                                    getOptionLabel={(option) => option.codigo + " - " + option.descripcion}
                                                    size="small"
                                                    autoFocus
                                                    // el id del input es codigo
                                                    {...register("producto")}
                                                    onChange={(_e, data) => setValue("producto", data)}
                                                    
                                                    renderInput={(params) => <TextField 
                                                        {...params} 
                                                        error={errors.producto ? true : false}
                                                        label="Producto" 
                                                        helperText={errors.producto?.message}
                                                        fullWidth />}
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
                                                    {...register("cantidad")}
                                                    error={errors.cantidad ? true : false}
                                                    helperText={errors.cantidad?.message}
                                                // onChange={(e) => updateSeguimientoDatos({ nDocumento: +e.target.value })}
                                                // value={seguimiento?.datos?.nDocumento}
                                                />
                                            </Grid>
                                            {/* <Grid item xs={12} sx={{ marginTop: 4 }}>
                                                <Divider >
                                                    <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                                                        Pallets
                                                    </Typography>
                                                </Divider>
                                            </Grid> */}
                                            {/* <Grid item xs={12}>
                                                {
                                                    detalles.map(detalle => {
                                                        <DetallePalet detalle={detalle} />
                                                    })
                                                }
                                            </Grid> */}
                                        </Grid>
                                    </form>
                                </Grid>
                            </Grid>
                        </Container>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleClickCreate}>
                        Agregar
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </>
    );
}

// interface DetallePaletProps {
//     detalle: DetalleCargaPalet
// }

// function DetallePalet({ detalle }: DetallePaletProps) {
//     return (
//         <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
//             <TableCell align="right">{detalle.date.toString()}</TableCell>
//             <TableCell align="right">{detalle.amount}</TableCell>
//         </TableRow>
//     )
// }


export default AgregarProductoModal;