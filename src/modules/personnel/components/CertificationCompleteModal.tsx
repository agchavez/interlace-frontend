import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Paper,
  Typography,
  Divider,
  CircularProgress,
  TextField,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Draw as SignatureIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import SignatureCanvas from 'react-signature-canvas';
import { toast } from 'sonner';
import { useGetCertificationQuery, useCompleteCertificationMutation } from '../services/personnelApi';

interface Props {
  open: boolean;
  onClose: () => void;
  certificationId: number | null;
}

export const CertificationCompleteModal = ({ open, onClose, certificationId }: Props) => {
  const theme = useTheme();
  const { data: certification } = useGetCertificationQuery(certificationId!, { skip: !certificationId });
  const [completeCertification, { isLoading: submitting }] = useCompleteCertificationMutation();

  const signatureRef = useRef<SignatureCanvas>(null);
  const signatureWrapRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState('');
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const [signatureBlob, setSignatureBlob] = useState<Blob | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset al abrir
  useEffect(() => {
    if (open) {
      setNotes('');
      setSignatureEmpty(true);
      setSignatureBlob(null);
      setDocumentFile(null);
      setTimeout(() => signatureRef.current?.clear(), 50);
    }
  }, [open]);

  // Sincronizar dimensiones del canvas con el contenedor
  useEffect(() => {
    if (!open) return;
    const syncSize = () => {
      const wrap = signatureWrapRef.current;
      const canvas = signatureRef.current?.getCanvas();
      if (!wrap || !canvas) return;
      const newW = wrap.clientWidth;
      const newH = 200;
      if (canvas.width === newW && canvas.height === newH) return;
      const strokes = signatureRef.current?.toData() ?? [];
      canvas.width = newW;
      canvas.height = newH;
      signatureRef.current?.clear();
      if (strokes.length) signatureRef.current?.fromData(strokes);
    };
    const raf = requestAnimationFrame(syncSize);
    const ro = new ResizeObserver(syncSize);
    if (signatureWrapRef.current) ro.observe(signatureWrapRef.current);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [open]);

  const handleClearSignature = () => {
    signatureRef.current?.clear();
    setSignatureEmpty(true);
    setSignatureBlob(null);
  };

  const handleSignatureEnd = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      setSignatureEmpty(false);
      signatureRef.current.getCanvas().toBlob((blob) => {
        if (blob) setSignatureBlob(blob);
      }, 'image/png');
    }
  };

  const handleSubmit = async () => {
    if (!signatureBlob) {
      toast.error('Se requiere la firma del participante');
      return;
    }
    const formData = new FormData();
    formData.append('signature', signatureBlob, 'signature.png');
    if (notes) formData.append('notes', notes);
    if (documentFile) formData.append('certificate_document', documentFile);
    try {
      await completeCertification({ id: certificationId!, formData }).unwrap();
      toast.success('Certificación completada exitosamente');
      onClose();
    } catch {
      toast.error('Error al completar la certificación');
    }
  };

  const certTypeName = certification
    ? typeof certification.certification_type === 'object'
      ? certification.certification_type.name
      : certification.certification_type_name || `Tipo ${certification.certification_type}`
    : '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircleIcon color="success" />
        Capturar Firma
        {certification && (
          <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 0.5 }}>
            — {certification.personnel_name}
          </Typography>
        )}
      </DialogTitle>
      {certification && (
        <Box sx={{ px: 3, pb: 1 }}>
          <Typography variant="caption" color="text.secondary">{certTypeName}</Typography>
        </Box>
      )}
      <Divider />
      <DialogContent>
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            borderColor: signatureEmpty ? theme.palette.divider : theme.palette.success.main,
            borderWidth: signatureEmpty ? 1 : 2,
            mt: 1,
          }}
        >
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              px: 2,
              py: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SignatureIcon fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight={500}>Firma *</Typography>
            </Box>
            <Button size="small" onClick={handleClearSignature} color="error" variant="text">
              Limpiar
            </Button>
          </Box>
          <Divider />
          <Box ref={signatureWrapRef} sx={{ touchAction: 'none', width: '100%' }}>
            <SignatureCanvas
              ref={signatureRef}
              penColor={theme.palette.mode === 'dark' ? '#fff' : '#1a1a2e'}
              canvasProps={{
                style: {
                  display: 'block',
                  width: '100%',
                  height: '200px',
                  cursor: 'crosshair',
                  background: theme.palette.mode === 'dark' ? '#1e1e2e' : '#fafafa',
                },
              }}
              onEnd={handleSignatureEnd}
            />
          </Box>
        </Paper>

        {signatureEmpty && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Dibuje la firma en el área de arriba
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" fontWeight={500} sx={{ mb: 1 }}>
            Documento del certificado (opcional)
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
          />
          {documentFile ? (
            <Paper
              variant="outlined"
              sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1, borderRadius: 2 }}
            >
              <AttachFileIcon fontSize="small" color="primary" />
              <Typography variant="body2" sx={{ flex: 1 }} noWrap>{documentFile.name}</Typography>
              <Button
                size="small"
                color="error"
                variant="text"
                onClick={() => { setDocumentFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                startIcon={<CloseIcon fontSize="small" />}
              >
                Quitar
              </Button>
            </Paper>
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AttachFileIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Adjuntar PDF / Imagen
            </Button>
          )}
        </Box>

        <TextField
          label="Notas adicionales (opcional)"
          multiline
          rows={3}
          fullWidth
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mt: 3 }}
          placeholder="Observaciones sobre la certificación..."
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>Cancelar</Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
          disabled={submitting || signatureEmpty}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
        >
          {submitting ? 'Guardando...' : 'Guardar Firma y Completar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
