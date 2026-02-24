import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Alert,
  LinearProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  Autocomplete,
  Chip,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAppSelector } from '../../../store';
import BootstrapDialogTitle from '../../ui/components/BootstrapDialogTitle';
import { UsernameSelector } from '../../user/components/UsernameSelector';

interface Props {
  open: boolean;
  onClose: () => void;
  onUserCreated: (userData: any) => void;
}

interface UserData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  group: number | null;
  centro_distribucion: number | null;
  distributions_centers: number[];
}

export const NewUserRegistration: React.FC<Props> = ({ open, onClose, onUserCreated }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [needDC, setNeedDC] = useState(false);
  const { distributionCenters } = useAppSelector(state => state.user);
  const { groups } = useAppSelector(state => state.maintenance);
  const [userData, setUserData] = useState<UserData>({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    group: null,
    centro_distribucion: null,
    distributions_centers: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Detectar si el grupo requiere centro de distribución
  useEffect(() => {
    if (userData.group) {
      const selectedGroup = groups.find(g => g.id === userData.group);
      if (selectedGroup && selectedGroup.requiered_access) {
        setNeedDC(true);
      } else {
        setNeedDC(false);
      }
    } else {
      setNeedDC(false);
    }
  }, [userData.group, groups]);

  // Al seleccionar centro de distribución principal, agregarlo a la lista
  useEffect(() => {
    if (userData.centro_distribucion !== null && userData.centro_distribucion !== undefined) {
      if (!userData.distributions_centers.includes(userData.centro_distribucion)) {
        setUserData(prev => ({
          ...prev,
          distributions_centers: [...prev.distributions_centers, userData.centro_distribucion!]
        }));
      }
    }
  }, [userData.centro_distribucion]);

  const handleChange = (field: keyof UserData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData((prev) => ({ ...prev, [field]: e.target.value }));
    // Limpiar error del campo al cambiar
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!userData.first_name) {
      newErrors.first_name = 'El nombre es requerido';
    }

    if (!userData.last_name) {
      newErrors.last_name = 'El apellido es requerido';
    }

    if (!userData.username) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (userData.username.length < 3) {
      newErrors.username = 'Debe tener al menos 3 caracteres';
    }

    if (!userData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!userData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (userData.password.length < 8) {
      newErrors.password = 'Debe tener al menos 8 caracteres';
    }

    if (!userData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!userData.group) {
      newErrors.group = 'El grupo es requerido';
    }

    if (needDC && !userData.centro_distribucion) {
      newErrors.centro_distribucion = 'El centro de distribución es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      onUserCreated(userData);
      // Don't call onClose() here - parent will handle closing after user is created
    }
  };

  const handleBack = () => {
    setUserData({
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      group: null,
      centro_distribucion: null,
      distributions_centers: [],
    });
    setErrors({});
    onClose();
  };

  // Calcular fortaleza de contraseña
  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z\d]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const passwordStrength = getPasswordStrength(userData.password);
  const getStrengthColor = (strength: number) => {
    if (strength < 40) return 'error';
    if (strength < 70) return 'warning';
    return 'success';
  };
  const getStrengthLabel = (strength: number) => {
    if (strength < 40) return 'Débil';
    if (strength < 70) return 'Media';
    return 'Fuerte';
  };

  const isFormValid = userData.first_name && userData.last_name &&
                      userData.username && userData.email && userData.password &&
                      userData.confirmPassword && userData.group &&
                      userData.password === userData.confirmPassword &&
                      (!needDC || userData.centro_distribucion) &&
                      Object.keys(errors).length === 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
        },
      }}
    >
      {/* Barra Superior Estilizada */}
      <BootstrapDialogTitle
        id="new-user-dialog-title"
        onClose={onClose}
      >
        <Typography variant="h6" fontWeight={600} color={'#fff'}>
          Crear Nuevo Usuario
        </Typography>
      </BootstrapDialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Box>
          {/* Info Alert */}
          <Alert severity="info" sx={{ mb: 3 }}>
            Después de crear el usuario, continuarás con el registro del perfil de personal
          </Alert>

          {/* Form */}
          <Box sx={{ display: 'grid', gap: 3 }}>
            {/* Credenciales de Acceso */}
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Credenciales de Acceso
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                {/* Nombre y Apellido primero para generar username */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    size="small"
                    label="Nombre *"
                    value={userData.first_name}
                    onChange={handleChange('first_name')}
                    error={!!errors.first_name}
                    helperText={errors.first_name}
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label="Apellido *"
                    value={userData.last_name}
                    onChange={handleChange('last_name')}
                    error={!!errors.last_name}
                    helperText={errors.last_name}
                    fullWidth
                  />
                </Box>

                <UsernameSelector
                  value={userData.username}
                  onChange={(username) => setUserData(prev => ({ ...prev, username }))}
                  firstName={userData.first_name}
                  lastName={userData.last_name}
                  error={errors.username}
                />
                <TextField
                  size="small"
                  label="Email *"
                  type="email"
                  value={userData.email}
                  onChange={handleChange('email')}
                  error={!!errors.email}
                  helperText={errors.email}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>

            {/* Contraseña */}
            <Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <TextField
                    size="small"
                    label="Contraseña *"
                    type={showPassword ? 'text' : 'password'}
                    value={userData.password}
                    onChange={handleChange('password')}
                    error={!!errors.password}
                    helperText={errors.password}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {userData.password && (
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Fortaleza:
                        </Typography>
                        <Typography variant="caption" fontWeight={600} color={`${getStrengthColor(passwordStrength)}.main`}>
                          {getStrengthLabel(passwordStrength)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={passwordStrength}
                        color={getStrengthColor(passwordStrength)}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}
                </Box>

                <TextField
                  size="small"
                  label="Confirmar Contraseña *"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={userData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>

            {/* Grupo y Accesos */}
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Grupo y Accesos
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Autocomplete
                  options={groups}
                  getOptionLabel={(option) => option.group.name}
                  value={groups.find(g => g.id === userData.group) || null}
                  onChange={(_, newValue) => {
                    setUserData(prev => ({ ...prev, group: newValue?.id || null }));
                    if (errors.group) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.group;
                        return newErrors;
                      });
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Grupo *"
                      error={!!errors.group}
                      helperText={errors.group || 'Seleccione el grupo de acceso'}
                    />
                  )}
                  fullWidth
                />

                {needDC && (
                  <Autocomplete
                    options={distributionCenters}
                    getOptionLabel={(option) => option.name}
                    value={distributionCenters.find(dc => dc.id === userData.centro_distribucion) || null}
                    onChange={(_, newValue) => {
                      setUserData(prev => ({ ...prev, centro_distribucion: newValue?.id || null }));
                      if (errors.centro_distribucion) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.centro_distribucion;
                          return newErrors;
                        });
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Centro de Distribución Principal *"
                        error={!!errors.centro_distribucion}
                        helperText={errors.centro_distribucion || 'Requerido por el grupo seleccionado'}
                      />
                    )}
                    fullWidth
                  />
                )}
              </Box>

              {userData.distributions_centers.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Centros de Distribución Adicionales (opcional)
                  </Typography>
                  <Autocomplete
                    multiple
                    options={distributionCenters}
                    getOptionLabel={(option) => option.name}
                    value={distributionCenters.filter(dc => userData.distributions_centers.includes(dc.id))}
                    onChange={(_, newValue) => {
                      setUserData(prev => ({
                        ...prev,
                        distributions_centers: newValue.map(v => v.id)
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Centros Adicionales"
                        placeholder="Seleccionar más centros"
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip label={option.name} {...getTagProps({ index })} size="small" />
                      ))
                    }
                    fullWidth
                  />
                </Box>
              )}
            </Box>

            {/* Validation Messages */}
            {userData.password && userData.confirmPassword && userData.password === userData.confirmPassword && (
              <Alert severity="success" icon={<CheckCircleIcon />}>
                Las contraseñas coinciden
              </Alert>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          fullWidth={isMobile}
        >
          Volver
        </Button>
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForwardIcon />}
          onClick={handleContinue}
          disabled={!isFormValid}
          fullWidth={isMobile}
        >
          Continuar al Perfil
        </Button>
      </DialogActions>
    </Dialog>
  );
};
