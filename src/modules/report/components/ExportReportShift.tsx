import { FC, useState } from "react";
import { TrackerProductDetail, TrackerProductDetailQueryParams } from "../../../interfaces/tracking";
import { Button, CircularProgress, MenuItem, Typography } from "@mui/material";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { StyledMenu } from "../../ui/components/StyledMenu";
import GridOnSharpIcon from '@mui/icons-material/GridOnSharp';
import CodeIcon from '@mui/icons-material/Code';
import { format, isValid } from "date-fns";
import { exportToCSV, exportToXLSX } from "../../../utils/exportToCSV";
import backendApi from "../../../config/apiConfig";
import { BaseApiResponse } from "../../../interfaces/api";
import { useAppSelector } from "../../../store";

interface ExportReportShiftProps {
    disabled: boolean;
    query: TrackerProductDetailQueryParams;
    count: number;
    turno: string;
}

export const ExportReportShift: FC<ExportReportShiftProps> = ({ disabled, query, count, turno }) => {
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
        const response = await backendApi.get<BaseApiResponse<TrackerProductDetail>>(
            `/tracker-detail-product/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: { ...query, offset: 0, limit: count },
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
            "Turno",
            "Codigo",
            "Producto",
            "Pallets",
            "Fecha vencimiento",
        ];
        const trackerData = data.results.map((tr) => [
            "TRK-" + tr.id.toString().padStart(5, "0"),
            turno,
            tr.product_sap_code,
            tr.product_name,
            tr.quantity,
            tr.expiration_date,
        ]);
        if (type == "csv") {
            await exportToCSV({
                data: [headers, ...trackerData],
                filename: `reporte_turno_${turno}_${format(
                    new Date(),
                    "dd-MM-yyyy"
                )}.csv`,
            });
        } else if (type == "xlsx") {
            await exportToXLSX({
                data: [headers, ...trackerData],
                filename: `reporte_turno_${turno}_${format(
                    new Date(),
                    "dd-MM-yyyy"
                )}.xlsx`,
                dateStart: query.created_at__gte && isValid(new Date(query.created_at__gte)) ? format(new Date(query.created_at__gte), "dd/MM/yyyy HH:mm") : undefined,
                dateEnd: query.created_at__lte && isValid(new Date(query.created_at__lte)) ? format(new Date(query.created_at__lte), "dd/MM/yyyy HH:mm") : undefined,
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
    )
}
