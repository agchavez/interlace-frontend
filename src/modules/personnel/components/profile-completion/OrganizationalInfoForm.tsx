import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Autocomplete,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import type { PersonnelProfileCreateUpdate, Area, DistributorCenter, SelectOption } from '../../../../interfaces/personnel';

interface Props {
  data: Partial<PersonnelProfileCreateUpdate>;
  onChange: (data: Partial<PersonnelProfileCreateUpdate>) => void;
  errors: Record<string, string[]>;
  areas: Area[];
  distributorCenters: DistributorCenter[];
  hierarchyLevels: SelectOption[];
  positionTypes: SelectOption[];
}

export const OrganizationalInfoForm: React.FC<Props> = ({
  data,
  onChange,
  errors,
  areas,
  distributorCenters,
  hierarchyLevels,
  positionTypes,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (field: keyof PersonnelProfileCreateUpdate, value: any) => {
    onChange({ [field]: value });
  };

  // Encontrar el valor seleccionado para los autocompletes
  const selectedDistributorCenter = distributorCenters.find((dc) => dc.id === data.primary_distributor_center) || null;
  const selectedArea = areas.find((area) => area.id === data.area) || null;
  const selectedHierarchyLevel = hierarchyLevels.find((level) => level.value === data.hierarchy_level) || null;
  const selectedPositionType = positionTypes.find((type) => type.value === data.position_type) || null;

  return (
    <Box>
      <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <BusinessIcon color="primary" /> Información Organizacional
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {/* Centro de Distribución */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                fullWidth
                options={distributorCenters}
                value={selectedDistributorCenter}
                onChange={(_, newValue) => handleChange('primary_distributor_center', newValue?.id || null)}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText="No hay centros disponibles"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Centro de Distribución"
                    error={!!errors.primary_distributor_center}
                    helperText={errors.primary_distributor_center?.[0] || 'Seleccione el centro donde labora'}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <BusinessIcon sx={{ mr: 1, ml: 1, color: 'action.active' }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      },
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.name}
                  </li>
                )}
              />
            </Grid>

            {/* Área */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                fullWidth
                options={areas}
                value={selectedArea}
                onChange={(_, newValue) => handleChange('area', newValue?.id || null)}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText="No hay áreas disponibles"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Área"
                    error={!!errors.area}
                    helperText={errors.area?.[0] || 'Área a la que pertenece'}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      },
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.name}
                  </li>
                )}
              />
            </Grid>

            {/* Nivel Jerárquico */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                fullWidth
                options={hierarchyLevels}
                value={selectedHierarchyLevel}
                onChange={(_, newValue) => handleChange('hierarchy_level', newValue?.value || '')}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                noOptionsText="No hay niveles disponibles"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Nivel Jerárquico"
                    error={!!errors.hierarchy_level}
                    helperText={errors.hierarchy_level?.[0] || 'Su nivel en la jerarquía organizacional'}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      },
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.value}>
                    {option.label}
                  </li>
                )}
              />
            </Grid>

            {/* Posición/Cargo */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Posición / Cargo"
                value={data.position || ''}
                onChange={(e) => handleChange('position', e.target.value)}
                error={!!errors.position}
                helperText={errors.position?.[0] || 'Ej: Supervisor de Turno, Jefe de Operaciones'}
                InputProps={{
                  startAdornment: <WorkIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Grid>

            {/* Tipo de Posición */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                fullWidth
                options={positionTypes}
                value={selectedPositionType}
                onChange={(_, newValue) => handleChange('position_type', newValue?.value || '')}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                noOptionsText="No hay tipos disponibles"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Tipo de Posición"
                    error={!!errors.position_type}
                    helperText={errors.position_type?.[0] || 'Clasificación de la posición'}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      },
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.value}>
                    {option.label}
                  </li>
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
