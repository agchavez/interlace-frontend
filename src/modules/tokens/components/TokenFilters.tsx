/**
 * Token Filters Drawer Component
 */
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
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { FC, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { StandardDrawerHeader } from "../../ui/components/StandardDrawerHeader";
import {
  TokenType,
  TokenStatus,
  TokenTypeLabels,
  TokenStatusLabels,
  TokenFilterParams,
} from "../interfaces/token";

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

export interface FormFilterToken {
  search: string;
  token_type?: string;
  status?: string;
  distributor_center?: number;
  personnel?: number;
  valid_from_after?: string;
  valid_from_before?: string;
}

interface TokenFiltersProps {
  open: boolean;
  handleClose?: () => void;
  handleFilter: (data: TokenFilterParams) => void;
  filters: TokenFilterParams;
  distributorCenters?: Array<{ id: number; name: string }>;
}

export const TokenFilters: FC<TokenFiltersProps> = ({
  open,
  handleClose,
  handleFilter,
  filters,
  distributorCenters = [],
}) => {
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(
    filters.valid_from_after ? dayjs(filters.valid_from_after) : null
  );
  const [dateTo, setDateTo] = useState<Dayjs | null>(
    filters.valid_from_before ? dayjs(filters.valid_from_before) : null
  );

  const { control, register, watch, setValue, getValues } =
    useForm<FormFilterToken>({
      defaultValues: {
        search: filters.search || '',
        token_type: filters.token_type as string || '',
        status: filters.status as string || '',
        distributor_center: filters.distributor_center,
        valid_from_after: filters.valid_from_after,
        valid_from_before: filters.valid_from_before,
      },
    });

  useEffect(() => {
    const data = getValues();
    handleFilter({
      ...data,
      token_type: data.token_type as TokenType || undefined,
      status: data.status as TokenStatus || undefined,
      valid_from_after: dateFrom?.format('YYYY-MM-DD') || undefined,
      valid_from_before: dateTo?.format('YYYY-MM-DD') || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watch("search"),
    watch("token_type"),
    watch("status"),
    watch("distributor_center"),
    dateFrom,
    dateTo,
  ]);

  const handleReset = () => {
    setValue("search", "");
    setValue("token_type", "");
    setValue("status", "");
    setValue("distributor_center", undefined);
    setDateFrom(null);
    setDateTo(null);
  };

  useEffect(() => {
    if (open) {
      setValue("search", filters.search || "");
      setValue("token_type", (filters.token_type as string) || "");
      setValue("status", (filters.status as string) || "");
      setValue("distributor_center", filters.distributor_center);
      setDateFrom(filters.valid_from_after ? dayjs(filters.valid_from_after) : null);
      setDateTo(filters.valid_from_before ? dayjs(filters.valid_from_before) : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Drawer anchor="right" open={open} onClose={handleClose}>
        <Box sx={{ width: 350 }} role="presentation">
          <StandardDrawerHeader
            title="Filtros de Tokens"
            onClose={handleClose || (() => {})}
            onReset={handleReset}
          />
          <Divider />

          {/* Búsqueda */}
          <List>
            <Grid container sx={{ p: 2 }}>
              <Grid item xs={12}>
                <TextField
                  id="search-token"
                  label="Buscar"
                  variant="outlined"
                  autoComplete="off"
                  size="small"
                  fullWidth
                  placeholder="Buscar por número, beneficiario..."
                  {...register("search")}
                />
              </Grid>
            </Grid>
          </List>

          <Divider />

          {/* Tipo de Token */}
          <List>
            <Grid container sx={{ p: 2 }} spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="token_type"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" fullWidth>
                      <InputLabel id="token_type">Tipo de Token</InputLabel>
                      <Select
                        labelId="token_type"
                        id="token_type"
                        {...field}
                        value={watch('token_type') || ''}
                        label="Tipo de Token"
                        MenuProps={MenuProps}
                      >
                        <MenuItem value="">
                          <em>Todos</em>
                        </MenuItem>
                        {Object.entries(TokenTypeLabels).map(([value, label]) => (
                          <MenuItem key={value} value={value}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" fullWidth>
                      <InputLabel id="status">Estado</InputLabel>
                      <Select
                        labelId="status"
                        id="status"
                        {...field}
                        value={watch('status') || ''}
                        label="Estado"
                        MenuProps={MenuProps}
                      >
                        <MenuItem value="">
                          <em>Todos</em>
                        </MenuItem>
                        {Object.entries(TokenStatusLabels).map(([value, label]) => (
                          <MenuItem key={value} value={value}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="distributor_center"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" fullWidth>
                      <InputLabel id="distributor_center">
                        Centro de Distribución
                      </InputLabel>
                      <Select
                        labelId="distributor_center"
                        id="distributor_center"
                        {...field}
                        value={watch('distributor_center') || ''}
                        label="Centro de Distribución"
                        MenuProps={MenuProps}
                      >
                        <MenuItem value="">
                          <em>Todos</em>
                        </MenuItem>
                        {distributorCenters.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name}
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

          {/* Rango de Fechas */}
          <List>
            <ListItem disablePadding sx={{ pl: 2, py: 1 }}>
              <ListItemText primary="Fecha de Validez" />
            </ListItem>
            <Grid container sx={{ px: 2, pb: 2 }} spacing={2}>
              <Grid item xs={12}>
                <DatePicker
                  label="Desde"
                  value={dateFrom}
                  onChange={(newValue) => setDateFrom(newValue)}
                  slotProps={{
                    textField: {
                      size: "small",
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
                      size: "small",
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
