import { Container, Divider, Grid, Typography } from '@mui/material'
import { Navigate, useParams } from 'react-router-dom'
import { useGetTrackerByIdQuery } from '../../../store/seguimiento/trackerApi';

import { skipToken } from '@reduxjs/toolkit/query';
import { CheckForm } from '../components/CheckForm';
import { parseTrackerSeguimiento } from '../../../store/seguimiento/trackerThunk';

export const DetailPage = () => {
    const {id } = useParams<{id: string}>();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {data, error, isLoading} = useGetTrackerByIdQuery(id || skipToken,
        {
            skip: !id
        }
    );
    if(isLoading) return <div>Cargando...</div>
    if(error || !data) return <Navigate to="/tracker/manage" />

    return (
        <>
            <Container maxWidth="xl" sx={{ marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h5" component="h1" fontWeight={400}>
                            TRK-{id?.padStart(10, '0')}
                        </Typography>
                        <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                        <CheckForm
                            disable = {true}
                            indice={0}
                            seguimiento={parseTrackerSeguimiento(data)}
                        />
                    </Grid>
                </Grid>
            </Container>
        </>
    )
}
