import { useState } from 'react';
import {
  Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Switch, Typography, IconButton, Chip, Stack
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  DateSelectionType,
  DateSelectionTypeLabels,
  PermitDayReason,
  PermitDayReasonLabels,
  PermitDayCreatePayload
} from '../../interfaces/token';

interface PermitDayFormProps {
  value: PermitDayCreatePayload;
  onChange: (value: PermitDayCreatePayload) => void;
}

export const PermitDayForm = ({ value, onChange }: PermitDayFormProps) => {
  const [newDate, setNewDate] = useState<Dayjs | null>(null);

  const handleChange = (field: keyof PermitDayCreatePayload, fieldValue: unknown) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const handleAddDate = () => {
    if (newDate) {
      const dateStr = newDate.format('YYYY-MM-DD');
      const currentDates = value.selected_dates || [];
      if (!currentDates.includes(dateStr)) {
        handleChange('selected_dates', [...currentDates, dateStr]);
      }
      setNewDate(null);
    }
  };

  const handleRemoveDate = (dateToRemove: string) => {
    const currentDates = value.selected_dates || [];
    handleChange('selected_dates', currentDates.filter(d => d !== dateToRemove));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Detalles del Permiso por Día
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo de Selección</InputLabel>
              <Select
                value={value.date_selection_type || ''}
                label="Tipo de Selección"
                onChange={(e) => handleChange('date_selection_type', e.target.value)}
              >
                {Object.entries(DateSelectionTypeLabels).map(([key, label]) => (
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
                {Object.entries(PermitDayReasonLabels).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {value.date_selection_type === DateSelectionType.RANGE && (
            <>
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
            </>
          )}

          {value.date_selection_type === DateSelectionType.SINGLE && (
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Fecha del Permiso"
                value={value.start_date ? dayjs(value.start_date) : null}
                onChange={(date) => {
                  const dateStr = date?.format('YYYY-MM-DD');
                  handleChange('start_date', dateStr);
                  handleChange('end_date', dateStr);
                }}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
          )}

          {value.date_selection_type === DateSelectionType.MULTIPLE && (
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <DatePicker
                    label="Agregar Fecha"
                    value={newDate}
                    onChange={setNewDate}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleAddDate}
                    disabled={!newDate}
                  >
                    <AddIcon />
                  </IconButton>
                </Stack>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(value.selected_dates || []).sort().map((date) => (
                  <Chip
                    key={date}
                    label={dayjs(date).format('DD/MM/YYYY')}
                    onDelete={() => handleRemoveDate(date)}
                    deleteIcon={<DeleteIcon />}
                  />
                ))}
              </Box>
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

          <Grid item xs={12}>
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
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};
