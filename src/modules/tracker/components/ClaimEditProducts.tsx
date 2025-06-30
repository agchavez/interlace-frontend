// ClaimEditProducts.tsx
import React, { useRef, useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormHelperText
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "sonner";

import { useAppSelector } from "../../../store/store";
import { DetalleCarga } from "../../../store/seguimiento/seguimientoSlice";

export interface ProductItem {
    id: number | null;
    product: number;
    productName: string;
    quantity: number;
    batch: string;
}

interface ClaimEditProductsProps {
    products: ProductItem[];
    disable: boolean;
    setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>;
    detalles?: DetalleCarga[]; // Detalles recibidos por props
    isLocal: boolean;
}

interface FormValues {
    producto: number | null;
    cantidad: number | null;
    lote: string;
}

const ClaimEditProducts: React.FC<ClaimEditProductsProps> = ({
    products,
    setProducts,
    disable,
    detalles = [], // Valor por defecto: array vacío
    isLocal,
}) => {
    const loading = useAppSelector((state) => state.maintenance.loading);

    const {
        handleSubmit,
        register,
        reset,
        setFocus,
        setValue,
        control,
        watch,
        formState: { errors }
    } = useForm<FormValues>({
        defaultValues: {
            producto: null,
            cantidad: null,
            lote: ""
        }
    });

    const selectedProductId = watch("producto");
    const [selectedProduct, setSelectedProduct] = useState<DetalleCarga | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // Al montar, se enfoca en el selector de producto
    useEffect(() => {
        setTimeout(() => {
            setFocus("producto");
        }, 100);
    }, [setFocus]);

    // Actualizar el producto seleccionado cuando cambie el valor del formulario
    useEffect(() => {
        if (selectedProductId && detalles.length > 0) {
            const product = detalles.find(p => p.id === selectedProductId) || null;
            setSelectedProduct(product);
            if (product) {
                setFocus("cantidad");
            }
        } else {
            setSelectedProduct(null);
        }
    }, [selectedProductId, detalles, setFocus]);

    // Enviar formulario de producto (para agregar o editar)
    const onSubmitForm = (data: FormValues) => {
        if (!selectedProduct) return;

        const newItem: ProductItem = {
            id: null, // Nuevo producto, sin ID existente
            product: selectedProduct.productId || selectedProduct.id,
            productName: selectedProduct.name,
            quantity: data.cantidad || 0,
            batch: data.lote
        };

        if (editingIndex !== null) {
            // Si estamos editando, mantener el ID original
            const originalId = products[editingIndex].id;
            newItem.id = originalId;

            setProducts((prev) =>
                prev.map((p, idx) => (idx === editingIndex ? newItem : p))
            );
            toast.success("Producto editado");
            setEditingIndex(null);
        } else {
            // Verificar si el producto ya existe en la lista
            const existingProductIndex = products.findIndex(
                (item) => item.product === newItem.product
            );

            if (existingProductIndex !== -1) {
                toast.error("El producto ya está agregado al reclamo");
                reset({
                    producto: null,
                    cantidad: null,
                    lote: "",
                });
                return;
            }

            setProducts((prev) => [...prev, newItem]);
            toast.success("Producto agregado");
        }
        reset();
        setSelectedProduct(null);
    };

    // Función para editar un producto existente
    const handleEdit = (index: number) => {
        const item = products[index];
        setEditingIndex(index);

        // Buscar el ID del producto en los detalles disponibles
        const productInDetails = detalles.find(p =>
            p.id === item.product || p.productId === item.product
        );

        if (productInDetails) {
            setValue("producto", productInDetails.id);
            setValue("cantidad", item.quantity);
            setValue("lote", item.batch);
            setFocus("cantidad");
        } else {
            // Si el producto no está en los detalles (podría ser de un tracker actualizado)
            toast.error("Este producto ya no está disponible en el seguimiento actual");
        }
    };

    // Función para eliminar un producto
    const handleDelete = (index: number) => {
        setProducts((prev) => prev.filter((_, i) => i !== index));
        toast.success("Producto eliminado del reclamo");
    };

    // Verificar si hay productos disponibles
    const hasProducts = detalles && detalles.length > 0;

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                {isLocal ? "Productos de la Alerta de Calidad" : "Productos del Reclamo"}
            </Typography>

            {!hasProducts && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                    No hay productos disponibles en el seguimiento asociado a este reclamo.
                </Typography>
            )}

            {/* Formulario para agregar/editar producto */}
            {!disable && <Box
                component="form"
                onSubmit={handleSubmit(onSubmitForm)}
                ref={formRef}
                sx={{ mb: 3 }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} md={5}>
                        <Controller
                            name="producto"
                            control={control}
                            rules={{ required: "Debe seleccionar un producto" }}
                            render={({ field, fieldState }) => (
                                <FormControl
                                    fullWidth
                                    size="small"
                                    error={!!fieldState.error}
                                    disabled={loading || !hasProducts}
                                >
                                    <InputLabel>Producto</InputLabel>
                                    <Select
                                        {...field}
                                        label="Producto"
                                        value={field.value || ""}
                                    >
                                        {detalles?.map((product) => (
                                            <MenuItem key={product.id} value={product.id}>
                                                {product.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {fieldState.error && (
                                        <FormHelperText>{fieldState.error.message}</FormHelperText>
                                    )}
                                </FormControl>
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Cantidad"
                            variant="outlined"
                            size="small"
                            type="number"
                            disabled={loading || !selectedProduct}
                            {...register("cantidad", {
                                required: "Cantidad es requerida",
                                valueAsNumber: true
                            })}
                            value={watch("cantidad") || ""}
                            error={Boolean(errors.cantidad)}
                            helperText={errors.cantidad?.message}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Lote"
                            variant="outlined"
                            size="small"
                            disabled={loading || !selectedProduct}
                            {...register("lote", { required: "Lote es requerido" })}
                            value={watch("lote") || ""}
                            error={Boolean(errors.lote)}
                            helperText={errors.lote?.message}
                        />
                    </Grid>
                    <Grid item xs={12} md={1}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading || !selectedProduct}
                            sx={{ height: '100%', width: '100%' }}
                        >
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : editingIndex !== null ? (
                                <EditIcon />
                            ) : (
                                "+"
                            )}
                        </Button>
                    </Grid>
                </Grid>
            </Box>}


            {products.length > 0 ? (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Texto Breve de Material</TableCell>
                            <TableCell>Cantidad</TableCell>
                            <TableCell>Lote</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((item, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{item.productName}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.batch}</TableCell>
                                <TableCell align="center">
                                    {
                                        !disable && <>
                                            <IconButton onClick={() => handleEdit(idx)} size="small">
                                                <EditIcon fontSize="inherit" />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(idx)} size="small">
                                                <DeleteIcon fontSize="inherit" />
                                            </IconButton>
                                        </>
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <Typography variant="body2" color="text.secondary">
                    No hay productos asociados a este reclamo.
                </Typography>
            )}
        </Box>
    );
};

export default ClaimEditProducts;
