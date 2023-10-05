import {
  Drawer,
  Box,
  List,
  Divider,
  Typography,
  Grid,
  IconButton,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { FC, useEffect } from "react";
import FilterListTwoToneIcon from "@mui/icons-material/FilterListTwoTone";
import { Controller, useForm } from "react-hook-form";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import { useAppSelector } from "../../../store";
import { DatePicker } from "@mui/x-date-pickers";
import { ProductSelect } from "../../ui/components/ProductSelect";
import { isValid } from "date-fns";

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

export interface FormFilterShiftManage {
  date_after: string | null;
  date_before: string | null;
  expiration_date: string | null;
  distribution_center: number | undefined;
  shift: "A" | "B" | "C" | undefined;
  product: number | undefined;
}

interface FilterShiftManageProps {
  open: boolean;
  handleClose?: () => void;
  handleFilter: (data: FormFilterShiftManage) => void;
}
export const FilterShiftManage: FC<FilterShiftManageProps> = ({
  open,
  handleClose,
  handleFilter,
}) => {
  //const { reportPallets } = useAppSelector((state) => state.ui);
  const { disctributionCenters } = useAppSelector((state) => state.maintenance);
  const { user } = useAppSelector((state) => state.auth);
  const { control, watch, setValue, getValues } =
    useForm<FormFilterShiftManage>({
      defaultValues: {
        distribution_center: user?.centro_distribucion || undefined,
      },
    });

  useEffect(() => {
    const data = getValues();
    handleFilter(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ watch("date_after"),watch("date_before"),watch("shift"),watch("distribution_center"),watch("product"),watch("expiration_date")]);

  const handleReset = () => {
    setValue("date_after", null  );
    setValue("date_before", null);
    setValue("shift", undefined);
    setValue("distribution_center", user?.centro_distribucion || undefined);
    setValue("product", undefined);
    setValue("expiration_date", null);
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <Drawer anchor="right" open={open} onClose={handleClose}>
        <Box
          sx={{ width: 350 }}
          role="presentation"
        //   onClick={toggleDrawer(anchor, false)}
        //   onKeyDown={toggleDrawer(anchor, false)}
        >
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
                // Al poner el cursor encima del icono se muestra el texto
                title="Limpiar filtros"
              >
                <RotateLeftIcon />
              </IconButton>
            </div>
          </div>
          <Divider />
          <Divider />
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
                      label="Mayor que"
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      value={field.value}
                      inputRef={field.ref}
                      format="dd/MM/yyyy"
                      onChange={(date) => {
                        isValid(date) &&
                        field.onChange(date);
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
                      label="Menor que"
                      format="dd/MM/yyyy"
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      value={field.value}
                      inputRef={field.ref}
                      onChange={(date) => {
                        isValid(date) &&
                        field.onChange(date);
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </List>
          <Divider />
          <List>
            <Grid container sx={{ p: 1 }} spacing={2}>
            <Grid item xs={12}>
                <Controller
                  name="expiration_date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Fecha de vencimiento"
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      value={field.value}
                      inputRef={field.ref}
                      format="dd/MM/yyyy"
                      onChange={(date) => {
                        isValid(date) &&
                        field.onChange(date);
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="shift"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" fullWidth>
                      <InputLabel id="shift">Turno</InputLabel>
                      <Select
                        labelId="shift"
                        id="shift"
                        {...field}
                        label="Turno"
                        MenuProps={MenuProps}
                      >
                        <MenuItem value="">
                          <>Todos</>
                        </MenuItem>
                        <MenuItem value="A">A</MenuItem>
                        <MenuItem value="B">B</MenuItem>
                        <MenuItem value="C">C</MenuItem>

                      </Select>

                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </List>
          <Divider />
          <List>
            <Grid container sx={{ p: 1 }} spacing={2}>
              <Grid item xs={12}>
                    <ProductSelect
                      control={control}
                      name="product"
                      ProductId={watch("product")}
                      placeholder="Producto"
                      />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="distribution_center"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" fullWidth>
                      <InputLabel id="distribution_center">Centro de distribución</InputLabel>
                      <Select
                        labelId="distribution_center"
                        id="distribution_center"
                        {...field}
                        disabled={user?.centro_distribucion ? true : false}
                        label="Centro de distribución"
                        sx={{
                          maxHeight: 300,
                        }}
                        MenuProps={MenuProps}
                      >
                        {disctributionCenters.map((item) => (
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
        </Box>
      </Drawer>
    </>
  );
};
