import { 
    Box, 
    Button, 
    CircularProgress, 
    Container, 
    Dialog, 
    DialogActions, 
    DialogContent, DialogTitle, Grid, IconButton, TextField, Typography, styled } from "@mui/material";
import { FunctionComponent, useRef, useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { Product } from '../../../interfaces/tracking';
import { ProductSelect } from "../../ui/components/ProductSelect";
import { getArticlesByBarcode } from '../../../store/maintenance/maintenanceThunk';
import { addDetalle } from "../../../store/seguimiento/trackerThunk";

interface CreateCheckProps {
    open: boolean;
    handleClose?: ((event: object, reason: "backdropClick" | "escapeKeyDown") => void) | undefined;
}

interface FormValues {
    producto: Product | null;
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
    const [code, setcode] = useState<string>('')
    const seguimeintoActual = useAppSelector(state => state.seguimiento.seguimeintoActual)
    const loading = useAppSelector(state => state.maintenance.loading)
    const formRef = useRef<HTMLFormElement>(null);

    const [product, setproduct] = useState<Product | null>(null);

    const { handleSubmit, register, formState: { errors }, reset, setFocus, control, setValue } = useForm<FormValues>({
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
        if (!product) return
        dispatch(addDetalle(seguimeintoActual || 0, {
            quantity: data.cantidad,
            product: product
        }))
        // dispatch(addDetalleCarga({
        //     ...product,
        //     amount: data.cantidad,
        //     history: [],
        //     index: seguimeintoActual || 0,
        // }))
        reset();
        handleClose && handleClose({}, "backdropClick")
    }

    const handleClickCreate = () => {
        setcode('');
        formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
    }

    const handleSelectProduct = (value: Product | null) => {
        setproduct(value);
        setFocus("cantidad");
        setcode('');
    }


    // Estar pendiente de lo que se escanea y cuando se presiona enter
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (code.length > 0) {
                    dispatch(getArticlesByBarcode(code, seguimeintoActual || 0))
                    setcode('')
                }
            } else {
                setcode(code + e.key)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            setcode('')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code])


    return (
        <>
            <BootstrapDialog open={open} onClose={handleClose} fullWidth={true} maxWidth="md">
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
                                <Grid   item xs={12}>
                                    <Typography variant="body2" component="h2">
                                        Agrege un producto al seguimiento actual, ademas de la cantidad que se esta cargando. Puede escanear el codigo de barras del producto para agilizar el proceso.
                                    </Typography>
                                    </Grid>
                                <Grid item xs={12}>
                                    <form onSubmit={handleSubmit(handleSubmitForm)} ref={formRef}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={9}>
                                                <ProductSelect
                                                    control={control}
                                                    name="producto"
                                                    disabled={loading}
                                                    onChange={handleSelectProduct}
                                                    placeholder="Producto"
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
                                                    disabled={loading || !product}
                                                    {...register("cantidad")}
                                                    onChange={(e) => {
                                                        if (e.target.value === '') return
                                                        const value = parseInt(e.target.value)
                                                        setValue("cantidad", value)
                                                        setcode('')
                                                    }}
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
                    <Button onClick={handleClickCreate} startIcon={loading ? <CircularProgress size={20} /> : null} disabled={loading}>
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