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
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';
import { useGetTokensQuery } from '../services/tokenApi';
import {
  TokenStatus,
  TokenType,
  TokenStatusLabels,
  TokenTypeLabels,
  TokenFilterParams,
} from '../interfaces/token';
import { TokenFilters } from '../components/TokenFilters';
import ChipFilterCategory from '../../ui/components/ChipFilter';
import { useAppSelector } from '../../../store';

// Status colors and icons
const statusConfig: Record<TokenStatus, { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; icon: React.ReactElement }> = {
  [TokenStatus.DRAFT]: { color: 'default', icon: <EditIcon fontSize="small" /> },
  [TokenStatus.PENDING_L1]: { color: 'warning', icon: <PendingIcon fontSize="small" /> },
  [TokenStatus.PENDING_L2]: { color: 'warning', icon: <PendingIcon fontSize="small" /> },
  [TokenStatus.PENDING_L3]: { color: 'warning', icon: <PendingIcon fontSize="small" /> },
  [TokenStatus.APPROVED]: { color: 'success', icon: <ApprovedIcon fontSize="small" /> },
  [TokenStatus.USED]: { color: 'info', icon: <UsedIcon fontSize="small" /> },
  [TokenStatus.EXPIRED]: { color: 'default', icon: <ExpiredIcon fontSize="small" /> },
  [TokenStatus.CANCELLED]: { color: 'default', icon: <RejectedIcon fontSize="small" /> },
  [TokenStatus.REJECTED]: { color: 'error', icon: <RejectedIcon fontSize="small" /> },
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

  const { data, isLoading, isFetching } = useGetTokensQuery(filters);

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
                    color={statusConfig[params.row.status as TokenStatus]?.color}
                    sx={{ fontSize: '0.65rem', height: 20 }}
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
          minWidth: 180,
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
      width: isMobile ? 100 : 140,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          icon={statusConfig[params.value as TokenStatus]?.icon}
          label={isMobile ? '' : TokenStatusLabels[params.value as TokenStatus]}
          size="small"
          color={statusConfig[params.value as TokenStatus]?.color}
          sx={{
            fontSize: '0.75rem',
            '& .MuiChip-icon': { marginLeft: isMobile ? '8px' : undefined }
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
          field: 'approval_progress',
          headerName: 'Aprobación',
          width: 120,
          align: 'center',
          headerAlign: 'center',
          renderCell: (params: GridRenderCellParams) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 50,
                  height: 6,
                  bgcolor: 'grey.200',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${params.value}%`,
                    height: '100%',
                    bgcolor: params.value === 100 ? 'success.main' : 'warning.main',
                    borderRadius: 3,
                  }}
                />
              </Box>
              <Typography variant="caption" fontWeight={600}>
                {params.value}%
              </Typography>
            </Box>
          ),
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

          {/* Actions */}
          <Grid item xs={12} display="flex" justifyContent="flex-end" gap={1}>
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
                    label: TokenStatusLabels[filters.status as TokenStatus],
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

          {/* Stats Footer */}
          {data && data.count > 0 && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Chip
                  label={`Total: ${data.count} tokens`}
                  color="primary"
                  variant="outlined"
                  size={isMobile ? 'small' : 'medium'}
                />
              </Box>
            </Grid>
          )}
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
    </>
  );
};
