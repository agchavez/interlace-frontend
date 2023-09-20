import { Drawer, Box, List, ListItem, ListItemText, Divider, Typography, FormGroup, Checkbox, FormControlLabel, TextField, Grid } from "@mui/material"
import { FC } from "react"
import FilterListTwoToneIcon from '@mui/icons-material/FilterListTwoTone';
import { useForm } from "react-hook-form";
import { TrailerSelect, TransporterSelect } from "../../ui/components";


enum FilterDate {
    TODAY = 'today',
    WEEK = 'week',
    MONTH = 'month',
    YEAR = 'year',
}

interface FormFilterTrack {
    search: string,
    trailer?: number,
    transporter?: number,
    date_after: string,
    date_before: string,
    date_range: FilterDate
}

interface FilterManageProps {
    open: boolean,
    handleClose?: () => void
}
export const FilterManage: FC<FilterManageProps> = ({ open, handleClose }) => {


    const { control, register, watch, setValue } = useForm<FormFilterTrack>({
        defaultValues: {
            search: '',
            trailer: undefined,
            transporter: undefined,
            date_after: '',
            date_before: '',
            date_range: FilterDate.TODAY
        }
    })


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
                        <FilterListTwoToneIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div" fontWeight={200} lineHeight="2rem">
                            Filtros
                        </Typography>
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
                        <Grid container  sx={{ p: 1 }} spacing={2}>
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
                                    onChange={() => setValue('date_range', FilterDate.TODAY)}
                                />} label={<Typography variant="body2" component="span" fontWeight={200} lineHeight="2rem"> Hoy </Typography>} />
                                <FormControlLabel control={<Checkbox
                                    checked={watch('date_range') === FilterDate.WEEK}
                                    onChange={() => setValue('date_range', FilterDate.WEEK)}
                                />} label={<Typography variant="body2" component="span" fontWeight={200} lineHeight="2rem"> Esta semana </Typography>} />
                                <FormControlLabel control={<Checkbox
                                    checked={watch('date_range') === FilterDate.MONTH}
                                    onChange={() => setValue('date_range', FilterDate.MONTH)}
                                />} label={<Typography variant="body2" component="span" fontWeight={200} lineHeight="2rem"> Este mes </Typography>} />
                                <FormControlLabel control={<Checkbox
                                    checked={watch('date_range') === FilterDate.YEAR}
                                    onChange={() => setValue('date_range', FilterDate.YEAR)}
                                />} label={<Typography variant="body2" component="span" fontWeight={200} lineHeight="2rem"> Este año </Typography>} />
                            </FormGroup>
                        </ListItem>

                    </List>
                </Box>
            </Drawer>
        </>
    )
}
