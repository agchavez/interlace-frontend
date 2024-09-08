import { FunctionComponent } from "react";
import { Typography, CircularProgress } from "@mui/material";
import { Tracker, TrackerQueryParams } from "../../../interfaces/tracking";
import MenuItem from "@mui/material/MenuItem";
import GridOnSharpIcon from "@mui/icons-material/GridOnSharp";
import CodeIcon from "@mui/icons-material/Code";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import Button from "@mui/material/Button";
import React from "react";
import { exportToCSV, exportToXLSX } from "../../../utils/exportToCSV";
import backendApi from "../../../config/apiConfig";
import { BaseApiResponse } from "../../../interfaces/api";
import { useAppSelector } from "../../../store";
import { StyledMenu } from "../../ui/components/StyledMenu";
import { format, } from "date-fns";
interface ExportManageProps {
  disabled: boolean;
  query: TrackerQueryParams;
  t1Count: number;
}

const ExportManageMenu: FunctionComponent<ExportManageProps> = ({
  disabled,
  query,
  t1Count,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [loading, setLoading] = React.useState(false);
  const { token } = useAppSelector((state) => state.auth);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const fetchData = async () => {
    const distributor_center = !query.distributor_center? undefined : query.distributor_center.length > 0 ? query.distributor_center[0] : undefined;
    const response = await backendApi.get<BaseApiResponse<Tracker>>(
      `/tracker/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { 
            ...query, 
            offset: 0, 
            limit: t1Count, 
            distributor_center: distributor_center, 
            date_after: query.date_after ? format(new Date(query.date_after), "yyyy-MM-dd") : undefined,
            date_before: query.date_before ? format(new Date(query.date_before), "yyyy-MM-dd") : undefined,
        }
      }
    );
    return response.data;
  };

  const handleExport = async (type: "csv" | "xlsx") => {
    setLoading(true);
    handleClose();
    let headers: string[] = []
    let trackerData:(string | number | null)[][] = []
    try {
      const data = await fetchData();
    if(query.type === "IMPORT" ){
      headers = [
        "Fecha",
        "Tracking",
        "Centro de Distribución",
        "# Contenedor",
        "# Placa",
        "No. Factura",
        "Traslado 5001",
        "Usuario",
        "Observaciones",
      ];
      trackerData = data.results.map((tr) => {
        return [
          format(new Date(tr.created_at), "dd/MM/yyyy hh:mm"),
          "TRK-" + tr.id.toString().padStart(5, "0"),
          tr.distributor_center_data.name,
          tr.container_number,
          tr.plate_number,
          tr.invoice_number,
          tr.transfer_number,
          tr.user_name,
          tr.observation,
        ];
      });
    } else {
      headers = [
        "Fecha",
        "Tracking",
        "Centro de Distribución",
        "Transferencia de entrada",
        "Traslado 5001",
        "Transferencia de Salida",
        "Contabilizado",
        "Usuario",
        "Operador 1",
        "Operador 2",
        "TAT",
        "Observaciones",
      ];
      trackerData = data.results.map((tr) => {
        const tiempoSalida = tr.output_date && new Date(tr.output_date);
        const tiempoEntrada = tr.input_date && new Date(tr.input_date);
        return [
          format(new Date(tr.created_at), "dd/MM/yyyy hh:mm"),
          "TRK-" + tr.id.toString().padStart(5, "0"),
          tr.distributor_center_data.name,
          tr.input_document_number,
          tr.transfer_number,
          tr.output_document_number,
          tr.accounted,
          tr.user_name,
          tr.operator_1_name || "",
          tr.operator_2_name || "",
          (tiempoSalida && tiempoEntrada
            // Solo tomar 2 decimales
          ? ((tiempoSalida.getTime() - tiempoEntrada.getTime()) / (1000 * 60)).toFixed(2) // Calcula la diferencia en minutos
          : ""),
          tr.observation,
        ];
      });
    }
    if (type == "csv") {
      await exportToCSV({
        data: [headers, ...trackerData],
        filename: "t1_report.csv",
      });
    } else if (type == "xlsx") {
      await exportToXLSX({
        data: [headers, ...trackerData],
        filename: "t1_report.xlsx",
      });
    }
    setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
    
  };

  return (
    <div>
      <Button
        id="demo-customized-button"
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={
          loading ? <CircularProgress size={15} /> : <CloudDownloadIcon />
        }
        disabled={disabled || loading}
      >
        {loading ? "Exportando..." : "Exportar"}
      </Button>
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleExport("csv")} disableRipple>
          <GridOnSharpIcon />
          <Typography ml={1}>CSV</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleExport("xlsx")} disableRipple>
          <CodeIcon />
          <Typography ml={1}>XLSX</Typography>
        </MenuItem>
      </StyledMenu>
    </div>
  );
};

export default ExportManageMenu;
