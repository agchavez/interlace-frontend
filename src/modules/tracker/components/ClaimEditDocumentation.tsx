import React from "react";
import { 
    Grid, 
    Typography, 
    Box, 
    Tooltip, 
    IconButton,
    styled,
    TooltipProps,
    tooltipClasses
} from "@mui/material";
import { UseFormRegister, Control, UseFormSetValue, UseFormWatch } from "react-hook-form";

import { Claim } from "../../../store/claim/claimApi";
import { ImagePreviewDropzone } from "../../ui/components/ImagePreviewDropzone";
import { ExistingDocPreview } from "./ExistingDocPreview";
import { PhotosEditor } from "./PhotosEditor";
import PlaceholderDocPreview from "../../ui/components/PlaceholderDocPreview.tsx";

// Agregar el HtmlTooltip
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        maxWidth: 220,
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
    },
}));

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
    type?: 'LOCAL' | 'IMPORT'; // Añadir tipo para condicionar textos
}

const ClaimEditDocumentation: React.FC<Props> = ({
    watch,
    setValue,
    claimData,
    type = 'IMPORT'
}) => {
    const isLocal = type === 'LOCAL';

    // Función helper para obtener texto según tipo
    const getFieldLabel = (importText: string, localText: string) => {
        return isLocal ? localText : importText;
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Documentación
            </Typography>

            {/* Archivos principales en 3 columnas */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {/* 1) Claim File */}
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
                                Archivo "Claim File"
                                <HtmlTooltip title="Archivo principal del reclamo (Excel o PDF)">
                                    <IconButton size="small" color="primary">
                                        <Typography variant="body1">?</Typography>
                                    </IconButton>
                                </HtmlTooltip>
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
                                <HtmlTooltip title="Documento de nota de crédito (PDF)">
                                    <IconButton size="small" color="primary">
                                        <Typography variant="body1">?</Typography>
                                    </IconButton>
                                </HtmlTooltip>
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
                                <HtmlTooltip title="Documento con observaciones adicionales sobre el reclamo (PDF)">
                                    <IconButton size="small" color="primary">
                                        <Typography variant="body1">?</Typography>
                                    </IconButton>
                                </HtmlTooltip>
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
                <HtmlTooltip title="Suba hasta 5 fotos por cada categoría para documentar el reclamo">
                    <IconButton size="small" color="primary">
                        <Typography variant="body1">?</Typography>
                    </IconButton>
                </HtmlTooltip>
            </Typography>

            <Grid container spacing={2}>
                {/* Contenedor cerrado / Rastra cerrada */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            1. {getFieldLabel(
                                "Contenedor cerrado", 
                                "Rastra / Lona cerrada"
                            )}
                            <HtmlTooltip title={getFieldLabel(
                                "Fotografía del contenedor completamente cerrado",
                                "Fotografía de la rastra o lona completamente cerrada"
                            )}>
                                <IconButton size="small" color="primary">
                                    <Typography variant="body1">?</Typography>
                                </IconButton>
                            </HtmlTooltip>
                        </Typography>
                    </Box>
                    <PhotosEditor
                        categoryKey="photos_container_closed"
                        label={getFieldLabel("Contenedor cerrado", "Rastra/Lona cerrada")}
                        existingDocs={claimData.photos_container_closed}
                        watch={watch}
                        setValue={setValue}
                        
                    />
                </Grid>

                {/* Contenedor con 1 puerta abierta / Rastra con Puerta abierta */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            2. {getFieldLabel(
                                "Contenedor con 1 puerta abierta",
                                "Rastra con Puerta / Lona abierta"
                            )}
                            <HtmlTooltip title={getFieldLabel(
                                "Fotografía del contenedor con una de sus puertas abierta",
                                "Fotografía de la rastra con puerta o lona abierta"
                            )}>
                                <IconButton size="small" color="primary">
                                    <Typography variant="body1">?</Typography>
                                </IconButton>
                            </HtmlTooltip>
                        </Typography>
                    </Box>
                    <PhotosEditor
                        categoryKey="photos_container_one_open"
                        label={getFieldLabel(
                            "Contenedor con 1 puerta abierta", 
                            "Rastra con Puerta / Lona abierta"
                        )}
                        existingDocs={claimData.photos_container_one_open}
                        watch={watch}
                        setValue={setValue}
                        
                    />
                </Grid>

                {/* Contenedor con 2 puertas abiertas / Rastra completamente abierta */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            3. {getFieldLabel(
                                "Contenedor con 2 puertas abiertas",
                                "Rastra con todas las puertas / Lona completamente abierta"
                            )}
                            <HtmlTooltip title={getFieldLabel(
                                "Fotografía del contenedor con ambas puertas abiertas",
                                "Fotografía de la rastra con todas las puertas o lona completamente abierta"
                            )}>
                                <IconButton size="small" color="primary">
                                    <Typography variant="body1">?</Typography>
                                </IconButton>
                            </HtmlTooltip>
                        </Typography>
                    </Box>
                    <PhotosEditor
                        categoryKey="photos_container_two_open"
                        label={getFieldLabel(
                            "Contenedor con 2 puertas abiertas", 
                            "Rastra con todas las puertas / Lona completamente abierta"
                        )}
                        existingDocs={claimData.photos_container_two_open}
                        watch={watch}
                        setValue={setValue}
                        
                    />
                </Grid>

                {/* Vista superior del contenedor / rastra */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            4. {getFieldLabel(
                                "Vista superior del contenido del contenedor",
                                "Vista superior del contenido de la rastra / lona"
                            )}
                            <HtmlTooltip title={getFieldLabel(
                                "Fotografía tomada desde arriba del contenido del contenedor",
                                "Fotografía tomada desde arriba del contenido de la rastra o lona"
                            )}>
                                <IconButton size="small" color="primary">
                                    <Typography variant="body1">?</Typography>
                                </IconButton>
                            </HtmlTooltip>
                        </Typography>
                    </Box>
                    <PhotosEditor
                        categoryKey="photos_container_top"
                        label={getFieldLabel(
                            "Vista superior del contenedor", 
                            "Vista superior de la rastra/lona"
                        )}
                        existingDocs={claimData.photos_container_top}
                        watch={watch}
                        setValue={setValue}
                        
                    />
                </Grid>

                {/* Fotos durante la descarga - Esto no cambia mucho */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            5. Fotografía durante la descarga
                            <HtmlTooltip title={getFieldLabel(
                                "Fotografía tomada durante la descarga del contenedor",
                                "Fotografía tomada durante la descarga de la rastra o lona"
                            )}>
                                <IconButton size="small" color="primary">
                                    <Typography variant="body1">?</Typography>
                                </IconButton>
                            </HtmlTooltip>
                        </Typography>
                    </Box>
                    <PhotosEditor
                        categoryKey="photos_during_unload"
                        label="Durante la descarga"
                        existingDocs={claimData.photos_during_unload}
                        watch={watch}
                        setValue={setValue}
                        
                    />
                </Grid>

                {/* Los siguientes no necesitan cambios significativos */}
                {/* ... */}
            </Grid>
        </Box>
    );
};

export default ClaimEditDocumentation;