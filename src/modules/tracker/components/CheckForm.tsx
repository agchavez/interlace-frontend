import { Autocomplete, Box, Button, Card, Collapse, Divider, Grid, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, styled, tableCellClasses } from '@mui/material'
import { Fragment, useState } from 'react';

// iCONS
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import DriveFileRenameOutlineTwoToneIcon from '@mui/icons-material/DriveFileRenameOutlineTwoTone';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LocalPrintshopTwoToneIcon from '@mui/icons-material/LocalPrintshopTwoTone';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';

const localidades = [
    { label: 'CD COMAYAGUA', id: 1, code: 'DH09'},
    { label: 'PLANTA CERVEZA', id: 2, code: 'BH01' },
    { label: 'CD LA GRANJA', id: 3 , code: 'DH01'},
    { label: 'CD SAN PEDRO SULA DISTRIBUIDOR', id: 4 , code: 'DH00'},
    { label: 'CD ROATAN', id: 5 , code: 'DH14'},
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


const rows = [
    createData('MONSTER ENERGY KHAOS (NARANJA) LATA 24 U', 12651, 6.0, 24),
    createData('SALVA VIDA 12OZ LAT 24U', 13908, 9.0, 37),
    createData('PORT ROYAL 12OZ LAT 24U', 13909, 16.0, 24),
    createData('BARENA 12 OZ LAT 24U', 13910, 3.7, 67),
    createData('IMPERIAL 12OZ LAT 24U', 13911, 16.0, 49),
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

export const CheckForm = () => {
    return (
        <>
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
                                    El Polvorin
                                    </Typography>  
                                </Grid>
                                <Grid item xs={12} md={6} lg={4} xl={4}>
                                    <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                                    Placa
                                    </Typography>
                                    <Divider />
                                </Grid>
                                <Grid item xs={12} md={6} lg={4} xl={4}>
                                    <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                                    Conductor
                                    </Typography>
                                    <Divider />
                                </Grid>
                            </Grid>
                            

                        </Box>
                    </Card>
                </Grid>
                <Grid item xs={12} sx={{ marginTop: 4 }}>
                    <Divider >
                        <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                            Datos generales
                        </Typography>
                    </Divider>
                </Grid>
                <Grid item xs={12} md={6} lg={4} xl={3}>
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Numero de placa"
                        variant="outlined"
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} md={6} lg={4} xl={3}>
                    <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={localidades}
                        getOptionLabel={(option) => option.label + ' - ' + option.code}
                        renderInput={(params) => <TextField {...params} label="Localidad de Envío" size="small" fullWidth />}
                    />
                </Grid>
                <Grid item xs={12} md={6} lg={4} xl={3}>
                    <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={conductores}
                        getOptionLabel={(option) => option.label}
                        renderInput={(params) => <TextField {...params} label="Conductor" size="small" fullWidth />}
                    />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4} xl={3}>
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="N° de documento"
                        variant="outlined"
                        size="small"
                        type="number"
                    />
                </Grid>
                <Grid item xs={12} md={6} lg={4} xl={3}>
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="N° de Transporte"
                        variant="outlined"
                        size="small"
                        type="number"
                    />
                </Grid>
                <Grid item xs={12} md={6} lg={4} xl={3}>
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="N° de Traslado"
                        variant="outlined"
                        size="small"
                        type="number"
                    />
                </Grid>
                <Grid item xs={12} md={6} lg={4} xl={3}>
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="N° de Doc. Salida"
                        variant="outlined"
                        size="small"
                        type="number"
                    />
                </Grid>

                <Grid item xs={12} sx={{ marginTop: 4 }}>
                    <Divider >
                        <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                            Datos operador
                        </Typography>
                    </Divider>
                </Grid>
                <Grid item xs={12} md={6} lg={4} xl={3}>
                    <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                        Tiempo de entrada
                    </Typography>
                    <Divider />
                    <Typography variant="body2" component="h1" fontWeight={400} color={'gray.500'}>
                        00:00:00
                    </Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={4} xl={3}>
                    <Typography variant="body1" component="h1" fontWeight={400} color={'gray.500'}>
                        Tiempo de salida
                    </Typography>
                    <Divider />
                    <Typography variant="body2" component="h1" fontWeight={400} color={'gray.500'}>
                        00:00:00
                    </Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={2} xl={2}>
                    <Button variant="outlined" size="small" fullWidth color="success">
                        Registrar entrada
                    </Button>
                </Grid>
                <Grid item xs={12} md={6} lg={2} xl={2}>
                    <Button variant="outlined" size="small" fullWidth color="error" disabled>
                        Registrar salida
                    </Button>
                </Grid>
                <Grid item xs={12} md={6} lg={6} xl={6}>
                    <TextField  
                        fullWidth
                        id="outlined-basic"
                        label="OPM #1"
                        variant="outlined"
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} md={6} lg={6} xl={6}>
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="OPM #2"
                        variant="outlined"
                        size="small"
                    />
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
                        {rows.map((row) => (
                            <Row key={row.name} row={row} />
                        ))}
                    </TableBody>
                </Table>


            </Grid>

        </>
    )
}
function createData(
    name: string,
    sap: number,
    basic: number,
    amount: number,
  ) {
    return {
      name,
      sap,
      basic,
      amount,
      history: [
        {
          date: '2020-01-05',
          pallets: '11091700',
          amount: 3,
        },
        {
          date: '2020-01-02',
          pallets: 'Anonymous',
          amount: 1,
        },
      ],
    };
  }


function Row(props: { row: ReturnType<typeof createData> }) {
    const { row } = props;
    
    const [open, setOpen] = useState(false);
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
          </TableCell>
          <TableCell component="th" align="right">
            {row.sap}
          </TableCell>
          <TableCell align="right">{row.name}</TableCell>
          <TableCell align="right">{row.basic}</TableCell>
          <TableCell align="right">{row.amount}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Detalles
                </Typography>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell align="right">Pallets</TableCell>
                      <TableCell align="right">Fecha</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.history.map((historyRow) => (
                      <TableRow key={historyRow.date}>
                        
                        <TableCell align="right">{historyRow.amount}</TableCell>
                        <TableCell component="th" scope="row" align="right">
                          {historyRow.date}
                        </TableCell>
                        <TableCell align="right">
                            <IconButton aria-label="delete" size="medium">
                                <DeleteTwoToneIcon fontSize="inherit" color='secondary' />
                            </IconButton>
                            <IconButton aria-label="edit" size="medium">
                                <DriveFileRenameOutlineTwoToneIcon fontSize="inherit" color='secondary' />
                            </IconButton>
                            <IconButton aria-label="edit" size="medium">
                                <LocalPrintshopTwoToneIcon fontSize="inherit" color='secondary' />
                            </IconButton>


                        </TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </Fragment>
    );
  }