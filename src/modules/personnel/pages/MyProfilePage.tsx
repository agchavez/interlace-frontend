import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
} from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import CakeIcon from '@mui/icons-material/Cake';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedIcon from '@mui/icons-material/Verified';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useGetMyProfileQuery, useGetCertificationsQuery, useGetPerformanceMetricsQuery } from '../services/personnelApi';
import type { PersonnelProfile } from '../../../interfaces/personnel';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({
  icon,
  label,
  value,
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 1.5,
      py: 1.5,
      px: 1,
    }}
  >
    <Box sx={{ color: 'primary.main', mt: 0.3 }}>{icon}</Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const MyProfilePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetMyProfileQuery();

  // Fetch certifications and performance metrics when profile is loaded
  const personnelProfile = data && 'id' in data ? data : null;
  const { data: certificationsData } = useGetCertificationsQuery(
    { personnel: personnelProfile?.id as number },
    { skip: !personnelProfile?.id }
  );
  const { data: performanceData } = useGetPerformanceMetricsQuery(
    { personnel: personnelProfile?.id as number },
    { skip: !personnelProfile?.id }
  );

  const certifications = certificationsData?.results || [];
  const performanceMetrics = performanceData?.results || [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={isMobile ? 40 : 60} />
      </Box>
    );
  }

  if (error || !data || 'has_profile' in data) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Alert severity="error">
          No se encontró su perfil de personal. Por favor contacte con Recursos Humanos.
        </Alert>
      </Box>
    );
  }

  const profile = data as PersonnelProfile;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, width: { xs: '100%', md: '90%', lg: '85%' }, mx: 'auto' }}>
      {/* Header con Avatar y Info Principal */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 2,
          bgcolor: theme.palette.secondary.main,
          color: 'white',
          borderRadius: 2,
          position: 'relative',
        }}
      >
        {/* Edit Button */}
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          {isMobile ? (
            <IconButton
              onClick={() => navigate('/personnel/my-profile/edit')}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              <EditIcon />
            </IconButton>
          ) : (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate('/personnel/my-profile/edit')}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              Editar Perfil
            </Button>
          )}
        </Box>

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm="auto">
            <Avatar
              src={profile.photo_url || undefined}
              alt={profile.full_name}
              sx={{
                width: { xs: 72, sm: 80, md: 90 },
                height: { xs: 72, sm: 80, md: 90 },
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                mx: { xs: 'auto', sm: 0 },
                bgcolor: 'rgba(255,255,255,0.2)',
                border: '4px solid white',
              }}
            >
              {profile.first_name[0]}
              {profile.last_name[0]}
            </Avatar>
          </Grid>
          <Grid item xs={12} sm>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              sx={{ fontWeight: 700, textAlign: { xs: 'center', sm: 'left' } }}
            >
              {profile.full_name}
            </Typography>
            <Typography
              variant={isMobile ? 'body1' : 'h6'}
              sx={{ opacity: 0.9, mt: 0.5, textAlign: { xs: 'center', sm: 'left' } }}
            >
              {profile.position}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <Chip
                label={profile.hierarchy_level_display}
                size={isMobile ? 'small' : 'medium'}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
              />
              <Chip
                label={profile.area_data?.name || (typeof profile.area === 'object' ? profile.area.name : '')}
                size={isMobile ? 'small' : 'medium'}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip
                label={`${profile.years_of_service} años de servicio`}
                icon={<TrendingUpIcon sx={{ color: 'white !important' }} />}
                size={isMobile ? 'small' : 'medium'}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
            },
          }}
        >
          <Tab
            icon={<PersonIcon />}
            iconPosition="start"
            label={isMobile ? undefined : "Información General"}
            aria-label="Información General"
          />
          <Tab
            icon={<VerifiedIcon />}
            iconPosition="start"
            label={isMobile ? undefined : "Certificaciones"}
            aria-label="Certificaciones"
          />
          <Tab
            icon={<AssessmentIcon />}
            iconPosition="start"
            label={isMobile ? undefined : "Evaluaciones"}
            aria-label="Evaluaciones"
          />
        </Tabs>

        {/* Tab Panel: Información General */}
        <CustomTabPanel value={activeTab} index={0}>
          <Box sx={{ px: { xs: 2, sm: 4 } }}>
            {/* Información Básica */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                <BadgeIcon color="primary" />
                Información Básica
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem icon={<BadgeIcon />} label="Código de Empleado" value={profile.employee_code} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem icon={<EmailIcon />} label="Email" value={profile.email} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem icon={<PhoneIcon />} label="Teléfono" value={profile.phone} />
                </Grid>
                {profile.authentication_methods && profile.authentication_methods.length > 0 && (
                  <Grid item xs={12}>
                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1.5,
                          py: 1,
                        }}
                      >
                        <Box sx={{ color: 'primary.main', mt: 0.25 }}>
                          <LockIcon />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.2}>
                            Métodos de Autenticación
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                            {profile.authentication_methods.map((method: any, index: number) => (
                              <Chip
                                key={index}
                                icon={method.type === 'email' ? <EmailIcon /> : <AccountCircleIcon />}
                                label={`${method.label}: ${method.value}`}
                                color={method.enabled ? 'success' : 'default'}
                                variant="outlined"
                                sx={{
                                  fontWeight: 500,
                                  py: 2,
                                  '& .MuiChip-icon': {
                                    color: method.enabled ? 'success.main' : 'text.secondary'
                                  }
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </Box>
                      <Divider />
                    </Box>
                  </Grid>
                )}
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem
                    icon={<CakeIcon />}
                    label="Fecha de Nacimiento"
                    value={new Date(profile.birth_date).toLocaleDateString('es-HN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Información Organizacional */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                <BusinessIcon color="primary" />
                Información Organizacional
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem
                    icon={<BusinessIcon />}
                    label="Centro de Distribución"
                    value={profile.primary_distributor_center_data?.name || 'No asignado'}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem icon={<WorkIcon />} label="Área" value={profile.area_data?.name || (typeof profile.area === 'object' ? profile.area.name : '') || ''} />
                </Grid>
                {(profile.department_data || profile.department) && (
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<WorkIcon />}
                      label="Departamento"
                      value={typeof profile.department === 'object' && profile.department ? profile.department.name : profile.department_data?.name || ''}
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem icon={<WorkIcon />} label="Tipo de Posición" value={profile.position_type_display} />
                </Grid>
                {profile.supervisor_data && (
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<BadgeIcon />}
                      label="Supervisor Inmediato"
                      value={profile.supervisor_data.full_name}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Información Laboral */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                <CalendarTodayIcon color="primary" />
                Información Laboral
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem
                    icon={<CalendarTodayIcon />}
                    label="Fecha de Ingreso"
                    value={new Date(profile.hire_date).toLocaleDateString('es-HN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem icon={<WorkIcon />} label="Tipo de Contrato" value={profile.contract_type_display || profile.contract_type} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem icon={<TrendingUpIcon />} label="Años de Servicio" value={profile.years_of_service} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem
                    icon={<BadgeIcon />}
                    label="Acceso al Sistema"
                    value={profile.has_system_access ? 'Sí' : 'No'}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Información de Contacto */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                <HomeIcon color="primary" />
                Información de Contacto
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem icon={<HomeIcon />} label="Dirección" value={profile.address} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem icon={<HomeIcon />} label="Ciudad" value={profile.city} />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 1 }}>
                  💡 Si necesita actualizar su información, puede editar ciertos campos de su perfil.
                </Typography>
              </Box>
            </Box>
          </Box>
        </CustomTabPanel>

        {/* Tab Panel: Certificaciones */}
        <CustomTabPanel value={activeTab} index={1}>
          {certifications.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Número</TableCell>
                    <TableCell>Emitido por</TableCell>
                    <TableCell>Fecha Emisión</TableCell>
                    <TableCell>Vencimiento</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {certifications.map((cert: any) => (
                    <TableRow key={cert.id}>
                      <TableCell>{cert.certification_type?.name || cert.certification_type_name}</TableCell>
                      <TableCell>{cert.certification_number}</TableCell>
                      <TableCell>{cert.issuing_organization}</TableCell>
                      <TableCell>{format(new Date(cert.issue_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{format(new Date(cert.expiration_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <Chip
                          label={cert.is_valid ? 'Válida' : 'Vencida'}
                          color={cert.is_valid ? 'success' : 'error'}
                          size="small"
                          icon={cert.is_valid ? <CheckCircleIcon /> : undefined}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ width: '100%' }}>
              <Alert severity="info" sx={{ width: '100%' }}>
                No tiene certificaciones registradas.
              </Alert>
            </Box>
          )}
        </CustomTabPanel>

        {/* Tab Panel: Evaluaciones */}
        <CustomTabPanel value={activeTab} index={2}>
          {performanceMetrics.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Período</TableCell>
                    <TableCell>Pallets Movidos</TableCell>
                    <TableCell>Horas Trabajadas</TableCell>
                    <TableCell>Productividad</TableCell>
                    <TableCell>Errores</TableCell>
                    <TableCell>Calificación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {performanceMetrics.map((metric: any) => (
                    <TableRow key={metric.id}>
                      <TableCell>{format(new Date(metric.metric_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{metric.period_display || metric.period}</TableCell>
                      <TableCell>{metric.pallets_moved}</TableCell>
                      <TableCell>{metric.hours_worked}</TableCell>
                      <TableCell>{metric.productivity_rate?.toFixed(2) || 'N/A'}</TableCell>
                      <TableCell>{metric.errors_count}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${metric.supervisor_rating}/10`}
                          color={metric.supervisor_rating >= 8 ? 'success' : metric.supervisor_rating >= 6 ? 'warning' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ width: '100%' }}>
              <Alert severity="info" sx={{ width: '100%' }}>
                No tiene evaluaciones de desempeño registradas.
              </Alert>
            </Box>
          )}
        </CustomTabPanel>
      </Paper>
    </Box>
  );
};
