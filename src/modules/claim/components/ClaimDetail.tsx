import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  alpha
} from "@mui/material";
import { FC, useRef, useState } from "react";
import { Seguimiento } from "../../../store/seguimiento/seguimientoSlice";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadTwoToneIcon from "@mui/icons-material/CloudUploadTwoTone";
import AttachFileTwoToneIcon from "@mui/icons-material/AttachFileTwoTone";
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useAppDispatch } from "../../../store/store";
import { uploadFile, downloadFile } from "../../../store/seguimiento/trackerThunk";
import { ImagePreviewModal } from "../../ui/components/ImagePreviewModal";
import { PDFPreviewModal } from "../../ui/components/PDFPreviewModal";

interface ArchivoModalProps {
  open: boolean;
  handleClose: () => void;
  seguimiento: Seguimiento;
}

const ArchivoModal: FC<ArchivoModalProps> = ({ open, handleClose, seguimiento }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const [previewImage, setPreviewImage] = useState<string>("");
  const [previewPDF, setPreviewPDF] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      setLoading(true);
      try {
        await dispatch(uploadFile(seguimiento.id, selectedFile));
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        handleClose();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownload = () => {
    dispatch(downloadFile(seguimiento.id));
  };

  const handlePreviewFile = () => {
    if (!seguimiento.archivo_url) return;

    const fileExtension = seguimiento.archivo_name?.split('.').pop()?.toLowerCase();

    // Handle image files
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
      setPreviewImage(seguimiento.archivo_url);
    }
    // Handle PDF files
    else if (fileExtension === 'pdf') {
      setPreviewPDF(seguimiento.archivo_url);
    }
    // Handle other file types (Excel, Word, etc.)
    else {
      handleDownload();
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Archivo del tracking
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {seguimiento.is_archivo_up ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle1" gutterBottom>
                Archivo actual: <b>{seguimiento.archivo_name}</b>
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={handlePreviewFile}
                >
                  Previsualizar
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleDownload}
                >
                  Descargar
                </Button>
              </Stack>
            </Box>
          ) : (
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              No hay ningún archivo cargado para este tracking
            </Typography>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Cargar nuevo archivo:
            </Typography>
            <TextField
              fullWidth
              type="text"
              variant="outlined"
              value={selectedFile?.name || ""}
              placeholder="Seleccione un archivo"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachFileTwoToneIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      component="label"
                      variant="contained"
                      size="small"
                      color="secondary"
                    >
                      Explorar
                      <input
                        ref={fileInputRef}
                        hidden
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        type="file"
                        onChange={handleFileChange}
                      />
                    </Button>
                  </InputAdornment>
                ),
                readOnly: true,
              }}
            />
            {selectedFile && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: (theme) => alpha(theme.palette.info.light, 0.1),
                  borderRadius: 1
                }}
              >
                <Typography variant="body2">
                  <b>Nombre:</b> {selectedFile.name}
                </Typography>
                <Typography variant="body2">
                  <b>Tamaño:</b> {(selectedFile.size / 1024).toFixed(2)} KB
                </Typography>
                <Typography variant="body2">
                  <b>Tipo:</b> {selectedFile.type || "Desconocido"}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadTwoToneIcon />}
          >
            {loading ? "Subiendo..." : "Subir"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreviewModal
          image={previewImage}
          onClose={() => setPreviewImage("")}
        />
      )}

      {/* PDF Preview Modal */}
      {previewPDF && (
        <PDFPreviewModal
          file={previewPDF}
          onClose={() => setPreviewPDF("")}
        />
      )}
    </>
  );
};

export default ArchivoModal;