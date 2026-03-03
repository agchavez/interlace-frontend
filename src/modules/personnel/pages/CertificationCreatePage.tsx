import React, { useState, useMemo, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Divider,
  Tabs,
  Tab,
  Button,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
  TextField,
  Autocomplete,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogActions,
  styled,
  Paper,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import VerifiedIcon from '@mui/icons-material/Verified';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import DrawIcon from '@mui/icons-material/Draw';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SignatureCanvas from 'react-signature-canvas';
import {
  useCreateCertificationMutation,
  useCompleteCertificationMutation,
  useGetPersonnelProfilesQuery,
} from '../services/personnelApi';
import { toast } from 'sonner';
import BootstrapDialogTitle from '../../ui/components/BootstrapDialogTitle';
import { FileUpload } from '../../ui/components/FileUpload';
import { format } from 'date-fns';
import { CertificationTypeSelect } from '../components/CertificationTypeSelect';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': { padding: theme.spacing(2) },
  '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

const tabs = [
  { label: 'Información', icon: <VerifiedIcon /> },
  { label: 'Fechas', icon: <CalendarTodayIcon /> },
  { label: 'Documento', icon: <DescriptionIcon /> },
  { label: 'Firma', icon: <DrawIcon /> },
];

function a11yProps(index: number) {
  return { id: `certification-tab-${index}`, 'aria-controls': `certification-tabpanel-${index}` };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`certification-tabpanel-${index}`}
      aria-labelledby={`certification-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

interface CertificationFormData {
  personnel?: number;
  certification_type?: number;
  certification_number?: string;
  issuing_authority?: string;
  issue_date?: string;
  expiration_date?: string;
  notes?: string;
  certificate_document?: File | null;
}

interface CertificationType {
  id: number;
  name: string;
  code: string;
}

export const CertificationCreatePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<CertificationFormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCertType, setSelectedCertType] = useState<CertificationType | null>(null);

  // Firma
  const signatureRef = useRef<SignatureCanvas>(null);
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const [signatureBlob, setSignatureBlob] = useState<Blob | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  const [createCertification, { isLoading }] = useCreateCertificationMutation();
  const [completeCertification, { isLoading: completing }] = useCompleteCertificationMutation();

  const { data: personnelData } = useGetPersonnelProfilesQuery({ is_active: true, limit: 1000, offset: 0 });
  const personnelList = personnelData?.results || [];

  React.useEffect(() => {
    const personnelId = searchParams.get('personnel');
    if (personnelId && personnelList.length > 0) {
      const personnelIdNum = parseInt(personnelId, 10);
      const personnel = personnelList.find((p: any) => p.id === personnelIdNum);
      if (personnel) setFormData((prev) => ({ ...prev, personnel: personnelIdNum }));
    }
  }, [searchParams, personnelList]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setActiveTab(newValue);
  const handleCancel = () => navigate('/personnel/certifications');

  const isFormValid = useMemo(() => {
    return !!(
      formData.personnel &&
      formData.certification_type &&
      formData.issuing_authority &&
      formData.issue_date &&
      formData.expiration_date
    );
  }, [formData]);

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.personnel) newErrors.personnel = 'Personal requerido';
    if (!formData.certification_type) newErrors.certification_type = 'Tipo de certificación requerido';
    if (!formData.issuing_authority) newErrors.issuing_authority = 'Autoridad emisora requerida';
    if (!formData.issue_date) newErrors.issue_date = 'Fecha de inicio requerida';
    if (!formData.expiration_date) newErrors.expiration_date = 'Fecha de fin requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShowConfirmModal = () => {
    if (!validateAll()) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    const willComplete = !signatureEmpty && signatureBlob;

    try {
      const result = await createCertification(formData as any).unwrap();

      if (willComplete) {
        const fd = new FormData();
        fd.append('signature', signatureBlob!, 'signature.png');
        if (completionNotes) fd.append('notes', completionNotes);
        await completeCertification({ id: result.id, formData: fd }).unwrap();
        toast.success('Certificación creada y completada exitosamente');
      } else {
        toast.success('Certificación creada en estado Pendiente');
      }

      setShowConfirmModal(false);
      navigate('/personnel/certifications');
    } catch (error: any) {
      const errorMessage =
        error?.data?.detail?.message || error?.data?.mensage || error?.data?.detail || 'Error al crear la certificación';
      toast.error(errorMessage);
      setShowConfirmModal(false);
    }
  };

  const updateFormData = (data: Partial<CertificationFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleClearSignature = () => {
    signatureRef.current?.clear();
    setSignatureEmpty(true);
    setSignatureBlob(null);
  };

  const handleSignatureEnd = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      setSignatureEmpty(false);
      signatureRef.current.getTrimmedCanvas().toBlob((blob) => {
        if (blob) setSignatureBlob(blob);
      }, 'image/png');
    }
  };

  const selectedPersonnel = personnelList.find((p: any) => p.id === formData.personnel);
  const isPersonnelPrecargado = !!searchParams.get('personnel');
  const willComplete = !signatureEmpty && signatureBlob;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Container maxWidth="xl">
        <Grid container spacing={1} sx={{ marginTop: 2 }}>
          {/* Header */}
          <Grid item xs={12}>
            <Typography variant="h4" component="h1" fontWeight={400}>
              Nueva Certificación
            </Typography>
            <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
          </Grid>

          <Grid item xs={12} md={8} lg={9} xl={10} />
          <Grid item xs={12} md={4} lg={3} xl={2} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              fullWidth
              onClick={handleCancel}
              startIcon={<ArrowBackIcon color="inherit" fontSize="small" />}
            >
              <Typography variant="body2" component="span" fontWeight={400} color="gray.700">
                Volver al Listado
              </Typography>
            </Button>
          </Grid>

          {/* Tabs */}
          <Grid item xs={12}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant={isMobile ? 'scrollable' : 'fullWidth'}
                  scrollButtons="auto"
                  aria-label="certification form tabs"
                >
                  {tabs.map((tab, index) => (
                    <Tab
                      key={index}
                      icon={tab.icon}
                      label={!isMobile ? tab.label : undefined}
                      iconPosition="start"
                      {...a11yProps(index)}
                    />
                  ))}
                </Tabs>
              </Box>

              {/* Tab 0: Información */}
              <CustomTabPanel value={activeTab} index={0}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, py: 3 }}>
                  <Autocomplete
                    options={personnelList}
                    getOptionLabel={(option: any) => `${option.employee_code} - ${option.full_name}`}
                    value={selectedPersonnel || null}
                    onChange={(_, newValue: any) => updateFormData({ personnel: newValue?.id })}
                    disabled={isPersonnelPrecargado}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={isPersonnelPrecargado ? 'Personal (Precargado)' : 'Personal'}
                        required
                        error={!!errors.personnel}
                        helperText={isPersonnelPrecargado ? 'Este campo fue precargado automáticamente' : errors.personnel}
                        size="small"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <PersonIcon fontSize="small" />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    fullWidth
                    size="small"
                  />

                  <CertificationTypeSelect
                    value={selectedCertType}
                    onChange={(newValue) => {
                      setSelectedCertType(newValue);
                      updateFormData({ certification_type: newValue?.id });
                    }}
                    error={!!errors.certification_type}
                    helperText={errors.certification_type}
                    required
                    allowCreate
                  />

                  <TextField
                    label="Número de Certificación"
                    value={formData.certification_number || ''}
                    onChange={(e) => updateFormData({ certification_number: e.target.value })}
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label="Instructor / Autoridad Emisora"
                    value={formData.issuing_authority || ''}
                    onChange={(e) => updateFormData({ issuing_authority: e.target.value })}
                    error={!!errors.issuing_authority}
                    helperText={errors.issuing_authority}
                    required
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </CustomTabPanel>

              {/* Tab 1: Fechas */}
              <CustomTabPanel value={activeTab} index={1}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, py: 3 }}>
                  <DatePicker
                    label="Fecha de Inicio *"
                    value={formData.issue_date ? new Date(formData.issue_date) : null}
                    onChange={(newValue) => {
                      const dateStr = newValue ? newValue.toISOString().split('T')[0] : '';
                      updateFormData({ issue_date: dateStr });
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: !!errors.issue_date,
                        helperText: errors.issue_date,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarTodayIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />

                  <DatePicker
                    label="Fecha de Fin / Vencimiento *"
                    value={formData.expiration_date ? new Date(formData.expiration_date) : null}
                    onChange={(newValue) => {
                      const dateStr = newValue ? newValue.toISOString().split('T')[0] : '';
                      updateFormData({ expiration_date: dateStr });
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: !!errors.expiration_date,
                        helperText: errors.expiration_date,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarTodayIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />

                  <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                    <Alert severity="info" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Si la certificación ya fue realizada, completa también la firma en el tab <strong>Firma</strong> para marcarla directamente como Completada.
                    </Alert>
                  </Box>
                </Box>
              </CustomTabPanel>

              {/* Tab 2: Documento */}
              <CustomTabPanel value={activeTab} index={2}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3, py: 3 }}>
                  <FileUpload
                    onFileSelect={(file) => updateFormData({ certificate_document: file })}
                    acceptedFormats={['pdf', 'jpg', 'jpeg', 'png']}
                    maxSizeInMB={5}
                    label="Documento de Certificación"
                    helperText="Suba una copia del certificado en formato PDF o imagen (máximo 5MB)"
                    currentFileName={formData.certificate_document?.name}
                  />

                  <TextField
                    label="Notas"
                    multiline
                    rows={4}
                    value={formData.notes || ''}
                    onChange={(e) => updateFormData({ notes: e.target.value })}
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Agregue notas adicionales sobre esta certificación..."
                  />
                </Box>
              </CustomTabPanel>

              {/* Tab 3: Firma */}
              <CustomTabPanel value={activeTab} index={3}>
                <Box sx={{ py: 3 }}>
                  <Alert
                    severity={signatureEmpty ? 'info' : 'success'}
                    icon={signatureEmpty ? <HourglassEmptyIcon /> : <CheckCircleIcon />}
                    sx={{ mb: 3 }}
                  >
                    {signatureEmpty ? (
                      <>
                        <strong>Opcional:</strong> Si la certificación ya fue realizada, capture aquí la firma del participante.
                        La certificación se guardará directamente como <strong>Completada</strong>.
                        Si lo omite, quedará en estado <strong>Pendiente</strong>.
                      </>
                    ) : (
                      <>
                        Firma capturada — La certificación se guardará como <Chip label="Completada" color="success" size="small" sx={{ mx: 0.5 }} />.
                      </>
                    )}
                  </Alert>

                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      borderColor: signatureEmpty ? theme.palette.divider : theme.palette.success.main,
                      borderWidth: signatureEmpty ? 1 : 2,
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: 'action.hover',
                        px: 2,
                        py: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DrawIcon fontSize="small" color="primary" />
                        <Typography variant="body2" fontWeight={500}>
                          Firma del participante {signatureEmpty ? '(opcional)' : '✓'}
                        </Typography>
                      </Box>
                      <Button size="small" onClick={handleClearSignature} color="error" variant="text">
                        Limpiar
                      </Button>
                    </Box>
                    <Divider />
                    <Box sx={{ cursor: 'crosshair', touchAction: 'none' }}>
                      <SignatureCanvas
                        ref={signatureRef}
                        penColor={theme.palette.mode === 'dark' ? '#fff' : '#1a1a2e'}
                        canvasProps={{
                          width: isMobile ? 340 : 600,
                          height: 180,
                          style: {
                            display: 'block',
                            margin: '0 auto',
                            background: theme.palette.mode === 'dark' ? '#1e1e2e' : '#fafafa',
                          },
                        }}
                        onEnd={handleSignatureEnd}
                      />
                    </Box>
                  </Paper>

                  {!signatureEmpty && (
                    <TextField
                      label="Notas de completado (opcional)"
                      multiline
                      rows={3}
                      fullWidth
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      placeholder="Observaciones sobre la realización del entrenamiento..."
                    />
                  )}
                </Box>
              </CustomTabPanel>
            </Box>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
          </Grid>
          <Grid item xs={12} md={3} lg={3} xl={2} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" color="secondary" size="medium" fullWidth onClick={handleCancel}>
              <Typography variant="body2" component="span" fontWeight={400} color="gray.700">
                Cancelar
              </Typography>
            </Button>
          </Grid>
          <Grid item xs={12} md={3} lg={3} xl={6} />
          <Grid item xs={12} md={6} lg={6} xl={4} style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
            <Button
              variant="contained"
              color={willComplete ? 'success' : 'primary'}
              size="medium"
              fullWidth
              onClick={handleShowConfirmModal}
              disabled={!isFormValid || isLoading || completing}
              endIcon={willComplete ? <CheckCircleIcon fontSize="small" /> : <SaveIcon fontSize="small" />}
            >
              <Typography variant="body2" component="span" fontWeight={400} color="gray.700">
                {willComplete ? 'Guardar y Completar' : 'Guardar como Pendiente'}
              </Typography>
            </Button>
          </Grid>
          <Grid item xs={12} sx={{ marginTop: 5 }} />
        </Grid>
      </Container>

      {/* Modal de Confirmación */}
      <BootstrapDialog open={showConfirmModal} onClose={() => setShowConfirmModal(false)} fullWidth maxWidth="sm">
        <BootstrapDialogTitle id="confirm-dialog-title" onClose={() => setShowConfirmModal(false)}>
          <Typography variant="h6" component="span" fontWeight={400} color="#fff">
            Confirmar Creación de Certificación
          </Typography>
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Resumen de Información
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Estado final:</Typography>
              <Chip
                label={willComplete ? 'Completada' : 'Pendiente'}
                color={willComplete ? 'success' : 'default'}
                icon={willComplete ? <CheckCircleIcon /> : <HourglassEmptyIcon />}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Personal:</Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedPersonnel ? `${selectedPersonnel.employee_code} - ${selectedPersonnel.full_name}` : '-'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Tipo de Certificación:</Typography>
              <Typography variant="body1" fontWeight={500}>{selectedCertType?.name || '-'}</Typography>
            </Box>

            {formData.certification_number && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Número de Certificación:</Typography>
                <Typography variant="body1" fontWeight={500}>{formData.certification_number}</Typography>
              </Box>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Instructor / Autoridad Emisora:</Typography>
              <Typography variant="body1" fontWeight={500}>{formData.issuing_authority}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Fecha de Inicio:</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formData.issue_date ? format(new Date(formData.issue_date), "dd 'de' MMMM 'de' yyyy", { locale: es }) : '-'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Fecha de Fin / Vencimiento:</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formData.expiration_date ? format(new Date(formData.expiration_date), "dd 'de' MMMM 'de' yyyy", { locale: es }) : '-'}
                </Typography>
              </Grid>
            </Grid>

            {willComplete && (
              <Alert severity="success" sx={{ mt: 2 }} icon={<CheckCircleIcon />}>
                Se capturará la firma y la certificación quedará como <strong>Completada</strong>.
              </Alert>
            )}

            {formData.notes && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">Notas:</Typography>
                <Typography variant="body1" fontWeight={500}>{formData.notes}</Typography>
              </Box>
            )}

            {formData.certificate_document && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">Documento Adjunto:</Typography>
                <Typography variant="body1" fontWeight={500}>{formData.certificate_document.name}</Typography>
              </Box>
            )}

            {!willComplete && (
              <Alert severity="info" sx={{ mt: 3 }}>
                La certificación se guardará en estado <strong>Pendiente</strong>. Podrás completarla y firmarla desde el detalle.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="secondary" size="medium" onClick={() => setShowConfirmModal(false)}>
            <Typography variant="body2" component="span" fontWeight={400} color="gray.700">
              Cancelar
            </Typography>
          </Button>
          <Button
            variant="contained"
            color={willComplete ? 'success' : 'primary'}
            size="medium"
            onClick={handleConfirmSubmit}
            disabled={isLoading || completing}
            startIcon={isLoading || completing ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            <Typography variant="body2" component="span" fontWeight={400} color="gray.700">
              {isLoading || completing ? 'Guardando...' : willComplete ? 'Confirmar y Completar' : 'Confirmar y Guardar'}
            </Typography>
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </LocalizationProvider>
  );
};
