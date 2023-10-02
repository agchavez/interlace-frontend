import { FunctionComponent } from "react";
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
interface ExportManageProps {
  disabled: boolean;
  query: TrackerQueryParams;
}

const ExportManageMenu: FunctionComponent<ExportManageProps> = ({
  disabled,
  query,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
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
        params: { ...query, offset: 0, limit: undefined },
      }
    );
    return response.data;
  };

  const handleExport = async (type: "csv" | "xlsx") => {
    const data = await fetchData();
    const headers = [
      "Tracking",
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
    ];
    const trackerData = data.results.map((tr) => [
      tr.id,
      tr.distributor_center_data.name,
      tr.tariler_data.code,
      tr.input_document_number,
      tr.invoice_number,
      tr.transfer_number,
      tr.output_document_number,
      tr.accounted,
      tr.status,
      tr.created_at,
      tr.completed_date,
    ]);
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
    handleClose();
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
        endIcon={<CloudDownloadIcon />}
        disabled={disabled}
      >
        Exportar
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
          CSV
        </MenuItem>
        <MenuItem onClick={() => handleExport("xlsx")} disableRipple>
          <CodeIcon />
          XLSX
        </MenuItem>
      </StyledMenu>
    </div>
  );
};

export default ExportManageMenu;
