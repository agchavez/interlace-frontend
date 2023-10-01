import { FunctionComponent, useEffect, useState } from "react";
import { Period } from "../../../interfaces/maintenance";
import {
  DetalleCarga,
  DetalleCargaPalet,
  Seguimiento,
} from "../../../store/seguimiento/seguimientoSlice";
import { UpdateProductoPalletParams } from "./ProductoEntradaTableRow";
import PalletPrint from "./PalletPrint";
import {
  Grid,
  IconButton,
  TableCell,
  TableRow,
  TextField,
} from "@mui/material";
import PrintComponent from "../../../utils/componentPrinter";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import LocalPrintshopTwoToneIcon from "@mui/icons-material/LocalPrintshopTwoTone";

interface ProductoEntradaPalletTableRowProps {
  index: number;
  disable?: boolean;
  historyRow: DetalleCargaPalet;
  updateProductoPallet: (datos: UpdateProductoPalletParams) => unknown;
  detalle: DetalleCarga;
  seguimiento: Seguimiento;
  removeProductoPallet: (datos: { palletIndex: number; id: number }) => void;
  productPeriod: { loading: boolean; period: Period };
}

export const ProductoEntradaPalletTableRow: FunctionComponent<
  ProductoEntradaPalletTableRowProps
> = ({
  index,
  historyRow,
  updateProductoPallet,
  removeProductoPallet,
  detalle,
  seguimiento,
  disable,
  productPeriod,
}) => {
  const [willPrint, setWillPrint] = useState(false);
  const [componenPrint, setComponentPrint] = useState(<></>);
  const [pallets, setPallets] = useState<number | null>(historyRow.pallets || null);

  const [date, setDate] = useState<Date | undefined>(
    historyRow.date && historyRow.date !== null
      ? new Date(historyRow.date.split("T")[0])
      : undefined
  );

  const onclickPrint = () => {
    const red = [];
    const max = historyRow.pallets || 0;
    for (let i = 0; i < max; i++) {
      red.push(
        <PalletPrint
          pallet={{
            numeroSap: +detalle.sap_code,
            rastra: seguimiento.rastra.code,
            nDocEntrada: seguimiento.documentNumber || seguimiento.invoiceNumber || "",
            fechaVencimiento: historyRow.date || new Date().toISOString(),
            nPallets: historyRow.pallets || 0,
            cajasPallet: detalle.boxes_pre_pallet,
            origen: `${seguimiento.originLocationData?.code} - ${seguimiento.originLocationData?.name}`,
            periodo: productPeriod.period.label,
            trackingId: seguimiento.id,
            detalle_pallet_id: historyRow.id || 0,
            tracker_detail: detalle.id,
            nombre_producto: detalle.name,
            block: detalle.block_days,
            pre_block: detalle.pre_block_days_next,
          }}
        />
      );
      if ((i + 1) % 2 === 0 && i + 1 < max) {
        red.push(
          <Grid item xs={12} style={{ pageBreakBefore: "always" }}></Grid>
        );
      }
    }
    setComponentPrint(<Grid container>{red}</Grid>);
    setWillPrint(true);
  };

  const print = PrintComponent({
    pageOrientation: "landscape",
    component: componenPrint,
    margin: "10px",
  });

  useEffect(() => {
    if (willPrint) {
      setWillPrint(false);
      print.print();
    }
  }, [print, willPrint]);

  return (
    <TableRow key={index}>
      {willPrint && print.component}
      <TableCell align="right">
        <TextField
          fullWidth
          id="outlined-basic"
          size="small"
          type="number"
          value={pallets}
          disabled={disable}
          onChange={(e) => setPallets(+e.target.value)}
          onBlur={(e) =>
            updateProductoPallet({
              date: date || null,
              pallets: +e.target.value,
              palletIndex: index,
              id: historyRow.id || 0,
            })
          }
        />
      </TableCell>
      <TableCell component="th" scope="row" align="right">
        <TextField
          fullWidth
          id="outlined-basic"
          size="small"
          type="date"
          disabled={disable}
          value={date?.toISOString().split("T")[0]}
          datatype="date"
          onChange={(e) => {
            const inputDate = new Date(e.target.value + "T00:00:00");
            if (!isNaN(inputDate.getTime())) {
              setDate(inputDate);
            }
          }}
          onBlur={(e) => {
            const inputDate = new Date(e.target.value + "T00:00:00");

            if (!isNaN(inputDate.getTime())) {
              // Verificar si es una fecha válida
              updateProductoPallet({
                date: inputDate,
                palletIndex: index,
                id: historyRow.id || 0,
                pallets: pallets,
              });
            }
          }}
        />
      </TableCell>
      {!disable && (
        <TableCell align="right">
          <IconButton
            aria-label="delete"
            size="medium"
            onClick={() =>
              removeProductoPallet({
                palletIndex: index,
                id: historyRow.id || 0,
              })
            }
          >
            <DeleteTwoToneIcon fontSize="inherit" color="secondary" />
          </IconButton>
          <IconButton
            aria-label="edit"
            size="medium"
            onClick={onclickPrint}
            disabled={productPeriod.loading}
          >
            <LocalPrintshopTwoToneIcon fontSize="inherit" color="secondary" />
          </IconButton>
        </TableCell>
      )}
    </TableRow>
  );
};
