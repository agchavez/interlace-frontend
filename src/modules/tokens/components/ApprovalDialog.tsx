/**
 * Diálogo de aprobación de token con firma y foto opcionales
 */
import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Collapse,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Close as CloseIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Draw as SignatureIcon,
  PhotoCamera as PhotoIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { SignatureCapture } from './SignatureCapture';

interface ApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  onApprove: (data: { notes: string; signature?: Blob; photo?: File }) => void;
  isLoading: boolean;
  tokenDisplayNumber: string;
  approvalLevel: number;
}

export const ApprovalDialog = ({
  open,
  onClose,
  onApprove,
  isLoading,
  tokenDisplayNumber,
  approvalLevel,
}: ApprovalDialogProps) => {
  const [notes, setNotes] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [signature, setSignature] = useState<Blob | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignatureCapture = useCallback((signatureBlob: Blob | null) => {
    setSignature(signatureBlob);
  }, []);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhoto(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApprove = () => {
    onApprove({
      notes,
      signature: signature || undefined,
      photo: photo || undefined,
    });
  };

  const handleClose = () => {
    // Reset state when closing
    setNotes('');
    setShowAttachments(false);
    setSignature(null);
    setPhoto(null);
    setPhotoPreview(null);
    onClose();
  };

  const levelLabels: Record<number, string> = {
    1: 'Supervisor',
    2: 'Jefe de Área',
    3: 'Gerente CD',
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ApproveIcon color="success" />
          <Typography variant="h6">Aprobar Token</Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" disabled={isLoading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Está a punto de aprobar el token <strong>{tokenDisplayNumber}</strong> como{' '}
          <strong>{levelLabels[approvalLevel]}</strong> (Nivel {approvalLevel}).
        </Alert>

        <TextField
          fullWidth
          multiline
          rows={2}
          label="Notas de aprobación (opcional)"
          placeholder="Agregue comentarios o notas sobre esta aprobación..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
          sx={{ mb: 2 }}
        />

        {/* Toggle for attachments */}
        <Button
          fullWidth
          variant="outlined"
          color="secondary"
          onClick={() => setShowAttachments(!showAttachments)}
          endIcon={showAttachments ? <CollapseIcon /> : <ExpandIcon />}
          sx={{ mb: 1 }}
        >
          {showAttachments ? 'Ocultar adjuntos' : 'Agregar firma o foto (opcional)'}
        </Button>

        <Collapse in={showAttachments}>
          <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
            {/* Signature Section */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SignatureIcon color="secondary" fontSize="small" />
                <Typography variant="subtitle2">Firma (opcional)</Typography>
              </Box>
              <SignatureCapture
                onSignatureCapture={handleSignatureCapture}
                width={350}
                height={150}
                disabled={isLoading}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Photo Section */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PhotoIcon color="secondary" fontSize="small" />
                <Typography variant="subtitle2">Foto (opcional)</Typography>
              </Box>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
                id="approval-photo-input"
              />

              {!photoPreview ? (
                <Button
                  variant="outlined"
                  startIcon={<PhotoIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  fullWidth
                >
                  Tomar o seleccionar foto
                </Button>
              ) : (
                <Box sx={{ position: 'relative' }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      overflow: 'hidden',
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      component="img"
                      src={photoPreview}
                      alt="Preview"
                      sx={{
                        width: '100%',
                        maxHeight: 200,
                        objectFit: 'cover',
                      }}
                    />
                  </Paper>
                  <IconButton
                    size="small"
                    onClick={handleRemovePhoto}
                    disabled={isLoading}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'error.dark' },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Puede adjuntar una foto como evidencia de la aprobación
              </Typography>
            </Box>
          </Paper>
        </Collapse>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} variant="outlined" disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleApprove}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <ApproveIcon />}
        >
          {isLoading ? 'Aprobando...' : 'Aprobar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
