import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  useTheme,
  useMediaQuery,
  alpha,
  Stepper,
  Step,
  StepLabel,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Draw as SignatureIcon,
  Send as SendIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  School as CertIcon,
  Person as PersonIcon,
  CalendarToday as DateIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import SignatureCanvas from 'react-signature-canvas';
import { useGetCertificationQuery, useCompleteCertificationMutation } from '../services/personnelApi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const steps = ['Verificar Datos', 'Capturar Firma'];

export const CertificationCompletePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: certification, isLoading, error } = useGetCertificationQuery(Number(id));
  const [completeCertification, { isLoading: submitting }] = useCompleteCertificationMutation();

  const [activeStep, setActiveStep] = useState(0);
  const signatureRef = useRef<SignatureCanvas>(null);
  const signatureWrapRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState('');
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const [signatureBlob, setSignatureBlob] = useState<Blob | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar dimensiones internas del canvas con el contenedor real.
  // Sin esto el canvas queda con ancho fijo y solo responde en esa zona.
  useEffect(() => {
    if (activeStep !== 1) return;

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

    // rAF asegura que el DOM ya midió el contenedor
    const raf = requestAnimationFrame(syncSize);
    const ro = new ResizeObserver(syncSize);
    if (signatureWrapRef.current) ro.observe(signatureWrapRef.current);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [activeStep]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !certification) {
    return (
      <Box sx={{ width: { xs: '100%', md: '80%' }, mx: 'auto', py: 3, px: { xs: 2, md: 3 } }}>
        <Alert severity="error">No se pudo cargar la certificación</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/personnel/certifications')} sx={{ mt: 2 }}>
          Volver al listado
        </Button>
      </Box>
    );
  }

  if (certification.status === 'COMPLETED') {
    return (
      <Box sx={{ width: { xs: '100%', md: '80%' }, mx: 'auto', py: 3, px: { xs: 2, md: 3 } }}>
        <Alert severity="info">Esta certificación ya fue completada</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate(`/personnel/certifications/${id}`)} sx={{ mt: 2 }}>
          Volver al detalle
        </Button>
      </Box>
    );
  }

  const handleClearSignature = () => {
    signatureRef.current?.clear();
    setSignatureEmpty(true);
    setSignatureBlob(null);
  };

  const handleSignatureEnd = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      setSignatureEmpty(false);
      // getTrimmedCanvas usa trim-canvas internamente y falla con algunos bundlers.
      // getCanvas() devuelve el canvas directamente sin problemas.
      signatureRef.current.getCanvas().toBlob((blob) => {
        if (blob) setSignatureBlob(blob);
      }, 'image/png');
    }
  };

  const handleNext = () => {
    if (activeStep === 1 && signatureEmpty) {
      toast.error('Se requiere la firma del participante');
      return;
    }
    setActiveStep((s) => s + 1);
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
      await completeCertification({ id: Number(id), formData }).unwrap();
      toast.success('Certificación completada exitosamente');
      navigate(`/personnel/certifications/${id}`);
    } catch {
      toast.error('Error al completar la certificación');
    }
  };

  const certTypeName = typeof certification.certification_type === 'object'
    ? certification.certification_type.name
    : certification.certification_type_name || `Tipo ${certification.certification_type}`;

  const formatDate = (d: string) => {
    try { return format(new Date(d), 'dd MMM yyyy', { locale: es }); }
    catch { return d; }
  };

  // ── Steps ────────────────────────────────────────────────────────────────

  const renderStep0 = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={500} sx={{ mb: 3 }}>
        Datos de la certificación
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PersonIcon fontSize="small" color="primary" />
              <Typography variant="caption" color="text.secondary">Participante</Typography>
            </Box>
            <Typography fontWeight={600}>{certification.personnel_name}</Typography>
            <Typography variant="body2" color="text.secondary">{certification.personnel_code}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CertIcon fontSize="small" color="primary" />
              <Typography variant="caption" color="text.secondary">Certificación</Typography>
            </Box>
            <Typography fontWeight={600}>{certTypeName}</Typography>
            {certification.certification_number && (
              <Typography variant="body2" color="text.secondary">
                #{certification.certification_number}
              </Typography>
            )}
          </Paper>
        </Grid>
        {certification.issuing_authority && (
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">Instructor / Autoridad</Typography>
              <Typography fontWeight={500}>{certification.issuing_authority}</Typography>
            </Paper>
          </Grid>
        )}
        <Grid item xs={12} sm={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <DateIcon fontSize="small" color="primary" />
              <Typography variant="caption" color="text.secondary">Fechas</Typography>
            </Box>
            <Typography variant="body2">
              Inicio: <strong>{formatDate(certification.issue_date)}</strong>
            </Typography>
            <Typography variant="body2">
              Fin: <strong>{formatDate(certification.expiration_date)}</strong>
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
            <Typography variant="body2" color="text.secondary">
              Estado actual: <Chip label={certification.status_display || certification.status} size="small" />
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const renderStep1 = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={500} sx={{ mb: 1 }}>
        Firma del participante
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        El participante debe firmar para confirmar que completó la certificación.
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          borderColor: signatureEmpty ? theme.palette.divider : theme.palette.success.main,
          borderWidth: signatureEmpty ? 1 : 2,
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
              // width/height los maneja el ResizeObserver — no poner valores fijos aquí
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

      {/* Document upload (optional) */}
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
              onClick={() => {
                setDocumentFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
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
    </Box>
  );

  const renderCurrentStep = () => {
    switch (activeStep) {
      case 0: return renderStep0();
      case 1: return renderStep1();
      default: return null;
    }
  };

  return (
    <Box sx={{ width: { xs: '100%', md: '80%', lg: '70%' }, mx: 'auto', py: 3, px: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(`/personnel/certifications/${id}`)}
          variant="outlined"
          size="small"
        >
          Volver
        </Button>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Completar Certificación
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {certTypeName}
          </Typography>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel={!isMobile}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Divider sx={{ mb: 4 }} />

          {/* Step content */}
          {renderCurrentStep()}

          <Divider sx={{ mt: 4, mb: 3 }} />

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              startIcon={<PrevIcon />}
              onClick={() => setActiveStep((s) => s - 1)}
              disabled={activeStep === 0}
              variant="outlined"
            >
              Anterior
            </Button>

            {activeStep === 0 ? (
              <Button endIcon={<NextIcon />} onClick={() => setActiveStep(1)} variant="contained">
                Continuar
              </Button>
            ) : (
              <Button
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                onClick={handleSubmit}
                variant="contained"
                color="success"
                disabled={submitting || signatureEmpty}
              >
                {submitting ? 'Guardando...' : 'Guardar Firma y Completar'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
