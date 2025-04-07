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
import { ClaimQueryParams, useGetClaimTypesQuery } from "../../../store/claim/claimApi";

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
  canEditStatus?: boolean;
}

export const ClaimsFilter: FC<ClaimsFilterProps> = ({
  open,
  handleClose,
  handleFilter,
  canEditStatus,
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
        distributor_center:
          Array.isArray(claimQueryParams.distributor_center) &&
          claimQueryParams.distributor_center.length > 0
            ? claimQueryParams.distributor_center.map((dc) => Number(dc))
            : user?.centro_distribucion
            ? [Number(user.centro_distribucion)]
            : [],
        date_after: claimQueryParams.date_after || "",
        date_before: claimQueryParams.date_before || "",
        id: claimQueryParams.id || undefined,
      },
    });

  const values = getValues();
  useEffect(() => {
    handleFilter(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    values.date_after,
    values.date_before,
    values.search,
    values.tipo,
    values.status,
    values.distributor_center,
    values.id,
  ]);

  const {
      data: claimTypes,
      isFetching: isFetchingClaimTypes,
      isLoading: isLoadingClaimTypes,
  } = useGetClaimTypesQuery({});

  const handleReset = () => {
    setValue("search", "");
    setValue("tipo", undefined);
    setValue("status", undefined);
    setValue(
      "distributor_center",
      user?.centro_distribucion ? [Number(user.centro_distribucion)] : []
    );
    setValue("date_after", "");
    setValue("date_before", "");
    setValue("id", undefined);
  };

  useEffect(() => {
    if (open) {
      const values = getValues();
      if (values.search != claimQueryParams.search) {
        setValue("search", claimQueryParams.search || "");
      }
      if (values.tipo != claimQueryParams.tipo) {
        setValue("tipo", claimQueryParams.tipo);
      }
      if (values.status != claimQueryParams.status) {
        setValue("status", claimQueryParams.status);
      }
      if (values.distributor_center != claimQueryParams.distributor_center) {
        // lista del centro de distribución formulario
        let dclist: number[] = [];
        if (
          Array.isArray(claimQueryParams.distributor_center) &&
          claimQueryParams.distributor_center.length > 0
        ) {
          dclist = claimQueryParams.distributor_center.map((dc) =>
            Number(dc)
          );
        } else if (user?.centro_distribucion) {
          dclist = [Number(user.centro_distribucion)];
        } else {
          dclist = [];
        }

        // lista del centro de distribución del estado
        let dclistState: number[] = [];
        if (
          Array.isArray(claimQueryParams.distributor_center) &&
          claimQueryParams.distributor_center.length > 0
        ) {
          dclistState = claimQueryParams.distributor_center.map((dc) =>
            Number(dc)
          );
        } else if (user?.centro_distribucion) {
          dclistState = [Number(user.centro_distribucion)];
        } else {
          dclistState = [];
        }
        // comparar los arreglos
        const dclistStateDiff = dclistState.filter(
          (dc) => !dclist.includes(dc)
        );
        const dclistDiff = dclist.filter(
          (dc) => !dclistState.includes(dc)
        );
        if (dclistStateDiff.length > 0 || dclistDiff.length > 0) {
          setValue(
            "distributor_center",
            dclistState
          );
        }
      }
      if (values.date_after != claimQueryParams.date_after) {
        setValue("date_after", claimQueryParams.date_after || "");
      }
      if (values.date_before != claimQueryParams.date_before) {
        setValue("date_before", claimQueryParams.date_before || "");
      }
      if (values.id != claimQueryParams.id) {
        if (claimQueryParams.id === undefined) return;
        setValue("id", claimQueryParams.id);
      }
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
                        value={watch("tipo") || ""}
                        label="Tipo de Reclamo"
                        MenuProps={MenuProps}
                        disabled={isLoadingClaimTypes || isFetchingClaimTypes}
                      >
                        <MenuItem value="">
                          <em>Todos</em>
                        </MenuItem>
                        {claimTypes?.results?.map((item) => (
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
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" fullWidth>
                      <InputLabel id="status-label">Estado</InputLabel>
                      <Select
                        labelId="status-label"
                        id="status"
                        {...field}
                        value={watch("status") || ""}
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
                      <FormControl
                        size="small"
                        fullWidth
                        disabled={
                          canEditStatus
                            ? false
                            : user?.centro_distribucion !== null
                        }
                      >
                        <InputLabel id="distribution_center">
                          Centro de distribución
                        </InputLabel>
                        <Select
                          labelId="distribution_center"
                          id="distribution_center"
                          {...field}
                          value={String(watch("distributor_center")?.[0] ?? "")}
                          label="Centro de distribución"
                          sx={{ maxHeight: 300 }}
                          MenuProps={MenuProps}
                          onChange={(e) => {
                            if (e.target.value === "") {
                              setValue("distributor_center", []);
                            } else {
                              setValue("distributor_center", [Number(e.target.value)]);
                            }
                          }}
                        >
                          <MenuItem value="">
                            <em>Todos</em>
                          </MenuItem>
                          {canEditStatus
                            ? disctributionCenters.map((item) => (
                                <MenuItem key={item.id} value={item.id}>
                                  {item.name}
                                </MenuItem>
                              ))
                            : user?.distributions_centers.map((item) => (
                                <MenuItem key={item} value={item}>
                                  {
                                    disctributionCenters.find(
                                      (dc) => dc.id === item
                                    )?.name
                                  }
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
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                      }}
                      value={
                        isValid(new Date(watch("date_after") || ""))
                          ? new Date(watch("date_after") || "")
                          : null
                      }
                      inputRef={field.ref}
                      format="dd/MM/yyyy"
                      onChange={(date) => {
                        isValid(date) &&
                          date &&
                          field.onChange(
                            format(new Date(date), "yyyy-MM-dd 00:00:00")
                          );
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
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                      }}
                      value={
                        isValid(new Date(watch("date_before") || ""))
                          ? new Date(watch("date_before") || "")
                          : null
                      }
                      inputRef={field.ref}
                      onChange={(date) => {
                        isValid(date) &&
                          date &&
                          field.onChange(
                            format(new Date(date), "yyyy-MM-dd 23:59:59")
                          );
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
