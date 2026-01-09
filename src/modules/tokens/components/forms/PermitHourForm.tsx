import { useEffect } from 'react';
import {
  Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Switch, Typography
} from '@mui/material';
import { TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
  PermitHourReason,
  PermitHourReasonLabels,
  PermitHourCreatePayload
} from '../../interfaces/token';

interface PermitHourFormProps {
  value: PermitHourCreatePayload;
  onChange: (value: PermitHourCreatePayload) => void;
}

export const PermitHourForm = ({ value, onChange }: PermitHourFormProps) => {
  const handleChange = (field: keyof PermitHourCreatePayload, fieldValue: unknown) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const handleTimeChange = (field: 'exit_time' | 'expected_return_time', time: Dayjs | null) => {
    if (time) {
      handleChange(field, time.format('HH:mm'));
    }
  };

  // Calculate hours when times change
  useEffect(() => {
    if (value.exit_time && value.expected_return_time) {
      const [exitHour, exitMin] = value.exit_time.split(':').map(Number);
      const [returnHour, returnMin] = value.expected_return_time.split(':').map(Number);

      let exitMinutes = exitHour * 60 + exitMin;
      let returnMinutes = returnHour * 60 + returnMin;

      // If return is before exit, assume next day
      if (returnMinutes <= exitMinutes) {
        returnMinutes += 24 * 60;
      }

      const diffHours = (returnMinutes - exitMinutes) / 60;
      if (diffHours !== value.hours_requested) {
        handleChange('hours_requested', Number(diffHours.toFixed(2)));
      }
    }
  }, [value.exit_time, value.expected_return_time]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Detalles del Permiso por Hora
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Motivo</InputLabel>
              <Select
                value={value.reason_type || ''}
                label="Motivo"
                onChange={(e) => handleChange('reason_type', e.target.value)}
              >
                {Object.entries(PermitHourReasonLabels).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={value.with_pay ?? true}
                  onChange={(e) => handleChange('with_pay', e.target.checked)}
                />
              }
              label="Con Goce de Sueldo"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TimePicker
              label="Hora de Salida"
              value={value.exit_time ? dayjs(value.exit_time, 'HH:mm') : null}
              onChange={(time) => handleTimeChange('exit_time', time)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                },
              }}
              ampm={false}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TimePicker
              label="Hora de Retorno"
              value={value.expected_return_time ? dayjs(value.expected_return_time, 'HH:mm') : null}
              onChange={(time) => handleTimeChange('expected_return_time', time)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                },
              }}
              ampm={false}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Horas Solicitadas"
              value={value.hours_requested || ''}
              onChange={(e) => handleChange('hours_requested', Number(e.target.value))}
              inputProps={{ step: 0.5, min: 0.5, max: 8 }}
              InputProps={{
                readOnly: true,
              }}
              helperText="Calculado automáticamente"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Destino (opcional)"
              value={value.destination || ''}
              onChange={(e) => handleChange('destination', e.target.value)}
              placeholder="Lugar al que se dirigirá..."
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
              placeholder="Información adicional sobre el motivo del permiso..."
            />
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};
