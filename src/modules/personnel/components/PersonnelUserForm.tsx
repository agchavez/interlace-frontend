import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Autocomplete,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useGetUsersWithoutProfileQuery } from '../services/personnelApi';
import { debounce } from 'lodash';

type UserMode = 'none' | 'existing' | 'new';

interface Props {
  onUserModeChange: (mode: UserMode) => void;
  onUserDataChange: (data: any) => void;
  onSelectedUserChange: (user: any | null) => void;
  errors: Record<string, string>;
}

export const PersonnelUserForm: React.FC<Props> = ({
  onUserModeChange,
  onUserDataChange,
  onSelectedUserChange,
  errors,
}) => {
  const [userMode, setUserMode] = useState<UserMode>('none');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });

  // Query para buscar usuarios sin perfil
  const { data: usersWithoutProfile = [], isLoading } = useGetUsersWithoutProfileQuery(
    { search: userSearch },
    { skip: userMode !== 'existing' || userSearch.length < 2 }
  );

  // Debounced search handler
  const debouncedSearch = debounce((value: string) => {
    setUserSearch(value);
  }, 300);

  const handleUserModeChange = (_: React.MouseEvent<HTMLElement>, newMode: UserMode | null) => {
    if (newMode !== null) {
      setUserMode(newMode);
      onUserModeChange(newMode);

      // Reset states
      setSelectedUser(null);
      setUserData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
      });
      onSelectedUserChange(null);
      onUserDataChange(null);
    }
  };

  const handleUserSelect = (_: any, value: any | null) => {
    setSelectedUser(value);
    onSelectedUserChange(value);
  };

  const handleUserDataChange = (field: string, value: string) => {
    const newData = { ...userData, [field]: value };
    setUserData(newData);
    onUserDataChange(newData);
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Acceso al Sistema
      </Typography>

      <ToggleButtonGroup
        value={userMode}
        exclusive
        onChange={handleUserModeChange}
        aria-label="user mode"
        fullWidth
        sx={{ mb: 3 }}
      >
        <ToggleButton value="none" aria-label="sin usuario">
          <PersonOffIcon sx={{ mr: 1 }} />
          Solo Personal
        </ToggleButton>
        <ToggleButton value="existing" aria-label="usuario existente">
          <PersonIcon sx={{ mr: 1 }} />
          Usuario Existente
        </ToggleButton>
        <ToggleButton value="new" aria-label="nuevo usuario">
          <PersonAddIcon sx={{ mr: 1 }} />
          Crear Usuario
        </ToggleButton>
      </ToggleButtonGroup>

      {userMode === 'none' && (
        <Alert severity="info" icon={<PersonOffIcon />}>
          Este empleado NO tendrá acceso al sistema. Solo se creará su registro de personal.
        </Alert>
      )}

      {userMode === 'existing' && (
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Alert severity="info" icon={<PersonIcon />}>
            Busque y seleccione un usuario existente que no tenga perfil de personal.
          </Alert>

          <Autocomplete
            options={usersWithoutProfile}
            getOptionLabel={(option) => `${option.full_name} (${option.username}) - ${option.email}`}
            value={selectedUser}
            onChange={handleUserSelect}
            loading={isLoading}
            onInputChange={(_, value) => debouncedSearch(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar Usuario"
                placeholder="Escriba nombre, email o username..."
                helperText="El usuario seleccionado será vinculado a este perfil de personal"
                error={!!errors.user}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <AccountCircleIcon />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Typography variant="body1" fontWeight={600}>
                    {option.full_name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip label={option.username} size="small" variant="outlined" />
                    <Typography variant="caption" color="text.secondary">
                      {option.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            noOptionsText={userSearch.length < 2 ? "Escriba al menos 2 caracteres..." : "No se encontraron usuarios"}
          />

          {selectedUser && (
            <Alert severity="success">
              <Typography variant="body2" fontWeight={600}>
                Usuario seleccionado: {selectedUser.full_name}
              </Typography>
              <Typography variant="caption">
                Username: {selectedUser.username} | Email: {selectedUser.email}
              </Typography>
            </Alert>
          )}
        </Box>
      )}

      {userMode === 'new' && (
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Alert severity="warning" icon={<PersonAddIcon />}>
            Se creará un nuevo usuario del sistema vinculado a este empleado.
          </Alert>

          <Divider />

          <Typography variant="subtitle2" fontWeight={600} color="primary">
            Credenciales de Acceso
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Nombre de Usuario *"
              value={userData.username}
              onChange={(e) => handleUserDataChange('username', e.target.value)}
              error={!!errors.username}
              helperText={errors.username || "Será usado para iniciar sesión"}
              fullWidth
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircleIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Email *"
              type="email"
              value={userData.email}
              onChange={(e) => handleUserDataChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Contraseña *"
              type="password"
              value={userData.password}
              onChange={(e) => handleUserDataChange('password', e.target.value)}
              error={!!errors.password}
              helperText={errors.password || "Mínimo 8 caracteres"}
              fullWidth
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirmar Contraseña *"
              type="password"
              value={userData.confirmPassword}
              onChange={(e) => handleUserDataChange('confirmPassword', e.target.value)}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              fullWidth
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Divider />

          <Typography variant="subtitle2" fontWeight={600} color="primary">
            Información del Usuario (Opcional)
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Si no se completan estos campos, se usarán los nombres del perfil de personal
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Nombre"
              value={userData.first_name}
              onChange={(e) => handleUserDataChange('first_name', e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Apellido"
              value={userData.last_name}
              onChange={(e) => handleUserDataChange('last_name', e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};
