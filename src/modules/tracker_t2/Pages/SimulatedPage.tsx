import { ArrowBack } from "@mui/icons-material"
import { Box, Button, Card, CircularProgress, Container, Divider, Grid, IconButton, LinearProgress, Pagination, Stack, Typography } from "@mui/material"
import { useGetT2TrackingByIdQuery } from "../../../store/seguimiento/trackerApi";
import { useAppDispatch, useAppSelector } from "../../../store";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { AutoCompleteBase } from "../../ui/components/BaseAutocomplete";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Datum, SimulatedForm } from "../../../interfaces/trackingT2";
import { format, parseISO } from "date-fns";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloudDownloadTwoToneIcon from '@mui/icons-material/CloudDownloadTwoTone';
import { exportToXLSX } from "../../../utils/exportToCSV";
import { setSimulatedQueryParams } from "../../../store/ui/uiSlice";

interface ExportSimulated {
    ruta: string;
    conductor: string;
    producto: string;
    cliente: string;
    cantidad: string;
    fecha: string;
    tracker: string;
    lote: string;
    tiempo: string | number;
}



const SimulatedPage = () => {

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { loading } = useAppSelector(state => state.seguimiento.t2Tracking);
    const { simulatedQueryParams } = useAppSelector(state => state.ui);
    const [loadingLocal, setloadingLocal] = useState(false);
    const [loadingExport, setloadingExport] = useState<boolean>(false);
    const [datalocal, setdatalocal] = useState<Datum[]>([]);
    const navigae = useNavigate();
    const dispatch = useAppDispatch();
    const { control, watch, getValues } = useForm<SimulatedForm>({
        defaultValues: simulatedQueryParams
    });

    const [page, setPage] = useState(1);
    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error, isLoading } = useGetT2TrackingByIdQuery(id || skipToken,
        {
            skip: !id
        }
    );

    const handleExport = async () => {
        setloadingExport(true);
        const dataExport: ExportSimulated[] = [];
        datalocal.forEach((item) => {
            // Si es un array de fechas
            if (Array.isArray(item.fecha_vencimiento)) {
                item.fecha_vencimiento.forEach((fecha, index) => {
                    dataExport.push({
                        ruta: item.TOUR_ID.toString(),
                        conductor: item.Conductor.toString(),
                        cliente: item.Nombre.toString(),
                        producto: item.Cod_Mat.toString(),
                        cantidad: item.Cant_UMV.toString(),
                        fecha: format(new Date(parseISO(fecha.toString())), 'dd/MM/yyyy'),
                        tracker: item.tracker?.toString().padStart(5, "0") || '--',
                        lote: Array.isArray(item.lote) ? item.lote[index] || '--' : item.lote || '--',
                        tiempo: item.time_in_warehouse || '--'
                    })
                })
                return
            }

            dataExport.push({
                ruta: item.TOUR_ID.toString(),
                conductor: item.Conductor.toString(),
                producto: item.Cod_Mat.toString(),
                cliente: item.Nombre.toString(),
                cantidad: item.Cant_UMV.toString(),
                fecha: Array.isArray(item.fecha_vencimiento) ? item.fecha_vencimiento.map((fecha) => (
                    format(new Date(parseISO(fecha.toString())), 'dd/MM/yyyy')
                )).join(',') : format(new Date(parseISO(item.fecha_vencimiento.toString())), 'dd/MM/yyyy'),
                tracker: item.tracker?.toString().padStart(5, "0") || '--',
                lote: Array.isArray(item.lote) ? item.lote.join(',') : item.lote || '--',
                tiempo: item.time_in_warehouse || '--'
            })
        });
        const headers = [
            'Ruta',
            'Conductor',
            'Producto',
            'Cliente',
            'Cantidad',
            'Fecha',
            'Tracker',
            'Lote',
            'Tiempo en bodega'
        ];

        await exportToXLSX({
            data: [headers, ...dataExport.map((tr) => [
                tr.ruta,
                tr.conductor,
                tr.producto,
                tr.cliente,
                tr.cantidad,
                tr.fecha,
                'TRK-' + tr.tracker.toString().padStart(5, "0"),
                tr.lote,
                tr.tiempo
            ])],
            filename: `reporte_simulacion_${format(
                new Date(),
                "dd-MM-yyyy"
            )}.xlsx`,
        });
        setloadingExport(false);

    }
    // Filtro de datos
    useEffect(() => {
        const query = getValues();
        dispatch(setSimulatedQueryParams(query));

    } // eslint-disable-next-line react-hooks/exhaustive-deps
        , [watch('client'), watch('ruta'), watch('conductor'), watch('producto')]);

    useEffect(() => {
        if (data?.simulation) {
            setloadingLocal(true);
            const client = simulatedQueryParams.client;
            const ruta = simulatedQueryParams.ruta;
            const conductor = simulatedQueryParams.conductor;
            const producto = simulatedQueryParams.producto;
            // no se filtra si no hay almenos un filtro si todos son null o vacios
            if ((!client || client === '') && (!ruta || ruta === '') && (!conductor || conductor === '') && (!producto || producto === '')) {
                setloadingLocal(false);
                return
            }

            if (client || ruta || conductor || producto) {
                const newData = data.simulation.data.filter((item) => {
                    if (client && item.client_id.toString() !== client) {
                        return false;
                    }
                    if (ruta && item.TOUR_ID.toString() !== ruta) {
                        return false;
                    }
                    if (conductor && item.Conductor.toString() !== conductor) {
                        return false;
                    }
                    if (producto && item.Cod_Mat.toString() !== producto) {
                        return false;
                    }
                    return true;
                });
                setdatalocal(newData);
            } else {
                setdatalocal(data.simulation.data);
            }
            setPage(1);
            setloadingLocal(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [simulatedQueryParams]);

    useEffect(() => {
        if (data?.simulation) {
            setdatalocal(data.simulation.data);
        }
    } // eslint-disable-next-line react-hooks/exhaustive-deps
        , [data]);
    if (isLoading || loading) return <Container maxWidth="xl" sx={{ marginTop: 2 }}>
        <Box sx={{ marginBottom: 2 }}>
            <LinearProgress variant="indeterminate" value={10} />
        </Box></Container>
    if (error || !data || data?.simulation === null
    ) return <Navigate to="/tracker-t2/manage" />


    return (
        <Container maxWidth="xl" sx={{ marginTop: 2 }}>


            <Grid container spacing={0}>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                onClick={() => navigae(-1)}
                                title='Regresar'
                            >
                                <ArrowBack
                                    color='primary'
                                    fontSize='medium'
                                />
                            </IconButton>
                            <Typography variant="h4" component="h1" fontWeight={400}>
                                T2OUT-{id?.padStart(1, '0')}
                            </Typography>
                        </div>
                        <Button variant="outlined"
                            sx={{ marginRight: 1 }}
                            onClick={handleExport}
                            color="success"
                            disabled={loadingExport}
                            startIcon={
                                loadingExport ? <CircularProgress size={20} color='success' /> :
                                    <CloudDownloadTwoToneIcon />}>
                            Exportar
                        </Button>
                    </Box>
                    <Typography variant="h6" component="h2" fontWeight={200} sx={{ marginLeft: 6 }}>
                        Simulación
                    </Typography>
                    <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        fontWeight={400}
                        color={"white"}
                        align="center"
                        bgcolor={"#1c2536"}
                    >
                        T2OUT-{data.id?.toString().padStart(1, "0")}
                    </Typography>
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography variant="h6" component="h1" fontWeight={400}>
                        Filtros
                    </Typography>
                    <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6} lg={4} xl={3} sx={{ mt: 2 }}>
                        <AutoCompleteBase
                            control={control}
                            name="client"
                            options={data.simulation.client_ids.map((item) => ({
                                id: item.id.toString(),
                                label: item.nombre,
                            }))}
                            placeholder="Cliente"
                        />

                    </Grid>
                    <Grid item xs={12} md={6} lg={4} xl={3} sx={{ mt: 2 }}>
                        <AutoCompleteBase
                            control={control}
                            name="ruta"
                            options={data.simulation.tour_id_list.map((item) => ({
                                id: item.toString(),
                                label: item.toString(),
                            }))}
                            placeholder="Ruta"
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4} xl={3} sx={{ mt: 2 }}>
                        <AutoCompleteBase
                            control={control}
                            name="conductor"
                            placeholder="Conductor"
                            options={data.simulation.conductor_list.map((item) => ({
                                id: item.toString(),
                                label: item.toString(),
                            }))}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4} xl={3} sx={{ mt: 2 }}>
                        <AutoCompleteBase
                            control={control}
                            name="producto"
                            placeholder="Producto"
                            options={data.simulation.product_list.map((item) => ({
                                id: item.codigo_sap.toString(),
                                label: item.codigo_sap.toString() + ' - ' + item.nombre,
                            }))}
                        />
                    </Grid>
                </Grid>

                <Grid xs={12} sx={{ mt: 2, mb: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                        <Typography variant="h6" component="h1" fontWeight={400}>
                            Resultados
                        </Typography>
                        <Stack spacing={2} sx={{ mt: 2 }} textAlign={'center'}>
                            <Typography>
                                <span>
                                    Registros totales: {datalocal.length}
                                </span>
                            </Typography>
                            <Pagination count={
                                Math.ceil(datalocal.length / 20)
                            } page={page} onChange={handleChange} size="large" sx={{ justifyContent: 'center' }} />
                        </Stack>
                    </div>
                    <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                    {
                        datalocal.length === 0 && <Typography variant="h6" component="h1" fontWeight={400}>
                            No se encontraron resultados
                        </Typography>
                    }
                    {
                        loadingLocal && <LinearProgress variant="indeterminate" value={10} />
                    }
                    {
                        // Paginacion
                        datalocal.slice((page - 1) * 20, page * 20).map((item, index) => (
                            <Card key={index} sx={{ mt: 2, p: 1 }}>
                                <Grid container spacing={2} key={index} >
                                    <Grid item xs={6} md={4} lg={4} xl={3}>
                                        <Typography variant="body1" component="p" fontWeight={600}>
                                            Ruta:
                                        </Typography>
                                        <Divider sx={{ marginBottom: 0, marginTop: 0 }} />
                                        <Typography variant="body1" component="p" fontWeight={400}>
                                            {item.TOUR_ID}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} md={4} lg={4} xl={3}>
                                        <Typography variant="body1" component="p" fontWeight={600}>
                                            Conductor:
                                        </Typography>
                                        <Divider sx={{ marginBottom: 0, marginTop: 0 }} />
                                        <Typography variant="body1" component="p" fontWeight={400}>
                                            {item.Conductor}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} md={4} lg={4} xl={3}>
                                        <Typography variant="body1" component="p" fontWeight={600}>
                                            Producto:
                                        </Typography>
                                        <Divider sx={{ marginBottom: 0, marginTop: 0 }} />
                                        <Typography variant="body1" component="p" fontWeight={400}>
                                            {item.Cod_Mat} - {item.Producto}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} md={4} lg={4} xl={3}>
                                        <Typography variant="body1" component="p" fontWeight={600}>
                                            Cantidad:
                                        </Typography>
                                        <Divider sx={{ marginBottom: 0, marginTop: 0 }} />
                                        <Typography variant="body1" component="p" fontWeight={400}>
                                            {item.Cant_UMV}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} md={4} lg={4} xl={3}>
                                        <Typography variant="body1" component="p" fontWeight={600}>
                                            Fechas:

                                        </Typography>
                                        <Divider sx={{ marginBottom: 0, marginTop: 0 }} />
                                        <Typography variant="body1" component="p" fontWeight={400}>
                                            {
                                                // Si es un array de fechas
                                                Array.isArray(item.fecha_vencimiento) ? item.fecha_vencimiento.map((fecha, index) => (
                                                    <Typography key={index} variant="body1" component="p" fontWeight={400}>
                                                        {
                                                            format(new Date(parseISO(fecha.toString())), 'dd/MM/yyyy')
                                                        }
                                                    </Typography>
                                                )) : <Typography variant="body1" component="p" fontWeight={400}>
                                                    {
                                                        format(new Date(parseISO(item.fecha_vencimiento.toString())), 'dd/MM/yyyy')
                                                    }
                                                </Typography>
                                            }
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} md={4} lg={4} xl={3}>
                                        <Typography variant="body1" component="p" fontWeight={600}>
                                            Tracker:
                                        </Typography>
                                        <Divider sx={{ marginBottom: 0, marginTop: 0 }} />
                                        {
                                            Array.isArray(item.tracker) ? item.tracker.map((tracker) => (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                                                    <Typography variant="body1" component="p" fontWeight={400}>
                                                        TRK-{tracker?.toString().padStart(5, "0")}
                                                    </Typography>
                                                    <IconButton size="small" color="primary" aria-label="add to shopping cart" onClick={() => navigate('/tracker/detail/' + tracker)}>
                                                        <ArrowForwardIcon />
                                                    </IconButton>
                                                </Box>
                                            )) : <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                                                <Typography variant="body1" component="p" fontWeight={400}>
                                                    TRK-{item.tracker?.toString().padStart(5, "0")}
                                                </Typography>
                                                <IconButton size="small" color="primary" aria-label="add to shopping cart" onClick={() => navigate('/tracker/detail/' + item.tracker)}>
                                                    <ArrowForwardIcon />
                                                </IconButton>
                                            </Box>
                                        }

                                    </Grid>
                                    <Grid item xs={6} md={4} lg={4} xl={3}>
                                        <Typography variant="body1" component="p" fontWeight={600}>
                                            Lote:
                                        </Typography>
                                        <Divider sx={{ marginBottom: 0, marginTop: 0 }} />
                                        {
                                            // sI ES UN ARRAY DE LOTES
                                            Array.isArray(item.lote) ? item.lote.map((lote, index) => (
                                                <Typography key={index} variant="body1" component="p" fontWeight={400}>
                                                    {
                                                        lote
                                                    }
                                                </Typography>
                                            )) : <Typography variant="body1" component="p" fontWeight={400}>
                                                {
                                                    item.lote || '--'
                                                }
                                            </Typography>
                                        }
                                    </Grid>
                                    <Grid item xs={6} md={4} lg={4} xl={3}>
                                        <Typography variant="body1" component="p" fontWeight={600}>
                                            Tiempo en bodega:
                                        </Typography>
                                        <Divider sx={{ marginBottom: 0, marginTop: 0 }} />
                                        <Typography variant="body1" component="p" fontWeight={400}>
                                            {item.time_in_warehouse} días
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Card>
                        ))
                    }


                </Grid>
            </Grid>
        </Container>
    )
}

export default SimulatedPage