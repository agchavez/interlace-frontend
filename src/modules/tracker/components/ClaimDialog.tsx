import { FC, useState } from "react";
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
} from "@mui/material";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import OutboxTwoToneIcon from "@mui/icons-material/OutboxTwoTone";
import DialogTitle from "../../ui/components/BoostrapDialog";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ImageDropzone } from "../../ui/components/ImageDropzone";
import * as Yup from "yup";

// ============================
// Props del modal
// ============================
interface ReclamoModalProps {
    open: boolean;
    onClose: () => void;
}

// ============================
// Styled Dialog
// ============================
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialogContent-root": {
        padding: theme.spacing(2),
    },
    "& .MuiDialogActions-root": {
        padding: theme.spacing(1),
    },
}));

// ============================
// Opciones del Select
// ============================
const tiposReclamo = [
    { value: "DAÑOS", label: "Daños en la Mercancía" },
    { value: "FALTANTES", label: "Faltantes" },
    { value: "TIEMPOS", label: "Tiempos de Entrega" },
    { value: "OTRO", label: "Otro" },
];

// ============================
// Esquema de Yup
// ============================
const reclamoSchema = Yup.object().shape({
    tipo: Yup.string().required("El tipo de reclamo es requerido"),
    descripcion: Yup.string()
        .trim()
        .min(10, "La descripción debe tener al menos 10 caracteres")
        .required("La descripción es requerida"),
    // Validamos al menos 1 imagen (colocamos la “falla” en imagenTrailer)
    imagenTrailer: Yup.mixed().test(
        "at-least-one-image",
        "Debes subir al menos 1 imagen",
        function (_, context) {
            const { imagenTrailer, imagenDescarga, imagenContenido, imagenProducto } =
                context.parent;
            return (
                imagenTrailer || imagenDescarga || imagenContenido || imagenProducto
            );
        }
    ),
    imagenDescarga: Yup.mixed(),
    imagenContenido: Yup.mixed(),
    imagenProducto: Yup.mixed(),
});

export const ReclamoModal: FC<ReclamoModalProps> = ({ open, onClose }) => {
    // Estados del formulario
    const [tipo, setTipo] = useState<string>("OTRO");
    const [descripcion, setDescripcion] = useState<string>("");
    // Imágenes
    const [imagenTrailer, setImagenTrailer] = useState<File | null>(null);
    const [imagenDescarga, setImagenDescarga] = useState<File | null>(null);
    const [imagenContenido, setImagenContenido] = useState<File | null>(null);
    const [imagenProducto, setImagenProducto] = useState<File | null>(null);

    // Guarda un objeto con errores por campo:
    // ej: fieldErrors = { tipo: "El tipo de reclamo es requerido", descripcion: "X", ... }
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // =====================================
    // onSave
    // =====================================
    const handleSave = async () => {
        const formData = {
            tipo,
            descripcion,
            imagenTrailer,
            imagenDescarga,
            imagenContenido,
            imagenProducto,
        };

        try {
            // Validación
            await reclamoSchema.validate(formData, { abortEarly: false });
            console.log("Formulario válido:", formData);
            // Si no hay error, limpia el objeto de errores
            setFieldErrors({});
            onClose();
        } catch (err: any) {
            if (err && err.inner) {
                const newFieldErrors: Record<string, string> = {};
                // Recorremos cada error
                err.inner.forEach((validationError: any) => {
                    // Si no hay path, evitamos error
                    if (validationError.path) {
                        // Solo guardamos el primer mensaje por campo (en caso de varios)
                        // o si prefieres, concatenas
                        if (!newFieldErrors[validationError.path]) {
                            newFieldErrors[validationError.path] = validationError.message;
                        }
                    }
                });
                setFieldErrors(newFieldErrors);
            } else {
                // Error desconocido
                setFieldErrors({ form: "Ocurrió un error al validar" });
            }
        }
    };

    // =====================================
    // Render
    // =====================================
    return (
        <BootstrapDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle onClose={onClose} id="customized-dialog-title">
                Levantar Reclamo - Tracker Importado
            </DialogTitle>

            <DialogContent dividers>
                {/* Si hay un error "global" en fieldErrors.form, podrías mostrarlo aquí */}
                {fieldErrors["form"] && (
                    <Typography variant="body2" color="error">
                        {fieldErrors["form"]}
                    </Typography>
                )}

                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">
                            Complete los siguientes datos para levantar el reclamo
                        </Typography>
                    </Grid>

                    {/* Tipo de reclamo */}
                    <Grid item xs={12} sm={6}>
                        <FormControl
                            fullWidth
                            size="small"
                            error={Boolean(fieldErrors["tipo"])}
                        >
                            <InputLabel id="tipo-reclamo-label">Tipo de Reclamo</InputLabel>
                            <Select
                                labelId="tipo-reclamo-label"
                                label="Tipo de Reclamo"
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                            >
                                {tiposReclamo.map((t) => (
                                    <MenuItem key={t.value} value={t.value}>
                                        {t.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            {/* Mensaje de error */}
                            {fieldErrors["tipo"] && (
                                <Typography variant="caption" color="error">
                                    {fieldErrors["tipo"]}
                                </Typography>
                            )}
                        </FormControl>
                    </Grid>

                    {/* Descripción (ReactQuill) */}
                    <Grid item xs={12}>
                        <Typography variant="body2" sx={{ mb: 1, color: "textSecondary" }}>
                            Descripción del Reclamo
                        </Typography>

                        <ReactQuill
                            value={descripcion}
                            onChange={setDescripcion}
                            // Si quieres poner un borde rojo en caso de error
                            style={
                                fieldErrors["descripcion"]
                                    ? { border: "1px solid red" }
                                    : undefined
                            }
                        />

                        {/* Error para descripcion */}
                        {fieldErrors["descripcion"] && (
                            <Typography variant="caption" color="error">
                                {fieldErrors["descripcion"]}
                            </Typography>
                        )}
                    </Grid>

                    {/* Imagen Tráiler => principal para “at-least-one-image” */}
                    <Grid item xs={12} sm={6}>
                        <ImageDropzone
                            file={imagenTrailer}
                            onFileChange={setImagenTrailer}
                            label="Foto del Tráiler"
                            error={fieldErrors["imagenTrailer"]? "Debes subir la imagen del tráiler" : undefined}
                        />
                    </Grid>

                    {/* Resto de imágenes (no obligatorias) */}
                    <Grid item xs={12} sm={6}>
                        <ImageDropzone
                            file={imagenDescarga}
                            onFileChange={setImagenDescarga}
                            label="Foto de la Descarga"
                            error={fieldErrors["imagenDescarga"]? "Debes subir la imagen de la descarga" : undefined}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <ImageDropzone
                            file={imagenContenido}
                            onFileChange={setImagenContenido}
                            label="Foto del Contenido"
                            error={fieldErrors["imagenContenido"]? "Debes subir la imagen del contenido" : undefined}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <ImageDropzone
                            file={imagenProducto}
                            onFileChange={setImagenProducto}
                            label="Foto del Producto"
                            error={fieldErrors["imagenProducto"]? "Debes subir la imagen del producto" : undefined}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button
                    variant="text"
                    onClick={() => {
                        // Limpiar estados
                        setTipo("OTRO");
                        setDescripcion("");
                        setImagenTrailer(null);
                        setImagenDescarga(null);
                        setImagenContenido(null);
                        setImagenProducto(null);
                        setFieldErrors({});
                    }}
                    startIcon={<CleaningServicesIcon />}
                    color="primary"
                >
                    Limpiar
                </Button>
                <Button
                    variant="outlined"
                    onClick={handleSave}
                    startIcon={<OutboxTwoToneIcon />}
                    color="secondary"
                >
                    Enviar Reclamo
                </Button>
            </DialogActions>
        </BootstrapDialog>
    );
};
