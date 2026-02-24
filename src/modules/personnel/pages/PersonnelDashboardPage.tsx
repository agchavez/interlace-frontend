import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useGetPersonnelDashboardQuery } from '../services/personnelApi';
import { useAppSelector } from '../../../store';

// Traducciones de niveles jerárquicos
const HIERARCHY_TRANSLATIONS: Record<string, string> = {
  'DIRECTOR': 'Director',
  'AREA_MANAGER': 'Gerente de Área',
  'SUPERVISOR': 'Supervisor',
  'COORDINATOR': 'Coordinador',
  'SPECIALIST': 'Especialista',
  'ANALYST': 'Analista',
  'ASSISTANT': 'Asistente',
  'OPERATOR': 'Operador',
  'TECHNICIAN': 'Técnico',
  'INTERN': 'Practicante',
};

// Traducciones de tipos de posición
const POSITION_TYPE_TRANSLATIONS: Record<string, string> = {
  'ADMINISTRATIVE': 'Administrativo',
  'OPERATIONAL': 'Operativo',
  'TECHNICAL': 'Técnico',
  'MANAGEMENT': 'Gerencia',
  'SUPPORT': 'Soporte',
  'SALES': 'Ventas',
  'LOGISTICS': 'Logística',
  'PRODUCTION': 'Producción',
  'QUALITY': 'Calidad',
  'MAINTENANCE': 'Mantenimiento',
};

// Función helper para traducir
const translateLabel = (key: string, translations: Record<string, string>): string => {
  return translations[key] || key;
};

export const PersonnelDashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Obtener centros de distribución del usuario
  const { user } = useAppSelector(state => state.auth);
  const { disctributionCenters } = useAppSelector(state => state.maintenance);

  // Filtrar solo los centros que tiene asignados el usuario
  const userDistributionCenters = useMemo(() => {
    if (!user?.distributions_centers || !disctributionCenters) return [];
    return disctributionCenters.filter(dc => user.distributions_centers?.includes(dc.id));
  }, [user?.distributions_centers, disctributionCenters]);

  // Estado para el centro de distribución seleccionado
  const [selectedCenter, setSelectedCenter] = useState<number | ''>('');

  // Parámetros de consulta del dashboard
  const queryParams = useMemo(() => {
    if (selectedCenter === '') return undefined;
    return { distributor_center: selectedCenter };
  }, [selectedCenter]);

  // Obtener datos del dashboard
  const { data: dashboardData, isLoading, error } = useGetPersonnelDashboardQuery(queryParams);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Alert severity="error">Error al cargar las estadísticas</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1600, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 400, mb: 1 }}>
              Dashboard de Personal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vista general de la gestión de personal y métricas clave
              {dashboardData?.filter_info?.distributor_center_name && (
                <Chip
                  icon={<LocationOnIcon sx={{ fontSize: 16 }} />}
                  label={dashboardData.filter_info.distributor_center_name}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
          </Box>

          {/* Selector de Centro de Distribución */}
          {userDistributionCenters.length > 1 && (
            <FormControl size="small" sx={{ minWidth: 280 }}>
              <InputLabel id="distribution-center-label">Centro de Distribución</InputLabel>
              <Select
                labelId="distribution-center-label"
                value={selectedCenter}
                label="Centro de Distribución"
                onChange={(e) => setSelectedCenter(e.target.value as number | '')}
                sx={{
                  bgcolor: 'background.paper',
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  },
                }}
              >
                <MenuItem value="">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <em>Todos los centros</em>
                  </Box>
                </MenuItem>
                {userDistributionCenters.map((center) => (
                  <MenuItem key={center.id} value={center.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        variant="rounded"
                        alt={center.country_code || "hn"}
                        src={center.country_code ?
                          `https://flagcdn.com/h240/${center.country_code.toLowerCase()}.png` :
                          `https://flagcdn.com/h240/hn.png`}
                        sx={{ width: 24, height: 24 }}
                      />
                      {center.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Personal"
            value={dashboardData?.summary.total_active || 0}
            icon={<PeopleIcon />}
            color={theme.palette.primary.main}
            trend={dashboardData?.summary.growth_trend_percentage ? `${dashboardData.summary.growth_trend_percentage > 0 ? '+' : ''}${dashboardData.summary.growth_trend_percentage}%` : undefined}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Personal Activo"
            value={dashboardData?.summary.total_active || 0}
            icon={<CheckCircleIcon />}
            color="#4caf50"
            subtitle={`${dashboardData?.summary.total_inactive || 0} inactivos`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Con Acceso Sistema"
            value={dashboardData?.summary.with_system_access || 0}
            icon={<BadgeIcon />}
            color="#2196f3"
            subtitle={`${dashboardData?.summary.without_system_access || 0} sin acceso`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Antigüedad Promedio"
            value={`${dashboardData?.summary.avg_years_of_service || 0} años`}
            icon={<TrendingUpIcon />}
            color="#ff9800"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Distribución por Nivel Jerárquico */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${theme.palette.primary.main}15`,
                    color: theme.palette.primary.main,
                  }}
                >
                  <GroupsIcon />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    Nivel Jerárquico
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Distribución del personal por nivel
                  </Typography>
                </Box>
              </Box>
              <Box>
                {dashboardData?.by_hierarchy && dashboardData.by_hierarchy.length > 0 ? (
                  dashboardData.by_hierarchy.map((item) => (
                    <ProgressBar
                      key={item.hierarchy_level}
                      label={translateLabel(item.hierarchy_level, HIERARCHY_TRANSLATIONS)}
                      value={item.count}
                      total={dashboardData.summary.total_active}
                      color={theme.palette.primary.main}
                    />
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No hay datos disponibles</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución por Tipo de Posición */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#2196f315',
                    color: '#2196f3',
                  }}
                >
                  <WorkIcon />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    Tipo de Posición
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Clasificación por tipo de rol
                  </Typography>
                </Box>
              </Box>
              <Box>
                {dashboardData?.by_position_type && dashboardData.by_position_type.length > 0 ? (
                  dashboardData.by_position_type.map((item) => (
                    <ProgressBar
                      key={item.position_type}
                      label={translateLabel(item.position_type, POSITION_TYPE_TRANSLATIONS)}
                      value={item.count}
                      total={dashboardData.summary.total_active}
                      color="#2196f3"
                    />
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No hay datos disponibles</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución por Área */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#9c27b015',
                    color: '#9c27b0',
                  }}
                >
                  <BusinessIcon />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    Personal por Área
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Distribución en las diferentes áreas
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                {dashboardData?.by_area && dashboardData.by_area.length > 0 ? (
                  dashboardData.by_area.slice(0, 6).map((item, index) => {
                    const colors = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#0288d1', '#c2185b'];
                    const color = colors[index % colors.length];
                    return (
                      <Grid item xs={12} sm={6} key={item.area__code}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            bgcolor: `${color}08`,
                            border: '1px solid',
                            borderColor: `${color}20`,
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: `${color}15`,
                              borderColor: color,
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: `${color}20`,
                                color: color,
                              }}
                            >
                              <BusinessIcon fontSize="small" />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                {item.area__name}
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 700, color: color }}>
                                {item.count}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })
                ) : (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">No hay datos disponibles</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Alertas y Notificaciones */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#ff980015',
                    color: '#ff9800',
                  }}
                >
                  <WarningIcon />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    Alertas
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Notificaciones importantes
                  </Typography>
                </Box>
              </Box>
              <List sx={{ p: 0 }}>
                <ListItem
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: '#ff980008',
                    borderRadius: 2,
                    mb: 1.5,
                    border: '1px solid',
                    borderColor: '#ff980020',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#ff980020', color: '#ff9800', width: 36, height: 36 }}>
                      <WarningIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Certificaciones por vencer"
                    secondary={`${dashboardData?.certifications.expiring_soon || 0} vencen pronto`}
                    primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                  <Chip
                    label={dashboardData?.certifications.expiring_soon || 0}
                    size="small"
                    sx={{ bgcolor: '#ff980020', color: '#ff9800', fontWeight: 700 }}
                  />
                </ListItem>
                <ListItem
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: '#2196f308',
                    borderRadius: 2,
                    mb: 1.5,
                    border: '1px solid',
                    borderColor: '#2196f320',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#2196f320', color: '#2196f3', width: 36, height: 36 }}>
                      <PersonAddIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Nuevos ingresos"
                    secondary={`${dashboardData?.summary.new_hires_7_days || 0} esta semana`}
                    primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                  <Chip
                    label={dashboardData?.summary.new_hires_7_days || 0}
                    size="small"
                    sx={{ bgcolor: '#2196f320', color: '#2196f3', fontWeight: 700 }}
                  />
                </ListItem>
                <ListItem
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: '#4caf5008',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: '#4caf5020',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#4caf5020', color: '#4caf50', width: 36, height: 36 }}>
                      <AssignmentIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Evaluaciones pendientes"
                    secondary={`${dashboardData?.evaluations.pending || 0} pendientes`}
                    primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                  <Chip
                    label={dashboardData?.evaluations.pending || 0}
                    size="small"
                    sx={{ bgcolor: '#4caf5020', color: '#4caf50', fontWeight: 700 }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Accesos Rápidos */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#00968815',
                    color: '#009688',
                  }}
                >
                  <TrendingUpIcon />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    Accesos Rápidos
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Acciones frecuentes
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'primary.light',
                      bgcolor: 'primary.main',
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(25, 118, 210, 0.35)',
                      },
                    }}
                    onClick={() => navigate('/personnel/create')}
                  >
                    <Box
                      sx={{
                        mx: 'auto',
                        mb: 2,
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PersonAddIcon sx={{ fontSize: 28, color: 'white' }} />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white' }}>
                      Nuevo Personal
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Registrar empleado
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: '#2196f340',
                      bgcolor: '#2196f308',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(33, 150, 243, 0.2)',
                        borderColor: '#2196f3',
                        bgcolor: '#2196f315',
                      },
                    }}
                    onClick={() => navigate('/personnel')}
                  >
                    <Box
                      sx={{
                        mx: 'auto',
                        mb: 2,
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: '#2196f320',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <GroupsIcon sx={{ fontSize: 28, color: '#2196f3' }} />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                      Ver Personal
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Listado completo
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: '#ff980040',
                      bgcolor: '#ff980008',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(255, 152, 0, 0.2)',
                        borderColor: '#ff9800',
                        bgcolor: '#ff980015',
                      },
                    }}
                    onClick={() => navigate('/personnel/certifications')}
                  >
                    <Box
                      sx={{
                        mx: 'auto',
                        mb: 2,
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: '#ff980020',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AssignmentIcon sx={{ fontSize: 28, color: '#ff9800' }} />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#f57c00' }}>
                      Certificaciones
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Gestionar certificados
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: '#4caf5040',
                      bgcolor: '#4caf5008',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(76, 175, 80, 0.2)',
                        borderColor: '#4caf50',
                        bgcolor: '#4caf5015',
                      },
                    }}
                    onClick={() => navigate('/personnel/performance')}
                  >
                    <Box
                      sx={{
                        mx: 'auto',
                        mb: 2,
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: '#4caf5020',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TrendingUpIcon sx={{ fontSize: 28, color: '#4caf50' }} />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#388e3c' }}>
                      Desempeño
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Evaluaciones y métricas
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// ============================================
// Helper Components
// ============================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, subtitle }) => {
  // Generar color más claro para el fondo
  const bgColor = `${color}15`;
  const borderColor = `${color}30`;

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease-in-out',
        background: `linear-gradient(135deg, ${bgColor} 0%, transparent 100%)`,
        border: '1px solid',
        borderColor: borderColor,
        borderRadius: 3,
        overflow: 'visible',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: `0 12px 28px ${color}25`,
          borderColor: color,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.8rem',
                fontWeight: 500,
                color: 'text.secondary',
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: color,
                lineHeight: 1.2,
                mb: 1,
              }}
            >
              {value}
            </Typography>
            {(trend || subtitle) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                {trend && (
                  <Chip
                    label={trend}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: trend.startsWith('+') ? 'success.light' : 'error.light',
                      color: trend.startsWith('+') ? 'success.dark' : 'error.dark',
                    }}
                  />
                )}
                {subtitle && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {subtitle}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
              boxShadow: `0 4px 14px ${color}40`,
              color: 'white',
              '& svg': {
                fontSize: 28,
              },
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

interface ProgressBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <Box
      sx={{
        mb: 2.5,
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'action.hover',
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: 'action.selected',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={value}
            size="small"
            sx={{
              height: 22,
              minWidth: 32,
              bgcolor: `${color}20`,
              color: color,
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {percentage.toFixed(0)}%
          </Typography>
        </Box>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: `${color}15`,
          '& .MuiLinearProgress-bar': {
            bgcolor: color,
            borderRadius: 3,
            background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
          },
        }}
      />
    </Box>
  );
};
