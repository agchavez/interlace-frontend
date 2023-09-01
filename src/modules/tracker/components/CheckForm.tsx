import { Autocomplete, Box, Button, Card, Collapse, Divider, Grid, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, styled, tableCellClasses } from '@mui/material'
import { Fragment, useState } from 'react';

// iCONS
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LocalPrintshopTwoToneIcon from '@mui/icons-material/LocalPrintshopTwoTone';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { useAppDispatch } from '../../../store';
import { DatosGeneralesSeguimiento, DatosOperador, DetalleCarga, DetalleCargaPaletIdx, Seguimiento, addDetalleCargaPallet, removeDetalleCarga, removeDetalleCargaPallet, updateDetalleCargaPallet, updateSeguimiento } from '../../../store/seguimiento/seguimientoSlice';
import AgregarProductoModal from './AgregarProductoModal';

const localidades = [
    { label: 'CD COMAYAGUA', id: 1, code: 'DH09' },
    { label: 'PLANTA CERVEZA', id: 2, code: 'BH01' },
    { label: 'CD LA GRANJA', id: 3, code: 'DH01' },
    { label: 'CD SAN PEDRO SULA DISTRIBUIDOR', id: 4, code: 'DH00' },
    { label: 'CD ROATAN', id: 5, code: 'DH14' },
];

const conductores = [
    { label: 'Carlos Alberto Bonilla Vasquez', id: 1 },
    { label: 'Carlos Alberto Escobar', id: 2 },
    { label: 'Carlos Alberto Rodríguez George', id: 3 },
    { label: 'Carlos Jose Sanchez', id: 4 },
    { label: 'Nelson Yovanni Lagos', id: 5 },
    { label: 'Florencio Yairsinio Velasquez', id: 6 },
    { label: 'Alexis Maldonado Ramos', id: 7 },
    { label: 'Dagoberto Rivera Alba', id: 8 },
    { label: 'Manuel Garcia Mejia', id: 9 },
    { label: 'Ely Martinez Castillo', id: 10 },
    { label: 'Alex Esau Aranda Leiva', id: 11 },
    { label: 'Santos Enrrique Hernandez Bonilla', id: 12 },
];

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

export const CheckForm = ({ seguimiento, indice }: { seguimiento: Seguimiento, indice:number }) => {
    const dispatch = useAppDispatch();
    const [open, setopen] = useState(false)
    function updateSeguimientoDatos(datos: DatosGeneralesSeguimiento): unknown {
        if (!seguimiento) return;
        dispatch(updateSeguimiento({
            ...seguimiento,
            datos: {
                ...seguimiento.datos,
                ...datos
            },
            index:indice
        }))
    }
    function updateSeguimientoDatosOperador(datos: DatosOperador): unknown {
        if (!seguimiento) return;
        dispatch(updateSeguimiento({
            ...seguimiento,
            datosOperador: {
                ...seguimiento.datosOperador,
                ...datos
            },
            index:indice
        }))
    }
    const tiempoEntrada = seguimiento?.datosOperador?.tiempoEntrada
    const tiempoSalida = seguimiento?.datosOperador?.tiempoSalida

    

    return (
        <>
        <AgregarProductoModal open={open} handleClose={() => setopen(false)} />
            <Grid container spacing={2} sx={{ marginTop: 2, marginBottom: 5 }}>
                <Grid item xs={12}>
                    <Card>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 2 }}>
                            <Typography variant="h6" component="h1" fontWeight={400} color={'gray.500'}>
                                Datos de la rastra
                            </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ padding: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6} lg={4} xl={4}>
                                    <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                                        Transportista
                                    </Typography>
                                    <Divider />
                                    <Typography variant="body2" component="h1" fontWeight={400} color={'gray.500'}>
                                        {seguimiento?.rastra.transportista}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6} lg={4} xl={4}>
                                    <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                                        Tractor
                                    </Typography>
                                    <Divider />
                                    <Typography variant="body2" component="h1" fontWeight={400} color={'gray.500'}>
                                        {seguimiento?.rastra.tractor}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6} lg={4} xl={4}>
                                    <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                                        Cabezal
                                    </Typography>
                                    <Divider />
                                    <Typography variant="body2" component="h1" fontWeight={400} color={'gray.500'}>
                                        {seguimiento?.rastra.cabezal}
                                    </Typography>
                                </Grid>
                            </Grid>


                        </Box>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6} sx={{ marginTop: 4 }}>
                    <Divider >
                        <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                            Datos generales
                        </Typography>
                    </Divider>
                    <Grid container spacing={2} sx={{ marginTop: 2 }}>
                    <Grid item xs={12} >
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Numero de placa"
                        variant="outlined"
                        size="small"
                        value={seguimiento?.datos?.placa}
                        onChange={(e) => updateSeguimientoDatos({ placa: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12} md={12}>
                    <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        value={localidades.find(loc => loc.label === seguimiento?.datos?.locEnvio)}
                        options={localidades}
                        getOptionLabel={(option) => option.label + ' - ' + option.code}
                        renderInput={(params) => <TextField {...params} label="Localidad de Envío" size="small" fullWidth />}
                        onChange={(_, v) => updateSeguimientoDatos({ locEnvio: v?.label })}
                    />
                </Grid>
                <Grid item xs={12} md={12}>
                    <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={conductores}
                        value={conductores.find(loc => loc.label === seguimiento?.datos?.conductor)}
                        getOptionLabel={(option) => option.label}
                        renderInput={(params) => <TextField {...params} label="Conductor" size="small" fullWidth />}
                        onChange={(_, v) => updateSeguimientoDatos({ conductor: v?.label })}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="N° de documento"
                        variant="outlined"
                        size="small"
                        type="number"
                        onChange={(e) => updateSeguimientoDatos({ nDocumento: +e.target.value })}
                        value={seguimiento?.datos?.nDocumento}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="N° de Transporte"
                        variant="outlined"
                        size="small"
                        type="number"
                        onChange={(e) => updateSeguimientoDatos({ nTransporte: +e.target.value })}
                        value={seguimiento?.datos?.nTransporte}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="N° de Traslado"
                        variant="outlined"
                        size="small"
                        type="number"
                        onChange={(e) => updateSeguimientoDatos({ nTraslado: +e.target.value })}
                        value={seguimiento?.datos?.nTraslado}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="N° de Doc. Salida"
                        variant="outlined"
                        size="small"
                        type="number"
                        onChange={(e) => updateSeguimientoDatos({ nDocumentoSalida: +e.target.value })}
                        value={seguimiento?.datos?.nDocumentoSalida}
                    />
                </Grid>
                    </Grid>
                </Grid>
                

                <Grid item xs={12} md={6} sx={{ marginTop: 4 }}>
                    <Divider >
                        <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                            Datos operador
                        </Typography>
                    </Divider>
                    <Grid container spacing={2} sx={{ marginTop: 2 }}>
                        <Grid item xs={12} md={6} lg={4}>
                            <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                                Tiempo de entrada
                            </Typography>
                            <Divider />
                            <Typography variant="body2" component="h1" fontWeight={400} color={'gray.500'}>
                                {
                                    tiempoEntrada &&
                                    (
                                        String(tiempoEntrada.getHours()).padStart(2, '0') + ":" +
                                        String(tiempoEntrada.getMinutes()).padStart(2, '0') + ":" +
                                        String(tiempoEntrada.getSeconds()).padStart(2, '0')
                                    )
                                    || "00:00:00"
                                }
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6} lg={4}>
                            <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                                Tiempo de salida
                            </Typography>
                            <Divider />
                            <Typography variant="body2" component="h1" fontWeight={400} color={'gray.500'}>
                                {
                                    tiempoSalida &&
                                    (
                                        String(tiempoSalida.getHours()).padStart(2, '0') + ":" +
                                        String(tiempoSalida.getMinutes()).padStart(2, '0') + ":" +
                                        String(tiempoSalida.getSeconds()).padStart(2, '0')
                                    )
                                    || "00:00:00"
                                }
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6} lg={4}>
                            <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                                Tiempo invertido
                            </Typography>
                            <Divider />
                            <Typography variant="body2" component="h1" fontWeight={400} color={'gray.500'}>
                                {
                                    tiempoSalida && tiempoEntrada ?
                                    (
                                        String(tiempoSalida.getHours() - tiempoEntrada.getHours()).padStart(2, '0') + ":" + 
                                        String(tiempoSalida.getMinutes() - tiempoEntrada.getMinutes()).padStart(2, '0') + ":" +
                                        String(tiempoSalida.getSeconds() - tiempoEntrada.getSeconds()).padStart(2, '0')
                                    ) : "--:--:--"
                                }
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Button variant="outlined" size="small" fullWidth color="success" disabled={tiempoEntrada ? true : false}
                                onClick={() => {
                                    updateSeguimientoDatosOperador({ tiempoEntrada: new Date() })
                                }}>
                                Registrar entrada
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Button variant="outlined" size="small" fullWidth color="error" disabled={tiempoEntrada === undefined || tiempoSalida !== undefined}
                                onClick={() => {
                                    updateSeguimientoDatosOperador({ tiempoSalida: new Date() })
                                }}>
                                Registrar salida
                            </Button>
                        </Grid>
                        <Grid item xs={12} >
                            <TextField
                                fullWidth
                                id="outlined-basic"
                                label="OPM #1"
                                variant="outlined"
                                size="small"
                                onChange={(e) => { updateSeguimientoDatosOperador({ opm1: e.target.value }) }}
                                value={seguimiento?.datosOperador?.opm1}
                            />
                        </Grid>
                        <Grid item xs={12} >
                            <TextField
                                fullWidth
                                id="outlined-basic"
                                label="OPM #2"
                                variant="outlined"
                                size="small"
                                onChange={(e) => { updateSeguimientoDatosOperador({ opm2: e.target.value }) }}
                                value={seguimiento?.datosOperador?.opm2}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sx={{ marginTop: 4 }}>
                    <Divider >
                        <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                            Detalles de la carga
                        </Typography>
                    </Divider>
                </Grid>
                <Grid item xs={12} md={7} lg={10} xl={10}>
                </Grid>
                <Grid item xs={12} md={5} lg={2} xl={2}>
                    <Button variant="outlined" size="small" fullWidth color="secondary"
                        startIcon={<AddTwoToneIcon />}
                        onClick={() => {
                            setopen(true);
                        }}
                    >
                        Agregar producto
                    </Button>
                </Grid>
                <Table size="small" aria-label="a dense table" sx={{ marginTop: 2 }}>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>
                                Detalle
                            </StyledTableCell>
                            <StyledTableCell align="right">
                                No. SAP
                            </StyledTableCell>
                            <StyledTableCell align="right">
                                Producto
                            </StyledTableCell>
                            <StyledTableCell align="right">
                                BASIC
                            </StyledTableCell>

                            <StyledTableCell align="right">
                                Total cajas
                            </StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            seguimiento?.detalles.map((detalle, index) => {
                                return (
                                    <Row key={detalle.name} row={detalle} seguimiento={seguimiento} index={index} />
                                )
                            })
                        }
                    </TableBody>
                </Table>


            </Grid>

        </>
    )
}

function Row(props: { row: DetalleCarga, seguimiento: Seguimiento, index: number }) {
    const { row } = props;
    const [open, setOpen] = useState(false);
    const dispatch = useAppDispatch()
    const handleClickAgregar = () => {
        dispatch(addDetalleCargaPallet({
            segIndex: props.seguimiento.id - 1,
            detalleIndex: props.index, id: 1,
            pallets: 0, date: new Date(),
            amount: 0
        }))
    }
    const updateProductoPallet = (datos: DetalleCargaPaletIdx): unknown => {
        if (!props.seguimiento) return;
        const detalle = props.seguimiento.detalles[props.index]
        if (!detalle) return;
        let prev = {}
        if (detalle.history) {
            prev = detalle.history[datos.palletIndex]
        }
        dispatch(updateDetalleCargaPallet({
            ...prev,
            segIndex: props.seguimiento.id - 1,
            paletIndex: datos.palletIndex,
            ...datos,
            detalleIndex: props.index,
        }))
    }
    const removeProductoPallet = (datos: {palletIndex:number}): unknown => {
        if (!props.seguimiento) return;
        const detalle = props.seguimiento.detalles[props.index]
        if (!detalle) return;
        dispatch(removeDetalleCargaPallet({
            segIndex: props.seguimiento.id - 1,
            paletIndex: datos.palletIndex,
            detalleIndex: props.index,
        }))
    }
    return (
        <Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => dispatch(removeDetalleCarga({segIdx:props.seguimiento.id -1, detalleIdx: props.index}))}
                    >
                        <DeleteTwoToneIcon />
                    </IconButton>
                </TableCell>
                <TableCell component="th" align="right">
                    {row.sap}
                </TableCell>
                <TableCell align="right">
                    {row.name}
                </TableCell>
                <TableCell align="right">
                    {row.basic}
                </TableCell>
                <TableCell align="right">
                    {row.amount}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Detalles
                            </Typography>
                            <Grid item xs={12} md={5} lg={2} xl={2}>
                                <Button variant="outlined" size="small" fullWidth color="secondary"
                                    startIcon={<AddTwoToneIcon />}
                                    onClick={handleClickAgregar}
                                >
                                    Agregar
                                </Button>
                            </Grid>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="right">Pallets</TableCell>
                                        <TableCell align="right">Fecha</TableCell>
                                        <TableCell align="right">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.history?.map((historyRow, index) => {
                                        return (
                                            <TableRow key={index}>
                                                <TableCell align="right">
                                                    <TextField
                                                        fullWidth
                                                        id="outlined-basic"
                                                        size="small"
                                                        type='number'
                                                        value={historyRow.pallets}
                                                        onChange={(e) => updateProductoPallet({ pallets: +e.target.value, palletIndex: index })}
                                                    />
                                                </TableCell>
                                                <TableCell component="th" scope="row" align="right">
                                                    <TextField
                                                        fullWidth
                                                        id="outlined-basic"
                                                        size="small"
                                                        type="date"
                                                        value={historyRow.date?.toISOString().split('T')[0]}
                                                        datatype='date'
                                                        onChange={(e) => updateProductoPallet({ date: new Date(e.target.value), palletIndex: index })}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton aria-label="delete" size="medium" onClick={()=>removeProductoPallet({palletIndex:index})}>
                                                        <DeleteTwoToneIcon fontSize="inherit" color='secondary' />
                                                    </IconButton>
                                                    <IconButton aria-label="edit" size="medium">
                                                        <LocalPrintshopTwoToneIcon fontSize="inherit" color='secondary' />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </Fragment>
    );
}