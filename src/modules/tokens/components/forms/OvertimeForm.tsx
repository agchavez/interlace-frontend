import { useCallback } from 'react';
import {
  Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography,
  CircularProgress, Chip, Button, Paper, IconButton, Switch, FormControlLabel, Divider,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
  OvertimeType,
  OvertimeTypeLabels,
  OvertimeReason,
  OvertimeReasonLabels,
  OvertimeCreatePayload,
  OvertimeSegmentPayload,
} from '../../interfaces/token';
import {
  useGetOvertimeTypesQuery,
  useGetOvertimeReasonsQuery,
} from '../../services/tokenApi';

interface OvertimeFormProps {
  value: OvertimeCreatePayload;
  onChange: (value: OvertimeCreatePayload) => void;
}

const calcHours = (start: string, end: string): number | null => {
  if (!start || !end) return null;
  const s = dayjs(`2000-01-01 ${start}`);
  let e = dayjs(`2000-01-01 ${end}`);
  if (e.isBefore(s)) e = e.add(1, 'day');
  return parseFloat((e.diff(s, 'minute') / 60).toFixed(2));
};

export const OvertimeForm = ({ value, onChange }: OvertimeFormProps) => {
  const { data: typesData, isLoading: typesLoading, isError: typesError } = useGetOvertimeTypesQuery({ limit: 100 });
  const { data: reasonsData, isLoading: reasonsLoading, isError: reasonsError } = useGetOvertimeReasonsQuery({ limit: 100 });

  const overtimeTypes = typesData?.results?.filter(t => t.is_active) || [];
  const overtimeReasons = reasonsData?.results?.filter(r => r.is_active) || [];

  const useDynamic = !typesError;
  const useDynamicReasons = !reasonsError;

  const isVariableRate = (value.segments?.length ?? 0) > 0;

  const handleChange = (field: keyof OvertimeCreatePayload, fieldValue: unknown) => {
    onChange({ ...value, [field]: fieldValue });
  };

  // When type is selected, auto-fill multiplier from the type's default
  const handleTypeChange = (typeModelId: number) => {
    const selectedType = overtimeTypes.find(t => t.id === typeModelId);
    onChange({
      ...value,
      overtime_type_model: typeModelId,
      pay_multiplier: selectedType ? Number(selectedType.default_multiplier) : value.pay_multiplier,
    });
  };

  // Get type name by id
  const getTypeName = (typeId?: number): string => {
    if (!typeId) return '';
    const t = overtimeTypes.find(ot => ot.id === typeId);
    return t ? t.name : '';
  };

  const getTypeMultiplier = (typeId?: number): number => {
    if (!typeId) return 1.5;
    const t = overtimeTypes.find(ot => ot.id === typeId);
    return t ? Number(t.default_multiplier) : 1.5;
  };

  // Toggle variable rate mode
  const toggleVariableRate = useCallback(() => {
    if (isVariableRate) {
      onChange({ ...value, segments: [] });
    } else {
      const initialSegment: OvertimeSegmentPayload = {
        start_time: value.start_time || '',
        end_time: value.end_time || '',
        pay_multiplier: value.pay_multiplier ?? 1.5,
        overtime_type_model: value.overtime_type_model,
        sequence: 0,
      };
      onChange({ ...value, segments: [initialSegment] });
    }
  }, [isVariableRate, value, onChange]);

  // Segment handlers
  const addSegment = useCallback(() => {
    const segments = value.segments || [];
    const lastSegment = segments[segments.length - 1];
    const newSegment: OvertimeSegmentPayload = {
      start_time: lastSegment?.end_time || value.end_time || '',
      end_time: '',
      pay_multiplier: 1.5,
      sequence: segments.length,
    };
    onChange({ ...value, segments: [...segments, newSegment] });
  }, [value, onChange]);

  const removeSegment = useCallback((index: number) => {
    const segments = (value.segments || []).filter((_, i) => i !== index);
    onChange({ ...value, segments });
  }, [value, onChange]);

  const updateSegment = useCallback((index: number, field: keyof OvertimeSegmentPayload, fieldValue: unknown) => {
    const segments = [...(value.segments || [])];
    segments[index] = { ...segments[index], [field]: fieldValue };

    // If changing overtime_type_model, auto-update multiplier
    if (field === 'overtime_type_model' && fieldValue) {
      const t = overtimeTypes.find(ot => ot.id === fieldValue);
      if (t) segments[index].pay_multiplier = Number(t.default_multiplier);
    }

    // Auto-update parent start/end times from segments
    if (segments.length > 0) {
      const firstStart = segments[0].start_time;
      const lastEnd = segments[segments.length - 1].end_time;
      onChange({
        ...value,
        segments,
        start_time: firstStart || value.start_time,
        end_time: lastEnd || value.end_time,
      });
    } else {
      onChange({ ...value, segments });
    }
  }, [value, onChange, overtimeTypes]);

  // Calculate total hours
  const totalHours = isVariableRate
    ? (value.segments || []).reduce((sum, seg) => sum + (calcHours(seg.start_time, seg.end_time) ?? 0), 0)
    : calcHours(value.start_time, value.end_time);

  // Current type name for display
  const currentTypeName = getTypeName(value.overtime_type_model);
  const currentMultiplier = value.pay_multiplier ?? getTypeMultiplier(value.overtime_type_model);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Detalles de Horas Extra
        </Typography>

        <Grid container spacing={2}>
          {/* Reason */}
          <Grid item xs={12} md={6}>
            {useDynamicReasons ? (
              <FormControl fullWidth size="small" disabled={reasonsLoading} required>
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
                <Select value={value.reason || ''} label="Motivo" onChange={(e) => handleChange('reason', e.target.value)}>
                  {Object.entries(OvertimeReasonLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>

          {/* Date */}
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Fecha"
              value={value.overtime_date ? dayjs(value.overtime_date) : null}
              onChange={(date) => handleChange('overtime_date', date?.format('YYYY-MM-DD') || '')}
              slotProps={{
                textField: { fullWidth: true, size: 'small', required: true, error: !value.overtime_date, helperText: !value.overtime_date ? 'Requerido' : '' },
              }}
            />
          </Grid>

          {/* Variable rate toggle */}
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch checked={isVariableRate} onChange={toggleVariableRate} color="secondary" />}
              label={
                <Typography variant="body2" color="text.secondary">
                  Tasa variable (múltiples tramos con diferente tipo y multiplicador)
                </Typography>
              }
            />
          </Grid>

          {/* ========== SINGLE RATE MODE ========== */}
          {!isVariableRate && (
            <>
              {/* Type (required, brings multiplier) */}
              <Grid item xs={12} md={4}>
                {useDynamic ? (
                  <FormControl fullWidth size="small" disabled={typesLoading} required>
                    <InputLabel>Tipo de Hora Extra</InputLabel>
                    <Select
                      value={value.overtime_type_model || ''}
                      label="Tipo de Hora Extra"
                      onChange={(e) => handleTypeChange(e.target.value as number)}
                      endAdornment={typesLoading ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null}
                    >
                      {overtimeTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name} <Chip label={`x${type.default_multiplier}`} size="small" sx={{ ml: 1 }} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo</InputLabel>
                    <Select value={value.overtime_type || ''} label="Tipo" onChange={(e) => handleChange('overtime_type', e.target.value)}>
                      {Object.entries(OvertimeTypeLabels).map(([key, label]) => (
                        <MenuItem key={key} value={key}>{label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>

              <Grid item xs={12} md={3}>
                <TimePicker
                  label="Hora Inicio"
                  value={value.start_time ? dayjs(`2000-01-01 ${value.start_time}`) : null}
                  onChange={(time) => handleChange('start_time', time?.format('HH:mm'))}
                  slotProps={{ textField: { fullWidth: true, size: 'small', required: true } }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TimePicker
                  label="Hora Fin"
                  value={value.end_time ? dayjs(`2000-01-01 ${value.end_time}`) : null}
                  onChange={(time) => handleChange('end_time', time?.format('HH:mm'))}
                  slotProps={{ textField: { fullWidth: true, size: 'small', required: true } }}
                />
              </Grid>
              {/* Multiplier (read-only, from type) */}
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth size="small" label="Multiplicador"
                  value={`x${currentMultiplier}`}
                  InputProps={{ readOnly: true }}
                  helperText={currentTypeName || 'Seleccione tipo'}
                  disabled
                />
              </Grid>
            </>
          )}

          {/* ========== VARIABLE RATE SEGMENTS ========== */}
          {isVariableRate && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Tramos de Hora Extra
                </Typography>
                <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={addSegment}>
                  Agregar Tramo
                </Button>
              </Box>

              {(value.segments || []).map((seg, idx) => {
                const segHours = calcHours(seg.start_time, seg.end_time);
                const segTypeName = getTypeName(seg.overtime_type_model);
                return (
                  <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: 2 }}>
                    <Grid container spacing={1.5} alignItems="center">
                      {/* Type (required per segment) */}
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small" required error={!seg.overtime_type_model}>
                          <InputLabel>Tipo</InputLabel>
                          <Select
                            value={seg.overtime_type_model || ''}
                            label="Tipo"
                            onChange={(e) => updateSegment(idx, 'overtime_type_model', e.target.value)}
                          >
                            {overtimeTypes.map((type) => (
                              <MenuItem key={type.id} value={type.id}>
                                {type.name} (x{type.default_multiplier})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6} sm={2.5}>
                        <TimePicker
                          label="Inicio"
                          value={seg.start_time ? dayjs(`2000-01-01 ${seg.start_time}`) : null}
                          onChange={(time) => updateSegment(idx, 'start_time', time?.format('HH:mm') || '')}
                          slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2.5}>
                        <TimePicker
                          label="Fin"
                          value={seg.end_time ? dayjs(`2000-01-01 ${seg.end_time}`) : null}
                          onChange={(time) => updateSegment(idx, 'end_time', time?.format('HH:mm') || '')}
                          slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={1.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                          {segHours !== null && <Chip label={`${segHours}h`} size="small" color="info" variant="outlined" sx={{ fontWeight: 600 }} />}
                          <Chip label={`x${seg.pay_multiplier}`} size="small" color="secondary" sx={{ fontWeight: 700 }} />
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={1.5} sx={{ textAlign: 'right' }}>
                        <IconButton size="small" color="error" onClick={() => removeSegment(idx)} disabled={(value.segments?.length ?? 0) <= 1}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                );
              })}
            </Grid>
          )}

          {/* Total hours summary */}
          {totalHours !== null && totalHours > 0 && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(33, 150, 243, 0.04)', border: '1px solid', borderColor: 'rgba(33, 150, 243, 0.2)', flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon color="info" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">Total:</Typography>
                  <Chip label={`${totalHours} hora${totalHours !== 1 ? 's' : ''}`} color="info" size="small" variant="filled" sx={{ fontWeight: 600 }} />
                </Box>
                {!isVariableRate && currentTypeName && (
                  <Chip label={`${currentTypeName} x${currentMultiplier}`} size="small" variant="outlined" color="secondary" sx={{ fontWeight: 600 }} />
                )}
                {isVariableRate && (
                  <Chip label={`${value.segments?.length ?? 0} tramo(s)`} size="small" variant="outlined" color="secondary" sx={{ fontWeight: 600 }} />
                )}
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Detalle del Motivo" multiline rows={2} value={value.reason_detail || ''} onChange={(e) => handleChange('reason_detail', e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Tarea Asignada" multiline rows={2} value={value.assigned_task || ''} onChange={(e) => handleChange('assigned_task', e.target.value)} />
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};
