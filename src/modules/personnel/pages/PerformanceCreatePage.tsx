import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Divider,
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
  Rating,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useCreatePerformanceMetricMutation, useGetPersonnelProfilesQuery } from '../services/personnelApi';
import { toast } from 'sonner';
import BootstrapDialogTitle from '../../ui/components/BootstrapDialogTitle';
import { format } from 'date-fns';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

interface PerformanceFormData {
  personnel?: number;
  evaluation_date?: string;
  period?: string;
  productivity_score?: number;
  quality_score?: number;
  teamwork_score?: number;
  punctuality_score?: number;
  safety_score?: number;
  overall_score?: number;
  comments?: string;
}

export const PerformanceCreatePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState<PerformanceFormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [createPerformance, { isLoading }] = useCreatePerformanceMetricMutation();

  // Cargar catálogos
  const { data: personnelData } = useGetPersonnelProfilesQuery({ is_active: true, limit: 1000, offset: 0 });

  const personnelList = personnelData?.results || [];

  // Precargar personnel si viene en la URL
  React.useEffect(() => {
    const personnelId = searchParams.get('personnel');
    if (personnelId && personnelList.length > 0) {
      const personnelIdNum = parseInt(personnelId, 10);
      const personnel = personnelList.find((p: any) => p.id === personnelIdNum);
      if (personnel) {
        setFormData(prev => ({ ...prev, personnel: personnelIdNum }));
      }
    }
  }, [searchParams, personnelList]);

  const periods = [
    { value: 'WEEKLY', label: 'Semanal' },
    { value: 'MONTHLY', label: 'Mensual' },
    { value: 'QUARTERLY', label: 'Trimestral' },
    { value: 'ANNUAL', label: 'Anual' },
  ];

  // Calcular puntuación general automáticamente
  React.useEffect(() => {
    const scores = [
      formData.productivity_score,
      formData.quality_score,
      formData.teamwork_score,
      formData.punctuality_score,
      formData.safety_score,
    ].filter((s) => s !== undefined && s !== null) as number[];

    if (scores.length > 0) {
      const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      updateFormData({ overall_score: Math.round(avg * 10) / 10 });
    }
  }, [
    formData.productivity_score,
    formData.quality_score,
    formData.teamwork_score,
    formData.punctuality_score,
    formData.safety_score,
  ]);

  const handleCancel = () => {
    navigate('/personnel/performance');
  };

  // Validar si el formulario está completo
  const isFormValid = useMemo(() => {
    return !!(
      formData.personnel &&
      formData.evaluation_date &&
      formData.period &&
      formData.productivity_score !== undefined &&
      formData.quality_score !== undefined &&
      formData.teamwork_score !== undefined &&
      formData.punctuality_score !== undefined &&
      formData.safety_score !== undefined
    );
  }, [formData]);

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.personnel) newErrors.personnel = 'Personal requerido';
    if (!formData.evaluation_date) newErrors.evaluation_date = 'Fecha de evaluación requerida';
    if (!formData.period) newErrors.period = 'Período requerido';
    if (formData.productivity_score === undefined) newErrors.productivity_score = 'Puntuación de productividad requerida';
    if (formData.quality_score === undefined) newErrors.quality_score = 'Puntuación de calidad requerida';
    if (formData.teamwork_score === undefined) newErrors.teamwork_score = 'Puntuación de trabajo en equipo requerida';
    if (formData.punctuality_score === undefined) newErrors.punctuality_score = 'Puntuación de puntualidad requerida';
    if (formData.safety_score === undefined) newErrors.safety_score = 'Puntuación de seguridad requerida';

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
    try {
      await createPerformance(formData as any).unwrap();
      toast.success('Evaluación de desempeño creada exitosamente');
      setShowConfirmModal(false);
      navigate('/personnel/performance');
    } catch (error: any) {
      console.error('Error al crear evaluación:', error);
      toast.error(error?.data?.detail || 'Error al crear la evaluación');
      setShowConfirmModal(false);
    }
  };

  const updateFormData = (data: Partial<PerformanceFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const selectedPersonnel = personnelList.find((p: any) => p.id === formData.personnel);
  const isPersonnelPrecargado = !!searchParams.get('personnel');
  const selectedPeriod = periods.find((p) => p.value === formData.period);

  const getScoreColor = (score: number | undefined) => {
    if (score === undefined) return 'text.secondary';
    if (score >= 4.5) return '#4caf50';
    if (score >= 3.5) return '#ff9800';
    return '#f44336';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Container maxWidth="xl">
        <Grid container spacing={1} sx={{ marginTop: 2 }}>
          {/* Header */}
          <Grid item xs={12}>
            <Typography variant="h5" component="h1" fontWeight={400}>
              Nueva Evaluación de Desempeño
            </Typography>
            <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
          </Grid>

          <Grid item xs={12} md={8} lg={9} xl={10}></Grid>
          <Grid
            item
            xs={12}
            md={4}
            lg={3}
            xl={2}
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              fullWidth
              onClick={handleCancel}
              startIcon={<ArrowBackIcon color="inherit" fontSize="small" />}
            >
              <Typography variant="body2" component="span" fontWeight={400} color={"gray.700"}>
                Volver al Listado
              </Typography>
            </Button>
          </Grid>

          {/* Form */}
          <Grid item xs={12}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, py: 3 }}>
              {/* Selección de Personal */}
              <Autocomplete
                options={personnelList}
                getOptionLabel={(option: any) => `${option.employee_code} - ${option.full_name}`}
                value={selectedPersonnel || null}
                onChange={(_, newValue: any) => updateFormData({ personnel: newValue?.id })}
                disabled={isPersonnelPrecargado}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={isPersonnelPrecargado ? "Personal a Evaluar (Precargado)" : "Personal a Evaluar"}
                    required
                    error={!!errors.personnel}
                    helperText={isPersonnelPrecargado ? "Este campo fue precargado automáticamente" : errors.personnel}
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
                sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
              />

              {/* Fecha de Evaluación */}
              <DatePicker
                label="Fecha de Evaluación *"
                value={formData.evaluation_date ? new Date(formData.evaluation_date) : null}
                onChange={(newValue) => {
                  const dateStr = newValue ? newValue.toISOString().split('T')[0] : '';
                  updateFormData({ evaluation_date: dateStr });
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: !!errors.evaluation_date,
                    helperText: errors.evaluation_date,
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

              {/* Período */}
              <Autocomplete
                options={periods}
                getOptionLabel={(option) => option.label}
                value={selectedPeriod || null}
                onChange={(_, newValue) => updateFormData({ period: newValue?.value })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Período"
                    required
                    error={!!errors.period}
                    helperText={errors.period}
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <AccessTimeIcon fontSize="small" />
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

              {/* Divider */}
              <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Métricas de Desempeño
                </Typography>
              </Box>

              {/* Productividad */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Productividad *
                </Typography>
                <Rating
                  value={formData.productivity_score || 0}
                  precision={0.5}
                  size="large"
                  onChange={(_, newValue) => updateFormData({ productivity_score: newValue || 0 })}
                  icon={<StarIcon fontSize="inherit" />}
                  emptyIcon={<StarIcon fontSize="inherit" />}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: getScoreColor(formData.productivity_score) }}>
                  Puntuación: {formData.productivity_score?.toFixed(1) || '0.0'} / 5.0
                </Typography>
                {errors.productivity_score && (
                  <FormHelperText error>{errors.productivity_score}</FormHelperText>
                )}
              </Box>

              {/* Calidad */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Calidad del Trabajo *
                </Typography>
                <Rating
                  value={formData.quality_score || 0}
                  precision={0.5}
                  size="large"
                  onChange={(_, newValue) => updateFormData({ quality_score: newValue || 0 })}
                  icon={<StarIcon fontSize="inherit" />}
                  emptyIcon={<StarIcon fontSize="inherit" />}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: getScoreColor(formData.quality_score) }}>
                  Puntuación: {formData.quality_score?.toFixed(1) || '0.0'} / 5.0
                </Typography>
                {errors.quality_score && (
                  <FormHelperText error>{errors.quality_score}</FormHelperText>
                )}
              </Box>

              {/* Trabajo en Equipo */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Trabajo en Equipo *
                </Typography>
                <Rating
                  value={formData.teamwork_score || 0}
                  precision={0.5}
                  size="large"
                  onChange={(_, newValue) => updateFormData({ teamwork_score: newValue || 0 })}
                  icon={<StarIcon fontSize="inherit" />}
                  emptyIcon={<StarIcon fontSize="inherit" />}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: getScoreColor(formData.teamwork_score) }}>
                  Puntuación: {formData.teamwork_score?.toFixed(1) || '0.0'} / 5.0
                </Typography>
                {errors.teamwork_score && (
                  <FormHelperText error>{errors.teamwork_score}</FormHelperText>
                )}
              </Box>

              {/* Puntualidad */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Puntualidad y Asistencia *
                </Typography>
                <Rating
                  value={formData.punctuality_score || 0}
                  precision={0.5}
                  size="large"
                  onChange={(_, newValue) => updateFormData({ punctuality_score: newValue || 0 })}
                  icon={<StarIcon fontSize="inherit" />}
                  emptyIcon={<StarIcon fontSize="inherit" />}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: getScoreColor(formData.punctuality_score) }}>
                  Puntuación: {formData.punctuality_score?.toFixed(1) || '0.0'} / 5.0
                </Typography>
                {errors.punctuality_score && (
                  <FormHelperText error>{errors.punctuality_score}</FormHelperText>
                )}
              </Box>

              {/* Seguridad */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Seguridad y Cumplimiento *
                </Typography>
                <Rating
                  value={formData.safety_score || 0}
                  precision={0.5}
                  size="large"
                  onChange={(_, newValue) => updateFormData({ safety_score: newValue || 0 })}
                  icon={<StarIcon fontSize="inherit" />}
                  emptyIcon={<StarIcon fontSize="inherit" />}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: getScoreColor(formData.safety_score) }}>
                  Puntuación: {formData.safety_score?.toFixed(1) || '0.0'} / 5.0
                </Typography>
                {errors.safety_score && (
                  <FormHelperText error>{errors.safety_score}</FormHelperText>
                )}
              </Box>

              {/* Puntuación General (calculada) */}
              <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <Alert severity="info" icon={<StarIcon />}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Puntuación General: {formData.overall_score?.toFixed(1) || '0.0'} / 5.0
                  </Typography>
                  <Typography variant="caption">
                    (Calculada automáticamente como promedio de las métricas)
                  </Typography>
                </Alert>
              </Box>

              {/* Comentarios */}
              <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <TextField
                  label="Comentarios y Observaciones"
                  multiline
                  rows={4}
                  value={formData.comments || ''}
                  onChange={(e) => updateFormData({ comments: e.target.value })}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Agregue comentarios adicionales sobre el desempeño del empleado..."
                />
              </Box>
            </Box>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
          </Grid>
          <Grid item xs={12} md={3} lg={3} xl={2} style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="outlined" color="secondary" size="medium" fullWidth onClick={handleCancel}>
              <Typography variant="body2" component="span" fontWeight={400} color={"gray.700"}>
                Cancelar
              </Typography>
            </Button>
          </Grid>
          <Grid item xs={12} md={3} lg={3} xl={6}></Grid>
          <Grid item xs={12} md={6} lg={6} xl={4} style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
            <Button
              variant="contained"
              color="primary"
              size="medium"
              fullWidth
              onClick={handleShowConfirmModal}
              disabled={!isFormValid || isLoading}
              endIcon={<SaveIcon color="inherit" fontSize="small" />}
            >
              <Typography variant="body2" component="span" fontWeight={400} color={"gray.700"}>
                Guardar Evaluación
              </Typography>
            </Button>
          </Grid>
          <Grid item xs={12} sx={{ marginTop: 5 }}></Grid>
        </Grid>
      </Container>

      {/* Modal de Confirmación */}
      <BootstrapDialog open={showConfirmModal} onClose={() => setShowConfirmModal(false)} fullWidth maxWidth="sm">
        <BootstrapDialogTitle id="confirm-dialog-title" onClose={() => setShowConfirmModal(false)}>
          <Typography variant="h6" component="span" fontWeight={400} color={'#fff'}>
            Confirmar Evaluación de Desempeño
          </Typography>
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Resumen de Evaluación
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Personal:</Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedPersonnel ? `${selectedPersonnel.employee_code} - ${selectedPersonnel.full_name}` : '-'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Fecha de Evaluación:</Typography>
              <Typography variant="body1" fontWeight={500}>
                {formData.evaluation_date ? format(new Date(formData.evaluation_date), "dd 'de' MMMM 'de' yyyy", { locale: es }) : '-'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Período:</Typography>
              <Typography variant="body1" fontWeight={500}>{selectedPeriod?.label || '-'}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Métricas de Desempeño
            </Typography>

            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Productividad:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Rating value={formData.productivity_score || 0} size="small" readOnly />
                  <Typography variant="body2" fontWeight={600}>{formData.productivity_score?.toFixed(1)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Calidad:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Rating value={formData.quality_score || 0} size="small" readOnly />
                  <Typography variant="body2" fontWeight={600}>{formData.quality_score?.toFixed(1)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Trabajo en Equipo:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Rating value={formData.teamwork_score || 0} size="small" readOnly />
                  <Typography variant="body2" fontWeight={600}>{formData.teamwork_score?.toFixed(1)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Puntualidad:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Rating value={formData.punctuality_score || 0} size="small" readOnly />
                  <Typography variant="body2" fontWeight={600}>{formData.punctuality_score?.toFixed(1)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Seguridad:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Rating value={formData.safety_score || 0} size="small" readOnly />
                  <Typography variant="body2" fontWeight={600}>{formData.safety_score?.toFixed(1)}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Alert severity="success" sx={{ mt: 2 }} icon={<StarIcon />}>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                Puntuación General: {formData.overall_score?.toFixed(1)} / 5.0
              </Typography>
            </Alert>

            {formData.comments && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">Comentarios:</Typography>
                <Typography variant="body2" fontWeight={500}>{formData.comments}</Typography>
              </Box>
            )}

            <Alert severity="info" sx={{ mt: 3 }}>
              ¿Está seguro de que desea guardar esta evaluación de desempeño?
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="secondary" size="medium" onClick={() => setShowConfirmModal(false)}>
            <Typography variant="body2" component="span" fontWeight={400} color={'gray.700'}>
              Cancelar
            </Typography>
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            onClick={handleConfirmSubmit}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            <Typography variant="body2" component="span" fontWeight={400} color={'gray.700'}>
              {isLoading ? 'Guardando...' : 'Confirmar y Guardar'}
            </Typography>
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </LocalizationProvider>
  );
};
