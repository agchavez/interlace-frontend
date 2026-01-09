import {
  Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Switch, Typography
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
  SubstitutionReason,
  SubstitutionReasonLabels,
  SubstitutionCreatePayload
} from '../../interfaces/token';
import { PersonnelProfileList } from '../../../../interfaces/personnel';

interface SubstitutionFormProps {
  value: SubstitutionCreatePayload;
  onChange: (value: SubstitutionCreatePayload) => void;
  personnelList?: PersonnelProfileList[];
}

export const SubstitutionForm = ({ value, onChange, personnelList = [] }: SubstitutionFormProps) => {
  const handleChange = (field: keyof SubstitutionCreatePayload, fieldValue: unknown) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Detalles de Sustitución
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" required>
              <InputLabel>Personal a Sustituir</InputLabel>
              <Select
                value={value.substituted_personnel || ''}
                label="Personal a Sustituir"
                onChange={(e) => handleChange('substituted_personnel', e.target.value)}
              >
                {personnelList.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.full_name} - {p.employee_code}
                  </MenuItem>
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
                {Object.entries(SubstitutionReasonLabels).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
              label="Funciones a Asumir"
              multiline
              rows={3}
              required
              value={value.assumed_functions || ''}
              onChange={(e) => handleChange('assumed_functions', e.target.value)}
              placeholder="Describa las funciones que asumirá durante la sustitución..."
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Horario Específico (opcional)"
              value={value.specific_schedule || ''}
              onChange={(e) => handleChange('specific_schedule', e.target.value)}
              placeholder="Ej: 08:00 - 17:00"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={value.additional_compensation ?? false}
                  onChange={(e) => handleChange('additional_compensation', e.target.checked)}
                />
              }
              label="Compensación Adicional"
            />
          </Grid>

          {value.additional_compensation && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Notas de Compensación"
                multiline
                rows={2}
                value={value.compensation_notes || ''}
                onChange={(e) => handleChange('compensation_notes', e.target.value)}
              />
            </Grid>
          )}

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
