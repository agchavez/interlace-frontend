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
  TextField,
} from "@mui/material";
import { FC, useEffect } from "react";
import FilterListTwoToneIcon from "@mui/icons-material/FilterListTwoTone";
import { Controller, useForm } from "react-hook-form";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import { useAppSelector } from "../../../store";
import { ProductSelect } from "../../ui/components/ProductSelect";
import { NearExpirationQueryParams, Product } from "../../../interfaces/tracking";

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

export interface FormFilterNearExpiration {
  distribution_center: number | undefined;
  product: number | undefined;
  productos: Product[];
  days: number | null;
}

interface FilterNearExpirationProps {
  open: boolean;
  handleClose?: () => void;
  handleFilter: (data: FormFilterNearExpiration) => void;
  query: NearExpirationQueryParams
}
export const FilterNearExpiration: FC<FilterNearExpirationProps> = ({
  open,
  handleClose,
  handleFilter,
  query,
}) => {
  //const { reportPallets } = useAppSelector((state) => state.ui);
  const { disctributionCenters } = useAppSelector((state) => state.maintenance);
  const { user } = useAppSelector((state) => state.auth);
  const { control, watch, setValue, getValues } =
    useForm<FormFilterNearExpiration>({
      defaultValues: {
        distribution_center: user?.centro_distribucion || undefined,
        product: undefined,
        days: 60,
        productos: []
      },
    });

  useEffect(() => {
    const data = getValues();
    handleFilter(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("distribution_center"), watch("product"), watch("days"), watch("productos")]);

  const handleReset = () => {
    setValue("distribution_center", user?.centro_distribucion || undefined);
    setValue("product", undefined);
    setValue("productos", [])
    setValue("days", 60);
  };
  useEffect(() => {
    if (open) {
      setValue("productos", query.productos)
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
                // Al poner el cursor encima del icono se muestra el texto
                title="Limpiar filtros"
              >
                <RotateLeftIcon />
              </IconButton>
            </div>
          </div>
          <Divider />
          <List>
            <Grid container sx={{ p: 1 }} spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="outlined-basic"
                  label="días"
                  variant="outlined"
                  size="small"
                  type="number"
                  value={watch("days")}
                  onChange={(e) => {
                    const value = +e.currentTarget.value;
                    if (value > 0) {
                      setValue("days", value);
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}> 
                <ProductSelect
                  control={control}
                  name="product"
                  ProductId={watch("product")}
                  placeholder="Producto"
                  onChange={(p)=>p && addProduct(p)}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="distribution_center"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" fullWidth>
                      <InputLabel id="distribution_center">
                        Centro de distribución
                      </InputLabel>
                      <Select
                        labelId="distribution_center"
                        id="distribution_center"
                        {...field}
                        disabled={user?.distribution_centers.length === 1}
                        label="Centro de distribución"
                        sx={{
                          maxHeight: 300,
                        }}
                        MenuProps={MenuProps}
                      >
                        {user?.distribution_centers.map((item) => (
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
        </Box>
      </Drawer>
    </>
  );
};
