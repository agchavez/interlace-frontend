import { Container, Divider, Grid, IconButton, Typography } from '@mui/material'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useGetTrackerByIdQuery } from '../../../store/seguimiento/trackerApi';

import { skipToken } from '@reduxjs/toolkit/query';
import { CheckForm } from '../components/CheckForm';
import { parseTrackerSeguimiento } from '../../../store/seguimiento/trackerThunk';
import { ArrowBack } from '@mui/icons-material';

import {ClaimModal} from "../components/ClaimDialog.tsx";
import ClaimEditModal from "../components/ClaimEditModal.tsx";
import { useState } from 'react';

export const DetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigae = useNavigate();
    const [claimOpen, setClaimOpen] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error, isLoading } = useGetTrackerByIdQuery(id || skipToken,
        {
            skip: !id
        }
    );
    if (isLoading) return <div>Cargando...</div>
    if (error || !data) return <Navigate to="/tracker/manage" />

    return (
        <>
        {claimOpen && (
                data.claim ? (
                    <ClaimEditModal
                        open={claimOpen}
                        onClose={() => setClaimOpen(false)}
                        claimId={data.claim!}
                        seguimiento={parseTrackerSeguimiento(data)}
                    />
                ) : (
                    <ClaimModal
                        tracker={data.id}
                        open={claimOpen}
                        onClose={() => setClaimOpen(false)}
                        type={data.type}
                        seguimiento={parseTrackerSeguimiento(data)}

                    />
                )
            )}

            <Container maxWidth="xl" sx={{ marginTop: 2 }}>
                <Grid container spacing={0}>
                    <Grid item xs={12}>
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
                                TRK-{id?.padStart(5, '0')}
                            </Typography>
                        </div>
                        <Typography variant="h6" component="h2" fontWeight={200} sx={{ marginLeft: 6  }}>
                            {data.distributor_center_data?.name}
                        </Typography>
                        <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <CheckForm
                            disable={true}
                            indice={0}
                            seguimiento={parseTrackerSeguimiento(data)}
                            openClaim={() => {
                                setClaimOpen(true)
                            }}
                        />
                    </Grid>
                </Grid>
            </Container>
        </>
    )
}
