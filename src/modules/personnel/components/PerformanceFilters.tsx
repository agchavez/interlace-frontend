import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
  FormGroup,
  Checkbox,
  FormControlLabel,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { FC, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import type { PerformanceFilterParams, Area, DistributorCenter } from "../../../interfaces/personnel";
import { StandardDrawerHeader } from "../../ui/components/StandardDrawerHeader";

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

export interface FormFilterPerformance {
  search: string;
  min_score?: number;
  max_score?: number;
  distributor_center?: number;
  area?: number;
  hierarchy_level?: string;
  position_type?: string;
}

interface PerformanceFiltersProps {
  open: boolean;
  handleClose?: () => void;
  handleFilter: (data: PerformanceFilterParams) => void;
  filters: PerformanceFilterParams;
  areas?: Area[];
  distributorCenters?: DistributorCenter[];
}

export const PerformanceFilters: FC<PerformanceFiltersProps> = ({
  open,
  handleClose,
  handleFilter,
  filters,
  areas = [],
  distributorCenters = [],
}) => {
  const { control, register, watch, setValue, getValues } = useForm<FormFilterPerformance>({
    defaultValues: {
      search: filters.search || '',
      distributor_center: filters.distributor_center,
      area: filters.area,
      hierarchy_level: filters.hierarchy_level,
      position_type: filters.position_type,
    },
  });

  useEffect(() => {
    const data = getValues();
    handleFilter(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watch("search"),
    watch("min_score"),
    watch("max_score"),
    watch("distributor_center"),
    watch("area"),
    watch("hierarchy_level"),
    watch("position_type"),
  ]);

  const handleReset = () => {
    setValue("search", "");
    setValue("min_score", undefined);
    setValue("max_score", undefined);
    setValue("distributor_center", undefined);
    setValue("area", undefined);
    setValue("hierarchy_level", undefined);
    setValue("position_type", undefined);
  };

  useEffect(() => {
    if (open) {
      setValue("search", filters.search || "");
      setValue("distributor_center", filters.distributor_center);
      setValue("area", filters.area);
      setValue("hierarchy_level", filters.hierarchy_level);
      setValue("position_type", filters.position_type);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const hierarchyLevels = [
    { value: 'OPERATIVE', label: 'Operativo' },
    { value: 'SUPERVISOR', label: 'Supervisor' },
    { value: 'AREA_MANAGER', label: 'Jefe de Área' },
    { value: 'CD_MANAGER', label: 'Gerente de Centro' },
  ];

  const positionTypes = [
    { value: 'OPERATIONAL', label: 'Operacional' },
    { value: 'ADMINISTRATIVE', label: 'Administrativo' },
    { value: 'MANAGEMENT', label: 'Gerencial' },
    { value: 'SECURITY', label: 'Seguridad' },
    { value: 'DRIVER', label: 'Conductor' },
  ];

  return (
    <>
      <Drawer anchor="right" open={open} onClose={handleClose}>
        <Box sx={{ width: 350 }} role="presentation">
          <StandardDrawerHeader
            title="Filtros"
            onClose={handleClose || (() => {})}
            onReset={handleReset}
          />
          <Divider />

          {/* Búsqueda */}
          <List>
            <Grid container sx={{ p: 1 }}>
              <Grid item xs={12}>
                <TextField
                  id="search-performance"
                  label="Buscar"
                  variant="outlined"
                  autoComplete="off"
                  size="small"
                  fullWidth
                  placeholder="Buscar por empleado, posición..."
                  {...register("search")}
                />
              </Grid>
            </Grid>
          </List>

          <Divider />

          {/* Filtros de Personal */}
          <List>
            <Grid container sx={{ p: 1 }} spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="distributor_center"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" fullWidth>
                      <InputLabel id="distributor_center">
                        Centro de distribución
                      </InputLabel>
                      <Select
                        labelId="distributor_center"
                        id="distributor_center"
                        {...field}
                        value={watch('distributor_center') || ''}
                        label="Centro de distribución"
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

              <Grid item xs={12}>
                <Controller
                  name="area"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" fullWidth>
                      <InputLabel id="area">Área</InputLabel>
                      <Select
                        labelId="area"
                        id="area"
                        {...field}
                        value={watch('area') || ''}
                        label="Área"
                        MenuProps={MenuProps}
                      >
                        <MenuItem value="">
                          <em>Todas</em>
                        </MenuItem>
                        {areas.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="hierarchy_level"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" fullWidth>
                      <InputLabel id="hierarchy_level">Nivel Jerárquico</InputLabel>
                      <Select
                        labelId="hierarchy_level"
                        id="hierarchy_level"
                        {...field}
                        value={watch('hierarchy_level') || ''}
                        label="Nivel Jerárquico"
                        MenuProps={MenuProps}
                      >
                        <MenuItem value="">
                          <em>Todos</em>
                        </MenuItem>
                        {hierarchyLevels.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="position_type"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" fullWidth>
                      <InputLabel id="position_type">Tipo de Posición</InputLabel>
                      <Select
                        labelId="position_type"
                        id="position_type"
                        {...field}
                        value={watch('position_type') || ''}
                        label="Tipo de Posición"
                        MenuProps={MenuProps}
                      >
                        <MenuItem value="">
                          <em>Todos</em>
                        </MenuItem>
                        {positionTypes.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.label}
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

          {/* Filtro de puntuación */}
          <List>
            <ListItem disablePadding sx={{ pl: 2 }}>
              <ListItemText primary={"Puntuación"} />
            </ListItem>
            <Grid container sx={{ p: 2 }} spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Mín"
                  variant="outlined"
                  size="small"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0, max: 5, step: 0.1 }}
                  {...register("min_score")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Máx"
                  variant="outlined"
                  size="small"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0, max: 5, step: 0.1 }}
                  {...register("max_score")}
                />
              </Grid>
            </Grid>
          </List>

          <Divider />

          {/* Filtros rápidos */}
          <List>
            <ListItem disablePadding sx={{ pl: 2 }}>
              <ListItemText primary={"Filtros Rápidos"} />
            </ListItem>
            <ListItem disablePadding sx={{ pl: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch("min_score") === 4.5}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setValue("min_score", 4.5);
                          setValue("max_score", 5);
                        } else {
                          setValue("min_score", undefined);
                          setValue("max_score", undefined);
                        }
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      component="span"
                      fontWeight={200}
                      lineHeight="2rem"
                    >
                      Excelente (≥4.5)
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch("min_score") === 3.5 && watch("max_score") === 4.5}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setValue("min_score", 3.5);
                          setValue("max_score", 4.5);
                        } else {
                          setValue("min_score", undefined);
                          setValue("max_score", undefined);
                        }
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      component="span"
                      fontWeight={200}
                      lineHeight="2rem"
                    >
                      Bueno (3.5-4.4)
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch("max_score") === 3.5}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setValue("min_score", 0);
                          setValue("max_score", 3.5);
                        } else {
                          setValue("min_score", undefined);
                          setValue("max_score", undefined);
                        }
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      component="span"
                      fontWeight={200}
                      lineHeight="2rem"
                    >
                      Necesita Mejora (&lt;3.5)
                    </Typography>
                  }
                />
              </FormGroup>
            </ListItem>
          </List>
          <Divider />
        </Box>
      </Drawer>
    </>
  );
};
