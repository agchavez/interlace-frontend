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
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { Product } from "../../../interfaces/tracking";
import { ProductSelect } from "../../ui/components/ProductSelect";
import { getArticlesByBarcode } from "../../../store/maintenance/maintenanceThunk";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "sonner";

export interface ProductItem {
    product: string;
    quantity: number;
    batch: string;
}

interface ClaimProductsProps {
    products: ProductItem[];
    onAddProduct: (item: ProductItem) => void;
    onEditProduct: (index: number, item: ProductItem) => void;
    onDeleteProduct: (index: number) => void;
}

interface FormValues {
    producto: Product | null;
    cantidad: number | null;
    lote: string;
}

const ClaimProducts: React.FC<ClaimProductsProps> = ({
                                                         products,
                                                         onAddProduct,
                                                         onEditProduct,
                                                         onDeleteProduct,
                                                     }) => {
    const dispatch = useAppDispatch();
    const seguimeintoActual = useAppSelector((state) => state.seguimiento.seguimeintoActual);
    const loading = useAppSelector((state) => state.maintenance.loading);

    const {
        handleSubmit,
        register,
        reset,
        setFocus,
        setValue,
        control,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            producto: null,
            cantidad: null,
            lote: "",
        },
    });

    const [code, setCode] = useState<string>("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // Al montar, se enfoca en el selector de producto
    useEffect(() => {
        setTimeout(() => {
            setFocus("producto");
        }, 100);
    }, [setFocus]);

    // Manejo de selección de producto
    const handleSelectProduct = (value: Product | null) => {
        setSelectedProduct(value);
        setFocus("cantidad");
        setCode("");
    };

    // Enviar formulario de producto (para agregar o editar)
    const onSubmitForm = (data: FormValues) => {
        if (!selectedProduct) return;
        const newItem: ProductItem = {
            product: selectedProduct.name, // se asume que el objeto Product tiene la propiedad "name"
            quantity: data.cantidad || 0,
            batch: data.lote,
        };

        if (editingIndex !== null) {
            onEditProduct(editingIndex, newItem);
            toast.success("Producto editado");
            setEditingIndex(null);
        } else {
            onAddProduct(newItem);
            toast.success("Producto agregado");
        }
        reset();
        setSelectedProduct(null);
    };

    // Captura de código escaneado para obtener información del producto
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                if (code.length > 0) {
                    dispatch(getArticlesByBarcode(code, seguimeintoActual || 0));
                    setCode("");
                }
            } else {
                setCode((prev) => prev + e.key);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            setCode("");
        };
    }, [code, dispatch, seguimeintoActual]);

    // Función para editar un producto: carga los datos en el formulario
    const handleEdit = (index: number) => {
        const item = products[index];
        setEditingIndex(index);
        // Se asume que podemos reconstruir un objeto Product a partir del nombre
        setSelectedProduct({ name: item.product } as Product);
        setValue("cantidad", item.quantity);
        setValue("lote", item.batch);
        setFocus("cantidad");
    };

    // Función para eliminar un producto
    const handleDelete = (index: number) => {
        onDeleteProduct(index);
        toast.success("Producto eliminado");
    };

    return (
        <Box>
            <Typography variant="body1" gutterBottom>
                Productos asociados al reclamo
            </Typography>

            {/* Tabla de productos */}
            {products.length > 0 ? (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Producto</TableCell>
                            <TableCell>Cantidad</TableCell>
                            <TableCell>Lote</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((item, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{item.product}</TableCell>
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
            <Box component="form" onSubmit={handleSubmit(onSubmitForm)} ref={formRef} sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={5}>
                        <ProductSelect
                            control={control} // Ajusta este prop según la implementación de ProductSelect
                            name="producto"
                            disabled={loading}
                            onChange={handleSelectProduct}
                            placeholder="Producto"
                            isOutput={false}
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
                            {...register("cantidad", { required: "Cantidad es requerida", valueAsNumber: true })}
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
                            {...register("lote", { required: "Lote es requerido" })}
                            error={Boolean(errors.lote)}
                            helperText={errors.lote?.message}
                        />
                    </Grid>
                </Grid>
                <Button type="submit" variant="outlined" sx={{ mt: 2 }} disabled={loading}>
                    {editingIndex !== null ? "Actualizar Producto" : "Agregar Producto"}{" "}
                    {loading && <CircularProgress size={20} />}
                </Button>
            </Box>
        </Box>
    );
};

export default ClaimProducts;
