import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Table, TableBody, TableContainer, TableHead, TextField, Typography, styled } from "@mui/material";
import { FC, useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import TableRow from '@mui/material/TableRow';
import { StyledTableCell } from './CheckForm';
import { useForm } from "react-hook-form";
import { OrderSelect } from "../../ui/components/OrderSelect";
import { useGetOrderByIdQuery } from "../../../store/order";
import { OrderDetail, OrderDetailCreateBody } from '../../../interfaces/orders';


interface SelectOrderTrackerModalProps {
    open: boolean;
    handleClose: () => void;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialogContent-root": {
        padding: theme.spacing(2),
    },
    "& .MuiDialogActions-root": {
        padding: theme.spacing(1),
    },
}));

export const SelectOrderTrackerModal: FC<SelectOrderTrackerModalProps> = ({ open, handleClose }) => {
    const { control } = useForm();
    const [id, setid] = useState<number | null>(null);

    const { data: order, refetch } = useGetOrderByIdQuery(id ?? 0, {
        skip: !id,
    });

    const [body, setbody] = useState<OrderDetailCreateBody[]>([]);
    
    const handleAdd = (detail: OrderDetail, quantity: number, checked: boolean) => {
        // Encuentra el índice del detalle en el estado actual
        const index = body.findIndex((item) => item.order_detail_id === detail.id);
        // Si el índice es -1 y el checkbox no está marcado, no hagas nada
        if (!checked) {
            // Quitar del array el elemento que tenga el id del detalle
            setbody((prevBody) => prevBody.filter((item) => item.order_detail_id !== detail.id));
            return;
        }

        // Si el índice es -1 y el checkbox está marcado, agrega un nuevo elemento al estado
        if (index === -1 && checked) {
            const newItem: OrderDetailCreateBody = {
                order_detail_id: detail.id ?? 0,
                quantity,
                expiration_date: detail.expiration_date,
                order: detail.order,
                tracker_detail_product: detail.tracker_detail_product,
            }

            setbody((prevBody) => [...prevBody, newItem]);
        } else {
            // Si el índice no es -1, actualiza la cantidad del detalle existente
            setbody((prevBody) => {
                const newBody = [...prevBody];
                newBody[index].quantity = quantity;
                return newBody;
            });
        }
    };


    useEffect(() => {
        if (id && refetch) {
            refetch();
        }
    }, [id, refetch]);


    useEffect(() => {
        return () => {
            setid(null);
        };
    }, [handleClose]);



    return (
        <>
            <BootstrapDialog open={open} onClose={handleClose} fullWidth={true} maxWidth="lg">
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    <Typography variant="h6" component="div" fontWeight={400}>
                        Configuración de pedido
                    </Typography>
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={() => handleClose()}
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
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <OrderSelect
                                control={control}
                                name="order"
                                label="Pedido"
                                ignoreCompleted={true}
                                onChange={(value) => { setid(value?.id ?? null) }}
                            />
                        </Grid>
                        <Grid item xs={3} md={2}>
                        </Grid>
                        <Grid item xs={3} md={2}>
                            <Typography variant="body1" component="h2">
                                Localidad:
                                <Typography variant="body2" component="h2">
                                    {order?.location_data.name}
                                </Typography>
                            </Typography>
                        </Grid>
                        <Grid item xs={3} md={2}>
                            <Typography variant="body1" component="h2">
                                Ruta:
                                <Typography variant="body2" component="h2">
                                    --
                                </Typography>
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sx={{ marginTop: 2 }}>
                            <Typography variant="h6" component="h2">
                                Detalle del pedido
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <StyledTableCell size="small" align="center">

                                            </StyledTableCell>
                                            <StyledTableCell size="small" align="center">
                                                #Tracking
                                            </StyledTableCell>
                                            <StyledTableCell size="small" align="center">N° SAP</StyledTableCell>
                                            <StyledTableCell size="small" align="left">Producto</StyledTableCell>
                                            <StyledTableCell size="small" align="left">Fecha de vencimiento</StyledTableCell>
                                            <StyledTableCell size="small" align="center">Cantidad a despachar</StyledTableCell>
                                            <StyledTableCell size="small" align="center">Cantidad</StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            order?.order_detail.map((detail) => (
                                                <TableRowComponent
                                                    key={detail.id}
                                                    handleAdd={handleAdd}
                                                    detail={detail} />
                                            ))
                                        }

                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => handleClose()} color="primary">
                        Confirmar
                    </Button>
                </DialogActions>
            </BootstrapDialog>

        </>
    )
}

interface TableRowComponentProps {
    detail: OrderDetail;
    handleAdd: (detail: OrderDetail, quantity: number, checked: boolean) => void
}
const TableRowComponent: FC<TableRowComponentProps> = ({ detail, handleAdd }) => {
    const [isChecked, setIsChecked] = useState(false);
    const [isTextEnabled, setIsTextEnabled] = useState(false);

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
        setIsTextEnabled(!isTextEnabled);
    };
    
    const {register, setValue, watch} = useForm<{quantity: number | null}>();


    return (
        <TableRow style={{ backgroundColor: !isTextEnabled ? '#e0e0e0' : 'inherit' }} // Cambia el color de fondo si el texto está deshabilitado
        >
            <StyledTableCell size="small" align="left">
                <Checkbox checked={isChecked} onChange={
                    () => {
                        handleCheckboxChange();
                        isChecked && handleAdd(detail, detail.quantity_available, !isChecked);
                        isChecked && setValue(`quantity`, null);
                    }
                } color="secondary" />
            </StyledTableCell>
            <StyledTableCell size="small" align="center">
                TRK-{detail.tracking_id.toString().padStart(5, '0')}
            </StyledTableCell>
            <StyledTableCell size="small" align="center">
                {detail.product_data?.sap_code}
            </StyledTableCell>
            <StyledTableCell size="small" align="left">
                {detail.product_data?.name}
            </StyledTableCell>
            <StyledTableCell size="small" align="left">
                {detail.expiration_date}
            </StyledTableCell>
            <StyledTableCell size="small" align="left">
                {detail.quantity_available}
            </StyledTableCell>
            <StyledTableCell size="small" align="center">
                <TextField
                    id="standard-basic"
                    label="Cantidad"
                    variant="standard"
                    color="secondary"
                    size="small"
                    type="number"
                    {...register(`quantity`)}
                    value={watch(`quantity`) ?? ''}
                    disabled={!isTextEnabled}
                    onBlur={(e) => handleAdd(detail, Number(e.target.value), isChecked)}
                />
            </StyledTableCell>
        </TableRow>
    );
};

export default TableRowComponent;
