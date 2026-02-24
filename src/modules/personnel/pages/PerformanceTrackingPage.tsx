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
  LinearProgress,
  Rating,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridPaginationModel } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import FilterListTwoToneIcon from '@mui/icons-material/FilterListTwoTone';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useNavigate } from 'react-router-dom';
import { useGetEvaluationsQuery, useGetAreasQuery, useGetEvaluationStatisticsQuery } from '../services/personnelApi';
import type { PerformanceFilterParams, PerformanceMetricList } from '../../../interfaces/personnel';
import { PerformanceFilters } from '../components/PerformanceFilters';
import ChipFilterCategory from '../../ui/components/ChipFilter';
import { useAppSelector } from '../../../store';

export const PerformanceTrackingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isFullHD = useMediaQuery(theme.breakpoints.up('xl'));

  const [openFilter, setOpenFilter] = useState(false);
  const [filters, setFilters] = useState<PerformanceFilterParams>({
    limit: 25,
    offset: 0,
  });

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  const { data, isLoading, isFetching } = useGetEvaluationsQuery(filters);
  const { data: statsData } = useGetEvaluationStatisticsQuery(filters);
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

  const handleFilterChange = (newFilters: PerformanceFilterParams) => {
    setFilters({
      ...newFilters,
      limit: paginationModel.pageSize,
      offset: 0,
    });
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    // Usar datos del endpoint de estadísticas si están disponibles
    if (statsData) {
      return {
        total: statsData.total_evaluations || 0,
        avgScore: statsData.overall_average?.toFixed(2) || '0.0',
        excellent: statsData.excellent_count || 0,
        needsImprovement: statsData.needs_improvement_count || 0,
      };
    }

    // Fallback: calcular localmente desde los resultados
    if (!data?.results) return { total: 0, avgScore: '0.0', excellent: 0, needsImprovement: 0 };

    const total = data.count;
    const avgScore = data.results.reduce((sum: number, p: PerformanceMetricList) => sum + p.overall_score, 0) / (data.results.length || 1);
    const excellent = data.results.filter((p: PerformanceMetricList) => p.overall_score >= 4.5).length;
    const needsImprovement = data.results.filter((p: PerformanceMetricList) => p.overall_score < 3.5).length;

    return {
      total,
      avgScore: avgScore.toFixed(2),
      excellent,
      needsImprovement,
    };
  }, [data, statsData]);

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return '#4caf50';
    if (score >= 3.5) return '#ff9800';
    return '#f44336';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'Excelente';
    if (score >= 3.5) return 'Bueno';
    return 'Necesita Mejora';
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
      baseColumns.push({
        field: 'position',
        headerName: 'Posición',
        flex: 1,
        minWidth: 150,
      });
    }

    if (!isMobile && !isTablet) {
      baseColumns.push({
        field: 'evaluation_date',
        headerName: 'Fecha Evaluación',
        width: 140,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {new Date(params.value).toLocaleDateString()}
            </Typography>
          </Box>
        ),
      });
    }

    baseColumns.push(
      {
        field: 'overall_score',
        headerName: 'Puntuación',
        width: isMobile ? 120 : 160,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating value={params.value} precision={0.1} size="small" readOnly />
            <Typography variant="body2" sx={{ fontWeight: 700, color: getScoreColor(params.value) }}>
              {params.value.toFixed(1)}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'status',
        headerName: 'Estado',
        width: isMobile ? 100 : 140,
        renderCell: (params: GridRenderCellParams) => {
          const score = params.row.overall_score;
          const color = score >= 4.5 ? 'success' : score >= 3.5 ? 'warning' : 'error';
          return <Chip label={getScoreLabel(score)} color={color} size="small" />;
        },
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: isMobile ? 80 : 120,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: () => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Ver detalle">
              <IconButton size="small" color="primary">
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      }
    );

    return baseColumns;
  }, [isMobile, isTablet]);

  const clearFilter = (filterKey: keyof PerformanceFilterParams) => {
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
      <PerformanceFilters
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
            <Typography variant="h4" component="h1" fontWeight={400}>
              Seguimiento de Desempeño
            </Typography>
            <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" component="h2" fontWeight={400}>
              Evaluaciones y métricas de rendimiento del personal. Monitoreo continuo del desempeño organizacional.
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
              onClick={() => navigate('/personnel/performance/create')}
            >
              {isMobile ? 'Nueva' : 'Nueva Evaluación'}
            </Button>
          </Grid>

          {/* Alertas */}
          {stats.needsImprovement > 0 && (
            <Grid item xs={12}>
              <Alert severity="warning">
                <strong>{stats.needsImprovement}</strong> empleado(s) necesitan planes de mejora.
              </Alert>
            </Grid>
          )}

          {/* Stats Cards */}
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              title="Total Evaluaciones"
              value={stats.total}
              icon={<AssessmentIcon />}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              title="Promedio General"
              value={stats.avgScore}
              icon={<StarIcon />}
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              title="Desempeño Excelente"
              value={stats.excellent}
              icon={<EmojiEventsIcon />}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              title="Necesitan Mejora"
              value={stats.needsImprovement}
              icon={<TrendingUpIcon />}
              color="#f44336"
            />
          </Grid>

          {/* Métricas de Desempeño por Categoría */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Promedio por Métrica
                </Typography>
                {statsData?.metric_averages && statsData.metric_averages.length > 0 ? (
                  statsData.metric_averages.slice(0, 5).map((metric, index: number) => {
                    const colors = ['#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#f44336'];
                    return (
                      <PerformanceMetric
                        key={metric.metric_name}
                        label={metric.metric_name}
                        value={metric.average_value || 0}
                        color={colors[index % colors.length]}
                      />
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay datos de métricas disponibles
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Mejores Evaluados
                </Typography>
                {data?.results
                  .slice()
                  .sort((a: PerformanceMetricList, b: PerformanceMetricList) => b.overall_score - a.overall_score)
                  .slice(0, 3)
                  .map((perf: PerformanceMetricList, index: number) => (
                    <Box
                      key={perf.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        py: 2,
                        borderBottom: index < 2 ? '1px solid' : 'none',
                        borderColor: 'divider',
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor:
                            index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32',
                          color: 'white',
                          fontWeight: 700,
                        }}
                      >
                        {index + 1}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {perf.personnel_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {perf.position || 'Sin posición'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StarIcon sx={{ color: '#ffd700', fontSize: 20 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {perf.overall_score.toFixed(1)}
                        </Typography>
                      </Box>
                    </Box>
                  )) || <Typography variant="body2" color="text.secondary">Sin datos</Typography>}
              </CardContent>
            </Card>
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
              {(filters.min_score !== undefined || filters.max_score !== undefined) && (
                <ChipFilterCategory
                  label="Puntuación: "
                  items={[
                    {
                      label: `${filters.min_score || 0} - ${filters.max_score || 5}`,
                      id: "score",
                      deleteAction: () => {
                        clearFilter('min_score');
                        clearFilter('max_score');
                      },
                    },
                  ]}
                />
              )}
            </Grid>
          </Grid>

          {/* DataGrid */}
          <Grid item xs={12}>
            <Card variant="outlined">
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
                        No se encontraron evaluaciones
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
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
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

interface PerformanceMetricProps {
  label: string;
  value: number;
  color: string;
}

const PerformanceMetric: React.FC<PerformanceMetricProps> = ({ label, value, color }) => {
  const percentage = (value / 5) * 100;

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <StarIcon sx={{ color, fontSize: 16 }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color }}>
            {value.toFixed(1)}
          </Typography>
        </Box>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': {
            bgcolor: color,
            borderRadius: 4,
          },
        }}
      />
    </Box>
  );
};
