// ClaimEditModal.tsx
import React, { FC, useEffect, useState } from "react";
import {
    Dialog,
    DialogActions,
    Button,
    Divider,
    Typography,
    Box,
    DialogContent,
    CircularProgress,
    Alert
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { toast } from "sonner";

import { useForm } from "react-hook-form";

import { errorApiHandler } from "../../../utils/error";
import BootstrapDialogTitle from "../../ui/components/BoostrapDialog";
import ClaimTabs from "./ClaimTabs";

import ClaimEditDocumentation, { EditFormData } from "./ClaimEditDocumentation";
import ClaimEditProducts, { ProductItem } from "./ClaimEditProducts";

import {
    useGetClaimByIdQuery,
    useUpdateClaimMutation,
} from "../../../store/claim/claimApi";
import ClaimCard from "./ClaimCard.tsx";
import { SaveAltOutlined } from "@mui/icons-material";
import { Seguimiento } from "../../../store/seguimiento/seguimientoSlice.ts";

export const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialogContent-root": {
        padding: theme.spacing(2)
    },
    "& .MuiDialogActions-root": {
        padding: theme.spacing(1)
    }
}));

interface ClaimEditModalProps {
    open: boolean;
    onClose: () => void;
    claimId: number; // Reclamo a editar
    seguimiento: Seguimiento
}

const ClaimEditModal: FC<ClaimEditModalProps> = ({ open, onClose, claimId, seguimiento }) => {
    // 1) Cargar reclamo
    const { data: claimData, isLoading } = useGetClaimByIdQuery(claimId, {
        skip: !open
    });

    // 2) Mutación
    const [updateClaim, { isLoading: isUpdating, error: updateError }] = useUpdateClaimMutation();

    // 3) Tabs
    const [tabIndex, setTabIndex] = useState(0);
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    // 4) Form
    const { register, handleSubmit, control, setValue, watch, reset } = useForm<EditFormData>();

    // 5) Products
    const [products, setProducts] = useState<ProductItem[]>([]);

    // 6) Al cargar claimData => poblar
    useEffect(() => {
        if (claimData) {
            // Llenar form
            reset({
                tipo: claimData.claim_type,
                descripcion: claimData.description || "",
                claimNumber: claimData.claim_number || "",
                discardDoc: claimData.discard_doc || "",
                observations: claimData.observations || "",

                claimFile: null,
                creditMemoFile: null,
                observationsFile: null,

                // remove arrays
                photos_container_closed_remove: [],
                photos_container_one_open_remove: [],
                photos_container_two_open_remove: [],
                photos_container_top_remove: [],
                photos_during_unload_remove: [],
                photos_pallet_damage_remove: [],
                photos_damaged_product_base_remove: [],
                photos_damaged_product_dents_remove: [],
                photos_damaged_boxes_remove: [],
                photos_grouped_bad_product_remove: [],
                photos_repalletized_remove: [],
                photos_production_batch_remove: [],

                // add arrays
                photos_container_closed_add: [],
                photos_container_one_open_add: [],
                photos_container_two_open_add: [],
                photos_container_top_add: [],
                photos_during_unload_add: [],
                photos_pallet_damage_add: [],
                photos_damaged_product_base_add: [],
                photos_damaged_product_dents_add: [],
                photos_damaged_boxes_add: [],
                photos_grouped_bad_product_add: [],
                photos_repalletized_add: [],
                photos_production_batch_add: []
            });

            // Llenar products
            const loaded = claimData.claim_products?.map((cp) => ({
                id: cp.id,
                product: cp.product,
                productName: cp.product_name,
                quantity: cp.quantity,
                batch: cp.batch,
            })) || [];
            setProducts(loaded);
        }
    }, [claimData, reset]);

    // 7) onSubmit => armar FormData
    const onSubmit = async (data: EditFormData) => {
        try {
          if (!claimData) return;
      
          const fd = new FormData();
      
          // Campos principales
          fd.append("claim_type", data.tipo?.toString() || "");
          fd.append("description", data.descripcion || "");
          fd.append("claim_number", data.claimNumber || "");
          fd.append("discard_doc", data.discardDoc || "");
          fd.append("observations", data.observations || "");
      
          // Archivos principales
          if (data.claimFile) fd.append("claim_file", data.claimFile);
          if (data.creditMemoFile) fd.append("credit_memo_file", data.creditMemoFile);
          if (data.observationsFile) fd.append("observations_file", data.observationsFile);
          if (data.production_batch_file) fd.append("production_batch_file", data.production_batch_file);
          // Listado de categorías
          const categories = [
            "photos_container_closed",
            "photos_container_one_open",
            "photos_container_two_open",
            "photos_container_top",
            "photos_during_unload",
            "photos_pallet_damage",
            "photos_production_batch",
            "photos_damaged_product_base",
            "photos_damaged_product_dents",
            "photos_damaged_boxes",
            "photos_grouped_bad_product",
            "photos_repalletized"
          ] as const;
      
          // Suponiendo que en tu FormData, tienes "xxx_add" (File[]) y "xxx_remove" (números IDs)
          categories.forEach((cat) => {
            const removeField = `${cat}_remove` as keyof EditFormData;
            const addField = `${cat}_add` as keyof EditFormData;
      
            const toRemove = data[removeField] || [];
            const toAdd = data[addField] || [];
      
            // 1) Mandar la metadata (JSON) a la clave "cat + _meta"
            //    Ej: "photos_container_closed_meta"
            const metaKey = `${cat}_meta`;
            fd.append(metaKey, JSON.stringify({ remove: toRemove }));
      
            // 2) Mandar los archivos a la clave "cat"
            if (Array.isArray(toAdd)) {
              toAdd.forEach((file) => {
                if (file instanceof File) {
                  fd.append(cat, file);
                }
              });
            }
          });
          const processedProducts = products.map((product) => ({
            id: product.id || null,
            product: product.product,
            quantity: product.quantity,
            batch: product.batch
          }));
        
        const originalProductIds = claimData.claim_products?.map(cp => cp.id) || [];
        
        const currentProductIds = products.map(p => p.id).filter(id => id !== null && id !== undefined);
        
        const deletedProductIds = originalProductIds.filter(id => !currentProductIds.includes(id));
        
        const processedProductsDelete = deletedProductIds.map(id => ({
          id: id,
          _delete: true
        }));
          fd.append("products", JSON.stringify([...processedProductsDelete, ...processedProducts]));
          console.log(fd);
          
          await updateClaim({ id: claimId, formData: fd }).unwrap();
          toast.success(`Reclamo #${claimData.id} actualizado con éxito`);
          onClose();
        } catch (err) {
          console.error(err);
          errorApiHandler(err, "Error al actualizar reclamo");
        }
      };
    useEffect(() => {
        if (updateError) {
            errorApiHandler(updateError, "Error al actualizar reclamo");
        }
    }, [updateError]);

    if (!open) return null;
    if (isLoading && !claimData) {
        return (
            <Dialog open={open} maxWidth="lg" fullWidth>
                <Box p={4} textAlign="center">
                    <CircularProgress />
                </Box>
            </Dialog>
        );
    }
    if (!claimData) return null;

    return (
        <BootstrapDialog open={open} maxWidth="lg" fullWidth>
            <BootstrapDialogTitle onClose={onClose} id="claim-edit-dialog-title">
                <Typography variant="h6" color="white" fontWeight={400}>
                    Editar Reclamo
                </Typography>
                 <Typography variant="body2" component="div">
                    TRK-{claimData.tracker}
                </Typography>
            </BootstrapDialogTitle>

            <Divider sx={{ mt: 1 }} />

            <DialogContent>
                <ClaimCard claim={claimData} />
                <ClaimTabs value={tabIndex} onChange={handleTabChange} />

                {/* TAB: DOCUMENTACIÓN */}
                <div role="tabpanel" hidden={tabIndex !== 0}>
                    <ClaimEditDocumentation
                        register={register}
                        control={control}
                        watch={watch}
                        setValue={setValue}
                        claimData={claimData}
                        type={claimData.tracking?.type}
                    />
                </div>

                {/* TAB: PRODUCTOS */}
                <div role="tabpanel" hidden={tabIndex !== 1}>
                    <ClaimEditProducts
                        products={products}
                        disable={claimData.status === "APROBADO" || claimData.status === "RECHAZADO"}
                        setProducts={setProducts}
                        detalles={seguimiento.detalles || []}
                    />
                </div>
            </DialogContent>

            <Divider />
           { !(claimData.status === "APROBADO" || claimData.status === "RECHAZADO") && <DialogActions>
                <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" p={0}>

                <Box>
                    <Alert severity="warning" sx={{ mb: 0 }}>
                        Para mantener los cambios, debes guardar el reclamo antes de cerrar la ventana.
                    </Alert>
                </Box>
                <Box>

                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isUpdating}
                    endIcon={isUpdating ? <CircularProgress size={20} /> : <SaveAltOutlined />}
                    >
                    {isUpdating ? "Guardando cambios..." : "Guardar Cambios"}
                </Button>
                        </Box>
                    </Box>
            </DialogActions>}
        </BootstrapDialog>
    );
};

export default ClaimEditModal;
