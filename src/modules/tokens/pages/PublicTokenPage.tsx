/**
 * Página pública para ver un token (sin autenticación)
 * Usada por operativos sin acceso al sistema
 */
import { useParams } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Paper,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { useGetPublicTokenQuery } from '../services/tokenApi';
import {
  TokenStatus,
  TokenStatusLabels,
  TokenTypeLabels,
  TokenType,
} from '../interfaces/token';

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

export const PublicTokenPage = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const { data: token, isLoading, error } = useGetPublicTokenQuery(uuid || '');

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando token...</Typography>
      </Container>
    );
  }

  if (error || !token) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">
          No se encontró el token o no está disponible para visualización.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card elevation={3}>
        <CardContent>
          {/* Header */}
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" fontWeight={700} color="primary">
              {token.display_number}
            </Typography>
            <Chip
              label={TokenStatusLabels[token.status as TokenStatus]}
              color={statusColors[token.status as TokenStatus]}
              sx={{ mt: 1 }}
            />
          </Box>

          <Divider />

          {/* Token Type */}
          <Box textAlign="center" my={2}>
            <Typography variant="h6">
              {TokenTypeLabels[token.token_type as TokenType]}
            </Typography>
          </Box>

          <Divider />

          {/* Personnel Info */}
          <Box my={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Beneficiario
            </Typography>
            <Typography variant="h6">{token.personnel_name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Código: {token.personnel_code}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Área: {token.personnel_area}
            </Typography>
          </Box>

          <Divider />

          {/* Location */}
          <Box my={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Centro de Distribución
            </Typography>
            <Typography>{token.distributor_center_name}</Typography>
          </Box>

          <Divider />

          {/* Validity */}
          <Box my={3}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Válido Desde
                </Typography>
                <Typography>
                  {new Date(token.valid_from).toLocaleString('es-HN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Válido Hasta
                </Typography>
                <Typography>
                  {new Date(token.valid_until).toLocaleString('es-HN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Detail Summary */}
          {token.detail_summary && Object.keys(token.detail_summary).length > 0 && (
            <>
              <Divider />
              <Box my={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Detalles
                </Typography>
                <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                  {Object.entries(token.detail_summary).map(([key, value]) => (
                    <Box key={key} display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        {key}:
                      </Typography>
                      <Typography variant="body2">{String(value)}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </>
          )}

          {/* QR Code - Generated dynamically */}
          <Divider />
          <Box textAlign="center" mt={3}>
            <Paper
              elevation={0}
              sx={{
                display: 'inline-block',
                p: 2,
                bgcolor: 'white',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <QRCodeSVG
                value={window.location.href}
                size={200}
                level="H"
                includeMargin
              />
            </Paper>
            <Typography variant="caption" display="block" color="text.secondary" mt={1}>
              Presente este código QR en portería para validación
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Código: {token.token_code}
            </Typography>
          </Box>

          {/* Status message */}
          {token.status === TokenStatus.APPROVED && (
            <Alert severity="success" sx={{ mt: 3 }}>
              Este token está aprobado y listo para usar.
            </Alert>
          )}
          {[TokenStatus.PENDING_L1, TokenStatus.PENDING_L2, TokenStatus.PENDING_L3].includes(
            token.status as TokenStatus
          ) && (
            <Alert severity="warning" sx={{ mt: 3 }}>
              Este token está pendiente de aprobación.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <Box textAlign="center" mt={3}>
        <Typography variant="caption" color="text.secondary">
          LoadSync Tracker - Sistema de Tokens
        </Typography>
      </Box>
    </Container>
  );
};
