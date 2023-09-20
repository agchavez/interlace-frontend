import { Button, Card, Chip, CircularProgress, Container, Divider, Grid, Table, TableContainer, TableHead, TableRow, Typography, TableCell, TableBody, styled, tableCellClasses, IconButton } from '@mui/material';
// import PalletPrintContent from "../../tracker/components/PalletPrint";
import { useAppSelector } from '../../../store/store';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import image from '../../../assets/layout.png'
import { useGetdashboardQuery } from '../../../store/auth/authApi';
import { useState, useEffect } from 'react';
import { DashboardQueryParams } from '../../../interfaces/login';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { formatDistanceToNow, formatDuration } from 'date-fns';
import { es } from 'date-fns/locale';
import { GridFilterListIcon } from '@mui/x-data-grid';

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
    const [query] = useState<DashboardQueryParams>({})
    const { data, isLoading, isFetching, refetch } = useGetdashboardQuery(query);

    useEffect(() => {
            refetch()
        
    }, [refetch])


    return <Container maxWidth="xl">

        <Grid container sx={{ mt: 3 }} spacing={2} >
            <Grid item xs={12} justifyContent={"flex-end"} display={"flex"} >
                <Chip
                    label="Hoy"
                    variant='outlined'
                    color="secondary"
                    clickable
                    icon={
                        isLoading || isFetching ? <CircularProgress size={20} /> : <GridFilterListIcon />
                    }
                />
            </Grid>

            <Grid item xs={12} md={8} >
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
            <Grid item xs={12} md={4} >
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
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            {data?.time_average === 0 || data?.time_average ===  undefined ? "--": (
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
                                    size="small"
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
                            T1 - En atención
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
                                            formatDistanceToNow(new Date(row?.created_at), { addSuffix: true, locale: es})
                                        }</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" color="primary" aria-label="add to shopping cart">
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
                    <Button variant="text" color="primary" size="medium" sx={{ mt: 1 }} endIcon={<ArrowForwardIcon />}>
                        Ver más
                    </Button>
                </Card>

            </Grid>


        </Grid>
    </Container>
}