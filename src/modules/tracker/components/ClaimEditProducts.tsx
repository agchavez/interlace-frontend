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
    Typography
} from "@mui/material";
import { useForm } from "react-hook-form";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "sonner";

import { Product } from "../../../interfaces/tracking";
import { ProductSelect } from "../../ui/components/ProductSelect";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { getArticlesByBarcode } from "../../../store/maintenance/maintenanceThunk";

export interface ProductItem {
    id: number | null;
    product: number;
    productName: string;
    quantity: number;
    batch: string;
}

interface ClaimEditProductsProps {
    products: ProductItem[];
    setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>;
}

interface FormValues {
    producto: Product | null;
    cantidad: number | null;
    lote: string;
}

const ClaimEditProducts: React.FC<ClaimEditProductsProps> = ({ products, setProducts }) => {
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
        formState: { errors }
    } = useForm<FormValues>({
        defaultValues: {
            producto: null,
            cantidad: null,
            lote: ""
        }
    });

    const [code, setCode] = useState<string>("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        setTimeout(() => {
            setFocus("producto");
        }, 100);
    }, [setFocus]);

    const handleSelectProduct = (value: Product | null) => {
        setSelectedProduct(value);
        setFocus("cantidad");
        setCode("");
    };

    const onSubmitForm = (data: FormValues) => {
        if (!selectedProduct) return;
        const newItem: ProductItem = {
            id: null,
            product: selectedProduct.id,
            productName: selectedProduct.name,
            quantity: data.cantidad || 0,
            batch: data.lote
        };

        if (editingIndex !== null) {
            setProducts((prev) =>
                prev.map((p, idx) => (idx === editingIndex ? newItem : p))
            );
            toast.success("Producto editado");
            setEditingIndex(null);
        } else {
            setProducts((prev) => [...prev, newItem]);
            toast.success("Producto agregado");
        }
        reset();
        setSelectedProduct(null);
    };

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

    const handleEdit = (index: number) => {
        const item = products[index];
        setEditingIndex(index);
        setSelectedProduct({ name: item.productName } as Product);
        setValue("cantidad", item.quantity);
        setValue("lote", item.batch);
        setFocus("cantidad");
    };

    const handleDelete = (index: number) => {
        setProducts((prev) => prev.filter((_, i) => i !== index));
        toast.success("Producto eliminado");
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Productos del Reclamo
            </Typography>

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
                                <TableCell>{item.productName}</TableCell>
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
                <Typography variant="body2">No hay productos en este reclamo.</Typography>
            )}

            <Box
                component="form"
                onSubmit={handleSubmit(onSubmitForm)}
                ref={formRef}
                sx={{ mt: 2 }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} md={5}>
                        <ProductSelect
                            control={control}
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
                            {...register("cantidad", {
                                required: "Cantidad es requerida",
                                valueAsNumber: true
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
                            {...register("lote", { required: "Lote es requerido" })}
                            error={Boolean(errors.lote)}
                            helperText={errors.lote?.message}
                        />
                    </Grid>
                </Grid>
                <Button type="submit" variant="outlined" sx={{ mt: 2 }} disabled={loading}>
                    {editingIndex !== null ? "Actualizar Producto" : "Agregar Producto"}
                    {loading && <CircularProgress size={20} />}
                </Button>
            </Box>
        </Box>
    );
};

export default ClaimEditProducts;
