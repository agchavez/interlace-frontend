import React, { useState } from "react";
import { Box, IconButton, SxProps, Theme, Typography } from "@mui/material";
import { FileRejection, useDropzone } from "react-dropzone";
import DeleteIcon from "@mui/icons-material/Delete";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { PDFPreviewModal } from "./PDFPreviewModal";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PictureAsPdfTwoToneIcon from '@mui/icons-material/PictureAsPdfTwoTone';
import { toast } from "sonner";
interface ImagePreviewDropzoneProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    label: string;
    accept: { [key: string]: readonly string[] };
    maxFiles?: number;
    sxDrop?: SxProps<Theme>;
}

export const ImagePreviewDropzone: React.FC<ImagePreviewDropzoneProps> = ({ files, onFilesChange, label, accept, maxFiles = 1, sxDrop }) => {
    const [previews, setPreviews] = useState<string[]>(files.map(file => URL.createObjectURL(file)));
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [type, settype] = useState<'image' | 'pdf' | 'excel' | null>(accept["application/pdf"] ? 'pdf' : accept["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] ? 'excel' : 'image');
    
    const onDrop = (acceptedFiles: File[]) => {
        console.log(acceptedFiles);
        if (files.length + acceptedFiles.length > maxFiles) {
            toast.error(`No puedes subir más de ${maxFiles} archivos.`);
            return;
        }
        
        if (acceptedFiles.length > 0) {
            const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
            onFilesChange(newFiles);
        }
        setPreviews([...previews, ...acceptedFiles.map(file => URL.createObjectURL(file))]);
    };

    const handleRemove = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        onFilesChange(newFiles);
        setPreviews(newFiles.map(file => URL.createObjectURL(file)));
    };

    

    const handleRejectedFiles = (rejectedFiles: FileRejection[]) => {
        if (rejectedFiles.length === 0) return;
        
        // Buscar si almenos en uno de los archivos hay el error code too-many-files
        const tooManyFilesError = rejectedFiles.some(rejection => rejection.errors.some(error => error.code === 'too-many-files'));
        if (tooManyFilesError) {
            toast.error(`No puedes subir más de ${maxFiles} archivos.`);
            return;
        } 
        // Iterar sobre cada archivo rechazado
        rejectedFiles.forEach(rejection => {
            const { file, errors } = rejection;
            
            // Verificar primero errores comunes
            const sizeError = errors.find(e => e.code === 'file-too-large');
            const typeError = errors.find(e => e.code === 'file-invalid-type');
            
            if (sizeError) {
                toast.error(`El archivo "${file.name}" es demasiado grande. El tamaño máximo permitido es 10MB.`);
                return;
            }
            
            if (typeError) {
                const acceptedTypes = Object.keys(accept).map(type => {
                    if (type === "image/*") return "imágenes";
                    if (type === "application/pdf") return "PDF";
                    if (type.includes("excel") || type.includes("spreadsheetml")) return "Excel";
                    return type;
                }).join(", ");
                
                toast.error(`El archivo "${file.name}" no es un tipo válido. Solo se permiten: ${acceptedTypes}`);
                return;
            }
            
            // Si no es un error específico, mostrar el primer mensaje de error
            if (errors.length > 0) {
                toast.error(`Error al subir "${file.name}": ${errors[0].message}`);
            }

        });
    };

    const { getRootProps, getInputProps } = useDropzone({ 
        onDrop, 
        accept, 
        maxFiles,
        onDropRejected: handleRejectedFiles,
        maxSize: 10485760 // 10MB
    });
    


    return (
        <Box>
            <Typography variant="body2">{label}</Typography>
            <Box {...getRootProps()} sx={{ border: "1px dashed grey", padding: 2, textAlign: "center", cursor: "pointer" }}>
                <input {...getInputProps()} />
                <CloudUploadIcon sx={{ fontSize: 40 }} />
                <Typography variant="body2">
                    Arrastra y suelta los archivos aquí, o haz clic para seleccionar archivos
                </Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", mt: 0 }}>
                {previews.map((preview, index) => (
                    <Box key={index} sx={{ position: "relative", width: 120, height: 120, mr: 1, mb: 1, ...(sxDrop || {}), }}>
                        {type === 'pdf' ? (
                            <Box
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    border: "1px dashed grey",
                                    borderRadius: 1,
                                    marginTop: 0.5,
                                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                            }}
                                onClick={() => setSelectedFile(preview)}
                            >
                                <PictureAsPdfTwoToneIcon sx={{ fontSize: 30 }} color="error" />
                                <Typography variant="caption">PDF</Typography>
                            </Box>
                        ) 
                        : type === 'excel' ? (
                            <Box
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column", // Cambiado a column para apilar los elementos verticalmente
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor: "not-allowed",
                                    border: "1px dashed grey",
                                    borderRadius: 1,
                                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                                }}
                            >
                                <Box sx={{ mb: 0.5 }}> {/* Contenedor para el SVG con margen inferior */}
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        viewBox="0 0 48 40" 
                                        width="32px" 
                                        height="32px"
                                    >
                                        <defs>
                                            <linearGradient 
                                                id="G7C1BuhajJQaEWHVlNUzHa" 
                                                x1="6" 
                                                x2="27" 
                                                y1="24" 
                                                y2="24" 
                                                data-name="Безымянный градиент 10" 
                                                gradientUnits="userSpaceOnUse"
                                            >
                                                <stop offset="0" stopColor="#21ad64"/>
                                                <stop offset="1" stopColor="#088242"/>
                                            </linearGradient>
                                        </defs>
                                        <path fill="#31c447" d="m41,10h-16v28h16c.55,0,1-.45,1-1V11c0-.55-.45-1-1-1Z"/>
                                        <path fill="#fff" d="m32,15h7v3h-7v-3Zm0,10h7v3h-7v-3Zm0,5h7v3h-7v-3Zm0-10h7v3h-7v-3Zm-7-5h5v3h-5v-3Zm0,10h5v3h-5v-3Zm0,5h5v3h-5v-3Zm0-10h5v3h-5v-3Z"/>
                                        <path fill="url(#G7C1BuhajJQaEWHVlNUzHa)" d="m27,42l-21-4V10l21-4v36Z"/>
                                        <path fill="#fff" d="m19.13,31l-2.41-4.56c-.09-.17-.19-.48-.28-.94h-.04c-.05.22-.15.54-.32.98l-2.42,4.52h-3.76l4.46-7-4.08-7h3.84l2,4.2c.16.33.3.73.42,1.18h.04c.08-.27.22-.68.44-1.22l2.23-4.16h3.51l-4.2,6.94,4.32,7.06h-3.74Z"/>
                                    </svg>
                                </Box>
                                <Typography variant="caption" sx={{ mt: -0.5 }}>Excel {index + 1}</Typography>
                            </Box>
                        ) 
                        : (
                            <img
                                src={preview}
                                alt={`preview ${index}`}
                                style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
                                onClick={() => setSelectedFile(preview)}
                            />
                        )}
                        <IconButton
                            size="small"
                            sx={{ position: "absolute", top: 0, right: 0, backgroundColor: "rgba(255, 255, 255, 0.7)" }}
                            onClick={() => handleRemove(index)}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            sx={{ position: "absolute", bottom: 0, right: 0, backgroundColor: "rgba(255, 255, 255, 0.7)" }}
                            onClick={() => setSelectedFile(preview)}
                        >
                            <ZoomInIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ))}
            </Box>

            
            {selectedFile && (
                type === 'pdf' ? (
                    <PDFPreviewModal
                        file={selectedFile}
                        onClose={() => setSelectedFile(null)}
                    />
                ) :
                type === 'excel' ? (
                    <></>
                )

                : (
                    <ImagePreviewModal
                        image={selectedFile}
                        onClose={() => setSelectedFile(null)}
                    />
                )
            )}
        </Box>
    );
};