/**
 * Página de detalle de un token - Diseño mejorado
 */
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  Avatar,
  IconButton,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  QrCode2 as QrIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon,
  EventNote as CalendarIcon,
  ExitToApp as ExitIcon,
  Checkroom as UniformIcon,
  SwapHoriz as SwapIcon,
  TrendingUp as TrendingIcon,
  MoreTime as OvertimeIcon,
  ContentCopy as CopyIcon,
  PictureAsPdf as PdfIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Badge as BadgeIcon,
  LocationOn as LocationIcon,
  Notes as NotesIcon,
  Verified as VerifiedIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import {
  useGetTokenQuery,
  useApproveLevel1Mutation,
  useApproveLevel2Mutation,
  useApproveLevel3Mutation,
  useRejectTokenMutation,
  useCancelTokenMutation,
} from '../services/tokenApi';
import {
  TokenStatus,
  TokenStatusLabels,
  TokenTypeLabels,
  TokenType,
  PermitHourReasonLabels,
  PermitHourReason,
  PermitDayReasonLabels,
  PermitDayReason,
  DateSelectionTypeLabels,
  DateSelectionType,
  UniformItemTypeLabels,
  UniformItemType,
  UniformSizeLabels,
  UniformSize,
} from '../interfaces/token';
import { useAppSelector } from '../../../store';
import { ApprovalDialog } from '../components/ApprovalDialog';

// Helper component for displaying info items
const InfoItem = ({
  icon,
  label,
  value,
  color = 'primary',
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1 }}>
    <Box sx={{ color: `${color}.main`, mt: 0.3 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value || '-'}
      </Typography>
    </Box>
  </Box>
);

// Status chip colors
const statusChipColors: Record<TokenStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [TokenStatus.DRAFT]: 'default',
  [TokenStatus.PENDING_L1]: 'warning',
  [TokenStatus.PENDING_L2]: 'warning',
  [TokenStatus.PENDING_L3]: 'warning',
  [TokenStatus.APPROVED]: 'success',
  [TokenStatus.USED]: 'info',
  [TokenStatus.EXPIRED]: 'default',
  [TokenStatus.CANCELLED]: 'default',
  [TokenStatus.REJECTED]: 'error',
};

// Token type icons
const tokenTypeIcons: Record<TokenType, React.ReactNode> = {
  [TokenType.PERMIT_HOUR]: <TimeIcon />,
  [TokenType.PERMIT_DAY]: <CalendarIcon />,
  [TokenType.EXIT_PASS]: <ExitIcon />,
  [TokenType.UNIFORM_DELIVERY]: <UniformIcon />,
  [TokenType.SUBSTITUTION]: <SwapIcon />,
  [TokenType.RATE_CHANGE]: <TrendingIcon />,
  [TokenType.OVERTIME]: <OvertimeIcon />,
  [TokenType.SHIFT_CHANGE]: <ScheduleIcon />,
};

export const TokenDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useAppSelector((state) => state.auth.user);

  const { data: token, isLoading, error } = useGetTokenQuery(Number(id));
  const [approveL1, { isLoading: approvingL1 }] = useApproveLevel1Mutation();
  const [approveL2, { isLoading: approvingL2 }] = useApproveLevel2Mutation();
  const [approveL3, { isLoading: approvingL3 }] = useApproveLevel3Mutation();
  const [rejectToken, { isLoading: rejecting }] = useRejectTokenMutation();
  const [cancelToken, { isLoading: cancelling }] = useCancelTokenMutation();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [isPrintingReceipt, setIsPrintingReceipt] = useState(false);

  // Store token from auth for PDF fetch
  const authToken = useAppSelector((state) => state.auth.token);

  // Build pdfUrl - need id which might be undefined during loading
  const pdfUrl = id ? `${import.meta.env.VITE_JS_APP_API_URL}/api/tokens/${id}/download_pdf/` : '';
  const receiptUrl = id ? `${import.meta.env.VITE_JS_APP_API_URL}/api/tokens/${id}/print_receipt/` : '';

  // Fetch PDF with authentication - MUST be before any conditional returns
  const fetchPdf = useCallback(async () => {
    if (!authToken || !pdfUrl) return;
    setPdfLoading(true);
    try {
      const response = await fetch(pdfUrl, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error al cargar el PDF');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
    } catch (error) {
      toast.error('No se pudo cargar el PDF');
      console.error(error);
    } finally {
      setPdfLoading(false);
    }
  }, [pdfUrl, authToken]);

  // Cleanup blob URL on unmount - MUST be before any conditional returns
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Cargando token...
        </Typography>
      </Container>
    );
  }

  if (error || !token) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">No se pudo cargar el token</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/tokens')} sx={{ mt: 2 }}>
          Volver al listado
        </Button>
      </Container>
    );
  }

  const tokenIcon = tokenTypeIcons[token.token_type as TokenType] || <QrIcon />;
  const qrUrl = `${import.meta.env.VITE_JS_FRONTEND_URL}/public/token/${token.token_code}`;

  const isPending = [TokenStatus.PENDING_L1, TokenStatus.PENDING_L2, TokenStatus.PENDING_L3].includes(
    token.status as TokenStatus
  );

  // Use backend-computed approval permission
  const canApprove = token.can_user_approve;

  // Check if user can complete uniform delivery
  const canCompleteDelivery = token.can_user_complete_delivery;

  const handleApprove = async (data: { notes: string; signature?: Blob; photo?: File }) => {
    const level = token.current_approval_level;
    try {
      const mutations = { 1: approveL1, 2: approveL2, 3: approveL3 };
      const mutation = mutations[level as 1 | 2 | 3];

      // Use FormData if there are attachments
      if (data.signature || data.photo) {
        const formData = new FormData();
        if (data.notes) {
          formData.append('notes', data.notes);
        }
        if (data.signature) {
          formData.append('signature', data.signature, 'signature.png');
        }
        if (data.photo) {
          formData.append('photo', data.photo);
        }
        await mutation({ id: token.id, payload: formData }).unwrap();
      } else {
        await mutation({ id: token.id, payload: { notes: data.notes } }).unwrap();
      }

      toast.success('Token aprobado exitosamente');
      setApprovalDialogOpen(false);
    } catch {
      toast.error('Error al aprobar el token');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Debe proporcionar un motivo de rechazo');
      return;
    }
    try {
      await rejectToken({ id: token.id, payload: { reason: rejectReason } }).unwrap();
      toast.success('Token rechazado');
      setRejectDialogOpen(false);
    } catch {
      toast.error('Error al rechazar el token');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(token.display_number);
    toast.success('Código copiado');
  };

  const handleOpenPdf = async () => {
    setPdfDialogOpen(true);
    if (!pdfBlobUrl) {
      await fetchPdf();
    }
  };

  const handleDownloadPdf = async () => {
    if (pdfBlobUrl) {
      // Use existing blob URL
      const link = document.createElement('a');
      link.href = pdfBlobUrl;
      link.download = `token_${token.display_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fetch and download
      try {
        const response = await fetch(pdfUrl, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `token_${token.display_number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {
        toast.error('Error al descargar el PDF');
      }
    }
  };

  const handlePrintPdf = () => {
    const iframe = document.getElementById('pdf-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.contentWindow?.print();
    }
  };

  // Handler for printing receipt (thermal printer format)
  const handlePrintReceipt = async () => {
    if (!receiptUrl || !authToken) return;
    setIsPrintingReceipt(true);
    try {
      const response = await fetch(receiptUrl, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al generar el recibo');
      }
      // El backend retorna HTML — lo inyectamos en un iframe y lo imprimimos
      // El CSS @page { size: 80mm auto } del HTML controla el tamaño en la impresora térmica
      const html = await response.text();
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '80mm';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
      }
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 2000);
        }, 300);
      };
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al generar el recibo');
    } finally {
      setIsPrintingReceipt(false);
    }
  };

  // Check if receipt is available (only for APPROVED or USED status)
  const isReceiptAvailable = token?.status === TokenStatus.APPROVED || token?.status === TokenStatus.USED;

  const formatDateTime = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('es-HN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-HN', { dateStyle: 'long' });
  };

  return (
    <Box sx={{ width: { xs: '100%', md: '90%', lg: '85%' }, mx: 'auto', py: 3, px: { xs: 2, md: 3 } }}>
      {/* Header Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/tokens')} sx={{ bgcolor: 'grey.100' }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={600}>
          Detalle del Token
        </Typography>
      </Box>

      {/* Main Header Card */}
      <Card
        elevation={3}
        sx={{
          mb: 3,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'secondary.main',
          color: 'white',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={3} alignItems="center">
            {/* Left: Token Info */}
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  sx={{
                    width: { xs: 56, md: 72 },
                    height: { xs: 56, md: 72 },
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                  }}
                >
                  {tokenIcon}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                    {token.display_number}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {TokenTypeLabels[token.token_type as TokenType]}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                <Chip
                  icon={<VerifiedIcon />}
                  label={TokenStatusLabels[token.status as TokenStatus]}
                  color={statusChipColors[token.status as TokenStatus]}
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  icon={<PersonIcon />}
                  label={token.personnel?.full_name}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  icon={<BusinessIcon />}
                  label={token.distributor_center?.name}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </Grid>

            {/* Right: QR Code */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'center', md: 'flex-end' },
                }}
              >
                <Paper
                  elevation={4}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'white',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.02)' },
                  }}
                  onClick={() => setQrDialogOpen(true)}
                >
                  <QRCodeSVG
                    value={qrUrl}
                    size={isMobile ? 120 : 140}
                    level="H"
                    imageSettings={{
                      src: "/logo-qr.png",
                      height: isMobile ? 28 : 32,
                      width: isMobile ? 28 : 32,
                      excavate: true,
                    }}
                  />
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Beneficiary Info */}
          <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="secondary" />
                Beneficiario {token.exit_pass_detail?.is_external && '(Persona Externa)'}
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoItem
                    icon={<PersonIcon fontSize="small" />}
                    label="Nombre Completo"
                    value={token.personnel?.full_name ?? token.exit_pass_detail?.external_person?.name}
                    color="secondary"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem
                    icon={<BadgeIcon fontSize="small" />}
                    label={token.exit_pass_detail?.is_external ? 'Identificación' : 'Código de Empleado'}
                    value={token.personnel?.employee_code ?? token.exit_pass_detail?.external_person?.identification}
                    color="secondary"
                  />
                </Grid>
                {token.exit_pass_detail?.is_external && token.exit_pass_detail?.external_person?.company && (
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<BusinessIcon fontSize="small" />}
                      label="Empresa"
                      value={token.exit_pass_detail.external_person.company}
                      color="secondary"
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <InfoItem
                    icon={<BusinessIcon fontSize="small" />}
                    label="Centro de Distribución"
                    value={token.distributor_center?.name}
                    color="secondary"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem
                    icon={<PersonIcon fontSize="small" />}
                    label="Solicitado Por"
                    value={token.requested_by_name}
                    color="secondary"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Validity Period */}
          <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon color="secondary" />
                Período de Validez
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, borderColor: 'success.light' }}>
                    <Typography variant="caption" color="text.secondary">Válido Desde</Typography>
                    <Typography variant="h6" fontWeight={600} color="success.main">
                      {formatDate(token.valid_from)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(token.valid_from).toLocaleTimeString('es-HN', { timeStyle: 'short' })}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, borderColor: 'error.light' }}>
                    <Typography variant="caption" color="text.secondary">Válido Hasta</Typography>
                    <Typography variant="h6" fontWeight={600} color="error.main">
                      {formatDate(token.valid_until)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(token.valid_until).toLocaleTimeString('es-HN', { timeStyle: 'short' })}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {token.requester_notes && (
                <Box sx={{ mt: 3 }}>
                  <InfoItem
                    icon={<NotesIcon fontSize="small" />}
                    label="Notas"
                    value={token.requester_notes}
                    color="secondary"
                  />
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Token Type Specific Details */}
          {token.token_type === TokenType.PERMIT_HOUR && token.permit_hour_detail && (
            <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimeIcon color="secondary" />
                  Detalles del Permiso por Hora
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <InfoItem
                      icon={<NotesIcon fontSize="small" />}
                      label="Motivo"
                      value={PermitHourReasonLabels[token.permit_hour_detail.reason_type as PermitHourReason]}
                      color="secondary"
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <InfoItem
                      icon={<TimeIcon fontSize="small" />}
                      label="Horas"
                      value={`${token.permit_hour_detail.hours_requested}h`}
                      color="secondary"
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <InfoItem
                      icon={<TimeIcon fontSize="small" />}
                      label="Salida"
                      value={token.permit_hour_detail.exit_time}
                      color="secondary"
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <InfoItem
                      icon={<TimeIcon fontSize="small" />}
                      label="Retorno"
                      value={token.permit_hour_detail.expected_return_time}
                      color="secondary"
                    />
                  </Grid>
                  {token.permit_hour_detail.destination && (
                    <Grid item xs={12}>
                      <InfoItem
                        icon={<LocationIcon fontSize="small" />}
                        label="Destino"
                        value={token.permit_hour_detail.destination}
                        color="secondary"
                      />
                    </Grid>
                  )}
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={token.permit_hour_detail.with_pay ? 'Con Goce de Sueldo' : 'Sin Goce de Sueldo'}
                    color={token.permit_hour_detail.with_pay ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          )}

          {token.token_type === TokenType.PERMIT_DAY && token.permit_day_detail && (
            <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon color="secondary" />
                  Detalles del Permiso por Día
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <InfoItem
                      icon={<NotesIcon fontSize="small" />}
                      label="Tipo de Selección"
                      value={DateSelectionTypeLabels[token.permit_day_detail.date_selection_type as DateSelectionType]}
                      color="secondary"
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <InfoItem
                      icon={<NotesIcon fontSize="small" />}
                      label="Motivo"
                      value={PermitDayReasonLabels[token.permit_day_detail.reason as PermitDayReason]}
                      color="secondary"
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <InfoItem
                      icon={<CalendarIcon fontSize="small" />}
                      label="Total de Días"
                      value={token.permit_day_detail.total_days}
                      color="secondary"
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={token.permit_day_detail.with_pay ? 'Con Goce de Sueldo' : 'Sin Goce de Sueldo'}
                    color={token.permit_day_detail.with_pay ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          )}

          {token.token_type === TokenType.EXIT_PASS && token.exit_pass_detail && (
            <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ExitIcon color="secondary" />
                  Detalles del Pase de Salida
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem
                      icon={<LocationIcon fontSize="small" />}
                      label="Destino"
                      value={token.exit_pass_detail.destination}
                      color="secondary"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Valor Total</Typography>
                      <Typography variant="h5" fontWeight={700} color="secondary.main">
                        L. {token.exit_pass_detail.total_value?.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Paper>
                  </Grid>
                  {token.exit_pass_detail.purpose && (
                    <Grid item xs={12}>
                      <InfoItem
                        icon={<NotesIcon fontSize="small" />}
                        label="Propósito"
                        value={token.exit_pass_detail.purpose}
                        color="secondary"
                      />
                    </Grid>
                  )}
                </Grid>

                {token.exit_pass_detail.items && token.exit_pass_detail.items.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                      Artículos
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell>Descripción</TableCell>
                            <TableCell align="right">Cantidad</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {token.exit_pass_detail.items.map((item) => (
                            <TableRow key={item.id} hover>
                              <TableCell>{item.material_name || item.product_name || item.custom_description}</TableCell>
                              <TableCell align="right">{item.quantity}</TableCell>
                              <TableCell align="right">L. {item.total_value?.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {token.token_type === TokenType.UNIFORM_DELIVERY && token.uniform_delivery_detail && (
            <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <UniformIcon color="secondary" />
                  Detalles de Entrega de Uniforme
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={token.uniform_delivery_detail.is_delivered ? 'Entregado' : 'Pendiente de Entrega'}
                    color={token.uniform_delivery_detail.is_delivered ? 'success' : 'warning'}
                  />
                </Box>

                {token.uniform_delivery_detail.items && token.uniform_delivery_detail.items.length > 0 && (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell>Tipo</TableCell>
                          <TableCell>Talla</TableCell>
                          <TableCell>Color</TableCell>
                          <TableCell align="right">Cantidad</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {token.uniform_delivery_detail.items.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell>{UniformItemTypeLabels[item.item_type as UniformItemType]}</TableCell>
                            <TableCell>{UniformSizeLabels[item.size as UniformSize]}</TableCell>
                            <TableCell>{item.color || '-'}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Evidencia de Entrega */}
                {token.uniform_delivery_detail.is_delivered && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VerifiedIcon color="success" fontSize="small" />
                      Evidencia de Entrega
                    </Typography>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Entregado por</Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {token.uniform_delivery_detail.delivered_by_name || 'No disponible'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Fecha de Entrega</Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {token.uniform_delivery_detail.delivered_at
                            ? new Date(token.uniform_delivery_detail.delivered_at).toLocaleString('es-HN')
                            : 'No disponible'}
                        </Typography>
                      </Grid>
                      {token.uniform_delivery_detail.delivery_notes && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">Notas</Typography>
                          <Typography variant="body2">{token.uniform_delivery_detail.delivery_notes}</Typography>
                        </Grid>
                      )}
                    </Grid>

                    {/* Fotos y Firma */}
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      {token.uniform_delivery_detail.signature_image && (
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                            Firma del Beneficiario
                          </Typography>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              bgcolor: 'grey.50',
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'grey.100' },
                            }}
                            onClick={() => token.uniform_delivery_detail?.signature_image && window.open(token.uniform_delivery_detail.signature_image, '_blank')}
                          >
                            <Box
                              component="img"
                              src={token.uniform_delivery_detail.signature_image}
                              alt="Firma"
                              sx={{
                                width: '100%',
                                height: 100,
                                objectFit: 'contain',
                                borderRadius: 1,
                              }}
                            />
                          </Paper>
                        </Grid>
                      )}
                      {token.uniform_delivery_detail.delivery_photo_1 && (
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                            Foto 1
                          </Typography>
                          <Paper
                            variant="outlined"
                            sx={{
                              borderRadius: 2,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              '&:hover': { opacity: 0.9 },
                            }}
                            onClick={() => token.uniform_delivery_detail?.delivery_photo_1 && window.open(token.uniform_delivery_detail.delivery_photo_1, '_blank')}
                          >
                            <Box
                              component="img"
                              src={token.uniform_delivery_detail.delivery_photo_1}
                              alt="Foto 1"
                              sx={{
                                width: '100%',
                                height: 100,
                                objectFit: 'cover',
                              }}
                            />
                          </Paper>
                        </Grid>
                      )}
                      {token.uniform_delivery_detail.delivery_photo_2 && (
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                            Foto 2
                          </Typography>
                          <Paper
                            variant="outlined"
                            sx={{
                              borderRadius: 2,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              '&:hover': { opacity: 0.9 },
                            }}
                            onClick={() => token.uniform_delivery_detail?.delivery_photo_2 && window.open(token.uniform_delivery_detail.delivery_photo_2, '_blank')}
                          >
                            <Box
                              component="img"
                              src={token.uniform_delivery_detail.delivery_photo_2}
                              alt="Foto 2"
                              sx={{
                                width: '100%',
                                height: 100,
                                objectFit: 'cover',
                              }}
                            />
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Quick Actions */}
          <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Acciones
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CopyIcon />}
                  onClick={handleCopyCode}
                >
                  Copiar Código
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PdfIcon />}
                  onClick={handleOpenPdf}
                >
                  Ver PDF
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<QrIcon />}
                  onClick={() => setQrDialogOpen(true)}
                >
                  Ver QR Grande
                </Button>
                {isReceiptAvailable && (
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    startIcon={isPrintingReceipt ? <CircularProgress size={18} color="inherit" /> : <ReceiptIcon />}
                    onClick={handlePrintReceipt}
                    disabled={isPrintingReceipt}
                  >
                    {isPrintingReceipt ? 'Preparando...' : 'Imprimir Recibo'}
                  </Button>
                )}
              </Box>

              {isPending && (
                <>
                  <Divider sx={{ my: 2 }} />
                  {canApprove ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={<ApproveIcon />}
                        onClick={() => setApprovalDialogOpen(true)}
                        disabled={approvingL1 || approvingL2 || approvingL3}
                      >
                        Aprobar
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<RejectIcon />}
                        onClick={() => setRejectDialogOpen(true)}
                        disabled={rejecting}
                      >
                        Rechazar
                      </Button>
                    </Box>
                  ) : (
                    <Alert severity="info" icon={<InfoIcon />}>
                      Pendiente de aprobación Nivel {token.current_approval_level}
                    </Alert>
                  )}
                </>
              )}

              {/* Uniform Delivery Completion */}
              {canCompleteDelivery && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Token pendiente de entrega de uniforme
                  </Alert>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<UniformIcon />}
                    onClick={() => navigate(`/tokens/${token.id}/complete-delivery`)}
                  >
                    Completar Entrega
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Approval History */}
          <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Historial de Aprobación
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {token.requires_level_1 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      {token.approved_level_1_at ? (
                        <ApproveIcon color="success" fontSize="small" />
                      ) : (
                        <TimeIcon color="action" fontSize="small" />
                      )}
                      <Typography variant="subtitle2">Nivel 1 - Supervisor</Typography>
                    </Box>
                    {token.approved_level_1_at ? (
                      <>
                        <Typography variant="caption" color="text.secondary" sx={{ pl: 3.5 }}>
                          {token.approved_level_1_by?.full_name} - {formatDateTime(token.approved_level_1_at)}
                        </Typography>
                        {/* Show attachments if present */}
                        {(token.approved_level_1_signature || token.approved_level_1_photo) && (
                          <Box sx={{ pl: 3.5, mt: 1, display: 'flex', gap: 1 }}>
                            {token.approved_level_1_signature && (
                              <Tooltip title="Ver firma">
                                <Paper
                                  variant="outlined"
                                  sx={{ p: 0.5, cursor: 'pointer', width: 60, height: 40 }}
                                  onClick={() => window.open(token.approved_level_1_signature!, '_blank')}
                                >
                                  <Box component="img" src={token.approved_level_1_signature} alt="Firma" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </Paper>
                              </Tooltip>
                            )}
                            {token.approved_level_1_photo && (
                              <Tooltip title="Ver foto">
                                <Paper
                                  variant="outlined"
                                  sx={{ p: 0.5, cursor: 'pointer', width: 60, height: 40 }}
                                  onClick={() => window.open(token.approved_level_1_photo!, '_blank')}
                                >
                                  <Box component="img" src={token.approved_level_1_photo} alt="Foto" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Paper>
                              </Tooltip>
                            )}
                          </Box>
                        )}
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ pl: 3.5 }}>
                        Pendiente
                      </Typography>
                    )}
                  </Box>
                )}

                {token.requires_level_2 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      {token.approved_level_2_at ? (
                        <ApproveIcon color="success" fontSize="small" />
                      ) : (
                        <TimeIcon color="action" fontSize="small" />
                      )}
                      <Typography variant="subtitle2">Nivel 2 - Jefe de Área</Typography>
                    </Box>
                    {token.approved_level_2_at ? (
                      <>
                        <Typography variant="caption" color="text.secondary" sx={{ pl: 3.5 }}>
                          {token.approved_level_2_by?.full_name} - {formatDateTime(token.approved_level_2_at)}
                        </Typography>
                        {/* Show attachments if present */}
                        {(token.approved_level_2_signature || token.approved_level_2_photo) && (
                          <Box sx={{ pl: 3.5, mt: 1, display: 'flex', gap: 1 }}>
                            {token.approved_level_2_signature && (
                              <Tooltip title="Ver firma">
                                <Paper
                                  variant="outlined"
                                  sx={{ p: 0.5, cursor: 'pointer', width: 60, height: 40 }}
                                  onClick={() => window.open(token.approved_level_2_signature!, '_blank')}
                                >
                                  <Box component="img" src={token.approved_level_2_signature} alt="Firma" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </Paper>
                              </Tooltip>
                            )}
                            {token.approved_level_2_photo && (
                              <Tooltip title="Ver foto">
                                <Paper
                                  variant="outlined"
                                  sx={{ p: 0.5, cursor: 'pointer', width: 60, height: 40 }}
                                  onClick={() => window.open(token.approved_level_2_photo!, '_blank')}
                                >
                                  <Box component="img" src={token.approved_level_2_photo} alt="Foto" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Paper>
                              </Tooltip>
                            )}
                          </Box>
                        )}
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ pl: 3.5 }}>
                        Pendiente
                      </Typography>
                    )}
                  </Box>
                )}

                {token.requires_level_3 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      {token.approved_level_3_at ? (
                        <ApproveIcon color="success" fontSize="small" />
                      ) : (
                        <TimeIcon color="action" fontSize="small" />
                      )}
                      <Typography variant="subtitle2">Nivel 3 - Gerente CD</Typography>
                    </Box>
                    {token.approved_level_3_at ? (
                      <>
                        <Typography variant="caption" color="text.secondary" sx={{ pl: 3.5 }}>
                          {token.approved_level_3_by?.full_name} - {formatDateTime(token.approved_level_3_at)}
                        </Typography>
                        {/* Show attachments if present */}
                        {(token.approved_level_3_signature || token.approved_level_3_photo) && (
                          <Box sx={{ pl: 3.5, mt: 1, display: 'flex', gap: 1 }}>
                            {token.approved_level_3_signature && (
                              <Tooltip title="Ver firma">
                                <Paper
                                  variant="outlined"
                                  sx={{ p: 0.5, cursor: 'pointer', width: 60, height: 40 }}
                                  onClick={() => window.open(token.approved_level_3_signature!, '_blank')}
                                >
                                  <Box component="img" src={token.approved_level_3_signature} alt="Firma" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </Paper>
                              </Tooltip>
                            )}
                            {token.approved_level_3_photo && (
                              <Tooltip title="Ver foto">
                                <Paper
                                  variant="outlined"
                                  sx={{ p: 0.5, cursor: 'pointer', width: 60, height: 40 }}
                                  onClick={() => window.open(token.approved_level_3_photo!, '_blank')}
                                >
                                  <Box component="img" src={token.approved_level_3_photo} alt="Foto" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Paper>
                              </Tooltip>
                            )}
                          </Box>
                        )}
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ pl: 3.5 }}>
                        Pendiente
                      </Typography>
                    )}
                  </Box>
                )}

                {token.rejected_by && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      Rechazado por {token.rejected_by.full_name}
                    </Typography>
                    <Typography variant="caption">{token.rejection_reason}</Typography>
                  </Alert>
                )}

                {token.validated_by && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      Validado por {token.validated_by.full_name}
                    </Typography>
                    <Typography variant="caption">{formatDateTime(token.validated_at!)}</Typography>
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Información Adicional
              </Typography>
              <Divider sx={{ my: 2 }} />

              <InfoItem
                icon={<ScheduleIcon fontSize="small" />}
                label="Fecha de Creación"
                value={formatDateTime(token.created_at)}
                color="secondary"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* QR Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Código QR
          <IconButton onClick={() => setQrDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, display: 'inline-block' }}>
            <QRCodeSVG
              value={qrUrl}
              size={220}
              level="H"
              imageSettings={{
                src: "/logo-qr.png",
                height: 48,
                width: 48,
                excavate: true,
              }}
            />
          </Paper>
          <Typography variant="h6" fontWeight={600} sx={{ mt: 2 }}>
            {token.display_number}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {TokenTypeLabels[token.token_type as TokenType]}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setQrDialogOpen(false)} variant="outlined">
            Cerrar
          </Button>
          <Button variant="contained" startIcon={<PdfIcon />} onClick={() => { setQrDialogOpen(false); handleOpenPdf(); }}>
            Ver PDF
          </Button>
        </DialogActions>
      </Dialog>

      {/* PDF Dialog */}
      <Dialog
        open={pdfDialogOpen}
        onClose={() => setPdfDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, height: '90vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PdfIcon color="error" />
            <Typography variant="h6">Documento del Token</Typography>
          </Box>
          <IconButton onClick={() => setPdfDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {pdfLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Cargando documento...
                </Typography>
              </Box>
            ) : pdfBlobUrl ? (
              <iframe
                id="pdf-iframe"
                src={pdfBlobUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  minHeight: '60vh',
                }}
                title="Token PDF"
              />
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No se pudo cargar el documento
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            {token.display_number} - {TokenTypeLabels[token.token_type as TokenType]}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setPdfDialogOpen(false)} variant="outlined">
              Cerrar
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrintPdf}
              disabled={!pdfBlobUrl}
            >
              Imprimir
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
            >
              Descargar
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Rechazar Token</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta acción no se puede deshacer.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Motivo del rechazo"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Indique el motivo..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setRejectDialogOpen(false)} variant="outlined">
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={rejecting || !rejectReason.trim()}
            startIcon={rejecting ? <CircularProgress size={20} /> : <RejectIcon />}
          >
            Rechazar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Dialog with optional signature/photo */}
      <ApprovalDialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
        onApprove={handleApprove}
        isLoading={approvingL1 || approvingL2 || approvingL3}
        tokenDisplayNumber={token.display_number}
        approvalLevel={token.current_approval_level || 1}
      />
    </Box>
  );
};
