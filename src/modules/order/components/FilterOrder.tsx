import {
  Drawer,
  Box,
  List,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { FC, useEffect } from "react";
import FilterListTwoToneIcon from "@mui/icons-material/FilterListTwoTone";
import { Controller, useForm } from "react-hook-form";
import { useAppSelector } from "../../../store";
import { OrderStatusType } from "../../../interfaces/orders";
import { LocationSelect } from "../../ui/components/LocationSelect";
import { StandardDrawerHeader } from "../../ui/components/StandardDrawerHeader";

export interface FormFilterOrder {
  location?: number;
  distributor_center?: number;
  status?: OrderStatusType;
  id?: number;
}

interface FolterOrderProps {
  open: boolean;
  handleClose?: () => void;
  handleFilter: (data: FormFilterOrder) => void;
}
export const FilterOrder: FC<FolterOrderProps> = ({
  open,
  handleClose,
  handleFilter,
}) => {
  const { orderQueryParams } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  const { disctributionCenters } = useAppSelector((state) => state.maintenance);
  const { control, register, watch, setValue, getValues } =
    useForm<FormFilterOrder>({
      defaultValues: {
        location: orderQueryParams.location,
        distributor_center: user?.centro_distribucion || undefined,
        status: orderQueryParams.status,
      },
    });

  useEffect(() => {
    const data = getValues();
    handleFilter({...data, location: watch("location")||undefined});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watch("location"),
    watch("distributor_center"),
    watch("id"),
    watch("status"),
  ]);

  const handleReset = () => {
    setValue("location", 0);
    setValue("distributor_center", undefined);
    setValue("status", "PENDING");
    setValue("id", undefined);
  };

  useEffect(() => {
    if (open) {
      setValue("location", orderQueryParams.location || undefined);
      setValue("distributor_center", orderQueryParams.distributor_center);
      setValue("status", orderQueryParams.status || "PENDING");
      setValue("id", orderQueryParams.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

  return (
    <>
      <Drawer anchor="right" open={open} onClose={handleClose}>
        <Box sx={{ width: 350 }} role="presentation">
          <StandardDrawerHeader
            title="Filtros"
            icon={<FilterListTwoToneIcon />}
            onClose={handleClose || (() => {})}
            onReset={handleReset}
          />
          <List>
            <Grid container sx={{ p: 1 }}>
              <Grid item xs={12}>
                <LocationSelect
                  control={control}
                  name="location"
                  label="Cliente"
                />
              </Grid>
            </Grid>
          </List>
          <List>
            <Grid container sx={{ p: 1 }}>
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
                        disabled={user?.distributions_centers.length === 1}
                        label="Centro de distribución"
                        sx={{
                          maxHeight: 300,
                        }}
                        MenuProps={MenuProps}
                      >
                        {user?.distributions_centers.map((item) => (
                          <MenuItem key={item} value={item}>
                            {disctributionCenters.find(
                              (dc) => dc.id === item
                            )?.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </List>
          <List>
            <Grid container sx={{ p: 1 }}>
              <Grid item xs={12}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="status">Estado</InputLabel>
                  <Select
                    labelId="status"
                    id="status"
                    value={watch("status")}
                    label="Estado"
                    sx={{
                      maxHeight: 300,
                    }}
                    MenuProps={MenuProps}
                    onChange={(e)=>{
                      const value = e.target.value as OrderStatusType
                      setValue("status", value)
                    }}
                  >
                    <MenuItem value={"PENDING"}>Pendiente</MenuItem>
                    <MenuItem value={"IN_PROCESS"}>En Proceso</MenuItem>
                    <MenuItem value={"COMPLETED"}>Completado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </List>
          <List>
            <Grid container sx={{ p: 1 }}>
              <Grid item xs={12}>
                <TextField
                  {...register("id")}
                  fullWidth
                  label="Id de Orden"
                  variant="outlined"
                  size="small"
                  type="number"
                />
              </Grid>
            </Grid>
          </List>
        </Box>
      </Drawer>
    </>
  );
};
