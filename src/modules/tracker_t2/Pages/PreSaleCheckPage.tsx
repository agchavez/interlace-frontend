import { Box, Button, Container, Divider, Grid, Tab, Tabs, Typography } from '@mui/material';
import FloatLoading from '../../tracker/components/FloatLoading';
import { useEffect, useState } from 'react';
import { CheckForm } from '../components/CheckForm';
import { useAppSelector, useAppDispatch } from '../../../store/store';
import { setT2Tracking } from '../../../store/seguimiento/seguimientoSlice';
import { getT2Trackings } from '../../../store/seguimiento/t2TrackingThunk';

const PreSalePage = () => {
    const {
         t2Trackings
    } = useAppSelector((state) => state.seguimiento.t2Tracking);
    const dispatch = useAppDispatch();
    const [value, setValue] = useState(0);
    const handleClickCompletar = () => { };
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    useEffect(() => {
        dispatch(getT2Trackings())
    }, [dispatch])

    return <>
        <Container maxWidth="xl">
            <Grid container spacing={1} sx={{ marginTop: 2 }}>
                <Grid item xs={12}>
                    <Typography variant="h5" component="h1" fontWeight={400}>
                        T2 - En Revisión
                    </Typography>
                    <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                </Grid>
                <FloatLoading visible={false} />
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
                                            label={'T2OUT-' + track.id}
                                            onClick={() => dispatch(setT2Tracking(track))}
                                        />
                                    );
                                })}
                            </Tabs>
                        </Box>
                        <CheckForm />
                    </Box>
                </Grid>
                {t2Trackings.length > 0 && (
                    <>
                        <Grid item xs={12}>
                            <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                        </Grid>

                        <Grid item xs={12} md={9} lg={9} xl={10}></Grid>

                        <Grid
                            item
                            xs={12}
                            md={3}
                            lg={3}
                            xl={2}
                            style={{ display: "flex", justifyContent: "flex-end" }}
                        >
                            <Button
                                variant="contained"
                                color="success"
                                size="medium"
                                fullWidth
                                onClick={handleClickCompletar}
                            >
                                <Typography
                                    variant="body2"
                                    component="span"
                                    fontWeight={400}
                                    color={"gray.700"}
                                >
                                    Completar
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
