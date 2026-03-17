/**
 * Página de listado de tokens - Estilo mejorado
 * Sigue el patrón de PersonnelListPage
 */
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  FilterListTwoTone as FilterIcon,
  MoreVert as MoreVertIcon,
  QrCode2 as QrCodeIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Schedule as PendingIcon,
  AccessTime as ExpiredIcon,
  Done as UsedIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  AssignmentTurnedIn as ValidateIcon,
  Assignment as TotalIcon,
  HourglassEmpty as HourglassIcon,
  Block as CancelledIcon,
  FileDownload as ExportIcon,
  GridOn as GridOnIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';
import { useGetTokensQuery } from '../services/tokenApi';
import {
  TokenStatus,
  TokenType,
  TokenStatusLabels,
  TokenTypeLabels,
  TokenFilterParams,
  ConsolidatedTokenStatusLabels,
  ConsolidatedTokenStatus,
} from '../interfaces/token';
import { TokenFilters } from '../components/TokenFilters';
import ChipFilterCategory from '../../ui/components/ChipFilter';
import { useAppSelector } from '../../../store';

// Status colors and icons - alineados con las stat cards superiores
const statusConfig: Record<TokenStatus, { icon: React.ReactElement; bg: string; textColor: string }> = {
  [TokenStatus.DRAFT]: { icon: <EditIcon fontSize="small" />, bg: '#e0e0e0', textColor: '#424242' },
  [TokenStatus.PENDING_L1]: { icon: <PendingIcon fontSize="small" />, bg: '#FFF9C4', textColor: '#F9A825' },
  [TokenStatus.PENDING_L2]: { icon: <PendingIcon fontSize="small" />, bg: '#FFF9C4', textColor: '#F9A825' },
  [TokenStatus.PENDING_L3]: { icon: <PendingIcon fontSize="small" />, bg: '#FFF9C4', textColor: '#F9A825' },
  [TokenStatus.APPROVED]: { icon: <ApprovedIcon fontSize="small" />, bg: '#E8F5E9', textColor: '#2E7D32' },
  [TokenStatus.USED]: { icon: <UsedIcon fontSize="small" />, bg: '#E3F2FD', textColor: '#1565C0' },
  [TokenStatus.EXPIRED]: { icon: <ExpiredIcon fontSize="small" />, bg: '#e0e0e0', textColor: '#424242' },
  [TokenStatus.CANCELLED]: { icon: <RejectedIcon fontSize="small" />, bg: '#FFEBEE', textColor: '#C62828' },
  [TokenStatus.REJECTED]: { icon: <RejectedIcon fontSize="small" />, bg: '#FFEBEE', textColor: '#C62828' },
};

// Token type icons/colors
const typeColors: Record<TokenType, string> = {
  [TokenType.PERMIT_HOUR]: '#2196F3',
  [TokenType.PERMIT_DAY]: '#3F51B5',
  [TokenType.EXIT_PASS]: '#FF9800',
  [TokenType.SUBSTITUTION]: '#9C27B0',
  [TokenType.RATE_CHANGE]: '#4CAF50',
  [TokenType.OVERTIME]: '#F44336',
  [TokenType.SHIFT_CHANGE]: '#00BCD4',
  [TokenType.UNIFORM_DELIVERY]: '#795548',
};

// Etiquetas cortas para la columna Estado
const getShortStatusLabel = (status: TokenStatus): string => {
  switch (status) {
    case TokenStatus.PENDING_L1:
    case TokenStatus.PENDING_L2:
    case TokenStatus.PENDING_L3:
      return 'Pendiente';
    case TokenStatus.APPROVED:
      return 'Abierto';
    case TokenStatus.USED:
      return 'Finalizado';
    case TokenStatus.EXPIRED:
      return 'Vencido';
    case TokenStatus.CANCELLED:
    case TokenStatus.REJECTED:
      return 'Cerrado';
    case TokenStatus.DRAFT:
      return 'Borrador';
    default:
      return '';
  }
};

// Observaciones por estado - indica quién debe aprobar
const getObservacion = (status: TokenStatus): string => {
  switch (status) {
    case TokenStatus.DRAFT:
      return 'En borrador';
    case TokenStatus.PENDING_L1:
      return 'Pendiente de Supervisor';
    case TokenStatus.PENDING_L2:
      return 'Pendiente de Jefe de Área';
    case TokenStatus.PENDING_L3:
      return 'Pendiente de Gerente';
    case TokenStatus.APPROVED:
      return 'Abierto';
    case TokenStatus.USED:
      return 'Finalizado';
    case TokenStatus.EXPIRED:
      return 'Vencido';
    case TokenStatus.CANCELLED:
    case TokenStatus.REJECTED:
      return 'Cerrado';
    default:
      return '';
  }
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card elevation={3} sx={{ height: '100%', transition: 'all 0.3s ease-in-out', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgba(0,0,0,0.15)' } }}>
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color, fontSize: { xs: '1.5rem', sm: '2.125rem' }, mt: 0.5 }}>
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: color, opacity: 0.9, width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

export const TokenListPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isFullHD = useMediaQuery(theme.breakpoints.up('xl'));

  const { disctributionCenters } = useAppSelector(state => state.maintenance);

  const [openFilter, setOpenFilter] = useState(false);
  const [filters, setFilters] = useState<TokenFilterParams>({
    limit: 25,
    offset: 0,
    ordering: '-created_at',
  });

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  // Export states
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const authToken = useAppSelector(state => state.auth.token);

  const { data, isLoading, isFetching } = useGetTokensQuery(filters);

  // Estadísticas calculadas desde los resultados
  const stats = useMemo(() => {
    if (!data?.results) return { total: 0, pending: 0, approved: 0, cancelled: 0 };
    return {
      total: data.count,
      pending: data.results.filter((t: any) =>
        [TokenStatus.PENDING_L1, TokenStatus.PENDING_L2, TokenStatus.PENDING_L3].includes(t.status)
      ).length,
      approved: data.results.filter((t: any) => t.status === TokenStatus.APPROVED).length,
      cancelled: data.results.filter((t: any) =>
        [TokenStatus.CANCELLED, TokenStatus.REJECTED].includes(t.status)
      ).length,
    };
  }, [data]);

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    setFilters({
      ...filters,
      limit: model.pageSize,
      offset: model.page * model.pageSize,
    });
  };

  const handleFilterChange = (newFilters: TokenFilterParams) => {
    setFilters({
      ...newFilters,
      limit: paginationModel.pageSize,
      offset: 0,
      ordering: '-created_at',
    });
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLElement>, row: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
    setSelectedRow(null);
  }, []);

  const handleViewDetails = () => {
    if (selectedRow) {
      navigate(`/tokens/detail/${selectedRow.id}`);
    }
    handleCloseMenu();
  };

  const handleCopyCode = () => {
    if (selectedRow) {
      navigator.clipboard.writeText(selectedRow.display_number);
    }
    handleCloseMenu();
  };

  const clearFilter = (filterKey: string) => {
    const newFilters = { ...filters };
    switch (filterKey) {
      case 'search':
        delete newFilters.search;
        break;
      case 'status':
        delete newFilters.status;
        break;
      case 'token_type':
        delete newFilters.token_type;
        break;
      case 'distributor_center':
        delete newFilters.distributor_center;
        break;
    }
    setFilters(newFilters);
  };

  // Export handlers
  const buildExportParams = () => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', Array.isArray(filters.status) ? filters.status.join(',') : filters.status as string);
    if (filters.token_type) params.set('token_type', Array.isArray(filters.token_type) ? filters.token_type.join(',') : filters.token_type as string);
    if (filters.distributor_center) params.set('distributor_center', String(filters.distributor_center));
    if (filters.ordering) params.set('ordering', filters.ordering);
    return params.toString();
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    setExportMenuAnchor(null);
    try {
      const queryStr = buildExportParams();
      const url = `${import.meta.env.VITE_JS_APP_API_URL}/api/tokens/export_excel/?${queryStr}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error('Error al exportar');
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `tokens-${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Error exporting Excel:', err);
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    setExportMenuAnchor(null);
    try {
      const queryStr = buildExportParams();
      const url = `${import.meta.env.VITE_JS_APP_API_URL}/api/tokens/export_pdf/?${queryStr}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error('Error al exportar');
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `tokens-${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Error exporting PDF:', err);
    } finally {
      setExportingPdf(false);
    }
  };

  // Obtener la etiqueta del filtro de estado (consolidado o individual)
  const getStatusFilterLabel = (status: string): string => {
    if (status in ConsolidatedTokenStatusLabels) {
      return ConsolidatedTokenStatusLabels[status as ConsolidatedTokenStatus];
    }
    return TokenStatusLabels[status as TokenStatus] || status;
  };

  const columns: GridColDef[] = useMemo(() => {
    const baseColumns: GridColDef[] = [];

    if (isMobile) {
      // Mobile: Combined column
      baseColumns.push({
        field: 'token_info',
        headerName: 'Token',
        flex: 1,
        minWidth: 220,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => {
          const typeColor = typeColors[params.row.token_type as TokenType] || '#666';
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: typeColor,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                <QrCodeIcon />
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {params.row.display_number}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {params.row.personnel_name}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={TokenStatusLabels[params.row.status as TokenStatus]}
                    size="small"
                    sx={{
                      fontSize: '0.65rem',
                      height: 20,
                      bgcolor: statusConfig[params.row.status as TokenStatus]?.bg,
                      color: statusConfig[params.row.status as TokenStatus]?.textColor,
                      '& .MuiChip-icon': { color: statusConfig[params.row.status as TokenStatus]?.textColor },
                    }}
                  />
                </Box>
              </Box>
            </Box>
          );
        },
      });
    } else {
      // Desktop: Separate columns
      baseColumns.push(
        {
          field: 'token_type',
          headerName: '',
          width: 60,
          sortable: false,
          align: 'center',
          headerAlign: 'center',
          renderCell: (params: GridRenderCellParams) => {
            const typeColor = typeColors[params.value as TokenType] || '#666';
            return (
              <Tooltip title={TokenTypeLabels[params.value as TokenType]}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: typeColor,
                    fontSize: '0.75rem',
                  }}
                >
                  <QrCodeIcon fontSize="small" />
                </Avatar>
              </Tooltip>
            );
          },
        },
        {
          field: 'display_number',
          headerName: 'Número',
          width: 150,
          renderCell: (params: GridRenderCellParams) => (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {params.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {TokenTypeLabels[params.row.token_type as TokenType]}
              </Typography>
            </Box>
          ),
        },
        {
          field: 'personnel_name',
          headerName: 'Beneficiario',
          flex: 1,
          minWidth: 140,
          renderCell: (params: GridRenderCellParams) => (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {params.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {params.row.personnel_code}
              </Typography>
            </Box>
          ),
        }
      );
    }

    // Status column
    baseColumns.push({
      field: 'status',
      headerName: 'Estado',
      width: isMobile ? 100 : 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          icon={statusConfig[params.value as TokenStatus]?.icon}
          label={isMobile ? '' : getShortStatusLabel(params.value as TokenStatus)}
          size="small"
          sx={{
            fontSize: '0.75rem',
            bgcolor: statusConfig[params.value as TokenStatus]?.bg,
            color: statusConfig[params.value as TokenStatus]?.textColor,
            '& .MuiChip-icon': {
              color: statusConfig[params.value as TokenStatus]?.textColor,
              marginLeft: isMobile ? '8px' : undefined,
            },
          }}
        />
      ),
    });

    if (!isMobile && !isTablet) {
      baseColumns.push(
        {
          field: 'distributor_center_name',
          headerName: 'Centro',
          width: 150,
        },
        {
          field: 'valid_from',
          headerName: 'Válido Desde',
          width: 150,
          renderCell: (params: GridRenderCellParams) => (
            <Typography variant="body2">
              {new Date(params.value).toLocaleString('es-HN', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </Typography>
          ),
        },
        {
          field: 'observaciones',
          headerName: 'Observaciones',
          width: 200,
          sortable: false,
          renderCell: (params: GridRenderCellParams) => {
            const status = params.row.status as TokenStatus;
            const obs = getObservacion(status);
            const config = statusConfig[status];
            return (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: config?.textColor || 'text.secondary',
                  fontSize: '0.8rem',
                }}
              >
                {obs}
              </Typography>
            );
          },
        }
      );
    }

    // Actions column
    baseColumns.push({
      field: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          onClick={(e) => handleOpenMenu(e, params.row)}
          sx={{
            '&:hover': {
              bgcolor: 'rgba(25, 118, 210, 0.1)',
            },
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    });

    return baseColumns;
  }, [isMobile, isTablet, handleOpenMenu]);

  return (
    <>
      <TokenFilters
        open={openFilter}
        handleClose={() => setOpenFilter(false)}
        handleFilter={handleFilterChange}
        filters={filters}
        distributorCenters={disctributionCenters}
      />

      <Container maxWidth={isFullHD ? 'xl' : 'lg'} sx={{ marginTop: 2 }}>
        <Grid container spacing={2}>
          {/* Header */}
          <Grid item xs={12}>
            <Typography
              variant={isMobile ? 'h6' : 'h4'}
              component="h1"
              fontWeight={400}
              sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}
            >
              Gestión de Tokens
            </Typography>
            <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
          </Grid>

          <Grid item xs={12} sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" component="h2" fontWeight={400}>
              Administre los tokens de permisos, pases de salida, horas extra y más.
            </Typography>
          </Grid>

          {/* Stat Cards */}
          <Grid item xs={6} sm={6} md={3}>
            <StatCard title="Total" value={stats.total} icon={<TotalIcon />} color={theme.palette.primary.main} />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard title="Pendientes" value={stats.pending} icon={<HourglassIcon />} color="#F9A825" />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard title="Abiertos" value={stats.approved} icon={<ApprovedIcon />} color="#4caf50" />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard title="Cerrados" value={stats.cancelled} icon={<CancelledIcon />} color="#f44336" />
          </Grid>

          {/* Actions */}
          <Grid item xs={12} display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="outlined"
              endIcon={exportingExcel || exportingPdf ? <CircularProgress size={16} /> : <ExportIcon />}
              onClick={(e) => setExportMenuAnchor(e.currentTarget)}
              disabled={exportingExcel || exportingPdf}
              size={isMobile ? 'small' : 'medium'}
            >
              {isMobile ? 'Exportar' : 'Exportar'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              endIcon={<FilterIcon />}
              onClick={() => setOpenFilter(true)}
              size={isMobile ? 'small' : 'medium'}
            >
              Filtrar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/tokens/create')}
              size={isMobile ? 'small' : 'medium'}
            >
              {isMobile ? 'Nuevo' : 'Nuevo Token'}
            </Button>
          </Grid>

          {/* Active Filters */}
          <Grid item xs={12}>
            <Grid container spacing={1}>
              {filters.search && (
                <ChipFilterCategory
                  label="Buscar: "
                  items={[{
                    label: filters.search,
                    id: 'search',
                    deleteAction: () => clearFilter('search'),
                  }]}
                />
              )}
              {filters.status && (
                <ChipFilterCategory
                  label="Estado: "
                  items={[{
                    label: getStatusFilterLabel(filters.status as string),
                    id: 'status',
                    deleteAction: () => clearFilter('status'),
                  }]}
                />
              )}
              {filters.token_type && (
                <ChipFilterCategory
                  label="Tipo: "
                  items={[{
                    label: TokenTypeLabels[filters.token_type as TokenType],
                    id: 'token_type',
                    deleteAction: () => clearFilter('token_type'),
                  }]}
                />
              )}
              {filters.distributor_center && (
                <ChipFilterCategory
                  label="Centro: "
                  items={[{
                    label: disctributionCenters.find(dc => dc.id === filters.distributor_center)?.name || '',
                    id: 'distributor_center',
                    deleteAction: () => clearFilter('distributor_center'),
                  }]}
                />
              )}
            </Grid>
          </Grid>

          {/* DataGrid */}
          <Grid item xs={12}>
            <Card variant="outlined">
              {data?.count === 0 && !isLoading && (
                <Alert severity="info" sx={{ m: 2 }}>
                  No se encontraron tokens con los filtros aplicados.
                </Alert>
              )}

              <DataGrid
                rows={data?.results || []}
                columns={columns}
                rowCount={data?.count || 0}
                loading={isLoading || isFetching}
                paginationModel={paginationModel}
                onPaginationModelChange={handlePaginationChange}
                onRowDoubleClick={(params) => navigate(`/tokens/detail/${params.row.id}`)}
                paginationMode="server"
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
                autoHeight
                rowHeight={isMobile ? 80 : 60}
                sx={{
                  border: 0,
                  '& .MuiDataGrid-cell': {
                    fontSize: isMobile ? '0.8125rem' : '0.875rem',
                    py: isMobile ? 1.5 : 1,
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    fontSize: isMobile ? '0.8125rem' : '0.875rem',
                    fontWeight: 600,
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: `1px solid ${theme.palette.divider}`,
                  },
                }}
                slots={{
                  noRowsOverlay: () => (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: 1 }}>
                      <QrCodeIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                      <Typography variant="body2" color="text.secondary">
                        No hay tokens registrados
                      </Typography>
                    </Box>
                  ),
                  loadingOverlay: () => (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ),
                }}
              />
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 200,
            borderRadius: 2,
            mt: 1,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              borderRadius: 1,
              mx: 1,
              my: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
              },
            },
          },
        }}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <ViewIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Ver Detalle</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleCopyCode}>
          <ListItemIcon>
            <CopyIcon fontSize="small" color="secondary" />
          </ListItemIcon>
          <ListItemText>Copiar Código</ListItemText>
        </MenuItem>

        {selectedRow && selectedRow.status === TokenStatus.APPROVED && (
          <MenuItem onClick={() => {
            navigate(`/tokens/validate?code=${selectedRow.display_number}`);
            handleCloseMenu();
          }}>
            <ListItemIcon>
              <ValidateIcon fontSize="small" sx={{ color: 'success.main' }} />
            </ListItemIcon>
            <ListItemText>Validar Token</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 180, borderRadius: 2, mt: 1 },
        }}
      >
        <MenuItem onClick={handleExportExcel} disabled={exportingExcel}>
          <ListItemIcon>
            {exportingExcel ? <CircularProgress size={18} /> : <GridOnIcon fontSize="small" color="success" />}
          </ListItemIcon>
          <ListItemText>Excel</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportPdf} disabled={exportingPdf}>
          <ListItemIcon>
            {exportingPdf ? <CircularProgress size={18} /> : <PictureAsPdfIcon fontSize="small" color="error" />}
          </ListItemIcon>
          <ListItemText>PDF</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
