import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Autocomplete,
  Button,
  InputAdornment,
  Card,
  CardContent,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useGetUsersWithoutProfileQuery } from '../services/personnelApi';
import { debounce } from 'lodash';
import BootstrapDialogTitle from '../../ui/components/BootstrapDialogTitle';

interface Props {
  open: boolean;
  onClose: () => void;
  onUserSelected: (user: any) => void;
}

export const ExistingUserSelector: React.FC<Props> = ({ open, onClose, onUserSelected }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: users = [], isLoading } = useGetUsersWithoutProfileQuery(
    { search: searchTerm },
    { skip: searchTerm.length < 2 }
  );

  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);

  const handleUserChange = (_: any, value: any | null) => {
    setSelectedUser(value);
  };

  const handleConfirm = () => {
    if (selectedUser) {
      onUserSelected(selectedUser);
      // Don't call onClose() here - parent will handle closing after user is selected
    }
  };

  const handleBack = () => {
    setSelectedUser(null);
    setSearchTerm('');
    onClose();
  };

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
      <BootstrapDialogTitle id="existing-user-dialog-title" onClose={onClose}>
        <Typography variant="h6" fontWeight={600} color={'#fff'}>
          Vincular Usuario Existente
        </Typography>
      </BootstrapDialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Box>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: theme.palette.success.main,
                mx: 'auto',
                mb: 2,
              }}
            >
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="body1" color="text.secondary">
              Busca y selecciona un usuario del sistema para crear su perfil de personal
            </Typography>
          </Box>

          {/* Search */}
          <Autocomplete
            options={users}
            getOptionLabel={(option) => `${option.full_name} (${option.username})`}
            value={selectedUser}
            onChange={handleUserChange}
            loading={isLoading}
            onInputChange={(_, value) => debouncedSearch(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar Usuario"
                placeholder="Escribe nombre, email o username..."
                variant="outlined"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                helperText={
                  searchTerm.length < 2
                    ? 'Escribe al menos 2 caracteres para buscar'
                    : users.length === 0 && searchTerm.length >= 2
                    ? 'No se encontraron usuarios sin perfil'
                    : 'Selecciona un usuario de la lista'
                }
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    {option.first_name?.[0] || option.username[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight={600}>
                      {option.full_name || option.username}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<AccountCircleIcon fontSize="small" />}
                        label={option.username}
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {option.email}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
            noOptionsText={
              searchTerm.length < 2
                ? 'Escribe al menos 2 caracteres...'
                : 'No se encontraron usuarios'
            }
          />

          {/* Selected User Preview */}
          {selectedUser && (
            <Card sx={{ mt: 3 }} elevation={3}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Usuario Seleccionado
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ width: 60, height: 60, bgcolor: theme.palette.success.main }}>
                    {selectedUser.first_name?.[0] || selectedUser.username[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {selectedUser.full_name || selectedUser.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      @{selectedUser.username}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2">{selectedUser.email}</Typography>
                  </Box>
                  {selectedUser.first_name && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {selectedUser.first_name} {selectedUser.last_name}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Alert severity="success" sx={{ mt: 2 }}>
                  Los datos del usuario se auto-completarán en el formulario de personal
                </Alert>
              </CardContent>
            </Card>
          )}

          {!selectedUser && searchTerm.length >= 2 && users.length === 0 && (
            <Alert severity="info" sx={{ mt: 3 }}>
              No se encontraron usuarios sin perfil de personal. Todos los usuarios ya tienen un
              perfil asignado.
            </Alert>
          )}
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
          color="success"
          endIcon={<ArrowForwardIcon />}
          onClick={handleConfirm}
          disabled={!selectedUser}
          fullWidth={isMobile}
        >
          Continuar con este Usuario
        </Button>
      </DialogActions>
    </Dialog>
  );
};
