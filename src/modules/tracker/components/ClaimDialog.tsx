// ClaimModal.tsx
import React, { FC, useState, useEffect } from "react";
import {
    Dialog,
    DialogActions,
    Button,
    Divider,
    Typography,
    Box,
    Grid,
    DialogContent,
    TextField,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from "@mui/material";
import {Controller, useForm } from "react-hook-form";
import { styled } from "@mui/material/styles";
import ClaimTabs from "./ClaimTabs";
import ClaimDocumentation from "./ClaimDocumentation";
import ClaimProducts, { ProductItem } from "./ClaimProducts";
import { errorApiHandler } from "../../../utils/error";
import { useCreateClaimMutation } from "../../../store/claim/claimApi";
import { toast } from "sonner";
import BootstrapDialogTitle from "../../ui/components/BoostrapDialog.tsx";


const claimTypes = [
    { value: "FALTANTE", label: "Faltante" },
    { value: "SOBRANTE", label: "Sobrante" },
    { value: "DAÑOS_CALIDAD_TRANSPORTE", label: "Daños por Calidad y Transporte" },
];

export interface FormData {
    tipo: string;
    descripcion: string;
    claimNumber: string;
    claimFile: File | null;
    creditMemoFile: File | null;
    discardDoc: string;
    observations: string;
    observationsFile: File | null;
    photos_container_closed: File[];
    photos_container_one_open: File[];
    photos_container_two_open: File[];
    photos_container_top: File[];
    photos_during_unload: File[];
    photos_pallet_damage: File[];
    photos_damaged_product_base: File[];
    photos_damaged_product_dents: File[];
    photos_damaged_boxes: File[];
    photos_grouped_bad_product: File[];
    photos_repalletized: File[];
}

export const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialogContent-root": {
        padding: theme.spacing(2)
    },
    "& .MuiDialogActions-root": {
        padding: theme.spacing(1)
    }
}));

interface ClaimModalProps {
    open: boolean;
    onClose: () => void;
    tracker: number;
}

export const ClaimModal: FC<ClaimModalProps> = ({ open, onClose, tracker }) => {
    const [tabIndex, setTabIndex] = useState(0);
    const handleTabChange = (_event: React.SyntheticEvent, newIndex: number) => {
        setTabIndex(newIndex);
    };

    const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            tipo: "FALTANTE",
            descripcion: "",
            claimNumber: "",
            claimFile: null,
            creditMemoFile: null,
            discardDoc: "",
            observations: "",
            observationsFile: null,
            photos_container_closed: [],
            photos_container_one_open: [],
            photos_container_two_open: [],
            photos_container_top: [],
            photos_during_unload: [],
            photos_pallet_damage: [],
            photos_damaged_product_base: [],
            photos_damaged_product_dents: [],
            photos_damaged_boxes: [],
            photos_grouped_bad_product: [],
            photos_repalletized: []
        }
    });

    const [createClaim, { isLoading, isSuccess, error }] = useCreateClaimMutation();
    const [products, setProducts] = useState<ProductItem[]>([]);

    const addProduct = (item: ProductItem) => {
        setProducts((prev) => [...prev, item]);
    };

    const editProduct = (index: number, item: ProductItem) => {
        setProducts((prev) => prev.map((p, i) => (i === index ? item : p)));
    };

    const deleteProduct = (index: number) => {
        setProducts((prev) => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: FormData) => {
        try {
            const formData = new FormData();
            formData.append("tracker_id", tracker.toString());
            formData.append("claim_type", data.tipo);
            formData.append("descripcion", data.descripcion);
            formData.append("claim_number", data.claimNumber);
            formData.append("discard_doc", data.discardDoc);
            formData.append("description", data.observations);

            // Se recorre el arreglo de productos para incluirlos
            products.forEach((item, index) => {
                formData.append(`products[${index}][product]`, item.product);
                formData.append(`products[${index}][quantity]`, item.quantity.toString());
                formData.append(`products[${index}][batch]`, item.batch);
            });

            if (data.claimFile) formData.append("claim_file", data.claimFile);
            if (data.creditMemoFile) formData.append("credit_memo_file", data.creditMemoFile);
            if (data.observationsFile) formData.append("observations_file", data.observationsFile);

            data.photos_container_closed.forEach((file) => {
                formData.append("photos_container_closed", file);
            });
            data.photos_container_one_open.forEach((file) => {
                formData.append("photos_container_one_open", file);
            });
            data.photos_container_two_open.forEach((file) => {
                formData.append("photos_container_two_open", file);
            });
            data.photos_container_top.forEach((file) => {
                formData.append("photos_container_top", file);
            });
            data.photos_during_unload.forEach((file) => {
                formData.append("photos_during_unload", file);
            });
            data.photos_pallet_damage.forEach((file) => {
                formData.append("photos_pallet_damage", file);
            });
            data.photos_damaged_product_base.forEach((file) => {
                formData.append("photos_damaged_product_base", file);
            });
            data.photos_damaged_product_dents.forEach((file) => {
                formData.append("photos_damaged_product_dents", file);
            });
            data.photos_damaged_boxes.forEach((file) => {
                formData.append("photos_damaged_boxes", file);
            });
            data.photos_grouped_bad_product.forEach((file) => {
                formData.append("photos_grouped_bad_product", file);
            });
            data.photos_repalletized.forEach((file) => {
                formData.append("photos_repalletized", file);
            });

            console.log(formData)
            await createClaim(formData).unwrap();
            toast.success("Registro de reclamo", {
                description: "Reclamo registrado exitosamente"
            });
        } catch (err: any) {
            console.error("Error al enviar el reclamo:", err);
            errorApiHandler(err, "Error al registrar el reclamo");
        }
    };

    useEffect(() => {
        if (isSuccess && !isLoading) {
            onClose();
        }
        if (error) {
            errorApiHandler(error, "Error al registrar el reclamo");
        }
    }, [isSuccess, isLoading, error, onClose]);

    return (
        <BootstrapDialog open={open} maxWidth="lg" fullWidth>
            {/* Conservamos el DialogTitle original */}
            <BootstrapDialogTitle onClose={onClose} id="customized-dialog-title">
                <Typography variant="h6" color="white" fontWeight={400}>
                    Levantar Reclamo - Tracker Importado
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" color="white">
                        Complete el formulario para registrar el reclamo
                    </Typography>
                </Box>
            </BootstrapDialogTitle>
            <Divider sx={{ mt: 1 }} />
            <DialogContent sx={{ pb: 0 }}>
                {/* Sección "Datos Generales" que siempre se muestra arriba */}
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">
                            Datos Generales
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small" error={Boolean(errors.tipo)}>
                            <InputLabel id="tipo-reclamo-label">Tipo de Reclamo</InputLabel>
                            <Controller
                                name="tipo"
                                control={control}
                                render={({ field }) => (
                                    <Select labelId="tipo-reclamo-label" label="Tipo de Reclamo" {...field}>
                                        {claimTypes.map((t) => (
                                            <MenuItem key={t.value} value={t.value}>
                                                {t.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                            {errors.tipo && (
                                <Typography variant="caption" color="error">
                                    {errors.tipo.message}
                                </Typography>
                            )}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="Número de Claim" fullWidth size="small" {...register("claimNumber")} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Observaciones"
                            fullWidth
                            size="small"
                            multiline
                            rows={3}
                            {...register("observations")}
                        />
                    </Grid>
                </Grid>

                {/* Luego de los datos generales, se muestran los Tabs */}
                <ClaimTabs value={tabIndex} onChange={handleTabChange} />

                {/* Tab Panel: Documentación */}
                <div role="tabpanel" hidden={tabIndex !== 0} id="claim-tabpanel-0">
                    <ClaimDocumentation
                        register={register}
                        control={control}
                        errors={errors}
                        setValue={setValue}
                        watch={watch}
                    />
                </div>

                {/* Tab Panel: Productos */}
                <div role="tabpanel" hidden={tabIndex !== 1} id="claim-tabpanel-1">
                    <ClaimProducts
                        products={products}
                        onAddProduct={addProduct}
                        onEditProduct={editProduct}
                        onDeleteProduct={deleteProduct}
                    />
                </div>
            </DialogContent>
            <Divider />
            <DialogActions>
                <Button
                    variant="text"
                    onClick={() => {
                        reset();
                        setProducts([]);
                    }}
                    // Puedes agregar el icono CleaningServicesIcon aquí si lo deseas
                    color="primary"
                >
                    Limpiar
                </Button>
                <Button variant="outlined" type="submit" color="secondary" onClick={handleSubmit(onSubmit)} disabled={isLoading}>
                    Enviar Reclamo
                </Button>
            </DialogActions>
        </BootstrapDialog>
    );
};

export default ClaimModal;
