import { FC, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useAppSelector } from "../../../store";
import { Box, Drawer, Typography, IconButton, Divider, List, Grid, TextField, FormControlLabel, Checkbox, ListItem, ListItemText, FormGroup, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import FilterListTwoToneIcon from '@mui/icons-material/FilterListTwoTone';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';

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

export interface FormFilterT2 {
    search: string;
    id? : number | null;
    date_after: string;
    date_before: string;
    status: "COMPLETE" | "PENDING" | "EDITED";
    distribution_center?: number;
  }


interface FilterT2ManageProps {
    open: boolean;
    handleClose?: () => void;
    handleFilter: (data: FormFilterT2) => void;
  }


export const FilterPreSale:FC<FilterT2ManageProps> = ({open, handleClose, handleFilter}) => {
    
    
    const { managerT2QueryParams } = useAppSelector((state) => state.ui);
    const { user } = useAppSelector((state) => state.auth);
    const { disctributionCenters } = useAppSelector((state) => state.maintenance);
  
    const {control, register, watch, setValue, getValues } =
    useForm<FormFilterT2>({
      defaultValues: {
        id: managerT2QueryParams.id ? Number(managerT2QueryParams.id) : null,
        search: managerT2QueryParams.search,
        date_after: managerT2QueryParams.date_after,
        date_before: managerT2QueryParams.date_before,
        status: managerT2QueryParams.status,
        distribution_center: managerT2QueryParams.distribution_center ? managerT2QueryParams.distribution_center : (user?.centro_distribucion || undefined),  
      },
    });
  
    useEffect(() => {
        const data = getValues();
        handleFilter(data);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [ watch("date_after"), watch("date_before"), watch("search"), watch("status"), watch("distribution_center"), watch('id') ]);

      const handleReset = () => {
        setValue("search", "");
        setValue("date_after", "");
        setValue("date_before", "");
        setValue("status", "PENDING");
        setValue("distribution_center", user?.centro_distribucion || undefined);
        setValue("id", null);
        };

    return (
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
                  id="outlined-basic"
                  label="Tracking"
                  variant="outlined"
                  autoComplete="off"
                  size="small"
                  type="number"
                  fullWidth
                  {...register("id")}
                  value={watch("id")}
                />
              </Grid>
            </Grid>
          </List>
          <Divider />
          <List>
            <Grid container sx={{ p: 1 }} spacing={2}>
              
              <Grid item xs={12}>
              <ListItem disablePadding >
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
                        value={watch('distribution_center')}
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
            </ListItem>
              </Grid>
            </Grid>
            <ListItem disablePadding sx={{ pl: 1, pr: 1, mt: 1 }}></ListItem>
          </List>
            <Divider />
          <List>
            <ListItem disablePadding sx={{ pl: 2 }}>
              <ListItemText primary={"Estado"} />
            </ListItem>
            <ListItem disablePadding sx={{ pl: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch("status") === "COMPLETE"}
                      onChange={() => setValue("status", "COMPLETE")}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      component="span"
                      fontWeight={200}
                      lineHeight="2rem"
                    >
                      {" "}
                      Completado{" "}
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch("status") === "PENDING"}
                      onChange={() => setValue("status", "PENDING")}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      component="span"
                      fontWeight={200}
                      lineHeight="2rem"
                    >
                      {" "}
                      Pendiente{" "}
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch("status") === "EDITED"}
                      onChange={() => setValue("status", "EDITED")}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      component="span"
                      fontWeight={200}
                      lineHeight="2rem"
                    >
                      {" "}
                      En atención{" "}
                    </Typography>
                  }
                />
              </FormGroup>
            </ListItem>
          </List>
        </Box>
        </Drawer>
  )
}
