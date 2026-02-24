import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  TextField,
  Autocomplete,
  Rating,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import StarIcon from '@mui/icons-material/Star';
import {
  useGetPersonnelProfilesQuery,
  useGetMetricTypesForPositionQuery,
  useCreateEvaluationMutation,
} from '../services/personnelApi';
import { toast } from 'sonner';

const PERIODS = [
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'MONTHLY', label: 'Mensual' },
  { value: 'QUARTERLY', label: 'Trimestral' },
  { value: 'ANNUAL', label: 'Anual' },
];

interface MetricValue {
  metric_type: number;
  numeric_value?: number | null;
  text_value?: string;
  boolean_value?: boolean | null;
  comments?: string;
}

interface FormData {
  personnel?: number;
  evaluation_date?: string;
  period: string;
  comments: string;
  is_draft: boolean;
  metric_values: MetricValue[];
}

export const PerformanceEvaluationCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState<FormData>({
    personnel: undefined,
    evaluation_date: new Date().toISOString().split('T')[0],
    period: 'MONTHLY',
    comments: '',
    is_draft: true,
    metric_values: [],
  });

  const [selectedPersonnel, setSelectedPersonnel] = useState<any>(null);
  const [metricValues, setMetricValues] = useState<Record<number, MetricValue>>({});

  // Cargar personal
  const { data: personnelData } = useGetPersonnelProfilesQuery({
    is_active: true,
    limit: 1000,
    offset: 0,
  });

  const personnelList = personnelData?.results || [];

  // Cargar métricas según el tipo de posición del personal seleccionado
  const { data: metrics = [], isLoading: isLoadingMetrics } = useGetMetricTypesForPositionQuery(
    selectedPersonnel?.position_type || '',
    { skip: !selectedPersonnel?.position_type }
  );

  // Precargar personnel si viene en la URL
  useEffect(() => {
    const personnelId = searchParams.get('personnel');
    if (personnelId && personnelList.length > 0) {
      const personnelIdNum = parseInt(personnelId, 10);
      const personnel = personnelList.find((p: any) => p.id === personnelIdNum);
      if (personnel) {
        setSelectedPersonnel(personnel);
        setFormData((prev) => ({ ...prev, personnel: personnelIdNum }));
      }
    }
  }, [searchParams, personnelList]);

  // Inicializar valores de métricas cuando se cargan
  useEffect(() => {
    if (metrics.length > 0) {
      const initialValues: Record<number, MetricValue> = {};
      metrics.forEach((metric: any) => {
        initialValues[metric.id] = {
          metric_type: metric.id,
          numeric_value: null,
          text_value: '',
          boolean_value: null,
          comments: '',
        };
      });
      setMetricValues(initialValues);
    }
  }, [metrics]);

  const handlePersonnelChange = (_: any, value: any | null) => {
    setSelectedPersonnel(value);
    setFormData({ ...formData, personnel: value?.id });
    // Reset metric values cuando cambia el personal
    setMetricValues({});
  };

  const handleMetricValueChange = (metricId: number, field: string, value: any) => {
    setMetricValues((prev) => ({
      ...prev,
      [metricId]: {
        ...prev[metricId],
        [field]: value,
      },
    }));
  };

  const validateForm = () => {
    if (!formData.personnel) {
      toast.error('Debe seleccionar un empleado');
      return false;
    }

    if (!formData.evaluation_date) {
      toast.error('Debe seleccionar una fecha de evaluación');
      return false;
    }

    // Validar que las métricas requeridas estén completas
    const requiredMetrics = metrics.filter((m: any) => m.is_required);
    const missingMetrics = requiredMetrics.filter((metric: any) => {
      const value = metricValues[metric.id];
      if (!value) return true;

      if (metric.metric_type === 'NUMERIC' || metric.metric_type === 'RATING' || metric.metric_type === 'PERCENTAGE') {
        return value.numeric_value === null || value.numeric_value === undefined;
      } else if (metric.metric_type === 'BOOLEAN') {
        return value.boolean_value === null || value.boolean_value === undefined;
      } else if (metric.metric_type === 'TEXT') {
        return !value.text_value || value.text_value.trim() === '';
      }
      return false;
    });

    if (missingMetrics.length > 0) {
      const names = missingMetrics.map((m: any) => m.name).join(', ');
      toast.error(`Faltan métricas requeridas: ${names}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!validateForm()) return;

    // Convertir metricValues a array
    const metric_values_array = Object.values(metricValues).filter((mv) => {
      // Solo incluir métricas que tengan algún valor
      return mv.numeric_value !== null || mv.text_value !== '' || mv.boolean_value !== null;
    });

    const dataToSend = {
      ...formData,
      is_draft: isDraft,
      metric_values: metric_values_array,
    };

    try {
      await createEvaluation(dataToSend).unwrap();
      toast.success(isDraft ? 'Evaluación guardada como borrador' : 'Evaluación enviada exitosamente');
      navigate('/personnel/performance');
    } catch (error: any) {
      const errorMessage =
        error?.data?.detail?.message ||
        error?.data?.mensage ||
        error?.data?.detail ||
        'Error al crear la evaluación';
      toast.error(errorMessage);
    }
  };

  const [createEvaluation, { isLoading }] = useCreateEvaluationMutation();

  const renderMetricField = (metric: any) => {
    const value = metricValues[metric.id] || {
      metric_type: metric.id,
      numeric_value: null,
      text_value: '',
      boolean_value: null,
      comments: '',
    };

    switch (metric.metric_type) {
      case 'RATING':
        return (
          <Grid item xs={12} md={6} key={metric.id}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {metric.name}
                    {metric.is_required && <span style={{ color: 'red' }}> *</span>}
                  </Typography>
                  <Chip label={`Peso: ${metric.weight}`} size="small" color="primary" variant="outlined" />
                </Box>
                {metric.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {metric.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Rating
                    value={value.numeric_value || 0}
                    onChange={(_, newValue) => handleMetricValueChange(metric.id, 'numeric_value', newValue)}
                    max={5}
                    size="large"
                    icon={<StarIcon fontSize="inherit" />}
                  />
                  <Typography variant="h6">{value.numeric_value || 0}/5</Typography>
                </Box>
                {metric.help_text && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {metric.help_text}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        );

      case 'NUMERIC':
      case 'PERCENTAGE':
        return (
          <Grid item xs={12} md={6} key={metric.id}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {metric.name}
                    {metric.is_required && <span style={{ color: 'red' }}> *</span>}
                  </Typography>
                  <Chip label={`Peso: ${metric.weight}`} size="small" color="primary" variant="outlined" />
                </Box>
                {metric.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {metric.description}
                  </Typography>
                )}
                <TextField
                  type="number"
                  fullWidth
                  size="small"
                  value={value.numeric_value || ''}
                  onChange={(e) =>
                    handleMetricValueChange(metric.id, 'numeric_value', parseFloat(e.target.value) || null)
                  }
                  label={metric.unit ? `Valor (${metric.unit})` : 'Valor'}
                  inputProps={{
                    min: metric.min_value,
                    max: metric.max_value,
                  }}
                  helperText={
                    metric.help_text ||
                    (metric.min_value !== null && metric.max_value !== null
                      ? `Rango: ${metric.min_value} - ${metric.max_value}`
                      : '')
                  }
                />
              </CardContent>
            </Card>
          </Grid>
        );

      case 'BOOLEAN':
        return (
          <Grid item xs={12} md={6} key={metric.id}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {metric.name}
                    {metric.is_required && <span style={{ color: 'red' }}> *</span>}
                  </Typography>
                  <Chip label={`Peso: ${metric.weight}`} size="small" color="primary" variant="outlined" />
                </Box>
                {metric.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {metric.description}
                  </Typography>
                )}
                <FormControlLabel
                  control={
                    <Switch
                      checked={value.boolean_value || false}
                      onChange={(e) => handleMetricValueChange(metric.id, 'boolean_value', e.target.checked)}
                    />
                  }
                  label={value.boolean_value ? 'Sí' : 'No'}
                />
                {metric.help_text && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {metric.help_text}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        );

      case 'TEXT':
        return (
          <Grid item xs={12} key={metric.id}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {metric.name}
                    {metric.is_required && <span style={{ color: 'red' }}> *</span>}
                  </Typography>
                  <Chip label={`Peso: ${metric.weight}`} size="small" color="primary" variant="outlined" />
                </Box>
                {metric.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {metric.description}
                  </Typography>
                )}
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  value={value.text_value || ''}
                  onChange={(e) => handleMetricValueChange(metric.id, 'text_value', e.target.value)}
                  label="Comentarios"
                  helperText={metric.help_text}
                />
              </CardContent>
            </Card>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Container maxWidth="xl">
        <Grid container spacing={3} sx={{ marginTop: 2 }}>
          {/* Header */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" component="h1" fontWeight={400}>
                Nueva Evaluación de Desempeño
              </Typography>
              <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/personnel/performance')}>
                Volver
              </Button>
            </Box>
            <Divider sx={{ marginTop: 2, marginBottom: 3 }} />
          </Grid>

          {/* Información General */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Información General
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={personnelList}
                      getOptionLabel={(option) =>
                        `${option.employee_code} - ${option.full_name} (${option.position || 'Sin posición'})`
                      }
                      value={selectedPersonnel}
                      onChange={handlePersonnelChange}
                      renderInput={(params) => (
                        <TextField {...params} label="Empleado a Evaluar" required helperText="Seleccione el empleado" size="small" />
                      )}
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Fecha de Evaluación"
                      value={formData.evaluation_date ? new Date(formData.evaluation_date) : null}
                      onChange={(newValue) => {
                        const dateStr = newValue ? newValue.toISOString().split('T')[0] : '';
                        setFormData({ ...formData, evaluation_date: dateStr });
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          size: 'small',
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required size="small">
                      <InputLabel>Período</InputLabel>
                      <Select
                        value={formData.period}
                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                        label="Período"
                        size="small"
                      >
                        {PERIODS.map((period) => (
                          <MenuItem key={period.value} value={period.value}>
                            {period.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {selectedPersonnel && (
                    <Grid item xs={12} md={6}>
                      <Alert severity="info">
                        <strong>Posición:</strong> {selectedPersonnel.position || 'Sin posición'}
                        <br />
                        <strong>Tipo:</strong> {selectedPersonnel.position_type || 'No especificado'}
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Métricas */}
          {selectedPersonnel && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Métricas de Evaluación
              </Typography>
              {isLoadingMetrics ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : metrics.length === 0 ? (
                <Alert severity="warning">
                  No hay métricas configuradas para el tipo de posición "{selectedPersonnel.position_type}". Por favor,
                  configure las métricas en Mantenimiento.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {metrics.map((metric: any) => renderMetricField(metric))}
                </Grid>
              )}
            </Grid>
          )}

          {/* Comentarios Generales */}
          {selectedPersonnel && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Comentarios Generales
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    size="small"
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    label="Comentarios adicionales"
                    helperText="Observaciones generales sobre el desempeño del empleado"
                  />
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Botones de Acción */}
          <Grid item xs={12}>
            <Divider sx={{ marginBottom: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate('/personnel/performance')}>
                Cancelar
              </Button>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={() => handleSubmit(true)}
                disabled={isLoading || !selectedPersonnel}
              >
                Guardar como Borrador
              </Button>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={() => handleSubmit(false)}
                disabled={isLoading || !selectedPersonnel}
              >
                Enviar Evaluación
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
};
