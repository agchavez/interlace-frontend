import { useEffect, useState } from "react";
import {
  Container,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  tableCellClasses,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  LastTrackerOutput,
  TrackerProductDetail,
} from "../../../interfaces/tracking";
import { format, parseISO } from "date-fns";
import {
  useGetLastTrackerOutputQuery,
  useGetTrackerPalletsQuery,
} from "../../../store/seguimiento/trackerApi";
import outputTypeDataToShow from "../../../config/outputTypeData";
import voidProductsList from "../../../config/voidProductsList";
import { useAppSelector } from "../../../store";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { appendLeftZeros } from "../../../utils/common";
import FullViewDialog from "../components/FullViewmodal";
import AspectRatioTwoToneIcon from "@mui/icons-material/AspectRatioTwoTone";

export const ViewTrackerPage = ({ isModal = false }: { isModal?: boolean }) => {
  const [modlaOpen, setModalOpen] = useState(false);
  const {
    data: entradas,
    refetch: refetchEntradas,
    isLoading: isLoadingEntradas,
  } = useGetTrackerPalletsQuery({
    offset: 0,
    limit: 10,
    ordering: "-created_at",
  });
  const {
    data: salidas,
    refetch: refetchSalidas,
    isLoading: isLoadingSalidas,
  } = useGetLastTrackerOutputQuery({
    limit: 7,
  });
  useEffect(() => {
    const interval = setInterval(() => {
      refetchEntradas();
      refetchSalidas();
    }, 30000);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const user = useAppSelector((state) => state.auth.user);

  const [showedError, setShowedError] = useState(false);

  if (
    (user && user.centro_distribucion === undefined) ||
    user?.centro_distribucion === null
  ) {
    if (!showedError) {
      toast.error("Debe tener centro de distribución para visitar esta página");
      setShowedError(true);
    }
    return <Navigate to="/" replace />;
  }
  return (
    <>
      <Container maxWidth="xl" sx={{ marginTop: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container justifyContent="space-between">
              <Grid item>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography variant="h5" component="h1" fontWeight={400}>
                    Vista de Trackers
                  </Typography>
                  <Typography variant="body1" component="p" fontWeight={200}>
                    DH01 - CD LA GRANJA
                  </Typography>
                </div>
              </Grid>
              {!isModal && (
                <Grid item>
                  {modlaOpen && (
                    <FullViewDialog
                      open={modlaOpen}
                      handleClose={() => setModalOpen(false)}
                    >
                      {<ViewTrackerPage isModal={true} />}
                    </FullViewDialog>
                  )}
                  <IconButton
                    color="primary"
                    size="medium"
                    onClick={() => setModalOpen(true)}
                  >
                    <AspectRatioTwoToneIcon />
                  </IconButton>
                </Grid>
              )}
            </Grid>
            <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Divider textAlign="left">
              <Typography variant="h6" component="h2" fontWeight={400}>
                ENTRADAS
              </Typography>
            </Divider>
            {isLoadingEntradas ? (
              <CircularProgress />
            ) : (
              <CustomizedTables rows={entradas?.results || []} />
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Divider textAlign="left">
              <Typography variant="h6" component="h2" fontWeight={400}>
                SALIDAS
              </Typography>
            </Divider>
            {isLoadingSalidas ? (
              <CircularProgress />
            ) : (
              <CustomizedTablesOut rows={salidas?.results || []} />
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableCellEntrada = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "green",
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableCellSalida = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "red",
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

interface CustomizedTablesProps {
  rows: TrackerProductDetail[];
}

export function CustomizedTables({ rows }: CustomizedTablesProps) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{}} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCellEntrada align="left">
              # Tracking
            </StyledTableCellEntrada>
            <StyledTableCellEntrada align="left">
              Codigo SAP
            </StyledTableCellEntrada>
            <StyledTableCellEntrada align="left">
              Producto
            </StyledTableCellEntrada>
            <StyledTableCellEntrada align="left">
              Pallets
            </StyledTableCellEntrada>
            <StyledTableCellEntrada align="left">
              Vencimiento
            </StyledTableCellEntrada>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const parsedDate = parseISO(
              row?.expiration_date.split("T")[0] || ""
            );
            return (
              <StyledTableRow key={row.id}>
                <StyledTableCell align="left">
                  {row.tracker_id &&
                    `TRK-${appendLeftZeros(row.tracker_id, 5)}`}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {row.product_sap_code}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  {row.product_name}
                </StyledTableCell>
                <StyledTableCell align="left">{row.quantity}</StyledTableCell>
                <StyledTableCell align="left">
                  {format(new Date(parsedDate), "dd-MM-yyyy")}
                </StyledTableCell>
              </StyledTableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

interface CustomizedTablesOutProps {
  rows: LastTrackerOutput[];
}

export function CustomizedTablesOut({ rows }: CustomizedTablesOutProps) {
  const rowsToShow: LastTrackerOutput[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.required_details) {
      rowsToShow.push(row);
      continue;
    }
    const dataByType = outputTypeDataToShow.find(
      (ot) => ot.name.toLowerCase() === row.output_type_name.toLowerCase()
    );
    if (!dataByType) continue;
    for (let i = 0; i < dataByType.rows.length; i++) {
      const otrow = dataByType.rows[i];
      if (otrow.material === "3501451") continue;
      if (row) {
        rowsToShow.push({
          output_type_name: row.output_type_name,
          required_details: false,
          tracking: row.tracking,
          sap_code: otrow.material,
          product_name: otrow.description,
          quantity: otrow.quantity,
        });
      }
    }
  }
  return (
    <TableContainer component={Paper}>
      <Table sx={{}} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCellSalida align="left">
              Categoría
            </StyledTableCellSalida>
            <StyledTableCellSalida align="left">
              # Tracking
            </StyledTableCellSalida>
            <StyledTableCellSalida align="left">
              Codigo SAP
            </StyledTableCellSalida>
            <StyledTableCellSalida align="left">Producto</StyledTableCellSalida>
            <StyledTableCellSalida align="left">Pallets</StyledTableCellSalida>
            <StyledTableCellSalida align="left">
              Vencimiento
            </StyledTableCellSalida>
          </TableRow>
        </TableHead>
        <TableBody>
          {rowsToShow.map((row) => (
            <StyledTableRow>
              <StyledTableCell align="left">
                {voidProductsList.find((vp) => vp === row.sap_code)
                  ? "Vacío"
                  : "Lleno"}
              </StyledTableCell>
              <StyledTableCell align="left">
                {row.tracking && `TRK-${appendLeftZeros(row.tracking, 5)}`}
              </StyledTableCell>
              <StyledTableCell align="left">{row.sap_code}</StyledTableCell>
              <StyledTableCell component="th" scope="row">
                {row.product_name}
              </StyledTableCell>
              <StyledTableCell align="left">{row.quantity}</StyledTableCell>
              <StyledTableCell align="left">
                {row.expiration_date &&
                  format(new Date(row.expiration_date), "dd-MM-yyyy")}
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ViewTrackerPage;
