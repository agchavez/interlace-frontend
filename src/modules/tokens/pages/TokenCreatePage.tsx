/**
 * Página para crear un nuevo token - UI Mejorada con Cards
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  TextField,
  Autocomplete,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  createFilterOptions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BootstrapDialogTitle from '../../ui/components/BootstrapDialogTitle';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  AccessTime as PermitHourIcon,
  EventNote as PermitDayIcon,
  ExitToApp as ExitPassIcon,
  Checkroom as UniformIcon,
  SwapHoriz as SubstitutionIcon,
  TrendingUp as RateChangeIcon,
  MoreTime as OvertimeIcon,
  Schedule as ShiftChangeIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Person as PersonIcon,
  QrCode2 as QrCodeIcon,
} from '@mui/icons-material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useCreateTokenMutation } from '../services/tokenApi';
import {
  TokenType,
  TokenTypeLabels,
  TokenCreatePayload,
  PermitHourCreatePayload,
  PermitDayCreatePayload,
  ExitPassCreatePayload,
  UniformDeliveryCreatePayload,
  SubstitutionCreatePayload,
  RateChangeCreatePayload,
  OvertimeCreatePayload,
  ShiftChangeCreatePayload,
} from '../interfaces/token';
import {
  PermitHourForm,
  PermitDayForm,
  ExitPassForm,
  UniformDeliveryForm,
  SubstitutionForm,
  RateChangeForm,
  OvertimeForm,
  ShiftChangeForm,
} from '../components/forms';
import { useAppSelector } from '../../../store';
import { useGetEligibleForTokenQuery } from '../../personnel/services/personnelApi';
import { useGetExternalPersonsQuery, useCreateExternalPersonMutation } from '../services/tokenApi';
import type { ExternalPersonCreatePayload } from '../interfaces/token';
import type { PersonnelProfileList } from '../../../interfaces/personnel';
import type { ExternalPerson } from '../interfaces/token';
import BusinessIcon from '@mui/icons-material/Business';
import PersonOffIcon from '@mui/icons-material/PersonOff';

const steps = ['Tipo de Token', 'Beneficiario', 'Detalles', 'Confirmar'];

// Filter options for external person autocomplete (allows adding new)
interface ExternalPersonOption extends ExternalPerson {
  inputValue?: string;
  isNew?: boolean;
}

const filterExternalPersons = createFilterOptions<ExternalPersonOption>();

// Initial form data for new external person
const initialExternalPersonForm: ExternalPersonCreatePayload = {
  name: '',
  company: '',
  identification: '',
  phone: '',
  email: '',
  notes: '',
  is_active: true,
};

// Token type configuration with icons, colors, and descriptions
const tokenTypeConfig: Record<TokenType, {
  icon: React.ReactNode;
  color: string;
  description: string;
  shortDesc: string;
}> = {
  [TokenType.PERMIT_HOUR]: {
    icon: <PermitHourIcon sx={{ fontSize: 40 }} />,
    color: '#2196F3',
    description: 'Permiso para ausentarse por horas durante la jornada laboral.',
    shortDesc: 'Horas de permiso',
  },
  [TokenType.PERMIT_DAY]: {
    icon: <PermitDayIcon sx={{ fontSize: 40 }} />,
    color: '#3F51B5',
    description: 'Permiso para ausentarse uno o más días completos.',
    shortDesc: 'Días de permiso',
  },
  [TokenType.EXIT_PASS]: {
    icon: <ExitPassIcon sx={{ fontSize: 40 }} />,
    color: '#FF9800',
    description: 'Autorización para salir del establecimiento con materiales o productos.',
    shortDesc: 'Pase de salida',
  },
  [TokenType.UNIFORM_DELIVERY]: {
    icon: <UniformIcon sx={{ fontSize: 40 }} />,
    color: '#795548',
    description: 'Entrega de uniforme o equipo de trabajo.',
    shortDesc: 'Entrega uniforme',
  },
  [TokenType.SUBSTITUTION]: {
    icon: <SubstitutionIcon sx={{ fontSize: 40 }} />,
    color: '#9C27B0',
    description: 'Solicitud de sustitución temporal de personal.',
    shortDesc: 'Sustitución',
  },
  [TokenType.RATE_CHANGE]: {
    icon: <RateChangeIcon sx={{ fontSize: 40 }} />,
    color: '#4CAF50',
    description: 'Cambio temporal en la tasa de pago.',
    shortDesc: 'Cambio de tasa',
  },
  [TokenType.OVERTIME]: {
    icon: <OvertimeIcon sx={{ fontSize: 40 }} />,
    color: '#F44336',
    description: 'Autorización para trabajar horas extra.',
    shortDesc: 'Horas extra',
  },
  [TokenType.SHIFT_CHANGE]: {
    icon: <ShiftChangeIcon sx={{ fontSize: 40 }} />,
    color: '#00BCD4',
    description: 'Cambio de turno de trabajo.',
    shortDesc: 'Cambio turno',
  },
};

export const TokenCreatePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const user = useAppSelector((state) => state.auth.user);
  const { disctributionCenters } = useAppSelector((state) => state.maintenance);
  const [activeStep, setActiveStep] = useState(0);
  const [tokenType, setTokenType] = useState<TokenType | ''>('');
  const [createToken, { isLoading }] = useCreateTokenMutation();

  // State for external person (EXIT_PASS only)
  const [isExternalPerson, setIsExternalPerson] = useState(false);
  const [selectedExternalPerson, setSelectedExternalPerson] = useState<number | null>(null);

  // State for creating new external person
  const [openExternalPersonDialog, setOpenExternalPersonDialog] = useState(false);
  const [externalPersonForm, setExternalPersonForm] = useState<ExternalPersonCreatePayload>(initialExternalPersonForm);
  const [createExternalPerson, { isLoading: isCreatingExternalPerson }] = useCreateExternalPersonMutation();

  // Personnel list for selectors (filtered by requester's hierarchy and token type)
  const { data: eligiblePersonnel } = useGetEligibleForTokenQuery(
    { token_type: tokenType || undefined },
    { skip: !tokenType || (tokenType === TokenType.EXIT_PASS && isExternalPerson) }
  );
  const personnelList: PersonnelProfileList[] = useMemo(() => eligiblePersonnel || [], [eligiblePersonnel]);

  // External persons list (for EXIT_PASS with is_external=true)
  const { data: externalPersonsData, refetch: refetchExternalPersons } = useGetExternalPersonsQuery(
    { is_active: true, limit: 100 },
    { skip: tokenType !== TokenType.EXIT_PASS || !isExternalPerson }
  );
  const externalPersonsList: ExternalPersonOption[] = useMemo(
    () => (externalPersonsData?.results || []) as ExternalPersonOption[],
    [externalPersonsData]
  );

  // Base data
  const [baseData, setBaseData] = useState<{
    personnel: number | null;
    distributor_center: number | null;
    valid_from: string;
    valid_until: string;
    requester_notes: string;
  }>({
    personnel: null,
    distributor_center: user?.centro_distribucion || null,
    valid_from: dayjs().format('YYYY-MM-DDTHH:mm'),
    valid_until: dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'),
    requester_notes: '',
  });

  // Form data for each type
  const [permitHourData, setPermitHourData] = useState<PermitHourCreatePayload>({
    reason_type: '' as any,
    hours_requested: 1,
    exit_time: '',
    expected_return_time: '',
    with_pay: true,
  });

  const [permitDayData, setPermitDayData] = useState<PermitDayCreatePayload>({
    date_selection_type: '' as any,
    reason: '' as any,
    with_pay: true,
  });

  const [exitPassData, setExitPassData] = useState<ExitPassCreatePayload>({
    destination: '',
    purpose: '',
    items: [],
  });

  const [uniformDeliveryData, setUniformDeliveryData] = useState<UniformDeliveryCreatePayload>({
    items: [],
  });

  const [substitutionData, setSubstitutionData] = useState<SubstitutionCreatePayload>({
    substituted_personnel: 0,
    reason: '' as any,
    assumed_functions: '',
    start_date: '',
    end_date: '',
    additional_compensation: false,
  });

  const [rateChangeData, setRateChangeData] = useState<RateChangeCreatePayload>({
    reason: '' as any,
    current_rate: 0,
    new_rate: 0,
    start_date: '',
    end_date: '',
  });

  const [overtimeData, setOvertimeData] = useState<OvertimeCreatePayload>({
    overtime_type: '' as any,
    reason: '' as any,
    overtime_date: '',
    start_time: '',
    end_time: '',
  });

  const [shiftChangeData, setShiftChangeData] = useState<ShiftChangeCreatePayload>({
    reason: '' as any,
    current_shift_name: '',
    current_shift_start: '',
    current_shift_end: '',
    new_shift_name: '',
    new_shift_start: '',
    new_shift_end: '',
    change_date: '',
    is_permanent: false,
  });

  // Clear personnel selection when token type changes (eligible list may differ)
  const handleTokenTypeChange = (newType: TokenType) => {
    if (newType !== tokenType) {
      setTokenType(newType);
      setBaseData((prev) => ({ ...prev, personnel: null }));
      // Reset external person state when changing token type
      setIsExternalPerson(false);
      setSelectedExternalPerson(null);
    }
  };

  // Handle external person toggle (EXIT_PASS only)
  const handleExternalToggle = (isExternal: boolean) => {
    setIsExternalPerson(isExternal);
    if (isExternal) {
      setBaseData((prev) => ({ ...prev, personnel: null }));
    } else {
      setSelectedExternalPerson(null);
    }
  };

  // Handle opening dialog to create new external person
  const handleOpenExternalPersonDialog = (inputValue: string) => {
    setExternalPersonForm({ ...initialExternalPersonForm, name: inputValue });
    setOpenExternalPersonDialog(true);
  };

  // Handle creating new external person
  const handleCreateExternalPerson = async () => {
    if (!externalPersonForm.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    try {
      const newPerson = await createExternalPerson(externalPersonForm).unwrap();
      toast.success('Persona externa creada exitosamente');
      setOpenExternalPersonDialog(false);
      setExternalPersonForm(initialExternalPersonForm);
      // Refresh list and select the new person
      await refetchExternalPersons();
      setSelectedExternalPerson(newPerson.id);
    } catch (error: unknown) {
      const err = error as { data?: { detail?: string } };
      toast.error(err?.data?.detail || 'Error al crear persona externa');
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !tokenType) {
      toast.error('Seleccione un tipo de token');
      return;
    }
    if (activeStep === 1) {
      // For EXIT_PASS with external person, validate external_person instead of personnel
      if (tokenType === TokenType.EXIT_PASS && isExternalPerson) {
        if (!selectedExternalPerson) {
          toast.error('Seleccione una persona externa');
          return;
        }
      } else {
        if (!baseData.personnel) {
          toast.error('Seleccione un beneficiario');
          return;
        }
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!tokenType || !baseData.distributor_center) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    // For EXIT_PASS with external person, personnel is not required
    const isExternalExitPass = tokenType === TokenType.EXIT_PASS && isExternalPerson;
    if (!isExternalExitPass && !baseData.personnel) {
      toast.error('Seleccione un beneficiario');
      return;
    }
    if (isExternalExitPass && !selectedExternalPerson) {
      toast.error('Seleccione una persona externa');
      return;
    }

    const payload: TokenCreatePayload = {
      token_type: tokenType,
      distributor_center: baseData.distributor_center,
      valid_from: baseData.valid_from,
      valid_until: baseData.valid_until,
      requester_notes: baseData.requester_notes,
    };

    // Add personnel only if not external EXIT_PASS
    if (!isExternalExitPass) {
      payload.personnel = baseData.personnel!;
    }

    // Add type-specific data
    switch (tokenType) {
      case TokenType.PERMIT_HOUR:
        payload.permit_hour_detail = permitHourData;
        break;
      case TokenType.PERMIT_DAY:
        payload.permit_day_detail = permitDayData;
        break;
      case TokenType.EXIT_PASS:
        payload.exit_pass_detail = {
          ...exitPassData,
          is_external: isExternalPerson,
          external_person: isExternalPerson ? selectedExternalPerson! : undefined,
        };
        break;
      case TokenType.UNIFORM_DELIVERY:
        payload.uniform_delivery_detail = uniformDeliveryData;
        break;
      case TokenType.SUBSTITUTION:
        payload.substitution_detail = substitutionData;
        break;
      case TokenType.RATE_CHANGE:
        payload.rate_change_detail = rateChangeData;
        break;
      case TokenType.OVERTIME:
        payload.overtime_detail = overtimeData;
        break;
      case TokenType.SHIFT_CHANGE:
        payload.shift_change_detail = shiftChangeData;
        break;
    }

    try {
      const result = await createToken(payload).unwrap();
      toast.success('Token creado exitosamente');
      navigate(`/tokens/detail/${result.id}`);
    } catch (error: unknown) {
      const err = error as { data?: { detail?: string } };
      toast.error(err?.data?.detail || 'Error al crear el token');
    }
  };

  const renderTypeSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={500} sx={{ mb: 3 }}>
        Seleccione el tipo de token que desea crear
      </Typography>

      <Grid container spacing={2}>
        {Object.entries(TokenTypeLabels).map(([value, label]) => {
          const config = tokenTypeConfig[value as TokenType];
          const isSelected = tokenType === value;

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={value}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  transition: 'all 0.2s ease-in-out',
                  border: isSelected ? `2px solid ${config.color}` : undefined,
                  bgcolor: isSelected ? alpha(config.color, 0.05) : undefined,
                  '&:hover': {
                    borderColor: config.color,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha(config.color, 0.25)}`,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleTokenTypeChange(value as TokenType)}
                  sx={{ height: '100%', p: 2 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(config.color, 0.1),
                        color: config.color,
                      }}
                    >
                      {config.icon}
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        sx={{ color: isSelected ? config.color : 'text.primary' }}
                      >
                        {label}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {config.description}
                      </Typography>
                    </Box>
                    {isSelected && (
                      <Chip
                        label="Seleccionado"
                        size="small"
                        sx={{
                          bgcolor: config.color,
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  const renderBeneficiarySelection = () => (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="h6" gutterBottom fontWeight={500} sx={{ mb: 3 }}>
          Información del Beneficiario
        </Typography>

        <Grid container spacing={3}>
          {/* Selected Token Type Summary */}
          {tokenType && (
            <Grid item xs={12}>
              <Card
                variant="outlined"
                sx={{
                  bgcolor: alpha(tokenTypeConfig[tokenType].color, 0.05),
                  borderColor: tokenTypeConfig[tokenType].color,
                }}
              >
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        bgcolor: alpha(tokenTypeConfig[tokenType].color, 0.1),
                        color: tokenTypeConfig[tokenType].color,
                      }}
                    >
                      {tokenTypeConfig[tokenType].icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tipo de Token Seleccionado
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {TokenTypeLabels[tokenType]}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* External Person Toggle (EXIT_PASS only) */}
          {tokenType === TokenType.EXIT_PASS && (
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isExternalPerson}
                    onChange={(e) => handleExternalToggle(e.target.checked)}
                    color="warning"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonOffIcon color={isExternalPerson ? 'warning' : 'disabled'} />
                    <Typography>Pase para persona externa (Proveedor/Visitante)</Typography>
                  </Box>
                }
              />
              {isExternalPerson && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Este pase es para una persona externa al centro de distribución (proveedor, visitante, etc.).
                </Alert>
              )}
            </Grid>
          )}

          {/* Personnel Selector (when not external) */}
          {!isExternalPerson && (
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={personnelList}
                getOptionLabel={(option) =>
                  `${option.full_name} - ${option.employee_code}`
                }
                value={personnelList.find((p: PersonnelProfileList) => p.id === baseData.personnel) || null}
                onChange={(_, newValue) =>
                  setBaseData({ ...baseData, personnel: newValue?.id || null })
                }
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ display: 'flex', gap: 2, py: 1 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                      }}
                    >
                      {option.full_name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {option.full_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.employee_code} - {option.position}
                      </Typography>
                    </Box>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Beneficiario"
                    required
                    placeholder="Buscar personal..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <PersonIcon sx={{ color: 'action.active', mr: 1 }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          )}

          {/* External Person Selector (EXIT_PASS with is_external=true) */}
          {isExternalPerson && (
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={externalPersonsList}
                getOptionLabel={(option: ExternalPersonOption) => {
                  if (option.inputValue) return option.inputValue;
                  return `${option.name}${option.company ? ` - ${option.company}` : ''}`;
                }}
                value={externalPersonsList.find((p) => p.id === selectedExternalPerson) || null}
                onChange={(_, newValue) => {
                  if (newValue?.isNew && newValue.inputValue) {
                    handleOpenExternalPersonDialog(newValue.inputValue);
                  } else {
                    setSelectedExternalPerson(newValue?.id || null);
                  }
                }}
                filterOptions={(options, params) => {
                  const filtered = filterExternalPersons(options, params);
                  const { inputValue } = params;
                  // Add option to create new person if input doesn't match any existing
                  const isExisting = options.some((opt) =>
                    opt.name.toLowerCase().includes(inputValue.toLowerCase())
                  );
                  if (inputValue !== '' && !isExisting) {
                    filtered.push({
                      inputValue,
                      isNew: true,
                      name: `Agregar "${inputValue}"`,
                      id: -1,
                      company: '',
                      identification: '',
                      phone: '',
                      email: '',
                      notes: '',
                      is_active: true,
                      created_at: '',
                      updated_at: '',
                    });
                  }
                  return filtered;
                }}
                renderOption={(props, option: ExternalPersonOption) => (
                  <Box component="li" {...props} sx={{ display: 'flex', gap: 2, py: 1 }}>
                    {option.isNew ? (
                      <>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: 'success.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                          }}
                        >
                          <AddIcon />
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={500} color="success.main">
                            {option.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Registrar nueva persona externa
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: 'warning.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                          }}
                        >
                          <PersonOffIcon />
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {option.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.company || 'Sin empresa'} {option.identification && `- ${option.identification}`}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Persona Externa"
                    required
                    placeholder="Buscar o escriba para agregar..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <PersonOffIcon sx={{ color: 'warning.main', mr: 1 }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" required>
              <InputLabel id="distributor-center-label">Centro de Distribución</InputLabel>
              <Select
                labelId="distributor-center-label"
                id="distributor-center"
                value={baseData.distributor_center || ''}
                label="Centro de Distribución"
                onChange={(e) =>
                  setBaseData({ ...baseData, distributor_center: e.target.value as number })
                }
                startAdornment={<BusinessIcon sx={{ color: 'action.active', mr: 1 }} />}
              >
                {disctributionCenters.map((center) => (
                  <MenuItem key={center.id} value={center.id}>
                    {center.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="Válido Desde"
              value={dayjs(baseData.valid_from)}
              onChange={(date) =>
                setBaseData({ ...baseData, valid_from: date?.format('YYYY-MM-DDTHH:mm') || '' })
              }
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="Válido Hasta"
              value={dayjs(baseData.valid_until)}
              onChange={(date) =>
                setBaseData({ ...baseData, valid_until: date?.format('YYYY-MM-DDTHH:mm') || '' })
              }
              minDateTime={dayjs(baseData.valid_from)}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Notas del Solicitante (opcional)"
              multiline
              rows={2}
              value={baseData.requester_notes}
              onChange={(e) => setBaseData({ ...baseData, requester_notes: e.target.value })}
              placeholder="Información adicional sobre la solicitud..."
            />
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );

  const renderForm = () => {
    switch (tokenType) {
      case TokenType.PERMIT_HOUR:
        return <PermitHourForm value={permitHourData} onChange={setPermitHourData} />;
      case TokenType.PERMIT_DAY:
        return <PermitDayForm value={permitDayData} onChange={setPermitDayData} />;
      case TokenType.EXIT_PASS:
        return <ExitPassForm value={exitPassData} onChange={setExitPassData} />;
      case TokenType.UNIFORM_DELIVERY:
        return <UniformDeliveryForm value={uniformDeliveryData} onChange={setUniformDeliveryData} />;
      case TokenType.SUBSTITUTION:
        return (
          <SubstitutionForm
            value={substitutionData}
            onChange={setSubstitutionData}
            personnelList={personnelList}
          />
        );
      case TokenType.RATE_CHANGE:
        return <RateChangeForm value={rateChangeData} onChange={setRateChangeData} />;
      case TokenType.OVERTIME:
        return <OvertimeForm value={overtimeData} onChange={setOvertimeData} />;
      case TokenType.SHIFT_CHANGE:
        return (
          <ShiftChangeForm
            value={shiftChangeData}
            onChange={setShiftChangeData}
            personnelList={personnelList}
          />
        );
      default:
        return (
          <Alert severity="warning">
            Tipo de token no implementado aún: {TokenTypeLabels[tokenType as TokenType]}
          </Alert>
        );
    }
  };

  const selectedPersonnel = personnelList.find((p: PersonnelProfileList) => p.id === baseData.personnel);

  const renderConfirmation = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={500} sx={{ mb: 3 }}>
        Confirmar creación de token
      </Typography>

      <Grid container spacing={3}>
        {/* Token Type Card */}
        {tokenType && (
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(tokenTypeConfig[tokenType].color, 0.1),
                      color: tokenTypeConfig[tokenType].color,
                    }}
                  >
                    {tokenTypeConfig[tokenType].icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Tipo de Token
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {TokenTypeLabels[tokenType]}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Beneficiary / External Person Card */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {isExternalPerson ? (
                  <>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: 'warning.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      <PersonOffIcon />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Persona Externa
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {externalPersonsList.find(p => p.id === selectedExternalPerson)?.name || '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {externalPersonsList.find(p => p.id === selectedExternalPerson)?.company || 'Sin empresa'}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    >
                      {selectedPersonnel?.full_name
                        .split(' ')
                        .slice(0, 2)
                        .map(n => n[0])
                        .join('')
                        .toUpperCase() || '?'}
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Beneficiario
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {selectedPersonnel?.full_name || '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedPersonnel?.employee_code}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Validity Period */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Válido Desde
              </Typography>
              <Typography variant="h6" fontWeight={500}>
                {dayjs(baseData.valid_from).format('DD/MM/YYYY HH:mm')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Válido Hasta
              </Typography>
              <Typography variant="h6" fontWeight={500}>
                {dayjs(baseData.valid_until).format('DD/MM/YYYY HH:mm')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Info Alert */}
        <Grid item xs={12}>
          <Alert
            severity="info"
            icon={<QrCodeIcon />}
            sx={{ borderRadius: 2 }}
          >
            <Typography variant="body2">
              Al confirmar, el token será creado y se generará un código QR único.
              El token será enviado para aprobación según el flujo establecido.
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              startIcon={<BackIcon />}
              onClick={() => navigate('/tokens')}
              color="inherit"
            >
              Volver
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            fontWeight={400}
            gutterBottom
          >
            Nuevo Token
          </Typography>
          <Divider />
        </Grid>

        {/* Stepper */}
        <Grid item xs={12}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel={!isMobile}
            orientation={isMobile ? 'vertical' : 'horizontal'}
            sx={{ mb: 2 }}
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      '&.Mui-active': {
                        color: tokenType
                          ? tokenTypeConfig[tokenType]?.color
                          : 'primary.main',
                      },
                      '&.Mui-completed': {
                        color: tokenType
                          ? tokenTypeConfig[tokenType]?.color
                          : 'primary.main',
                      },
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Grid>

        {/* Content */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
            {activeStep === 0 && renderTypeSelection()}
            {activeStep === 1 && renderBeneficiarySelection()}
            {activeStep === 2 && renderForm()}
            {activeStep === 3 && renderConfirmation()}
          </Card>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between">
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<PrevIcon />}
              size={isMobile ? 'medium' : 'large'}
            >
              Anterior
            </Button>
            <Box>
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<NextIcon />}
                  size={isMobile ? 'medium' : 'large'}
                  disabled={
                    (activeStep === 0 && !tokenType) ||
                    (activeStep === 1 && !isExternalPerson && !baseData.personnel) ||
                    (activeStep === 1 && isExternalPerson && !selectedExternalPerson)
                  }
                  sx={{
                    bgcolor: tokenType
                      ? tokenTypeConfig[tokenType]?.color
                      : 'primary.main',
                    '&:hover': {
                      bgcolor: tokenType
                        ? alpha(tokenTypeConfig[tokenType]?.color, 0.85)
                        : 'primary.dark',
                    },
                  }}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  disabled={isLoading}
                  size={isMobile ? 'medium' : 'large'}
                >
                  {isLoading ? 'Creando...' : 'Crear Token'}
                </Button>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Dialog for creating new external person */}
      <Dialog
        open={openExternalPersonDialog}
        onClose={() => setOpenExternalPersonDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <BootstrapDialogTitle
          id="create-external-person-dialog"
          onClose={() => setOpenExternalPersonDialog(false)}
        >
          <Typography variant="subtitle1" fontWeight={600} color="white">
            Nueva Persona Externa
          </Typography>
        </BootstrapDialogTitle>
        <DialogContent sx={{ pt: 4, pb: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Complete los datos de la persona externa (proveedor, visitante, contratista, etc.)
            </Alert>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Nombre Completo"
                required
                value={externalPersonForm.name}
                onChange={(e) =>
                  setExternalPersonForm({ ...externalPersonForm, name: e.target.value })
                }
                InputProps={{
                  startAdornment: <PersonIcon sx={{ color: 'action.active', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Empresa / Organizacion"
                value={externalPersonForm.company}
                onChange={(e) =>
                  setExternalPersonForm({ ...externalPersonForm, company: e.target.value })
                }
                InputProps={{
                  startAdornment: <BusinessIcon sx={{ color: 'action.active', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Identificacion (ID/RTN/DNI)"
                value={externalPersonForm.identification}
                onChange={(e) =>
                  setExternalPersonForm({ ...externalPersonForm, identification: e.target.value })
                }
                InputProps={{
                  startAdornment: <QrCodeIcon sx={{ color: 'action.active', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Telefono"
                value={externalPersonForm.phone}
                onChange={(e) =>
                  setExternalPersonForm({ ...externalPersonForm, phone: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <Box component="span" sx={{ color: 'action.active', mr: 1, display: 'flex' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                    </Box>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Correo Electronico"
                type="email"
                value={externalPersonForm.email}
                onChange={(e) =>
                  setExternalPersonForm({ ...externalPersonForm, email: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <Box component="span" sx={{ color: 'action.active', mr: 1, display: 'flex' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </Box>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Notas / Observaciones"
                multiline
                rows={3}
                value={externalPersonForm.notes}
                onChange={(e) =>
                  setExternalPersonForm({ ...externalPersonForm, notes: e.target.value })
                }
                placeholder="Informacion adicional sobre esta persona..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setOpenExternalPersonDialog(false)}
            color="inherit"
            size="small"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateExternalPerson}
            variant="contained"
            color="warning"
            size="small"
            disabled={isCreatingExternalPerson}
            startIcon={isCreatingExternalPerson ? <CircularProgress size={16} /> : <AddIcon />}
          >
            Registrar Persona
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
