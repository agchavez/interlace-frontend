import { Drawer, Box, List, ListItem, ListItemText, Divider, Typography, FormGroup, Checkbox, FormControlLabel, TextField, Grid, IconButton } from "@mui/material"
import { FC, useEffect } from "react"
import FilterListTwoToneIcon from '@mui/icons-material/FilterListTwoTone';
import { useForm } from "react-hook-form";
import { TrailerSelect, TransporterSelect } from "../../ui/components";
import { FilterDate } from "../../../interfaces/tracking";
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import { format } from "date-fns";
import { useAppSelector } from "../../../store";


export interface FormFilterTrack {
    search: string,
    trailer?: number,
    transporter?: number,
    date_after: string,
    date_before: string,
    date_range: FilterDate
}

interface FilterManageProps {
    open: boolean,
    handleClose?: () => void,
    handleFilter: (data: FormFilterTrack) => void
}
export const FilterManage: FC<FilterManageProps> = ({ open, handleClose, handleFilter }) => {
    const {
        manageQueryParams
    } = useAppSelector(state => state.ui);

    const { control, register, watch, setValue, getValues } = useForm<FormFilterTrack>({
        defaultValues: {
            search: manageQueryParams.search,
            trailer: manageQueryParams?.trailer?.[0],
            transporter: manageQueryParams.transporter? manageQueryParams.transporter[0] : undefined,
            date_after: manageQueryParams.date_after,
            date_before: manageQueryParams.date_before,
            date_range: manageQueryParams.filter_date
        }
    });

    useEffect(() => {
        const data = getValues()

        handleFilter(data)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watch('date_after'), watch('date_before'), watch('date_range'), watch('search'), watch('trailer'), watch('transporter')])

    const handleReset = () => {
        setValue('search', '')
        setValue('trailer', undefined)
        setValue('transporter', undefined)
        setValue('date_after', '')
        setValue('date_before', '')
        setValue('date_range', FilterDate.TODAY)
    }

    const handleFilterDate = (value: FilterDate) => {
        setValue('date_range', value)
        const date = new Date()
        let valueDate;
        let start_date;
        let end_date;

        switch (value) {
            case FilterDate.TODAY:
                start_date = format(date, "yyyy-MM-dd");
                end_date = format(date, "yyyy-MM-dd");
                break;
            case FilterDate.WEEK:
                valueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7);
                start_date = format(valueDate, "yyyy-MM-dd");
                end_date = format(date, "yyyy-MM-dd");
                break;
            case FilterDate.MONTH:
                valueDate = new Date(date.getFullYear(), date.getMonth(),1);
                start_date = format(valueDate, "yyyy-MM-dd");
                end_date = format(date, "yyyy-MM-dd");
                break;
            case FilterDate.YEAR:
                valueDate = new Date(date.getFullYear(), date.getMonth() - date.getMonth() , 1);
                start_date = format(valueDate, "yyyy-MM-dd");
                end_date = format(date, "yyyy-MM-dd");
                break;
            default:
                start_date = format(date, "yyyy-MM-dd");
                end_date = format(date, "yyyy-MM-dd");
                break;
        }
        setValue('date_after', start_date)
        setValue('date_before', end_date)
    }

    useEffect(() => {
        if (open) {
            setValue('search', manageQueryParams.search || '')
            setValue('trailer', manageQueryParams.trailer? manageQueryParams.trailer[0] : undefined)
            setValue('transporter', manageQueryParams.transporter? manageQueryParams.transporter[0] : undefined)
            setValue('date_after', manageQueryParams.date_after!)
            setValue('date_before', manageQueryParams.date_before!)
            setValue('date_range', manageQueryParams.filter_date!)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])
    
    return (
        <>
            <Drawer anchor="right" open={open} onClose={handleClose}>
                <Box
                    sx={{ width: 350 }}
                    role="presentation"
                //   onClick={toggleDrawer(anchor, false)}
                //   onKeyDown={toggleDrawer(anchor, false)}
                >
                    <div style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }}>
                        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>

                            <FilterListTwoToneIcon sx={{ mr: 1 }} />
                            <Typography variant="h6" component="div" fontWeight={200} lineHeight="2rem">
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
                                    {...register('search')}

                                />

                            </Grid>

                        </Grid>
                    </List>
                    <Divider />
                    <List>
                        <Grid container sx={{ p: 1 }} spacing={2}>
                            <Grid item xs={12}>
                                <TrailerSelect
                                    control={control}
                                    name="trailer"
                                    trailerId={watch('trailer')}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TransporterSelect
                                    control={control}
                                    name="transporter"
                                    transporterId={watch('transporter')}
                                />

                            </Grid>
                        </Grid>
                        <ListItem disablePadding sx={{ pl: 1, pr: 1, mt: 1 }}>
                        </ListItem>
                    </List>
                    <Divider />
                    <List>
                        <ListItem disablePadding sx={{ pl: 2 }}>
                            <ListItemText primary={"Fecha registro"} />
                        </ListItem>
                        <ListItem disablePadding sx={{ pl: 2 }}>
                            <FormGroup>
                                <FormControlLabel control={<Checkbox
                                    checked={watch('date_range') === FilterDate.TODAY}
                                    onChange={() => handleFilterDate(FilterDate.TODAY)}
                                />} label={<Typography variant="body2" component="span" fontWeight={200} lineHeight="2rem"> Hoy </Typography>} />
                                <FormControlLabel control={<Checkbox
                                    checked={watch('date_range') === FilterDate.WEEK}
                                    onChange={() => handleFilterDate(FilterDate.WEEK)}
                                />} label={<Typography variant="body2" component="span" fontWeight={200} lineHeight="2rem"> Esta semana </Typography>} />
                                <FormControlLabel control={<Checkbox
                                    checked={watch('date_range') === FilterDate.MONTH}
                                    onChange={() => handleFilterDate(FilterDate.MONTH)}
                                />} label={<Typography variant="body2" component="span" fontWeight={200} lineHeight="2rem"> Este mes </Typography>} />
                                <FormControlLabel control={<Checkbox
                                    checked={watch('date_range') === FilterDate.YEAR}
                                    onChange={() => handleFilterDate(FilterDate.YEAR)}
                                />} label={<Typography variant="body2" component="span" fontWeight={200} lineHeight="2rem"> Este año </Typography>} />
                            </FormGroup>
                        </ListItem>

                    </List>
                </Box>
            </Drawer>
        </>
    )
}
