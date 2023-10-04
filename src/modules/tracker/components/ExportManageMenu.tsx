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
import { format } from "date-fns";
import { optionsTypeTracker } from "../../../utils/common";
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
    const response = await backendApi.get<BaseApiResponse<Tracker>>(
      `/tracker/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { ...query, offset: 0, limit: t1Count },
      }
    );
    return response.data;
  };

  const handleExport = async (type: "csv" | "xlsx") => {
    setLoading(true);
    handleClose();
    const data = await fetchData();
    const headers = [
      "Tracking",
      "Tipo",
      "Centro de Distribución",
      "Trailer",
      "Transferencia de entrada",
      "No. Factura",
      "Traslado 5001",
      "Transferencia de salida",
      "Contabilizado",
      "Estado",
      "Registrado el",
      "Completado el",
      "Usuario",
    ];
    const trackerData = data.results.map((tr) => {
      return [
        "TRK-" + tr.id.toString().padStart(10, "0"),
        optionsTypeTracker[tr.type],
        tr.distributor_center_data.name,
        tr.tariler_data.code,
        tr.input_document_number,
        tr.invoice_number,
        tr.transfer_number,
        tr.output_document_number,
        tr.accounted,
        tr.status == "COMPLETE"
          ? "Completado"
          : tr.status == "PENDING"
          ? "Pendiente"
          : "En atención",
        format(new Date(tr.created_at), "dd/MM/yyyy hh:mm"),
        tr.completed_date
          ? format(new Date(tr.completed_date), "dd/MM/yyyy hh:mm")
          : "-",
        tr.user_name,
      ];
    });
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
