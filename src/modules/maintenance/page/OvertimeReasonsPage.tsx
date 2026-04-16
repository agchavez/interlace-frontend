import { useState } from 'react';
import {
  Box,
  Card,
  Alert,
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
  styled,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useGetOvertimeReasonsQuery,
  useCreateOvertimeReasonMutation,
  useUpdateOvertimeReasonMutation,
  useDeleteOvertimeReasonMutation,
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
  is_active: boolean;
}

const initialFormData: FormData = {
  category: '',
  name: '',
  description: '',
  is_active: true,
};

export const OvertimeReasonsPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading, refetch } = useGetOvertimeReasonsQuery({ limit: 100 });
  const items = data?.results || [];
  const [createItem, { isLoading: isCreating }] = useCreateOvertimeReasonMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateOvertimeReasonMutation();
  const [deleteItem] = useDeleteOvertimeReasonMutation();

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        category: item.category || '',
        name: item.name,
        description: item.description || '',
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (editingItem) {
        await updateItem({ id: editingItem.id, data: formData }).unwrap();
        toast.success('Motivo de hora extra actualizado');
      } else {
        await createItem(formData).unwrap();
        toast.success('Motivo de hora extra creado');
      }
      handleCloseDialog();
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.detail?.message || error?.data?.detail || 'Error al guardar';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este motivo de hora extra?')) return;
    try {
      const result: any = await deleteItem(id).unwrap();
      if (result?.detail) {
        toast.success(result.detail);
      } else {
        toast.success('Motivo de hora extra eliminado');
      }
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.detail?.message || error?.data?.detail || 'Error al eliminar';
      toast.error(errorMessage);
    }
  };

  const columns: GridColDef[] = [
    { field: 'category', headerName: 'Categoría', width: 180 },
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 250 },
    { field: 'description', headerName: 'Descripción', flex: 1, minWidth: 250 },
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={400}>
            Motivos de Horas Extra
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Configure los motivos por los cuales se pueden solicitar horas extra
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Nuevo Motivo
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Motivos:</strong> Los motivos definidos aquí estarán disponibles al crear tokens de horas extra. Solo los motivos activos serán visibles.
      </Alert>

      <Card>
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
        <BootstrapDialogTitle id="overtime-reason-dialog" onClose={handleCloseDialog}>
          {editingItem ? 'Editar Motivo de Hora Extra' : 'Nuevo Motivo de Hora Extra'}
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
                helperText="Opcional - para agrupar motivos"
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
            <Grid item xs={12}>
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
    </Box>
  );
};
