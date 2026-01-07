import React, { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Divider,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Autocomplete,
  Chip,
  useTheme,
  useMediaQuery,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import es from 'date-fns/locale/es';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useAppSelector } from '../../../store';
import { useCreatePersonnelWithUserMutation, useGetAreasQuery, useGetPersonnelProfilesQuery, useGetPersonnelProfileQuery, useUpdatePersonnelProfileMutation, useUpdatePersonnelWithUserMutation, useCreatePersonnelProfileMutation } from '../../personnel/services/personnelApi';
import { PhotoUpload, DepartmentSelector } from '../../personnel/components';
import { UsernameSelector } from '../components/UsernameSelector';
import type { PersonnelProfileCreateUpdate, PersonnelFilterParams } from '../../../interfaces/personnel';
import { useGetAUserQuery, usePatchUserMutation } from '../../../store/user/userApi';

// Extended interface for form data with optional fields
interface PersonnelFormData extends Partial<PersonnelProfileCreateUpdate> {
  photo?: File | string | null;  // Puede ser File (para subir) o string (URL existente)
  salary?: number;
}

const steps = ['Información Personal', 'Usuario del Sistema', 'Organización', 'Empleo'];

export const RegisterUserPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit'); // ID del perfil de personal
  const userId = searchParams.get('userId'); // ID del usuario (para completar perfil)
  const isEditMode = !!editId;
  const isCompleteProfile = !!userId;

  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Personnel profile data (incluye nombre y apellido ahora)
  const [profileData, setProfileData] = useState<PersonnelFormData>({});

  // User data (sin nombre/apellido, sin employee_number)
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    group: null as number | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { distributionCenters } = useAppSelector(state => state.user);
  const { groups } = useAppSelector(state => state.maintenance);
  const { data: areasData } = useGetAreasQuery();
  const { data: personnelData } = useGetPersonnelProfilesQuery({
    is_active: true,
    limit: 200,
    offset: 0
  } as PersonnelFilterParams);

  // Cargar datos del perfil si estamos en modo edición
  const { data: existingProfile, isLoading: isLoadingProfile } = useGetPersonnelProfileQuery(
    Number(editId),
    { skip: !editId }
  );

  // Cargar datos del usuario si estamos en modo "completar perfil"
  const { data: existingUser, isLoading: isLoadingUser } = useGetAUserQuery(
    Number(userId!),
    { skip: !userId }
  );

  // Validar que sean arrays
  const areas = Array.isArray(areasData) ? areasData : [];
  const supervisors = personnelData?.results || [];

  const [createPersonnelWithUser, { isLoading: isCreating }] = useCreatePersonnelWithUserMutation();
  const [createPersonnelProfile, { isLoading: isCreatingProfile }] = useCreatePersonnelProfileMutation();
  const [updatePersonnel, { isLoading: isUpdating }] = useUpdatePersonnelProfileMutation();
  const [updatePersonnelWithUser, { isLoading: isUpdatingWithUser }] = useUpdatePersonnelWithUserMutation();
  const [patchUser, { isLoading: isPatchingUser }] = usePatchUserMutation();

  const isLoading = isCreating || isCreatingProfile || isUpdating || isUpdatingWithUser || isPatchingUser;

  // Cargar datos existentes en modo edición
  React.useEffect(() => {
    if (existingProfile && isEditMode) {
      const { user_data, photo_url, ...profile } = existingProfile as any;

      // Cargar datos del perfil (con centros de distribución desde user_data)
      setProfileData({
        ...profile,
        // Cargar la URL de la foto existente para previsualización
        photo: photo_url || null,
        // Los centros de distribución vienen de user_data porque están en el modelo User
        primary_distributor_center: user_data?.centro_distribucion || profile.primary_distributor_center,
        distributor_centers: user_data?.distributions_centers || profile.distributor_centers || [],
        // Cargar department correctamente (puede venir como department o department_data)
        department: profile.department_data?.id || profile.department || null,
        // Cargar area correctamente
        area: typeof profile.area === 'object' ? profile.area.id : profile.area,
        // Cargar supervisor correctamente
        immediate_supervisor: profile.supervisor_data?.id || profile.immediate_supervisor || null,
      });

      // Cargar datos del usuario si existen
      if (user_data) {
        setUserData(prev => ({
          ...prev,
          username: user_data.username || '',
          email: user_data.email || '',
          group: user_data.groups?.[0] || null,
        }));
      }
    }
  }, [existingProfile, isEditMode]);

  // Cargar datos del usuario en modo "completar perfil"
  React.useEffect(() => {
    if (existingUser && isCompleteProfile) {
      const user = existingUser as any;

      // Cargar datos del usuario
      setUserData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        group: user.groups?.[0] || null,
      }));

      // Pre-cargar algunos datos del perfil si están disponibles
      setProfileData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        primary_distributor_center: user.centro_distribucion || undefined,
        distributor_centers: user.distributions_centers || [],
      }));
    }
  }, [existingUser, isCompleteProfile]);

  // Al seleccionar centro principal en profileData, agregarlo a lista
  React.useEffect(() => {
    if (profileData.primary_distributor_center && !profileData.distributor_centers?.includes(profileData.primary_distributor_center)) {
      setProfileData(prev => ({
        ...prev,
        distributor_centers: [...(prev.distributor_centers || []), profileData.primary_distributor_center!]
      }));
    }
  }, [profileData.primary_distributor_center]);

  // Paso 0: Información Personal
  const validatePersonalInfoStep = () => {
    const newErrors: Record<string, string> = {};

    if (!profileData.first_name) newErrors.first_name = 'El nombre es requerido';
    if (!profileData.last_name) newErrors.last_name = 'El apellido es requerido';
    if (!profileData.employee_code) newErrors.employee_code = 'El código de empleado es requerido';
    if (!profileData.gender) newErrors.gender = 'El género es requerido';
    if (!profileData.birth_date) newErrors.birth_date = 'La fecha de nacimiento es requerida';
    if (!profileData.phone) newErrors.phone = 'El teléfono es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Paso 1: Usuario del Sistema
  const validateUserStep = () => {
    const newErrors: Record<string, string> = {};

    if (!userData.username) newErrors.username = 'El nombre de usuario es requerido';
    if (!userData.email) newErrors.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) newErrors.email = 'Email inválido';

    // Password es requerido solo en modo creación (no en edición ni completar perfil)
    if (!isEditMode && !isCompleteProfile) {
      if (!userData.password) newErrors.password = 'La contraseña es requerida';
      else if (userData.password.length < 8) newErrors.password = 'Debe tener al menos 8 caracteres';
      if (!userData.confirmPassword) newErrors.confirmPassword = 'Confirma tu contraseña';
      else if (userData.password !== userData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!userData.group) newErrors.group = 'El grupo es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOrganizationalStep = () => {
    const newErrors: Record<string, string> = {};

    if (!profileData.primary_distributor_center) newErrors.primary_distributor_center = 'El centro de distribución es requerido';
    if (!profileData.area) newErrors.area = 'El área es requerida';
    if (!profileData.department) newErrors.department = 'El departamento es requerido';
    if (!profileData.hierarchy_level) newErrors.hierarchy_level = 'El nivel jerárquico es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmploymentStep = () => {
    const newErrors: Record<string, string> = {};

    if (!profileData.position) newErrors.position = 'El cargo es requerido';
    if (!profileData.hierarchy_level) newErrors.hierarchy_level = 'El nivel jerárquico es requerido';
    if (!profileData.position_type) newErrors.position_type = 'El tipo de posición es requerido';
    if (!profileData.hire_date) newErrors.hire_date = 'La fecha de contratación es requerida';
    if (!profileData.contract_type) newErrors.contract_type = 'El tipo de contrato es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;

    switch (activeStep) {
      case 0:
        isValid = validatePersonalInfoStep();
        break;
      case 1:
        isValid = validateUserStep();
        break;
      case 2:
        isValid = validateOrganizationalStep();
        break;
      case 3:
        isValid = validateEmploymentStep();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      if (activeStep === steps.length - 1) {
        handleSubmit();
      } else {
        setActiveStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    try {
      // Preparar FormData si hay foto
      const prepareData = () => {
        const hasFile = profileData.photo instanceof File;

        // Extraer first_name y last_name de profileData
        const { first_name, last_name, photo, ...cleanProfile } = profileData;

        if (!hasFile) {
          return {
            user_data: {
              username: userData.username,
              email: userData.email,
              password: userData.password,
              first_name: first_name,
              last_name: last_name,
              group: userData.group,
              centro_distribucion: profileData.primary_distributor_center,
              distributions_centers: profileData.distributor_centers || [],
            },
            profile_data: cleanProfile,
          };
        }

        const formData = new FormData();

        // User data (con nombre y apellido de profileData y centros de distribución)
        formData.append('user_data', JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          first_name: first_name,
          last_name: last_name,
          group: userData.group,
          centro_distribucion: profileData.primary_distributor_center,
          distributions_centers: profileData.distributor_centers || [],
        }));

        // Profile data (sin first_name, last_name, photo)
        formData.append('profile_data', JSON.stringify(cleanProfile));

        if (photo instanceof File) {
          formData.append('photo', photo);
        }

        return formData;
      };

      if (isCompleteProfile && userId) {
        // Modo crear perfil para usuario existente
        const { first_name, last_name, photo, ...cleanProfile } = profileData;

        // Preparar datos del perfil con el user_id
        const profile_data_to_create: any = {
          ...cleanProfile,
          first_name,
          last_name,
          user: Number(userId), // Asignar el usuario existente
        };

        // Si hay foto, crear con FormData
        if (photo instanceof File) {
          const formData = new FormData();
          Object.keys(profile_data_to_create).forEach(key => {
            if (profile_data_to_create[key] !== undefined && profile_data_to_create[key] !== null) {
              if (Array.isArray(profile_data_to_create[key])) {
                profile_data_to_create[key].forEach((item: any) => {
                  formData.append(key, item);
                });
              } else {
                formData.append(key, profile_data_to_create[key]);
              }
            }
          });
          formData.append('photo', photo);

          await createPersonnelProfile(formData as any).unwrap();
        } else {
          await createPersonnelProfile(profile_data_to_create as any).unwrap();
        }

        // Actualizar el usuario con el grupo y centros de distribución
        const user_update_data: any = {
          group: userData.group,
          centro_distribucion: profileData.primary_distributor_center,
          distributions_centers: profileData.distributor_centers || [],
          first_name: profileData.first_name,
          last_name: profileData.last_name,
        };

        await patchUser({
          id: Number(userId),
          user: user_update_data
        }).unwrap();

        toast.success('Perfil de personal creado y usuario actualizado exitosamente');
        navigate('/user');
      } else if (isEditMode && editId) {
        // Modo edición: actualizar perfil y usuario
        const { first_name, last_name, photo, ...cleanProfile } = profileData;

        // Preparar datos del usuario
        const user_data_to_send: any = {
          username: userData.username,
          email: userData.email,
          first_name: first_name,
          last_name: last_name,
          group: userData.group,
          centro_distribucion: profileData.primary_distributor_center,
          distributions_centers: profileData.distributor_centers || [],
        };

        // Solo incluir password si el usuario lo cambió
        if (userData.password && userData.password.trim() !== '') {
          user_data_to_send.password = userData.password;
        }

        // Preparar datos del perfil
        const profile_data_to_send = {
          ...cleanProfile,
          first_name,
          last_name,
        };

        // Si hay una nueva foto, enviarla como FormData
        if (photo instanceof File) {
          const formData = new FormData();
          formData.append('user_data', JSON.stringify(user_data_to_send));
          formData.append('profile_data', JSON.stringify(profile_data_to_send));
          formData.append('photo', photo);

          await updatePersonnelWithUser({ id: Number(editId), user_data: user_data_to_send, profile_data: profile_data_to_send } as any).unwrap();
        } else {
          await updatePersonnelWithUser({
            id: Number(editId),
            user_data: user_data_to_send,
            profile_data: profile_data_to_send
          }).unwrap();
        }

        toast.success('Usuario y perfil actualizados exitosamente');
        navigate('/user');
      } else {
        // Modo creación
        await createPersonnelWithUser(prepareData() as any).unwrap();
        toast.success('Usuario y perfil de personal creados exitosamente');
        navigate('/user');
      }
    } catch (error: any) {
      console.error('Error completo:', error);

      // Función auxiliar para extraer mensaje de error
      const extractErrorMessage = (errorValue: any): string => {
        // Si es un array
        if (Array.isArray(errorValue)) {
          const firstError = errorValue[0];
          // Si el elemento es un objeto con 'message'
          if (typeof firstError === 'object' && firstError?.message) {
            return firstError.message;
          }
          // Si es un string directo
          if (typeof firstError === 'string') {
            return firstError;
          }
        }
        // Si es un string directo
        if (typeof errorValue === 'string') {
          return errorValue;
        }
        // Si es un objeto con 'message'
        if (typeof errorValue === 'object' && errorValue?.message) {
          return errorValue.message;
        }
        // Por defecto, convertir a string
        return String(errorValue);
      };

      // Mapear errores del backend al estado
      const backendErrors: Record<string, string> = {};
      let hasGeneralError = false;

      if (error?.data) {
        // Si hay un mensaje de detail general
        if (error.data.detail) {
          hasGeneralError = true;
          if (typeof error.data.detail === 'string') {
            toast.error(error.data.detail);
          }
        }

        // Si hay mensage (error personalizado)
        if (error.data.mensage) {
          hasGeneralError = true;
          toast.error(error.data.mensage);
        }

        // Procesar errores de campos individuales
        Object.keys(error.data).forEach(key => {
          if (key !== 'detail' && key !== 'message' && key !== 'mensage' && key !== 'error_code') {
            backendErrors[key] = extractErrorMessage(error.data[key]);
          }
        });

        // Actualizar el estado de errores
        if (Object.keys(backendErrors).length > 0) {
          setErrors(backendErrors);

          // Mostrar toast con resumen de errores
          const errorCount = Object.keys(backendErrors).length;
          toast.error(
            `Hay ${errorCount} error(es) en el formulario. Por favor revise los campos marcados.`,
            { duration: 6000 }
          );

          // Scroll al inicio para que el usuario vea los errores
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (!hasGeneralError) {
          // Si no hay errores específicos ni generales, mostrar mensaje genérico
          toast.error(error?.data?.message || 'Error al procesar la solicitud');
        }
      } else {
        toast.error('Error al procesar la solicitud');
      }
    }
  };

  // Paso 0: Información Personal
  const renderPersonalInfoStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info">
          Ingresa primero la información personal del empleado
        </Alert>
      </Grid>

      <Grid item xs={12}>
        <PhotoUpload
          value={profileData.photo}
          onChange={(file) => setProfileData(prev => ({ ...prev, photo: file }))}
          error={errors.photo}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          size="small"
          label="Nombre *"
          fullWidth
          value={profileData.first_name || ''}
          onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
          error={!!errors.first_name}
          helperText={errors.first_name}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          size="small"
          label="Apellido *"
          fullWidth
          value={profileData.last_name || ''}
          onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
          error={!!errors.last_name}
          helperText={errors.last_name}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          size="small"
          label="Código de Empleado *"
          fullWidth
          value={profileData.employee_code || ''}
          onChange={(e) => setProfileData(prev => ({ ...prev, employee_code: e.target.value }))}
          error={!!errors.employee_code}
          helperText={errors.employee_code}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BadgeIcon />
              </InputAdornment>
            ),
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small" error={!!errors.gender}>
          <InputLabel>Género *</InputLabel>
          <Select
            value={profileData.gender || ''}
            onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
            label="Género *"
          >
            <MenuItem value="M">Masculino</MenuItem>
            <MenuItem value="F">Femenino</MenuItem>
            <MenuItem value="O">Otro</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <DatePicker
          label="Fecha de Nacimiento *"
          value={profileData.birth_date ? new Date(profileData.birth_date) : null}
          onChange={(date) => setProfileData(prev => ({ ...prev, birth_date: date?.toISOString().split('T')[0] }))}
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
              error: !!errors.birth_date,
              helperText: errors.birth_date,
            },
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          size="small"
          label="Teléfono *"
          fullWidth
          value={profileData.phone || ''}
          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
          error={!!errors.phone}
          helperText={errors.phone}
          placeholder="+504 9999-9999"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          size="small"
          label="Dirección"
          fullWidth
          multiline
          rows={2}
          value={profileData.address || ''}
          onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
          placeholder="Dirección residencial (opcional)"
        />
      </Grid>
    </Grid>
  );

  // Paso 1: Usuario del Sistema
  const renderUserStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity={isCompleteProfile ? "success" : "info"}>
          {isCompleteProfile
            ? 'Usuario existente. Complete todos los pasos para crear su perfil de personal y actualizar grupo/centros.'
            : 'Configura el acceso al sistema para este empleado'}
        </Alert>
      </Grid>

      <Grid item xs={12}>
        <UsernameSelector
          value={userData.username}
          onChange={(username) => setUserData(prev => ({ ...prev, username }))}
          firstName={profileData.first_name || ''}
          lastName={profileData.last_name || ''}
          error={errors.username}
          disabled={isCompleteProfile}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          size="small"
          label="Email *"
          type="email"
          fullWidth
          value={userData.email}
          onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
          error={!!errors.email}
          helperText={errors.email || 'Email corporativo'}
          disabled={isCompleteProfile}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Autocomplete
          options={groups}
          getOptionLabel={(option) => option.group.name}
          value={groups.find(g => g.id === userData.group) || null}
          onChange={(_, newValue) => setUserData(prev => ({ ...prev, group: newValue?.id || null }))}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Grupo *"
              error={!!errors.group}
              helperText={errors.group || 'Grupo de acceso al sistema'}
            />
          )}
        />
      </Grid>

      {/* Solo mostrar contraseña en modo creación */}
      {!isEditMode && !isCompleteProfile && (
        <>
          <Grid item xs={12} md={6}>
            <TextField
              size="small"
              label="Contraseña *"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={userData.password}
              onChange={(e) => setUserData(prev => ({ ...prev, password: e.target.value }))}
              error={!!errors.password}
              helperText={errors.password || 'Mínimo 8 caracteres'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              size="small"
              label="Confirmar Contraseña *"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              value={userData.confirmPassword}
              onChange={(e) => setUserData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </>
      )}

      {/* Mensaje informativo en modo edición */}
      {(isEditMode || isCompleteProfile) && (
        <Grid item xs={12}>
          <Alert severity="info" icon={<LockResetIcon />}>
            Para cambiar la contraseña, use la opción "Resetear Contraseña" desde la lista de usuarios.
          </Alert>
        </Grid>
      )}
    </Grid>
  );

  // Paso 2: Organización
  const renderOrganizationalStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Autocomplete
          options={distributionCenters}
          getOptionLabel={(option) => option.name}
          value={distributionCenters.find(dc => dc.id === profileData.primary_distributor_center) || null}
          onChange={(_, newValue) => setProfileData(prev => ({ ...prev, primary_distributor_center: newValue?.id }))}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Centro de Distribución Principal *"
              error={!!errors.primary_distributor_center}
              helperText={errors.primary_distributor_center}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Autocomplete
          multiple
          options={distributionCenters}
          getOptionLabel={(option) => option.name}
          value={distributionCenters.filter(dc => profileData.distributor_centers?.includes(dc.id))}
          onChange={(_, newValue) => setProfileData(prev => ({
            ...prev,
            distributor_centers: newValue.map(v => v.id)
          }))}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Centros Adicionales"
              helperText="Centros donde puede trabajar (opcional)"
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option.name} {...getTagProps({ index })} size="small" />
            ))
          }
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Autocomplete
          options={areas}
          getOptionLabel={(option) => option.name}
          value={areas.find(a => a.id === profileData.area) || null}
          onChange={(_, newValue) => setProfileData(prev => ({ ...prev, area: newValue?.id }))}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Área *"
              error={!!errors.area}
              helperText={errors.area}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <DepartmentSelector
          value={profileData.department || null}
          onChange={(departmentId) => {
            setProfileData(prev => ({ ...prev, department: departmentId || undefined }));
            if (errors.department) {
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.department;
                return newErrors;
              });
            }
          }}
          areaId={profileData.area || null}
          error={errors.department}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small" error={!!errors.hierarchy_level}>
          <InputLabel>Nivel Jerárquico *</InputLabel>
          <Select
            value={profileData.hierarchy_level || ''}
            onChange={(e) => setProfileData(prev => ({ ...prev, hierarchy_level: e.target.value }))}
            label="Nivel Jerárquico *"
          >
            <MenuItem value="OPERATIVE">Operativo</MenuItem>
            <MenuItem value="SUPERVISOR">Supervisor</MenuItem>
            <MenuItem value="AREA_MANAGER">Jefe de Área</MenuItem>
            <MenuItem value="CD_MANAGER">Gerente de Centro</MenuItem>
          </Select>
          {errors.hierarchy_level && <FormHelperText>{errors.hierarchy_level}</FormHelperText>}
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <Autocomplete
          options={supervisors}
          getOptionLabel={(option) => `${option.employee_code} - ${option.full_name}`}
          value={supervisors.find(s => s.id === profileData.immediate_supervisor) || null}
          onChange={(_, newValue) => setProfileData(prev => ({ ...prev, immediate_supervisor: newValue?.id }))}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Supervisor Inmediato"
              helperText="Jefe directo del empleado (opcional)"
            />
          )}
        />
      </Grid>
    </Grid>
  );

  // Paso 3: Empleo
  const renderEmploymentStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info">
          Información laboral y contractual del empleado
        </Alert>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          size="small"
          label="Cargo/Posición *"
          fullWidth
          value={profileData.position || ''}
          onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
          error={!!errors.position}
          helperText={errors.position}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small" error={!!errors.position_type}>
          <InputLabel>Tipo de Posición *</InputLabel>
          <Select
            value={profileData.position_type || ''}
            onChange={(e) => setProfileData(prev => ({ ...prev, position_type: e.target.value }))}
            label="Tipo de Posición *"
          >
            <MenuItem value="PICKER">Picker</MenuItem>
            <MenuItem value="COUNTER">Contador</MenuItem>
            <MenuItem value="OPM">Operador de Montacargas</MenuItem>
            <MenuItem value="YARD_DRIVER">Conductor de Patio</MenuItem>
            <MenuItem value="LOADER">Cargador</MenuItem>
            <MenuItem value="WAREHOUSE_ASSISTANT">Ayudante de Almacén</MenuItem>
            <MenuItem value="SECURITY_GUARD">Guardia de Seguridad</MenuItem>
            <MenuItem value="DELIVERY_DRIVER">Conductor de Delivery</MenuItem>
            <MenuItem value="ADMINISTRATIVE">Administrativo</MenuItem>
            <MenuItem value="OTHER">Otro</MenuItem>
          </Select>
          {errors.position_type && <FormHelperText>{errors.position_type}</FormHelperText>}
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <DatePicker
          label="Fecha de Contratación *"
          value={profileData.hire_date ? new Date(profileData.hire_date) : null}
          onChange={(date) => setProfileData(prev => ({ ...prev, hire_date: date?.toISOString().split('T')[0] }))}
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
              error: !!errors.hire_date,
              helperText: errors.hire_date,
            },
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small" error={!!errors.contract_type}>
          <InputLabel>Tipo de Contrato *</InputLabel>
          <Select
            value={profileData.contract_type || ''}
            onChange={(e) => setProfileData(prev => ({ ...prev, contract_type: e.target.value }))}
            label="Tipo de Contrato *"
          >
            <MenuItem value="PERMANENT">Permanente</MenuItem>
            <MenuItem value="TEMPORARY">Temporal</MenuItem>
            <MenuItem value="CONTRACTOR">Contratista</MenuItem>
            <MenuItem value="INTERNSHIP">Pasantía</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          size="small"
          label="Salario"
          type="number"
          fullWidth
          value={profileData.salary || ''}
          onChange={(e) => setProfileData(prev => ({ ...prev, salary: e.target.value ? Number(e.target.value) : undefined }))}
          helperText="Opcional"
        />
      </Grid>
    </Grid>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderPersonalInfoStep();
      case 1:
        return renderUserStep();
      case 2:
        return renderOrganizationalStep();
      case 3:
        return renderEmploymentStep();
      default:
        return null;
    }
  };

  if (isLoadingProfile || isLoadingUser) {
    return (
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box textAlign="center">
          <Typography variant="body1" gutterBottom>Cargando datos...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              component="h1"
              fontWeight={400}
              sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              {isEditMode
                ? 'Editar Usuario y Personal'
                : isCompleteProfile
                  ? 'Completar Perfil de Personal'
                  : 'Registro de Usuario y Personal'}
            </Typography>
            <Divider sx={{ mt: 1, mb: 2 }} />
          </Grid>

          <Grid item xs={12} sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" color="text.secondary">
              {isCompleteProfile
                ? 'Complete todos los pasos para crear el perfil de personal de este usuario y actualizar sus datos'
                : 'Complete todos los pasos para crear un usuario del sistema con su perfil de personal'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 } }}>
              <Stepper
                activeStep={activeStep}
                sx={{
                  mb: 4,
                  '& .MuiStepLabel-label': {
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' }, // 13px mínimo
                  },
                }}
                alternativeLabel={isMobile}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Box sx={{ minHeight: { xs: 'auto', sm: 400 } }}>
                {getStepContent(activeStep)}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                  color="secondary"
                >
                  Atrás
                </Button>

                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  {activeStep === steps.length - 1
                    ? (isLoading
                      ? (isEditMode || isCompleteProfile ? 'Actualizando...' : 'Creando...')
                      : (isEditMode
                        ? 'Actualizar Usuario y Perfil'
                        : isCompleteProfile
                          ? 'Crear Perfil y Actualizar Usuario'
                          : 'Crear Usuario y Perfil')
                    )
                    : 'Siguiente'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
};
