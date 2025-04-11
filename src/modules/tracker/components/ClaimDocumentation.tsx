import React from "react";
import {
    DialogContent,
    Grid,
    Typography,
    Tooltip,
    Divider,
    IconButton,
    styled,
    TooltipProps,
    tooltipClasses
} from "@mui/material";
import { ImagePreviewDropzone } from "../../ui/components/ImagePreviewDropzone";

export interface ClaimDocumentationProps {
    register: any; 
    control: any;
    errors: any;
    setValue: any;
    watch: any;
    type?: 'LOCAL' | 'IMPORT'; // Añadir tipo para condicionar textos
}

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

const ClaimDocumentation: React.FC<ClaimDocumentationProps> = ({ setValue, type = 'IMPORT' }) => {
    const isLocal = type === 'LOCAL';

    // Función helper para obtener texto según tipo
    const getFieldLabel = (importText: string, localText: string) => {
        return isLocal ? localText : importText;
    };

    return (
        <>
            <Divider sx={{ mt: 1 }} />
            <DialogContent sx={{ pb: 0 }}>
                <Grid container spacing={1}>
                    {/* Archivos adjuntos */}
                    <Grid item xs={12} sm={6} md={6}>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("claimFile", files[0] || null)}
                            label="Subir archivo Claim (PDF/Excel)"
                            accept={{ "application/pdf": [".pdf"], "application/vnd.ms-excel": [".xls", ".xlsx"] }}
                            maxFiles={1}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("creditMemoFile", files[0] || null)}
                            label="Subir Nota de Crédito (PDF)"
                            accept={{ "application/pdf": [".pdf"] }}
                            maxFiles={1}
                        />
                    </Grid>
                    {/* production_batch_file */}
                    <Grid item xs={12} sm={6} md={6}>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("productionBatchFile", files[0] || null)}
                            label="Subir archivo de Lotes de Producción (PDF)"
                            accept={{ "application/pdf": [".pdf"] }}
                            maxFiles={1}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
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
                    <Grid item xs={12} sm={6} md={6}>
                        <Typography variant="body2">
                            1. {getFieldLabel(
                                "Contenedor cerrado", 
                                "Rastra / Lona cerrada"
                            )}{" "}
                            <HtmlTooltip title={getFieldLabel(
                                "Fotografía del contenedor completamente cerrado",
                                "Fotografía de la rastra o lona completamente cerrada"
                            )}>
                                <IconButton size="small" color="primary">
                                    <Typography variant="body1">?</Typography>
                                </IconButton>
                            </HtmlTooltip>
                        </Typography>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("photos_container_closed", files)}
                            label="Subir fotos"
                            accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                            maxFiles={5}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                        <Typography variant="body2">
                            2. {getFieldLabel(
                                "Contenedor con 1 puerta abierta",
                                "Rastra con Puerta / Lona abierta"
                            )}{" "}
                            <HtmlTooltip title={getFieldLabel(
                                "Fotografía del contenedor con una de sus puertas abierta",
                                "Fotografía de la rastra con puerta o lona abierta"
                            )}>
                                <IconButton size="small" color="primary">
                                    <Typography variant="body1">?</Typography>
                                </IconButton>
                            </HtmlTooltip>
                        </Typography>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("photos_container_one_open", files)}
                            label="Subir fotos"
                            accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                            maxFiles={5}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                        <Typography variant="body2">
                            3. {getFieldLabel(
                                "Contenedor con 2 puertas abiertas",
                                "Rastra con todas las puertas / Lona completamente abierta"
                            )}{" "}
                            <HtmlTooltip title={getFieldLabel(
                                "Fotografía del contenedor con ambas puertas abiertas",
                                "Fotografía de la rastra con todas las puertas o lona completamente abierta"
                            )}>
                                <IconButton size="small" color="primary">
                                    <Typography variant="body1">?</Typography>
                                </IconButton>
                            </HtmlTooltip>
                        </Typography>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("photos_container_two_open", files)}
                            label="Subir fotos"
                            accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                            maxFiles={5}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                        <Typography variant="body2">
                            4. {getFieldLabel(
                                "Vista superior del contenido del contenedor",
                                "Vista superior del contenido de la rastra / lona"
                            )}{" "}
                            <HtmlTooltip title={getFieldLabel(
                                "Fotografía tomada desde arriba del contenido del contenedor",
                                "Fotografía tomada desde arriba del contenido de la rastra o lona"
                            )}>
                                <IconButton size="small" color="primary">
                                    <Typography variant="body1">?</Typography>
                                </IconButton>
                            </HtmlTooltip>
                        </Typography>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("photos_container_top", files)}
                            label="Subir fotos"
                            accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                            maxFiles={5}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                        <Typography variant="body2">
                            5. {getFieldLabel(
                                "Fotografía durante la descarga",
                                "Fotografía durante la descarga"
                            )}{" "}
                            <HtmlTooltip title={getFieldLabel(
                                "Fotografía tomada durante la descarga del contenedor",
                                "Fotografía tomada durante la descarga de la rastra o lona"
                            )}>
                                <IconButton size="small" color="primary">
                                    <Typography variant="body1">?</Typography>
                                </IconButton>
                            </HtmlTooltip>
                        </Typography>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("photos_during_unload", files)}
                            label="Subir fotos"
                            accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                            maxFiles={5}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                        <Typography variant="body2">
                            6. {getFieldLabel(
                                "Fisuras/abolladuras de pallets",
                                "Fisuras/abolladuras de pallets"
                            )}{" "}
                            <HtmlTooltip title="Fotografías que muestren fisuras o abolladuras en los pallets">
                                <IconButton size="small" color="primary">
                                    <Typography variant="body1">?</Typography>
                                </IconButton>
                            </HtmlTooltip>
                        </Typography>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("photos_pallet_damage", files)}
                            label="Subir fotos"
                            accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                            maxFiles={5}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                        <Typography variant="body2">
                            7. Lote de Producción
                            <HtmlTooltip title="Lote de Producción">
                                <IconButton size="small" color="primary">
                                    <Typography variant="body1">?</Typography>
                                </IconButton>
                            </HtmlTooltip>
                        </Typography>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("photos_production_batch", files)}
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
                            <Grid item xs={12} sm={6} md={6}>
                                <Typography variant="body2">
                                    a) Base de la lata/botella (fecha de vencimiento y lote){" "}
                                    <HtmlTooltip title="Fotografía de la base donde se vea la fecha de vencimiento y lote">
                                        <IconButton size="small" color="primary">
                                            <Typography variant="body1">?</Typography>
                                        </IconButton>
                                    </HtmlTooltip>
                                </Typography>
                                <ImagePreviewDropzone
                                    files={[]}
                                    onFilesChange={(files: File[]) => setValue("photos_damaged_product_base", files)}
                                    label="Subir fotos"
                                    accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                                    maxFiles={5}
                                />
                            </Grid>
                            
                            {/* Abolladuras */}
                            <Grid item xs={12} sm={6} md={6}>
                                <Typography variant="body2">
                                    b) Abolladuras (mínimo 3 diferentes){" "}
                                    <HtmlTooltip title="Fotografías de abolladuras, se requieren al menos 3 imágenes">
                                        <IconButton size="small" color="primary">
                                            <Typography variant="body1">?</Typography>
                                        </IconButton>
                                    </HtmlTooltip>
                                </Typography>
                                <ImagePreviewDropzone
                                    files={[]}
                                    onFilesChange={(files: File[]) => setValue("photos_damaged_product_dents", files)}
                                    label="Subir fotos"
                                    accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                                    maxFiles={5}
                                />
                            </Grid>
                            
                            {/* Cajas dañadas */}
                            <Grid item xs={12} sm={6} md={6}>
                                <Typography variant="body2">
                                    c) Cajas dañadas por golpes o problemas de calidad{" "}
                                    <HtmlTooltip title="Fotografía de cajas dañadas por golpes o problemas de calidad">
                                        <IconButton size="small" color="primary">
                                            <Typography variant="body1">?</Typography>
                                        </IconButton>
                                    </HtmlTooltip>
                                </Typography>
                                <ImagePreviewDropzone
                                    files={[]}
                                    onFilesChange={(files: File[]) => setValue("photos_damaged_boxes", files)}
                                    label="Subir fotos"
                                    accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                                    maxFiles={5}
                                />
                            </Grid>
                            
                            {/* Producto en mal estado agrupado */}
                            <Grid item xs={12} sm={6} md={6}>
                                <Typography variant="body2">
                                    d) Producto en mal estado agrupado en 1 pallet{" "}
                                    <HtmlTooltip title="Fotografía del producto en mal estado agrupado en un pallet aparte">
                                        <IconButton size="small" color="primary">
                                            <Typography variant="body1">?</Typography>
                                        </IconButton>
                                    </HtmlTooltip>
                                </Typography>
                                <ImagePreviewDropzone
                                    files={[]}
                                    onFilesChange={(files: File[]) => setValue("photos_grouped_bad_product", files)}
                                    label="Subir fotos"
                                    accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                                    maxFiles={5}
                                />
                            </Grid>
                            
                            {/* Repaletizado */}
                            <Grid item xs={12} sm={6} md={6}>
                                <Typography variant="body2">
                                    e) Repaletizado por identificación de producto dañado{" "}
                                    <HtmlTooltip title="Fotografías del repaletizado para identificar producto dañado">
                                        <IconButton size="small" color="primary">
                                            <Typography variant="body1">?</Typography>
                                        </IconButton>
                                    </HtmlTooltip>
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