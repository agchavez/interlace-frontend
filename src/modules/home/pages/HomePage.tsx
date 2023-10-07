import { Button, Card, Chip, CircularProgress, Container, Divider, Grid, Table, TableContainer, TableHead, TableRow, Typography, TableCell, TableBody, styled, tableCellClasses, IconButton, alpha, MenuProps, Menu, MenuItem } from '@mui/material';
// import PalletPrintContent from "../../tracker/components/PalletPrint";
import { useAppSelector } from '../../../store/store';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import image from '../../../assets/layout.png'
import { useGetdashboardQuery } from '../../../store/auth/authApi';
import { useState, useEffect } from 'react';
import { DashboardQueryParams } from '../../../interfaces/login';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { format, formatDistanceToNow, formatDuration } from 'date-fns';
import { es } from 'date-fns/locale';
import { GridFilterListIcon } from '@mui/x-data-grid';
import { setDashboardQueryParams } from '../../../store/ui/uiSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

enum FilterDate {
    TODAY = 'Hoy',
    WEEK = 'Esta semana',
    MONTH = 'Este mes',
    YEAR = 'Este año',
  }

  
const StyledMenu = styled((props: MenuProps) => (
    <Menu
        elevation={0}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        {...props}
    />
))(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: 6,
        marginTop: theme.spacing(1),
        minWidth: 180,
        color:
            theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
        boxShadow:
            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
        '& .MuiMenu-list': {
            padding: '4px 0',
        },
        '& .MuiMenuItem-root': {
            '& .MuiSvgIcon-root': {
                fontSize: 18,
                color: theme.palette.text.secondary,
                marginRight: theme.spacing(1.5),
            },
            '&:active': {
                backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.action.selectedOpacity,
                ),
            },
        },
    },
}));


const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "#f3f4f6",
        color: theme.palette.common.black,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

export default function HomePage() {
    const {
        user
    } = useAppSelector(state => state.auth);
    const {
        dashboardQueryParams
    } = useAppSelector(state => state.ui);
    const [query, setQuery] = useState<DashboardQueryParams>(dashboardQueryParams)
    const { data, isLoading, isFetching, refetch } = useGetdashboardQuery(query);

    useEffect(() => {
        refetch()

    }, [refetch])

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openFilter = Boolean(anchorEl);
    const dispatch = useDispatch();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleFilter = (filter: FilterDate) => {
        const date = new Date();
        let valueDate;
        let start_date;
        let end_date;

        switch (filter) {
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
                break;
        }

        setQuery({ ...query, 
            filterDate: filter,
            start_date,
            end_date
        })
        refetch()
        handleClose()
    }

    useEffect(() => {
     dispatch(setDashboardQueryParams(query));
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query])

    const navigate = useNavigate();

    return <Container maxWidth="xl">

        <Grid container sx={{ mt: 3 }} spacing={2} >
            <Grid item xs={12} justifyContent={"flex-end"} display={"flex"} >
                <Chip
                    label={query.filterDate}
                    variant='outlined'
                    color="secondary"
                    clickable
                    onClick={handleClick}
                    icon={
                        isLoading || isFetching ? <CircularProgress size={20} /> : <GridFilterListIcon />
                    }
                />
                <StyledMenu
                    id="demo-customized-menu"
                    MenuListProps={{
                        'aria-labelledby': 'demo-customized-button',
                    }}
                    anchorEl={anchorEl}
                    open={openFilter}
                    onClose={handleClose}
                >
                    <MenuItem onClick={() => handleFilter(FilterDate.TODAY)} >
                        Hoy
                    </MenuItem>
                    <MenuItem onClick={() => handleFilter(FilterDate.WEEK)} >
                        Esta semana
                    </MenuItem>
                    <MenuItem onClick={() => handleFilter(FilterDate.MONTH)} >
                        Este mes
                    </MenuItem>
                    <MenuItem onClick={() => handleFilter(FilterDate.YEAR)} >
                        Este año
                    </MenuItem>

                </StyledMenu>
            </Grid>

            <Grid item xs={12} md={6} >
                <Card elevation={0} sx={{
                    p: 2, borderRadius: 2
                }} >
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <div>
                            <img src={image} alt="layout" width={40} />

                        </div>
                        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                        <div>
                            <Typography variant="body1" component="h6" style={{ textAlign: "start" }} color={"secondary"} fontWeight={200}>
                                Bienvenido(a)
                            </Typography>
                            <Divider />
                            <Typography variant="h6" component="p" style={{ textAlign: "start" }} color={"secondary"} fontWeight={400}>
                                {user?.first_name} {user?.last_name}
                            </Typography>
                        </div>
                    </div>

                </Card>

            </Grid>
            <Grid item xs={12} md={6} >
                <Card elevation={1} sx={{
                    p: 2, borderRadius: 2,
                }} >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                        <div>
                            <Typography variant="body1" component="h6" style={{ textAlign: "start" }} color={"secondary"} fontWeight={200}>
                                Tiempo promedio de atención
                            </Typography>
                            <Divider />
                            <Typography variant="h6" component="p" style={{ textAlign: "start" }} color={"secondary"} fontWeight={400}>
                                {user?.centro_distribucion_name}
                            </Typography>
                        </div>
                        <div>
                        <Typography variant="h2" component="p" style={{ textAlign: "start" }} color={"secondary"} fontWeight={400}>
                                TAT
                            </Typography>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            {data?.time_average === 0 || data?.time_average === undefined ? "--" : (
                                <Chip
                                    label={formatDuration(
                                        {
                                            hours: Math.floor(data?.time_average / 3600), // Calcula las horas
                                            minutes: Math.floor((data?.time_average % 3600) / 60), // Calcula los minutos
                                        },
                                        { locale: es, format: ['hours', 'minutes'], delimiter: ' y ' }
                                    )}
                                    variant='outlined'
                                    color="success"
                                    size="medium"
                                    sx={{
                                        fontSize: '30px'
                                    }}
                                    icon={
                                        isLoading || isFetching ? <CircularProgress size={20} /> : <AccessTimeIcon />
                                    }
                                />
                            )}
                        </div>
                    </div>
                </Card>

            </Grid>
            <Grid item xs={12} md={6} >
                <Card elevation={1} sx={{
                    p: 2, borderRadius: 2
                }} >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                        <Typography variant="body1" component="h6" style={{ textAlign: "start" }} color={"secondary"} fontWeight={200}>
                            T1 - Pendientes
                        </Typography>
                        {
                            isLoading || isFetching ? <CircularProgress size={20} /> : <Typography variant="h6" component="p" style={{ textAlign: "start" }} color={"secondary"} fontWeight={600}>
                                {data?.total_trackers_pending.length === 0 ? "--" : data?.total_trackers_pending.length}
                            </Typography>
                        }

                    </div>
                    <Divider />
                    <TableContainer sx={{ mt: 1 }}>
                        <Table size="small" aria-label="a dense table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell align="left">
                                        Tracking
                                    </StyledTableCell>
                                    <StyledTableCell align="left">
                                        Atraso
                                    </StyledTableCell>
                                    <StyledTableCell align="right">

                                    </StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data?.total_trackers_pending.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell align="left" component="th" scope="row">
                                            TRK-{row.id.toString().padStart(8, '0')}
                                        </TableCell>
                                        <TableCell align="left">{
                                            formatDistanceToNow(new Date(row?.created_at), { addSuffix: true, locale: es })
                                        }</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" color="primary" aria-label="add to shopping cart" onClick={() => navigate('/tracker/detail/' + row.id)}>
                                                <ArrowForwardIcon />
                                            </IconButton>

                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>

                        </Table>
                    </TableContainer>
                </Card>

            </Grid>
            <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{
                    p: 2, borderRadius: 2
                }} >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body1" component="h6" style={{ textAlign: "start" }} color={"secondary"} fontWeight={200}>
                            T1 - Completado
                        </Typography>
                        {
                            isLoading || isFetching ? <CircularProgress size={20} /> : <Typography variant="h6" component="p" style={{ textAlign: "start" }} color={"secondary"} fontWeight={600}>
                                {data?.total_trackers_completed === 0 ? "--" : data?.total_trackers_completed}
                            </Typography>
                        }
                    </div>
                    <Divider />
                    <Button variant="text" color="primary" size="medium" sx={{ mt: 1 }} endIcon={<ArrowForwardIcon />} onClick={()=> navigate('/tracker/manage/?status=COMPLETE')}>
                        Ver más
                    </Button>
                </Card>

            </Grid>


        </Grid>
    </Container>
}