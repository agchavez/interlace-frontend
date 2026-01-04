import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Container,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridPaginationModel } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import FilterListTwoToneIcon from '@mui/icons-material/FilterListTwoTone';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import BadgeIcon from '@mui/icons-material/Badge';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import { useNavigate } from 'react-router-dom';
import { useGetPersonnelProfilesQuery, useGetAreasQuery } from '../services/personnelApi';
import { PersonnelFilters } from '../components/PersonnelFilters';
import ChipFilterCategory from '../../ui/components/ChipFilter';
import type { PersonnelFilterParams } from '../../../interfaces/personnel';
import { useAppSelector } from '../../../store';

export const PersonnelListPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isFullHD = useMediaQuery(theme.breakpoints.up('xl'));

  const { disctributionCenters } = useAppSelector(state => state.maintenance);
  const [openFilter, setOpenFilter] = useState(false);
  const [filters, setFilters] = useState<PersonnelFilterParams>({
    limit: 25,
    offset: 0,
  });

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const { data: areasData } = useGetAreasQuery();
  const { data, isLoading, isFetching } = useGetPersonnelProfilesQuery(filters);

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    setFilters({
      ...filters,
      limit: model.pageSize,
      offset: model.page * model.pageSize,
    });
  };

  const handleFilterChange = (newFilters: PersonnelFilterParams) => {
    setFilters({
      ...newFilters,
      limit: paginationModel.pageSize,
      offset: 0,
    });
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleView = (id: number) => {
    navigate(`/personnel/detail/${id}`);
  };

  const handleCreate = () => {
    navigate('/personnel/create');
  };

  const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLElement>, row: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
    setSelectedRow(null);
  }, []);

  const handleGrantAccess = () => {
    if (selectedRow) {
      // Navegar al formulario de creación de usuario con datos precargados
      navigate('/personnel/grant-access', {
        state: {
          personnel: selectedRow
        }
      });
    }
    handleCloseMenu();
  };

  const handleEdit = () => {
    if (selectedRow) {
      navigate(`/personnel/detail/${selectedRow.id}`);
    }
    handleCloseMenu();
  };

  const handleViewDetails = () => {
    if (selectedRow) {
      navigate(`/personnel/detail/${selectedRow.id}`);
    }
    handleCloseMenu();
  };

  const handleDeactivate = () => {
    if (selectedRow) {
      // TODO: Implementar desactivación de personal
      console.log('Desactivar personal:', selectedRow.id);
    }
    handleCloseMenu();
  };

  const clearFilter = (filterKey: keyof PersonnelFilterParams) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    setFilters(newFilters);
  };

  const columns: GridColDef[] = useMemo(() => {
    const baseColumns: GridColDef[] = [
      {
        field: 'photo_url',
        headerName: '',
        width: 60,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams) => {
          const initials = params.row.full_name
            ? params.row.full_name
                .split(' ')
                .slice(0, 2)
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
            : '?';

          return (
            <Avatar
              src={params.value || undefined}
              alt={params.row.full_name}
              sx={{
                width: 36,
                height: 36,
                fontSize: '0.875rem',
                bgcolor: 'secondary.main',
                fontWeight: 600,
              }}
            >
              {initials}
            </Avatar>
          );
        },
      },
      {
        field: 'employee_code',
        headerName: 'Código',
        width: isMobile ? 100 : 120,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BadgeIcon fontSize="small" color="primary" />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {params.value}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'full_name',
        headerName: 'Nombre Completo',
        flex: 1,
        minWidth: isMobile ? 150 : 200,
        renderCell: (params: GridRenderCellParams) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {params.value}
            </Typography>
            {params.row.username && (
              <Typography variant="caption" color="text.secondary">
                @{params.row.username}
              </Typography>
            )}
          </Box>
        ),
      },
    ];

    if (!isMobile) {
      baseColumns.push(
        {
          field: 'position',
          headerName: 'Posición',
          flex: 1,
          minWidth: 150,
        },
        {
          field: 'hierarchy_level_display',
          headerName: 'Nivel',
          width: 140,
          renderCell: (params: GridRenderCellParams) => (
            <Chip
              label={params.value}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          ),
        }
      );
    }

    if (!isMobile && !isTablet) {
      baseColumns.push(
        {
          field: 'area_name',
          headerName: 'Área',
          width: 150,
        },
        {
          field: 'center_name',
          headerName: 'Centro',
          width: 150,
        },
        {
          field: 'years_of_service',
          headerName: 'Antigüedad',
          width: 120,
          renderCell: (params: GridRenderCellParams) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUpIcon fontSize="small" color="action" />
              <Typography variant="body2">{params.value} años</Typography>
            </Box>
          ),
        }
      );
    }

    baseColumns.push(
      {
        field: 'has_system_access',
        headerName: 'Acceso',
        width: isMobile ? 80 : 100,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams) => (
          <Tooltip title={params.value ? 'Tiene acceso al sistema' : 'Sin acceso al sistema'}>
            {params.value ? (
              <CheckCircleIcon color="success" fontSize="small" />
            ) : (
              <CancelIcon color="disabled" fontSize="small" />
            )}
          </Tooltip>
        ),
      },
      {
        field: 'is_active',
        headerName: 'Estado',
        width: isMobile ? 80 : 100,
        renderCell: (params: GridRenderCellParams) => (
          <Chip
            label={params.value ? 'Activo' : 'Inactivo'}
            size="small"
            color={params.value ? 'success' : 'default'}
            sx={{ fontSize: '0.7rem', fontWeight: 600 }}
          />
        ),
      },
      {
        field: 'actions',
        headerName: '',
        width: 60,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams) => (
          <IconButton
            size="small"
            onClick={(e) => handleOpenMenu(e, params.row)}
            sx={{
              '&:hover': {
                bgcolor: 'rgba(220, 187, 32, 0.1)',
              },
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        ),
      }
    );

    return baseColumns;
  }, [isMobile, isTablet, handleOpenMenu]);

  return (
    <>
      <PersonnelFilters
        open={openFilter}
        handleClose={() => setOpenFilter(false)}
        handleFilter={handleFilterChange}
        filters={filters}
        areas={areasData}
        distributorCenters={disctributionCenters}
      />

      <Container maxWidth={isFullHD ? 'xl' : 'lg'} sx={{ marginTop: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4" component="h1" fontWeight={400}>
              Gestión de Personal
            </Typography>
            <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" component="h2" fontWeight={400}>
              A continuación se muestra el listado completo del personal registrado en el sistema.
            </Typography>
          </Grid>

          <Grid item xs={12} display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="outlined"
              color="secondary"
              endIcon={<FilterListTwoToneIcon />}
              onClick={() => setOpenFilter(true)}
              size={isMobile ? 'small' : 'medium'}
            >
              Filtrar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              size={isMobile ? 'small' : 'medium'}
            >
              {isMobile ? 'Nuevo' : 'Nuevo Personal'}
            </Button>
          </Grid>

          {/* Filtros activos */}
          <Grid item xs={12}>
            <Grid container spacing={1}>
              {filters.search && (
                <ChipFilterCategory
                  label="Buscar: "
                  items={[
                    {
                      label: filters.search,
                      id: "search",
                      deleteAction: () => clearFilter('search'),
                    },
                  ]}
                />
              )}
              {filters.area && areasData && (
                <ChipFilterCategory
                  label="Área: "
                  items={[
                    {
                      label: areasData.find(a => a.id === filters.area)?.name || '',
                      id: "area",
                      deleteAction: () => clearFilter('area'),
                    },
                  ]}
                />
              )}
              {filters.distributor_center && (
                <ChipFilterCategory
                  label="Centro: "
                  items={[
                    {
                      label: disctributionCenters.find(dc => dc.id === filters.distributor_center)?.name || '',
                      id: "distributor_center",
                      deleteAction: () => clearFilter('distributor_center'),
                    },
                  ]}
                />
              )}
              {filters.is_active !== undefined && (
                <ChipFilterCategory
                  label="Estado: "
                  items={[
                    {
                      label: filters.is_active ? 'Activos' : 'Inactivos',
                      id: "is_active",
                      deleteAction: () => clearFilter('is_active'),
                    },
                  ]}
                />
              )}
            </Grid>
          </Grid>

          {/* DataGrid */}
          <Grid item xs={12}>
            <Card variant="outlined">
              {data?.count === 0 && !isLoading && (
                <Alert severity="info" sx={{ m: 2 }}>
                  No se encontraron resultados con los filtros aplicados.
                </Alert>
              )}

              <DataGrid
                rows={data?.results || []}
                columns={columns}
                loading={isLoading || isFetching}
                paginationModel={paginationModel}
                onPaginationModelChange={handlePaginationChange}
                onRowDoubleClick={(params) => navigate(`/personnel/detail/${params.row.id}`)}
                pageSizeOptions={[10, 25, 50, 100]}
                rowCount={data?.count || 0}
                paginationMode="server"
                disableRowSelectionOnClick
                autoHeight
                sx={{
                  border: 0,
                  '& .MuiDataGrid-cell': {
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    fontWeight: 600,
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: `1px solid ${theme.palette.divider}`,
                  },
                }}
                slots={{
                  noRowsOverlay: () => (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body2" color="text.secondary">
                        No se encontraron resultados
                      </Typography>
                    </Box>
                  ),
                  loadingOverlay: () => (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ),
                }}
              />
            </Card>
          </Grid>

          {/* Stats Footer */}
          {data && data.count > 0 && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Chip
                  label={`Total: ${data.count} personas`}
                  color="primary"
                  variant="outlined"
                  size={isMobile ? 'small' : 'medium'}
                />
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>

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
            minWidth: 200,
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
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Ver Detalle</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" color="secondary" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>

        {selectedRow && !selectedRow.has_system_access && (
          <MenuItem onClick={handleGrantAccess}>
            <ListItemIcon>
              <PersonAddIcon fontSize="small" sx={{ color: 'success.main' }} />
            </ListItemIcon>
            <ListItemText>Dar Acceso al Sistema</ListItemText>
          </MenuItem>
        )}

        {selectedRow && selectedRow.is_active && (
          <MenuItem onClick={handleDeactivate}>
            <ListItemIcon>
              <BlockIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Desactivar Personal</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
