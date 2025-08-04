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
    CircularProgress,
    useTheme,
    useMediaQuery
} from "@mui/material";
import { useForm } from "react-hook-form";
import { styled } from "@mui/material/styles";
import ClaimTabs from "./ClaimTabs";
import ClaimDocumentation from "./ClaimDocumentation";
import ClaimProducts, { ProductItem } from "./ClaimProducts";
import { errorApiHandler } from "../../../utils/error";
import { useCreateClaimMutation } from "../../../store/claim/claimApi";
import { toast } from "sonner";
import BootstrapDialogTitle from "../../ui/components/BoostrapDialog.tsx";
import ClaimTypeSelect from "../../ui/components/ClaimTypeSelect.tsx";
import BookmarkAddTwoToneIcon from '@mui/icons-material/BookmarkAddTwoTone';
import CleaningServicesTwoToneIcon from '@mui/icons-material/CleaningServicesTwoTone';
import { Seguimiento, setClaimByTrackerId } from "../../../store/seguimiento/seguimientoSlice.ts";
import { useAppDispatch } from "../../../store";

export interface FormData {
    tipo: number;
    claimFile: File | null;
    creditMemoFile: File | null;
    production_batch_file: File | null;
    discardDoc: string;
    observations: string;
    observationsFile: File | null;
    photos_container_closed: File[];
    photos_container_one_open: File[];
    photos_container_two_open: File[];
    photos_container_top: File[];
    photos_during_unload: File[];
    photos_pallet_damage: File[];
    photos_production_batch: File[];
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
    type: 'LOCAL' | 'IMPORT';
    seguimiento: Seguimiento;
}

export const ClaimModal: FC<ClaimModalProps> = ({ open, onClose, tracker, type, seguimiento }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [tabIndex, setTabIndex] = useState(0);
    const handleTabChange = (_event: React.SyntheticEvent, newIndex: number) => {
        setTabIndex(newIndex);
    };

    const dispatch = useAppDispatch();

    const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            tipo: 0,
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
            photos_repalletized: [],
            photos_production_batch: []
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
            if (data.tipo === 0) {
                toast.error("Error al registrar el reclamo", {
                    description: "Debe seleccionar un Tipo de Reclamo"
                });
                return;
            }
            formData.append("tracker_id", tracker.toString());
            formData.append("claim_type", data.tipo.toString());
            formData.append("discard_doc", data.discardDoc);
            formData.append("description", data.observations);

            // Se recorre el arreglo de productos para incluirlos
            formData.append("products", JSON.stringify(products.map((product) => ({
                product: product.product,
                quantity: product.quantity,
                batch: product.batch
            }))));

            if (data.claimFile) formData.append("claim_file", data.claimFile);
            if (data.creditMemoFile) formData.append("credit_memo_file", data.creditMemoFile);
            if (data.observationsFile) formData.append("observations_file", data.observationsFile);
            if (data.production_batch_file) formData.append("production_batch_file", data.production_batch_file);
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
            data.photos_production_batch.forEach((file) => {
                formData.append("photos_production_batch", file);
            });
            const calim = await createClaim(formData).unwrap();
            dispatch(setClaimByTrackerId({ id: tracker, claim: calim.id }));
            toast.success("Registro de reclamo", {
                description: "Reclamo registrado exitosamente"
            });
        } catch (err) {
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
        <BootstrapDialog
            open={open}
            maxWidth={isMobile ? false : "lg"}
            fullWidth={!isMobile}
            fullScreen={isMobile}
        >
            {/* Conservamos el DialogTitle original */}
            <BootstrapDialogTitle onClose={onClose} id="customized-dialog-title">
                <Typography variant="h6" color="white" fontWeight={400}>
                    {type === 'IMPORT' ? "Levantar Reclamo - Tracker Importado" : "Levantar Alerta de Calidad - Tracker Local"}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" color="white">
                        Complete el formulario para registrar { type === 'IMPORT' ? "el reclamo" : "la alerta de calidad" }
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
                    <Grid item xs={12} sm={6} lg={4}>
                        <ClaimTypeSelect
                            control={control}
                            name="tipo"
                            local={type === 'LOCAL'}
                            placeholder="Seleccione o ingrese un tipo de reclamo"
                            required={true}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={8}>
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
                        type={type}
                    />
                </div>

                {/* Tab Panel: Productos */}
                <div role="tabpanel" hidden={tabIndex !== 1} id="claim-tabpanel-1">
                    <ClaimProducts
                        products={products}
                        onAddProduct={addProduct}
                        onEditProduct={editProduct}
                        onDeleteProduct={deleteProduct}
                        detalles={seguimiento.detalles}
                    />
                </div>
            </DialogContent>
            <Divider />
            <DialogActions>
                <Button
                    variant="outlined"
                    onClick={() => {
                        reset();
                        setProducts([]);
                    }}
                    disabled={isLoading}
                    startIcon={<CleaningServicesTwoToneIcon />} // Puedes agregar el icono CleaningServicesIcon aquí si lo deseas
                    // Puedes agregar el icono CleaningServicesIcon aquí si lo deseas
                    color="primary"
                >
                    Limpiar
                </Button>
                <Button 
                    variant="contained" 
                    type="submit" 
                    color="secondary"
                    startIcon={
                    isLoading ? <CircularProgress size={20} /> :
                    <BookmarkAddTwoToneIcon />} 
                    onClick={handleSubmit(onSubmit)} 
                    disabled={isLoading}>
                    Guardar Reclamo
                </Button>
            </DialogActions>
        </BootstrapDialog>
    );
};

export default ClaimModal;
