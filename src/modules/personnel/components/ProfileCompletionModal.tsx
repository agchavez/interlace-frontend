import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Grid,
  useTheme,
  useMediaQuery,
  Alert,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useGetProfileCompletionDataQuery, useCompleteMyProfileMutation } from '../services/personnelApi';
import { BasicInfoForm } from './profile-completion/BasicInfoForm';
import { OrganizationalInfoForm } from './profile-completion/OrganizationalInfoForm';
import { EmploymentInfoForm } from './profile-completion/EmploymentInfoForm';
import { PersonalInfoForm } from './profile-completion/PersonalInfoForm';
import type { PersonnelProfileCreateUpdate } from '../../../interfaces/personnel';
import { toast } from 'sonner';
import BootstrapDialogTitle from '../../ui/components/BootstrapDialogTitle';

interface Props {
  onComplete: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const ProfileCompletionModal: React.FC<Props> = ({ onComplete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isTv = useMediaQuery(theme.breakpoints.up('xl'));

  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<Partial<PersonnelProfileCreateUpdate>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const { data: completionData, isLoading: loadingData } = useGetProfileCompletionDataQuery();
  const [completeProfile, { isLoading: submitting }] = useCompleteMyProfileMutation();

  useEffect(() => {
    // Pre-llenar datos del usuario
    if (completionData?.user_info) {
      setFormData((prev) => ({
        ...prev,
        first_name: completionData.user_info.first_name || '',
        last_name: completionData.user_info.last_name || '',
        email: completionData.user_info.email || '',
      }));
    }
  }, [completionData]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleNext = () => {
    if (activeTab < 3) {
      setActiveTab(activeTab + 1);
    }
  };

  const handleBack = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  const handleFormChange = (data: Partial<PersonnelProfileCreateUpdate>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setErrors({});
  };

  const handleSubmit = async () => {
    try {
      await completeProfile(formData as PersonnelProfileCreateUpdate).unwrap();
      toast.success('Perfil completado exitosamente');
      onComplete();
    } catch (error: any) {
      if (error.data) {
        setErrors(error.data);
        toast.error('Por favor corrige los errores en el formulario');
      } else {
        toast.error('Error al completar el perfil');
      }
    }
  };

  const isTabComplete = (tabIndex: number): boolean => {
    switch (tabIndex) {
      case 0: // Información Básica
        return !!(formData.employee_code && formData.first_name && formData.last_name && formData.email);
      case 1: // Información Organizacional
        return !!(formData.distributor_center && formData.area && formData.hierarchy_level && formData.position && formData.position_type);
      case 2: // Información Laboral
        return !!(formData.hire_date && formData.contract_type);
      case 3: // Información Personal
        return !!(formData.personal_id && formData.birth_date && formData.gender && formData.phone && formData.address && formData.city);
      default:
        return false;
    }
  };

  const canSubmit = isTabComplete(0) && isTabComplete(1) && isTabComplete(2) && isTabComplete(3);

  if (loadingData) {
    return (
      <Dialog open fullScreen>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <CircularProgress size={isMobile ? 40 : 60} />
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog
      open
      fullScreen={isMobile}
      maxWidth="lg"
      fullWidth
      disableEscapeKeyDown
      sx={{
        '& .MuiDialog-paper': {
          minHeight: isMobile ? '100vh' : isTablet ? '90vh' : '85vh',
          maxHeight: isMobile ? '100vh' : '95vh',
        },
      }}
    >
      <BootstrapDialogTitle id="profile-completion-dialog-title">
        <Typography variant="h6" fontWeight={600} color={'#fff'}>
          Completar Perfil de Personal
        </Typography>
      </BootstrapDialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 2, sm: 3, md: 4 }, textAlign: 'center' }}>
          <Typography
            variant={isMobile ? 'body2' : 'body1'}
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Para acceder al sistema, necesitamos que complete su información de personal.
            Por favor, complete todos los campos requeridos.
          </Typography>
        </Box>

        {/* Alert si hay errores generales */}
        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Por favor revise los campos marcados en rojo
          </Alert>
        )}

        {/* Tabs */}
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'fullWidth'}
            scrollButtons={isMobile ? 'auto' : false}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: { xs: 60, sm: 72 },
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
              },
            }}
          >
            <Tab
              icon={isTabComplete(0) ? <CheckCircleIcon color="success" /> : <PersonIcon />}
              label="Básica"
              iconPosition={isMobile ? 'top' : 'start'}
            />
            <Tab
              icon={isTabComplete(1) ? <CheckCircleIcon color="success" /> : <BusinessIcon />}
              label="Organizacional"
              iconPosition={isMobile ? 'top' : 'start'}
            />
            <Tab
              icon={isTabComplete(2) ? <CheckCircleIcon color="success" /> : <WorkIcon />}
              label="Laboral"
              iconPosition={isMobile ? 'top' : 'start'}
            />
            <Tab
              icon={isTabComplete(3) ? <CheckCircleIcon color="success" /> : <ContactPageIcon />}
              label="Personal"
              iconPosition={isMobile ? 'top' : 'start'}
            />
          </Tabs>

          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {/* Tab 0: Información Básica */}
            <TabPanel value={activeTab} index={0}>
              <BasicInfoForm
                data={formData}
                onChange={handleFormChange}
                errors={errors}
                userInfo={completionData?.user_info}
              />
            </TabPanel>

            {/* Tab 1: Información Organizacional */}
            <TabPanel value={activeTab} index={1}>
              <OrganizationalInfoForm
                data={formData}
                onChange={handleFormChange}
                errors={errors}
                areas={completionData?.areas || []}
                distributorCenters={completionData?.distributor_centers || []}
                hierarchyLevels={completionData?.hierarchy_levels || []}
                positionTypes={completionData?.position_types || []}
              />
            </TabPanel>

            {/* Tab 2: Información Laboral */}
            <TabPanel value={activeTab} index={2}>
              <EmploymentInfoForm
                data={formData}
                onChange={handleFormChange}
                errors={errors}
                contractTypes={completionData?.contract_types || []}
              />
            </TabPanel>

            {/* Tab 3: Información Personal */}
            <TabPanel value={activeTab} index={3}>
              <PersonalInfoForm
                data={formData}
                onChange={handleFormChange}
                errors={errors}
                genders={completionData?.genders || []}
              />
            </TabPanel>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <Grid container spacing={2} justifyContent="space-between">
          <Grid item xs={12} sm={6} md={4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleBack}
              disabled={activeTab === 0}
              size={isMobile ? 'medium' : 'large'}
            >
              Anterior
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {activeTab < 3 ? (
              <Button
                fullWidth
                variant="contained"
                onClick={handleNext}
                disabled={!isTabComplete(activeTab)}
                size={isMobile ? 'medium' : 'large'}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                fullWidth
                variant="contained"
                color="success"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                size={isMobile ? 'medium' : 'large'}
                startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
              >
                {submitting ? 'Guardando...' : 'Completar Perfil'}
              </Button>
            )}
          </Grid>
        </Grid>

        {/* Progress indicator */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Paso {activeTab + 1} de 4
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
