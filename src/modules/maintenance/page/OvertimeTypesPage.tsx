import { useState } from 'react';
import {
  Box,
  Card,
  Container,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  styled,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useGetOvertimeTypesQuery,
  useCreateOvertimeTypeMutation,
  useUpdateOvertimeTypeMutation,
  useDeleteOvertimeTypeMutation,
} from '../../tokens/services/tokenApi';
import { toast } from 'sonner';
import BootstrapDialogTitle from '../../ui/components/BootstrapDialogTitle';
import { tableBase } from '../../ui';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

interface FormData {
  category: string;
  name: string;
  description: string;
  default_multiplier: number;
  is_active: boolean;
}

const initialFormData: FormData = {
  category: '',
  name: '',
  description: '',
  default_multiplier: 1.5,
  is_active: true,
};

export const OvertimeTypesPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading, refetch } = useGetOvertimeTypesQuery({ limit: 100 });
  const items = data?.results || [];
  const [createItem, { isLoading: isCreating }] = useCreateOvertimeTypeMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateOvertimeTypeMutation();
  const [deleteItem] = useDeleteOvertimeTypeMutation();

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        category: item.category || '',
        name: item.name,
        description: item.description || '',
        default_multiplier: item.default_multiplier,
        is_active: item.is_active,
      });
    } else {
      setEditingItem(null);
      setFormData(initialFormData);
    }
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData(initialFormData);
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nombre es requerido';
    if (formData.default_multiplier <= 0) newErrors.default_multiplier = 'El multiplicador debe ser mayor a 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (editingItem) {
        await updateItem({ id: editingItem.id, data: formData }).unwrap();
        toast.success('Tipo de hora extra actualizado');
      } else {
        await createItem(formData).unwrap();
        toast.success('Tipo de hora extra creado');
      }
      handleCloseDialog();
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.detail?.message || error?.data?.detail || 'Error al guardar';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este tipo de hora extra?')) return;
    try {
      const result: any = await deleteItem(id).unwrap();
      if (result?.detail) {
        toast.success(result.detail);
      } else {
        toast.success('Tipo de hora extra eliminado');
      }
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.detail?.message || error?.data?.detail || 'Error al eliminar';
      toast.error(errorMessage);
    }
  };

  const columns: GridColDef[] = [
    { field: 'category', headerName: 'Categoría', width: 150 },
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 200 },
    { field: 'description', headerName: 'Descripción', flex: 1, minWidth: 200 },
    {
      field: 'default_multiplier',
      headerName: 'Multiplicador',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={`x${params.value}`} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      field: 'is_active',
      headerName: 'Activo',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'Sí' : 'No'}
          size="small"
          color={params.value ? 'success' : 'error'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton size="small" color="primary" onClick={() => handleOpenDialog(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight={400}>
          Tipos de Horas Extra
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Nuevo Tipo
        </Button>
      </Box>
      <Divider sx={{ mb: 3 }} />

      <Card variant="outlined">
        <DataGrid
          {...tableBase}
          rows={items}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          initialState={{
            pagination: { paginationModel: { pageSize: 15 } },
          }}
        />
      </Card>

      <BootstrapDialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <BootstrapDialogTitle id="overtime-type-dialog" onClose={handleCloseDialog}>
          {editingItem ? 'Editar Tipo de Hora Extra' : 'Nuevo Tipo de Hora Extra'}
        </BootstrapDialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Categoría"
                fullWidth
                size="small"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                helperText="Opcional - para agrupar tipos"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre"
                fullWidth
                size="small"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                fullWidth
                size="small"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Multiplicador por Defecto"
                type="number"
                fullWidth
                size="small"
                inputProps={{ step: 0.1, min: 0.1 }}
                value={formData.default_multiplier}
                onChange={(e) => setFormData({ ...formData, default_multiplier: parseFloat(e.target.value) || 1 })}
                error={!!errors.default_multiplier}
                helperText={errors.default_multiplier || 'Ej: 1.5 = tiempo y medio'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Activo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isCreating || isUpdating}>
            {editingItem ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </Container>
  );
};
