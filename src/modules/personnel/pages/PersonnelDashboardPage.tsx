import React, { useMemo } from 'react';
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
import { useGetPersonnelProfilesQuery } from '../services/personnelApi';

export const PersonnelDashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Obtener datos de personal
  const { data, isLoading, error } = useGetPersonnelProfilesQuery({ limit: 1000 });

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (!data?.results) return null;

    const total = data.count;
    const active = data.results.filter((p) => p.is_active).length;
    const withAccess = data.results.filter((p) => p.has_system_access).length;

    // Por nivel jerárquico
    const byHierarchy = data.results.reduce((acc, p) => {
      acc[p.hierarchy_level_display] = (acc[p.hierarchy_level_display] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Por tipo de posición
    const byPositionType = data.results.reduce((acc, p) => {
      acc[p.position_type_display] = (acc[p.position_type_display] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Por área
    const byArea = data.results.reduce((acc, p) => {
      acc[p.area_name] = (acc[p.area_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Promedio de antigüedad
    const avgYears =
      data.results.reduce((sum, p) => sum + p.years_of_service, 0) / data.results.length;

    return {
      total,
      active,
      inactive: total - active,
      withAccess,
      withoutAccess: total - withAccess,
      byHierarchy,
      byPositionType,
      byArea,
      avgYears: avgYears.toFixed(1),
    };
  }, [data]);

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
        <Typography variant="h4" sx={{ fontWeight: 400, mb: 1 }}>
          Dashboard de Personal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vista general de la gestión de personal y métricas clave
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Personal"
            value={stats?.total || 0}
            icon={<PeopleIcon />}
            color={theme.palette.primary.main}
            trend="+12%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Personal Activo"
            value={stats?.active || 0}
            icon={<CheckCircleIcon />}
            color="#4caf50"
            subtitle={`${stats?.inactive || 0} inactivos`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Con Acceso Sistema"
            value={stats?.withAccess || 0}
            icon={<BadgeIcon />}
            color="#2196f3"
            subtitle={`${stats?.withoutAccess || 0} sin acceso`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Antigüedad Promedio"
            value={`${stats?.avgYears || 0} años`}
            icon={<TrendingUpIcon />}
            color="#ff9800"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Distribución por Nivel Jerárquico */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Distribución por Nivel Jerárquico
              </Typography>
              <Box>
                {stats &&
                  Object.entries(stats.byHierarchy).map(([level, count]) => (
                    <ProgressBar
                      key={level}
                      label={level}
                      value={count as number}
                      total={stats.total}
                      color={theme.palette.primary.main}
                    />
                  ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución por Tipo de Posición */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Distribución por Tipo de Posición
              </Typography>
              <Box>
                {stats &&
                  Object.entries(stats.byPositionType).map(([type, count]) => (
                    <ProgressBar
                      key={type}
                      label={type}
                      value={count as number}
                      total={stats.total}
                      color="#2196f3"
                    />
                  ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución por Área */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Personal por Área
              </Typography>
              <Grid container spacing={2}>
                {stats &&
                  Object.entries(stats.byArea)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 6)
                    .map(([area, count]) => (
                      <Grid item xs={12} sm={6} key={area}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            bgcolor: 'action.hover',
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: 'action.selected',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <BusinessIcon />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                {area}
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {count as number}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Alertas y Notificaciones */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Alertas
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <WarningIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Certificaciones por vencer"
                    secondary="5 certificaciones vencen este mes"
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <PersonAddIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Nuevos ingresos"
                    secondary="3 empleados esta semana"
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <AssignmentIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Evaluaciones pendientes"
                    secondary="8 evaluaciones de desempeño"
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Accesos Rápidos */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Accesos Rápidos
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => navigate('/personnel/create')}
                  >
                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                      <PersonAddIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Nuevo Personal
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Registrar nuevo empleado
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
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => navigate('/personnel')}
                  >
                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'info.main', width: 56, height: 56 }}>
                      <GroupsIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Ver Todo el Personal
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
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => navigate('/personnel/certifications')}
                  >
                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'warning.main', width: 56, height: 56 }}>
                      <AssignmentIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Certificaciones
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Gestionar certificaciones
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
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => navigate('/personnel/performance')}
                  >
                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'success.main', width: 56, height: 56 }}>
                      <TrendingUpIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
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
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: color, opacity: 0.9 }}>{icon}</Avatar>
        </Box>
        {(trend || subtitle) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {trend && (
              <Chip label={trend} size="small" color="success" sx={{ height: 20, fontSize: '0.7rem' }} />
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
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
  const percentage = (value / total) * 100;

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {value} ({percentage.toFixed(1)}%)
        </Typography>
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
