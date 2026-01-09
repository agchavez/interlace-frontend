import {
  Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography
} from '@mui/material';
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

interface OvertimeFormProps {
  value: OvertimeCreatePayload;
  onChange: (value: OvertimeCreatePayload) => void;
}

export const OvertimeForm = ({ value, onChange }: OvertimeFormProps) => {
  const handleChange = (field: keyof OvertimeCreatePayload, fieldValue: unknown) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Detalles de Horas Extra
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
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
          </Grid>

          <Grid item xs={12} md={6}>
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
