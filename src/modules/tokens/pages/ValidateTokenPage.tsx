/**
 * Página para validar tokens (uso de Seguridad)
 * - Escaneo QR con cámara
 * - Búsqueda por código (TK-2026-000001)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePermissionWithFallback, useAnyGroup, TokenPermissions, TokenGroups } from '../../../hooks/usePermission';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Badge,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  QrCodeScanner as ScanIcon,
  CheckCircle as ValidateIcon,
  CameraAlt as CameraIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  ConfirmationNumber as TokenIcon,
  ListAlt as ListIcon,
  AccessTime as AccessTimeIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Draw as SignatureIcon,
  PhotoCamera as PhotoIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { SignatureCapture } from '../components/SignatureCapture';
import { Html5Qrcode } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { useValidateTokenMutation, useLazyGetTokenByCodeQuery, useGetPendingValidationQuery } from '../services/tokenApi';
import {
  TokenStatus,
  TokenStatusLabels,
  TokenTypeLabels,
  TokenType,
} from '../interfaces/token';

// EXIT_PASS → validación física en portería (Seguridad)
const SECURITY_VALIDATION_TYPES: TokenType[] = [
  TokenType.EXIT_PASS,
];

// PERMIT_HOUR, OVERTIME, SHIFT_CHANGE, SUBSTITUTION, RATE_CHANGE → Planilla/People
const PAYROLL_VALIDATION_TYPES: TokenType[] = [
  TokenType.PERMIT_HOUR,
  TokenType.OVERTIME,
  TokenType.SHIFT_CHANGE,
  TokenType.SUBSTITUTION,
  TokenType.RATE_CHANGE,
];

const statusColors: Record<TokenStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
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

export const ValidateTokenPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Seguridad / Gerentes CD → validan EXIT_PASS (portería física)
  // Permiso backend: tokens.can_validate_token
  const isSecurityUser = usePermissionWithFallback(
    TokenPermissions.VALIDATE,
    [TokenGroups.SECURITY, TokenGroups.CD_MANAGERS]
  );

  // People / Planilla → validan PERMIT_HOUR, OVERTIME, SHIFT_CHANGE, SUBSTITUTION, RATE_CHANGE
  // Permiso backend: tokens.can_validate_payroll
  const isHRUser = usePermissionWithFallback(
    TokenPermissions.VALIDATE_PAYROLL,
    [TokenGroups.PEOPLE, TokenGroups.HR]
  );

  // Tipos que puede validar este usuario según su rol
  const userValidationTypes: TokenType[] = [
    ...(isSecurityUser ? SECURITY_VALIDATION_TYPES : []),
    ...(isHRUser ? PAYROLL_VALIDATION_TYPES : []),
  ];

  const [tokenCode, setTokenCode] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // States for validation attachments
  const [validationNotes, setValidationNotes] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [validationSignature, setValidationSignature] = useState<Blob | null>(null);
  const [validationPhoto, setValidationPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [getTokenByCode, { data: tokenData, isLoading: loadingToken, error: tokenError }] = useLazyGetTokenByCodeQuery();
  const [validateToken, { isLoading: validating }] = useValidateTokenMutation();
  const { data: pendingTokensRaw, isLoading: loadingPending } = useGetPendingValidationQuery();

  // Solo muestra los tokens que corresponden al rol del usuario actual
  const pendingTokens = pendingTokensRaw?.filter(
    (t) => userValidationTypes.includes(t.token_type as TokenType)
  );

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop();
      }
    };
  }, []);

  const handleSearch = () => {
    if (!tokenCode.trim()) {
      toast.error('Ingrese el código del token');
      return;
    }
    // Search by display_number (TK-2026-000001) format
    getTokenByCode(tokenCode.trim().toUpperCase());
  };

  const handleOpenScanner = () => {
    setScannerOpen(true);
  };

  const handleCloseScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    setScannerOpen(false);
  };

  const handleScanSuccess = async (decodedText: string) => {
    // Stop scanner first
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    setScannerOpen(false);

    // Extract token code from URL or use directly
    let code = decodedText;

    // If it's a URL, extract the token code/uuid
    if (decodedText.includes('/public/token/')) {
      const parts = decodedText.split('/public/token/');
      code = parts[1]?.split('?')[0] || decodedText;
    }

    // If it looks like a UUID, search by UUID, otherwise by display_number
    if (code.includes('-') && code.length > 20) {
      // It's likely a UUID - search by token_code
      getTokenByCode(code);
    } else {
      // It's likely a display_number
      setTokenCode(code);
      getTokenByCode(code.toUpperCase());
    }
  };

  const initScanner = async () => {
    const qrCodeRegionId = 'qr-reader';

    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(qrCodeRegionId);
    }

    try {
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScanSuccess,
        undefined
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      toast.error('No se pudo acceder a la cámara');
    }
  };

  useEffect(() => {
    if (scannerOpen) {
      // Small delay to ensure the DOM element exists
      const timer = setTimeout(() => {
        initScanner();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [scannerOpen]);

  const handleOpenConfirm = () => {
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmDialogOpen(false);
    // Reset attachment states
    setValidationNotes('');
    setShowAttachments(false);
    setValidationSignature(null);
    setValidationPhoto(null);
    setPhotoPreview(null);
  };

  const handleSignatureCapture = useCallback((signatureBlob: Blob | null) => {
    setValidationSignature(signatureBlob);
  }, []);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValidationPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setValidationPhoto(null);
    setPhotoPreview(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleValidate = async () => {
    if (!tokenData?.token_code) return;

    try {
      // Use FormData if there are attachments
      if (validationSignature || validationPhoto) {
        const formData = new FormData();
        formData.append('token_code', tokenData.token_code);
        if (validationNotes) {
          formData.append('notes', validationNotes);
        }
        if (validationSignature) {
          formData.append('signature', validationSignature, 'signature.png');
        }
        if (validationPhoto) {
          formData.append('photo', validationPhoto);
        }
        await validateToken(formData).unwrap();
      } else {
        await validateToken({ token_code: tokenData.token_code, notes: validationNotes }).unwrap();
      }

      toast.success('Token validado exitosamente');
      setTokenCode('');
      handleCloseConfirm();
      // Refresh the token data
      if (tokenData.display_number) {
        getTokenByCode(tokenData.display_number);
      }
    } catch (error: unknown) {
      const err = error as { data?: { error?: string } };
      toast.error(err?.data?.error || 'Error al validar el token');
    }
  };

  // El token cargado es de un tipo que este usuario puede validar
  const tokenRequiresUserValidation =
    tokenData && userValidationTypes.includes(tokenData.token_type as TokenType);

  const canValidate = tokenData &&
    tokenData.status === TokenStatus.APPROVED &&
    (isSecurityUser || isHRUser) &&
    tokenRequiresUserValidation;

  const handleSelectPendingToken = (displayNumber: string) => {
    setTokenCode(displayNumber);
    getTokenByCode(displayNumber);
  };

  const isTokenValid = () => {
    if (!tokenData) return false;
    const now = new Date();
    const validFrom = new Date(tokenData.valid_from);
    const validUntil = new Date(tokenData.valid_until);
    return now >= validFrom && now <= validUntil;
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: theme.palette.secondary.main,
              }}
            >
              <ScanIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Validar Token
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Escanee el código QR o ingrese el código del token
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mt: 2 }} />
        </Grid>

        {/* Search Section */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Grid container spacing={2} alignItems="center">
              {/* Scanner Button - Large and prominent */}
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<CameraIcon />}
                  onClick={handleOpenScanner}
                  sx={{
                    height: 56,
                    bgcolor: theme.palette.secondary.main,
                    '&:hover': {
                      bgcolor: theme.palette.secondary.dark,
                    },
                  }}
                >
                  Escanear QR
                </Button>
              </Grid>

              {/* Divider */}
              <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                  o
                </Typography>
                <Divider sx={{ display: { xs: 'block', md: 'none' }, width: '100%' }}>
                  <Chip label="o" size="small" />
                </Divider>
              </Grid>

              {/* Manual Search */}
              <Grid item xs={12} md={7}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    label="Código del Token"
                    value={tokenCode}
                    onChange={(e) => setTokenCode(e.target.value.toUpperCase())}
                    placeholder="TK-2026-000001"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    InputProps={{
                      startAdornment: <TokenIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                    helperText="Ingrese el código del token (ej: TK-2026-000001)"
                  />
                  <Button
                    variant="outlined"
                    onClick={handleSearch}
                    disabled={loadingToken || !tokenCode.trim()}
                    sx={{ height: 56, minWidth: 100 }}
                  >
                    {loadingToken ? <CircularProgress size={24} /> : <SearchIcon />}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Pending Validation List */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                bgcolor: 'grey.50',
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ListIcon color="action" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Tokens Pendientes de Validar
                </Typography>
              </Box>
              {pendingTokens && pendingTokens.length > 0 && (
                <Badge
                  badgeContent={pendingTokens.length}
                  color="warning"
                  sx={{ mr: 1 }}
                >
                  <Chip
                    label="En espera"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Badge>
              )}
            </Box>

            {loadingPending ? (
              <Box sx={{ p: 2 }}>
                {[1, 2, 3].map((i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : pendingTokens && pendingTokens.length > 0 ? (
              <List sx={{ maxHeight: 350, overflow: 'auto', py: 0 }}>
                {pendingTokens.map((token) => (
                  <ListItem
                    key={token.id}
                    disablePadding
                    divider
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          size="small"
                          icon={<AccessTimeIcon />}
                          label={`${new Date(token.valid_until).toLocaleString('es-HN', { dateStyle: 'short', timeStyle: 'short' })}`}
                          color="warning"
                          variant="outlined"
                          sx={{ display: { xs: 'none', md: 'flex' }, fontSize: '0.7rem' }}
                        />
                        {(isSecurityUser || isHRUser) && (
                          <Tooltip title="Validar Token">
                            <IconButton
                              color="success"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectPendingToken(token.display_number);
                                // After selecting, open confirm dialog
                                setTimeout(() => setConfirmDialogOpen(true), 300);
                              }}
                              sx={{
                                bgcolor: 'success.light',
                                '&:hover': { bgcolor: 'success.main', color: 'white' },
                              }}
                            >
                              <ValidateIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    }
                  >
                    <ListItemButton
                      onClick={() => handleSelectPendingToken(token.display_number)}
                      selected={tokenData?.display_number === token.display_number}
                      sx={{
                        pr: { xs: 10, md: 18 },
                        '&.Mui-selected': {
                          bgcolor: 'success.light',
                          '&:hover': {
                            bgcolor: 'success.light',
                          },
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: tokenData?.display_number === token.display_number
                              ? 'success.main'
                              : 'primary.main',
                          }}
                        >
                          <TokenIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body1" fontWeight={600}>
                              {token.display_number}
                            </Typography>
                            <Chip
                              label={TokenTypeLabels[token.token_type as TokenType]}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {token.personnel_name} - {token.distributor_center_name}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <ValidateIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  No hay tokens pendientes de validar
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Los tokens aprobados aparecerán aquí
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Loading State */}
        {loadingToken && (
          <Grid item xs={12} textAlign="center">
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Buscando token...
            </Typography>
          </Grid>
        )}

        {/* Error State */}
        {tokenError && (
          <Grid item xs={12}>
            <Alert severity="error" icon={<WarningIcon />}>
              No se encontró el token. Verifique el código e intente nuevamente.
            </Alert>
          </Grid>
        )}

        {/* Token Info Card */}
        {tokenData && (
          <Grid item xs={12}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                borderTop: `4px solid ${
                  canValidate
                    ? theme.palette.success.main
                    : theme.palette.warning.main
                }`,
              }}
            >
              {/* Token Header */}
              <Box
                sx={{
                  bgcolor: theme.palette.secondary.main,
                  color: 'white',
                  p: 3,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {tokenData.display_number}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                    {TokenTypeLabels[tokenData.token_type as TokenType]}
                  </Typography>
                </Box>
                <Chip
                  label={TokenStatusLabels[tokenData.status as TokenStatus]}
                  color={statusColors[tokenData.status as TokenStatus]}
                  sx={{ fontWeight: 600, fontSize: '0.9rem' }}
                />
              </Box>

              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Beneficiary Info */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Beneficiario
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {tokenData.personnel_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tokenData.personnel_code}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Center Info */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'info.main' }}>
                        <BusinessIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Centro de Distribución
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {tokenData.distributor_center_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Área: {tokenData.personnel_area}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Validity Period */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mt: 2 }}>
                      <Avatar sx={{ bgcolor: isTokenValid() ? 'success.main' : 'error.main' }}>
                        <ScheduleIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Período de Validez
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Desde:
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {new Date(tokenData.valid_from).toLocaleString('es-HN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Hasta:
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {new Date(tokenData.valid_until).toLocaleString('es-HN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </Typography>
                          </Grid>
                        </Grid>
                        {!isTokenValid() && tokenData.status === TokenStatus.APPROVED && (
                          <Alert severity="warning" sx={{ mt: 2 }}>
                            Este token está fuera del período de validez
                          </Alert>
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  {/* Detail Summary */}
                  {tokenData.detail_summary && Object.keys(tokenData.detail_summary).length > 0 && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                        Detalles del Token
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: 'grey.50',
                          p: 2,
                          borderRadius: 1,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Grid container spacing={1}>
                          {Object.entries(tokenData.detail_summary).map(([key, value]) => (
                            <Grid item xs={12} sm={6} key={key}>
                              <Typography variant="body2">
                                <strong>{key}:</strong> {String(value)}
                              </Typography>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    </Grid>
                  )}

                  {/* QR Code Display */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: 'white',
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 2,
                        }}
                      >
                        <QRCodeSVG
                          value={`${import.meta.env.VITE_JS_FRONTEND_URL}/public/token/${tokenData.token_code}`}
                          size={isMobile ? 120 : 150}
                          level="H"
                          imageSettings={{
                            src: '/logo-qr.png',
                            height: isMobile ? 28 : 32,
                            width: isMobile ? 28 : 32,
                            excavate: true,
                          }}
                        />
                      </Paper>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Validate Button */}
                {!tokenRequiresUserValidation ? (
                  <Alert severity="info" icon={<WarningIcon />}>
                    Este tipo de token ({TokenTypeLabels[tokenData.token_type as TokenType]}) no requiere validación por tu grupo. Se mantiene en estado {TokenStatusLabels[tokenData.status as TokenStatus]}.
                  </Alert>
                ) : canValidate ? (
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<ValidateIcon />}
                    onClick={handleOpenConfirm}
                    disabled={validating}
                    sx={{ py: 1.5, fontSize: '1rem' }}
                  >
                    Validar Token
                  </Button>
                ) : (
                  <Alert
                    severity={tokenData.status === TokenStatus.USED ? 'info' : (tokenData.status === TokenStatus.APPROVED && !(isSecurityUser || isHRUser)) ? 'error' : 'warning'}
                    icon={tokenData.status === TokenStatus.USED ? <ValidateIcon /> : <WarningIcon />}
                  >
                    {tokenData.status === TokenStatus.USED
                      ? `Este token ya fue validado${tokenData.validated_at ? ` el ${new Date(tokenData.validated_at).toLocaleString('es-HN')}` : ''}`
                      : tokenData.status === TokenStatus.APPROVED && !(isSecurityUser || isHRUser)
                        ? 'No tiene permisos para validar tokens. Solo personal de Seguridad, Gerentes de CD o People pueden realizar esta acción.'
                        : `Este token no puede ser validado. Estado: ${TokenStatusLabels[tokenData.status as TokenStatus]}`
                    }
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Empty State */}
        {!tokenData && !loadingToken && !tokenError && (
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 6,
                textAlign: 'center',
                bgcolor: 'grey.50',
                borderRadius: 2,
              }}
            >
              <ScanIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Escanee o busque un token
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use la cámara para escanear el código QR o ingrese el código del token manualmente
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* QR Scanner Dialog */}
      <Dialog
        open={scannerOpen}
        onClose={handleCloseScanner}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.secondary.main,
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CameraIcon />
            Escanear Código QR
          </Box>
          <IconButton onClick={handleCloseScanner} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box
            id="qr-reader"
            sx={{
              width: '100%',
              minHeight: 350,
              '& video': {
                borderRadius: 0,
              },
            }}
          />
          <Box sx={{ p: 2, bgcolor: 'grey.100' }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Apunte la cámara hacia el código QR del token
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseScanner} variant="outlined">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Validation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirm}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ValidateIcon color="success" />
            <Typography variant="h6">Confirmar Validación</Typography>
          </Box>
          <IconButton onClick={handleCloseConfirm} size="small" disabled={validating}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {tokenData && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Está a punto de marcar este token como <strong>USADO</strong>.
                Esta acción no se puede deshacer.
              </Alert>

              <Paper
                variant="outlined"
                sx={{ p: 2, borderRadius: 1, mb: 2 }}
              >
                <Typography variant="body2" color="text.secondary">Token</Typography>
                <Typography variant="h6" fontWeight={600}>{tokenData.display_number}</Typography>

                <Divider sx={{ my: 1.5 }} />

                <Typography variant="body2" color="text.secondary">Beneficiario</Typography>
                <Typography variant="body1">{tokenData.personnel_name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {tokenData.personnel_code}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Typography variant="body2" color="text.secondary">Tipo</Typography>
                <Typography variant="body1">
                  {TokenTypeLabels[tokenData.token_type as TokenType]}
                </Typography>
              </Paper>

              {/* Notes field */}
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Notas de validación (opcional)"
                placeholder="Agregue comentarios o notas..."
                value={validationNotes}
                onChange={(e) => setValidationNotes(e.target.value)}
                disabled={validating}
                sx={{ mb: 2 }}
              />

              {/* Toggle for attachments */}
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={() => setShowAttachments(!showAttachments)}
                endIcon={showAttachments ? <CollapseIcon /> : <ExpandIcon />}
                sx={{ mb: 1 }}
              >
                {showAttachments ? 'Ocultar adjuntos' : 'Agregar firma o foto (opcional)'}
              </Button>

              <Collapse in={showAttachments}>
                <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                  {/* Signature Section */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <SignatureIcon color="secondary" fontSize="small" />
                      <Typography variant="subtitle2">Firma del Beneficiario (opcional)</Typography>
                    </Box>
                    <SignatureCapture
                      onSignatureCapture={handleSignatureCapture}
                      width={350}
                      height={150}
                      disabled={validating}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Photo Section */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PhotoIcon color="secondary" fontSize="small" />
                      <Typography variant="subtitle2">Foto de evidencia (opcional)</Typography>
                    </Box>

                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      style={{ display: 'none' }}
                      id="validation-photo-input"
                    />

                    {!photoPreview ? (
                      <Button
                        variant="outlined"
                        startIcon={<PhotoIcon />}
                        onClick={() => photoInputRef.current?.click()}
                        disabled={validating}
                        fullWidth
                      >
                        Tomar o seleccionar foto
                      </Button>
                    ) : (
                      <Box sx={{ position: 'relative' }}>
                        <Paper
                          variant="outlined"
                          sx={{
                            overflow: 'hidden',
                            borderRadius: 1,
                          }}
                        >
                          <Box
                            component="img"
                            src={photoPreview}
                            alt="Preview"
                            sx={{
                              width: '100%',
                              maxHeight: 200,
                              objectFit: 'cover',
                            }}
                          />
                        </Paper>
                        <IconButton
                          size="small"
                          onClick={handleRemovePhoto}
                          disabled={validating}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'error.dark' },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Puede adjuntar una foto como evidencia de la validación
                    </Typography>
                  </Box>
                </Paper>
              </Collapse>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseConfirm} variant="outlined" disabled={validating}>
            Cancelar
          </Button>
          <Button
            onClick={handleValidate}
            variant="contained"
            color="success"
            startIcon={validating ? <CircularProgress size={20} /> : <ValidateIcon />}
            disabled={validating}
          >
            {validating ? 'Validando...' : 'Confirmar Validación'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
