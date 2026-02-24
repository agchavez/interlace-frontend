import { useEffect, useState, useMemo } from 'react';
import { Autocomplete, TextField, createFilterOptions, CircularProgress } from '@mui/material';
import { toast } from 'sonner';
import { useGetDepartmentsQuery, useCreateDepartmentMutation } from '../services/personnelApi';
import type { Department } from '../../../interfaces/personnel';

const filter = createFilterOptions<Department>();

interface DepartmentSelectorProps {
  value: number | null;
  onChange: (value: number | null, department: Department | null) => void;
  areaId?: number | null;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  size?: 'small' | 'medium';
}

export const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
  value,
  onChange,
  areaId,
  error,
  helperText,
  disabled = false,
  required = false,
  label = 'Departamento',
  size = 'small',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [initialDepartment, setInitialDepartment] = useState<Department | null>(null);

  const { data: departmentsData, isLoading, isFetching } = useGetDepartmentsQuery(
    {
      search: searchTerm.length > 2 ? searchTerm : undefined, // Solo buscar si hay 3+ caracteres
      area: areaId || undefined,
    },
    {
      skip: !areaId, // Solo ejecutar query si hay área seleccionada
    }
  );

  const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();

  const departments = Array.isArray(departmentsData) ? departmentsData : [];

  // Capturar el departamento inicial cuando se encuentra en los resultados
  useEffect(() => {
    if (value && departments.length > 0 && !initialDepartment) {
      const found = departments.find((dept) => dept.id === value);
      if (found) {
        setInitialDepartment(found);
        setInputValue(found.name);
      }
    }
  }, [value, departments, initialDepartment]);

  // Limpiar inputValue cuando cambia el área
  useEffect(() => {
    setInputValue('');
    setSearchTerm('');
    setInitialDepartment(null);
    // Limpiar selección si cambia el área
    if (value !== null) {
      onChange(null, null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaId]);

  const handleInputChange = (_: any, newInputValue: string) => {
    setInputValue(newInputValue);
    // Hacer búsqueda en servidor solo si hay más de 2 caracteres
    // Esto reduce la carga del servidor, pero permite filtrado local
    if (newInputValue.length > 2) {
      setSearchTerm(newInputValue);
    } else if (newInputValue.length === 0) {
      setSearchTerm(''); // Limpiar búsqueda cuando está vacío
    }
    // Para 1-2 caracteres, no actualizar searchTerm (usa filtrado local de Autocomplete)
  };

  const handleCreateDepartment = async (departmentName: string) => {
    if (departmentName.length < 3) {
      toast.error('El nombre del departamento debe tener al menos 3 caracteres');
      return;
    }

    if (!areaId) {
      toast.error('Primero debe seleccionar un área');
      return;
    }

    try {
      const newDepartment = await createDepartment({
        name: departmentName,
        area: areaId,
        is_active: true,
      }).unwrap();

      toast.success(`Departamento "${departmentName}" creado exitosamente`);

      // Seleccionar automáticamente el nuevo departamento
      onChange(newDepartment.id, newDepartment);
      setInputValue(newDepartment.name);
    } catch (error: any) {
      console.error('Error creating department:', error);
      toast.error(error?.data?.name?.[0] || 'Error al crear el departamento');
    }
  };

  // Usar departamento de la lista actual, o el inicial si no está en la lista
  const selectedDepartment = departments.find((dept) => dept.id === value) || initialDepartment || null;

  // Combinar departamentos: incluir el inicial si existe y no está en la lista
  const allDepartments = useMemo(() => {
    if (initialDepartment && !departments.find((d) => d.id === initialDepartment.id)) {
      return [initialDepartment, ...departments];
    }
    return departments;
  }, [departments, initialDepartment]);

  return (
    <Autocomplete
      id={`department-selector-${areaId || 'no-area'}`}
      value={selectedDepartment}
      inputValue={inputValue}
      onChange={(_, newValue) => {
        if (newValue === null) {
          setInputValue('');
          onChange(null, null);
          return;
        }

        // Si es la opción especial "Agregar..."
        if (typeof newValue === 'object' && newValue.id === -1) {
          const departmentName = newValue.name.replace('Agregar ', '').trim();
          handleCreateDepartment(departmentName);
          return;
        }

        // Opción normal
        onChange(newValue.id, newValue);
        setInputValue(newValue.name);
      }}
      onInputChange={handleInputChange}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        const exists = options.some(
          (option) => inputValue.trim().toLowerCase() === option.name.toLowerCase()
        );

        // Si no existe y hay input, agregar opción "Agregar..."
        if (inputValue !== '' && !exists && inputValue.length >= 3) {
          filtered.push({
            id: -1,
            name: `Agregar ${inputValue}`,
            area: areaId || 0,
            is_active: true,
          } as Department);
        }

        return filtered;
      }}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      options={allDepartments}
      loading={isLoading || isFetching || isCreating}
      disabled={disabled || !areaId}
      size={size}
      noOptionsText={
        !areaId
          ? 'Primero seleccione un área'
          : isLoading || isFetching
          ? 'Cargando...'
          : 'No hay departamentos disponibles'
      }
      loadingText="Cargando..."
      clearText="Limpiar"
      renderInput={(params) => (
        <TextField
          {...params}
          label={required ? `${label} *` : label}
          error={!!error}
          helperText={error || helperText || (!areaId ? 'Seleccione un área primero' : 'Busque o cree un departamento')}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {(isLoading || isFetching || isCreating) ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};
