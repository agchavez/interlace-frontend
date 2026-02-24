import { DataGrid, GridColDef, esES } from "@mui/x-data-grid";
import { FC, useState, useEffect, useMemo } from "react";
import { Typography, IconButton, Chip, Box, Card, CardContent, CardActionArea, useMediaQuery, useTheme, Stack, Divider, Pagination } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../store";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import AssignmentTurnedInTwoToneIcon from '@mui/icons-material/AssignmentTurnedInTwoTone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessIcon from '@mui/icons-material/Business';

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

// Helper para obtener configuración de estado
const getStatusConfig = (status: string) => {
  switch (status) {
    case "PENDIENTE":
      return { color: "warning" as const, label: "Pendiente", icon: <TimelapseIcon fontSize="small" /> };
    case "EN_REVISION":
      return { color: "primary" as const, label: "En Revisión", icon: <AssignmentTurnedInTwoToneIcon fontSize="small" /> };
    case "RECHAZADO":
      return { color: "error" as const, label: "Rechazado", icon: <CancelTwoToneIcon fontSize="small" /> };
    case "APROBADO":
      return { color: "success" as const, label: "Aprobado", icon: <CheckCircleIcon fontSize="small" /> };
    default:
      return { color: "default" as const, label: "Desconocido", icon: null };
  }
};

const ClaimsDataGrid: FC<ClaimsDataGridProps> = ({ claims, loading, claimType, pagination, totalCount, path }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { disctributionCenters } = useAppSelector((state) => state.maintenance);

  const handleNavigate = (id: number) => {
    if (path === "mine") {
      return navigate(`/claim/detail/${id}`);
    }
    navigate(`/claim/editstatus/${id}`);
  };

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
              let color: "error" | "default" | "warning" | "info" | "success" | "primary";
              let label;
              let icon;

              switch(params.value) {
                case "PENDIENTE":
                  color = "warning";
                  label = "Pendiente";
                  icon = <TimelapseIcon />;
                  break;
                case "EN_REVISION":
                  color = "primary";
                  label = "En Revisión";
                  icon = <AssignmentTurnedInTwoToneIcon />;
                  break;
                case "RECHAZADO":
                  color = "error";
                  label = "Rechazado";
                  icon = <CancelTwoToneIcon />;
                  break;
                case "APROBADO":
                  color = "success";
                  label = "Aprobado";
                  icon = <CheckCircleIcon />;
                  break;
                default:
                  color = "default";
                  label = "Desconocido";
              }

              return <Chip label={label} variant="outlined" color={color} icon={icon} />;
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

  // Vista móvil con tarjetas
  if (isMobile) {
    const totalPages = Math.ceil(totalCount / paginationModel.pageSize);

    return (
      <Box>
        {/* Lista de tarjetas */}
        <Stack spacing={1.5}>
          {loading ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Cargando...</Typography>
            </Box>
          ) : claims.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No hay reclamos</Typography>
            </Box>
          ) : (
            claims.map((claim) => {
              const statusConfig = getStatusConfig(claim.status);
              const dcName = disctributionCenters.find(dc => dc.id === claim.distributor_center)?.name || "-";

              return (
                <Card key={claim.id} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardActionArea onClick={() => handleNavigate(claim.id)}>
                    <CardContent sx={{ p: 2 }}>
                      {/* Header: ID y Estado */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle1" fontWeight={600} color="secondary">
                          RCL-{claim.id.toString().padStart(5, "0")}
                        </Typography>
                        <Chip
                          label={statusConfig.label}
                          color={statusConfig.color}
                          icon={statusConfig.icon || undefined}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      {/* Tipo de reclamo */}
                      <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                        {claim.tipo || "Sin tipo"}
                      </Typography>

                      <Divider sx={{ my: 1 }} />

                      {/* Info adicional */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {claim.created_at ? format(new Date(claim.created_at), "dd/MM/yyyy") : "-"}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                            {dcName}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Tracking/Factura */}
                      {claim.reference_number && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          {claimType === "LOCAL" ? "TRK" : "Factura"}: {claim.reference_number}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              );
            })
          )}
        </Stack>

        {/* Paginación */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}
              page={paginationModel.page + 1}
              onChange={(_, page) => setPaginationModel({ ...paginationModel, page: page - 1 })}
              color="primary"
              size="medium"
            />
          </Box>
        )}
      </Box>
    );
  }

  // Vista desktop con DataGrid
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
      onRowDoubleClick={(params) => handleNavigate(params.id as number)}
    />
  );
};

export default ClaimsDataGrid;