/**
 * Pagina de listado de Productos
 * CRUD completo para gestionar el catalogo de productos
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
  useTheme,
  useMediaQuery,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';
import { toast } from 'sonner';
import {
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../../../store/maintenance/maintenanceApi';
import { Product } from '../../../interfaces/tracking';

// Initial form state
const initialFormData: Partial<Product> = {
  name: '',
  sap_code: '',
  brand: '',
  bar_code: '',
  boxes_pre_pallet: 0,
  useful_life: 0,
  standard_cost: '0',
  division: '',
  class_product: '',
  size: '',
  packaging: '',
  weight: '0',
};

export const ProductListPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  // Dialog states
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>(initialFormData);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // API hooks
  const { data: productsData, isLoading, refetch } = useGetProductQuery({
    search: search || undefined,
    limit: paginationModel.pageSize,
    offset: paginationModel.page * paginationModel.pageSize,
  });

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const products = productsData?.results || [];
  const totalCount = productsData?.count || 0;

  // Handlers
  const handleOpenCreate = () => {
    setFormData(initialFormData);
    setEditingProduct(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (product: Product) => {
    setFormData({
      name: product.name,
      sap_code: product.sap_code,
      brand: product.brand,
      bar_code: product.bar_code,
      boxes_pre_pallet: product.boxes_pre_pallet,
      useful_life: product.useful_life,
      standard_cost: product.standard_cost,
      division: product.division,
      class_product: product.class_product,
      size: product.size,
      packaging: product.packaging,
      weight: product.weight,
    });
    setEditingProduct(product);
    setOpenForm(true);
  };

  const handleOpenDelete = (product: Product) => {
    setDeletingProduct(product);
    setOpenDelete(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingProduct(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async () => {
    if (!formData.name?.trim() || !formData.sap_code?.trim()) {
      toast.error('Nombre y codigo SAP son requeridos');
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, data: formData }).unwrap();
        toast.success('Producto actualizado');
      } else {
        await createProduct(formData).unwrap();
        toast.success('Producto creado');
      }
      handleCloseForm();
      refetch();
    } catch (error: unknown) {
      const err = error as { data?: { detail?: string; sap_code?: string[] } };
      if (err?.data?.sap_code) {
        toast.error(`Codigo SAP: ${err.data.sap_code[0]}`);
      } else {
        toast.error(err?.data?.detail || 'Error al guardar');
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    try {
      await deleteProduct(deletingProduct.id).unwrap();
      toast.success('Producto eliminado');
      setOpenDelete(false);
      setDeletingProduct(null);
      refetch();
    } catch (error: unknown) {
      const err = error as { data?: { detail?: string } };
      toast.error(err?.data?.detail || 'Error al eliminar');
    }
  };

  // DataGrid columns
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'sap_code',
      headerName: 'Codigo SAP',
      width: 120,
      renderCell: (params: GridRenderCellParams<Product>) => (
        <Chip label={params.row.sap_code} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<Product>) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.row.name}
          </Typography>
          {params.row.brand && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.brand}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'bar_code',
      headerName: 'Codigo Barras',
      width: 140,
    },
    {
      field: 'division',
      headerName: 'Division',
      width: 120,
    },
    {
      field: 'boxes_pre_pallet',
      headerName: 'Cajas/Pallet',
      width: 100,
      type: 'number',
    },
    {
      field: 'useful_life',
      headerName: 'Vida Util',
      width: 100,
      type: 'number',
      renderCell: (params: GridRenderCellParams<Product>) => (
        <Typography variant="body2">
          {params.row.useful_life} dias
        </Typography>
      ),
    },
    {
      field: 'standard_cost',
      headerName: 'Costo',
      width: 100,
      renderCell: (params: GridRenderCellParams<Product>) => (
        <Typography variant="body2">
          L {parseFloat(params.row.standard_cost || '0').toFixed(2)}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Product>) => (
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
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems={isMobile ? 'flex-start' : 'center'}
            flexDirection={isMobile ? 'column' : 'row'}
            gap={2}
          >
            <Box>
              <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={400}>
                Productos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Catalogo de productos del sistema
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
            >
              Nuevo Producto
            </Button>
          </Box>
          <Divider sx={{ mt: 2 }} />
        </Grid>

        {/* Filters */}
        <Grid item xs={12}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              placeholder="Buscar por codigo, nombre..."
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: isMobile ? '100%' : 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Grid>

        {/* DataGrid */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <DataGrid
              rows={products}
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
                noRowsLabel: 'No hay productos registrados',
                MuiTablePagination: {
                  labelRowsPerPage: 'Filas por pagina',
                },
              }}
            />
          </Card>
        </Grid>
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InventoryIcon color="primary" />
            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Codigo SAP"
                required
                value={formData.sap_code || ''}
                onChange={(e) => setFormData({ ...formData, sap_code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Nombre"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Marca"
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Codigo de Barras"
                value={formData.bar_code || ''}
                onChange={(e) => setFormData({ ...formData, bar_code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Division"
                value={formData.division || ''}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Clase"
                value={formData.class_product || ''}
                onChange={(e) => setFormData({ ...formData, class_product: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Tamano"
                value={formData.size || ''}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Empaque"
                value={formData.packaging || ''}
                onChange={(e) => setFormData({ ...formData, packaging: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Cajas por Pallet"
                type="number"
                inputProps={{ min: 0 }}
                value={formData.boxes_pre_pallet || 0}
                onChange={(e) => setFormData({ ...formData, boxes_pre_pallet: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Vida Util (dias)"
                type="number"
                inputProps={{ min: 0 }}
                value={formData.useful_life || 0}
                onChange={(e) => setFormData({ ...formData, useful_life: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Costo Estandar (HNL)"
                type="number"
                inputProps={{ step: 0.01, min: 0 }}
                value={formData.standard_cost || '0'}
                onChange={(e) => setFormData({ ...formData, standard_cost: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Peso"
                value={formData.weight || '0'}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseForm} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isCreating || isUpdating}
            startIcon={isCreating || isUpdating ? <CircularProgress size={16} /> : undefined}
          >
            {editingProduct ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Confirmar Eliminacion</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta accion no se puede deshacer.
          </Alert>
          <Typography>
            Esta seguro que desea eliminar el producto <strong>{deletingProduct?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Codigo SAP: {deletingProduct?.sap_code}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
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
