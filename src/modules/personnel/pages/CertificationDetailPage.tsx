import React, { useState, useCallback } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
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
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DrawIcon from '@mui/icons-material/Draw';

import { QRCodeSVG } from 'qrcode.react';
import {
  useGetCertificationQuery,
  useMarkCertificationInProgressMutation,
  useMarkCertificationNotCompletedMutation,
} from '../services/personnelApi';
import { downloadCertificatePdf } from '../utils/certificationPdf';
import { useAppSelector } from '../../../store';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export const CertificationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const authToken = useAppSelector((state) => state.auth.token);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notCompletedDialogOpen, setNotCompletedDialogOpen] = useState(false);
  const [notCompletedReason, setNotCompletedReason] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const { data: certification, isLoading, error } = useGetCertificationQuery(Number(id));
  const [markInProgress, { isLoading: markingProgress }] = useMarkCertificationInProgressMutation();
  const [markNotCompleted, { isLoading: markingNotCompleted }] = useMarkCertificationNotCompletedMutation();

  const handleBack = () => navigate(-1);
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleDownload = () => {
    if (certification?.certificate_document_url) window.open(certification.certificate_document_url, '_blank');
    handleCloseMenu();
  };

  const handleExportPdf = useCallback(async () => {
    if (!certification) return;
    handleCloseMenu();
    setPdfLoading(true);
    try {
      await downloadCertificatePdf(certification, authToken ?? undefined);
    } catch {
      toast.error('Error al generar el PDF');
    } finally {
      setPdfLoading(false);
    }
  }, [certification]);

  const handleMarkInProgress = async () => {
    try {
      await markInProgress(Number(id)).unwrap();
      toast.success('Certificación marcada como En Progreso');
    } catch {
      toast.error('Error al actualizar el estado');
    }
  };

  const handleNotCompleted = async () => {
    if (!notCompletedReason.trim()) {
      toast.error('Debe indicar el motivo');
      return;
    }
    try {
      await markNotCompleted({ id: Number(id), reason: notCompletedReason }).unwrap();
      toast.success('Certificación marcada como No Completó');
      setNotCompletedDialogOpen(false);
      setNotCompletedReason('');
    } catch {
      toast.error('Error al actualizar el estado');
    }
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
    switch (certification.status) {
      case 'COMPLETED':
        return { label: 'Completado', color: 'success' as const, icon: <CheckCircleIcon /> };
      case 'IN_PROGRESS':
        return { label: 'En Progreso', color: 'primary' as const, icon: <PlayCircleIcon /> };
      case 'NOT_COMPLETED':
        return { label: 'No Completó', color: 'error' as const, icon: <CancelIcon /> };
      case 'PENDING':
      default:
        return { label: 'Pendiente', color: 'default' as const, icon: <HourglassEmptyIcon /> };
    }
  };

  const statusInfo = getStatusInfo();
  const canAct = certification.status === 'PENDING' || certification.status === 'IN_PROGRESS';

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4, lg: 5 }, width: !isMobile ? '80%' : '100%', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <IconButton onClick={handleBack} size={isMobile ? 'small' : 'medium'}>
          <NavigateBeforeIcon fontSize={isMobile ? 'medium' : 'large'} />
        </IconButton>
        <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, flex: 1 }}>
          Detalle de Certificación
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={pdfLoading ? <CircularProgress size={14} color="inherit" /> : <PictureAsPdfIcon />}
          onClick={handleExportPdf}
          disabled={pdfLoading}
          color="error"
        >
          {pdfLoading ? 'Generando...' : 'Exportar PDF'}
        </Button>
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
          <Grid item xs={12} md={8}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Avatar
                  sx={{
                    width: { xs: 80, sm: 100, md: 120 },
                    height: { xs: 80, sm: 100, md: 120 },
                    bgcolor:
                      statusInfo.color === 'success'
                        ? 'rgba(76,175,80,0.9)'
                        : statusInfo.color === 'primary'
                        ? 'rgba(33,150,243,0.9)'
                        : statusInfo.color === 'error'
                        ? 'rgba(244,67,54,0.9)'
                        : 'rgba(158,158,158,0.9)',
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
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                  {certification.certification_number && (
                    <Chip
                      label={`#${certification.certification_number}`}
                      icon={<BadgeIcon />}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              <IconButton
                onClick={handleOpenMenu}
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
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
                  imageSettings={{ src: '/logo-qr.png', height: 20, width: 20, excavate: true }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Botones de acción según estado */}
      {canAct && (
        <Card elevation={2} sx={{ mb: 3, borderLeft: `4px solid ${theme.palette.primary.main}` }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Acciones disponibles
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {certification.status === 'PENDING' && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<PlayCircleIcon />}
                  onClick={handleMarkInProgress}
                  disabled={markingProgress}
                >
                  Marcar En Progreso
                </Button>
              )}
              <Button
                variant="contained"
                color="success"
                startIcon={<DrawIcon />}
                onClick={() => navigate(`/personnel/certifications/${id}/complete`)}
              >
                Completar y Firmar
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => setNotCompletedDialogOpen(true)}
              >
                No Completó
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Resultado: No Completó */}
      {certification.status === 'NOT_COMPLETED' && certification.non_completion_reason && (
        <Alert severity="warning" sx={{ mb: 3 }} icon={<WarningIcon />}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>Motivo de no completado:</Typography>
          <Typography variant="body2">{certification.non_completion_reason}</Typography>
        </Alert>
      )}

      {/* Resultado: Completado con firma */}
      {certification.status === 'COMPLETED' && (
        <Card elevation={2} sx={{ mb: 3, borderLeft: `4px solid ${theme.palette.success.main}` }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CheckCircleIcon color="success" />
              <Typography variant="subtitle1" fontWeight={600}>Completado exitosamente</Typography>
            </Box>
            <Grid container spacing={2}>
              {certification.completed_at && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Fecha de completado</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {format(new Date(certification.completed_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                  </Typography>
                </Grid>
              )}
              {certification.completed_by_name && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Registrado por</Typography>
                  <Typography variant="body2" fontWeight={500}>{certification.completed_by_name}</Typography>
                </Grid>
              )}
              {certification.completion_notes && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" display="block">Notas</Typography>
                  <Typography variant="body2">{certification.completion_notes}</Typography>
                </Grid>
              )}
              {certification.signature_url && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    Firma del participante
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1, display: 'inline-block', borderRadius: 2 }}>
                    <img
                      src={certification.signature_url}
                      alt="Firma del participante"
                      style={{ maxWidth: 300, maxHeight: 120, display: 'block' }}
                    />
                  </Paper>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Información Principal */}
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
                <InfoItem icon={<PersonIcon />} label="Nombre Completo" value={certification.personnel_name || 'N/A'} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem icon={<BadgeIcon />} label="Código de Empleado" value={certification.personnel_code || 'N/A'} />
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
                <InfoItem icon={<AssignmentIcon />} label="Tipo de Certificación" value={certification.certification_type_name || 'N/A'} />
              </Grid>
              {certification.certification_number && (
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem icon={<BadgeIcon />} label="Número de Certificación" value={certification.certification_number} />
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={4}>
                <InfoItem icon={<BusinessIcon />} label="Instructor / Autoridad Emisora" value={certification.issuing_authority || 'N/A'} />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Fechas Importantes */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
              <CalendarTodayIcon color="secondary" />
              Fechas
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  icon={<CalendarTodayIcon />}
                  label="Fecha de Inicio / Emisión"
                  value={format(new Date(certification.issue_date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem
                  icon={<CalendarTodayIcon />}
                  label="Fecha de Fin / Vencimiento"
                  value={format(new Date(certification.expiration_date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                />
              </Grid>
            </Grid>
          </Box>

          {(certification.certificate_document_url || certification.notes) && (
            <>
              <Divider sx={{ my: 4 }} />
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                  <DescriptionIcon color="secondary" />
                  Documento y Notas
                </Typography>
                <Grid container spacing={3}>
                  {certification.certificate_document_url && (
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
                            onClick={() => window.open(certification.certificate_document_url!, '_blank')}
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
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 1 }}>
                        Notas:
                      </Typography>
                      <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body2">{certification.notes}</Typography>
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
                <InfoItem icon={<PersonIcon />} label="Creado por" value={certification.created_by_name || 'Sistema'} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoItem
                  icon={<CalendarTodayIcon />}
                  label="Fecha de Creación"
                  value={certification.created_at ? format(new Date(certification.created_at), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoItem
                  icon={<CalendarTodayIcon />}
                  label="Última Actualización"
                  value={certification.updated_at ? format(new Date(certification.updated_at), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'}
                />
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleExportPdf} disabled={pdfLoading}>
          <ListItemIcon>
            {pdfLoading
              ? <CircularProgress size={16} />
              : <PictureAsPdfIcon fontSize="small" sx={{ color: 'error.main' }} />}
          </ListItemIcon>
          <ListItemText>{pdfLoading ? 'Generando PDF...' : 'Exportar PDF'}</ListItemText>
        </MenuItem>
        {certification.certificate_document_url && (
          <MenuItem onClick={handleDownload}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" sx={{ color: 'info.main' }} />
            </ListItemIcon>
            <ListItemText>Descargar Documento</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => { handleCloseMenu(); navigate(`/personnel/certifications`); }}>
          <ListItemIcon>
            <ArrowBackIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver todas las certificaciones</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialog: No Completó */}
      <Dialog open={notCompletedDialogOpen} onClose={() => setNotCompletedDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Marcar como No Completó</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Indica el motivo por el cual el participante no completó la certificación. Esta acción quedará registrada.
          </DialogContentText>
          <TextField
            autoFocus
            label="Motivo *"
            multiline
            rows={4}
            fullWidth
            value={notCompletedReason}
            onChange={(e) => setNotCompletedReason(e.target.value)}
            placeholder="Ej: El participante no se presentó al entrenamiento..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotCompletedDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleNotCompleted}
            variant="contained"
            color="error"
            disabled={!notCompletedReason.trim() || markingNotCompleted}
          >
            {markingNotCompleted ? 'Guardando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
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
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 2.5, px: 1 }}>
        <Box sx={{ color: 'secondary.main', mt: 0.5 }}>{icon}</Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}
          >
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
