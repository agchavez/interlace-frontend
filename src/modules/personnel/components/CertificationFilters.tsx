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
import type { CertificationFilterParams, Area, DistributorCenter } from "../../../interfaces/personnel";
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

export interface FormFilterCertification {
  search: string;
  status?: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'REVOKED';
  personnel?: number;
  certification_type?: number;
  distributor_center?: number;
  area?: number;
  hierarchy_level?: string;
  position_type?: string;
}

interface CertificationFiltersProps {
  open: boolean;
  handleClose?: () => void;
  handleFilter: (data: CertificationFilterParams) => void;
  filters: CertificationFilterParams;
  areas?: Area[];
  distributorCenters?: DistributorCenter[];
}

export const CertificationFilters: FC<CertificationFiltersProps> = ({
  open,
  handleClose,
  handleFilter,
  filters,
  areas = [],
  distributorCenters = [],
}) => {
  const { control, register, watch, setValue, getValues } =
    useForm<FormFilterCertification>({
      defaultValues: {
        search: filters.search || '',
        status: filters.status as 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'REVOKED' | undefined,
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
    watch("status"),
    watch("personnel"),
    watch("certification_type"),
    watch("distributor_center"),
    watch("area"),
    watch("hierarchy_level"),
    watch("position_type"),
  ]);

  const handleReset = () => {
    setValue("search", "");
    setValue("status", undefined);
    setValue("personnel", undefined);
    setValue("certification_type", undefined);
    setValue("distributor_center", undefined);
    setValue("area", undefined);
    setValue("hierarchy_level", undefined);
    setValue("position_type", undefined);
  };

  useEffect(() => {
    if (open) {
      setValue("search", filters.search || "");
      setValue("status", filters.status as 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'REVOKED' | undefined);
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
                  id="search-certifications"
                  label="Buscar"
                  variant="outlined"
                  autoComplete="off"
                  size="small"
                  fullWidth
                  placeholder="Buscar por empleado, certificación..."
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

          {/* Estado */}
          <List>
            <ListItem disablePadding sx={{ pl: 2 }}>
              <ListItemText primary={"Estado"} />
            </ListItem>
            <ListItem disablePadding sx={{ pl: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch("status") === undefined}
                      onChange={() => setValue("status", undefined)}
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
                      checked={watch("status") === 'ACTIVE'}
                      onChange={() => setValue("status", 'ACTIVE')}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      component="span"
                      fontWeight={200}
                      lineHeight="2rem"
                    >
                      Vigentes
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch("status") === 'EXPIRING_SOON'}
                      onChange={() => setValue("status", 'EXPIRING_SOON')}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      component="span"
                      fontWeight={200}
                      lineHeight="2rem"
                    >
                      Por Vencer
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch("status") === 'EXPIRED'}
                      onChange={() => setValue("status", 'EXPIRED')}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      component="span"
                      fontWeight={200}
                      lineHeight="2rem"
                    >
                      Vencidas
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch("status") === 'REVOKED'}
                      onChange={() => setValue("status", 'REVOKED')}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      component="span"
                      fontWeight={200}
                      lineHeight="2rem"
                    >
                      Revocadas
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
