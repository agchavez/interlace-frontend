// ClaimProducts.tsx
import React, { useState, useRef, useEffect } from "react";
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
    FormHelperText,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "sonner";
import { DetalleCarga } from "../../../store/seguimiento/seguimientoSlice";

export interface ProductItem {
    product: number;
    name: string;
    quantity: number;
    batch: string;
}

interface ClaimProductsProps {
    products: ProductItem[];
    onAddProduct: (item: ProductItem) => void;
    onEditProduct: (index: number, item: ProductItem) => void;
    onDeleteProduct: (index: number) => void;
    detalles: DetalleCarga[];
}

interface FormValues {
    producto: number | null;
    cantidad: number | null;
    lote: string;
}

const ClaimProducts: React.FC<ClaimProductsProps> = ({
    products,
    onAddProduct,
    onEditProduct,
    onDeleteProduct,
    detalles,
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
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            producto: null,
            cantidad: null,
            lote: "",
        },
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
        if (selectedProductId && detalles) {
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
            product: selectedProduct.productId,
            name: selectedProduct.name,
            quantity: data.cantidad || 0,
            batch: data.lote,
        };

        if (editingIndex !== null) {
            onEditProduct(editingIndex, newItem);
            toast.success("Producto editado");
            setEditingIndex(null);
        } else {
            // Verifica si el producto ya existe en la lista
            const existingProduct = products.find((item) => item.product === newItem.product);
            if (existingProduct) {
                toast.error("El producto ya está agregado");
                reset({
                    producto: null,
                    cantidad: null,
                    lote: "",
                });
                return;
            }
            // Si no existe, lo agrega
            onAddProduct(newItem);
            toast.success("Producto agregado");
        }
        reset();
        setSelectedProduct(null);
    };

    // Función para editar un producto: carga los datos en el formulario
    const handleEdit = (index: number) => {
        const item = products[index];
        setEditingIndex(index);
        setValue("producto", item.product);
        setValue("cantidad", item.quantity);
        setValue("lote", item.batch);
        setFocus("cantidad");
    };

    // Función para eliminar un producto
    const handleDelete = (index: number) => {
        onDeleteProduct(index);
        toast.success("Producto eliminado");
    };

    // Verificar si hay productos disponibles
    const hasProducts = detalles && detalles.length > 0;

    return (
        <Box>

            {/* Tabla de productos */}
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
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.batch}</TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={() => handleEdit(idx)} size="small">
                                        <EditIcon fontSize="inherit" />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(idx)} size="small">
                                        <DeleteIcon fontSize="inherit" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <Typography variant="body2">No hay productos asociados.</Typography>
            )}

            {/* Formulario para agregar/editar producto */}
            <Box
                component="form"
                onSubmit={handleSubmit(onSubmitForm)}
                ref={formRef}
                sx={{ mt: 2 }}
            >
                {!hasProducts && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        No hay productos disponibles para asociar.
                    </Typography>
                )}

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
                                valueAsNumber: true,
                            })}
                            error={Boolean(errors.cantidad)}
                            helperText={errors.cantidad?.message}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Lote"
                            variant="outlined"
                            size="small"
                            disabled={loading || !selectedProduct}
                            {...register("lote", { required: "Lote es requerido" })}
                            error={Boolean(errors.lote)}
                            helperText={errors.lote?.message}
                        />
                    </Grid>
                </Grid>
                <Button
                    type="submit"
                    variant="outlined"
                    sx={{ mt: 2 }}
                    disabled={loading || !selectedProduct}
                >
                    {editingIndex !== null ? "Actualizar Producto" : "Agregar Producto"}{" "}
                    {loading && <CircularProgress size={20} />}
                </Button>
            </Box>
        </Box>
    );
};

export default ClaimProducts;
