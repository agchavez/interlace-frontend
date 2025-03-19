import {
  Drawer,
  Box,
  List,
  ListItem,
  Divider,
  Typography,
  TextField,
  Grid,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { FC, useEffect } from "react";
import FilterListTwoToneIcon from "@mui/icons-material/FilterListTwoTone";
import { Controller, useForm } from "react-hook-form";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import { isValid, format } from "date-fns";
import { useAppSelector } from "../../../store";
import { DatePicker } from "@mui/x-date-pickers";
import { ClaimQueryParams } from "../../../interfaces/home";

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

interface ClaimsFilterProps {
  open: boolean;
  handleClose?: () => void;
  handleFilter: (data: ClaimQueryParams) => void;
}

export const ClaimsFilter: FC<ClaimsFilterProps> = ({
                                                      open,
                                                      handleClose,
                                                      handleFilter,
                                                    }) => {
  const { claimQueryParams } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  const { disctributionCenters } = useAppSelector((state) => state.maintenance);

  const { control, register, watch, setValue, getValues } =
      useForm<ClaimQueryParams>({
        defaultValues: {
          search: claimQueryParams.search || "",
          tipo: claimQueryParams.tipo,
          status: claimQueryParams.status,
          distributor_center: claimQueryParams.distributor_center?.length > 0
              ? claimQueryParams.distributor_center
              : user?.centro_distribucion ? [user.centro_distribucion] : [],
          date_after: claimQueryParams.date_after || "",
          date_before: claimQueryParams.date_before || "",
          id: claimQueryParams.id || undefined,
        },
      });

  useEffect(() => {
    const data = getValues();
    handleFilter(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watch("date_after"),
    watch("date_before"),
    watch("search"),
    watch("tipo"),
    watch("status"),
    watch("distributor_center"),
    watch("id"),
  ]);

  const handleReset = () => {
    setValue("search", "");
    setValue("tipo", undefined);
    setValue("status", undefined);
    setValue("distributor_center", user?.centro_distribucion ? [user.centro_distribucion] : []);
    setValue("date_after", "");
    setValue("date_before", "");
    setValue("id", undefined);
  };

  useEffect(() => {
    if (open) {
      setValue("search", claimQueryParams.search || "");
      setValue("tipo", claimQueryParams.tipo);
      setValue("status", claimQueryParams.status);
      setValue("distributor_center", claimQueryParams.distributor_center?.length > 0
          ? claimQueryParams.distributor_center
          : user?.centro_distribucion ? [user.centro_distribucion] : []);
      setValue("date_after", claimQueryParams.date_after || "");
      setValue("date_before", claimQueryParams.date_before || "");
      setValue("id", claimQueryParams.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
      <>
        <Drawer anchor="right" open={open} onClose={handleClose}>
          <Box sx={{ width: 350 }} role="presentation">
            <div
                style={{ padding: "0.5rem", display: "flex", alignItems: "center" }}
            >
              <div style={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
                <FilterListTwoToneIcon sx={{ mr: 1 }} />
                <Typography
                    variant="h6"
                    component="div"
                    fontWeight={200}
                    lineHeight="2rem"
                >
                  Filtros
                </Typography>
              </div>
              <div>
                <IconButton
                    size="small"
                    onClick={handleReset}
                    title="Limpiar filtros"
                >
                  <RotateLeftIcon />
                </IconButton>
              </div>
            </div>
            <Divider />

            {/* Búsqueda general */}
            <List>
              <Grid container sx={{ p: 1 }}>
                <Grid item xs={12}>
                  <TextField
                      id="outlined-basic"
                      label="Buscar"
                      variant="outlined"
                      autoComplete="off"
                      size="small"
                      fullWidth
                      {...register("search")}
                  />
                </Grid>
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <TextField
                      id="claim-id"
                      label="ID Reclamo"
                      variant="outlined"
                      autoComplete="off"
                      size="small"
                      type="number"
                      fullWidth
                      {...register("id", { valueAsNumber: true })}
                      value={watch("id") || ""}
                  />
                </Grid>
              </Grid>
            </List>
            <Divider />

            {/* Tipo de reclamo y estado */}
            <List>
              <Grid container sx={{ p: 1 }} spacing={2}>
                <Grid item xs={12}>
                  <Controller
                      name="tipo"
                      control={control}
                      render={({ field }) => (
                          <FormControl size="small" fullWidth>
                            <InputLabel id="tipo-label">Tipo de Reclamo</InputLabel>
                            <Select
                                labelId="tipo-label"
                                id="tipo"
                                {...field}
                                value={watch('tipo') || ""}
                                label="Tipo de Reclamo"
                                MenuProps={MenuProps}
                            >
                              <MenuItem value="">
                                <em>Todos</em>
                              </MenuItem>
                              <MenuItem value="FALTANTE">Faltante</MenuItem>
                              <MenuItem value="SOBRANTE">Sobrante</MenuItem>
                              <MenuItem value="DAÑOS_CALIDAD_TRANSPORTE">Daños por Calidad y Transporte</MenuItem>
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
                            <InputLabel id="status-label">Estado</InputLabel>
                            <Select
                                labelId="status-label"
                                id="status"
                                {...field}
                                value={watch('status') || ""}
                                label="Estado"
                                MenuProps={MenuProps}
                            >
                              <MenuItem value="">
                                <em>Todos</em>
                              </MenuItem>
                              <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                              <MenuItem value="EN_REVISION">En Revisión</MenuItem>
                              <MenuItem value="RECHAZADO">Rechazado</MenuItem>
                              <MenuItem value="APROBADO">Aprobado</MenuItem>
                            </Select>
                          </FormControl>
                      )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <ListItem disablePadding>
                    <Controller
                        name="distributor_center"
                        control={control}
                        render={({ field }) => (
                            <FormControl size="small" fullWidth disabled={user?.centro_distribucion !== undefined}>
                              <InputLabel id="distribution_center">
                                Centro de distribución
                              </InputLabel>
                              <Select
                                  labelId="distribution_center"
                                  id="distribution_center"
                                  {...field}
                                  value={watch('distributor_center')[0] || ""}
                                  label="Centro de distribución"
                                  sx={{ maxHeight: 300 }}
                                  MenuProps={MenuProps}
                              >
                                <MenuItem value="">
                                  <em>Todos</em>
                                </MenuItem>
                                {user?.distributions_centers.map((item) => (
                                    <MenuItem key={item} value={item}>
                                      {disctributionCenters.find((dc) => dc.id === item)?.name}
                                    </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                        )}
                    />
                  </ListItem>
                </Grid>
              </Grid>
            </List>
            <Divider />

            {/* Fecha de registro */}
            <List>
              <Grid container sx={{ p: 1 }} spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight={200}>
                    Fecha de registro
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Controller
                      name="date_after"
                      control={control}
                      render={({ field }) => (
                          <DatePicker
                              label="Del"
                              slotProps={{ textField: { size: 'small', fullWidth: true } }}
                              value={isValid(new Date(watch("date_after"))) ? new Date(watch("date_after")) : null}
                              inputRef={field.ref}
                              format="dd/MM/yyyy"
                              onChange={(date) => {
                                isValid(date) && date &&
                                field.onChange(format(new Date(date), 'yyyy-MM-dd 00:00:00'));
                              }}
                          />
                      )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                      name="date_before"
                      control={control}
                      render={({ field }) => (
                          <DatePicker
                              label="Al"
                              format="dd/MM/yyyy"
                              slotProps={{ textField: { size: 'small', fullWidth: true } }}
                              value={isValid(new Date(watch("date_before"))) ? new Date(watch("date_before")) : null}
                              inputRef={field.ref}
                              onChange={(date) => {
                                isValid(date) && date &&
                                field.onChange(format(new Date(date), 'yyyy-MM-dd 23:59:59'));
                              }}
                          />
                      )}
                  />
                </Grid>
              </Grid>
            </List>
          </Box>
        </Drawer>
      </>
  );
};