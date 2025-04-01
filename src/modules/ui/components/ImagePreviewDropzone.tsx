import React, { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { useDropzone } from "react-dropzone";
import DeleteIcon from "@mui/icons-material/Delete";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { PDFPreviewModal } from "./PDFPreviewModal";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PictureAsPdfTwoToneIcon from '@mui/icons-material/PictureAsPdfTwoTone';
interface ImagePreviewDropzoneProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    label: string;
    accept: { [key: string]: readonly string[] };
    maxFiles?: number;
    sxDrop?: SxProps<Theme>;
}

export const ImagePreviewDropzone: React.FC<ImagePreviewDropzoneProps> = ({ files, onFilesChange, label, accept, maxFiles, sxDrop }) => {
    const [previews, setPreviews] = useState<string[]>(files.map(file => URL.createObjectURL(file)));
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    const onDrop = (acceptedFiles: File[]) => {
        const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
        onFilesChange(newFiles);
        setPreviews(newFiles.map(file => URL.createObjectURL(file)));
    };

    const handleRemove = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        onFilesChange(newFiles);
        setPreviews(newFiles.map(file => URL.createObjectURL(file)));
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept, maxFiles });

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
                    <Box key={index} sx={{ position: "relative", width: 80, height: 80, mr: 1, mb: 1, ...(sxDrop || {}), }}>
                        {accept["application/pdf"] ? (
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
                                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                            }}
                                onClick={() => setSelectedFile(preview)}
                            >
                                <PictureAsPdfTwoToneIcon sx={{ fontSize: 30 }} color="error" />
                                <Typography variant="caption">PDF {index + 1}</Typography>
                            </Box>
                        ) : (
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
                accept["application/pdf"] ? (
                    <PDFPreviewModal
                        file={selectedFile}
                        onClose={() => setSelectedFile(null)}
                    />
                ) : (
                    <ImagePreviewModal
                        image={selectedFile}
                        onClose={() => setSelectedFile(null)}
                    />
                )
            )}
        </Box>
    );
};