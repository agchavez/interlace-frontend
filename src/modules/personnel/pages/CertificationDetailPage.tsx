import React from 'react';
import {
  Box,
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
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

import { QRCodeSVG } from 'qrcode.react';
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
    <Box sx={{ p: { xs: 2, sm: 3, md: 4, lg: 5 }, width: !isMobile ? '80%' : '100%', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <IconButton
          onClick={handleBack}
          size={isMobile ? 'small' : 'medium'}
        >
          <NavigateBeforeIcon fontSize={isMobile ? 'medium' : 'large'} />
        </IconButton>
        <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, flex: 1 }}>
          Detalle de Certificación
        </Typography>
      </Box>

      {/* Header Card con estado */}
      <Paper
        elevation={3}
        sx={{
          bgcolor: theme.palette.secondary.main,
          color: 'white',
          p: { xs: 2, sm: 3, md: 4 },
          mb: 3,
          borderRadius: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center" justifyContent="space-between">
          {/* Lado Izquierdo: Avatar + Información */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Avatar
                  sx={{
                    width: { xs: 80, sm: 100, md: 120 },
                    height: { xs: 80, sm: 100, md: 120 },
                    bgcolor: statusInfo.color === 'success' ? 'rgba(76, 175, 80, 0.9)' : statusInfo.color === 'warning' ? 'rgba(255, 152, 0, 0.9)' : 'rgba(244, 67, 54, 0.9)',
                  }}
                >
                  <AssignmentIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' } }} />
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 700, mb: 0.5 }}>
                  {certification.certification_type_name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1.5, opacity: 0.9 }}>
                  {certification.personnel_name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={statusInfo.label}
                    icon={statusInfo.icon}
                    size="small"
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
                      size="small"
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
          </Grid>

          {/* Lado Derecho: QR + Menú */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
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
                  value={`${import.meta.env.VITE_JS_FRONTEND_URL}/personnel/certifications/${certification.id}`}
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

      {/* Información Principal - Todo en una sola Card */}
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          {/* Información del Empleado */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
              <PersonIcon color="secondary" />
              Información del Empleado
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <InfoItem icon={<PersonIcon />} label="Nombre Completo" value={certification.personnel_name} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem icon={<BadgeIcon />} label="Código de Empleado" value={certification.personnel_code} />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Detalles de la Certificación */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
              <AssignmentIcon color="secondary" />
              Detalles de la Certificación
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <InfoItem icon={<AssignmentIcon />} label="Tipo de Certificación" value={certification.certification_type_name} />
              </Grid>
              {certification.certification_number && (
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem icon={<BadgeIcon />} label="Número de Certificación" value={certification.certification_number} />
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={4}>
                <InfoItem icon={<BusinessIcon />} label="Autoridad Emisora" value={certification.issuing_authority || 'N/A'} />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Fechas Importantes */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
              <CalendarTodayIcon color="secondary" />
              Fechas Importantes
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  icon={<CalendarTodayIcon />}
                  label="Fecha de Emisión"
                  value={format(new Date(certification.issue_date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  icon={<CalendarTodayIcon />}
                  label="Fecha de Vencimiento"
                  value={format(new Date(certification.expiration_date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                />
              </Grid>
            </Grid>
            {certification.days_until_expiration !== null && (
              <Box sx={{ mt: 3 }}>
                <Box
                  sx={{
                    p: 1.5,
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
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: certification.is_expiring_soon ? 'warning.dark' : certification.is_expired ? 'error.dark' : 'success.dark',
                    }}
                  >
                    {certification.days_until_expiration > 0
                      ? `⏰ Vence en ${certification.days_until_expiration} días`
                      : `❌ Venció hace ${Math.abs(certification.days_until_expiration)} días`}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {(certification.certificate_document || certification.notes) && (
            <>
              <Divider sx={{ my: 4 }} />

              {/* Documento y Notas */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                  <DescriptionIcon color="secondary" />
                  Documento y Notas
                </Typography>
                <Grid container spacing={3}>
                  {certification.certificate_document && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <DescriptionIcon color="secondary" fontSize="small" />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                            Documento Adjunto
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => window.open(certification.certificate_document, '_blank')}
                            sx={{ mt: 0.5 }}
                          >
                            Ver Documento
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                  {certification.notes && (
                    <Grid item xs={12}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 1 }}>
                          Notas:
                        </Typography>
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: 'background.default',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Typography variant="body2">
                            {certification.notes}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </>
          )}

          <Divider sx={{ my: 4 }} />

          {/* Información del Sistema */}
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Información del Sistema
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <InfoItem
                  icon={<PersonIcon />}
                  label="Creado por"
                  value={certification.created_by_name || 'Sistema'}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoItem
                  icon={<CalendarTodayIcon />}
                  label="Fecha de Creación"
                  value={format(new Date(certification.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoItem
                  icon={<CalendarTodayIcon />}
                  label="Última Actualización"
                  value={format(new Date(certification.updated_at), "dd/MM/yyyy HH:mm", { locale: es })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoItem
                  icon={<CheckCircleIcon />}
                  label="Estado"
                  value={certification.is_valid ? 'Válida' : 'Inválida'}
                />
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" color="secondary" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        {certification.certificate_document && (
          <MenuItem onClick={handleDownload}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" sx={{ color: 'info.main' }} />
            </ListItemIcon>
            <ListItemText>Descargar Documento</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
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
