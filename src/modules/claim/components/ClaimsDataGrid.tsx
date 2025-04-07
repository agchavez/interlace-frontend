import { DataGrid, GridColDef, esES } from "@mui/x-data-grid";
      import { FC, useState, useEffect } from "react";
      import { Typography, IconButton, Chip } from "@mui/material";
      import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
      import { format } from "date-fns";
      import { useNavigate } from "react-router-dom";
      import { useAppSelector } from "../../../store";

      const tableBase = {
        localeText: esES.components.MuiDataGrid.defaultProps.localeText,
        className: "base__table",
        columnHeaderHeight: 35,
        style: { height: "60vh", width: "100%", cursor: "pointer" },
        pageSizeOptions: [15, 20, 50],
        disableColumnFilter: true,
        disableColumnMenu: true,
      };

      interface ClaimsDataGridProps {
        claims: any[];
        loading: boolean;
        claimType: "LOCAL" | "IMPORT";
        pagination: {
          page: number;
          pageSize: number;
          setPage: (page: number, pageSize: number) => void;
        };
        totalCount: number;
        path: string;
      }

      const ClaimsDataGrid: FC<ClaimsDataGridProps> = ({ claims, loading, claimType, pagination, totalCount, path }) => {
        const navigate = useNavigate();
        const { disctributionCenters } = useAppSelector((state) => state.maintenance);

        const columns: GridColDef[] = [
          {
            field: "created_at",
            headerName: "Fecha Registro",
            flex: 1,
            width: 120,
            minWidth: 120,
            renderCell: (params) => (
              <Typography variant="body2">
                {params.value ? format(new Date(params.value), "dd/MM/yyyy") : "-"}
              </Typography>
            ),
          },
          {
            field: "id",
            headerName: "ID Reclamo",
            flex: 1,
            width: 120,
            minWidth: 120,
            renderCell: (params) => (
              <Typography variant="body2">
                RCL-{params.value.toString().padStart(5, "0")}
              </Typography>
            ),
          },
          {
            field: "distributor_center",
            headerName: "Centro de distribución",
            flex: 1,
            width: 180,
            minWidth: 180,
            renderCell: (params) => (
              <Typography variant="body2">
                {disctributionCenters.find(dc => dc.id === params.value)?.name || "-"}
              </Typography>
            ),
          },
          {
            field: "tipo",
            headerName: "Tipo",
            flex: 1,
            width: 180,
            minWidth: 180,
            renderCell: (params) => {
              return <Typography variant="body2">{params.value}</Typography>;
            },
          },
          {
            field: "status",
            headerName: "Estado",
            flex: 1,
            width: 130,
            minWidth: 130,
            renderCell: (params) => {
              let color: "error" | "default" | "warning" | "info" | "success";
              let label;

              switch(params.value) {
                case "PENDIENTE":
                  color = "warning";
                  label = "Pendiente";
                  break;
                case "EN_REVISION":
                  color = "info";
                  label = "En Revisión";
                  break;
                case "RECHAZADO":
                  color = "error";
                  label = "Rechazado";
                  break;
                case "APROBADO":
                  color = "success";
                  label = "Aprobado";
                  break;
                default:
                  color = "default";
                  label = "Desconocido";
              }

              return <Chip label={label} variant="outlined" color={color} size="small" />;
            },
          },
          {
            field: "reference_number",
            headerName: claimType === "LOCAL" ? "Número de Transferencia" : "Número de Factura",
            flex: 1,
            width: 180,
            minWidth: 180,
            renderCell: (params) => (
              <Typography variant="body2">{params.value || "-"}</Typography>
            ),
          },
          {
            field: "user_name",
            headerName: "Creado por",
            flex: 1,
            width: 180,
            minWidth: 180,
            renderCell: (params) => (
              <Typography variant="body2">{params.value || "-"}</Typography>
            ),
          },
          {
            field: "actions",
            headerName: "Acciones",
            flex: 0,
            width: 80,
            renderCell: (params) => (
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  if (path === "mine") {
                    return navigate(`/claim/detail/${params.row.id}`)
                  }
                  navigate(`/claim/editstatus/${params.row.id}`)
                }}
              >
                <ArrowForwardIcon />
              </IconButton>
            ),
          },
        ];

        const [paginationModel, setPaginationModel] = useState({
          pageSize: pagination.pageSize,
          page: pagination.page,
        });

        useEffect(() => {
          pagination.setPage(paginationModel.page, paginationModel.pageSize);
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [paginationModel]);

        return (
          <DataGrid
            {...tableBase}
            columns={columns}
            rows={claims}
            paginationMode="server"
            rowCount={totalCount}
            pagination
            getRowHeight={() => 'auto'}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            loading={loading}
            onRowDoubleClick={(params) => {
              if (path === "mine") {
                return navigate(`/claim/detail/${params.id}`)
              }
              navigate(`/claim/editstatus/${params.id}`)
            }}
          />
        );
      };

      export default ClaimsDataGrid;