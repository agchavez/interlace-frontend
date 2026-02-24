import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useCreateDepartmentMutation } from '../services/personnelApi';
import { toast } from 'sonner';
import BootstrapDialogTitle from '../../ui/components/BootstrapDialogTitle';
import type { Department } from '../../../interfaces/personnel';

interface AddDepartmentDialogProps {
  open: boolean;
  onClose: () => void;
  areaId: number;
  onDepartmentCreated: (department: Department) => void;
}

export const AddDepartmentDialog: React.FC<AddDepartmentDialogProps> = ({
  open,
  onClose,
  areaId,
  onDepartmentCreated,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createDepartment, { isLoading }] = useCreateDepartmentMutation();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    // Validations
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await createDepartment({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        area: areaId,
        is_active: true,
      }).unwrap();

      toast.success('Departamento creado exitosamente');
      onDepartmentCreated(result);
      handleClose();
    } catch (error: any) {
      console.error('Error creating department:', error);

      if (error.data) {
        if (typeof error.data === 'object') {
          const newErrors: Record<string, string> = {};
          Object.entries(error.data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              newErrors[key] = value[0];
            } else {
              newErrors[key] = String(value);
            }
          });
          setErrors(newErrors);
          toast.error('Por favor corrige los errores en el formulario');
        } else {
          toast.error(error.data.detail || 'Error al crear el departamento');
        }
      } else {
        toast.error('Error al crear el departamento');
      }
    }
  };

  const handleClose = () => {
    setFormData({ name: '', code: '', description: '' });
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <BootstrapDialogTitle id="add-department-dialog-title" onClose={handleClose}>
        Nuevo Departamento
      </BootstrapDialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              size="small"
              label="Nombre del Departamento"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              placeholder="Ej: Almacén General"
              autoFocus
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              size="small"
              label="Código"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              error={!!errors.code}
              helperText={errors.code || 'Código único del departamento'}
              placeholder="Ej: ALM-GEN"
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Descripción (Opcional)"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={2}
              placeholder="Descripción breve del departamento"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Creando...' : 'Crear Departamento'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
