import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  Card,
  CardContent,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import CakeIcon from '@mui/icons-material/Cake';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import type { PersonnelProfileCreateUpdate, SelectOption } from '../../../../interfaces/personnel';

interface Props {
  data: Partial<PersonnelProfileCreateUpdate>;
  onChange: (data: Partial<PersonnelProfileCreateUpdate>) => void;
  errors: Record<string, string[]>;
  genders: SelectOption[];
}

export const PersonalInfoForm: React.FC<Props> = ({ data, onChange, errors, genders }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (field: keyof PersonnelProfileCreateUpdate, value: string) => {
    onChange({ [field]: value });
  };

  return (
    <Box>
      <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ContactPageIcon color="primary" /> Información Personal
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {/* Número de Identidad */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Número de Identidad"
                value={data.personal_id || ''}
                onChange={(e) => handleChange('personal_id', e.target.value)}
                error={!!errors.personal_id}
                helperText={errors.personal_id?.[0] || 'Documento de identidad'}
                placeholder="0801-1990-12345"
                InputProps={{
                  startAdornment: <FingerprintIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Grid>

            {/* Fecha de Nacimiento */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="date"
                label="Fecha de Nacimiento"
                value={data.birth_date || ''}
                onChange={(e) => handleChange('birth_date', e.target.value)}
                error={!!errors.birth_date}
                helperText={errors.birth_date?.[0]}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: <CakeIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Grid>

            {/* Género */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                select
                label="Género"
                value={data.gender || ''}
                onChange={(e) => handleChange('gender', e.target.value)}
                error={!!errors.gender}
                helperText={errors.gender?.[0]}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              >
                {genders.map((gender) => (
                  <MenuItem key={gender.value} value={gender.value}>
                    {gender.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Teléfono */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Teléfono"
                value={data.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone?.[0]}
                placeholder="+504 9999-9999"
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Grid>

            {/* Dirección */}
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                required
                label="Dirección"
                value={data.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                error={!!errors.address}
                helperText={errors.address?.[0]}
                placeholder="Col. Kennedy, Bloque M, Casa #123"
                InputProps={{
                  startAdornment: <HomeIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Grid>

            {/* Ciudad */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                label="Ciudad"
                value={data.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                error={!!errors.city}
                helperText={errors.city?.[0]}
                placeholder="Tegucigalpa"
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
        🔒 Esta información es confidencial y solo será visible para personal autorizado de RRHH.
      </Typography>
    </Box>
  );
};
