import {
  Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Switch, Typography
} from '@mui/material';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
  ShiftChangeReason,
  ShiftChangeReasonLabels,
  ShiftChangeCreatePayload
} from '../../interfaces/token';
import { PersonnelProfileList } from '../../../../interfaces/personnel';

interface ShiftChangeFormProps {
  value: ShiftChangeCreatePayload;
  onChange: (value: ShiftChangeCreatePayload) => void;
  personnelList?: PersonnelProfileList[];
}

export const ShiftChangeForm = ({ value, onChange, personnelList = [] }: ShiftChangeFormProps) => {
  const handleChange = (field: keyof ShiftChangeCreatePayload, fieldValue: unknown) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Detalles de Cambio de Turno
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
                {Object.entries(ShiftChangeReasonLabels).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Fecha del Cambio"
              value={value.change_date ? dayjs(value.change_date) : null}
              onChange={(date) => handleChange('change_date', date?.format('YYYY-MM-DD'))}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>

          {/* Turno Actual */}
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Turno Actual
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Nombre del Turno"
              value={value.current_shift_name || ''}
              onChange={(e) => handleChange('current_shift_name', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TimePicker
              label="Hora Inicio"
              value={value.current_shift_start ? dayjs(`2000-01-01 ${value.current_shift_start}`) : null}
              onChange={(time) => handleChange('current_shift_start', time?.format('HH:mm'))}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TimePicker
              label="Hora Fin"
              value={value.current_shift_end ? dayjs(`2000-01-01 ${value.current_shift_end}`) : null}
              onChange={(time) => handleChange('current_shift_end', time?.format('HH:mm'))}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>

          {/* Nuevo Turno */}
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Nuevo Turno
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Nombre del Turno"
              value={value.new_shift_name || ''}
              onChange={(e) => handleChange('new_shift_name', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TimePicker
              label="Hora Inicio"
              value={value.new_shift_start ? dayjs(`2000-01-01 ${value.new_shift_start}`) : null}
              onChange={(time) => handleChange('new_shift_start', time?.format('HH:mm'))}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TimePicker
              label="Hora Fin"
              value={value.new_shift_end ? dayjs(`2000-01-01 ${value.new_shift_end}`) : null}
              onChange={(time) => handleChange('new_shift_end', time?.format('HH:mm'))}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={value.is_permanent ?? false}
                  onChange={(e) => handleChange('is_permanent', e.target.checked)}
                />
              }
              label="Cambio Permanente"
            />
          </Grid>

          {!value.is_permanent && (
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Fecha Fin (si temporal)"
                value={value.end_date ? dayjs(value.end_date) : null}
                onChange={(date) => handleChange('end_date', date?.format('YYYY-MM-DD'))}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                minDate={value.change_date ? dayjs(value.change_date) : undefined}
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Intercambio con (opcional)</InputLabel>
              <Select
                value={value.exchange_with || ''}
                label="Intercambio con (opcional)"
                onChange={(e) => handleChange('exchange_with', e.target.value || undefined)}
              >
                <MenuItem value="">Ninguno</MenuItem>
                {personnelList.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.full_name} - {p.employee_code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
