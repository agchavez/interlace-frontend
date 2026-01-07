import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Divider,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import VerifiedIcon from '@mui/icons-material/Verified';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BlockIcon from '@mui/icons-material/Block';
import { useGetPersonnelProfileQuery, useGetCertificationsQuery, useGetPerformanceMetricsQuery, useGetEmergencyContactsQuery } from '../services/personnelApi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const PersonnelProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Determinar si es "Mi Perfil" o un perfil de otra persona
  const isMyProfile = id === 'me';

  // Cargar datos
  const personnelId = id ? Number(id) : 0;
  const { data: profile, isLoading, error } = useGetPersonnelProfileQuery(personnelId, { skip: !id });
  const { data: certificationsData } = useGetCertificationsQuery({ personnel: personnelId }, { skip: !id });
  const { data: performanceData } = useGetPerformanceMetricsQuery({ personnel: personnelId }, { skip: !id });
  const { data: emergencyContactsData } = useGetEmergencyContactsQuery({ personnel: personnelId }, { skip: !id });

  const certifications = certificationsData?.results || [];
  const performanceMetrics = performanceData?.results || [];
  const emergencyContacts = Array.isArray(emergencyContactsData) ? emergencyContactsData : [];

  // Permisos: puede agregar certificaciones/desempeño si no es "Mi Perfil"
  const canManage = !isMyProfile;

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(`/personnel/edit/${id}`);
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
    // TODO: Implementar lógica de desactivación
    console.log('Desactivar personal');
    handleCloseMenu();
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error al cargar el perfil. Por favor, inténtelo nuevamente.
        </Alert>
      </Container>
    );
  }

  const tabs = [
    { label: 'Información General', icon: <PersonIcon /> },
    { label: 'Certificaciones', icon: <VerifiedIcon />, badge: certifications.length },
    { label: 'Desempeño', icon: <AssessmentIcon />, badge: performanceMetrics.length },
    { label: 'Contactos de Emergencia', icon: <ContactEmergencyIcon />, badge: emergencyContacts.length },
    { label: 'Usuario del Sistema', icon: <AccountCircleIcon /> },
  ];

  return (
    <Container maxWidth="xl">
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        {/* Header */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" fontWeight={400}>
              {isMyProfile ? 'Mi Perfil' : 'Perfil de Personal'}
            </Typography>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={() => navigate('/personnel')}
              startIcon={<ArrowBackIcon />}
            >
              Volver
            </Button>
          </Box>
          <Divider sx={{ marginTop: 1 }} />
        </Grid>

        {/* Profile Header Card */}
        <Grid item xs={12}>
          <Card elevation={3} sx={{ position: 'relative' }}>
            <CardContent sx={{ bgcolor: theme.palette.secondary.main, color: 'white' }}>
              <Grid container spacing={3} alignItems="center" justifyContent="space-between">
                {/* Lado Izquierdo: Avatar + Información */}
                <Grid item xs={12} md={8}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item>
                      <Avatar
                        src={profile.photo_url || undefined}
                        alt={profile.full_name}
                        sx={{ width: 120, height: 120, bgcolor: 'white', color: theme.palette.secondary.main, fontSize: '3rem', fontWeight: 700 }}
                      >
                        {profile.first_name?.[0]}{profile.last_name?.[0]}
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                  <Typography variant="h4" fontWeight={600} color="white">
                    {profile.full_name}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.9)' }}>
                    {profile.position}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip icon={<BadgeIcon />} label={profile.employee_code} sx={{ bgcolor: 'white', color: theme.palette.secondary.main }} />
                    <Chip label={profile.hierarchy_level_display} sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }} />
                    <Chip
                      icon={profile.is_active ? <CheckCircleIcon /> : <WarningAmberIcon />}
                      label={profile.is_active ? 'Activo' : 'Inactivo'}
                      color={profile.is_active ? 'success' : 'error'}
                    />
                    {profile.has_system_access && (
                      <Chip icon={<AccountCircleIcon />} label="Acceso al Sistema" color="info" />
                    )}
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
                        size={100}
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
            </CardContent>
          </Card>
        </Grid>

        {/* Tabs */}
        <Grid item xs={12}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant={isMobile ? 'scrollable' : 'fullWidth'}
              scrollButtons="auto"
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  icon={tab.icon}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {!isMobile && tab.label}
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <Chip label={tab.badge} size="small" color="primary" />
                      )}
                    </Box>
                  }
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Panel 0: Información General */}
          <CustomTabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              {/* Información Básica */}
              <Grid item xs={12} md={6}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon color="secondary" /> Información Personal
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><EmailIcon color="secondary" /></ListItemIcon>
                        <ListItemText primary="Email" secondary={profile.email || 'No especificado'} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><PhoneIcon color="secondary" /></ListItemIcon>
                        <ListItemText primary="Teléfono" secondary={profile.phone} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><LocationOnIcon color="secondary" /></ListItemIcon>
                        <ListItemText primary="Dirección" secondary={`${profile.address}, ${profile.city}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CalendarTodayIcon color="secondary" /></ListItemIcon>
                        <ListItemText
                          primary="Fecha de Nacimiento"
                          secondary={format(new Date(profile.birth_date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Información Laboral */}
              <Grid item xs={12} md={6}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WorkIcon color="secondary" /> Información Laboral
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><BusinessIcon color="secondary" /></ListItemIcon>
                        <ListItemText
                          primary="Área"
                          secondary={(typeof profile.area === 'object' ? profile.area.name : profile.area_data?.name) || 'No especificada'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><BusinessIcon color="secondary" /></ListItemIcon>
                        <ListItemText
                          primary="Departamento"
                          secondary={(typeof profile.department === 'object' && profile.department ? profile.department.name : profile.department_data?.name) || 'No especificado'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CalendarTodayIcon color="secondary" /></ListItemIcon>
                        <ListItemText
                          primary="Fecha de Ingreso"
                          secondary={format(new Date(profile.hire_date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><WorkIcon color="secondary" /></ListItemIcon>
                        <ListItemText
                          primary="Tipo de Contrato"
                          secondary={profile.contract_type}
                        />
                      </ListItem>
                      {profile.supervisor_data && (
                        <ListItem>
                          <ListItemIcon><PersonIcon color="secondary" /></ListItemIcon>
                          <ListItemText
                            primary="Supervisor Inmediato"
                            secondary={profile.supervisor_data.full_name}
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CustomTabPanel>

          {/* Tab Panel 1: Certificaciones */}
          <CustomTabPanel value={activeTab} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Certificaciones ({certifications.length})
              </Typography>
              {canManage && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/personnel/certifications/create')}
                >
                  Nueva Certificación
                </Button>
              )}
            </Box>

            {certifications.length === 0 ? (
              <Alert severity="info">No hay certificaciones registradas</Alert>
            ) : (
              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Número</TableCell>
                      <TableCell>Fecha de Emisión</TableCell>
                      <TableCell>Vencimiento</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {certifications.map((cert: any) => (
                      <TableRow key={cert.id}>
                        <TableCell>{cert.certification_type?.name}</TableCell>
                        <TableCell>{cert.certification_number}</TableCell>
                        <TableCell>
                          {format(new Date(cert.issue_date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(cert.expiration_date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={cert.is_valid ? 'Válida' : 'Vencida'}
                            color={cert.is_valid ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CustomTabPanel>

          {/* Tab Panel 2: Desempeño */}
          <CustomTabPanel value={activeTab} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Evaluaciones de Desempeño ({performanceMetrics.length})
              </Typography>
              {canManage && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/personnel/performance/create')}
                >
                  Nueva Evaluación
                </Button>
              )}
            </Box>

            {performanceMetrics.length === 0 ? (
              <Alert severity="info">No hay evaluaciones de desempeño registradas</Alert>
            ) : (
              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Período</TableCell>
                      <TableCell>Puntuación General</TableCell>
                      <TableCell>Evaluado Por</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {performanceMetrics.map((metric: any) => (
                      <TableRow key={metric.id}>
                        <TableCell>
                          {format(new Date(metric.evaluation_date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>{metric.period_display}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${metric.overall_score?.toFixed(1)} / 5.0`}
                            color={metric.overall_score >= 4 ? 'success' : metric.overall_score >= 3 ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell>{metric.evaluated_by?.full_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CustomTabPanel>

          {/* Tab Panel 3: Contactos de Emergencia */}
          <CustomTabPanel value={activeTab} index={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Contactos de Emergencia ({emergencyContacts.length})
              </Typography>
            </Box>

            {emergencyContacts.length === 0 ? (
              <Alert severity="info">No hay contactos de emergencia registrados</Alert>
            ) : (
              <Grid container spacing={2}>
                {emergencyContacts.map((contact: any) => (
                  <Grid item xs={12} md={6} key={contact.id}>
                    <Card elevation={2}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Typography variant="h6" fontWeight={600}>
                            {contact.name}
                          </Typography>
                          {contact.is_primary && (
                            <Chip label="Principal" color="primary" size="small" />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {contact.relationship_display}
                        </Typography>
                        <List dense>
                          <ListItem disableGutters>
                            <ListItemIcon sx={{ minWidth: 40 }}><PhoneIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={contact.phone} />
                          </ListItem>
                          {contact.alternate_phone && (
                            <ListItem disableGutters>
                              <ListItemIcon sx={{ minWidth: 40 }}><PhoneIcon fontSize="small" /></ListItemIcon>
                              <ListItemText primary={contact.alternate_phone} secondary="Teléfono alternativo" />
                            </ListItem>
                          )}
                          {contact.address && (
                            <ListItem disableGutters>
                              <ListItemIcon sx={{ minWidth: 40 }}><LocationOnIcon fontSize="small" /></ListItemIcon>
                              <ListItemText primary={contact.address} />
                            </ListItem>
                          )}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CustomTabPanel>

          {/* Tab Panel 4: Usuario del Sistema */}
          <CustomTabPanel value={activeTab} index={4}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Información del Usuario del Sistema
            </Typography>

            {profile.has_system_access ? (
              <Card elevation={2}>
                <CardContent>
                  <List>
                    {/* User data not available in PersonnelProfile interface
                    <ListItem>
                      <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                      <ListItemText
                        primary="Nombre de Usuario"
                        secondary={'No disponible'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><EmailIcon /></ListItemIcon>
                      <ListItemText
                        primary="Email de Usuario"
                        secondary={'No disponible'}
                      />
                    </ListItem>
                    */}
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon /></ListItemIcon>
                      <ListItemText
                        primary="Estado"
                        secondary="Tiene acceso al sistema"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            ) : (
              <Alert severity="info" icon={<AccountCircleIcon />}>
                Este empleado NO tiene acceso al sistema. Solo cuenta con registro de personal.
              </Alert>
            )}
          </CustomTabPanel>
        </Grid>
      </Grid>

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
    </Container>
  );
};
