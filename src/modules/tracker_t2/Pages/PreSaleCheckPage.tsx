import { Box, Button, CircularProgress, Container, Divider, Grid, LinearProgress, Tab, Tabs, Typography } from '@mui/material';
import FloatLoading from '../../tracker/components/FloatLoading';
import { useEffect, useState } from 'react';
import { CheckForm } from '../components/CheckForm';
import { useAppSelector, useAppDispatch } from '../../../store/store';
import { setT2Tracking } from '../../../store/seguimiento/seguimientoSlice';
import { getT2Trackings } from '../../../store/seguimiento/t2TrackingThunk';
import { CompleteModal } from '../components/CompleteModal';
import { RejectedTrackerModal } from '../components/RejectedTrackerModal';

const PreSalePage = () => {
    const {
        t2Trackings, loading, loadingDetail, t2TrackingActual
    } = useAppSelector((state) => state.seguimiento.t2Tracking);
    const dispatch = useAppDispatch();
    const [value, setValue] = useState(0);
    const [openConfirm, setopenConfirm] = useState(false)
    const [rejected, setrejected] = useState(false)
    const handleClickCompletar = () => {
        setopenConfirm(true)
     };
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    useEffect(() => {
        dispatch(getT2Trackings())
    }, [dispatch])

    useEffect(() => {
        if (t2TrackingActual)
            setValue(t2Trackings.findIndex((track) => track.id === t2TrackingActual.id))
            // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t2TrackingActual])


    return <>
        <CompleteModal
            isOpen={openConfirm}
            onClose={() => setopenConfirm(false)}
        />
        <RejectedTrackerModal
            isOpen={rejected}
            onClose={() => setrejected(false)}
        />
        <Container maxWidth="xl">
            <Grid container spacing={1} sx={{ marginTop: 2 }}>
                <Grid item xs={12}>
                    <Typography variant="h5" component="h1" fontWeight={400}>
                        T2 - En Revisión
                    </Typography>
                    <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                </Grid>
                
                <FloatLoading visible={loadingDetail} />
                <Grid item xs={12}>
                    <Box sx={{ width: "100%" }}>
                        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                            <Tabs
                                value={value}
                                onChange={handleChange}
                                aria-label="basic tabs example"
                            >
                                {t2Trackings.map((track) => {
                                    return (
                                        <Tab
                                            key={track.id}
                                            label={<Box display="flex" flexDirection="column">
                                                <Typography variant="body2" component="span" fontWeight={400}>
                                                T2OUT-{track.id}
                                                </Typography>
                                                <Typography variant="caption" 
                                                    component="span" 
                                                    fontWeight={200}
                                                    color={track.status === 'REJECTED' ?
                                                             'error.main' : 'gray.700'}
                                                >
                                                {track.status === 'REJECTED' ? 
                                                    'Rechazado' : 
                                                    track.status === 'CHECKED' ?
                                                    'Revisado' :
                                                    track.status === 'AUTHORIZED' ?
                                                    'Autorizado' :
                                                    'Pendiente'
                                                }
                                                </Typography>
                                            </Box>}
                                            onClick={() => dispatch(setT2Tracking(track))}
                                        />
                                    );
                                })}
                            </Tabs>
                        </Box>
                        <Box  position="fixed" zIndex={100} width={'100%'} sx={{ visibility: loading || loadingDetail ? "visible" : "hidden" }}>
                
                { <LinearProgress
                        value={100}
                />}
                </Box>
                        <CheckForm />
                    </Box>
                </Grid>
                {t2Trackings.length > 0 && (
                    <>
                        <Grid item xs={12}>
                            <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                        </Grid>
                        <Grid
                            item xs={12} md={3} lg={3} xl={2} style={{ display: "flex", justifyContent: "flex-end" }}
                        >
                           {t2TrackingActual?.status === "CHECKED" && <Button
                                variant="contained"
                                color="error"
                                size="medium"
                                fullWidth
                                onClick={() => setrejected(true)}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} color='inherit'
                                /> : null}
                            >
                                <Typography
                                    variant="body2"
                                    component="span"
                                    fontWeight={400}
                                    color={"gray.700"}
                                >
                                    Rechazar
                                </Typography>
                            </Button>}
                        </Grid>
                        <Grid item xs={12} md={6} lg={6} xl={8} />

                        

                        <Grid
                            item xs={12} md={3} lg={3} xl={2} style={{ display: "flex", justifyContent: "flex-end" }}
                        >
                            <Button
                                variant="contained"
                                color="success"
                                size="medium"
                                fullWidth
                                onClick={handleClickCompletar}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} color='inherit'
                                /> : null}
                            >
                                <Typography
                                    variant="body2"
                                    component="span"
                                    fontWeight={400}
                                    color={"gray.700"}
                                >
                                    {
                                        t2TrackingActual?.status === 'CHECKED' ?
                                            'Autorizar' :
                                        t2TrackingActual?.status === 'AUTHORIZED' ?
                                            'Aplicar' :
                                        'Completar'

                                    }
                                </Typography>
                            </Button>
                        </Grid>
                        <Grid item xs={12} sx={{ marginTop: 5 }}></Grid>
                    </>
                )}
            </Grid>
        </Container></>
}

export default PreSalePage;
