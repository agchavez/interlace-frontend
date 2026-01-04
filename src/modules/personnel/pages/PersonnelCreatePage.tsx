import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Divider,
  Tabs,
  Tab,
  Button,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
  TextField,
  Autocomplete,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogActions,
  styled,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CakeIcon from '@mui/icons-material/Cake';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { useCreatePersonnelProfileMutation, useCreatePersonnelWithUserMutation, useGetAreasQuery, useGetDepartmentsQuery, useGetPersonnelProfilesQuery } from '../services/personnelApi';
import { useGetDistributorCentersQuery } from '../../../store/maintenance/maintenanceApi';
import { toast } from 'sonner';
import type { PersonnelProfile } from '../../../interfaces/personnel';
import BootstrapDialogTitle from '../../ui/components/BootstrapDialogTitle';
import { PersonnelCreateModeSelector } from '../components/PersonnelCreateModeSelector';
import { ExistingUserSelector } from '../components/ExistingUserSelector';
import { NewUserRegistration } from '../components/NewUserRegistration';
import { PhotoUpload } from '../components/PhotoUpload';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const tabs = [
  { label: 'Información Básica', icon: <BadgeIcon /> },
  { label: 'Organizacional', icon: <BusinessIcon /> },
  { label: 'Información Laboral', icon: <WorkIcon /> },
  { label: 'Información Personal', icon: <PersonIcon /> },
];

function a11yProps(index: number) {
  return {
    id: `personnel-tab-${index}`,
    'aria-controls': `personnel-tabpanel-${index}`,
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`personnel-tabpanel-${index}`}
      aria-labelledby={`personnel-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export const PersonnelCreatePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isFullHD = useMediaQuery(theme.breakpoints.up('xl'));

  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<Partial<PersonnelProfile>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Nuevo flujo: Estados para modales
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [showExistingUserSelector, setShowExistingUserSelector] = useState(false);
  const [showNewUserRegistration, setShowNewUserRegistration] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Estados para usuario
  const [createMode, setCreateMode] = useState<'personnel_only' | 'existing_user' | 'new_user'>('personnel_only');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [newUserData, setNewUserData] = useState<any>(null);

  const [createPersonnel, { isLoading }] = useCreatePersonnelProfileMutation();
  const [createPersonnelWithUser, { isLoading: isLoadingWithUser }] = useCreatePersonnelWithUserMutation();

  // Handlers para el flujo de modales
  const handleModeSelect = (mode: 'personnel_only' | 'existing_user' | 'new_user') => {
    setCreateMode(mode);
    setShowModeSelector(false);

    if (mode === 'personnel_only') {
      setShowForm(true);
    } else if (mode === 'existing_user') {
      setShowExistingUserSelector(true);
    } else if (mode === 'new_user') {
      setShowNewUserRegistration(true);
    }
  };

  const handleUserSelected = (user: any) => {
    setSelectedUser(user);
    // Pre-llenar datos del formulario con info del usuario
    setFormData((prev) => ({
      ...prev,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      primary_distributor_center: user.centro_distribucion || undefined,
      distributor_centers: user.distributions_centers || [],
    }));
    setShowExistingUserSelector(false);
    setShowForm(true);
  };

  const handleNewUserCreated = (userData: any) => {
    setNewUserData(userData);
    // Pre-llenar datos del formulario
    setFormData((prev) => ({
      ...prev,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
    }));
    setShowNewUserRegistration(false);
    setShowForm(true);
  };

  const handleCancelFlow = () => {
    navigate('/personnel');
  };

  // Cargar catálogos desde API
  const { data: distributorCentersData } = useGetDistributorCentersQuery({ limit: 100, offset: 0 });
  const { data: areasData } = useGetAreasQuery();
  const { data: departmentsData } = useGetDepartmentsQuery({
    area: formData.area as number | undefined
  });
  const { data: personnelData } = useGetPersonnelProfilesQuery({
    hierarchy_level__in: 'SUPERVISOR,AREA_MANAGER,CD_MANAGER',
    is_active: true,
    limit: 200,
    offset: 0
  });

  const distributorCenters = distributorCentersData?.results || [];
  const areas = areasData || [];
  const departments = departmentsData || [];
  const supervisors = personnelData?.results || [];

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCancel = () => {
    navigate('/personnel');
  };

  // Validar si el formulario está completo
  const isFormValid = useMemo(() => {
    return !!(
      formData.employee_code &&
      formData.first_name &&
      formData.last_name &&
      formData.primary_distributor_center &&
      formData.area &&
      formData.hierarchy_level &&
      formData.position &&
      formData.position_type &&
      formData.hire_date &&
      formData.contract_type &&
      formData.personal_id &&
      formData.birth_date &&
      formData.gender &&
      formData.phone &&
      formData.address &&
      formData.city
    );
  }, [formData]);

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar información básica
    if (!formData.employee_code) newErrors.employee_code = 'Código de empleado requerido';
    if (!formData.first_name) newErrors.first_name = 'Nombre requerido';
    if (!formData.last_name) newErrors.last_name = 'Apellido requerido';

    // Validar información organizacional
    if (!formData.primary_distributor_center) newErrors.primary_distributor_center = 'Centro de distribución requerido';
    if (!formData.area) newErrors.area = 'Área requerida';
    if (!formData.hierarchy_level) newErrors.hierarchy_level = 'Nivel jerárquico requerido';
    if (!formData.position) newErrors.position = 'Posición requerida';
    if (!formData.position_type) newErrors.position_type = 'Tipo de posición requerido';

    // Validar información laboral
    if (!formData.hire_date) newErrors.hire_date = 'Fecha de contratación requerida';
    if (!formData.contract_type) newErrors.contract_type = 'Tipo de contrato requerido';

    // Validar información personal
    if (!formData.personal_id) {
      newErrors.personal_id = 'Número de identidad requerido';
    } else if (formData.personal_id.length < 13) {
      newErrors.personal_id = 'Debe tener al menos 13 caracteres';
    }
    if (!formData.birth_date) newErrors.birth_date = 'Fecha de nacimiento requerida';
    if (!formData.gender) newErrors.gender = 'Género requerido';
    if (!formData.phone) newErrors.phone = 'Teléfono requerido';
    if (!formData.address) newErrors.address = 'Dirección requerida';
    if (!formData.city) newErrors.city = 'Ciudad requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShowConfirmModal = () => {
    if (!validateAll()) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }
    setShowConfirmModal(true);
  };

  // Helper function to convert data to FormData if needed
  const prepareFormData = (data: any) => {
    const hasFile = data.photo instanceof File;

    if (!hasFile) {
      // No hay archivo, enviar como JSON normal (sin photo)
      const { photo, ...cleanData } = data;
      return cleanData;
    }

    // Hay archivo, crear FormData
    const formDataToSend = new FormData();
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (value === null || value === undefined) {
        return;
      }

      if (key === 'photo' && value instanceof File) {
        formDataToSend.append(key, value);
      } else if (key === 'distributor_centers' && Array.isArray(value)) {
        value.forEach((id) => formDataToSend.append('distributor_centers', id.toString()));
      } else if (typeof value === 'object' && !(value instanceof File)) {
        formDataToSend.append(key, JSON.stringify(value));
      } else {
        formDataToSend.append(key, value.toString());
      }
    });
    return formDataToSend;
  };

  const handleConfirmSubmit = async () => {
    try {
      if (createMode === 'new_user') {
        // Crear usuario y perfil
        const profileData = prepareFormData(formData);
        await createPersonnelWithUser({
          user_data: {
            username: newUserData.username,
            email: newUserData.email,
            password: newUserData.password,
            first_name: newUserData.first_name,
            last_name: newUserData.last_name,
          },
          profile_data: profileData,
        } as any).unwrap();
        toast.success('Usuario y personal creados exitosamente');
      } else if (createMode === 'existing_user') {
        // Crear perfil vinculado a usuario existente
        const dataToSend = prepareFormData({ ...formData, user: selectedUser?.id });
        await createPersonnel(dataToSend as any).unwrap();
        toast.success('Personal creado y vinculado a usuario existente');
      } else {
        // Crear solo perfil (personnel_only)
        const dataToSend = prepareFormData(formData);
        await createPersonnel(dataToSend as any).unwrap();
        toast.success('Personal creado exitosamente');
      }
      setShowConfirmModal(false);
      navigate('/personnel');
    } catch (error: any) {
      console.error('Error al crear personal:', error);
      const errorMessage = error?.data?.detail?.message || error?.data?.mensage || error?.data?.detail || 'Error al crear el personal';
      toast.error(errorMessage);
      setShowConfirmModal(false);
    }
  };

  const updateFormData = (data: Partial<PersonnelProfile>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  return (
    <>
      {/* Modales del nuevo flujo */}
      <PersonnelCreateModeSelector
        open={showModeSelector}
        onClose={handleCancelFlow}
        onModeSelect={handleModeSelect}
      />

      <ExistingUserSelector
        open={showExistingUserSelector}
        onClose={() => {
          setShowExistingUserSelector(false);
          setShowModeSelector(true);
        }}
        onUserSelected={handleUserSelected}
      />

      <NewUserRegistration
        open={showNewUserRegistration}
        onClose={() => {
          setShowNewUserRegistration(false);
          setShowModeSelector(true);
        }}
        onUserCreated={handleNewUserCreated}
      />

      {/* Formulario principal - solo se muestra después de seleccionar modo */}
      {showForm && (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Container maxWidth="xl">
        <Grid container spacing={1} sx={{ marginTop: 2 }}>
        {/* Header */}
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" fontWeight={400}>
            Nuevo Personal
            {createMode === 'existing_user' && selectedUser && (
              <Typography component="span" variant="body1" color="success.main" sx={{ ml: 2 }}>
                - Vinculado a @{selectedUser.username}
              </Typography>
            )}
            {createMode === 'new_user' && newUserData && (
              <Typography component="span" variant="body1" color="primary.main" sx={{ ml: 2 }}>
                - Creando usuario @{newUserData.username}
              </Typography>
            )}
          </Typography>
          <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
        </Grid>

        {/* Info Alert según modo */}
        {createMode === 'existing_user' && selectedUser && (
          <Grid item xs={12}>
            <Alert severity="success">
              Usuario <strong>{selectedUser.full_name}</strong> vinculado. Los datos se han prellenado automáticamente.
            </Alert>
          </Grid>
        )}
        {createMode === 'new_user' && newUserData && (
          <Grid item xs={12}>
            <Alert severity="info">
              Se creará el usuario <strong>@{newUserData.username}</strong> junto con el perfil de personal.
            </Alert>
          </Grid>
        )}
        {createMode === 'personnel_only' && (
          <Grid item xs={12}>
            <Alert severity="info">
              Este empleado NO tendrá acceso al sistema. Solo se creará su registro de personal.
            </Alert>
          </Grid>
        )}

        <Grid item xs={12} md={8} lg={9} xl={10}></Grid>
        <Grid
          item
          xs={12}
          md={4}
          lg={3}
          xl={2}
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            fullWidth
            onClick={handleCancel}
            startIcon={<ArrowBackIcon color="inherit" fontSize="small" />}
          >
            <Typography
              variant="body2"
              component="span"
              fontWeight={400}
              color={"gray.700"}
            >
              Volver al Listado
            </Typography>
          </Button>
        </Grid>

        {/* Tabs */}
        <Grid item xs={12}>
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant={isMobile ? "scrollable" : "fullWidth"}
                scrollButtons="auto"
                aria-label="personnel form tabs"
              >
                {tabs.map((tab, index) => (
                  <Tab
                    key={index}
                    icon={tab.icon}
                    label={!isMobile ? tab.label : undefined}
                    iconPosition="start"
                    {...a11yProps(index)}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Tab Panels */}
            <CustomTabPanel value={activeTab} index={0}>
              <BasicInfoStep
                data={formData}
                errors={errors}
                onChange={updateFormData}
              />
            </CustomTabPanel>

            <CustomTabPanel value={activeTab} index={1}>
              <OrganizationalStep
                data={formData}
                errors={errors}
                onChange={updateFormData}
                distributorCenters={distributorCenters}
                areas={areas}
                departments={departments}
                supervisors={supervisors}
              />
            </CustomTabPanel>

            <CustomTabPanel value={activeTab} index={2}>
              <EmploymentStep
                data={formData}
                errors={errors}
                onChange={updateFormData}
              />
            </CustomTabPanel>

            <CustomTabPanel value={activeTab} index={3}>
              <PersonalInfoStep
                data={formData}
                errors={errors}
                onChange={updateFormData}
              />
            </CustomTabPanel>
          </Box>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
        </Grid>
        <Grid
          item
          xs={12}
          md={3}
          lg={3}
          xl={2}
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          <Button
            variant="outlined"
            color="secondary"
            size="medium"
            fullWidth
            onClick={handleCancel}
          >
            <Typography
              variant="body2"
              component="span"
              fontWeight={400}
              color={"gray.700"}
            >
              Cancelar
            </Typography>
          </Button>
        </Grid>
        <Grid item xs={12} md={3} lg={3} xl={6}></Grid>
        <Grid
          item
          xs={12}
          md={6}
          lg={6}
          xl={4}
          style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}
        >
          <Button
            variant="contained"
            color="primary"
            size="medium"
            fullWidth
            onClick={handleShowConfirmModal}
            disabled={!isFormValid || isLoading || isLoadingWithUser}
            endIcon={<SaveIcon color="inherit" fontSize="small" />}
          >
            <Typography
              variant="body2"
              component="span"
              fontWeight={400}
              color={"gray.700"}
            >
              Guardar Personal
            </Typography>
          </Button>
        </Grid>
        <Grid item xs={12} sx={{ marginTop: 5 }}></Grid>
      </Grid>
    </Container>

    {/* Modal de Confirmación */}
    <BootstrapDialog open={showConfirmModal} onClose={() => setShowConfirmModal(false)} fullWidth maxWidth="md">
      <BootstrapDialogTitle id="confirm-dialog-title" onClose={() => setShowConfirmModal(false)}>
        <Typography variant="h6" component="span" fontWeight={400} color={'#fff'}>
          Confirmar Creación de Personal
        </Typography>
      </BootstrapDialogTitle>
      <DialogContent dividers>
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Resumen de Información
          </Typography>

          {/* Información Básica */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BadgeIcon fontSize="small" color="primary" />
              Información Básica
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Código de Empleado:</Typography>
                <Typography variant="body1" fontWeight={500}>{formData.employee_code}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Nombre Completo:</Typography>
                <Typography variant="body1" fontWeight={500}>{formData.first_name} {formData.last_name}</Typography>
              </Grid>
              {formData.email && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                  <Typography variant="body1" fontWeight={500}>{formData.email}</Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Información Organizacional */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon fontSize="small" color="primary" />
              Información Organizacional
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Centro de Distribución:</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {distributorCenters.find((c: any) => c.id === formData.primary_distributor_center)?.name || '-'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Área:</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {areas.find((a: any) => a.id === formData.area)?.name || '-'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Nivel Jerárquico:</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formData.hierarchy_level === 'OPERATIVE' && 'Operativo'}
                  {formData.hierarchy_level === 'SUPERVISOR' && 'Supervisor'}
                  {formData.hierarchy_level === 'AREA_MANAGER' && 'Jefe de Área'}
                  {formData.hierarchy_level === 'CD_MANAGER' && 'Gerente de Centro'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Posición:</Typography>
                <Typography variant="body1" fontWeight={500}>{formData.position}</Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Información Laboral */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon fontSize="small" color="primary" />
              Información Laboral
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Fecha de Contratación:</Typography>
                <Typography variant="body1" fontWeight={500}>{formData.hire_date}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Tipo de Contrato:</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formData.contract_type === 'PERMANENT' && 'Permanente'}
                  {formData.contract_type === 'TEMPORARY' && 'Temporal'}
                  {formData.contract_type === 'CONTRACTOR' && 'Contratista'}
                  {formData.contract_type === 'INTERNSHIP' && 'Pasantía'}
                </Typography>
              </Grid>
              {formData.base_salary && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Salario Base:</Typography>
                  <Typography variant="body1" fontWeight={500}>${formData.base_salary}</Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Información Personal */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" color="primary" />
              Información Personal
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Número de Identificación:</Typography>
                <Typography variant="body1" fontWeight={500}>{formData.personal_id}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Fecha de Nacimiento:</Typography>
                <Typography variant="body1" fontWeight={500}>{formData.birth_date}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Género:</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formData.gender === 'M' && 'Masculino'}
                  {formData.gender === 'F' && 'Femenino'}
                  {formData.gender === 'OTHER' && 'Otro'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Teléfono:</Typography>
                <Typography variant="body1" fontWeight={500}>{formData.phone}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Ciudad:</Typography>
                <Typography variant="body1" fontWeight={500}>{formData.city}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Dirección:</Typography>
                <Typography variant="body1" fontWeight={500}>{formData.address}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Alert severity="info" sx={{ mt: 3 }}>
            ¿Está seguro de que desea crear este registro de personal con la información proporcionada?
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="secondary"
          size="medium"
          onClick={() => setShowConfirmModal(false)}
        >
          <Typography variant="body2" component="span" fontWeight={400} color={'gray.700'}>
            Cancelar
          </Typography>
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="medium"
          onClick={handleConfirmSubmit}
          disabled={isLoading || isLoadingWithUser}
          startIcon={isLoading || isLoadingWithUser ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          <Typography variant="body2" component="span" fontWeight={400} color={'gray.700'}>
            {isLoading || isLoadingWithUser ? 'Guardando...' : 'Confirmar y Guardar'}
          </Typography>
        </Button>
      </DialogActions>
    </BootstrapDialog>
  </LocalizationProvider>
      )}
    </>
  );
};

// ============================================
// Step Components
// ============================================

interface StepProps {
  data: Partial<PersonnelProfile>;
  errors: Record<string, string>;
  onChange: (data: Partial<PersonnelProfile>) => void;
}

interface OrganizationalStepProps extends StepProps {
  distributorCenters: any[];
  areas: any[];
  departments: any[];
  supervisors: any[];
}

const BasicInfoStep: React.FC<StepProps> = ({ data, errors, onChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, py: 3 }}>
      <TextField
        label="Código de Empleado"
        value={data.employee_code || ''}
        onChange={(e) => onChange({ employee_code: e.target.value })}
        error={!!errors.employee_code}
        helperText={errors.employee_code}
        required
        fullWidth
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <BadgeIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="Nombre"
        value={data.first_name || ''}
        onChange={(e) => onChange({ first_name: e.target.value })}
        error={!!errors.first_name}
        helperText={errors.first_name}
        required
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
        value={data.last_name || ''}
        onChange={(e) => onChange({ last_name: e.target.value })}
        error={!!errors.last_name}
        helperText={errors.last_name}
        required
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
        label="Email"
        type="email"
        value={data.email || ''}
        onChange={(e) => onChange({ email: e.target.value })}
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

      <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' }, mt: 2 }}>
        <PhotoUpload
          value={data.photo}
          onChange={(file) => onChange({ photo: file })}
          error={errors.photo}
        />
      </Box>

      <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
        <Alert severity="info" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
          Los campos marcados con * son obligatorios. La foto de perfil es opcional pero recomendada.
        </Alert>
      </Box>
    </Box>
  );
};

const OrganizationalStep: React.FC<OrganizationalStepProps> = ({
  data,
  errors,
  onChange,
  distributorCenters,
  areas,
  departments,
  supervisors
}) => {
  const hierarchyLevels = [
    { value: 'OPERATIVE', label: 'Operativo' },
    { value: 'SUPERVISOR', label: 'Supervisor' },
    { value: 'AREA_MANAGER', label: 'Jefe de Área' },
    { value: 'CD_MANAGER', label: 'Gerente de Centro' },
  ];

  const positionTypes = [
    { value: 'PICKER', label: 'Picker' },
    { value: 'COUNTER', label: 'Contador' },
    { value: 'OPM', label: 'Operador de Montacargas' },
    { value: 'YARD_DRIVER', label: 'Conductor de Patio' },
    { value: 'LOADER', label: 'Cargador' },
    { value: 'WAREHOUSE_ASSISTANT', label: 'Ayudante de Almacén' },
    { value: 'SECURITY_GUARD', label: 'Guardia de Seguridad' },
    { value: 'DELIVERY_DRIVER', label: 'Conductor de Delivery' },
    { value: 'ADMINISTRATIVE', label: 'Administrativo' },
    { value: 'OTHER', label: 'Otro' },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, py: 3 }}>
      <Autocomplete
        options={distributorCenters}
        getOptionLabel={(option) => option.name || ''}
        value={distributorCenters.find((c: any) => c.id === data.primary_distributor_center) || null}
        onChange={(_, newValue) => onChange({ primary_distributor_center: newValue?.id })}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Centro de Distribución Principal"
            required
            error={!!errors.primary_distributor_center}
            helperText={errors.primary_distributor_center || 'Centro de distribución principal del empleado'}
            size="small"
          />
        )}
        fullWidth
        size="small"
      />

      <Autocomplete
        multiple
        options={distributorCenters}
        getOptionLabel={(option) => option.name || ''}
        value={distributorCenters.filter((c: any) =>
          data.distributor_centers?.includes(c.id)
        ) || []}
        onChange={(_, newValue) => onChange({
          distributor_centers: newValue.map((v: any) => v.id)
        })}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Centros de Distribución Adicionales"
            size="small"
            helperText="Centros adicionales donde puede trabajar el empleado (opcional)"
          />
        )}
        fullWidth
        size="small"
      />

      <Autocomplete
        options={areas}
        getOptionLabel={(option) => option.name || ''}
        value={areas.find((a: any) => a.id === data.area) || null}
        onChange={(_, newValue) => onChange({ area: newValue?.id })}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Área"
            required
            error={!!errors.area}
            helperText={errors.area}
            size="small"
          />
        )}
        fullWidth
        size="small"
      />

      <Autocomplete
        options={departments}
        getOptionLabel={(option) => option.name || ''}
        value={departments.find((d: any) => d.id === data.department) || null}
        onChange={(_, newValue) => onChange({ department: newValue?.id })}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Departamento"
            size="small"
          />
        )}
        fullWidth
        size="small"
      />

      <Autocomplete
        options={hierarchyLevels}
        getOptionLabel={(option) => option.label}
        value={hierarchyLevels.find((h) => h.value === data.hierarchy_level) || null}
        onChange={(_, newValue) => onChange({ hierarchy_level: newValue?.value })}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Nivel Jerárquico"
            required
            error={!!errors.hierarchy_level}
            helperText={errors.hierarchy_level}
            size="small"
          />
        )}
        fullWidth
        size="small"
      />

      <TextField
        label="Posición"
        value={data.position || ''}
        onChange={(e) => onChange({ position: e.target.value })}
        error={!!errors.position}
        helperText={errors.position}
        required
        fullWidth
        variant="outlined"
        size="small"
      />

      <Autocomplete
        options={positionTypes}
        getOptionLabel={(option) => option.label}
        value={positionTypes.find((p) => p.value === data.position_type) || null}
        onChange={(_, newValue) => onChange({ position_type: newValue?.value })}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tipo de Posición"
            required
            error={!!errors.position_type}
            helperText={errors.position_type}
            size="small"
          />
        )}
        fullWidth
        size="small"
      />

      <Autocomplete
        options={supervisors}
        getOptionLabel={(option) => `${option.employee_code} - ${option.full_name} (${option.position || 'Sin posición'})`}
        value={supervisors.find((s: any) => s.id === data.immediate_supervisor) || null}
        onChange={(_, newValue) => onChange({ immediate_supervisor: newValue?.id })}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Jefe Inmediato"
            size="small"
            helperText="Supervisor directo del empleado (opcional)"
            error={!!errors.immediate_supervisor}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
            }}
          />
        )}
        fullWidth
        size="small"
      />
    </Box>
  );
};

const EmploymentStep: React.FC<StepProps> = ({ data, errors, onChange }) => {
  const contractTypes = [
    { value: 'PERMANENT', label: 'Permanente' },
    { value: 'TEMPORARY', label: 'Temporal' },
    { value: 'CONTRACTOR', label: 'Contratista' },
    { value: 'INTERNSHIP', label: 'Pasantía' },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, py: 3 }}>
      <DatePicker
        label="Fecha de Contratación *"
        value={data.hire_date ? new Date(data.hire_date) : null}
        onChange={(newValue) => {
          const dateStr = newValue ? newValue.toISOString().split('T')[0] : '';
          onChange({ hire_date: dateStr });
        }}
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
            error: !!errors.hire_date,
            helperText: errors.hire_date,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarTodayIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          },
        }}
      />

      <Autocomplete
        options={contractTypes}
        getOptionLabel={(option) => option.label}
        value={contractTypes.find((c) => c.value === data.contract_type) || null}
        onChange={(_, newValue) => onChange({ contract_type: newValue?.value })}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tipo de Contrato"
            required
            error={!!errors.contract_type}
            helperText={errors.contract_type}
            size="small"
          />
        )}
        fullWidth
        size="small"
      />

      <TextField
        label="Salario Base"
        type="number"
        value={data.base_salary || ''}
        onChange={(e) => onChange({ base_salary: e.target.value })}
        fullWidth
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <AttachMoneyIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <DatePicker
        label="Fecha de Terminación"
        value={data.termination_date ? new Date(data.termination_date) : null}
        onChange={(newValue) => {
          const dateStr = newValue ? newValue.toISOString().split('T')[0] : '';
          onChange({ termination_date: dateStr });
        }}
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarTodayIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          },
        }}
      />
    </Box>
  );
};

const PersonalInfoStep: React.FC<StepProps> = ({ data, errors, onChange }) => {
  const genders = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'OTHER', label: 'Otro' },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, py: 3 }}>
      <TextField
        label="Número de Identificación *"
        value={data.personal_id || ''}
        onChange={(e) => onChange({ personal_id: e.target.value })}
        error={!!errors.personal_id}
        helperText={errors.personal_id || 'Mínimo 13 caracteres'}
        required
        fullWidth
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FingerprintIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <DatePicker
        label="Fecha de Nacimiento *"
        value={data.birth_date ? new Date(data.birth_date) : null}
        onChange={(newValue) => {
          const dateStr = newValue ? newValue.toISOString().split('T')[0] : '';
          onChange({ birth_date: dateStr });
        }}
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
            required: true,
            error: !!errors.birth_date,
            helperText: errors.birth_date,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  <CakeIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          },
        }}
      />

      <Autocomplete
        options={genders}
        getOptionLabel={(option) => option.label}
        value={genders.find((g) => g.value === data.gender) || null}
        onChange={(_, newValue) => onChange({ gender: newValue?.value })}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Género *"
            size="small"
            required
            error={!!errors.gender}
            helperText={errors.gender}
          />
        )}
        fullWidth
        size="small"
      />

      <TextField
        label="Teléfono *"
        type="tel"
        value={data.phone || ''}
        onChange={(e) => onChange({ phone: e.target.value })}
        error={!!errors.phone}
        helperText={errors.phone}
        required
        fullWidth
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PhoneIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="Ciudad *"
        value={data.city || ''}
        onChange={(e) => onChange({ city: e.target.value })}
        error={!!errors.city}
        helperText={errors.city}
        required
        fullWidth
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LocationOnIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="Dirección *"
        multiline
        rows={3}
        value={data.address || ''}
        onChange={(e) => onChange({ address: e.target.value })}
        error={!!errors.address}
        helperText={errors.address}
        required
        fullWidth
        variant="outlined"
        size="small"
        sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
              <LocationOnIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
        <Alert severity="warning" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
          Todos los campos de información personal son obligatorios
        </Alert>
      </Box>
    </Box>
  );
};
