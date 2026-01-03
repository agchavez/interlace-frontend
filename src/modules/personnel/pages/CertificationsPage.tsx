import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Container,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridPaginationModel } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import FilterListTwoToneIcon from '@mui/icons-material/FilterListTwoTone';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';
import { useGetCertificationsQuery, useGetAreasQuery } from '../services/personnelApi';
import type { CertificationFilterParams } from '../../../interfaces/personnel';
import { CertificationFilters } from '../components/CertificationFilters';
import ChipFilterCategory from '../../ui/components/ChipFilter';
import { format } from 'date-fns';
import { useAppSelector } from '../../../store';

export const CertificationsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isFullHD = useMediaQuery(theme.breakpoints.up('xl'));

  const [openFilter, setOpenFilter] = useState(false);
  const [filters, setFilters] = useState<CertificationFilterParams>({
    limit: 25,
    offset: 0,
  });

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  const { data, isLoading, isFetching } = useGetCertificationsQuery(filters);
  const { data: areasData } = useGetAreasQuery();
  const { distributionCenters: disctributionCenters } = useAppSelector(state => state.user);

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    setFilters({
      ...filters,
      limit: model.pageSize,
      offset: model.page * model.pageSize,
    });
  };

  const handleFilterChange = (newFilters: CertificationFilterParams) => {
    setFilters({
      ...newFilters,
      limit: paginationModel.pageSize,
      offset: 0,
    });
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (!data?.results) return { total: 0, active: 0, expiringSoon: 0, expired: 0 };

    const total = data.count;
    const active = data.results.filter((c: any) => c.is_valid && !c.is_expired && !c.is_expiring_soon).length;
    const expiringSoon = data.results.filter((c: any) => c.is_valid && c.is_expiring_soon).length;
    const expired = data.results.filter((c: any) => !c.is_valid || c.is_expired).length;

    return { total, active, expiringSoon, expired };
  }, [data]);

  const getStatusChip = (statusDisplay: string, isValid: boolean, isExpired: boolean, isExpiringSoon: boolean) => {
    if (!isValid) {
      return <Chip label={statusDisplay || "Inválida"} color="error" size="small" icon={<ErrorIcon />} />;
    }
    if (isExpired) {
      return <Chip label="Vencida" color="error" size="small" icon={<ErrorIcon />} />;
    }
    if (isExpiringSoon) {
      return <Chip label="Por Vencer" color="warning" size="small" icon={<WarningIcon />} />;
    }
    return <Chip label="Vigente" color="success" size="small" icon={<CheckCircleIcon />} />;
  };

  const columns: GridColDef[] = useMemo(() => {
    const baseColumns: GridColDef[] = [
      {
        field: 'personnel_code',
        headerName: 'Código',
        width: isMobile ? 100 : 120,
        renderCell: (params: GridRenderCellParams) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'personnel_name',
        headerName: 'Empleado',
        flex: 1,
        minWidth: isMobile ? 150 : 200,
      },
    ];

    if (!isMobile) {
      baseColumns.push(
        {
          field: 'certification_type_name',
          headerName: 'Certificación',
          flex: 1,
          minWidth: 180,
        },
        {
          field: 'issuing_authority',
          headerName: 'Organización',
          width: 150,
        }
      );
    }

    if (!isMobile && !isTablet) {
      baseColumns.push(
        {
          field: 'issue_date',
          headerName: 'Emisión',
          width: 120,
          renderCell: (params: GridRenderCellParams) => (
            <Typography variant="body2">
              {new Date(params.value).toLocaleDateString()}
            </Typography>
          ),
        },
        {
          field: 'expiration_date',
          headerName: 'Vencimiento',
          width: 120,
          renderCell: (params: GridRenderCellParams) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarTodayIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {params.value ? new Date(params.value).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
          ),
        }
      );
    }

    baseColumns.push(
      {
        field: 'status_display',
        headerName: 'Estado',
        width: isMobile ? 100 : 140,
        renderCell: (params: GridRenderCellParams) =>
          getStatusChip(
            params.row.status_display,
            params.row.is_valid,
            params.row.is_expired,
            params.row.is_expiring_soon
          ),
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: isMobile ? 80 : 120,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Ver detalle">
              <IconButton size="small" color="primary">
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {!isMobile && params.row.document_url && (
              <Tooltip title="Ver documento">
                <IconButton size="small" color="secondary" onClick={() => window.open(params.row.document_url, '_blank')}>
                  <DescriptionIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      }
    );

    return baseColumns;
  }, [isMobile, isTablet]);

  const clearFilter = (filterKey: keyof CertificationFilterParams) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    setFilters(newFilters);
  };

  const hierarchyLevelLabels: Record<string, string> = {
    'OPERATIVE': 'Operativo',
    'SUPERVISOR': 'Supervisor',
    'AREA_MANAGER': 'Jefe de Área',
    'CD_MANAGER': 'Gerente de Centro',
  };

  const positionTypeLabels: Record<string, string> = {
    'OPERATIONAL': 'Operacional',
    'ADMINISTRATIVE': 'Administrativo',
    'MANAGEMENT': 'Gerencial',
    'SECURITY': 'Seguridad',
    'DRIVER': 'Conductor',
  };

  return (
    <>
      <CertificationFilters
        open={openFilter}
        handleClose={() => setOpenFilter(false)}
        handleFilter={handleFilterChange}
        filters={filters}
        areas={areasData}
        distributorCenters={disctributionCenters}
      />

      <Container maxWidth={isFullHD ? 'xl' : 'lg'} sx={{ marginTop: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" component="h1" fontWeight={400}>
              Gestión de Certificaciones
            </Typography>
            <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" component="h2" fontWeight={400}>
              Seguimiento y control de certificaciones del personal. A continuación se muestra el listado completo.
            </Typography>
          </Grid>

          <Grid item xs={12} display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="outlined"
              color="secondary"
              endIcon={<FilterListTwoToneIcon />}
              onClick={() => setOpenFilter(true)}
              size={isMobile ? 'small' : 'medium'}
            >
              Filtrar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size={isMobile ? 'small' : 'medium'}
              onClick={() => navigate('/personnel/certifications/create')}
            >
              {isMobile ? 'Nueva' : 'Nueva Certificación'}
            </Button>
          </Grid>

          {/* Alertas */}
          {stats.expiringSoon > 0 && (
            <Grid item xs={12}>
              <Alert severity="warning" icon={<WarningIcon />}>
                <strong>{stats.expiringSoon}</strong> certificación(es) vencen próximamente. Revisar y renovar.
              </Alert>
            </Grid>
          )}

          {stats.expired > 0 && (
            <Grid item xs={12}>
              <Alert severity="error" icon={<ErrorIcon />}>
                <strong>{stats.expired}</strong> certificación(es) vencidas o revocadas. Acción requerida.
              </Alert>
            </Grid>
          )}

          {/* Stats Cards */}
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              title="Total"
              value={stats.total}
              icon={<AssignmentIcon />}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              title="Vigentes"
              value={stats.active}
              icon={<CheckCircleIcon />}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              title="Por Vencer"
              value={stats.expiringSoon}
              icon={<WarningIcon />}
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              title="Vencidas"
              value={stats.expired}
              icon={<ErrorIcon />}
              color="#f44336"
            />
          </Grid>

          {/* Filtros activos */}
          <Grid item xs={12}>
            <Grid container spacing={1}>
              {filters.search && (
                <ChipFilterCategory
                  label="Buscar: "
                  items={[
                    {
                      label: filters.search,
                      id: "search",
                      deleteAction: () => clearFilter('search'),
                    },
                  ]}
                />
              )}
              {filters.area && areasData && (
                <ChipFilterCategory
                  label="Área: "
                  items={[
                    {
                      label: areasData.find(a => a.id === filters.area)?.name || '',
                      id: "area",
                      deleteAction: () => clearFilter('area'),
                    },
                  ]}
                />
              )}
              {filters.distributor_center && (
                <ChipFilterCategory
                  label="Centro: "
                  items={[
                    {
                      label: disctributionCenters.find(dc => dc.id === filters.distributor_center)?.name || '',
                      id: "distributor_center",
                      deleteAction: () => clearFilter('distributor_center'),
                    },
                  ]}
                />
              )}
              {filters.hierarchy_level && (
                <ChipFilterCategory
                  label="Nivel: "
                  items={[
                    {
                      label: hierarchyLevelLabels[filters.hierarchy_level] || filters.hierarchy_level,
                      id: "hierarchy_level",
                      deleteAction: () => clearFilter('hierarchy_level'),
                    },
                  ]}
                />
              )}
              {filters.position_type && (
                <ChipFilterCategory
                  label="Posición: "
                  items={[
                    {
                      label: positionTypeLabels[filters.position_type] || filters.position_type,
                      id: "position_type",
                      deleteAction: () => clearFilter('position_type'),
                    },
                  ]}
                />
              )}
              {filters.status && (
                <ChipFilterCategory
                  label="Estado: "
                  items={[
                    {
                      label: filters.status === 'ACTIVE' ? 'Vigente' : filters.status === 'EXPIRING_SOON' ? 'Por Vencer' : filters.status === 'EXPIRED' ? 'Vencida' : 'Revocada',
                      id: "status",
                      deleteAction: () => clearFilter('status'),
                    },
                  ]}
                />
              )}
            </Grid>
          </Grid>

          {/* DataGrid */}
          <Grid item xs={12}>
            <Card elevation={2}>
              <DataGrid
                rows={data?.results || []}
                columns={columns}
                loading={isLoading || isFetching}
                paginationModel={paginationModel}
                onPaginationModelChange={handlePaginationChange}
                pageSizeOptions={[10, 25, 50, 100]}
                rowCount={data?.count || 0}
                paginationMode="server"
                disableRowSelectionOnClick
                autoHeight
                sx={{
                  border: 0,
                  '& .MuiDataGrid-cell': {
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    fontWeight: 600,
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: `1px solid ${theme.palette.divider}`,
                  },
                }}
                slots={{
                  noRowsOverlay: () => (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body2" color="text.secondary">
                        No se encontraron certificaciones
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
    </>
  );
};

// ============================================
// Helper Components
// ============================================

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <Card
      elevation={3}
      sx={{
        height: '100%',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          elevation: 8,
          boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
        },
      }}
    >
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
};
