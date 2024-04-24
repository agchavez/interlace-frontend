import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { EditedTrackerCDs } from '../../../interfaces/home';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

function Row(props: { row: EditedTrackerCDs }) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();
    return (
        <React.Fragment>
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
                <TableCell component="th" scope="row">
                    TRK-{row.id}
                </TableCell>
                <TableCell align="center">{
                    row.input_date === null && row.output_date === null ?
                        'En descarga' :
                        row.input_date !== null && row.output_date === null ?
                            'En bahia de espera ' : 'Descarga completa'
                }</TableCell>
                <TableCell align="right">{row.trailer__code}</TableCell>
                <TableCell align="right">{row.trailer__code}</TableCell>
                <TableCell align="right">
                    <IconButton size="small" color="primary" aria-label="add to shopping cart" onClick={() => navigate('/tracker/detail/' + row.id)}>
                        <ArrowForwardIcon />
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" component="div" fontWeight={200}>
                                Productos descargados
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Codigo SAP</TableCell>
                                        <TableCell>Descripción</TableCell>
                                        <TableCell align="right">Cantidad</TableCell>
                                        <TableCell align="right">Fechas</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.products.map((historyRow, index) => (
                                        <TableRow key={index}>
                                            <TableCell component="th" scope="row">
                                                {historyRow.sap_code}
                                            </TableCell>
                                            <TableCell>{historyRow.name}</TableCell>
                                            <TableCell align="right">
                                                {historyRow.quantity}
                                            </TableCell>
                                            <TableCell align="right">{historyRow.expiration_dates.length}</TableCell>

                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

interface DashboardCds {
    data: EditedTrackerCDs[];
}
export default function TableDashboard({ data }: DashboardCds) {
    return (
        <TableContainer >
            <Table aria-label="collapsible table">
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>Tracker</TableCell>
                        <TableCell align="center">Estado</TableCell>
                        <TableCell align="right">Rastra
                        </TableCell>
                        <TableCell align="right">Transportista</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row) => (
                        <Row key={row.id} row={row} />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
