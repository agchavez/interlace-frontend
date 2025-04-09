// ExistingDocPreview.tsx
import React, { useState } from "react";
import { Box, Typography, IconButton, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import PictureAsPdfTwoToneIcon from "@mui/icons-material/PictureAsPdfTwoTone";
import { ImagePreviewModal } from "../../ui/components/ImagePreviewModal";
import { PDFPreviewModal } from "../../ui/components/PDFPreviewModal";
import RotateLeftIcon from '@mui/icons-material/RotateLeft';

import LaunchIcon from '@mui/icons-material/Launch';


interface ExistingDocPreviewProps {
  name: string;
  url: string;
  extension: string | null;
  onRemove?: () => void;         // si deseas botón "Eliminar"
  boxWidth?: number | string;
  boxHeight?: number | string;
  showDownload?: boolean;        // si deseas botón "Descargar"
}

export const ExistingDocPreview: React.FC<ExistingDocPreviewProps> = ({
  name,
  url,
  extension,
  onRemove,
  boxWidth = 120,
  boxHeight = 150,
  showDownload = true
}) => {
  const [showImage, setShowImage] = useState<string | null>(null);
  const [showPDF, setShowPDF] = useState<string | null>(null);
  const [isDeleted, setisDeleted] = useState(false)
  const lowerExt = extension?.toLowerCase() || "";
  const isImage = ["jpg","jpeg","png","gif","webp"].includes(lowerExt);
  const isPDF = lowerExt === "pdf";

  const handleDownload = () => {
    // Abre en nueva pestaña
    window.open(url, "_blank");
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
    <Box
      sx={{
        position: "relative",
        border: "1px solid #ccc",
        borderRadius: 1,
        width: boxWidth,
        height: boxHeight,
        p: 1,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {/* Vista previa del archivo */}
      {isPDF ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer"
          }}
          onClick={() => setShowPDF(url)}
        >
          <PictureAsPdfTwoToneIcon sx={{ fontSize: 30 }} color="error" />
          <Typography variant="caption" sx={{ mt: 1, textAlign: "center" }}>
            {name}
          </Typography>
        </Box>
      ) : isImage ? (
        <img
          src={url}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            cursor: "pointer"
          }}
          onClick={() => setShowImage(url)}
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer"
          }}
          onClick={handleDownload}
        >
          <Typography variant="caption" sx={{ textAlign: "center" }}>
            {name}
          </Typography>
        </Box>
      )}

      {/* Botón Zoom (arriba izq) para imágenes/PDF */}
      {(isImage || isPDF) && (
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            top: 4,
            left: 4,
            backgroundColor: "rgba(255,255,255,0.7)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.9)",
              color: "secondary.main"
            }
          }}
          onClick={() => {
            if (isImage) setShowImage(url);
            if (isPDF) setShowPDF(url);
          }}
        >
          <ZoomInIcon fontSize="small" />
        </IconButton>
      )}

      {/* Botón Eliminar (arriba der) si onRemove existe */}
      {onRemove && (
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            backgroundColor: "rgba(255,255,255,0.7)",
            // hover background color
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.9)",
              color: "red"
            }
          }}
          onClick={() => {
            onRemove();
            setisDeleted(!isDeleted);
          }
          }
        >
          { !isDeleted ?<DeleteIcon fontSize="small" /> : <RotateLeftIcon fontSize="small" />}
        </IconButton>
      )}

      {/* Botón Descargar (abajo der) */}
      {showDownload && (
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            bottom: 4,
            right: 4,
            backgroundColor: "rgba(255,255,255,0.7)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.9)",
              color: "secondary.main"
            }
          }}
          onClick={handleDownload}
        >
          <LaunchIcon fontSize="small" />
        </IconButton>
      )}

      {/* Modales de preview */}
      {showImage && (
        <ImagePreviewModal
        image={showImage}
        onClose={() => setShowImage(null)}
        />
      )}
      {showPDF && (
        <PDFPreviewModal file={showPDF} onClose={() => setShowPDF(null)} />
      )}
      
    </Box>
    <Typography variant="caption" sx={{ textAlign: "center", mt: 1 }} color="error">
    {isDeleted && "Se eliminará" }
  </Typography>
        </Box>
    
  );
};
