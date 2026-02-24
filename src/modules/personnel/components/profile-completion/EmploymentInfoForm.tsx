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
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import type { PersonnelProfileCreateUpdate, SelectOption } from '../../../../interfaces/personnel';

interface Props {
  data: Partial<PersonnelProfileCreateUpdate>;
  onChange: (data: Partial<PersonnelProfileCreateUpdate>) => void;
  errors: Record<string, string[]>;
  contractTypes: SelectOption[];
}

export const EmploymentInfoForm: React.FC<Props> = ({ data, onChange, errors, contractTypes }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (field: keyof PersonnelProfileCreateUpdate, value: string) => {
    onChange({ [field]: value });
  };

  return (
    <Box>
      <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <WorkHistoryIcon color="primary" /> Información Laboral
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {/* Fecha de Ingreso */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="date"
                label="Fecha de Ingreso"
                value={data.hire_date || ''}
                onChange={(e) => handleChange('hire_date', e.target.value)}
                error={!!errors.hire_date}
                helperText={errors.hire_date?.[0] || 'Fecha en que comenzó a trabajar'}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Grid>

            {/* Tipo de Contrato */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                select
                label="Tipo de Contrato"
                value={data.contract_type || ''}
                onChange={(e) => handleChange('contract_type', e.target.value)}
                error={!!errors.contract_type}
                helperText={errors.contract_type?.[0] || 'Tipo de relación laboral'}
                InputProps={{
                  startAdornment: <DescriptionIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              >
                {contractTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
        📌 Esta información es importante para cálculos de antigüedad y beneficios laborales.
      </Typography>
    </Box>
  );
};
