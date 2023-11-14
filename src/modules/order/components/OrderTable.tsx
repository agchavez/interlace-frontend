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
import { useNavigate } from "react-router-dom";
import { Order } from "../../../interfaces/orders";
import { format, toDate } from "date-fns-tz";
import { useAppDispatch } from "../../../store";
import { deleteOrder } from "../../../store/order";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import { DeleteOrderModal } from "./DeleteOrderModal";

interface OrderTableProps {
  rows: Order[];
  count: number;
  paginationModel: PaginationModel;
  loading: boolean;
  setPaginationModel: (paginationModel: PaginationModel) => void;
  refetch: () => void;
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
}

const statusValues = {
  PENDING: "Pendiente",
  IN_PROCESS: "En Progreso",
  COMPLETED: "Completado",
};

function Row(props: { row: Order; refetch?: () => void }) {
  const { row, refetch } = props;
  const [open, setOpen] = React.useState(false);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const dispatch = useAppDispatch();
  const handleClickEliminar = (id: number) => {
    dispatch(
      deleteOrder(id, () => {
        refetch && refetch();
      })
    );
  };
  const navigate = useNavigate();
  const handleClickEditar = async (id: number) => {
    navigate(`/order/register?edit=true&orderId=${id}`);
  };
  return (
    <React.Fragment>
      <TableRow onDoubleClick={() => handleClickEditar(row.id)}>
        {openDeleteModal && (
          <DeleteOrderModal
            title="Eliminar Pedido"
            message="¿Está seguro que desea eliminar el pedido?"
            open={openDeleteModal}
            handleClose={() => setOpenDeleteModal(false)}
            onDelete={()=>handleClickEliminar(row.id)}
          />
        )}
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        <TableCell>ORD-{row.id.toString().padStart(5, "0")}</TableCell>
        <TableCell component="th" scope="row">
          {row.location_data.name} - {row.location_data.code}
        </TableCell>
        <TableCell>{row.observations}</TableCell>
        <TableCell>{statusValues[row.status]}</TableCell>
        <TableCell align="right">
          {row.status === "PENDING" && (
            <>
              <IconButton
                color="info"
                onClick={() => handleClickEditar(row.id)}
              >
                <EditTwoToneIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => setOpenDeleteModal(true)}
              >
                <DeleteTwoToneIcon />
              </IconButton>
            </>
          )}
        </TableCell>
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
                    <TableCell>Tracking</TableCell>
                    <TableCell>No. SAP</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell>Cajas</TableCell>
                    <TableCell>Cajas disponibles</TableCell>
                    <TableCell>Fecha Expiración</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.order_detail.map((historyRow) => (
                    <TableRow key={historyRow.id}>
                      <TableCell>
                        TRK-
                        {historyRow.tracking_id.toString().padStart(8, "0")}
                      </TableCell>
                      <TableCell>{historyRow.product_data?.sap_code}</TableCell>
                      <TableCell>{historyRow.product_data?.name}</TableCell>
                      <TableCell>{historyRow.quantity}</TableCell>
                      <TableCell>{historyRow.quantity_available}</TableCell>
                      <TableCell>
                        {format(
                          toDate(
                            new Date(historyRow.expiration_date)
                              .toISOString()
                              .split("T")[0]
                          ),
                          "yyyy-MM-dd"
                        )}
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

export default function OrderTable({
  rows,
  count,
  paginationModel,
  loading,
  setPaginationModel,
  refetch,
}: OrderTableProps) {
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
              <TableCell>Id</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Observaciones</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
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
              rows.map((row) => (
                <Row key={row.id} row={row} refetch={refetch} />
              ))
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
