import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  alpha
} from "@mui/material";
import { FC, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadTwoToneIcon from "@mui/icons-material/CloudUploadTwoTone";
import AttachFileTwoToneIcon from "@mui/icons-material/AttachFileTwoTone";
import { ImagePreviewModal } from "../../ui/components/ImagePreviewModal";
import { PDFPreviewModal } from "../../ui/components/PDFPreviewModal";
import { Tracker } from "../../../interfaces/tracking";
import BootstrapDialogTitle from "../../ui/components/BootstrapDialogTitle";

interface ArchivoModalProps {
  open: boolean;
  handleClose: () => void;
  seguimiento: Tracker;
}

const ArchivoModal: FC<ArchivoModalProps> = ({ open, handleClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [previewPDF, setPreviewPDF] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <BootstrapDialogTitle id="archivo-tracking-dialog-title" onClose={handleClose}>
          <Typography variant="h6" fontWeight={600} color={'#fff'}>
            Archivo del tracking
          </Typography>
        </BootstrapDialogTitle>
        <DialogContent dividers>

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
          <Button onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={!selectedFile }
            startIcon={<CloudUploadTwoToneIcon />}
          >
            Cargar
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