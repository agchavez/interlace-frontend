import { 
    Box, 
    Button, 
    Container, 
    Dialog, 
    DialogActions, 
    DialogContent, DialogTitle, Grid, IconButton, TextField, styled } from "@mui/material";
import { FunctionComponent, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { addDetalleCargaSalida } from "../../../store/seguimiento/seguimientoSlice";
import { Product } from '../../../interfaces/tracking';
import { ProductSelect } from "../../ui/components/ProductSelect";

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

const AgregarProductoSalida: FunctionComponent<CreateCheckProps> = ({ open, handleClose }) => {
    const dispatch = useAppDispatch();
    const seguimeintoActual = useAppSelector(state => state.seguimiento.seguimeintoActual)

    const [product, setproduct] = useState<Product | null>(null);

    const { handleSubmit, register, formState: { errors }, reset, control, setFocus } = useForm<FormValues>({
        defaultValues: {
            producto: null,
            cantidad: 0
        }
    })

    const handleSubmitForm = (data: FormValues) => {
        if (!product) return
        dispatch(addDetalleCargaSalida({
            product,
            amount: data.cantidad,
            segIndex: seguimeintoActual || 0
        }))
        reset();
        setFocus("producto")
    }

    const handleSelectProduct = (value: Product | null) => {
        setproduct(value)
        
    }


    return (
        <>
            <BootstrapDialog open={open} onClose={handleClose} fullWidth={true} maxWidth="md">
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Agregar producto de salida
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
            <form onSubmit={handleSubmit(handleSubmitForm)}>
                <DialogContent dividers>
                    <Box>
                        <Container maxWidth="xl">
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={9}>
                                                <ProductSelect
                                                    control={control}
                                                    name="producto"
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
                                                    {...register("cantidad")}
                                                    error={errors.cantidad ? true : false}
                                                    helperText={errors.cantidad?.message}
                                                />
                                            </Grid>


                                        </Grid>
                                </Grid>
                            </Grid>
                        </Container>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="text"
                        color="primary"
                        type="submit"
                        
                        >
                        Agregar
                    </Button>
                </DialogActions>
                                    </form>
            </BootstrapDialog>
        </>
    );
}


export default AgregarProductoSalida;