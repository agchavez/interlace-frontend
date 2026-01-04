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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import es from 'date-fns/locale/es';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import { useAppSelector } from '../../../store';
import { useCreatePersonnelWithUserMutation } from '../../personnel/services/personnelApi';
import { useGetAreasQuery, useGetDepartmentsQuery } from '../../personnel/services/personnelApi';
import { PhotoUpload } from '../../personnel/components/PhotoUpload';
import type { PersonnelProfileCreateUpdate } from '../../../interfaces/personnel';

// Extended interface for form data with optional fields
interface PersonnelFormData extends Partial<PersonnelProfileCreateUpdate> {
  photo?: File | null;
  salary?: number;
}

const steps = ['Usuario', 'Información Básica', 'Organización', 'Empleo'];

export const RegisterUserPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // User data
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    employee_number: undefined as number | undefined,
    group: null as number | null,
    centro_distribucion: null as number | null,
    distributions_centers: [] as number[],
  });

  // Personnel profile data
  const [profileData, setProfileData] = useState<PersonnelFormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { distributionCenters } = useAppSelector(state => state.user);
  const { groups } = useAppSelector(state => state.maintenance);
  const { data: areas = [] } = useGetAreasQuery();
  const { data: departments = [] } = useGetDepartmentsQuery({});

  const [createPersonnelWithUser, { isLoading }] = useCreatePersonnelWithUserMutation();

  // Detectar si el grupo requiere centro de distribución
  const selectedGroup = groups.find(g => g.id === userData.group);
  const needDC = selectedGroup?.requiered_access || false;

  // Al seleccionar centro principal, agregarlo a lista
  React.useEffect(() => {
    if (userData.centro_distribucion && !userData.distributions_centers.includes(userData.centro_distribucion)) {
      setUserData(prev => ({
        ...prev,
        distributions_centers: [...prev.distributions_centers, userData.centro_distribucion!]
      }));
    }
  }, [userData.centro_distribucion]);

  const validateUserStep = () => {
    const newErrors: Record<string, string> = {};

    if (!userData.username) newErrors.username = 'El nombre de usuario es requerido';
    if (!userData.email) newErrors.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) newErrors.email = 'Email inválido';
    if (!userData.password) newErrors.password = 'La contraseña es requerida';
    else if (userData.password.length < 8) newErrors.password = 'Debe tener al menos 8 caracteres';
    if (!userData.confirmPassword) newErrors.confirmPassword = 'Confirma tu contraseña';
    else if (userData.password !== userData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    if (!userData.first_name) newErrors.first_name = 'El nombre es requerido';
    if (!userData.last_name) newErrors.last_name = 'El apellido es requerido';
    if (!userData.group) newErrors.group = 'El grupo es requerido';
    if (needDC && !userData.centro_distribucion) newErrors.centro_distribucion = 'El centro de distribución es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBasicInfoStep = () => {
    const newErrors: Record<string, string> = {};

    if (!profileData.employee_code) newErrors.employee_code = 'El código de empleado es requerido';
    if (!profileData.gender) newErrors.gender = 'El género es requerido';
    if (!profileData.birth_date) newErrors.birth_date = 'La fecha de nacimiento es requerida';
    if (!profileData.phone) newErrors.phone = 'El teléfono es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOrganizationalStep = () => {
    const newErrors: Record<string, string> = {};

    if (!profileData.primary_distributor_center) newErrors.primary_distributor_center = 'El centro de distribución es requerido';
    if (!profileData.area) newErrors.area = 'El área es requerida';
    if (!profileData.department) newErrors.department = 'El departamento es requerido';

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
        isValid = validateUserStep();
        break;
      case 1:
        isValid = validateBasicInfoStep();
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

        if (!hasFile) {
          const { photo, ...cleanProfile } = profileData;
          return {
            user_data: {
              username: userData.username,
              email: userData.email,
              password: userData.password,
              first_name: userData.first_name,
              last_name: userData.last_name,
              group: userData.group,
              centro_distribucion: userData.centro_distribucion,
              distributions_centers: userData.distributions_centers,
              employee_number: userData.employee_number,
            },
            profile_data: cleanProfile,
          };
        }

        const formData = new FormData();

        // User data
        formData.append('user_data', JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          first_name: userData.first_name,
          last_name: userData.last_name,
          group: userData.group,
          centro_distribucion: userData.centro_distribucion,
          distributions_centers: userData.distributions_centers,
          employee_number: userData.employee_number,
        }));

        // Profile data
        const { photo, ...otherProfileData } = profileData;
        formData.append('profile_data', JSON.stringify(otherProfileData));

        if (photo instanceof File) {
          formData.append('photo', photo);
        }

        return formData;
      };

      await createPersonnelWithUser(prepareData() as any).unwrap();
      toast.success('Usuario y perfil de personal creados exitosamente');
      navigate('/user');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error?.data?.message || 'Error al crear usuario y perfil');
    }
  };

  const renderUserStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info">
          Se creará un usuario del sistema con su perfil de personal completo
        </Alert>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          size="small"
          label="Nombre de Usuario *"
          fullWidth
          value={userData.username}
          onChange={(e) => setUserData(prev => ({ ...prev, username: e.target.value }))}
          error={!!errors.username}
          helperText={errors.username || 'Será usado para iniciar sesión'}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon />
              </InputAdornment>
            ),
          }}
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
          helperText={errors.email}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon />
              </InputAdornment>
            ),
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          size="small"
          label="Contraseña *"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          value={userData.password}
          onChange={(e) => setUserData(prev => ({ ...prev, password: e.target.value }))}
          error={!!errors.password}
          helperText={errors.password}
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

      <Grid item xs={12} md={6}>
        <TextField
          size="small"
          label="Nombre *"
          fullWidth
          value={userData.first_name}
          onChange={(e) => setUserData(prev => ({ ...prev, first_name: e.target.value }))}
          error={!!errors.first_name}
          helperText={errors.first_name}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          size="small"
          label="Apellido *"
          fullWidth
          value={userData.last_name}
          onChange={(e) => setUserData(prev => ({ ...prev, last_name: e.target.value }))}
          error={!!errors.last_name}
          helperText={errors.last_name}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          size="small"
          label="Número de Empleado"
          type="number"
          fullWidth
          value={userData.employee_number || ''}
          onChange={(e) => setUserData(prev => ({ ...prev, employee_number: e.target.value ? Number(e.target.value) : undefined }))}
          error={!!errors.employee_number}
          helperText={errors.employee_number || 'Opcional'}
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

      {needDC && (
        <>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={distributionCenters}
              getOptionLabel={(option) => option.name}
              value={distributionCenters.find(dc => dc.id === userData.centro_distribucion) || null}
              onChange={(_, newValue) => setUserData(prev => ({ ...prev, centro_distribucion: newValue?.id || null }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Centro de Distribución Principal *"
                  error={!!errors.centro_distribucion}
                  helperText={errors.centro_distribucion || 'Requerido por el grupo seleccionado'}
                />
              )}
            />
          </Grid>

          {userData.distributions_centers.length > 0 && (
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={distributionCenters}
                getOptionLabel={(option) => option.name}
                value={distributionCenters.filter(dc => userData.distributions_centers.includes(dc.id))}
                onChange={(_, newValue) => setUserData(prev => ({
                  ...prev,
                  distributions_centers: newValue.map(v => v.id)
                }))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Centros Adicionales"
                    helperText="Centros adicionales de acceso (opcional)"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option.name} {...getTagProps({ index })} size="small" />
                  ))
                }
              />
            </Grid>
          )}
        </>
      )}
    </Grid>
  );

  const renderBasicInfoStep = () => (
    <Grid container spacing={3}>
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
          label="Código de Empleado *"
          fullWidth
          value={profileData.employee_code || ''}
          onChange={(e) => setProfileData(prev => ({ ...prev, employee_code: e.target.value }))}
          error={!!errors.employee_code}
          helperText={errors.employee_code}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.gender}>
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
        />
      </Grid>
    </Grid>
  );

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
        <Autocomplete
          options={departments}
          getOptionLabel={(option) => option.name}
          value={departments.find(d => d.id === profileData.department) || null}
          onChange={(_, newValue) => setProfileData(prev => ({ ...prev, department: newValue?.id }))}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Departamento *"
              error={!!errors.department}
              helperText={errors.department}
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
    </Grid>
  );

  const renderEmploymentStep = () => (
    <Grid container spacing={3}>
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
        <FormControl fullWidth error={!!errors.hierarchy_level}>
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
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.position_type}>
          <InputLabel>Tipo de Posición *</InputLabel>
          <Select
            value={profileData.position_type || ''}
            onChange={(e) => setProfileData(prev => ({ ...prev, position_type: e.target.value }))}
            label="Tipo de Posición *"
          >
            <MenuItem value="OPERATIONAL">Operacional</MenuItem>
            <MenuItem value="ADMINISTRATIVE">Administrativo</MenuItem>
            <MenuItem value="MANAGEMENT">Gerencial</MenuItem>
            <MenuItem value="SECURITY">Seguridad</MenuItem>
            <MenuItem value="DRIVER">Conductor</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <DatePicker
          label="Fecha de Contratación *"
          value={profileData.hire_date ? new Date(profileData.hire_date) : null}
          onChange={(date) => setProfileData(prev => ({ ...prev, hire_date: date?.toISOString().split('T')[0] }))}
          slotProps={{
            textField: {
              fullWidth: true,
              error: !!errors.hire_date,
              helperText: errors.hire_date,
            },
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.contract_type}>
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
        return renderUserStep();
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderOrganizationalStep();
      case 3:
        return renderEmploymentStep();
      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" component="h1" fontWeight={400}>
              Registro de Usuario y Personal
            </Typography>
            <Divider sx={{ mt: 1, mb: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Complete todos los pasos para crear un usuario del sistema con su perfil de personal
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel={isMobile}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Box sx={{ minHeight: 400 }}>
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
                  {activeStep === steps.length - 1 ? (isLoading ? 'Creando...' : 'Crear Usuario y Perfil') : 'Siguiente'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
};
