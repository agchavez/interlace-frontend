import { 
    Autocomplete, 
    Box, 
    Button, 
    Container, 
    Dialog, 
    DialogActions, 
    DialogContent, DialogTitle, Grid, IconButton, TextField, styled } from "@mui/material";
import { FunctionComponent, useRef, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { addDetalleCarga } from "../../../store/seguimiento/seguimientoSlice";
import { Producto } from "../../../interfaces/tracking";
import { productos } from "../../../utils/data";

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
    const dispatch = useAppDispatch();
    const seguimeintoActual = useAppSelector(state => state.seguimiento.seguimeintoActual)

    const formRef = useRef<HTMLFormElement>(null);

    const { handleSubmit, register, formState: { errors }, setValue, reset, setFocus } = useForm<FormValues>({
        defaultValues: {
            producto: null,
            cantidad: 0
        }
    })
    // FOcus al abrir el modal
    useEffect(() => {
        setTimeout(() => {
            setFocus("producto")
        }, 100);
    }, [open, setFocus])

    const handleSubmitForm = (data: FormValues) => {
        dispatch(addDetalleCarga({
            id: data.producto?.codigo,
            name: data.producto?.descripcion,
            sap: data.producto?.codigo,
            basic: undefined,
            amount: data.cantidad,
            history: [],
            index: seguimeintoActual || 0,
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
                                                    id="producto"
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