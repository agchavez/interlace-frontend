import { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Grid,
  Autocomplete,
  Alert,
  styled,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  useGetMetricTypesQuery,
  useCreateMetricTypeMutation,
  useUpdateMetricTypeMutation,
  useDeleteMetricTypeMutation,
} from '../../personnel/services/personnelApi';
import { toast } from 'sonner';
import BootstrapDialogTitle from '../../ui/components/BootstrapDialogTitle';
import { tableBase } from '../../ui';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const METRIC_TYPES = [
  { value: 'NUMERIC', label: 'Numérico' },
  { value: 'RATING', label: 'Calificación (1-5)' },
  { value: 'PERCENTAGE', label: 'Porcentaje (0-100)' },
  { value: 'BOOLEAN', label: 'Sí/No' },
  { value: 'TEXT', label: 'Texto' },
];

const POSITION_TYPES = [
  { value: 'PICKER', label: 'Picker' },
  { value: 'COUNTER', label: 'Contador' },
  { value: 'OPM', label: 'Operador de Montacargas' },
  { value: 'YARD_DRIVER', label: 'Conductor de Patio' },
  { value: 'LOADER', label: 'Cargador' },
  { value: 'WAREHOUSE_ASSISTANT', label: 'Ayudante de Almacén' },
  { value: 'SECURITY_GUARD', label: 'Guardia de Seguridad' },
  { value: 'DELIVERY_DRIVER', label: 'Conductor de Delivery' },
  { value: 'ADMINISTRATIVE', label: 'Administrativo' },
  { value: 'OTHER', label: 'Otro' },
];

interface FormData {
  name: string;
  code: string;
  description: string;
  metric_type: string;
  unit: string;
  min_value: number | null;
  max_value: number | null;
  weight: number;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  applicable_position_types: string[];
  help_text: string;
}

const initialFormData: FormData = {
  name: '',
  code: '',
  description: '',
  metric_type: 'NUMERIC',
  unit: '',
  min_value: null,
  max_value: null,
  weight: 10,
  is_required: false,
  is_active: true,
  display_order: 0,
  applicable_position_types: [],
  help_text: '',
};

export const MetricTypesPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMetric, setEditingMetric] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading, refetch } = useGetMetricTypesQuery({});
  const metrics = data?.results || [];
  const [createMetric, { isLoading: isCreating }] = useCreateMetricTypeMutation();
  const [updateMetric, { isLoading: isUpdating }] = useUpdateMetricTypeMutation();
  const [deleteMetric] = useDeleteMetricTypeMutation();

  const handleOpenDialog = (metric?: any) => {
    if (metric) {
      setEditingMetric(metric);
      setFormData({
        name: metric.name,
        code: metric.code,
        description: metric.description || '',
        metric_type: metric.metric_type,
        unit: metric.unit || '',
        min_value: metric.min_value,
        max_value: metric.max_value,
        weight: metric.weight,
        is_required: metric.is_required,
        is_active: metric.is_active,
        display_order: metric.display_order,
        applicable_position_types: metric.applicable_position_types || [],
        help_text: metric.help_text || '',
      });
    } else {
      setEditingMetric(null);
      setFormData(initialFormData);
    }
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMetric(null);
    setFormData(initialFormData);
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nombre es requerido';
    if (!formData.code.trim()) newErrors.code = 'Código es requerido';
    if (formData.weight < 0 || formData.weight > 100) {
      newErrors.weight = 'El peso debe estar entre 0 y 100';
    }

    if (formData.min_value !== null && formData.max_value !== null) {
      if (formData.min_value >= formData.max_value) {
        newErrors.max_value = 'El valor máximo debe ser mayor que el mínimo';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (editingMetric) {
        await updateMetric({ id: editingMetric.id, data: formData }).unwrap();
        toast.success('Métrica actualizada exitosamente');
      } else {
        await createMetric(formData).unwrap();
        toast.success('Métrica creada exitosamente');
      }
      handleCloseDialog();
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.detail?.message || error?.data?.mensage || error?.data?.detail || 'Error al guardar la métrica';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta métrica?')) return;

    try {
      await deleteMetric(id).unwrap();
      toast.success('Métrica eliminada exitosamente');
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.detail?.message || error?.data?.mensage || error?.data?.detail || 'Error al eliminar la métrica';
      toast.error(errorMessage);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'display_order',
      headerName: 'Orden',
      width: 80,
      renderCell: (params) => (
        <IconButton size="small" disabled>
          <DragIndicatorIcon />
        </IconButton>
      ),
    },
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 200 },
    { field: 'code', headerName: 'Código', width: 150 },
    {
      field: 'metric_type_display',
      headerName: 'Tipo',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={params.row.metric_type === 'RATING' ? 'primary' : 'default'}
        />
      ),
    },
    { field: 'unit', headerName: 'Unidad', width: 100 },
    { field: 'weight', headerName: 'Peso', width: 80 },
    {
      field: 'is_required',
      headerName: 'Requerida',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'Sí' : 'No'}
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'is_active',
      headerName: 'Activa',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'Sí' : 'No'}
          size="small"
          color={params.value ? 'success' : 'error'}
        />
      ),
    },
    {
      field: 'applicable_positions_count',
      headerName: 'Posiciones',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value === 0 ? 'Todas' : params.value}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleOpenDialog(params.row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={400}>
            Tipos de Métricas de Desempeño
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Configure las métricas que se utilizarán para evaluar el desempeño según el tipo de posición
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Métrica
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Métricas Automáticas:</strong> Las métricas se pueden alimentar automáticamente desde otros sistemas
        . Configure el tipo y unidad correctamente.
      </Alert>

      <Card>
        <DataGrid
          {...tableBase}
          rows={metrics}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: { pageSize: 15 },
            },
          }}
        />
      </Card>

      {/* Dialog para Crear/Editar */}
      <BootstrapDialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <BootstrapDialogTitle id="metric-dialog-title" onClose={handleCloseDialog}>
          {editingMetric ? 'Editar Métrica' : 'Nueva Métrica'}
        </BootstrapDialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre"
                fullWidth
                size="small"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name || 'Ejemplo: Productividad, Pallets Movidos'}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Código"
                fullWidth
                size="small"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                error={!!errors.code}
                helperText={errors.code || 'Código único (snake_case)'}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Descripción"
                fullWidth
                size="small"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo de Métrica</InputLabel>
                <Select
                  value={formData.metric_type}
                  onChange={(e) => setFormData({ ...formData, metric_type: e.target.value })}
                  label="Tipo de Métrica"
                >
                  {METRIC_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Tipo de dato que almacenará esta métrica</FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Unidad"
                fullWidth
                size="small"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                helperText="Ej: pallets, horas, %, cajas"
              />
            </Grid>

            {(formData.metric_type === 'NUMERIC' || formData.metric_type === 'PERCENTAGE') && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Valor Mínimo"
                    type="number"
                    fullWidth
                    size="small"
                    value={formData.min_value || ''}
                    onChange={(e) => setFormData({ ...formData, min_value: e.target.value ? parseFloat(e.target.value) : null })}
                    helperText="Valor mínimo permitido (opcional)"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Valor Máximo"
                    type="number"
                    fullWidth
                    size="small"
                    value={formData.max_value || ''}
                    onChange={(e) => setFormData({ ...formData, max_value: e.target.value ? parseFloat(e.target.value) : null })}
                    error={!!errors.max_value}
                    helperText={errors.max_value || 'Valor máximo permitido (opcional)'}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                label="Peso"
                type="number"
                fullWidth
                size="small"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
                error={!!errors.weight}
                helperText={errors.weight || 'Importancia en el cálculo general (0-100)'}
                inputProps={{ min: 0, max: 100 }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Orden de Visualización"
                type="number"
                fullWidth
                size="small"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                helperText="Orden en que se muestra en formularios"
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                size="small"
                options={POSITION_TYPES}
                getOptionLabel={(option) => option.label}
                value={POSITION_TYPES.filter((pos) => formData.applicable_position_types.includes(pos.value))}
                onChange={(_, newValue) => {
                  setFormData({
                    ...formData,
                    applicable_position_types: newValue.map((v) => v.value),
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Posiciones Aplicables"
                    helperText="Deje vacío para aplicar a todas las posiciones"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Texto de Ayuda"
                fullWidth
                size="small"
                multiline
                rows={2}
                value={formData.help_text}
                onChange={(e) => setFormData({ ...formData, help_text: e.target.value })}
                helperText="Instrucciones para quien evalúa o carga datos"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_required}
                    onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                  />
                }
                label="Es Requerida"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Activa"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isCreating || isUpdating}
          >
            {editingMetric ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </Box>
  );
};
