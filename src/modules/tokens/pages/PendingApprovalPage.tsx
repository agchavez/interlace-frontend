/**
 * Página de tokens pendientes de aprobación
 */
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useGetPendingApprovalsQuery } from '../services/tokenApi';
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

export const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const { data: tokens, isLoading, error } = useGetPendingApprovalsQuery();

  const columns: GridColDef[] = [
    {
      field: 'display_number',
      headerName: 'Número',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'token_type_display',
      headerName: 'Tipo',
      width: 150,
    },
    {
      field: 'status',
      headerName: 'Nivel',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={TokenStatusLabels[params.value as TokenStatus]}
          size="small"
          color={statusColors[params.value as TokenStatus]}
        />
      ),
    },
    {
      field: 'personnel_name',
      headerName: 'Beneficiario',
      width: 180,
    },
    {
      field: 'personnel_code',
      headerName: 'Código',
      width: 100,
    },
    {
      field: 'distributor_center_name',
      headerName: 'Centro',
      width: 120,
    },
    {
      field: 'valid_from',
      headerName: 'Válido Desde',
      width: 160,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleString('es-HN', {
            dateStyle: 'short',
            timeStyle: 'short',
          })}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="contained"
          startIcon={<ViewIcon />}
          onClick={() => navigate(`/tokens/detail/${params.row.id}`)}
        >
          Revisar
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight={600}>
            Tokens Pendientes de Aprobación
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tokens que requieren su aprobación
          </Typography>
        </Grid>

        {/* Content */}
        <Grid item xs={12}>
          {error ? (
            <Alert severity="error">Error al cargar tokens pendientes</Alert>
          ) : tokens && tokens.length === 0 ? (
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No hay tokens pendientes de aprobación
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Card variant="outlined">
              <DataGrid
                rows={tokens || []}
                columns={columns}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 25 } },
                }}
                disableRowSelectionOnClick
                autoHeight
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  },
                }}
              />
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};
