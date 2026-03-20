import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  MenuItem,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useGetMyProfileQuery, useUpdateMyProfileMutation } from '../services/personnelApi';
import { toast } from 'sonner';
import type { MyProfileUpdate, PersonnelProfile } from '../../../interfaces/personnel';

const MARITAL_STATUS_CHOICES = [
  { value: 'SINGLE', label: 'Soltero/a' },
  { value: 'MARRIED', label: 'Casado/a' },
  { value: 'DIVORCED', label: 'Divorciado/a' },
  { value: 'WIDOWED', label: 'Viudo/a' },
  { value: 'UNION', label: 'Unión libre' },
];

// Tallas: texto libre (máximo 10 caracteres)

export const MyProfileEditPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: profileData, isLoading: isLoadingProfile } = useGetMyProfileQuery();
  const [updateMyProfile, { isLoading: isUpdating }] = useUpdateMyProfileMutation();

  const [formData, setFormData] = useState<MyProfileUpdate>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if profile data is valid PersonnelProfile
  const profile = profileData && 'id' in profileData ? (profileData as PersonnelProfile) : null;

  useEffect(() => {
    if (profile) {
      setFormData({
        email: profile.email || '',
        personal_email: profile.personal_email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        marital_status: profile.marital_status || '',
        shirt_size: profile.shirt_size || '',
        pants_size: profile.pants_size || '',
        shoe_size: profile.shoe_size || '',
        glove_size: profile.glove_size || '',
        helmet_size: profile.helmet_size || '',
      });

      if (profile.photo_url) {
        setPhotoPreview(profile.photo_url);
      }
    }
  }, [profile]);

  const handleChange = (field: keyof MyProfileUpdate, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La foto no debe superar 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('El archivo debe ser una imagen');
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setErrors({});

      // Si hay foto, enviar como FormData, sino como objeto JSON
      if (photoFile) {
        const submitData = new FormData();

        // Add all non-empty fields
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            submitData.append(key, value);
          }
        });

        // Add photo
        submitData.append('photo', photoFile);

        await updateMyProfile(submitData as any).unwrap();
      } else {
        // Sin foto, enviar como JSON
        const dataToSend: MyProfileUpdate = {};
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            dataToSend[key as keyof MyProfileUpdate] = value as any;
          }
        });

        await updateMyProfile(dataToSend).unwrap();
      }

      toast.success('Perfil actualizado exitosamente');
      navigate('/personnel/my-profile');
    } catch (error: any) {
      console.error('Error updating profile:', error);

      if (error.data) {
        // Handle field-specific errors
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
          toast.error(error.data.detail || 'Error al actualizar el perfil');
        }
      } else {
        toast.error('Error al actualizar el perfil');
      }
    }
  };

  if (isLoadingProfile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">No se pudo cargar la información del perfil</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigate('/personnel/my-profile')} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" sx={{ fontWeight: 600 }}>
            Editar Mi Perfil
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Actualiza tu información personal y de contacto
        </Typography>
      </Box>

      {/* Photo Section */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={photoPreview || undefined}
              sx={{
                width: 120,
                height: 120,
                fontSize: '3rem',
                bgcolor: 'primary.main',
              }}
            >
              {!photoPreview && <PersonIcon sx={{ fontSize: '4rem' }} />}
            </Avatar>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCameraIcon />}
              size="small"
            >
              Cambiar Foto
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </Button>
            <Typography variant="caption" color="text.secondary">
              Formatos aceptados: JPG, PNG. Tamaño máximo: 5MB
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <EmailIcon color="primary" /> Información de Contacto
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Email Personal"
                value={formData.personal_email || ''}
                onChange={(e) => handleChange('personal_email', e.target.value)}
                error={!!errors.personal_email}
                helperText={errors.personal_email || 'Email personal'}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Teléfono"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone || 'Número de teléfono'}
                placeholder="+504 9999-9999"
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                size="small"
                label="Estado Civil"
                value={formData.marital_status || ''}
                onChange={(e) => handleChange('marital_status', e.target.value)}
                error={!!errors.marital_status}
                helperText={errors.marital_status}
              >
                <MenuItem value="">
                  <em>Seleccionar...</em>
                </MenuItem>
                {MARITAL_STATUS_CHOICES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Ciudad"
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                error={!!errors.city}
                helperText={errors.city}
                placeholder="Tegucigalpa"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Dirección"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                error={!!errors.address}
                helperText={errors.address || 'Dirección residencial'}
                placeholder="Col. Kennedy, Bloque M, Casa #123"
                InputProps={{
                  startAdornment: <HomeIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sizes Section */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CheckroomIcon color="primary" /> Tallas de Uniformes y EPP
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Talla de Camisa"
                value={formData.shirt_size || ''}
                onChange={(e) => handleChange('shirt_size', e.target.value)}
                error={!!errors.shirt_size}
                helperText={errors.shirt_size || 'Ej: XS, S, M, L, XL'}
                placeholder="M"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Talla de Pantalón"
                value={formData.pants_size || ''}
                onChange={(e) => handleChange('pants_size', e.target.value)}
                error={!!errors.pants_size}
                helperText={errors.pants_size || 'Ej: 32, 34, 36'}
                placeholder="34"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Talla de Zapatos"
                value={formData.shoe_size || ''}
                onChange={(e) => handleChange('shoe_size', e.target.value)}
                error={!!errors.shoe_size}
                helperText={errors.shoe_size || 'Ej: 9, 10, 11'}
                placeholder="10"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Talla de Guantes"
                value={formData.glove_size || ''}
                onChange={(e) => handleChange('glove_size', e.target.value)}
                error={!!errors.glove_size}
                helperText={errors.glove_size || 'Ej: S, M, L'}
                placeholder="M"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Talla de Casco"
                value={formData.helmet_size || ''}
                onChange={(e) => handleChange('helmet_size', e.target.value)}
                error={!!errors.helmet_size}
                helperText={errors.helmet_size || 'Ej: S, M, L'}
                placeholder="M"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
          </Grid>
          <Alert severity="info" sx={{ mt: 2 }}>
            Estas tallas se utilizan para asignar uniformes y equipo de protección personal (EPP)
          </Alert>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/personnel/my-profile')}
          disabled={isUpdating}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={isUpdating ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSubmit}
          disabled={isUpdating}
        >
          {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </Box>

      {/* Privacy Notice */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          🔒 Tu información es confidencial y solo será visible para personal autorizado de RRHH.
        </Typography>
      </Box>
    </Container>
  );
};
