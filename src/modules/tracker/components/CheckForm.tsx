import { Box, Button, Card, Collapse, Divider, Grid, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, styled, tableCellClasses } from '@mui/material';
import { Fragment, FunctionComponent, useEffect, useState } from 'react';

// iCONS
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LocalPrintshopTwoToneIcon from '@mui/icons-material/LocalPrintshopTwoTone';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';

import { useAppDispatch } from '../../../store';
import { DatosOperador, DetalleCarga, DetalleCargaPalet, DetalleCargaPaletIdx, Seguimiento, addDetalleCargaPallet, removeDetalleCarga, removeDetalleCargaPallet, updateDetalleCargaPallet, updateSeguimiento } from '../../../store/seguimiento/seguimientoSlice';
import AgregarProductoModal from './AgregarProductoModal';
import { AutoCompleteBase } from '../../ui/components/BaseAutocomplete';
import { useAppSelector } from '../../../store/store';
import { useForm } from 'react-hook-form';
import { CheckFormType } from '../../../interfaces/tracking';
import { OperatorSelect } from '../../ui/components/OperatorSelect';
import { DriverSelect } from '../../ui/components';
import { LocationSelect } from '../../ui/components/LocationSelect';
import AgregarProductoSalida from './AgregarProductoSalida';
import { OutPutDetail } from './OutPutDetail';
import PrintComponent from '../../../utils/componentPrinter';
import PalletPrint from './PalletPrint';

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

export const CheckForm = ({ seguimiento, indice }: { seguimiento: Seguimiento, indice: number }) => {
    const dispatch = useAppDispatch();
    const [open, setopen] = useState(false);
    const { outputType } = useAppSelector(state => state.maintenance);
    const centro_distribucion = useAppSelector(state => state.auth.user?.centro_distribucion);
    function updateSeguimientoDatosOperador(datos: DatosOperador): unknown {
        if (!seguimiento) return;

        dispatch(updateSeguimiento({
            ...seguimiento,
            datosOperador: {
                ...seguimiento.datosOperador,
                ...datos
            },
            index: indice
        }))
    }
    const { control, getValues, register, watch } = useForm<CheckFormType>({
        defaultValues: {
            ...seguimiento?.data,
        }
    });
    const tiempoEntrada = seguimiento?.datosOperador?.tiempoEntrada
    const tiempoSalida = seguimiento?.datosOperador?.tiempoSalida

    // useEffect(() => {
    //     reset({
    //         ...seguimiento?.data,
    //     });
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [reset, indice]);

    // Actualizar redux con los datos del formulario
    useEffect(() => {
        const data = getValues();
        dispatch(updateSeguimiento({
            ...seguimiento,
            data,
            index: indice
        }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watch('documentNumber'), watch('driver'), watch('documentNumberExit'), watch('opm1'), watch('opm2'), watch('originLocation'), watch('timeEnd'), watch('timeStart'), watch('transferNumber'), watch('transportNumber'), watch('plateNumber'), watch('outputLocation'), watch('outputType')]);


    const [openOutput, setopenOutput] = useState(false);
    return (
        <>
            <AgregarProductoSalida open={openOutput} handleClose={() => setopenOutput(false)} />
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
                                        {seguimiento?.transporter.name}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6} lg={4} xl={4}>
                                    <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                                        Tractor
                                    </Typography>
                                    <Divider />
                                    <Typography variant="body2" component="h1" fontWeight={400} color={'gray.500'}>
                                        {seguimiento?.transporter.tractor}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6} lg={4} xl={4}>
                                    <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                                        Cabezal
                                    </Typography>
                                    <Divider />
                                    <Typography variant="body2" component="h1" fontWeight={400} color={'gray.500'}>
                                        {seguimiento?.transporter.head}
                                    </Typography>
                                </Grid>
                            </Grid>


                        </Box>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6} sx={{ marginTop: 1 }}>
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
                                {...register('plateNumber')}
                            />
                        </Grid>
                        <Grid item xs={12} md={12}>
                            {/* <Autocomplete
                                disablePortal
                                id="combo-box-demo"
                                value={localidades.find(loc => loc.label === seguimiento?.datos?.locEnvio)}
                                options={localidades}
                                getOptionLabel={(option) => option.label + ' - ' + option.code}
                                renderInput={(params) => <TextField {...params} label="Localidad de Envío" size="small" fullWidth />}
                                onChange={(_, v) => updateSeguimientoDatos({ locEnvio: v?.label })}
                            /> */}
                            <LocationSelect
                                control={control}
                                name='originLocation'
                                placeholder='Localidad de Origen'
                                locationId={watch('originLocation')}
                                label='Localidad de Origen'
                            />

                        </Grid>
                        <Grid item xs={12} md={12}>

                        </Grid>
                        <Grid item xs={12} md={12}>
                            <DriverSelect
                                control={control}
                                name='driver'
                                placeholder='Conductor'
                                driver={watch('driver')}
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
                                {...register('documentNumber')}
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
                                {...register('transportNumber')}
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
                                {...register('transferNumber')}
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
                                {...register('documentNumberExit')}
                            />
                        </Grid>
                    </Grid>
                </Grid>


                <Grid item xs={12} md={6} sx={{ marginTop: 1 }}>
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
                            <OperatorSelect
                                control={control}
                                distributionCenterId={centro_distribucion || null}
                                name='opm1'
                                label='Operador #1'
                                operatorId={watch('opm1')}
                                invalidId={watch('opm2')}

                            />
                        </Grid>
                        <Grid item xs={12} >
                            <OperatorSelect
                                control={control}
                                distributionCenterId={centro_distribucion || null}
                                name='opm2'
                                label='Operador #2'
                                operatorId={watch('opm2')}
                                invalidId={watch('opm1')}

                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sx={{ marginTop: 1 }} md={6}>
                    <Divider >
                        <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                            Entrada de producto
                        </Typography>
                    </Divider>
                    <Grid container spacing={2} sx={{ marginTop: 2 }}>
                        <Grid item xs={12} md={12} lg={4} xl={4}>
                        </Grid>
                        <Grid item xs={12} md={6} lg={4} xl={4}>

                        </Grid>
                        <Grid item xs={12} md={6} lg={4} xl={4}>
                            <Button variant="outlined" size="small" fullWidth color="secondary"
                                startIcon={<AddTwoToneIcon />}
                                onClick={() => {
                                    setopen(true);
                                }}
                            >
                                Agregar producto
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
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
                                            Total cajas
                                        </StyledTableCell>
                                        <StyledTableCell align="right">
                                            Acciones
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
                    </Grid>
                </Grid>
                <Grid item xs={12} sx={{ marginTop: 1 }} md={6}>
                    <Divider >
                        <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                            Salida de producto
                        </Typography>
                    </Divider>
                    <Grid container spacing={1} sx={{ marginTop: 2 }}>
                        <Grid item xs={12} md={6}>
                            <LocationSelect
                                control={control}
                                name='outputLocation'
                                placeholder='Localidad de Envío'
                                locationId={watch('outputLocation')}
                                label='Localidad de Envío'
                            />
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <AutoCompleteBase
                                control={control}
                                name='outputType'
                                placeholder='Unidad Cargada con'
                                options={outputType.map((d) => ({ label: d.name, id: d.id.toString() }))}
                            />
                        </Grid>

                        {
                            outputType.find((d) => d.id === Number(watch('outputType')))?.required_details &&
                            <>
                                <Grid item xs={12} md={1}>
                                    <IconButton aria-label="delete" size="medium" onClick={() => {
                                        setopenOutput(true);
                                    }
                                    }>
                                        <AddTwoToneIcon color="primary" />
                                    </IconButton>
                                </Grid>
                                <OutPutDetail seguimiento={seguimiento} />

                            </>

                        }
                    </Grid>

                </Grid>



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
    const removeProductoPallet = (datos: { palletIndex: number }): unknown => {
        if (!props.seguimiento) return;
        const detalle = props.seguimiento.detalles[props.index]
        if (!detalle) return;
        dispatch(removeDetalleCargaPallet({
            segIndex: props.seguimiento.id - 1,
            paletIndex: datos.palletIndex,
            detalleIndex: props.index,
        }))
    }

    const isValid = (): boolean => {
        return row.history?.map((d) => d.pallets).reduce((a = 0, b = 0) => a + b, 0) !== Math.ceil(row.amount / row.boxes_pre_pallet)
    }
    return (
        <Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                        sx={{
                            backgroundColor: isValid() ? 'red' : 'inherit   '
                        }}
                    >
                        {open ? <KeyboardArrowUpIcon
                        /> : <KeyboardArrowDownIcon
                        />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" align="right">
                    {row.sap_code}
                </TableCell>
                <TableCell align="right">
                    {row.name}
                </TableCell>
                <TableCell align="right">
                    {row.amount}
                </TableCell>
                <TableCell align="right">

                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => dispatch(removeDetalleCarga({ segIdx: props.seguimiento.id - 1, detalleIdx: props.index }))}
                    >
                        <DeleteTwoToneIcon />
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Detalles
                            </Typography>
                            <Grid item sx={{
                                display: 'flex', justifyContent: 'space-between    ', alignItems: 'center', marginTop: 1, marginBottom: 1
                            }} xs={12}>
                                <Button variant="outlined" size="small" color="secondary"
                                    startIcon={<AddTwoToneIcon />}
                                    onClick={handleClickAgregar}
                                >
                                    Agregar
                                </Button>
                                <Typography variant="body1" component="h1" fontWeight={400} color={
                                    isValid() ? 'red' : 'gray.500'
                                }>
                                    Total de Pallets: {"  "}
                                    {row.history?.map((d) => d.pallets).reduce((a = 0, b = 0) => a + b, 0)}
                                    {" "} de {" "}
                                    {
                                        Math.ceil(row.amount / row.boxes_pre_pallet)
                                    }
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={5} lg={2} xl={2}>
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
                                            <HistoryRow
                                                key={index}
                                                historyRow={historyRow}
                                                index={index}
                                                detalle={row}
                                                seguimiento={props.seguimiento}
                                                updateProductoPallet={updateProductoPallet}
                                                removeProductoPallet={removeProductoPallet}
                                            />
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

interface HistoryRowProps {
    index: number;
    historyRow: DetalleCargaPalet;
    updateProductoPallet: (datos: DetalleCargaPaletIdx) => unknown;
    detalle: DetalleCarga;
    seguimiento: Seguimiento;
    removeProductoPallet: (datos: {
        palletIndex: number;
    }) => unknown
}

const HistoryRow: FunctionComponent<HistoryRowProps> = ({ index, historyRow, updateProductoPallet, removeProductoPallet, detalle, seguimiento }) => {
    const [willPrint, setWillPrint] = useState(false)
    const [componenPrint, setComponentPrint] = useState(<></>)
    
    const onclickPrint = () => {
        const red = [];
        const max = (historyRow.pallets || 0)
        for (let i = 0; i < max; i++) {
            red.push(<PalletPrint
                pallet={{
                    numeroSap: +detalle.sap_code,
                    rastra: seguimiento.rastra.code,
                    nDocEntrada: seguimiento.data?.documentNumber || 0,
                    fechaVencimiento: historyRow.date,
                    nPallets: historyRow.pallets || 0,
                    cajasPallet: detalle.boxes_pre_pallet,
                    origen: seguimiento.data?.originLocation,
                    trimestre: "A",
                    trackingId: seguimiento.id,
                    detalle_pallet_id: historyRow.id||0,
                    tracker_detail: detalle.id
                }} />)
            if (((i + 1) % 2 === 0) && (i + 1 < max)) {
                red.push(<Grid item xs={12} style={{ pageBreakBefore: "always", }}></Grid>)
            }
        }
        setComponentPrint(<Grid container>{red}</Grid>)
        setWillPrint(true);
    }

    const print = PrintComponent({
        pageOrientation: "landscape",
        component: componenPrint
    })

    useEffect(() => {
        if (willPrint) {
            setWillPrint(false);
            print.print()
        }
    }, [print, willPrint])

    return <TableRow key={index}>
        {willPrint && print.component}
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
                onChange={(e) => {
                    const inputDate = new Date(e.target.value);
                    if (!isNaN(inputDate.getTime())) { // Verificar si es una fecha válida
                        updateProductoPallet({ date: inputDate, palletIndex: index });
                    }
                }}
            />
        </TableCell>
        <TableCell align="right">
            <IconButton aria-label="delete" size="medium" onClick={() => removeProductoPallet({ palletIndex: index })}>
                <DeleteTwoToneIcon fontSize="inherit" color='secondary' />
            </IconButton>
            <IconButton aria-label="edit" size="medium" onClick={onclickPrint}>
                <LocalPrintshopTwoToneIcon fontSize="inherit" color='secondary' />
            </IconButton>
        </TableCell>
    </TableRow>
}