import React, { useState, useEffect, useMemo } from 'react';
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
  MenuItem,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import {
  useGetPersonnelProfileQuery,
  useUpdatePersonnelProfileMutation,
  useGetAreasQuery,
  useGetPersonnelProfilesQuery
} from '../services/personnelApi';
import { useGetDistributorCentersQuery } from '../../../store/maintenance/maintenanceApi';
import { toast } from 'sonner';
import type { PersonnelProfile, PersonnelFilterParams } from '../../../interfaces/personnel';
import { format, parseISO } from 'date-fns';
import { DepartmentSelector } from '../components/DepartmentSelector';

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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const PersonnelEditPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<Partial<PersonnelProfile>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: personnel, isLoading: isLoadingPersonnel } = useGetPersonnelProfileQuery(Number(id), {
    skip: !id,
  });
  const [updatePersonnel, { isLoading: isUpdating }] = useUpdatePersonnelProfileMutation();

  // Load catalogs
  const { data: distributorCentersData } = useGetDistributorCentersQuery({ search: '', limit: 100, offset: 0 });
  const { data: areasData } = useGetAreasQuery();
  const { data: personnelData } = useGetPersonnelProfilesQuery({
    is_active: true,
    limit: 200,
    offset: 0
  } as PersonnelFilterParams);

  const distributorCenters = distributorCentersData?.results || [];
  const areas = Array.isArray(areasData) ? areasData : [];

  // Filter potential supervisors based on hierarchy level
  // Only show people with higher hierarchy than the employee being edited
  const getEligibleSupervisors = () => {
    if (!personnelData?.results || !formData.hierarchy_level) return [];

    const hierarchyOrder: Record<string, number> = {
      'OPERATIVE': 1,
      'SUPERVISOR': 2,
      'AREA_MANAGER': 3,
      'CD_MANAGER': 4,
    };

    const currentLevel = hierarchyOrder[formData.hierarchy_level] || 0;

    return personnelData.results.filter(p => {
      // Exclude self
      if (p.id === Number(id)) return false;
      // Only show people with higher hierarchy level
      const supervisorLevel = hierarchyOrder[p.hierarchy_level] || 0;
      return supervisorLevel > currentLevel;
    });
  };

  const supervisors = getEligibleSupervisors();

  useEffect(() => {
    if (personnel) {
      setFormData({
        ...personnel,
        area: typeof personnel.area === 'object' ? personnel.area.id : personnel.area,
        department: personnel.department_data?.id || null,
        primary_distributor_center: personnel.primary_distributor_center_data?.id || personnel.primary_distributor_center,
        distributor_centers: personnel.distributor_centers_data?.map(dc => dc.id) || [],
        immediate_supervisor: personnel.supervisor_data?.id || null,
      });
    }
  }, [personnel]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleChange = (field: keyof PersonnelProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Reset department when area changes
    if (field === 'area') {
      setFormData((prev) => ({ ...prev, department: null }));
    }
  };

  const handleDateChange = (field: keyof PersonnelProfile, value: Date | null) => {
    if (value) {
      handleChange(field, format(value, 'yyyy-MM-dd'));
    }
  };


  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employee_code) newErrors.employee_code = 'Código de empleado requerido';
    if (!formData.first_name) newErrors.first_name = 'Nombre requerido';
    if (!formData.last_name) newErrors.last_name = 'Apellido requerido';
    if (!formData.primary_distributor_center) newErrors.primary_distributor_center = 'Centro de distribución requerido';
    if (!formData.area) newErrors.area = 'Área requerida';
    if (!formData.hierarchy_level) newErrors.hierarchy_level = 'Nivel jerárquico requerido';
    if (!formData.position) newErrors.position = 'Posición requerida';
    if (!formData.position_type) newErrors.position_type = 'Tipo de posición requerido';
    if (!formData.hire_date) newErrors.hire_date = 'Fecha de contratación requerida';
    if (!formData.contract_type) newErrors.contract_type = 'Tipo de contrato requerido';
    if (!formData.personal_id) newErrors.personal_id = 'Número de identidad requerido';
    if (!formData.birth_date) newErrors.birth_date = 'Fecha de nacimiento requerida';
    if (!formData.gender) newErrors.gender = 'Género requerido';
    if (!formData.phone) newErrors.phone = 'Teléfono requerido';
    if (!formData.address) newErrors.address = 'Dirección requerida';
    if (!formData.city) newErrors.city = 'Ciudad requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAll()) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      // Prepare data
      const dataToSend: any = {
        employee_code: formData.employee_code,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        personal_email: formData.personal_email,
        primary_distributor_center: formData.primary_distributor_center,
        distributor_centers: formData.distributor_centers,
        area: formData.area,
        department: formData.department,
        hierarchy_level: formData.hierarchy_level,
        position: formData.position,
        position_type: formData.position_type,
        hire_date: formData.hire_date,
        contract_type: formData.contract_type,
        personal_id: formData.personal_id,
        birth_date: formData.birth_date,
        gender: formData.gender,
        marital_status: formData.marital_status,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        immediate_supervisor: formData.immediate_supervisor,
        shirt_size: formData.shirt_size,
        pants_size: formData.pants_size,
        shoe_size: formData.shoe_size,
        glove_size: formData.glove_size,
        helmet_size: formData.helmet_size,
        is_active: formData.is_active,
      };

      await updatePersonnel({ id: Number(id), data: dataToSend }).unwrap();
      toast.success('Personal actualizado exitosamente');
      navigate(`/personnel/detail/${id}`);
    } catch (error: any) {
      console.error('Error updating personnel:', error);

      // Mapear errores del backend al estado
      const backendErrors: Record<string, string> = {};

      if (error?.data) {
        // Si hay un mensaje de detail general
        if (error.data.detail) {
          toast.error(error.data.detail);
        }

        // Procesar errores de campos individuales
        Object.keys(error.data).forEach(key => {
          if (key !== 'detail' && key !== 'message') {
            const errorValue = error.data[key];

            // Si el error es un array (formato típico de DRF)
            if (Array.isArray(errorValue)) {
              backendErrors[key] = errorValue[0];
            }
            // Si es un string directo
            else if (typeof errorValue === 'string') {
              backendErrors[key] = errorValue;
            }
            // Si es un objeto (errores anidados)
            else if (typeof errorValue === 'object') {
              backendErrors[key] = JSON.stringify(errorValue);
            }
          }
        });

        // Actualizar el estado de errores
        if (Object.keys(backendErrors).length > 0) {
          setErrors(backendErrors);

          // Mostrar toast con resumen de errores
          const errorCount = Object.keys(backendErrors).length;
          const errorMessages = Object.entries(backendErrors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join('\n');

          toast.error(
            `Hay ${errorCount} error(es) en el formulario:\n${errorMessages}`,
            { duration: 10000 }
          );

          // Scroll al inicio para que el usuario vea los errores
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Si no hay errores específicos, mostrar mensaje genérico
          toast.error(error?.data?.detail || 'Error al actualizar el personal');
        }
      } else {
        toast.error('Error al actualizar el personal');
      }
    }
  };

  if (isLoadingPersonnel) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!personnel) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">No se pudo cargar la información del personal</Alert>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconButton onClick={() => navigate(`/personnel/detail/${id}`)} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" sx={{ fontWeight: 600 }}>
              Editar Personal
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {personnel.employee_code} - {personnel.full_name}
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'fullWidth'}
            scrollButtons={isMobile ? 'auto' : false}
            allowScrollButtonsMobile
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={isMobile ? undefined : tab.label}
                icon={tab.icon}
                iconPosition="start"
                {...a11yProps(index)}
                sx={{
                  minHeight: 48,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab Panel 0: Basic Information */}
        <CustomTabPanel value={activeTab} index={0}>
          <Card variant="outlined">
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    label="Código de Empleado"
                    value={formData.employee_code || ''}
                    onChange={(e) => handleChange('employee_code', e.target.value)}
                    error={!!errors.employee_code}
                    helperText={errors.employee_code}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Email (Trabajo)"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    label="Nombres"
                    value={formData.first_name || ''}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    error={!!errors.first_name}
                    helperText={errors.first_name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    label="Apellidos"
                    value={formData.last_name || ''}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    error={!!errors.last_name}
                    helperText={errors.last_name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Email Personal"
                    value={formData.personal_email || ''}
                    onChange={(e) => handleChange('personal_email', e.target.value)}
                    error={!!errors.personal_email}
                    helperText={errors.personal_email}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    size="small"
                    label="Estado"
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={(e) => handleChange('is_active', e.target.value === 'true')}
                  >
                    <MenuItem value="true">Activo</MenuItem>
                    <MenuItem value="false">Inactivo</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </CustomTabPanel>

        {/* Tab Panel 1: Organizational Information */}
        <CustomTabPanel value={activeTab} index={1}>
          <Card variant="outlined">
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    size="small"
                    value={distributorCenters.find(dc => dc.id === formData.primary_distributor_center) || null}
                    onChange={(_, newValue) => handleChange('primary_distributor_center', newValue?.id || null)}
                    options={distributorCenters}
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Centro de Distribución Principal"
                        required
                        error={!!errors.primary_distributor_center}
                        helperText={errors.primary_distributor_center}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    size="small"
                    value={distributorCenters.filter(dc => formData.distributor_centers?.includes(dc.id))}
                    onChange={(_, newValue) => handleChange('distributor_centers', newValue.map(dc => dc.id))}
                    options={distributorCenters}
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Centros de Distribución"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    size="small"
                    value={areas.find(a => a.id === formData.area) || null}
                    onChange={(_, newValue) => handleChange('area', newValue?.id || null)}
                    options={areas}
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Área"
                        required
                        error={!!errors.area}
                        helperText={errors.area}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DepartmentSelector
                    value={typeof formData.department === 'object' && formData.department !== null ? formData.department.id : formData.department || null}
                    onChange={(departmentId) => handleChange('department', departmentId)}
                    areaId={typeof formData.area === 'object' && formData.area !== null ? formData.area.id : formData.area || null}
                    error={errors.department}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    select
                    size="small"
                    label="Nivel Jerárquico"
                    value={formData.hierarchy_level || ''}
                    onChange={(e) => handleChange('hierarchy_level', e.target.value)}
                    error={!!errors.hierarchy_level}
                    helperText={errors.hierarchy_level}
                  >
                    <MenuItem value="OPERATIVE">Operativo</MenuItem>
                    <MenuItem value="SUPERVISOR">Supervisor</MenuItem>
                    <MenuItem value="AREA_MANAGER">Jefe de Área</MenuItem>
                    <MenuItem value="CD_MANAGER">Gerente de CD</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    size="small"
                    value={supervisors.find(s => s.id === formData.immediate_supervisor) || null}
                    onChange={(_, newValue) => handleChange('immediate_supervisor', newValue?.id || null)}
                    options={supervisors}
                    getOptionLabel={(option) => `${option.employee_code} - ${option.full_name}`}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {option.employee_code} - {option.full_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.hierarchy_level_display || option.hierarchy_level} - {option.position}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Jefe Inmediato"
                        error={!!errors.immediate_supervisor}
                        helperText={errors.immediate_supervisor || 'Solo muestra personal de nivel jerárquico superior'}
                      />
                    )}
                    noOptionsText="No hay personal de nivel superior disponible"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </CustomTabPanel>

        {/* Tab Panel 2: Work Information */}
        <CustomTabPanel value={activeTab} index={2}>
          <Card variant="outlined">
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    label="Posición"
                    value={formData.position || ''}
                    onChange={(e) => handleChange('position', e.target.value)}
                    error={!!errors.position}
                    helperText={errors.position}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    select
                    size="small"
                    label="Tipo de Posición"
                    value={formData.position_type || ''}
                    onChange={(e) => handleChange('position_type', e.target.value)}
                    error={!!errors.position_type}
                    helperText={errors.position_type}
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
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Fecha de Contratación *"
                    value={formData.hire_date ? parseISO(formData.hire_date) : null}
                    onChange={(date) => handleDateChange('hire_date', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        size: 'small',
                        error: !!errors.hire_date,
                        helperText: errors.hire_date,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    select
                    size="small"
                    label="Tipo de Contrato"
                    value={formData.contract_type || ''}
                    onChange={(e) => handleChange('contract_type', e.target.value)}
                    error={!!errors.contract_type}
                    helperText={errors.contract_type}
                  >
                    <MenuItem value="PERMANENT">Permanente</MenuItem>
                    <MenuItem value="TEMPORARY">Temporal</MenuItem>
                    <MenuItem value="CONTRACT">Contrato</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </CustomTabPanel>

        {/* Tab Panel 3: Personal Information */}
        <CustomTabPanel value={activeTab} index={3}>
          <Card variant="outlined">
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    label="Número de Identidad"
                    value={formData.personal_id || ''}
                    onChange={(e) => handleChange('personal_id', e.target.value)}
                    error={!!errors.personal_id}
                    helperText={errors.personal_id}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Fecha de Nacimiento *"
                    value={formData.birth_date ? parseISO(formData.birth_date) : null}
                    onChange={(date) => handleDateChange('birth_date', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        size: 'small',
                        error: !!errors.birth_date,
                        helperText: errors.birth_date,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    select
                    size="small"
                    label="Género"
                    value={formData.gender || ''}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    error={!!errors.gender}
                    helperText={errors.gender}
                  >
                    <MenuItem value="M">Masculino</MenuItem>
                    <MenuItem value="F">Femenino</MenuItem>
                    <MenuItem value="OTHER">Otro</MenuItem>
                  </TextField>
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
                    <MenuItem value="SINGLE">Soltero/a</MenuItem>
                    <MenuItem value="MARRIED">Casado/a</MenuItem>
                    <MenuItem value="DIVORCED">Divorciado/a</MenuItem>
                    <MenuItem value="WIDOWED">Viudo/a</MenuItem>
                    <MenuItem value="UNION">Unión libre</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    label="Teléfono"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    placeholder="+504 9999-9999"
                  />
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    label="Dirección"
                    value={formData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    error={!!errors.address}
                    helperText={errors.address}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Tallas de Uniformes y EPP
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    size="small"
                    label="Talla de Camisa"
                    value={formData.shirt_size || ''}
                    onChange={(e) => handleChange('shirt_size', e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Seleccionar...</em>
                    </MenuItem>
                    <MenuItem value="XS">XS</MenuItem>
                    <MenuItem value="S">S</MenuItem>
                    <MenuItem value="M">M</MenuItem>
                    <MenuItem value="L">L</MenuItem>
                    <MenuItem value="XL">XL</MenuItem>
                    <MenuItem value="XXL">XXL</MenuItem>
                    <MenuItem value="XXXL">XXXL</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Talla de Pantalón"
                    value={formData.pants_size || ''}
                    onChange={(e) => handleChange('pants_size', e.target.value)}
                    placeholder="Ej: 32, 34, 36"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Talla de Zapatos"
                    value={formData.shoe_size || ''}
                    onChange={(e) => handleChange('shoe_size', e.target.value)}
                    placeholder="Ej: 9, 10, 11"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </CustomTabPanel>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/personnel/detail/${id}`)}
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
      </Container>
    </LocalizationProvider>
  );
};
