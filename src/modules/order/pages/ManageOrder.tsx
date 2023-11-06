import { Container, Grid, Typography, Divider, Button } from '@mui/material';
import React from 'react'
import FilterListTwoToneIcon from '@mui/icons-material/FilterListTwoTone';
import PostAddTwoToneIcon from '@mui/icons-material/PostAddTwoTone';
import { useNavigate } from 'react-router-dom';

const ManageOrder = () => {
    const navigate = useNavigate();
    
    return (
        <>
            <Container maxWidth="xl" sx={{ marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h5" component="h1" fontWeight={400}>
                            T1 - Pedidos
                        </Typography>
                        <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2" component="h2" fontWeight={400}>
                            A continuación se muestra el listado de los pedidos
                            registrados en el sistema para el centro de distribución, para ver el detalle de cada uno de
                            ellos, haga click en el botón ver o presione doble click sobre el
                            registro.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} display="flex" justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            color="secondary"
                            sx={{ marginRight: 1 }}
                            endIcon={<FilterListTwoToneIcon />}
                        //   onClick={() => setopenFilter(true)}
                        >
                            Filtrar
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            sx={{ marginRight: 1 }}
                            endIcon={<PostAddTwoToneIcon />}
                            onClick={() => navigate('/order/register')}
                        >
                            Nuevo
                        </Button>
                        {/* <ExportManageMenu
              disabled={(data?.count || 0) <= 0 || isLoading || isFetching}
              query={query}
              t1Count={data?.count || 0}
            /> */}
                    </Grid>
                </Grid>
            </Container>
        </>
    )
}

export default ManageOrder