/**
 * Página de tokens pendientes de aprobación
 */
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  Stack,
} from '@mui/material';
import {
  AccessTime as PermitHourIcon,
  EventNote as PermitDayIcon,
  ExitToApp as ExitPassIcon,
  SwapHoriz as SubstitutionIcon,
  TrendingUp as RateChangeIcon,
  MoreTime as OvertimeIcon,
  Autorenew as ShiftChangeIcon,
  Checkroom as UniformIcon,
  Person as PersonIcon,
  Business as CenterIcon,
  CalendarToday as DateIcon,
  ArrowForward as ArrowIcon,
  HourglassTop as PendingIcon,
} from '@mui/icons-material';
import { useGetPendingApprovalsQuery } from '../services/tokenApi';
import {
  TokenStatus,
  TokenStatusLabels,
  TokenType,
} from '../interfaces/token';

const tokenTypeConfig: Record<TokenType, { icon: React.ReactNode; color: string; bg: string }> = {
  [TokenType.PERMIT_HOUR]:     { icon: <PermitHourIcon />,   color: '#1976d2', bg: '#e3f2fd' },
  [TokenType.PERMIT_DAY]:      { icon: <PermitDayIcon />,    color: '#7b1fa2', bg: '#f3e5f5' },
  [TokenType.EXIT_PASS]:       { icon: <ExitPassIcon />,     color: '#d32f2f', bg: '#ffebee' },
  [TokenType.SUBSTITUTION]:    { icon: <SubstitutionIcon />, color: '#f57c00', bg: '#fff3e0' },
  [TokenType.RATE_CHANGE]:     { icon: <RateChangeIcon />,   color: '#388e3c', bg: '#e8f5e9' },
  [TokenType.OVERTIME]:        { icon: <OvertimeIcon />,     color: '#0288d1', bg: '#e1f5fe' },
  [TokenType.SHIFT_CHANGE]:    { icon: <ShiftChangeIcon />,  color: '#5d4037', bg: '#efebe9' },
  [TokenType.UNIFORM_DELIVERY]:{ icon: <UniformIcon />,      color: '#455a64', bg: '#eceff1' },
};

const levelColors: Record<TokenStatus, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
  [TokenStatus.DRAFT]:       'default',
  [TokenStatus.PENDING_L1]:  'warning',
  [TokenStatus.PENDING_L2]:  'warning',
  [TokenStatus.PENDING_L3]:  'warning',
  [TokenStatus.APPROVED]:    'success',
  [TokenStatus.USED]:        'info',
  [TokenStatus.EXPIRED]:     'default',
  [TokenStatus.CANCELLED]:   'default',
  [TokenStatus.REJECTED]:    'error',
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' });

export const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const { data: tokens, isLoading, error } = useGetPendingApprovalsQuery();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Error al cargar tokens pendientes</Alert>
      </Container>
    );
  }

  const count = tokens?.length ?? 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={0.5}>
          <PendingIcon sx={{ color: 'warning.main', fontSize: 32 }} />
          <Typography variant="h5" fontWeight={700}>
            Pendientes de Aprobación
          </Typography>
          {count > 0 && (
            <Chip
              label={count}
              size="small"
              color="warning"
              sx={{ fontWeight: 700, fontSize: '0.85rem' }}
            />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 7 }}>
          Fichas que requieren su revisión y aprobación
        </Typography>
      </Box>

      {/* Empty state */}
      {count === 0 ? (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <PendingIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" fontWeight={500}>
              Todo al día
            </Typography>
            <Typography variant="body2" color="text.disabled" mt={0.5}>
              No tienes fichas pendientes de aprobación
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {tokens!.map((token) => {
            const cfg = tokenTypeConfig[token.token_type as TokenType] ?? {
              icon: <PendingIcon />, color: '#757575', bg: '#f5f5f5',
            };

            return (
              <Grid item xs={12} md={6} key={token.id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                    '&:hover': {
                      boxShadow: 4,
                      borderColor: cfg.color,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/tokens/detail/${token.id}`)}
                    sx={{ borderRadius: 3 }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      {/* Top row: icon + número + status */}
                      <Box display="flex" alignItems="flex-start" gap={2}>
                        <Avatar
                          sx={{
                            bgcolor: cfg.bg,
                            color: cfg.color,
                            width: 48,
                            height: 48,
                            flexShrink: 0,
                          }}
                        >
                          {cfg.icon}
                        </Avatar>

                        <Box flex={1} minWidth={0}>
                          <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap">
                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                              {token.display_number}
                            </Typography>
                            <Chip
                              label={TokenStatusLabels[token.status as TokenStatus]}
                              size="small"
                              color={levelColors[token.status as TokenStatus]}
                              sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                            />
                          </Box>
                          <Typography variant="subtitle1" fontWeight={700} noWrap>
                            {token.token_type_display}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      {/* Info rows */}
                      <Stack spacing={0.75}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PersonIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                          <Typography variant="body2" fontWeight={500} noWrap>
                            {token.personnel_name ?? '—'}
                          </Typography>
                          {token.personnel_code && (
                            <Typography variant="caption" color="text.secondary">
                              #{token.personnel_code}
                            </Typography>
                          )}
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <CenterIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {token.distributor_center_name}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <DateIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                          <Typography variant="body2" color="text.secondary">
                            Desde {formatDate(token.valid_from)}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Action */}
                      <Box display="flex" justifyContent="flex-end" mt={2}>
                        <Button
                          size="small"
                          variant="contained"
                          endIcon={<ArrowIcon />}
                          sx={{
                            bgcolor: cfg.color,
                            '&:hover': { bgcolor: cfg.color, filter: 'brightness(0.9)' },
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tokens/detail/${token.id}`);
                          }}
                        >
                          Revisar
                        </Button>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};
