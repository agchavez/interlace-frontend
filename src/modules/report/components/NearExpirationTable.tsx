import * as React from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { CircularProgress, TablePagination } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from "react-router-dom";

interface NearExpirationTableProps {
  rows: NearExpirationProduct[];
  count: number;
  paginationModel: PaginationModel;
  loading: boolean;
  setPaginationModel: (paginationModel: PaginationModel) => void;
}

interface PaginationModel {
  pageSize: number;
  page: number;
}

export interface NearExpirationProduct {
  productName: string;
  sap_code: string;
  distributorCenter: string;
  registeredDates: number;
  total: number;
  history: HistoryRow[];
}

interface HistoryRow {
  expirationDate: string;
  quantity: number;
  trackerId: number;
  daysExpiration: number;
  available_quantity: number;
}

function Row(props: { row: NearExpirationProduct }) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell >{row.sap_code}</TableCell>
        <TableCell component="th" scope="row">
          {row.productName}
        </TableCell>
       
        <TableCell align="center">{row.registeredDates}</TableCell>
        <TableCell align="right">{row.total}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Histórico
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                  <TableCell>#Tracking</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Pallets</TableCell>
                    <TableCell>Cajas disponibles</TableCell>
                    <TableCell>Días Restantes</TableCell>
                    <TableCell align="center">
                      Ver
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.history.map((historyRow) => (
                    <TableRow key={historyRow.expirationDate}>
                       <TableCell component="th" scope="row">
                        TKR-{historyRow.trackerId.toString().padStart(5, "0")}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {historyRow.expirationDate}
                      </TableCell>
                      <TableCell>{historyRow.quantity}</TableCell>
                      <TableCell>{historyRow.available_quantity}</TableCell>
                      <TableCell>{historyRow.daysExpiration}</TableCell>
                      <TableCell align="center">
                      <IconButton size="small" color="primary" aria-label="add to shopping cart" onClick={() => navigate('/tracker/detail/' + historyRow.trackerId)}>
                        <ArrowForwardIcon />
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
    </React.Fragment>
  );
}

export default function NearExpirationTable({
  rows,
  count,
  paginationModel,
  loading,
  setPaginationModel,
}: NearExpirationTableProps) {
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPaginationModel({ ...paginationModel, page: newPage });
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPaginationModel({ page: 0, pageSize: +event.target.value });
  };
  return (
    <Paper sx={{ width: "100%" }}>
      <TableContainer>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Código Sap</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell align="center">Fechas Registradas</TableCell>
              <TableCell align="right">Cajas Totales</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow sx={{ height: 50 }}>
                <TableCell
                  align="right"
                  colSpan={5}
                  sx={{
                    textAlign: "center",
                  }}
                >
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => <Row key={row.sap_code} row={row} />)
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={count}
        rowsPerPage={paginationModel.pageSize}
        labelRowsPerPage="Lineas por página"
        page={paginationModel.page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
