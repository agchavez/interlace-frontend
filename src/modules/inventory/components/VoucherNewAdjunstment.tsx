import { Accordion, AccordionDetails, AccordionSummary, Grid, Table, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { InventarioMovimentResult, DatuInventarioMoviment, DataError } from '../../../interfaces/tracking';
import { GridExpandMoreIcon } from '@mui/x-data-grid';
import TableBody from '@mui/material/TableBody';
import { FC } from 'react';
import { format } from 'date-fns';
import { StyledTableCell } from '../../tracker/components/CheckForm';

interface Props {
    data: InventarioMovimentResult
}
export const VoucherNewAdjunstment: FC<Props> = ({ data }) => {
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <AccordionTableResult data={data.data} dataErr={null} />
                    <AccordionTableResult data={null} dataErr={data.data_error} />
                </Grid>
            </Grid>

        </>
    )
}

interface PropsAcc {
    data: DatuInventarioMoviment[] | null;
    dataErr: DataError[] | null;
}
const AccordionTableResult: FC<PropsAcc> = ({ data, dataErr }) => {
    return (
        <>
            <Accordion elevation={2}>
                <AccordionSummary
                    expandIcon={<GridExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography
                        sx={{ width: '33%', flexShrink: 0 }}
                        variant="h6"
                    >
                        {dataErr ? "Registros fallidos" : "Registros exitosos"}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {
                        dataErr ? (
                            <TableContainer>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <StyledTableCell>Tracker</StyledTableCell>
                                            <StyledTableCell align="right">Codigo SAP</StyledTableCell>
                                            <StyledTableCell align="right">Fecha vencimiento</StyledTableCell>
                                            <StyledTableCell align="right">Cantidad</StyledTableCell>
                                            <StyledTableCell align="right">Error</StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {dataErr.map((row, index) => (
                                            <TableRow
                                                key={index}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <StyledTableCell component="th" scope="row">
                                                    {row.tracker_id}
                                                </StyledTableCell>
                                                <StyledTableCell align="right">{row.codigo_sap}</StyledTableCell>
                                                <StyledTableCell align="right">{format(new Date(row.fecha_vencimiento), 'dd/MM/yyyy')}</StyledTableCell>
                                                <StyledTableCell align="right">{row.cantidad}</StyledTableCell>
                                                <StyledTableCell align="right">{row.error}</StyledTableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <TableContainer>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <StyledTableCell>Tracker</StyledTableCell>
                                            <StyledTableCell align="right">Codigo SAP</StyledTableCell>
                                            <StyledTableCell align="left">Nombre producto</StyledTableCell>
                                            <StyledTableCell align="right">Cantidad</StyledTableCell>
                                            <StyledTableCell align="right">Centro de distribución</StyledTableCell>

                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data?.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <StyledTableCell component="th" scope="row">
                                                    {row.tracker}
                                                </StyledTableCell>
                                                <StyledTableCell align="right">{row.product_sap_code}</StyledTableCell>
                                                <StyledTableCell align="left">{row.product_name}</StyledTableCell>
                                                <StyledTableCell align="right">{row.quantity}</StyledTableCell>
                                                <StyledTableCell align="right">{row.distributor_center_name}</StyledTableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )
                    }
                </AccordionDetails>
            </Accordion>

        </>
    )
}

