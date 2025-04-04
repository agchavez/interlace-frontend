// ClaimEditDocumentation.tsx
import React from "react";
import { Grid, Typography, Box } from "@mui/material";
import { UseFormRegister, Control, UseFormSetValue, UseFormWatch } from "react-hook-form";

import { Claim } from "../../../store/claim/claimApi";
import { ImagePreviewDropzone } from "../../ui/components/ImagePreviewDropzone";
import { ExistingDocPreview } from "./ExistingDocPreview";
import { PhotosEditor } from "./PhotosEditor";
import PlaceholderDocPreview from "../../ui/components/PlaceholderDocPreview.tsx";

export interface EditFormData {
    tipo: number;
    descripcion: string;
    claimNumber: string;
    discardDoc: string;
    observations: string;

    claimFile: File | null;
    creditMemoFile: File | null;
    observationsFile: File | null;

    photos_container_closed_add: File[];
    photos_container_closed_remove: number[];
    photos_container_one_open_add: File[];
    photos_container_one_open_remove: number[];
    photos_container_two_open_add: File[];
    photos_container_two_open_remove: number[];
    photos_container_top_add: File[];
    photos_container_top_remove: number[];
    photos_during_unload_add: File[];
    photos_during_unload_remove: number[];
    photos_pallet_damage_add: File[];
    photos_pallet_damage_remove: number[];
    photos_damaged_product_base_add: File[];
    photos_damaged_product_base_remove: number[];
    photos_damaged_product_dents_add: File[];
    photos_damaged_product_dents_remove: number[];
    photos_damaged_boxes_add: File[];
    photos_damaged_boxes_remove: number[];
    photos_grouped_bad_product_add: File[];
    photos_grouped_bad_product_remove: number[];
    photos_repalletized_add: File[];
    photos_repalletized_remove: number[];
}

interface Props {
    register: UseFormRegister<EditFormData>;
    control: Control<EditFormData>;
    watch: UseFormWatch<EditFormData>;
    setValue: UseFormSetValue<EditFormData>;
    claimData: Claim;
}

const ClaimEditDocumentation: React.FC<Props> = ({
                                                     watch,
                                                     setValue,
                                                     claimData
                                                 }) => {
    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Documentación
            </Typography>

            {/* Archivos principales en 3 columnas */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {/* 1) Claim File */}
                <Grid item xs={12} md={4}>
                    {/*
            Contenedor con minHeight y flex col
            para alinear placeholder / doc + dropzone
          */}
                    <Box
                        sx={{
                            minHeight: 220,
                            border: "1px solid #ddd",
                            borderRadius: 1,
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                        }}
                    >
                        <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                Archivo "Claim File"
                            </Typography>

                            {claimData.claim_file ? (
                                <ExistingDocPreview
                                    name={claimData.claim_file.name}
                                    url={claimData.claim_file.access_url}
                                    extension={claimData.claim_file.extension}
                                    onRemove={() => setValue("claimFile", null)}
                                    boxWidth={140}
                                    boxHeight={150}
                                />
                            ) : (
                                <PlaceholderDocPreview
                                    boxWidth={140}
                                    boxHeight={150}
                                    text="Sin Claim File"
                                />
                            )}
                        </Box>

                        {/* Dropzone abajo */}
                        <Box sx={{ mt: 1 }}>
                            <ImagePreviewDropzone
                                files={watch("claimFile") ? [watch("claimFile")!] : []}
                                onFilesChange={(files) => setValue("claimFile", files[0] || null)}
                                label="Subir Claim (PDF/Excel)"
                                accept={{
                                    "application/pdf": [".pdf"],
                                    "application/vnd.ms-excel": [".xls", ".xlsx"]
                                }}
                                maxFiles={1}
                                sxDrop={{ height: 80 }}
                            />
                        </Box>
                    </Box>
                </Grid>

                {/* 2) Credit Memo */}
                <Grid item xs={12} md={4}>
                    <Box
                        sx={{
                            minHeight: 220,
                            border: "1px solid #ddd",
                            borderRadius: 1,
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                        }}
                    >
                        <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                Nota de Crédito
                            </Typography>
                            {claimData.credit_memo_file ? (
                                <ExistingDocPreview
                                    name={claimData.credit_memo_file.name}
                                    url={claimData.credit_memo_file.access_url}
                                    extension={claimData.credit_memo_file.extension}
                                    onRemove={() => setValue("creditMemoFile", null)}
                                    boxWidth={140}
                                    boxHeight={150}
                                />
                            ) : (
                                <PlaceholderDocPreview
                                    boxWidth={140}
                                    boxHeight={150}
                                    text="Sin Nota de Crédito"
                                />
                            )}
                        </Box>

                        <Box sx={{ mt: 1 }}>
                            <ImagePreviewDropzone
                                files={watch("creditMemoFile") ? [watch("creditMemoFile")!] : []}
                                onFilesChange={(files) => setValue("creditMemoFile", files[0] || null)}
                                label="Subir Nota de Crédito (PDF)"
                                accept={{
                                    "application/pdf": [".pdf"]
                                }}
                                maxFiles={1}
                                sxDrop={{ height: 80 }}
                            />
                        </Box>
                    </Box>
                </Grid>

                {/* 3) Observations File */}
                <Grid item xs={12} md={4}>
                    <Box
                        sx={{
                            minHeight: 220,
                            border: "1px solid #ddd",
                            borderRadius: 1,
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                        }}
                    >
                        <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                Archivo Observaciones
                            </Typography>
                            {claimData.observations_file ? (
                                <ExistingDocPreview
                                    name={claimData.observations_file.name}
                                    url={claimData.observations_file.access_url}
                                    extension={claimData.observations_file.extension}
                                    onRemove={() => setValue("observationsFile", null)}
                                    boxWidth={140}
                                    boxHeight={150}
                                />
                            ) : (
                                <PlaceholderDocPreview
                                    boxWidth={140}
                                    boxHeight={150}
                                    text="Sin Observaciones"
                                />
                            )}
                        </Box>

                        <Box sx={{ mt: 1 }}>
                            <ImagePreviewDropzone
                                files={
                                    watch("observationsFile")
                                        ? [watch("observationsFile")!]
                                        : []
                                }
                                onFilesChange={(files) =>
                                    setValue("observationsFile", files[0] || null)
                                }
                                label="Subir Observaciones (PDF)"
                                accept={{
                                    "application/pdf": [".pdf"]
                                }}
                                maxFiles={1}
                                sxDrop={{ height: 80 }}
                            />
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* Sección de Fotos */}
            <Typography variant="h6" sx={{ mb: 2 }}>
                Fotografías
            </Typography>

            <Grid container spacing={2}>
                {/* Contenedor con 2 puertas abiertas */}
                <PhotosEditor
                    categoryKey="photos_container_two_open"
                    label="3. Contenedor con 2 puertas abiertas"
                    existingDocs={claimData.photos_container_two_open}
                    watch={watch}
                    setValue={setValue}
                    gridProps={{ xs: 12, md: 6 }}
                />

                {/* Vista superior del contenedor */}
                <PhotosEditor
                    categoryKey="photos_container_top"
                    label="4. Vista superior del contenido del contenedor"
                    existingDocs={claimData.photos_container_top}
                    watch={watch}
                    setValue={setValue}
                    gridProps={{ xs: 12, md: 6 }}
                />

                {/* Fotos durante la descarga */}
                <PhotosEditor
                    categoryKey="photos_during_unload"
                    label="5. Fotografía durante la descarga"
                    existingDocs={claimData.photos_during_unload}
                    watch={watch}
                    setValue={setValue}
                    gridProps={{ xs: 12, md: 6 }}
                />

                {/* Daños en pallets */}
                <PhotosEditor
                    categoryKey="photos_pallet_damage"
                    label="6. Fisuras/abolladuras de pallets"
                    existingDocs={claimData.photos_pallet_damage}
                    watch={watch}
                    setValue={setValue}
                    gridProps={{ xs: 12, md: 6 }}
                />

                {/* Producto dañado en la base */}
                <PhotosEditor
                    categoryKey="photos_damaged_product_base"
                    label="7. Base de la lata/botella (fecha de vencimiento y lote)"
                    existingDocs={claimData.photos_damaged_product_base}
                    watch={watch}
                    setValue={setValue}
                    gridProps={{ xs: 12, md: 6 }}
                />

                {/* Producto con abolladuras */}
                <PhotosEditor
                    categoryKey="photos_damaged_product_dents"
                    label="8. Abolladuras (mínimo 3 diferentes)"
                    existingDocs={claimData.photos_damaged_product_dents}
                    watch={watch}
                    setValue={setValue}
                    gridProps={{ xs: 12, md: 6 }}
                />

                {/* Cajas dañadas */}
                <PhotosEditor
                    categoryKey="photos_damaged_boxes"
                    label="9. Cajas dañadas por golpes o problemas de calidad"
                    existingDocs={claimData.photos_damaged_boxes}
                    watch={watch}
                    setValue={setValue}
                    gridProps={{ xs: 12, md: 6 }}
                />

                {/* Producto en mal estado agrupado */}
                <PhotosEditor
                    categoryKey="photos_grouped_bad_product"
                    label="10. Producto en mal estado agrupado en 1 pallet"
                    existingDocs={claimData.photos_grouped_bad_product}
                    watch={watch}
                    setValue={setValue}
                    gridProps={{ xs: 12, md: 6 }}
                />

            </Grid>
        </Box>
    );
};

export default ClaimEditDocumentation;
