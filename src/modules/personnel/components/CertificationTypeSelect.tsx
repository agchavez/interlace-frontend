import { useEffect, useState } from 'react';
import { Autocomplete, TextField, createFilterOptions, InputAdornment } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import { toast } from 'sonner';
import {
  useGetCertificationTypesQuery,
  useCreateCertificationTypeMutation
} from '../services/personnelApi';

const filter = createFilterOptions<any>();

interface CertificationTypeSelectProps {
  value: any | null;
  onChange: (value: any | null) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  allowCreate?: boolean;
}

export const CertificationTypeSelect = ({
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  allowCreate = true,
}: CertificationTypeSelectProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: certificationTypesData, refetch, isFetching, isLoading } = useGetCertificationTypesQuery();
  const [createCertificationType, { isLoading: isCreating, isSuccess: isCreated, data: createdData, reset: resetCreate }] = useCreateCertificationTypeMutation();

  const certificationTypes = certificationTypesData?.results || [];

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (isCreated && createdData) {
      toast.success('Tipo de certificación creado', {
        description: `${createdData.name} (${createdData.code})`,
      });
      onChange(createdData);
      resetCreate();
      setSearchQuery('');
    }
  }, [isCreated, createdData, onChange, resetCreate]);

  const handleCreate = (inputValue: string) => {
    if (inputValue.length > 2) {
      // Generar código a partir del nombre (convertir a mayúsculas y quitar espacios)
      const code = inputValue.toUpperCase().replace(/\s+/g, '_');
      createCertificationType({ name: inputValue, code });
    }
  };

  const handleInputChange = (newInputValue: string) => {
    setSearchQuery(newInputValue);
  };

  return (
    <Autocomplete
      value={value}
      getOptionLabel={(option) => option.name || ''}
      disabled={disabled}
      onChange={(_, newValue) => {
        // Si el usuario selecciona la opción "Agregar..."
        if (newValue && newValue.id === -1 && newValue.name) {
          const nameToCreate = newValue.name.replace('Agregar ', '');
          handleCreate(nameToCreate);
          return;
        }
        onChange(newValue);
      }}
      onInputChange={(_, newInputValue) => handleInputChange(newInputValue)}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        const exists = options.some((option) =>
          params.inputValue.toUpperCase() === option.name?.toUpperCase()
        );

        if (params.inputValue !== '' && !exists && allowCreate && params.inputValue.length > 2) {
          filtered.push({
            id: -1,
            name: `Agregar ${params.inputValue}`,
            code: '',
          });
        }

        return filtered;
      }}
      loading={isLoading || isFetching || isCreating}
      size="small"
      options={certificationTypes}
      clearText="Limpiar"
      loadingText="Cargando..."
      noOptionsText="No hay resultados"
      renderInput={(params) => (
        <TextField
          {...params}
          label="Tipo de Certificación"
          variant="outlined"
          required={required}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <VerifiedIcon fontSize="small" />
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
      fullWidth
    />
  );
};
