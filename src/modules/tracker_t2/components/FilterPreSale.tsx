import { FC, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useAppSelector } from "../../../store";
import { Box, Drawer, Typography, Divider, List, Grid, TextField, FormControlLabel, Checkbox, ListItem, ListItemText, FormGroup, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import FilterListTwoToneIcon from '@mui/icons-material/FilterListTwoTone';
import { Status } from "../../../interfaces/trackingT2";
import { DatePicker } from "@mui/x-date-pickers";
import { format, isValid } from "date-fns";
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

const isValidDate = (dateString : string) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
};

export interface FormFilterT2 {
    search: string;
    id? : number | null;
    date_after: string;
    date_before: string;
    status: Status[];
    pre_sale_date: string | null;
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
      }, [ watch("date_after"), watch("date_before"), watch("search"), watch("status"), watch("distribution_center"), watch('id'), watch('pre_sale_date') ]);

      const handleReset = () => {
        setValue("search", "");
        setValue("date_after", format(new Date(), 'yyyy-MM-dd 00:00:00'));
        setValue("date_before", format(new Date(), 'yyyy-MM-dd 23:59:59'));
        setValue("status", ['APPLIED']);
        setValue("distribution_center", user?.centro_distribucion || undefined);
        setValue("id", null);
        setValue("pre_sale_date", null);
        handleFilter({
          search: "",
          date_after: format(new Date(), 'yyyy-MM-dd 00:00:00'),
          date_before: format(new Date(), 'yyyy-MM-dd 23:59:59'),
          status: ['APPLIED'],
          distribution_center: user?.centro_distribucion || undefined,
          id: null,
          pre_sale_date: null,
        });

        handleClose && handleClose();
        };

      const handleStatusSelect = (checked: boolean, value: Status) => {
        const status = getValues("status");
        if (checked) {
          setValue("status", [...status, value]);
        } else {
          setValue(
            "status",
            status.filter((item) => item !== value)
          );
        }
      };
    return (
        <Drawer anchor="right" open={open} onClose={handleClose}>
        <Box
          sx={{ width: 350 }}
          role="presentation"
        >
          <StandardDrawerHeader
            title="Filtros"
            icon={<FilterListTwoToneIcon />}
            onClose={handleClose || (() => {})}
            onReset={handleReset}
          />
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
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Controller
                  name="pre_sale_date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Fecha de preventa"
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      value={
                        watch("pre_sale_date") ? isValidDate(watch("pre_sale_date") as string)
                          ? new Date(watch("pre_sale_date") as string)
                          : null
                          : null
                      }
                      inputRef={field.ref}
                      format="dd/MM/yyyy"
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
            </ListItem>
              </Grid>
            </Grid>
            <ListItem disablePadding sx={{ pl: 1, pr: 1, mt: 1 }}></ListItem>
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
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      value={ isValid(new Date(watch("date_after") )) ? new Date(watch("date_after")) : null}
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
                      label="Menor que"
                      format="dd/MM/yyyy"
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      value={ isValid(new Date(watch("date_before") )) ? new Date(watch("date_before")) : null}
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
                      checked={watch("status").includes("APPLIED")}
                      onChange={() => handleStatusSelect(!watch("status").includes("APPLIED"), "APPLIED")}
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
                      checked={watch("status").includes("CREATED")}
                      onChange={() => handleStatusSelect(!watch("status").includes("CREATED"), "CREATED")}
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
                      checked={watch("status").includes("CHECKED")}
                      onChange={() => handleStatusSelect(!watch("status").includes("CHECKED"), "CHECKED")}
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
                      Revisado{" "}
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={watch("status").includes("REJECTED")}
                      onChange={() => handleStatusSelect(!watch("status").includes("REJECTED"), "REJECTED")}
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
                      Rechazado{" "}
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
