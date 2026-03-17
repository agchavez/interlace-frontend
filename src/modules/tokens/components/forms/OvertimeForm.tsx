import {
  Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography, CircularProgress, Chip
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
  OvertimeType,
  OvertimeTypeLabels,
  OvertimeReason,
  OvertimeReasonLabels,
  OvertimeCreatePayload
} from '../../interfaces/token';
import {
  useGetOvertimeTypesQuery,
  useGetOvertimeReasonsQuery,
} from '../../services/tokenApi';

interface OvertimeFormProps {
  value: OvertimeCreatePayload;
  onChange: (value: OvertimeCreatePayload) => void;
}

export const OvertimeForm = ({ value, onChange }: OvertimeFormProps) => {
  const { data: typesData, isLoading: typesLoading, isError: typesError } = useGetOvertimeTypesQuery({ limit: 100 });
  const { data: reasonsData, isLoading: reasonsLoading, isError: reasonsError } = useGetOvertimeReasonsQuery({ limit: 100 });

  const overtimeTypes = typesData?.results?.filter(t => t.is_active) || [];
  const overtimeReasons = reasonsData?.results?.filter(r => r.is_active) || [];

  // Usar dinámico siempre que la API responda exitosamente, fallback solo si hay error
  const useDynamic = !typesError;
  const useDynamicReasons = !reasonsError;

  const handleChange = (field: keyof OvertimeCreatePayload, fieldValue: unknown) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const calculateTotalHours = (): number | null => {
    if (!value.start_time || !value.end_time) return null;
    const start = dayjs(`2000-01-01 ${value.start_time}`);
    let end = dayjs(`2000-01-01 ${value.end_time}`);
    if (end.isBefore(start)) end = end.add(1, 'day');
    return parseFloat((end.diff(start, 'minute') / 60).toFixed(2));
  };

  const totalHours = calculateTotalHours();

  const handleTypeChange = (typeModelId: number) => {
    const selectedType = overtimeTypes.find(t => t.id === typeModelId);
    onChange({
      ...value,
      overtime_type_model: typeModelId,
      pay_multiplier: selectedType ? Number(selectedType.default_multiplier) : value.pay_multiplier,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Detalles de Horas Extra
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            {useDynamic ? (
              <FormControl fullWidth size="small" disabled={typesLoading}>
                <InputLabel>Tipo de Hora Extra</InputLabel>
                <Select
                  value={value.overtime_type_model || ''}
                  label="Tipo de Hora Extra"
                  onChange={(e) => handleTypeChange(e.target.value as number)}
                  endAdornment={typesLoading ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null}
                >
                  {overtimeTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <FormControl fullWidth size="small">
                <InputLabel>Tipo de Hora Extra</InputLabel>
                <Select
                  value={value.overtime_type || OvertimeType.REGULAR}
                  label="Tipo de Hora Extra"
                  onChange={(e) => handleChange('overtime_type', e.target.value)}
                >
                  {Object.entries(OvertimeTypeLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            {useDynamicReasons ? (
              <FormControl fullWidth size="small" disabled={reasonsLoading}>
                <InputLabel>Motivo</InputLabel>
                <Select
                  value={value.reason_model || ''}
                  label="Motivo"
                  onChange={(e) => handleChange('reason_model', e.target.value)}
                  endAdornment={reasonsLoading ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null}
                >
                  {overtimeReasons.map((reason) => (
                    <MenuItem key={reason.id} value={reason.id}>{reason.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <FormControl fullWidth size="small">
                <InputLabel>Motivo</InputLabel>
                <Select
                  value={value.reason || ''}
                  label="Motivo"
                  onChange={(e) => handleChange('reason', e.target.value)}
                >
                  {Object.entries(OvertimeReasonLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <DatePicker
              label="Fecha"
              value={value.overtime_date ? dayjs(value.overtime_date) : null}
              onChange={(date) => handleChange('overtime_date', date?.format('YYYY-MM-DD'))}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TimePicker
              label="Hora Inicio"
              value={value.start_time ? dayjs(`2000-01-01 ${value.start_time}`) : null}
              onChange={(time) => handleChange('start_time', time?.format('HH:mm'))}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TimePicker
              label="Hora Fin"
              value={value.end_time ? dayjs(`2000-01-01 ${value.end_time}`) : null}
              onChange={(time) => handleChange('end_time', time?.format('HH:mm'))}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>

          {totalHours !== null && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
                <AccessTimeIcon color="info" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Total de horas:
                </Typography>
                <Chip
                  label={`${totalHours} hora${totalHours !== 1 ? 's' : ''}`}
                  color="info"
                  size="small"
                  variant="filled"
                />
              </Box>
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Multiplicador de Pago"
              type="number"
              inputProps={{ step: 0.1, min: 1 }}
              value={value.pay_multiplier ?? 1.5}
              onChange={(e) => handleChange('pay_multiplier', parseFloat(e.target.value))}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Detalle del Motivo"
              multiline
              rows={2}
              value={value.reason_detail || ''}
              onChange={(e) => handleChange('reason_detail', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Tarea Asignada"
              multiline
              rows={2}
              value={value.assigned_task || ''}
              onChange={(e) => handleChange('assigned_task', e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};
