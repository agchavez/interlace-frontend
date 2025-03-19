import {FC, useEffect} from "react";
import {
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    styled,
    Dialog,
    TextField,
    Tooltip,
    Box,
    Divider,
    IconButton
} from "@mui/material";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import OutboxTwoToneIcon from "@mui/icons-material/OutboxTwoTone";
import DialogTitle from "../../ui/components/BoostrapDialog";
import "react-quill/dist/quill.snow.css";
import * as Yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { ImagePreviewDropzone } from "../../ui/components/ImagePreviewDropzone";
import {errorApiHandler} from "../../../utils/error.ts";
import {useCreateClaimMutation} from "../../../store/claim/claimApi.ts";
import {toast} from "sonner";
import {useAppSelector} from "../../../store";

// Props del modal
interface ClaimModalProps {
    open: boolean;
    onClose: () => void;
}

// Styled Dialog
export const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialogContent-root": {
        padding: theme.spacing(2),
    },
    "& .MuiDialogActions-root": {
        padding: theme.spacing(1),
    },
}));

// Opciones del Select de tipo de reclamo
const claimTypes = [
    { value: "FALTANTE", label: "Faltante" },
    { value: "SOBRANTE", label: "Sobrante" },
    { value: "DAÑOS_CALIDAD_TRANSPORTE", label: "Daños por Calidad y Transporte" },
];

// Esquema de validación Yup
const claimSchema = Yup.object().shape({
    tipo: Yup.string().required("El tipo de reclamo es requerido"),
    photos_container_closed: Yup.array().min(1, "Debes subir al menos 1 fotografía de contenedor cerrado"),

});

// Interfaz del formulario
interface FormData {
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

export const ClaimModal: FC<ClaimModalProps> = ({ open, onClose }) => {
    const [createClaim, { isLoading, isSuccess, error }] = useCreateClaimMutation();

    const {  seguimeintoActual, seguimientos } = useAppSelector(
        (state) => state.seguimiento
    );
    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>({
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
            photos_repalletized: [],
        },
    });

    const claimType = watch("tipo");
    const onSubmit = async (data: FormData) => {
        console.log("Data del formulario:", data);
        try {
            await claimSchema.validate(data, { abortEarly: false });
            const formData = new FormData();
            formData.append("claim_type", data.tipo);
            formData.append("descripcion", data.descripcion);
            formData.append("claim_number", data.claimNumber);
            formData.append("discard_doc", data.discardDoc);
            formData.append("description", data.observations);
            if (seguimeintoActual !== undefined && seguimientos[seguimeintoActual] !== undefined) {

                formData.append("tracker_id", seguimientos[seguimeintoActual].id.toString());
            }
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

            console.log("Data del formulario:", formData);
            // Call the createClaim mutation
            const respuestaClaim =await createClaim(formData).unwrap();
            console.log("Respuesta del reclamo:", respuestaClaim);
            toast.success("Registro de reclamo", {
                description: "Reclamo registrado exitosamente",
            });

        } catch (err: any) {
            if (err && err.inner) {
                const newErrors: Record<string, string> = {};
                err.inner.forEach((validationError: any) => {
                    if (validationError.path && !newErrors[validationError.path]) {
                        newErrors[validationError.path] = validationError.message;
                    }
                });
                console.log("Errores de validación:", newErrors);
            } else {
                console.error("Error al validar:", err);
            }
        }
    };

    useEffect(() => {
        if(isSuccess && !isLoading) {
            onClose();
        }else if(error){
            errorApiHandler(error, "Error al registrar el reclamo");
        }
    }, [isSuccess, isLoading, error, onClose]);

    return (
        <BootstrapDialog open={open} maxWidth="lg" fullWidth>
            <DialogTitle onClose={onClose} id="customized-dialog-title">
                <Typography variant="h6" color="white" fontWeight={400}>
                    Levantar Reclamo - Tracker Importado
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" color="white">
                        Complete el formulario para registrar el reclamo
                    </Typography>
                </Box>
            </DialogTitle>
            <Divider sx={{ mt: 1 }} />
            <DialogContent  sx={{ pb: 0 }}>
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
                                    <Select
                                        labelId="tipo-reclamo-label"
                                        label="Tipo de Reclamo"
                                        {...field}
                                    >
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
                        <TextField
                            label="Número de Claim"
                            fullWidth
                            size="small"
                            {...register("claimNumber")}
                        />
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
                    <Grid item xs={12} sm={6} md={4}>
                        <ImagePreviewDropzone
                            files={[]}
                            onFilesChange={(files: File[]) => setValue("claimFile", files[0] || null)}
                            label="Subir archivo Claim (PDF/Excel)"
                            // accept="application/pdf, application/vnd.ms-excel"
                            accept={{ "application/pdf": [".pdf"], "application/vnd.ms-excel": [".xls", ".xlsx"] }}
                            maxFiles={1}
                        />
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                label="Documento de Descarte"
                                fullWidth
                                size="small"
                                {...register("discardDoc")}
                            />
                        </Grid>
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
                            accept={{ "application/pdf": [".pdf"] }}                            maxFiles={1}
                        />
                    </Grid>
                    <Divider sx={{ my: 2 }} />
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
                    {claimType === "DAÑOS_CALIDAD_TRANSPORTE" && (
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
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="text"
                    onClick={() => {
                        reset();
                    }}
                    startIcon={<CleaningServicesIcon />}
                    color="primary"
                >
                    Limpiar
                </Button>
                <Button
                    variant="outlined"
                    onClick={handleSubmit(onSubmit)}
                    startIcon={<OutboxTwoToneIcon />}
                    color="secondary"
                >
                    Enviar Reclamo
                </Button>
            </DialogActions>
        </BootstrapDialog>
    );
};