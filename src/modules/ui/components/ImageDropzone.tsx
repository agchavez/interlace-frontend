    // ImageDropzone.tsx
    import React, { useCallback } from "react";
    import { useDropzone } from "react-dropzone";
    import { Box, Typography } from "@mui/material";
    import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

    interface ImageDropzoneProps {
        file: File | null;
        onFileChange: (file: File | null) => void;
        label?: string;
        error?: string;
    }

    export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
                                                                    file,
                                                                    onFileChange,
                                                                    error,
                                                                    label = "Subir imagen",
                                                                }) => {
        // Generar url de preview, si hay archivo
        const previewUrl = file ? URL.createObjectURL(file) : "";

        // Manejo del drag & drop
        const onDrop = useCallback(
            (acceptedFiles: File[]) => {
                if (acceptedFiles && acceptedFiles.length > 0) {
                    onFileChange(acceptedFiles[0]);
                }
            },
            [onFileChange]
        );

        // Configurar useDropzone
        const { getRootProps, getInputProps, isDragActive, isDragReject } =
            useDropzone({
                onDrop,
                multiple: false,
                accept: {
                    "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
                },
            });

        const handleRemove = () => {
            onFileChange(null);
        };

        return (
            <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                    {label}
                </Typography>

                {/* Contenedor arrastrable */}
                <Box
                    {...getRootProps()}
                    sx={{
                        border: error ? "2px dashed red" : "2px dashed",
                        borderRadius: 2,
                        p: 2,
                        textAlign: "center",
                        cursor: "pointer",
                        color: "#888",
                        // Cambia color si está activo el drag
                        backgroundColor: isDragActive ? "#f0f0f0" : "transparent",
                        // Ajusta la transición o hover
                        transition: "background-color 0.2s ease-in-out",
                        "&:hover": {
                            backgroundColor: "#fafafa",
                        },
                        minHeight: 120,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                        gap: 1,
                    }}
                >
                    <input {...getInputProps()} />
                    {!file && (
                        <>
                            <UploadFileOutlinedIcon fontSize="large" />
                            {isDragReject ? (
                                <Typography variant="body2" color="error">
                                    Archivo no soportado
                                </Typography>
                            ) : isDragActive ? (
                                <Typography variant="body2" color="textSecondary">
                                    Suelta la imagen aquí...
                                </Typography>
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    Haz clic o arrastra un archivo
                                </Typography>
                            )}
                        </>
                    )}
                    {file && previewUrl && (
                        // Vista previa
                        <Box
                            sx={{
                                position: "relative",
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                            }}
                        >
                            <img
                                src={previewUrl}
                                alt="preview"
                                style={{
                                    maxHeight: 200,
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    width: "100%",
                                }}
                            />
                        </Box>
                    )}
                </Box>

                {/* Botón para quitar imagen si existe */}
                {file && (
                    <Box mt={1} textAlign="right">
                        <Typography
                            variant="body2"
                            sx={{ color: "primary.main", cursor: "pointer" }}
                            onClick={handleRemove}
                        >
                            Cambiar / Remover
                        </Typography>
                    </Box>
                )}
                <Typography variant="caption" color="error">
                    {error}
                </Typography>
            </Box>
        );
    };
