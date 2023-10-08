import { FC, useState } from "react";
import {
  NearExpirationProductResponse,
  TrackerProductDetailQueryParams,
} from "../../../interfaces/tracking";
import { Button, CircularProgress, MenuItem, Typography } from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { StyledMenu } from "../../ui/components/StyledMenu";
import GridOnSharpIcon from "@mui/icons-material/GridOnSharp";
import CodeIcon from "@mui/icons-material/Code";
import { differenceInDays, format, isValid, parseISO } from "date-fns";
import { exportToCSV, exportToXLSX } from "../../../utils/exportToCSV";
import backendApi from "../../../config/apiConfig";
import { BaseApiResponse } from "../../../interfaces/api";
import { useAppSelector } from "../../../store";

interface ExportReportNearExpirationShiftProps {
  disabled: boolean;
  query: TrackerProductDetailQueryParams;
  count: number;
  turno: string;
}

export const ExportReportNearExpiration: FC<
  ExportReportNearExpirationShiftProps
> = ({ disabled, query, count }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAppSelector((state) => state.auth);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const fetchData = async () => {
    const response = await backendApi.get<
      BaseApiResponse<NearExpirationProductResponse>
    >(`/report/next-win/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { ...query, offset: 0, limit: count },
    });
    return response.data;
  };

  const handleExport = async (type: "csv" | "xlsx") => {
    setLoading(true);
    handleClose();
    const data = await fetchData();
    const headers = [
      "Producto",
      "Codigo Sap",
      "Fecha Exp",
      "Cantidad",
      "Días restantes",
    ];
    const trackerData = data.results
      .map((tr) => {
        const rows = tr.expiration_list.map((row) => [
          tr.product_name,
          tr.sap_code,
          row.expiration_date,
          row.total_quantity,
          differenceInDays(parseISO(row.expiration_date), new Date()),
        ]);
        return rows;
      })
      .flat(1);
    if (type == "csv") {
      await exportToCSV({
        data: [headers, ...trackerData],
        filename: `reporte_por_vencer_${format(new Date(), "dd-MM-yyyy")}.csv`,
      });
    } else if (type == "xlsx") {
      await exportToXLSX({
        data: [headers, ...trackerData],
        filename: `reporte_por_vencer_${format(new Date(), "dd-MM-yyyy")}.xlsx`,
        dateStart:
          query.created_at__gte && isValid(new Date(query.created_at__gte))
            ? format(new Date(query.created_at__gte), "dd/MM/yyyy HH:mm")
            : undefined,
        dateEnd:
          query.created_at__lte && isValid(new Date(query.created_at__lte))
            ? format(new Date(query.created_at__lte), "dd/MM/yyyy HH:mm")
            : undefined,
      });
    }
    setLoading(false);
  };

  return (
    <>
      <Button
        id="demo-customized-button"
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        disableElevation
        fullWidth
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
    </>
  );
};
