import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { FC, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { StandardDrawerHeader } from '../../ui/components/StandardDrawerHeader';
import type { PautaFilterParams } from '../interfaces/truckCycle';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'PENDING_PICKING', label: 'Pendiente de Picking' },
  { value: 'PICKING_ASSIGNED', label: 'Picker Asignado' },
  { value: 'PICKING_IN_PROGRESS', label: 'Picking en Progreso' },
  { value: 'PICKING_DONE', label: 'Picking Completado' },
  { value: 'IN_BAY', label: 'En Bahia' },
  { value: 'PENDING_COUNT', label: 'Pendiente de Conteo' },
  { value: 'COUNTING', label: 'En Conteo' },
  { value: 'COUNTED', label: 'Contado' },
  { value: 'PENDING_CHECKOUT', label: 'Pendiente de Checkout' },
  { value: 'DISPATCHED', label: 'Despachado' },
  { value: 'CLOSED', label: 'Cerrada' },
  { value: 'CANCELLED', label: 'Cancelada' },
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

interface FormFilterPauta {
  transport_number: string;
  status: string;
  operational_date_after?: string;
  operational_date_before?: string;
}

interface PautaFiltersProps {
  open: boolean;
  handleClose: () => void;
  handleFilter: (data: PautaFilterParams) => void;
  filters: PautaFilterParams;
}

export const PautaFilters: FC<PautaFiltersProps> = ({
  open,
  handleClose,
  handleFilter,
  filters,
}) => {
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(
    filters.operational_date_after ? dayjs(filters.operational_date_after) : null
  );
  const [dateTo, setDateTo] = useState<Dayjs | null>(
    filters.operational_date_before ? dayjs(filters.operational_date_before) : null
  );

  const { control, register, watch, setValue, getValues } =
    useForm<FormFilterPauta>({
      defaultValues: {
        transport_number: filters.transport_number || '',
        status: filters.status || '',
        operational_date_after: filters.operational_date_after,
        operational_date_before: filters.operational_date_before,
      },
    });

  useEffect(() => {
    const data = getValues();
    handleFilter({
      transport_number: data.transport_number || undefined,
      status: data.status || undefined,
      operational_date_after: dateFrom?.format('YYYY-MM-DD') || undefined,
      operational_date_before: dateTo?.format('YYYY-MM-DD') || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watch('transport_number'),
    watch('status'),
    dateFrom,
    dateTo,
  ]);

  const handleReset = () => {
    setValue('transport_number', '');
    setValue('status', '');
    setDateFrom(null);
    setDateTo(null);
  };

  useEffect(() => {
    if (open) {
      setValue('transport_number', filters.transport_number || '');
      setValue('status', filters.status || '');
      setDateFrom(filters.operational_date_after ? dayjs(filters.operational_date_after) : null);
      setDateTo(filters.operational_date_before ? dayjs(filters.operational_date_before) : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Drawer anchor="right" open={open} onClose={handleClose}>
        <Box sx={{ width: 350 }} role="presentation">
          <StandardDrawerHeader
            title="Filtros de Pautas"
            onClose={handleClose}
            onReset={handleReset}
          />
          <Divider />

          <List>
            <Grid container sx={{ p: 2 }}>
              <Grid item xs={12}>
                <TextField
                  id="search-transport"
                  label="No. Transporte"
                  variant="outlined"
                  autoComplete="off"
                  size="small"
                  fullWidth
                  placeholder="Buscar por numero de transporte..."
                  {...register('transport_number')}
                />
              </Grid>
            </Grid>
          </List>

          <Divider />

          <List>
            <Grid container sx={{ p: 2 }} spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" fullWidth>
                      <InputLabel id="pauta-status-label">Estado</InputLabel>
                      <Select
                        labelId="pauta-status-label"
                        {...field}
                        value={watch('status') || ''}
                        label="Estado"
                        MenuProps={MenuProps}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.value === '' ? <em>{opt.label}</em> : opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </List>

          <Divider />

          <List>
            <ListItem disablePadding sx={{ pl: 2, py: 1 }}>
              <ListItemText primary="Fecha Operativa" />
            </ListItem>
            <Grid container sx={{ px: 2, pb: 2 }} spacing={2}>
              <Grid item xs={12}>
                <DatePicker
                  label="Desde"
                  value={dateFrom}
                  onChange={(newValue) => setDateFrom(newValue)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  label="Hasta"
                  value={dateTo}
                  onChange={(newValue) => setDateTo(newValue)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </List>

          <Divider />
        </Box>
      </Drawer>
    </LocalizationProvider>
  );
};
