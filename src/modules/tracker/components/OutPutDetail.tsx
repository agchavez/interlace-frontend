import { Grid, IconButton, Table, TableBody, TableHead, TableRow } from "@mui/material"
import { StyledTableCell } from './CheckForm';
import { DetalleCargaSalida, Seguimiento } from '../../../store/seguimiento/seguimientoSlice';
import { FC } from "react";
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { removeOutProduct } from "../../../store/seguimiento/trackerThunk";
interface OutPutDetailProps {
    seguimiento: Seguimiento
}
export const OutPutDetail:FC<OutPutDetailProps> = ({seguimiento}) => {
    const seguimeintoActual = useAppSelector(state => state.seguimiento.seguimeintoActual)
    const dispatch = useAppDispatch();
    const handleDelete = (detalle: DetalleCargaSalida) => {
        if (seguimeintoActual === undefined) return;
        dispatch(removeOutProduct(seguimeintoActual, detalle))
    }

    return (
        <>
            <Grid item xs={12} sx={{ marginTop: 0.9 }} md={12}>
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
                                Cantidad
                            </StyledTableCell>
                            <StyledTableCell align="right">
                                Acciones
                            </StyledTableCell>

                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            seguimiento?.detallesSalida?.map((detalle, index) => (
                                <TableRow
                                    key={index}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <StyledTableCell align="left">
                                        {detalle.sap_code}
                                    </StyledTableCell>
                                    <StyledTableCell align="left">
                                        {detalle.name}
                                    </StyledTableCell>
                                    <StyledTableCell align="left">
                                        {detalle.amount}
                                    </StyledTableCell>
                                    <StyledTableCell align="right">
                                        <IconButton aria-label="delete" size="small" onClick={() => handleDelete(detalle)}>
                                            {/* <DeleteIcon fontSize="inherit" /> */}
                                            <DeleteTwoToneIcon fontSize="inherit" />
                                        </IconButton>

                                    </StyledTableCell>
                                </TableRow>
                            ))

                        }
                    </TableBody>
                </Table>
            </Grid>
        </>
    )
}
