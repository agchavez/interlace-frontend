import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
  Grid,
  IconButton,
  TextField,
} from "@mui/material";
import { FC, useEffect } from "react";
import FilterListTwoToneIcon from "@mui/icons-material/FilterListTwoTone";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import { useAppSelector } from "../../../store";
import { ProductSelect } from "../../ui/components/ProductSelect";
import { Controller, useForm } from "react-hook-form";
import { Product } from "../../../interfaces/tracking";
import { DatePicker } from "@mui/x-date-pickers";
import { format, isValid } from "date-fns";
import MultipleSelectChip from "./MultipleSelectChip";
import { DistributionCenter } from "../../../interfaces/maintenance";

export interface FormFilterInventory {
  limit: number;
  offset: number;
  productos: Product[];
  distributor_center: DistributionCenter[];
  tracker?: number;
  date_after?: string;
  date_before?: string;
  movement_type?: "IN" | "OUT" | "BALANCE";
  user?: number;
  tracker_detail__product?: number;
  sap_code?: string;
  product__name?: string;
  module: ModuleType[];
  producto?: Product;
  origin_id?: number;
  is_applied?: boolean;
}

type ModuleType = "T1" | "T2" | "ADMIN" | "ORDER";

interface FilterManageProps {
  open: boolean;
  handleClose?: () => void;
  handleFilter: (data: FormFilterInventory) => void;
}

export const ModuleSelectOptions = [
  {text: "T1", value: "T1"},
  {text: "T2", value: "T2"},
  {text: "Administrador", value: "ADMIN"},
  {text: "Pedidos", value: "ORDER"},
]

export const FilterInventory: FC<FilterManageProps> = ({
  open,
  handleClose,
  handleFilter,
}) => {
  const { inventoryQueryParams: filterQueryParams } = useAppSelector(
    (state) => state.ui
  );

  const { disctributionCenters } = useAppSelector((state) => state.maintenance);

  const { control, watch, setValue, getValues, register } =
    useForm<FormFilterInventory>({
      defaultValues: {
        limit: 10,
        offset: 0,
        productos: [],
        distributor_center: [],
        module: []
      },
    });

  const filterTriggers = [
    watch("user"),
    watch("tracker"),
    watch("movement_type"),
    watch("distributor_center"),
    watch("date_after"),
    watch("date_before"),
    watch("tracker_detail__product"),
    watch("sap_code"),
    watch("product__name"),
    watch("module"),
    watch("productos"),
    watch("origin_id"),
    watch("is_applied"),
  ];

  useEffect(() => {
    const data = getValues();
    handleFilter(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, filterTriggers);

  const handleReset = () => {
    setValue("user", undefined);
    setValue("movement_type", undefined);
    setValue("distributor_center", []);
    setValue("date_after", undefined);
    setValue("date_before", undefined);
    setValue("tracker_detail__product", undefined);
    setValue("sap_code", undefined);
    setValue("product__name", undefined);
    setValue("module", []);
    setValue("producto", undefined);
    setValue("productos", []);
    setValue("origin_id", undefined);
    setValue("is_applied", undefined);
    setValue("tracker", undefined)
  };

  useEffect(() => {
    if (open) {
      setValue("user", filterQueryParams.user || undefined);
      setValue("movement_type", filterQueryParams.movement_type || undefined);
      setValue("distributor_center", filterQueryParams.distributor_center);
      setValue("module", filterQueryParams.module);
      setValue(
        "tracker_detail__product",
        filterQueryParams.tracker_detail__product || undefined
      );
      setValue("date_after", filterQueryParams.date_after);
      setValue("date_before", filterQueryParams.date_before);
      setValue("sap_code", filterQueryParams.sap_code || undefined);
      setValue("product__name", filterQueryParams.product__name || undefined);
      setValue("producto", filterQueryParams.producto || undefined);
      setValue("productos", filterQueryParams.productos);
      setValue("origin_id", filterQueryParams.origin_id || undefined);
      setValue("is_applied", filterQueryParams.is_applied || undefined);
      setValue("tracker", filterQueryParams.tracker);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const addProduct = (product: Product) => {
    const products = watch("productos");
    const producto = products.find(
      (producto) => producto.sap_code === product.sap_code
    );
    if (producto) return;
    setValue("productos", [...products, product]);
  };

  const changeCD = (value: DistributionCenter[]) => {
    setValue("distributor_center", value);
  };

  const changeModule = (value: ModuleType[]) => {
    setValue("module", value);
  };

  

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
          <List>
            <ListItem disablePadding sx={{ pl: 2 }}>
              <ListItemText primary={"Producto"} />
            </ListItem>
            <Grid container sx={{ p: 1 }}>
              <Grid item xs={12}>
                <ProductSelect
                  control={control}
                  name="producto"
                  onChange={(p) => p && addProduct(p)}
                />
              </Grid>
            </Grid>
          </List>
          <Divider />
          <List>
            <Grid container sx={{ p: 1 }}>
              <TextField
                label="Tracking"
                variant="outlined"
                autoComplete="off"
                size="small"
                type="number"
                fullWidth
                {...register("tracker")}
                value={watch("tracker")}
              />
            </Grid>
          </List>
          <Divider />
          <List>
            <Grid container sx={{ p: 1 }} spacing={2}>
              <Grid item xs={12}>
                <MultipleSelectChip
                  options={disctributionCenters.map((dc) => ({
                    text: dc.name,
                    value: dc.id.toString(),
                  }))}
                  value={watch("distributor_center").map(cd=>cd.id.toString())}
                  label="Centro de Distribución"
                  changeEventAction={(value)=>{
                    const res = value.map(dc=>disctributionCenters.find(dca=>dca.id.toString()===dc) as DistributionCenter)
                    changeCD(res)
                  }}
                />
              </Grid>
            </Grid>
          </List>
          <Divider />
          <List>
            <Grid container sx={{ p: 1 }} spacing={2}>
              <Grid item xs={12}>
                <MultipleSelectChip
                  options={ModuleSelectOptions}
                  value={watch("module")||""}
                  label="Módulo"
                  changeEventAction={(value)=>changeModule(value as ModuleType[])}
                />
              </Grid>
            </Grid>
          </List>
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
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                      }}
                      value={(() => {
                        const date_after = watch("date_after");
                        if (date_after === undefined) {
                          return null;
                        }
                        return isValid(new Date(date_after))
                          ? new Date(date_after)
                          : null;
                      })()}
                      inputRef={field.ref}
                      format="dd/MM/yyyy"
                      onChange={(date) => {
                        isValid(date) &&
                          date &&
                          field.onChange(format(new Date(date), "yyyy-MM-dd"));
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
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                      }}
                      value={(() => {
                        const date_before = watch("date_before");
                        if (date_before === undefined) {
                          return null;
                        }
                        return isValid(new Date(date_before))
                          ? new Date(date_before)
                          : null;
                      })()}
                      inputRef={field.ref}
                      onChange={(date) => {
                        isValid(date) &&
                          date &&
                          field.onChange(format(new Date(date), "yyyy-MM-dd"));
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </List>
          <Divider />
        </Box>
      </Drawer>
    </>
  );
};
