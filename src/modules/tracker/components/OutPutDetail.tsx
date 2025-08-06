import {
  Grid,
  IconButton,
  Table,
  TableBody,
  TableHead,
  TableRow,
} from "@mui/material";
import { StyledTableCell } from "./CheckForm";
import {
  DetalleCargaSalida,
  Seguimiento,
} from "../../../store/seguimiento/seguimientoSlice";
import { FC } from "react";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import { useAppDispatch, useAppSelector } from "../../../store";
import { removeOutProduct } from "../../../store/seguimiento/trackerThunk";
import { OutputType } from "../../../interfaces/tracking";
import outputTypeDataToShow from "../../../config/outputTypeData";
interface OutPutDetailProps {
  seguimiento: Seguimiento;
  disable?: boolean;
  outputType: OutputType;
}
export const OutPutDetail: FC<OutPutDetailProps> = ({
  seguimiento,
  disable,
  outputType,
}) => {
  const seguimeintoActual = useAppSelector(
    (state) => state.seguimiento.seguimeintoActual
  );
  const dispatch = useAppDispatch();
  const handleDelete = (detalle: DetalleCargaSalida) => {
    if (seguimeintoActual === undefined) return;
    dispatch(removeOutProduct(seguimeintoActual, detalle));
  };

  const tableContain = outputTypeDataToShow.find(
    (ot) => ot.name.toUpperCase() === outputType.name
  );

  return (
    <>
      <Grid item xs={12} sx={{ marginTop: 0.9 }} md={12}>
        {outputType.required_details ? (
          <Table size="small" aria-label="a dense table" sx={{ marginTop: 2 }}>
            <TableHead>
              <TableRow>
                <StyledTableCell align="left">No. SAP</StyledTableCell>
                <StyledTableCell align="left">Producto</StyledTableCell>
                <StyledTableCell align="left">Cantidad</StyledTableCell>
                <StyledTableCell align="left">Fecha Exp.</StyledTableCell>
                {!disable && (
                  <StyledTableCell align="right">Acciones</StyledTableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {seguimiento?.detallesSalida?.map((detalle, index) => (
                <TableRow
                  key={index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <StyledTableCell align="left">
                    {detalle.sap_code}
                  </StyledTableCell>
                  <StyledTableCell align="left">{detalle.name}</StyledTableCell>
                  <StyledTableCell align="left">
                    {detalle.amount}
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    {detalle.expiration_date || 'N/A'}
                  </StyledTableCell>
                  {!disable && (
                    <StyledTableCell align="right">
                      <IconButton
                        aria-label="delete"
                        size="small"
                        onClick={() => handleDelete(detalle)}
                      >
                        {/* <DeleteIcon fontSize="inherit" /> */}
                        <DeleteTwoToneIcon fontSize="inherit" />
                      </IconButton>
                    </StyledTableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : !outputType.required_orders ? (
          <Table size="small" aria-label="a dense table" sx={{ marginTop: 2 }}>
            <TableHead>
              <TableRow>
                <StyledTableCell align="left">Material</StyledTableCell>
                <StyledTableCell align="left">Texto Breve</StyledTableCell>
                <StyledTableCell align="left">Cantidad</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableContain?.rows.map((detalle, index) => (
                <TableRow
                  key={index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <StyledTableCell align="left">
                    {detalle.material}
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    {detalle.description}
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    {detalle.quantity}
                  </StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table size="small" aria-label="a dense table" sx={{ marginTop: 2 }}>
            <TableHead>
              <TableRow>
                <StyledTableCell align="left">No. SAP</StyledTableCell>
                <StyledTableCell align="left">Producto</StyledTableCell>
                <StyledTableCell align="left">Cantidad</StyledTableCell>
                <StyledTableCell align="left">Fecha Exp.</StyledTableCell>
                {!disable && (
                  <StyledTableCell align="right">Acciones</StyledTableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {seguimiento?.detallesSalida?.map((detalle, index) => (
                <TableRow
                  key={index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <StyledTableCell align="left">
                    {detalle.sap_code}
                  </StyledTableCell>
                  <StyledTableCell align="left">{detalle.name}</StyledTableCell>
                  <StyledTableCell align="left">
                    {detalle.amount}
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    {detalle.expiration_date || 'N/A'}
                  </StyledTableCell>
                  {!disable && (
                    <StyledTableCell align="right">
                      <IconButton
                        aria-label="delete"
                        size="small"
                        onClick={() => handleDelete(detalle)}
                      >
                        {/* <DeleteIcon fontSize="inherit" /> */}
                        <DeleteTwoToneIcon fontSize="inherit" />
                      </IconButton>
                    </StyledTableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Grid>
    </>
  );
};
