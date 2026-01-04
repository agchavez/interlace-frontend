import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Chip,
  Avatar,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BlockIcon from '@mui/icons-material/Block';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VerifiedIcon from '@mui/icons-material/Verified';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { QRCodeSVG } from 'qrcode.react';
import { useGetPersonnelProfileQuery, useGetCertificationsQuery, useGetPerformanceMetricsQuery } from '../services/personnelApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
    >
      {value === index && (
        <Box sx={{ py: 4 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export const PersonnelDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { data: profile, isLoading, error } = useGetPersonnelProfileQuery(Number(id));
  const { data: certificationsData } = useGetCertificationsQuery({ personnel: Number(id), limit: 100, offset: 0 });
  const { data: performanceData } = useGetPerformanceMetricsQuery({ personnel: Number(id), limit: 100, offset: 0 });

  const handleBack = () => {
    navigate('/personnel');
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    // TODO: Navegar a página de edición
    console.log('Editar perfil:', id);
    handleCloseMenu();
  };

  const handleGrantAccess = () => {
    navigate('/personnel/grant-access', {
      state: {
        personnel: profile
      }
    });
    handleCloseMenu();
  };

  const handleDeactivate = () => {
    // TODO: Implementar desactivación de personal
    console.log('Desactivar personal:', id);
    handleCloseMenu();
  };

  const handleNewCertification = () => {
    navigate(`/personnel/certifications/create?personnel=${id}`);
    handleCloseMenu();
  };

  const handleNewEvaluation = () => {
    navigate(`/personnel/performance/create?personnel=${id}`);
    handleCloseMenu();
  };

  const handleAddCertification = () => {
    navigate(`/personnel/certifications/create?personnel=${id}`);
  };

  const handleAddPerformance = () => {
    navigate(`/personnel/performance/create?personnel=${id}`);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Alert severity="error">Error al cargar la información del personal</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4, lg: 5 }, width: !isMobile ? '80%' : '100%', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <IconButton
          onClick={handleBack}
          size={isMobile ? 'small' : 'medium'}
        >
          <NavigateBeforeIcon fontSize={isMobile ? 'medium' : 'large'} />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 400, flex: 1 }}>
          Detalle de Personal
        </Typography>
      </Box>

      {/* Profile Header Card */}
      <Paper
        elevation={3}
        sx={{
          bgcolor: theme.palette.secondary.main,
          color: 'white',
          p: { xs: 3, sm: 4, md: 5 },
          mb: 4,
          borderRadius: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center" justifyContent="space-between">
          {/* Lado Izquierdo: Avatar + Información */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Avatar
                  src={profile.photo_url || undefined}
                  alt={profile.full_name}
                  sx={{
                    width: { xs: 100, sm: 120, md: 140 },
                    height: { xs: 100, sm: 120, md: 140 },
                    bgcolor: 'rgba(255,255,255,0.2)',
                    fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                    fontWeight: 700,
                  }}
                >
                  {profile.first_name[0]}
                  {profile.last_name[0]}
                </Avatar>
              </Grid>
              <Grid item xs>
            <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, mb: 1 }}>
              {profile.full_name}
            </Typography>
            <Typography variant={isMobile ? 'body2' : 'body1'} sx={{ mb: 2, opacity: 0.9 }}>
              {profile.position}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={profile.hierarchy_level_display}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
              <Chip
                icon={profile.is_active ? <CheckCircleIcon /> : <CancelIcon />}
                label={profile.is_active ? 'Activo' : 'Inactivo'}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  bgcolor: profile.is_active ? 'rgba(76, 175, 80, 0.9)' : 'rgba(158, 158, 158, 0.9)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
              <Chip
                label={`${profile.employee_code}`}
                icon={<BadgeIcon />}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Lado Derecho: QR + Menú */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              {/* Menú desplegable */}
              <IconButton
                onClick={handleOpenMenu}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <MoreVertIcon />
              </IconButton>

              {/* QR Code */}
              <Box
                sx={{
                  bgcolor: 'white',
                  p: 1.5,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 2,
                }}
              >
                <QRCodeSVG
                  value={`${import.meta.env.VITE_JS_FRONTEND_URL}/personnel/detail/${profile.id}`}
                  size={isMobile ? 80 : 100}
                  level="Q"
                  imageSettings={{
                    src: '/logo-qr.png',
                    height: 20,
                    width: 20,
                    excavate: true,
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Card elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
            sx={{
              '& .MuiTab-root': {
                minHeight: { xs: 48, sm: 64 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                fontWeight: 500,
              },
            }}
          >
            <Tab icon={<PersonIcon />} label="Perfil" iconPosition="start" />
            <Tab icon={<AssignmentIcon />} label="Certificaciones" iconPosition="start" />
            <Tab icon={<LocalHospitalIcon />} label="Médico" iconPosition="start" />
            <Tab icon={<TrendingUpIcon />} label="Desempeño" iconPosition="start" />
            <Tab icon={<ContactEmergencyIcon />} label="Emergencias" iconPosition="start" />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {/* Tab 1: Profile */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ px: { xs: 2, sm: 4 } }}>
              {/* Información Básica */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                  <BadgeIcon color="secondary" />
                  Información Básica
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<BadgeIcon />} label="Código" value={profile.employee_code} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<PersonIcon />} label="Nombre" value={profile.full_name} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<EmailIcon />} label="Email" value={profile.email} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<PhoneIcon />} label="Teléfono" value={profile.phone || 'No especificado'} />
                  </Grid>
                  {profile.national_id && (
                    <Grid item xs={12} sm={6}>
                      <InfoItem icon={<BadgeIcon />} label="ID Nacional" value={profile.national_id} />
                    </Grid>
                  )}
                  {profile.birth_date && (
                    <Grid item xs={12} sm={6}>
                      <InfoItem
                        icon={<CalendarTodayIcon />}
                        label="Fecha de Nacimiento"
                        value={new Date(profile.birth_date).toLocaleDateString()}
                      />
                    </Grid>
                  )}
                  {profile.gender && (
                    <Grid item xs={12} sm={6}>
                      <InfoItem
                        icon={<PersonIcon />}
                        label="Género"
                        value={profile.gender === 'M' ? 'Masculino' : profile.gender === 'F' ? 'Femenino' : 'Otro'}
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Información Organizacional */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                  <BusinessIcon color="secondary" />
                  Información Organizacional
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<BusinessIcon />} label="Centro de Distribución" value={profile.center_name} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<BusinessIcon />} label="Área" value={profile.area_name} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<WorkIcon />} label="Posición" value={profile.position} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<WorkIcon />} label="Tipo de Posición" value={profile.position_type_display} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<TrendingUpIcon />} label="Nivel Jerárquico" value={profile.hierarchy_level_display} />
                  </Grid>
                  {profile.department_name && (
                    <Grid item xs={12} sm={6}>
                      <InfoItem icon={<BusinessIcon />} label="Departamento" value={profile.department_name} />
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Información Laboral */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                  <WorkIcon color="secondary" />
                  Información Laboral
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<CalendarTodayIcon />}
                      label="Fecha de Contratación"
                      value={new Date(profile.hire_date).toLocaleDateString()}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<WorkIcon />} label="Tipo de Contrato" value={profile.contract_type_display} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<TrendingUpIcon />} label="Antigüedad" value={`${profile.years_of_service} años`} />
                  </Grid>
                  {profile.base_salary && (
                    <Grid item xs={12} sm={6}>
                      <InfoItem icon={<WorkIcon />} label="Salario Base" value={`L ${profile.base_salary}`} />
                    </Grid>
                  )}
                  {profile.termination_date && (
                    <Grid item xs={12} sm={6}>
                      <InfoItem
                        icon={<CalendarTodayIcon />}
                        label="Fecha de Terminación"
                        value={new Date(profile.termination_date).toLocaleDateString()}
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Información de Contacto y Sistema */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                  <LocationOnIcon color="primary" />
                  Información de Contacto y Sistema
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<LocationOnIcon />} label="Dirección" value={profile.address || 'No especificado'} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<CheckCircleIcon />}
                      label="Acceso al Sistema"
                      value={profile.has_system_access ? 'Sí' : 'No'}
                    />
                  </Grid>
                  {profile.username && (
                    <Grid item xs={12} sm={6}>
                      <InfoItem icon={<PersonIcon />} label="Usuario" value={profile.username} />
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Box>
          </TabPanel>

          {/* Tab 2: Certifications */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ px: { xs: 2, sm: 4 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                  <AssignmentIcon color="primary" />
                  Certificaciones y Capacitaciones
                </Typography>
                <Button
                  startIcon={<AddCircleIcon />}
                  onClick={handleAddCertification}
                  variant="contained"
                  size="small"
                  color="primary"
                >
                  Agregar
                </Button>
              </Box>
              {certificationsData && certificationsData.results.length > 0 ? (
                <Card elevation={2}>
                  <CardContent sx={{ p: 3 }}>
                    {certificationsData.results.map((cert: any, index: number) => (
                      <React.Fragment key={cert.id}>
                        {index > 0 && <Divider sx={{ my: 3 }} />}
                        <Box>
                          {/* Header con título y estado */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                sx={{
                                  bgcolor: cert.is_valid && !cert.is_expired && !cert.is_expiring_soon
                                    ? 'success.main'
                                    : cert.is_expiring_soon
                                    ? 'warning.main'
                                    : 'error.main',
                                  width: 40,
                                  height: 40,
                                }}
                              >
                                <AssignmentIcon fontSize="small" />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                                  {cert.certification_type_name}
                                </Typography>
                                {cert.is_valid && !cert.is_expired && !cert.is_expiring_soon ? (
                                  <Chip label="Vigente" color="success" size="small" icon={<CheckCircleIcon />} />
                                ) : cert.is_expiring_soon ? (
                                  <Chip label="Por Vencer" color="warning" size="small" icon={<WarningIcon />} />
                                ) : (
                                  <Chip label={cert.status_display || "Vencida"} color="error" size="small" icon={<CancelIcon />} />
                                )}
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => navigate(`/personnel/certifications/${cert.id}`)}
                                title="Ver Detalle"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                              {cert.certificate_document && (
                                <IconButton
                                  size="small"
                                  color="secondary"
                                  onClick={() => window.open(cert.certificate_document, '_blank')}
                                  title="Ver Documento"
                                >
                                  <DescriptionIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </Box>

                          {/* Información en columnas */}
                          <Grid container spacing={2}>
                            {cert.certification_number && (
                              <Grid item xs={12} sm={6} md={4}>
                                <InfoItem
                                  icon={<BadgeIcon />}
                                  label="Número de Certificación"
                                  value={cert.certification_number}
                                />
                              </Grid>
                            )}
                            <Grid item xs={12} sm={6} md={4}>
                              <InfoItem
                                icon={<BusinessIcon />}
                                label="Autoridad Emisora"
                                value={cert.issuing_authority || 'N/A'}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                              <InfoItem
                                icon={<CalendarTodayIcon />}
                                label="Fecha de Emisión"
                                value={new Date(cert.issue_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                              <InfoItem
                                icon={<CalendarTodayIcon />}
                                label="Fecha de Vencimiento"
                                value={new Date(cert.expiration_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                              />
                            </Grid>
                          </Grid>

                          {/* Alerta de vencimiento */}
                          {cert.days_until_expiration !== null && (
                            <Box
                              sx={{
                                mt: 2,
                                p: 1.5,
                                bgcolor: cert.is_expiring_soon ? 'warning.lighter' : cert.is_expired ? 'error.lighter' : 'success.lighter',
                                borderRadius: 1,
                                border: `1px solid ${
                                  cert.is_expiring_soon
                                    ? theme.palette.warning.main
                                    : cert.is_expired
                                    ? theme.palette.error.main
                                    : theme.palette.success.main
                                }`,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: cert.is_expiring_soon ? 'warning.dark' : cert.is_expired ? 'error.dark' : 'success.dark',
                                }}
                              >
                                {cert.days_until_expiration > 0
                                  ? `⏰ Vence en ${cert.days_until_expiration} días`
                                  : `❌ Venció hace ${Math.abs(cert.days_until_expiration)} días`}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </React.Fragment>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <Card elevation={2}>
                  <CardContent sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No hay certificaciones registradas
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Agrega la primera certificación para este empleado
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddCircleIcon />}
                        onClick={handleAddCertification}
                      >
                        Agregar Certificación
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          </TabPanel>

          {/* Tab 3: Medical Records */}
          <TabPanel value={activeTab} index={2}>
            <Box>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalHospitalIcon color="primary" />
                Historial Médico
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Información médica confidencial del empleado
              </Alert>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" align="center">
                        No hay registros médicos disponibles
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Tab 4: Performance */}
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ px: { xs: 2, sm: 4 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                  <TrendingUpIcon color="primary" />
                  Métricas de Desempeño
                </Typography>
                <Button
                  startIcon={<AddCircleIcon />}
                  onClick={handleAddPerformance}
                  variant="contained"
                  size="small"
                  color="secondary"
                >
                  Agregar
                </Button>
              </Box>
              {performanceData && performanceData.results.length > 0 ? (
                <Grid container spacing={3}>
                  {performanceData.results.map((perf: any) => (
                    <Grid item xs={12} md={6} lg={4} key={perf.id}>
                      <Card
                        elevation={4}
                        sx={{
                          height: '100%',
                          position: 'relative',
                          overflow: 'visible',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                          },
                          borderTop: `4px solid ${
                            perf.score >= 80
                              ? theme.palette.success.main
                              : perf.score >= 60
                              ? theme.palette.warning.main
                              : theme.palette.error.main
                          }`,
                        }}
                      >
                        <CardContent sx={{ pb: 1 }}>
                          {/* Header con icono y puntuación */}
                          <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, mb: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: perf.score >= 80 ? 'success.main' : perf.score >= 60 ? 'warning.main' : 'error.main',
                                width: 48,
                                height: 48,
                              }}
                            >
                              <TrendingUpIcon />
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  color: 'primary.main',
                                  lineHeight: 1.2,
                                  mb: 0.5,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {perf.metric_type_display || 'Evaluación'}
                              </Typography>
                              <Chip
                                label={`${perf.score || 0}/100`}
                                color={perf.score >= 80 ? 'success' : perf.score >= 60 ? 'warning' : 'error'}
                                size="small"
                              />
                            </Box>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          {/* Información */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarTodayIcon fontSize="small" color="action" />
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                                  Período
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {perf.evaluation_period || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>

                            {perf.evaluation_date && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarTodayIcon fontSize="small" color="action" />
                                <Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                                    Fecha de Evaluación
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {new Date(perf.evaluation_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </Typography>
                                </Box>
                              </Box>
                            )}

                            {perf.evaluator_name && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon fontSize="small" color="action" />
                                <Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                                    Evaluador
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {perf.evaluator_name}
                                  </Typography>
                                </Box>
                              </Box>
                            )}

                            {/* Barra de progreso visual */}
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                                Puntuación
                              </Typography>
                              <Box sx={{ position: 'relative', height: 8, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    height: '100%',
                                    width: `${perf.score || 0}%`,
                                    bgcolor: perf.score >= 80 ? 'success.main' : perf.score >= 60 ? 'warning.main' : 'error.main',
                                    transition: 'width 0.5s ease',
                                  }}
                                />
                              </Box>
                            </Box>

                            {perf.comments && (
                              <Box
                                sx={{
                                  mt: 1,
                                  p: 1.5,
                                  bgcolor: 'background.default',
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                }}
                              >
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                                  Comentarios:
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                  {perf.comments}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Card elevation={2}>
                  <CardContent sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <TrendingUpIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No hay métricas de desempeño registradas
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Agrega la primera evaluación de desempeño para este empleado
                      </Typography>
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<AddCircleIcon />}
                        onClick={handleAddPerformance}
                      >
                        Agregar Evaluación
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          </TabPanel>

          {/* Tab 5: Emergency Contacts */}
          <TabPanel value={activeTab} index={4}>
            <Box>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ContactEmergencyIcon color="primary" />
                Contactos de Emergencia
              </Typography>
              <Alert severity="warning" sx={{ mb: 3 }}>
                Información de contactos en caso de emergencia
              </Alert>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" align="center">
                        No hay contactos de emergencia registrados
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Menu de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 220,
            borderRadius: 2,
            mt: 1,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              borderRadius: 1,
              mx: 1,
              my: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(220, 187, 32, 0.1)',
              },
            },
          },
        }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Editar Perfil</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleNewCertification}>
          <ListItemIcon>
            <VerifiedIcon fontSize="small" sx={{ color: 'info.main' }} />
          </ListItemIcon>
          <ListItemText>Nuevo Certificado</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleNewEvaluation}>
          <ListItemIcon>
            <AssessmentIcon fontSize="small" sx={{ color: 'warning.main' }} />
          </ListItemIcon>
          <ListItemText>Nueva Evaluación</ListItemText>
        </MenuItem>

        {profile && !profile.has_system_access && (
          <MenuItem onClick={handleGrantAccess}>
            <ListItemIcon>
              <PersonAddIcon fontSize="small" sx={{ color: 'success.main' }} />
            </ListItemIcon>
            <ListItemText>Dar Acceso al Sistema</ListItemText>
          </MenuItem>
        )}

        {profile && profile.is_active && (
          <MenuItem onClick={handleDeactivate}>
            <ListItemIcon>
              <BlockIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Desactivar Personal</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

// ============================================
// Helper Components
// ============================================

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          py: 2.5,
          px: 1,
        }}
      >
        <Box sx={{ color: 'secondary.main', mt: 0.5 }}>{icon}</Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
            {label}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.05rem', wordBreak: 'break-word', color: 'text.primary' }}>
            {value}
          </Typography>
        </Box>
      </Box>
      <Divider />
    </Box>
  );
};
