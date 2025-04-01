// ClaimDocumentation.tsx
import React from "react";
import {
    DialogContent,
    Grid,
    Typography,
    Tooltip,
    Divider,
    IconButton
} from "@mui/material";
import { ImagePreviewDropzone } from "../../ui/components/ImagePreviewDropzone";



export interface ClaimDocumentationProps {
    register: any; // Puedes tipificar con UseFormRegister<FormData> si lo deseas
    control: any;
    errors: any;
    setValue: any;
    watch: any;
}

const ClaimDocumentation: React.FC<ClaimDocumentationProps> = ({ setValue }) => {

    return (
        <>
            <Divider sx={{ mt: 1 }} />
            <DialogContent sx={{ pb: 0 }}>
                <Grid container spacing={1}>
                    {/* Datos Generales */}

                    {/* Archivos adjuntos */}
                    <Grid item xs={12} sm={6} md={4}>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("claimFile", files[0] || null)}
                            label="Subir archivo Claim (PDF/Excel)"
                            accept={{ "application/pdf": [".pdf"], "application/vnd.ms-excel": [".xls", ".xlsx"] }}
                            maxFiles={1}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("creditMemoFile", files[0] || null)}
                            label="Subir Nota de Crédito (PDF)"
                            accept={{ "application/pdf": [".pdf"] }}
                            maxFiles={1}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("observationsFile", files[0] || null)}
                            label="Subir archivo de Observaciones (PDF)"
                            accept={{ "application/pdf": [".pdf"] }}
                            maxFiles={1}
                        />
                    </Grid>

                    <Divider sx={{ my: 2 }} />
                    {/* Fotografías */}
                    <Grid item xs={12}>
                        <Divider>
                            <Typography variant="body2" color="textSecondary">
                                Fotografías (máximo 5 por categoría)
                            </Typography>
                        </Divider>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2">
                            1. Contenedor cerrado{" "}
                            <Tooltip title="Fotografía del contenedor completamente cerrado">
                                <IconButton size="small">
                                    <Typography variant="caption">?</Typography>
                                </IconButton>
                            </Tooltip>
                        </Typography>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("photos_container_closed", files)}
                            label="Subir fotos"
                            accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                            maxFiles={5}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2">
                            2. Contenedor con 1 puerta abierta{" "}
                            <Tooltip title="Fotografía del contenedor con una de sus puertas abierta">
                                <IconButton size="small">
                                    <Typography variant="caption">?</Typography>
                                </IconButton>
                            </Tooltip>
                        </Typography>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("photos_container_one_open", files)}
                            label="Subir fotos"
                            accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                            maxFiles={5}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2">
                            3. Contenedor con 2 puertas abiertas{" "}
                            <Tooltip title="Fotografía del contenedor con ambas puertas abiertas">
                                <IconButton size="small">
                                    <Typography variant="caption">?</Typography>
                                </IconButton>
                            </Tooltip>
                        </Typography>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("photos_container_two_open", files)}
                            label="Subir fotos"
                            accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                            maxFiles={5}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2">
                            4. Vista superior del contenido del contenedor{" "}
                            <Tooltip title="Fotografía tomada desde arriba del contenido del contenedor">
                                <IconButton size="small">
                                    <Typography variant="caption">?</Typography>
                                </IconButton>
                            </Tooltip>
                        </Typography>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("photos_container_top", files)}
                            label="Subir fotos"
                            accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                            maxFiles={5}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2">
                            5. Fotografía durante la descarga{" "}
                            <Tooltip title="Fotografía tomada durante la descarga del contenedor">
                                <IconButton size="small">
                                    <Typography variant="caption">?</Typography>
                                </IconButton>
                            </Tooltip>
                        </Typography>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("photos_during_unload", files)}
                            label="Subir fotos"
                            accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                            maxFiles={5}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2">
                            6. Fisuras/abolladuras de pallets{" "}
                            <Tooltip title="Fotografías que muestren fisuras o abolladuras en los pallets">
                                <IconButton size="small">
                                    <Typography variant="caption">?</Typography>
                                </IconButton>
                            </Tooltip>
                        </Typography>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("photos_pallet_damage", files)}
                            label="Subir fotos"
                            accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                            maxFiles={5}
                        />
                    </Grid>

                        <>
                            <Grid item xs={12}>
                                <Divider>
                                    <Typography variant="body2" color="textSecondary">
                                        Producto dañado
                                    </Typography>
                                </Divider>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="body2">
                                    a) Base de la lata/botella (fecha de vencimiento y lote){" "}
                                    <Tooltip title="Fotografía de la base donde se vea la fecha de vencimiento y lote">
                                        <IconButton size="small">
                                            <Typography variant="caption">?</Typography>
                                        </IconButton>
                                    </Tooltip>
                                </Typography>
                                <ImagePreviewDropzone
                                    files={[]}
                                    onFilesChange={(files: File[]) => setValue("photos_damaged_product_base", files)}
                                    label="Subir fotos"
                                    accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                                    maxFiles={5}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="body2">
                                    b) Abolladuras (mínimo 3 diferentes){" "}
                                    <Tooltip title="Fotografías de abolladuras, se requieren al menos 3 imágenes">
                                        <IconButton size="small">
                                            <Typography variant="caption">?</Typography>
                                        </IconButton>
                                    </Tooltip>
                                </Typography>
                                <ImagePreviewDropzone
                                    files={[]}
                                    onFilesChange={(files: File[]) => setValue("photos_damaged_product_dents", files)}
                                    label="Subir fotos"
                                    accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                                    maxFiles={5}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="body2">
                                    c) Cajas dañadas por golpes o problemas de calidad{" "}
                                    <Tooltip title="Fotografía de cajas dañadas por golpes o problemas de calidad">
                                        <IconButton size="small">
                                            <Typography variant="caption">?</Typography>
                                        </IconButton>
                                    </Tooltip>
                                </Typography>
                                <ImagePreviewDropzone
                                    files={[]}
                                    onFilesChange={(files: File[]) => setValue("photos_damaged_boxes", files)}
                                    label="Subir fotos"
                                    accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                                    maxFiles={5}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="body2">
                                    d) Producto en mal estado agrupado en 1 pallet{" "}
                                    <Tooltip title="Fotografía del producto en mal estado agrupado en un pallet aparte">
                                        <IconButton size="small">
                                            <Typography variant="caption">?</Typography>
                                        </IconButton>
                                    </Tooltip>
                                </Typography>
                                <ImagePreviewDropzone
                                    files={[]}
                                    onFilesChange={(files: File[]) => setValue("photos_grouped_bad_product", files)}
                                    label="Subir fotos"
                                    accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                                    maxFiles={5}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="body2">
                                    e) Repaletizado por identificación de producto dañado{" "}
                                    <Tooltip title="Fotografías del repaletizado para identificar producto dañado">
                                        <IconButton size="small">
                                            <Typography variant="caption">?</Typography>
                                        </IconButton>
                                    </Tooltip>
                                </Typography>
                                <ImagePreviewDropzone
                                    files={[]}
                                    onFilesChange={(files: File[]) => setValue("photos_repalletized", files)}
                                    label="Subir fotos"
                                    accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                                    maxFiles={5}
                                />
                            </Grid>
                        </>
                </Grid>
            </DialogContent>
        </>
    );
};

export default ClaimDocumentation;
