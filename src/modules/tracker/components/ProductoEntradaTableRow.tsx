import { Fragment, FunctionComponent, useState } from "react";
import {
  DetalleCarga,
  Seguimiento,
} from "../../../store/seguimiento/seguimientoSlice";
import { useAppDispatch, useAppSelector } from "../../../store";
import { useGetProductPeriodQuery } from "../../../store/maintenance/maintenanceApi";
import {
  addDetallePallet,
  removeDetalle,
  removeDetallePallet,
  updateDetallePallet,
} from "../../../store/seguimiento/trackerThunk";
import { format } from "date-fns";
import {
  Box,
  Button,
  Collapse,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";
import { Period } from "../../../interfaces/maintenance";
import { ProductoEntradaPalletTableRow } from "./ProductoEntradaPalletTableRow";

export interface ProductoEntradaTableRowProps {
  row: DetalleCarga;
  seguimiento: Seguimiento;
  index: number;
  indexSeguimiento: number;
  disable: boolean;
}

export interface UpdateProductoPalletParams {
  palletIndex: number;
  date: Date | null;
  pallets: number | null;
  id: number;
  disable?: boolean;
}

export const ProductoEntradaTableRow: FunctionComponent<
  ProductoEntradaTableRowProps
> = ({ row, seguimiento, index, indexSeguimiento, disable }) => {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const {
    data: period,
    isLoading,
    isFetching,
  } = useGetProductPeriodQuery({ product: row.productId });
  const loadingSeguimiento = useAppSelector(
    (state) => state.seguimiento.loading
  );
  const handleClickAgregar = () => {
    dispatch(
      addDetallePallet(indexSeguimiento, index, {
        expiration_date: format(new Date(), "yyyy-MM-dd"),
        quantity: 0,
        tracker_detail: row.id,
      })
    );
  };

  const updateProductoPallet = (datos: UpdateProductoPalletParams): void => {
    dispatch(
      updateDetallePallet(indexSeguimiento, index, datos.palletIndex, {
        expiration_date: format(datos.date || new Date(), "yyyy-MM-dd"),

        quantity: datos.pallets,
        id: datos.id || 0,
        tracker_detail: row.id,
      })
    );
  };
  const removeProductoPallet = (datos: {
    palletIndex: number;
    id: number;
  }): void => {
    dispatch(
      removeDetallePallet(indexSeguimiento, index, datos.palletIndex, datos.id)
    );
  };

  const isValid = (): boolean => {
    return (
      row.history?.map((d) => d.pallets).reduce((a = 0, b = 0) => a + b, 0) !==
      +row.amount
    );
  };
  return (
    <Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            sx={{
              backgroundColor: isValid() ? "red" : "inherit   ",
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" align="right">
          {row.sap_code}
        </TableCell>
        <TableCell align="right">{row.name}</TableCell>
        <TableCell align="right">{row.amount}</TableCell>

        {!disable && (
          <TableCell align="right">
            <IconButton
              aria-label="expand row"
              size="small"
              disabled={disable}
              onClick={() =>
                dispatch(removeDetalle(indexSeguimiento, index, row.id))
              }
            >
              <DeleteTwoToneIcon />
            </IconButton>
          </TableCell>
        )}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Detalles
              </Typography>
              <Grid
                item
                sx={{
                  display: "flex",
                  justifyContent: "space-between    ",
                  alignItems: "center",
                  marginTop: 1,
                  marginBottom: 1,
                }}
                xs={12}
              >
                {!disable && (
                  <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    startIcon={<AddTwoToneIcon />}
                    onClick={handleClickAgregar}
                  >
                    Agregar
                  </Button>
                )}
                <Typography
                  variant="body1"
                  component="h1"
                  fontWeight={400}
                  color={isValid() ? "red" : "gray.500"}
                >
                  Total de Pallets: {"  "}
                  {row.history
                    ?.map((d) => d.pallets)
                    .reduce((a = 0, b = 0) => a + b, 0)}{" "}
                  de {row.amount}
                </Typography>
              </Grid>
              <Grid item xs={12} md={5} lg={2} xl={2}></Grid>

              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell align="right">Pallets</TableCell>
                    <TableCell align="right">Fecha</TableCell>
                    {!disable && <TableCell align="right">Acciones</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.history?.map((historyRow, index) => {
                    return (
                      <ProductoEntradaPalletTableRow
                        key={historyRow.id}
                        historyRow={historyRow}
                        index={index}
                        detalle={row}
                        disable={disable}
                        seguimiento={seguimiento}
                        updateProductoPallet={updateProductoPallet}
                        removeProductoPallet={removeProductoPallet}
                        productPeriod={{
                          loading:
                            isLoading || isFetching || loadingSeguimiento,
                          period: period as Period,
                        }}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
};
