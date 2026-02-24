/**
 * Pagina de listado de Personas Externas (Proveedores/Visitantes)
 * Para gestionar el catalogo de personas externas que pueden recibir pases de salida
 */
import { useState, useMemo } from 'react';
import {
  Container,
  Grid,
  Card,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Divider,
  TextField,
  Dialog,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import BootstrapDialogTitle from '../../ui/components/BootstrapDialogTitle';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PersonOff as PersonOffIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';
import { toast } from 'sonner';
import {
  useGetExternalPersonsQuery,
  useCreateExternalPersonMutation,
  useUpdateExternalPersonMutation,
  useDeleteExternalPersonMutation,
} from '../services/tokenApi';
import { ExternalPerson, ExternalPersonCreatePayload } from '../interfaces/token';

// Initial form state
const initialFormData: ExternalPersonCreatePayload = {
  name: '',
  company: '',
  identification: '',
  phone: '',
  email: '',
  notes: '',
  is_active: true,
};

export const ExternalPersonListPage = () => {
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [editingPerson, setEditingPerson] = useState<ExternalPerson | null>(null);
  const [formData, setFormData] = useState<ExternalPersonCreatePayload>(initialFormData);
  const [deletingPerson, setDeletingPerson] = useState<ExternalPerson | null>(null);

  // API hooks
  const { data: externalPersonsData, isLoading, refetch } = useGetExternalPersonsQuery({
    search: search || undefined,
    limit: paginationModel.pageSize,
    offset: paginationModel.page * paginationModel.pageSize,
  });

  const [createPerson, { isLoading: isCreating }] = useCreateExternalPersonMutation();
  const [updatePerson, { isLoading: isUpdating }] = useUpdateExternalPersonMutation();
  const [deletePerson, { isLoading: isDeleting }] = useDeleteExternalPersonMutation();

  const externalPersons = externalPersonsData?.results || [];
  const totalCount = externalPersonsData?.count || 0;

  // Handlers
  const handleOpenCreate = () => {
    setFormData(initialFormData);
    setEditingPerson(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (person: ExternalPerson) => {
    setFormData({
      name: person.name,
      company: person.company,
      identification: person.identification,
      phone: person.phone,
      email: person.email,
      notes: person.notes,
      is_active: person.is_active,
    });
    setEditingPerson(person);
    setOpenForm(true);
  };

  const handleOpenDelete = (person: ExternalPerson) => {
    setDeletingPerson(person);
    setOpenDelete(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingPerson(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      if (editingPerson) {
        await updatePerson({ id: editingPerson.id, data: formData }).unwrap();
        toast.success('Persona externa actualizada');
      } else {
        await createPerson(formData).unwrap();
        toast.success('Persona externa creada');
      }
      handleCloseForm();
      refetch();
    } catch (error: unknown) {
      const err = error as { data?: { detail?: string } };
      toast.error(err?.data?.detail || 'Error al guardar');
    }
  };

  const handleDelete = async () => {
    if (!deletingPerson) return;

    try {
      await deletePerson(deletingPerson.id).unwrap();
      toast.success('Persona externa eliminada');
      setOpenDelete(false);
      setDeletingPerson(null);
      refetch();
    } catch (error: unknown) {
      const err = error as { data?: { detail?: string } };
      toast.error(err?.data?.detail || 'Error al eliminar');
    }
  };

  // DataGrid columns
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<ExternalPerson>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: params.row.is_active ? 'warning.main' : 'grey.400',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          >
            {params.row.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {params.row.name}
            </Typography>
            {params.row.identification && (
              <Typography variant="caption" color="text.secondary">
                {params.row.identification}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      field: 'company',
      headerName: 'Empresa',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<ExternalPerson>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {params.row.company || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'phone',
      headerName: 'Telefono',
      width: 140,
      renderCell: (params: GridRenderCellParams<ExternalPerson>) => (
        params.row.phone ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon fontSize="small" color="action" />
            <Typography variant="body2">{params.row.phone}</Typography>
          </Box>
        ) : '-'
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<ExternalPerson>) => (
        params.row.email ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon fontSize="small" color="action" />
            <Typography variant="body2">{params.row.email}</Typography>
          </Box>
        ) : '-'
      ),
    },
    {
      field: 'is_active',
      headerName: 'Estado',
      width: 100,
      renderCell: (params: GridRenderCellParams<ExternalPerson>) => (
        <Chip
          label={params.row.is_active ? 'Activo' : 'Inactivo'}
          color={params.row.is_active ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams<ExternalPerson>) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleOpenEdit(params.row)}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleOpenDelete(params.row)}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ], []);

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Personas Externas</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          color="warning"
        >
          Nueva Persona
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          placeholder="Buscar por nombre, empresa o identificacion..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 350 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Card variant="outlined">
            <DataGrid
              rows={externalPersons}
              columns={columns}
              loading={isLoading}
              rowCount={totalCount}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              autoHeight
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell:focus': { outline: 'none' },
                '& .MuiDataGrid-columnHeader:focus': { outline: 'none' },
              }}
              localeText={{
                noRowsLabel: 'No hay personas externas registradas',
                MuiTablePagination: {
                  labelRowsPerPage: 'Filas por pagina',
                },
              }}
            />
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <BootstrapDialogTitle id="external-person-dialog" onClose={handleCloseForm}>
          <Typography variant="subtitle1" fontWeight={600} color="white">
            {editingPerson ? 'Editar Persona Externa' : 'Nueva Persona Externa'}
          </Typography>
        </BootstrapDialogTitle>
        <DialogContent sx={{ pt: 4, pb: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Complete los datos de la persona externa (proveedor, visitante, contratista, etc.)
          </Alert>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Nombre Completo"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Empresa / Organizacion"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Identificacion (ID/RTN/DNI)"
                value={formData.identification}
                onChange={(e) => setFormData({ ...formData, identification: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Telefono"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Correo Electronico"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Notas / Observaciones"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informacion adicional sobre esta persona..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <NotesIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseForm} color="inherit" size="small">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="warning"
            size="small"
            disabled={isCreating || isUpdating}
            startIcon={isCreating || isUpdating ? <CircularProgress size={16} /> : <AddIcon />}
          >
            {editingPerson ? 'Actualizar' : 'Registrar Persona'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)} maxWidth="xs" fullWidth>
        <BootstrapDialogTitle id="delete-person-dialog" onClose={() => setOpenDelete(false)}>
          <Typography variant="subtitle1" fontWeight={600} color="white">
            Confirmar Eliminacion
          </Typography>
        </BootstrapDialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta accion no se puede deshacer.
          </Alert>
          <Typography variant="body2">
            ¿Esta seguro que desea eliminar a <strong>{deletingPerson?.name}</strong>?
          </Typography>
          {deletingPerson?.company && (
            <Typography variant="body2" color="text.secondary">
              Empresa: {deletingPerson.company}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDelete(false)} color="inherit" size="small">
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            size="small"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
