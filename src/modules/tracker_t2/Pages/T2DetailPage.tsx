
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, Chip, Container, Divider, Grid, IconButton, Typography, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useGetT2TrackingByIdQuery } from '../../../store/seguimiento/trackerApi';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ListOutTrackerDetail } from '../components/ListOutTrackerDetail';
import {  useAppSelector } from '../../../store/store';
import { useState } from 'react';
import { DeleteT2Modal } from '../components/DeleteT2Modal';

const T2DetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [deleteOpen, setdeleteOpen] = useState(false);
    const {loading} = useAppSelector(state => state.seguimiento.t2Tracking);
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

    if (isLoading) return <div>Cargando...</div>
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
                    {data.status !== 'APPLIED' && user?.list_permissions?.includes('tracker.delete_outputt2model') &&
                     <Button variant="contained" sx={{ marginTop: 1 }} color="error" onClick={handleDelete} disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                        >
                        Eliminar
                    </Button>}
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