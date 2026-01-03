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
} from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import type { PersonnelProfileCreateUpdate } from '../../../../interfaces/personnel';

interface Props {
  data: Partial<PersonnelProfileCreateUpdate>;
  onChange: (data: Partial<PersonnelProfileCreateUpdate>) => void;
  errors: Record<string, string[]>;
  userInfo?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const BasicInfoForm: React.FC<Props> = ({ data, onChange, errors, userInfo }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (field: keyof PersonnelProfileCreateUpdate, value: string) => {
    onChange({ [field]: value });
  };

  return (
    <Box>
      <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <BadgeIcon color="primary" /> Información Básica
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {/* Código de Empleado */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Código de Empleado"
                value={data.employee_code || ''}
                onChange={(e) => handleChange('employee_code', e.target.value)}
                error={!!errors.employee_code}
                helperText={errors.employee_code?.[0] || 'Código único del empleado'}
                InputProps={{
                  startAdornment: <BadgeIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Grid>

            {/* Nombres */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Nombres"
                value={data.first_name || ''}
                onChange={(e) => handleChange('first_name', e.target.value)}
                error={!!errors.first_name}
                helperText={errors.first_name?.[0]}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Grid>

            {/* Apellidos */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Apellidos"
                value={data.last_name || ''}
                onChange={(e) => handleChange('last_name', e.target.value)}
                error={!!errors.last_name}
                helperText={errors.last_name?.[0]}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="email"
                label="Email"
                value={data.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email?.[0] || 'Email corporativo'}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
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

      {userInfo && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          💡 Estos datos se han pre-llenado desde su cuenta de usuario. Puede modificarlos si es necesario.
        </Typography>
      )}
    </Box>
  );
};
