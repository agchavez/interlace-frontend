import {
  Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
  RateChangeReason,
  RateChangeReasonLabels,
  RateChangeCreatePayload
} from '../../interfaces/token';

interface RateChangeFormProps {
  value: RateChangeCreatePayload;
  onChange: (value: RateChangeCreatePayload) => void;
}

export const RateChangeForm = ({ value, onChange }: RateChangeFormProps) => {
  const handleChange = (field: keyof RateChangeCreatePayload, fieldValue: unknown) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const rateDifference = (value.new_rate || 0) - (value.current_rate || 0);
  const percentageChange = value.current_rate
    ? ((rateDifference / value.current_rate) * 100).toFixed(2)
    : 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Detalles de Cambio de Tasa
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Motivo</InputLabel>
              <Select
                value={value.reason || ''}
                label="Motivo"
                onChange={(e) => handleChange('reason', e.target.value)}
              >
                {Object.entries(RateChangeReasonLabels).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Tipo de Tasa"
              value={value.rate_type || 'Horaria'}
              onChange={(e) => handleChange('rate_type', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Tasa Actual"
              type="number"
              inputProps={{ step: 0.01, min: 0 }}
              value={value.current_rate || ''}
              onChange={(e) => handleChange('current_rate', parseFloat(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Nueva Tasa"
              type="number"
              inputProps={{ step: 0.01, min: 0 }}
              value={value.new_rate || ''}
              onChange={(e) => handleChange('new_rate', parseFloat(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1, bgcolor: rateDifference > 0 ? 'success.light' : rateDifference < 0 ? 'error.light' : 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Diferencia
              </Typography>
              <Typography variant="h6">
                {rateDifference >= 0 ? '+' : ''}{rateDifference.toFixed(2)} ({percentageChange}%)
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Fecha Inicio"
              value={value.start_date ? dayjs(value.start_date) : null}
              onChange={(date) => handleChange('start_date', date?.format('YYYY-MM-DD'))}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Fecha Fin"
              value={value.end_date ? dayjs(value.end_date) : null}
              onChange={(date) => handleChange('end_date', date?.format('YYYY-MM-DD'))}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              minDate={value.start_date ? dayjs(value.start_date) : undefined}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Funciones Adicionales"
              multiline
              rows={2}
              value={value.additional_functions || ''}
              onChange={(e) => handleChange('additional_functions', e.target.value)}
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
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};
