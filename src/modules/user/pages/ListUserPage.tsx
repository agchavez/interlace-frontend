import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Container,
  Grid,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Alert,
  Card,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridPaginationModel } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { User, UserQuerySearch, GetAUserResponse } from '../../../interfaces/user';
import { useGetUserQuery } from '../../../store/user/userApi';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { useAppSelector } from '../../../store/store';

export const ListUserPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isFullHD = useMediaQuery(theme.breakpoints.up('xl'));

  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [query, setQuery] = useState<UserQuerySearch>({
    limit: 25,
    offset: 0,
    search: '',
  });

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<User | null>(null);

  const { data, isLoading, isFetching, refetch } = useGetUserQuery(query);

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    setQuery({
      ...query,
      limit: model.pageSize,
      offset: model.page * model.pageSize,
    });
  };

  const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLElement>, row: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
    setSelectedRow(null);
  }, []);

  const handleEdit = () => {
    if (selectedRow) {
      // Si el usuario tiene perfil de personal, editar con el ID del perfil
      if (selectedRow.personnel_profile_id) {
        navigate(`/user/register?edit=${selectedRow.personnel_profile_id}`);
      } else {
        // Si no tiene perfil, crear uno nuevo con datos del usuario
        navigate(`/user/register?userId=${selectedRow.id}`);
      }
    }
    handleCloseMenu();
  };

  const handleResetPassword = () => {
    if (selectedRow && selectedRow.id) {
      setSelectedUser(selectedRow.id);
      setOpenChangePassword(true);
    }
    handleCloseMenu();
  };

  const handleCloseChangePassword = () => {
    setOpenChangePassword(false);
    setSelectedUser(null);
  };

  const handleCreateUser = () => {
    navigate('/user/register');
  };

  const userModalChangePassword = useMemo(() => {
    return data?.results?.find((user) => user.id === selectedUser) as Partial<User & GetAUserResponse> | undefined;
  }, [data?.results, selectedUser]);

  const columns: GridColDef[] = useMemo(() => {
    const baseColumns: GridColDef[] = [];

    // En móvil: Avatar + Nombre combinados en una sola columna
    if (isMobile) {
      baseColumns.push({
        field: 'user_info',
        headerName: 'Usuario',
        flex: 1,
        minWidth: 200,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => {
          const fullName = `${params.row.first_name} ${params.row.last_name}`;
          const initials = fullName
            ? fullName
                .split(' ')
                .slice(0, 2)
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
            : '?';

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
              <Avatar
                src={params.row.photo_url || undefined}
                alt={fullName}
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: '0.875rem',
                  bgcolor: 'primary.main',
                  fontWeight: 600,
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {fullName}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <PersonIcon sx={{ fontSize: 12, flexShrink: 0 }} />
                  {params.row.username}
                </Typography>
              </Box>
            </Box>
          );
        },
      });
    } else {
      // Desktop: Columnas separadas
      baseColumns.push(
        {
          field: 'photo_url',
          headerName: '',
          width: 60,
          sortable: false,
          align: 'center',
          headerAlign: 'center',
          renderCell: (params: GridRenderCellParams) => {
            const fullName = `${params.row.first_name} ${params.row.last_name}`;
            const initials = fullName
              ? fullName
                  .split(' ')
                  .slice(0, 2)
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()
              : '?';

            return (
              <Avatar
                src={params.row.photo_url || undefined}
                alt={fullName}
                sx={{
                  width: 36,
                  height: 36,
                  fontSize: '0.875rem',
                  bgcolor: 'primary.main',
                  fontWeight: 600,
                }}
              >
                {initials}
              </Avatar>
            );
          },
        },
        {
          field: 'username',
          headerName: 'Usuario',
          flex: 0.8,
          minWidth: 180,
          renderCell: (params: GridRenderCellParams) => (
            <Tooltip title={params.value} arrow placement="top">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <PersonIcon fontSize="small" color="primary" sx={{ flexShrink: 0 }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {params.value}
                </Typography>
              </Box>
            </Tooltip>
          ),
        },
        {
          field: 'full_name',
          headerName: 'Nombre Completo',
          flex: 1,
          minWidth: 220,
          valueGetter: (params: any) => `${params.row.first_name} ${params.row.last_name}`,
          renderCell: (params: GridRenderCellParams) => (
            <Box sx={{ width: '100%' }}>
              <Tooltip title={params.value} arrow placement="top">
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {params.value}
                </Typography>
              </Tooltip>
              {params.row.email && (
                <Tooltip title={params.row.email} arrow placement="bottom">
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <EmailIcon sx={{ fontSize: 12, flexShrink: 0 }} />
                    {params.row.email}
                  </Typography>
                </Tooltip>
              )}
            </Box>
          ),
        }
      );
    }

    if (!isMobile) {
      baseColumns.push({
        field: 'list_groups',
        headerName: 'Grupo',
        width: 150,
        renderCell: (params: GridRenderCellParams) => {
          const groups = params.value as string[];
          return groups && groups.length > 0 ? (
            <Chip
              icon={<GroupIcon />}
              label={groups[0]}
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ fontSize: '0.75rem', fontWeight: 500 }}
            />
          ) : (
            <Chip label="Sin grupo" size="small" variant="outlined" color="default" sx={{ fontSize: '0.7rem' }} />
          );
        },
      });
    }

    if (!isMobile && !isTablet) {
      baseColumns.push(
        {
          field: 'centro_distribucion_name',
          headerName: 'Centro',
          flex: 0.6,
          minWidth: 180,
          renderCell: (params: GridRenderCellParams) => (
            params.value ? (
              <Tooltip title={params.value} arrow placement="top">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%' }}>
                  <BusinessIcon fontSize="small" color="action" sx={{ flexShrink: 0 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {params.value}
                  </Typography>
                </Box>
              </Tooltip>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No asignado
              </Typography>
            )
          ),
        },
        {
          field: 'employee_number',
          headerName: 'Código Empleado',
          width: 140,
          renderCell: (params: GridRenderCellParams) =>
            params.value ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BadgeIcon fontSize="small" color="action" />
                <Typography variant="body2">{params.value}</Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                -
              </Typography>
            ),
        }
      );
    }

    baseColumns.push(
      {
        field: 'is_active',
        headerName: isMobile ? '' : 'Estado',
        width: isMobile ? 60 : 100,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams) => (
          <Tooltip title={params.value ? 'Usuario activo' : 'Usuario inactivo'}>
            {params.value ? (
              <CheckCircleIcon color="success" fontSize={isMobile ? 'medium' : 'small'} />
            ) : (
              <BlockIcon color="error" fontSize={isMobile ? 'medium' : 'small'} />
            )}
          </Tooltip>
        ),
      }
    );

    // Columna de fecha creado solo en desktop
    if (!isMobile) {
      baseColumns.push({
        field: 'created_at',
        headerName: 'Creado',
        width: 120,
        valueFormatter: (params) => (params.value ? format(new Date(params.value), 'dd/MM/yyyy') : '-'),
      });
    }

    // Columna de acciones
    baseColumns.push(
      {
        field: 'actions',
        headerName: '',
        width: 60,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams) => {
          // No mostrar acciones para el usuario actual
          if (currentUser?.id === params.row.id) return null;

          return (
            <IconButton
              size="small"
              onClick={(e) => handleOpenMenu(e, params.row)}
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.1)',
                },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          );
        },
      }
    );

    return baseColumns;
  }, [isMobile, isTablet, currentUser, handleOpenMenu]);

  return (
    <>
      <ChangePasswordModal
        open={openChangePassword}
        user={userModalChangePassword}
        handleClose={handleCloseChangePassword}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            minWidth: 180,
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Editar Usuario</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleResetPassword}>
          <ListItemIcon>
            <LockResetIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>Resetear Contraseña</ListItemText>
        </MenuItem>
      </Menu>

      <Container maxWidth={isFullHD ? 'xl' : 'lg'} sx={{ marginTop: 2 }}>
        <Grid container spacing={2}>
          {/* Header */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography
                  variant={isMobile ? 'h6' : 'h4'}
                  component="h1"
                  fontWeight={400}
                  sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}
                >
                  Gestión de Usuarios
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, display: { xs: 'none', sm: 'block' } }}>
                  Administra los usuarios del sistema y sus permisos
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={isMobile ? undefined : <AddIcon />}
                onClick={handleCreateUser}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  px: isMobile ? 2 : 3,
                  py: 1.5,
                  borderRadius: 2,
                  minWidth: isMobile ? 'auto' : 140,
                }}
              >
                {isMobile ? <AddIcon /> : 'Crear Usuario'}
              </Button>
            </Box>
            <Divider sx={{ marginBottom: 0, marginTop: 2 }} />
          </Grid>

          {/* Search Bar */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por nombre, usuario o email..."
              value={query.search}
              onChange={(e) =>
                setQuery({
                  ...query,
                  search: e.target.value,
                  offset: 0,
                })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                maxWidth: 500,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                },
              }}
            />
          </Grid>

          {/* Data Grid */}
          <Grid item xs={12}>
            <Card variant="outlined">
              {data?.count === 0 && !isLoading && (
                <Alert severity="info" sx={{ m: 2 }}>
                  No se encontraron resultados.
                </Alert>
              )}

              <DataGrid
                rows={data?.results || []}
                columns={columns}
                rowCount={data?.count || 0}
                loading={isLoading || isFetching}
                pagination
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={handlePaginationChange}
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
                disableColumnMenu
                autoHeight
                rowHeight={isMobile ? 70 : 52} // Más altura en móvil para touch
                sx={{
                  border: 0,
                  '& .MuiDataGrid-cell': {
                    fontSize: isMobile ? '0.8125rem' : '0.875rem', // 13px mínimo en móvil
                    py: isMobile ? 1.5 : 1, // Más espacio vertical en móvil para touch
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    fontSize: isMobile ? '0.8125rem' : '0.875rem', // 13px mínimo
                    fontWeight: 600,
                  },
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none',
                  },
                  '& .MuiDataGrid-cell:focus-within': {
                    outline: 'none',
                  },
                }}
              />
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
