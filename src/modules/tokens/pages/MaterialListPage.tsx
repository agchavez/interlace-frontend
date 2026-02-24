/**
 * Pagina de listado de Materiales
 * CRUD completo para gestionar el catalogo de materiales
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import BootstrapDialogTitle from '../../ui/components/BootstrapDialogTitle';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  QrCode as QrCodeIcon,
  Description as DescriptionIcon,
  Scale as ScaleIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';
import { toast } from 'sonner';
import {
  useGetMaterialsQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
  useGetMaterialCategoriesQuery,
  useGetUnitsOfMeasureQuery,
} from '../services/tokenApi';
import { Material, MaterialCreatePayload } from '../interfaces/token';

// Initial form state
const initialFormData: MaterialCreatePayload = {
  code: '',
  name: '',
  description: '',
  unit_of_measure: 0,
  unit_value: 0,
  requires_return: false,
  category: '',
};

export const MaterialListPage = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState<MaterialCreatePayload>(initialFormData);
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null);

  // API hooks
  const { data: materialsData, isLoading, refetch } = useGetMaterialsQuery({
    search: search || undefined,
    category: categoryFilter || undefined,
    limit: paginationModel.pageSize,
    offset: paginationModel.page * paginationModel.pageSize,
  });

  const { data: categoriesData } = useGetMaterialCategoriesQuery();
  const { data: unitsData } = useGetUnitsOfMeasureQuery({ limit: 100 });

  const [createMaterial, { isLoading: isCreating }] = useCreateMaterialMutation();
  const [updateMaterial, { isLoading: isUpdating }] = useUpdateMaterialMutation();
  const [deleteMaterial, { isLoading: isDeleting }] = useDeleteMaterialMutation();

  const materials = materialsData?.results || [];
  const totalCount = materialsData?.count || 0;
  const categories = categoriesData || [];
  const units = unitsData?.results || [];

  // Handlers
  const handleOpenCreate = () => {
    setFormData(initialFormData);
    setEditingMaterial(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (material: Material) => {
    setFormData({
      code: material.code,
      name: material.name,
      description: material.description,
      unit_of_measure: material.unit_of_measure,
      unit_value: material.unit_value,
      requires_return: material.requires_return,
      category: material.category,
    });
    setEditingMaterial(material);
    setOpenForm(true);
  };

  const handleOpenDelete = (material: Material) => {
    setDeletingMaterial(material);
    setOpenDelete(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingMaterial(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error('Codigo y nombre son requeridos');
      return;
    }
    if (!formData.unit_of_measure) {
      toast.error('Unidad de medida es requerida');
      return;
    }

    try {
      if (editingMaterial) {
        await updateMaterial({ id: editingMaterial.id, data: formData }).unwrap();
        toast.success('Material actualizado');
      } else {
        await createMaterial(formData).unwrap();
        toast.success('Material creado');
      }
      handleCloseForm();
      refetch();
    } catch (error: unknown) {
      const err = error as { data?: { detail?: string; code?: string[] } };
      if (err?.data?.code) {
        toast.error(`Codigo: ${err.data.code[0]}`);
      } else {
        toast.error(err?.data?.detail || 'Error al guardar');
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingMaterial) return;

    try {
      await deleteMaterial(deletingMaterial.id).unwrap();
      toast.success('Material eliminado');
      setOpenDelete(false);
      setDeletingMaterial(null);
      refetch();
    } catch (error: unknown) {
      const err = error as { data?: { detail?: string } };
      toast.error(err?.data?.detail || 'Error al eliminar');
    }
  };

  // DataGrid columns
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'code',
      headerName: 'Codigo',
      width: 120,
      renderCell: (params: GridRenderCellParams<Material>) => (
        <Chip label={params.row.code} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<Material>) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.row.name}
          </Typography>
          {params.row.description && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'category',
      headerName: 'Categoria',
      width: 140,
      renderCell: (params: GridRenderCellParams<Material>) => (
        params.row.category ? (
          <Chip
            icon={<CategoryIcon />}
            label={params.row.category}
            size="small"
            variant="outlined"
          />
        ) : '-'
      ),
    },
    {
      field: 'unit_of_measure_name',
      headerName: 'Unidad',
      width: 120,
    },
    {
      field: 'unit_value',
      headerName: 'Valor Unit.',
      width: 120,
      renderCell: (params: GridRenderCellParams<Material>) => (
        <Typography variant="body2">
          L {parseFloat(params.row.unit_value as any || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      field: 'requires_return',
      headerName: 'Retornable',
      width: 100,
      renderCell: (params: GridRenderCellParams<Material>) => (
        <Chip
          label={params.row.requires_return ? 'Si' : 'No'}
          color={params.row.requires_return ? 'warning' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Material>) => (
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
        <Typography variant="h5">Materiales</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Nuevo Material
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <TextField
          placeholder="Buscar por codigo, nombre..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Categoria</InputLabel>
          <Select
            value={categoryFilter}
            label="Categoria"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Card variant="outlined">
            <DataGrid
              rows={materials}
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
                noRowsLabel: 'No hay materiales registrados',
                MuiTablePagination: {
                  labelRowsPerPage: 'Filas por pagina',
                },
              }}
            />
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <BootstrapDialogTitle id="material-dialog" onClose={handleCloseForm}>
          <Typography variant="subtitle1" fontWeight={600} color="white">
            {editingMaterial ? 'Editar Material' : 'Nuevo Material'}
          </Typography>
        </BootstrapDialogTitle>
        <DialogContent sx={{ pt: 4, pb: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Complete los datos del material para el catalogo de pases de salida
          </Alert>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Codigo"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <QrCodeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                size="small"
                label="Nombre del Material"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InventoryIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Descripcion"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripcion detallada del material..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <DescriptionIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Unidad de Medida</InputLabel>
                <Select
                  value={formData.unit_of_measure || ''}
                  label="Unidad de Medida"
                  onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value as number })}
                  startAdornment={
                    <InputAdornment position="start">
                      <ScaleIcon color="action" />
                    </InputAdornment>
                  }
                >
                  {units.map((unit) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.code} - {unit.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Categoria"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ej: Herramientas, Equipos..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Valor Unitario (HNL)"
                type="number"
                inputProps={{ step: 0.01, min: 0 }}
                value={formData.unit_value}
                onChange={(e) => setFormData({ ...formData, unit_value: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', pl: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={formData.requires_return}
                      onChange={(e) => setFormData({ ...formData, requires_return: e.target.checked })}
                      color="warning"
                    />
                  }
                  label="Requiere devolucion"
                />
              </Box>
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
            size="small"
            disabled={isCreating || isUpdating}
            startIcon={isCreating || isUpdating ? <CircularProgress size={16} /> : <AddIcon />}
          >
            {editingMaterial ? 'Actualizar' : 'Registrar Material'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)} maxWidth="xs" fullWidth>
        <BootstrapDialogTitle id="delete-material-dialog" onClose={() => setOpenDelete(false)}>
          <Typography variant="subtitle1" fontWeight={600} color="white">
            Confirmar Eliminacion
          </Typography>
        </BootstrapDialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta accion no se puede deshacer.
          </Alert>
          <Typography variant="body2">
            ¿Esta seguro que desea eliminar el material <strong>{deletingMaterial?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Codigo: {deletingMaterial?.code}
          </Typography>
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
