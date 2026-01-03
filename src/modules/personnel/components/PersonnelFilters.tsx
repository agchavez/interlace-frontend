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
import type { PersonnelFilterParams, Area, DistributorCenter } from "../../../interfaces/personnel";
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

export interface FormFilterPersonnel {
  search: string;
  distributor_center?: number;
  area?: number;
  hierarchy_level?: string;
  position_type?: string;
  is_active?: boolean;
  has_user?: boolean;
}

interface PersonnelFiltersProps {
  open: boolean;
  handleClose?: () => void;
  handleFilter: (data: PersonnelFilterParams) => void;
  filters: PersonnelFilterParams;
  areas?: Area[];
  distributorCenters?: DistributorCenter[];
}

export const PersonnelFilters: FC<PersonnelFiltersProps> = ({
  open,
  handleClose,
  handleFilter,
  filters,
  areas = [],
  distributorCenters = [],
}) => {
  const { control, register, watch, setValue, getValues } =
    useForm<FormFilterPersonnel>({
      defaultValues: {
        search: filters.search || '',
        distributor_center: filters.any_distributor_center,
        area: filters.area,
        hierarchy_level: filters.hierarchy_level,
        position_type: filters.position_type,
        is_active: filters.is_active,
        has_user: filters.has_user,
      },
    });

  useEffect(() => {
    const data = getValues();
    const { distributor_center, ...rest } = data;
    handleFilter({
      ...rest,
      any_distributor_center: distributor_center,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watch("search"),
    watch("distributor_center"),
    watch("area"),
    watch("hierarchy_level"),
    watch("position_type"),
    watch("is_active"),
    watch("has_user"),
  ]);

  const handleReset = () => {
    setValue("search", "");
    setValue("distributor_center", undefined);
    setValue("area", undefined);
    setValue("hierarchy_level", undefined);
    setValue("position_type", undefined);
    setValue("is_active", undefined);
    setValue("has_user", undefined);
  };

  useEffect(() => {
    if (open) {
      setValue("search", filters.search || "");
      setValue("distributor_center", filters.any_distributor_center);
      setValue("area", filters.area);
      setValue("hierarchy_level", filters.hierarchy_level);
      setValue("position_type", filters.position_type);
      setValue("is_active", filters.is_active);
      setValue("has_user", filters.has_user);
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
                  id="search-personnel"
                  label="Buscar"
                  variant="outlined"
                  autoComplete="off"
                  size="small"
                  fullWidth
                  placeholder="Buscar por nombre, código, email..."
                  {...register("search")}
                />
              </Grid>
            </Grid>
          </List>

          <Divider />

          {/* Centro de Distribución */}
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

          {/* Estado */}
          <List>
            <ListItem disablePadding sx={{ pl: 2 }}>
              <ListItemText primary={"Estado del Personal"} />
            </ListItem>
            <ListItem disablePadding sx={{ pl: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch("is_active") === undefined}
                      onChange={() => setValue("is_active", undefined)}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      component="span"
                      fontWeight={200}
                      lineHeight="2rem"
                    >
                      Todos
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch("is_active") === true}
                      onChange={() => setValue("is_active", true)}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      component="span"
                      fontWeight={200}
                      lineHeight="2rem"
                    >
                      Activos
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch("is_active") === false}
                      onChange={() => setValue("is_active", false)}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      component="span"
                      fontWeight={200}
                      lineHeight="2rem"
                    >
                      Inactivos
                    </Typography>
                  }
                />
              </FormGroup>
            </ListItem>
          </List>

          <Divider />

          {/* Usuario del Sistema */}
          <List>
            <ListItem disablePadding sx={{ pl: 2 }}>
              <ListItemText primary={"Acceso al Sistema"} />
            </ListItem>
            <ListItem disablePadding sx={{ pl: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch("has_user") === undefined}
                      onChange={() => setValue("has_user", undefined)}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      component="span"
                      fontWeight={200}
                      lineHeight="2rem"
                    >
                      Todos
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch("has_user") === true}
                      onChange={() => setValue("has_user", true)}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      component="span"
                      fontWeight={200}
                      lineHeight="2rem"
                    >
                      Con acceso
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch("has_user") === false}
                      onChange={() => setValue("has_user", false)}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      component="span"
                      fontWeight={200}
                      lineHeight="2rem"
                    >
                      Sin acceso
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
