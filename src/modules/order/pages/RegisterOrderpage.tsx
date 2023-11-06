import { Container, Divider, Grid, Typography, IconButton, TextField, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { LocationSelect } from '../../ui/components/LocationSelect';
import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import CheckTwoToneIcon from '@mui/icons-material/CheckTwoTone';
import { StyledTableCell } from '../../tracker/components/CheckForm';

export const RegisterOrderpage = () => {
    const navigae = useNavigate();

    const { control } = useForm({
        defaultValues: {
            name: '',
            location: '',
        }
    });


    return (
        <>
            <Container maxWidth="xl" sx={{ marginTop: 2 }}>
                <Grid container spacing={1}>
                    <Grid item xs={12} display="flex" justifyContent="space-between">
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
                            <Typography variant="h5" component="h1" fontWeight={400}>
                                Registro de pedidos de T1
                            </Typography>
                        </div>
                        <Button
                            variant="contained"
                            color="success"
                            size='medium'
                            disabled
                            endIcon={<CheckTwoToneIcon fontSize='small' />}
                        >
                            Guardar
                        </Button>

                    </Grid>
                    <Grid item xs={12}>
                        <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2" component="h2" fontWeight={400}>
                            Complete el formulario para registrar un nuevo pedido de T1, los campos marcados con asterisco (*) son obligatorios.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sx={{ marginTop: 2 }}>
                        <form>
                            <Grid container spacing={2}>

                                <Grid item xs={8} md={8} lg={4}>
                                    <LocationSelect
                                        control={control}
                                        name='location'
                                        label='Cliente'
                                    />
                                </Grid>
                                <Grid item xs={4} md={4} lg={2}>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        size='medium'
                                        fullWidth
                                        endIcon={<OpenInNewTwoToneIcon fontSize='small' />}
                                    >
                                        Nuevo cliente
                                    </Button>
                                </Grid>
                                <Grid item xs={12} md={12} lg={6}  alignItems='center' display='flex'>
                                    <Chip 
                                        label='RHD01' 
                                        color='secondary' 
                                        size='medium' 
                                        sx={{ marginRight: 1 }} />
                                   
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Observaciones"
                                        variant="outlined"
                                        required
                                        size='small'
                                        multiline
                                        rows={3}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider>
                                        <Typography variant="body1" component="h2" fontWeight={400}>
                                            Detalle del pedido
                                        </Typography>
                                    </Divider>
                                </Grid>
                                <Grid item xs={12} md={8} lg={10}>
                                </Grid>
                                <Grid item xs={12} md={4} lg={2}>
                                    <Button 
                                        variant="outlined"
                                        color="secondary"
                                        size='medium'
                                        fullWidth
                                        endIcon={<OpenInNewTwoToneIcon fontSize='small' />}
                                    >
                                        Agregar
                                    </Button>
                                </Grid>

                                <Grid item xs={12}>
                                    <TableContainer
                                        sx={{ maxHeight: 400 }}
                                    >
                                        <Table size="small" aria-label="a dense table" sx={{ marginTop: 2 }}>
                                            <TableHead>
                                                <TableRow>
                                                    <StyledTableCell align="left">
                                                        No. SAP
                                                    </StyledTableCell>
                                                    <StyledTableCell align="left">
                                                        Producto
                                                    </StyledTableCell>
                                                    <StyledTableCell align="left">
                                                        Pallets
                                                    </StyledTableCell>
                                                    <StyledTableCell align="left">
                                                        Fecha Expiración
                                                    </StyledTableCell>
                                                    <StyledTableCell align="right">
                                                        Acciones
                                                    </StyledTableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>
                                                        124122313
                                                    </TableCell>
                                                    <TableCell>
                                                        COCA COLA 2.5L PET
                                                    </TableCell>
                                                    <TableCell>
                                                        10
                                                    </TableCell>
                                                    <TableCell>
                                                        2021-10-10
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton color='error'>
                                                            <DeleteTwoToneIcon fontSize='medium' />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </Grid>
                        </form>
                    </Grid>
                </Grid>
            </Container>

        </>
    )
}
