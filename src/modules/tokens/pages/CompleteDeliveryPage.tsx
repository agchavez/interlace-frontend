/**
 * Página para completar la entrega de uniforme
 * Diseño moderno consistente con TokenCreatePage
 */
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
  alpha,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Checkroom as UniformIcon,
  PhotoCamera as PhotoIcon,
  Draw as SignatureIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  CheckCircle as CheckIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
} from '@mui/icons-material';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import SignatureCanvas from 'react-signature-canvas';
import {
  useGetTokenQuery,
  useCompleteUniformDeliveryMutation,
} from '../services/tokenApi';
import {
  TokenType,
  TokenTypeLabels,
  UniformItemTypeLabels,
  UniformItemType,
  UniformSizeLabels,
  UniformSize,
} from '../interfaces/token';

const steps = ['Verificar Items', 'Capturar Evidencia', 'Confirmar Entrega'];

export const CompleteDeliveryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: token, isLoading, error } = useGetTokenQuery(Number(id));
  const [completeDelivery, { isLoading: submitting }] = useCompleteUniformDeliveryMutation();

  const [activeStep, setActiveStep] = useState(0);
  const signatureRef = useRef<SignatureCanvas>(null);
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [notes, setNotes] = useState('');
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const [signatureBlob, setSignatureBlob] = useState<Blob | null>(null);

  // Cleanup photo previews
  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  }, [photos]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !token) {
    return (
      <Box sx={{ width: { xs: '100%', md: '90%', lg: '80%' }, mx: 'auto', py: 3, px: { xs: 2, md: 3 } }}>
        <Alert severity="error">No se pudo cargar el token</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/tokens')} sx={{ mt: 2 }}>
          Volver al listado
        </Button>
      </Box>
    );
  }

  // Validate token type
  if (token.token_type !== TokenType.UNIFORM_DELIVERY) {
    return (
      <Box sx={{ width: { xs: '100%', md: '90%', lg: '80%' }, mx: 'auto', py: 3, px: { xs: 2, md: 3 } }}>
        <Alert severity="error">Este token no es de entrega de uniforme</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate(`/tokens/detail/${id}`)} sx={{ mt: 2 }}>
          Volver al detalle
        </Button>
      </Box>
    );
  }

  // Check if already delivered
  if (token.uniform_delivery_detail?.is_delivered) {
    return (
      <Box sx={{ width: { xs: '100%', md: '90%', lg: '80%' }, mx: 'auto', py: 3, px: { xs: 2, md: 3 } }}>
        <Alert severity="info">Este uniforme ya fue entregado</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate(`/tokens/detail/${id}`)} sx={{ mt: 2 }}>
          Volver al detalle
        </Button>
      </Box>
    );
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (photos.length + files.length > 2) {
      toast.error('Máximo 2 fotos permitidas');
      return;
    }

    const newPhotos = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos([...photos, ...newPhotos]);
  };

  const handleRemovePhoto = (index: number) => {
    URL.revokeObjectURL(photos[index].preview);
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleClearSignature = () => {
    signatureRef.current?.clear();
    setSignatureEmpty(true);
    setSignatureBlob(null);
  };

  const handleSignatureEnd = () => {
    setSignatureEmpty(signatureRef.current?.isEmpty() ?? true);
  };

  const handleNext = async () => {
    if (activeStep === 1 && signatureEmpty) {
      toast.error('Se requiere la firma del beneficiario');
      return;
    }

    // Guardar la firma como blob antes de pasar al paso 2 (el canvas se desmontará)
    if (activeStep === 1 && signatureRef.current && !signatureEmpty) {
      const dataUrl = signatureRef.current.toDataURL('image/png');
      const blob = await fetch(dataUrl).then((res) => res.blob());
      setSignatureBlob(blob);
    }

    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!signatureBlob) {
      toast.error('Se requiere la firma del beneficiario');
      return;
    }

    const formData = new FormData();

    // Usar la firma guardada previamente
    formData.append('signature', signatureBlob, 'signature.png');

    // Add photos
    photos.forEach((photo, index) => {
      formData.append(`photo_${index + 1}`, photo.file);
    });

    // Add notes
    if (notes) {
      formData.append('notes', notes);
    }

    try {
      await completeDelivery({ id: Number(id), formData }).unwrap();
      toast.success('Entrega completada exitosamente');
      navigate(`/tokens/detail/${id}`);
    } catch (err) {
      toast.error('Error al completar la entrega');
      console.error(err);
    }
  };

  const canProceed = () => {
    if (activeStep === 1) return !signatureEmpty;
    return true;
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            {/* Beneficiary Info */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        color: 'secondary.main',
                      }}
                    >
                      <PersonIcon />
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      Beneficiario
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Nombre Completo
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {token.personnel?.full_name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Código de Empleado
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {token.personnel?.employee_code}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Centro de Distribución
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {token.distributor_center?.name}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Uniform Items */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        bgcolor: alpha('#795548', 0.1),
                        color: '#795548',
                      }}
                    >
                      <UniformIcon />
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      Artículos a Entregar
                    </Typography>
                    <Chip
                      label={`${token.uniform_delivery_detail?.items?.length || 0} items`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {token.uniform_delivery_detail?.items && token.uniform_delivery_detail.items.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Talla</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Cant.</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {token.uniform_delivery_detail.items.map((item) => (
                            <TableRow key={item.id} hover>
                              <TableCell>{UniformItemTypeLabels[item.item_type as UniformItemType]}</TableCell>
                              <TableCell>{UniformSizeLabels[item.size as UniformSize]}</TableCell>
                              <TableCell align="right">{item.quantity}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary" textAlign="center" py={2}>
                      No hay artículos registrados
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            {/* Signature */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                      }}
                    >
                      <SignatureIcon />
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      Firma del Beneficiario
                    </Typography>
                    <Chip label="Requerido" size="small" color="error" variant="outlined" />
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <Alert severity="info" sx={{ mb: 2 }}>
                    El beneficiario debe firmar para confirmar la recepción.
                  </Alert>

                  <Paper
                    variant="outlined"
                    sx={{
                      border: `2px dashed ${signatureEmpty ? theme.palette.grey[400] : theme.palette.primary.main}`,
                      borderRadius: 2,
                      overflow: 'hidden',
                      bgcolor: alpha(theme.palette.grey[100], 0.5),
                    }}
                  >
                    <SignatureCanvas
                      ref={signatureRef}
                      canvasProps={{
                        style: {
                          width: '100%',
                          height: 180,
                          backgroundColor: 'transparent',
                        },
                      }}
                      onEnd={handleSignatureEnd}
                    />
                  </Paper>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {signatureEmpty ? 'Firme en el recuadro' : 'Firma capturada'}
                    </Typography>
                    <Button size="small" onClick={handleClearSignature} startIcon={<DeleteIcon />}>
                      Limpiar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Photos */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        color: 'info.main',
                      }}
                    >
                      <PhotoIcon />
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      Fotos de Evidencia
                    </Typography>
                    <Chip label="Opcional" size="small" variant="outlined" />
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    {photos.map((photo, index) => (
                      <Grid item xs={6} key={index}>
                        <Paper
                          variant="outlined"
                          sx={{
                            position: 'relative',
                            borderRadius: 2,
                            overflow: 'hidden',
                            aspectRatio: '4/3',
                          }}
                        >
                          <img
                            src={photo.preview}
                            alt={`Foto ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'error.main',
                              color: 'white',
                              '&:hover': { bgcolor: 'error.dark' },
                            }}
                            onClick={() => handleRemovePhoto(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Paper>
                      </Grid>
                    ))}

                    {photos.length < 2 && (
                      <Grid item xs={6}>
                        <Paper
                          variant="outlined"
                          sx={{
                            borderRadius: 2,
                            aspectRatio: '4/3',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.grey[100], 0.5),
                            cursor: 'pointer',
                            border: `2px dashed ${theme.palette.grey[400]}`,
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              borderColor: theme.palette.primary.main,
                            },
                          }}
                          component="label"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handlePhotoChange}
                            capture="environment"
                          />
                          <Box sx={{ textAlign: 'center' }}>
                            <PhotoIcon sx={{ fontSize: 36, color: 'grey.400' }} />
                            <Typography variant="body2" color="text.secondary">
                              Agregar foto
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>

                  {/* Notes */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Notas Adicionales
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Observaciones sobre la entrega..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Card
            elevation={0}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <CheckIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>

              <Typography variant="h5" fontWeight={600} gutterBottom>
                Confirmar Entrega
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Por favor verifica que la información sea correcta antes de confirmar.
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={2} sx={{ textAlign: 'left' }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Beneficiario</Typography>
                  <Typography fontWeight={500}>{token.personnel?.full_name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Código</Typography>
                  <Typography fontWeight={500}>{token.personnel?.employee_code}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Items</Typography>
                  <Typography fontWeight={500}>{token.uniform_delivery_detail?.items?.length || 0} artículos</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Fotos</Typography>
                  <Typography fontWeight={500}>{photos.length} capturadas</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Firma</Typography>
                  <Typography fontWeight={500} color={!signatureBlob ? 'error.main' : 'success.main'}>
                    {!signatureBlob ? 'No capturada' : 'Capturada correctamente'}
                  </Typography>
                </Grid>
              </Grid>

              <Alert severity="warning" sx={{ mt: 3, textAlign: 'left' }}>
                Una vez confirmada la entrega, el token será marcado como <strong>Utilizado</strong> y no podrá modificarse.
              </Alert>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: { xs: '100%', md: '90%', lg: '85%' }, mx: 'auto', py: 3, px: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton
          onClick={() => navigate(`/tokens/detail/${id}`)}
          sx={{ bgcolor: alpha(theme.palette.grey[500], 0.1) }}
        >
          <BackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={600}>
            Completar Entrega de Uniforme
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Chip
              label={token.display_number}
              size="small"
              color="secondary"
            />
            <Typography variant="body2" color="text.secondary">
              {TokenTypeLabels[token.token_type as TokenType]}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stepper */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ py: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel={isMobile}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Box sx={{ mb: 3 }}>
        {renderStepContent()}
      </Box>

      {/* Navigation */}
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ py: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={activeStep === 0 ? () => navigate(`/tokens/detail/${id}`) : handleBack}
            startIcon={activeStep === 0 ? <BackIcon /> : <PrevIcon />}
          >
            {activeStep === 0 ? 'Cancelar' : 'Anterior'}
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="success"
              onClick={handleSubmit}
              disabled={submitting || !signatureBlob}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              size="large"
            >
              Confirmar Entrega
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!canProceed()}
              endIcon={<NextIcon />}
            >
              Siguiente
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
