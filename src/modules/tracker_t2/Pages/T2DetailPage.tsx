
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, Chip, Container, Divider, Grid, IconButton, Typography, CircularProgress, LinearProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useGetT2TrackingByIdQuery } from '../../../store/seguimiento/trackerApi';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ListOutTrackerDetail } from '../components/ListOutTrackerDetail';
import { useAppSelector } from '../../../store/store';
import { useState } from 'react';
import { DeleteT2Modal } from '../components/DeleteT2Modal';
import CloudDownloadTwoToneIcon from '@mui/icons-material/CloudDownloadTwoTone';
import { exportToXLSX } from '../../../utils/exportToCSV';
import { toast } from 'sonner';

interface T2Export {
    product_sap_code: string;
    product_name: string;
    quantity_requested: string;
    quantity_applied: string;
    expiration_date: string;
    lot: string;
    tracking: number;
    quantity_available: string;
}
const T2DetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [deleteOpen, setdeleteOpen] = useState(false);
    const [loadingExport, setloadingExport] = useState<boolean>(false);
    const { loading } = useAppSelector(state => state.seguimiento.t2Tracking);
    const navigae = useNavigate();
    const user = useAppSelector((state) => state.auth.user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error, isLoading } = useGetT2TrackingByIdQuery(id || skipToken,
        {
            skip: !id
        }
    );

    const handleDelete = () => {
        setdeleteOpen(true);
    }

    const handleExport = async () => {
        setloadingExport(true);
        const dataExport: T2Export[] = [];
        data?.output_detail_t2.forEach((item) => {
            item.details.details.forEach((detail) => {
                detail.details.forEach((detail2) => {
                    dataExport.push({
                        product_sap_code: item.product_sap_code,
                        product_name: item.product_name,
                        quantity_requested: item.quantity,
                        quantity_applied: detail2.quantity,
                        expiration_date:format(new Date(parseISO(detail.expiration_date.toString())), 'dd/MM/yyyy'),
                        lot: detail.code_name || '',
                        tracking: detail2.tracker_id,
                        quantity_available: detail2.quantity
                    })
                })
            })
        })
        if (dataExport.length === 0 ){
            toast.error(
                "No hay datos para exportar"
            )
            setloadingExport(false);
            return;
        }

        const headers = [
            "Tracking",
            "Turno",
            "Codigo",
            "Producto",
            "Pallets",
            "Fecha vencimiento",
        ];

        await exportToXLSX({
            data: [headers, ...dataExport.map((tr) => [
                "TRK-" + tr.tracking.toString().padStart(5, "0"),
                tr.lot || "",
                tr.product_sap_code,
                tr.product_name,
                tr.quantity_available,
                tr.expiration_date,
            ])],
            filename: `reporte_t2_${format(
                new Date(),
                "dd-MM-yyyy"
            )}.xlsx`,
        });
        
        setloadingExport(false);            
    }
    
    if (isLoading) return <Container maxWidth="xl" sx={{ marginTop: 2 }}>
        <Box sx={{ marginBottom: 2 }}>
            <LinearProgress variant="indeterminate" value={10} />
        </Box></Container>
    if (error || !data) return <Navigate to="/tracker-t2/manage" />

    return (
        <>
            <DeleteT2Modal
                isOpen={deleteOpen}
                onClose={() => setdeleteOpen(false)}
                id={id!}
            />

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
                            <div>
                                <Button variant="outlined" 
                                    sx={{ marginTop: 1, marginRight: 1 }} 
                                    onClick={handleExport}
                                    color="success" 
                                    disabled={loadingExport}
                                    startIcon={
                                        loadingExport ? <CircularProgress size={20} color='success' /> :
                                            <CloudDownloadTwoToneIcon />}>
                                    Exportar
                                </Button>
                                {data.status !== 'APPLIED' && user?.list_permissions?.includes('tracker.delete_outputt2model') &&
                                    <Button variant="contained" sx={{ marginTop: 1 }} color="error" onClick={handleDelete} disabled={loading}
                                        startIcon={loading ? <CircularProgress size={20} /> : null}
                                    >
                                        Eliminar
                                    </Button>}
                            </div>

                        </Box>
                        <Typography variant="h6" component="h2" fontWeight={200} sx={{ marginLeft: 6 }}>
                            {data.distributor_center_data?.name}
                        </Typography>
                        <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                    </Grid>

                    <Grid item xs={12}>
                        <Card
                            sx={{
                                borderRadius: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: 2,
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    component="h1"
                                    fontWeight={400}
                                    color={"gray.500"}
                                >
                                    Datos principales
                                </Typography>
                                <Typography>
                                    Registrado:
                                    <Chip
                                        label={formatDistanceToNow(
                                            new Date(data?.created_at),
                                            { addSuffix: true, locale: es }
                                        )}
                                    />
                                </Typography>
                            </Box>
                            <Divider />
                            <Box sx={{ padding: 2 }}>
                                <Grid container spacing={2}>

                                    <Grid item xs={12} md={6} lg={4} xl={4}>
                                        <Typography
                                            variant="body1"
                                            component="h1"
                                            fontWeight={400}
                                            color={"gray.500"}
                                        >
                                            Usuario registro
                                        </Typography>
                                        <Divider />
                                        <Typography
                                            variant="body1"
                                            component="h1"
                                            fontWeight={600}
                                            color={"gray.500"}
                                        >
                                            {data.user_name || '--'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6} lg={4} xl={4}>
                                        <Typography
                                            variant="body1"
                                            component="h1"
                                            fontWeight={400}
                                            color={"gray.500"}
                                        >
                                            Usuario reviso
                                        </Typography>
                                        <Divider />
                                        <Typography
                                            variant="body1"
                                            component="h1"
                                            fontWeight={600}
                                            color={"gray.500"}
                                        >
                                            {data.user_check_name || '--'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6} lg={4} xl={4}>
                                        <Typography
                                            variant="body1"
                                            component="h1"
                                            fontWeight={400}
                                            color={"gray.500"}
                                        >
                                            Usuario autorizo
                                        </Typography>
                                        <Divider />
                                        <Typography
                                            variant="body1"
                                            component="h1"
                                            fontWeight={600}
                                            color={"gray.500"}
                                        >
                                            {data?.user_applied_name || '--'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6} lg={4} xl={4}>
                                        <Typography
                                            variant="body1"
                                            component="h1"
                                            fontWeight={400}
                                            color={"gray.500"}
                                        >
                                            Ultima actualización:
                                        </Typography>
                                        <Divider />
                                        <Typography
                                            variant="body1"
                                            component="h1"
                                            fontWeight={600}
                                            color={"gray.500"}
                                        >
                                            {data.last_update ? format(
                                                new Date(data.last_update),
                                                "dd/MM/yyyy HH:mm"
                                            ) : '--'}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} md={6} lg={4} xl={4}>
                                        <Typography
                                            variant="body1"
                                            component="h1"
                                            fontWeight={400}
                                            color={"gray.500"}
                                        >
                                            Estado:
                                        </Typography>
                                        <Divider />
                                        <Typography
                                            variant="body1"
                                            component="h1"
                                            fontWeight={600}
                                            color={"gray.500"}
                                        >
                                            <Chip
                                                sx={{ mt: 0.5 }}
                                                label={
                                                    data?.status === "APPLIED"
                                                        ? "Completado"
                                                        : data?.status === "REJECTED"
                                                            ? "Rechazado"
                                                            : data?.status === "AUTHORIZED"
                                                                ? "Autorizado"
                                                                : "En revisión"
                                                }
                                                color={
                                                    data?.status === "APPLIED"
                                                        ? "success"
                                                        : data?.status === "REJECTED"
                                                            ? "error"
                                                            : "info"
                                                }
                                                size="medium"
                                                variant="outlined"
                                            />
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Grid
                                            container
                                            direction="row"
                                            justifyContent="space-between"
                                        >
                                            <Typography
                                                variant="body1"
                                                component="h1"
                                                fontWeight={400}
                                                color={"gray.500"}
                                            >
                                                Observaciones
                                            </Typography>
                                        </Grid>
                                        <Divider />
                                        <pre>
                                            <Typography
                                                variant="body1"
                                                component="h1"
                                                fontWeight={600}
                                                color={"gray.500"}
                                                // que se acomode al texto
                                                style={{ whiteSpace: "pre-wrap" }}
                                            >
                                                {data?.observations || "--"}
                                            </Typography>
                                        </pre>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Card>
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
                        {
                            data.output_detail_t2.map((item, index) => (
                                <Accordion sx={{ marginBottom: '10px', marginTop: '10px' }} key={index}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}
                                        aria-controls={`${item.id}bh-content`}
                                        id={`${item.id}bh-header`}
                                    >
                                        <Typography sx={{ width: '90%', flexShrink: 0 }}>
                                            {item.product_sap_code + ' - ' + item.product_name}
                                            <Typography sx={{ color: 'gray' }}>
                                                {item.observations}
                                            </Typography>
                                        </Typography>
                                        <Typography sx={{ color: item.details.total_quantity === +item.quantity ? 'green' : 'red' }}>
                                            {item.details.total_quantity} de {item.quantity}
                                        </Typography>

                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                {/* {item.details.details.map((detail) => {
                                                return ( */}
                                                <ListOutTrackerDetail
                                                    data={item.details.details}
                                                    key={Math.random()}
                                                    total_quantity={item.details.total_quantity}
                                                />
                                                {/* );
                                            })} */}
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            ))
                        }
                    </Grid>
                </Grid>
            </Container>
        </>

    )
}

export default T2DetailPage