import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Button,
  Chip,
  Avatar,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BadgeIcon from '@mui/icons-material/Badge';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { useGetCertificationQuery } from '../services/personnelApi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const CertificationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const { data: certification, isLoading, error } = useGetCertificationQuery(Number(id));

  const handleBack = () => {
    navigate(-1);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    // TODO: Navegar a edición
    console.log('Editar certificación:', id);
    handleCloseMenu();
  };

  const handleDelete = () => {
    // TODO: Implementar eliminación
    console.log('Eliminar certificación:', id);
    handleCloseMenu();
  };

  const handleDownload = () => {
    if (certification?.certificate_document) {
      window.open(certification.certificate_document, '_blank');
    }
    handleCloseMenu();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !certification) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Alert severity="error">Error al cargar la información de la certificación</Alert>
      </Box>
    );
  }

  const getStatusInfo = () => {
    if (!certification.is_valid) {
      return { label: certification.status_display || 'Inválida', color: 'error', icon: <ErrorIcon /> };
    }
    if (certification.is_expired) {
      return { label: 'Vencida', color: 'error', icon: <ErrorIcon /> };
    }
    if (certification.is_expiring_soon) {
      return { label: 'Por Vencer', color: 'warning', icon: <WarningIcon /> };
    }
    return { label: 'Vigente', color: 'success', icon: <CheckCircleIcon /> };
  };

  const statusInfo = getStatusInfo();

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4, lg: 5 }, width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
          size={isMobile ? 'small' : 'medium'}
        >
          Volver
        </Button>
        <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, flex: 1 }}>
          Detalle de Certificación
        </Typography>
      </Box>

      {/* Header Card con estado */}
      <Paper
        elevation={3}
        sx={{
          bgcolor: theme.palette.primary.main,
          color: 'white',
          p: { xs: 3, sm: 4, md: 5 },
          mb: 4,
          borderRadius: 2,
          position: 'relative',
        }}
      >
        {/* Menu Button */}
        <IconButton
          onClick={handleOpenMenu}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <MoreVertIcon />
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Editar</ListItemText>
          </MenuItem>
          {certification.certificate_document && (
            <MenuItem onClick={handleDownload}>
              <ListItemIcon>
                <DownloadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Descargar Documento</ListItemText>
            </MenuItem>
          )}
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Eliminar</ListItemText>
          </MenuItem>
        </Menu>

        <Grid container spacing={4} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: { xs: 100, sm: 120, md: 140 },
                height: { xs: 100, sm: 120, md: 140 },
                bgcolor: statusInfo.color === 'success' ? 'rgba(76, 175, 80, 0.9)' : statusInfo.color === 'warning' ? 'rgba(255, 152, 0, 0.9)' : 'rgba(244, 67, 54, 0.9)',
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
              }}
            >
              <AssignmentIcon sx={{ fontSize: { xs: '3rem', sm: '3.5rem', md: '4rem' } }} />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, mb: 1 }}>
              {certification.certification_type_name}
            </Typography>
            <Typography variant={isMobile ? 'body2' : 'body1'} sx={{ mb: 2, opacity: 0.9 }}>
              {certification.personnel_name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={statusInfo.label}
                icon={statusInfo.icon}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  bgcolor: statusInfo.color === 'success' ? 'rgba(76, 175, 80, 0.9)' : statusInfo.color === 'warning' ? 'rgba(255, 152, 0, 0.9)' : 'rgba(244, 67, 54, 0.9)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
              {certification.certification_number && (
                <Chip
                  label={`#${certification.certification_number}`}
                  icon={<BadgeIcon />}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Información Principal */}
      <Grid container spacing={3}>
        {/* Información del Empleado */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                <PersonIcon color="primary" />
                Información del Empleado
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <InfoItem icon={<PersonIcon />} label="Nombre Completo" value={certification.personnel_name} />
                </Grid>
                <Grid item xs={12}>
                  <InfoItem icon={<BadgeIcon />} label="Código" value={certification.personnel_code} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Información de la Certificación */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                <AssignmentIcon color="primary" />
                Detalles de la Certificación
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <InfoItem icon={<AssignmentIcon />} label="Tipo" value={certification.certification_type_name} />
                </Grid>
                {certification.certification_number && (
                  <Grid item xs={12}>
                    <InfoItem icon={<BadgeIcon />} label="Número" value={certification.certification_number} />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <InfoItem icon={<BusinessIcon />} label="Autoridad Emisora" value={certification.issuing_authority || 'N/A'} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Fechas */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                <CalendarTodayIcon color="primary" />
                Fechas Importantes
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <InfoItem
                    icon={<CalendarTodayIcon />}
                    label="Fecha de Emisión"
                    value={format(new Date(certification.issue_date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <InfoItem
                    icon={<CalendarTodayIcon />}
                    label="Fecha de Vencimiento"
                    value={format(new Date(certification.expiration_date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  />
                </Grid>
                {certification.days_until_expiration !== null && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: certification.is_expiring_soon ? 'warning.lighter' : certification.is_expired ? 'error.lighter' : 'success.lighter',
                        borderRadius: 1,
                        border: `2px solid ${
                          certification.is_expiring_soon
                            ? theme.palette.warning.main
                            : certification.is_expired
                            ? theme.palette.error.main
                            : theme.palette.success.main
                        }`,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 700,
                          color: certification.is_expiring_soon ? 'warning.dark' : certification.is_expired ? 'error.dark' : 'success.dark',
                          textAlign: 'center',
                        }}
                      >
                        {certification.days_until_expiration > 0
                          ? `⏰ Vence en ${certification.days_until_expiration} días`
                          : `❌ Venció hace ${Math.abs(certification.days_until_expiration)} días`}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Documento y Notas */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                <DescriptionIcon color="primary" />
                Documento y Notas
              </Typography>
              <Grid container spacing={2}>
                {certification.certificate_document && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <DescriptionIcon color="primary" />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Documento Adjunto
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => window.open(certification.certificate_document, '_blank')}
                          sx={{ mt: 1 }}
                        >
                          Ver Documento
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {certification.notes && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                        Notas:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {certification.notes}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {!certification.certificate_document && !certification.notes && (
                  <Grid item xs={12}>
                    <Alert severity="info">No hay documentos ni notas adjuntas</Alert>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Metadatos */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Información del Sistema
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Creado por
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {certification.created_by_name || 'Sistema'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Fecha de Creación
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {format(new Date(certification.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Última Actualización
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {format(new Date(certification.updated_at), "dd/MM/yyyy HH:mm", { locale: es })}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Estado
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {certification.is_valid ? 'Válida' : 'Inválida'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Helper Component
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ color: 'action.active' }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
};
