import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Autocomplete,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Stack,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Checkbox,
    FormControlLabel,
    Divider,
    Paper,
    CircularProgress,
    Alert,
    Snackbar,
    Avatar,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Security as SecurityIcon,
    Engineering as EngineeringIcon,
    LocalShipping as LocalShippingIcon,
    PlayArrow as PlayArrowIcon,
    AddCircleOutline as AddCircleOutlineIcon,
    Delete as DeleteIcon,
    HourglassEmpty as PendingIcon,
    Assignment as TotalIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';
import PautaStatusBadge from '../components/PautaStatusBadge';
import {
    useGetPautasQuery,
    useGetPautaQuery,
    useCheckoutSecurityMutation,
    useCheckoutOpsMutation,
    useDispatchPautaMutation,
    useStartAuditMutation,
    useCreateInconsistencyMutation,
} from '../services/truckCycleApi';
import { useGetPersonnelProfilesQuery } from '../../../modules/personnel/services/personnelApi';
import type { PautaStatus, PautaListItem, Inconsistency } from '../interfaces/truckCycle';
import type { PersonnelProfileList } from '../../../interfaces/personnel';

const CHECKOUT_STATUSES = 'COUNTED,PENDING_CHECKOUT,CHECKOUT_SECURITY,CHECKOUT_OPS';

type ValidationFlow = 'security' | 'ops';

interface InconsistencyRow {
    inconsistency_type: Inconsistency['inconsistency_type'];
    material_code: string;
    product_name: string;
    expected_quantity: number | '';
    actual_quantity: number | '';
    notes: string;
}

const EMPTY_INCONSISTENCY: InconsistencyRow = {
    inconsistency_type: 'FALTANTE',
    material_code: '',
    product_name: '',
    expected_quantity: '',
    actual_quantity: '',
    notes: '',
};

const INCONSISTENCY_TYPE_OPTIONS: { value: Inconsistency['inconsistency_type']; label: string }[] = [
    { value: 'FALTANTE', label: 'Faltante' },
    { value: 'SOBRANTE', label: 'Sobrante' },
    { value: 'CRUCE', label: 'Cruce' },
    { value: 'DANADO', label: 'Dañado' },
];

// ---- Stat Card ----
interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <Card
        elevation={3}
        sx={{
            height: '100%',
            transition: 'all 0.3s ease-in-out',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
        }}
    >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, fontWeight: 600 }}>
                        {title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color, fontSize: { xs: '1.5rem', sm: '2.125rem' }, mt: 0.5 }}>
                        {value}
                    </Typography>
                </Box>
                <Avatar sx={{ bgcolor: color, opacity: 0.9, width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}>
                    {icon}
                </Avatar>
            </Box>
        </CardContent>
    </Card>
);

export default function CheckoutPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });

    // Menu state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedRow, setSelectedRow] = useState<PautaListItem | null>(null);

    // Queries
    const { data, isLoading, isFetching, error } = useGetPautasQuery({
        status: CHECKOUT_STATUSES,
        limit: paginationModel.pageSize,
        offset: paginationModel.page * paginationModel.pageSize,
    });

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogFlow, setDialogFlow] = useState<ValidationFlow>('security');
    const [dialogPauta, setDialogPauta] = useState<PautaListItem | null>(null);
    const [validatorId, setValidatorId] = useState<number | ''>('');
    const [selectedValidator, setSelectedValidator] = useState<PersonnelProfileList | null>(null);
    const [validatorSearch, setValidatorSearch] = useState('');
    const [exitPassConsumables, setExitPassConsumables] = useState(false);
    const [inconsistencies, setInconsistencies] = useState<InconsistencyRow[]>([]);

    const { data: personnelData, isLoading: loadingPersonnel } = useGetPersonnelProfilesQuery({
        search: validatorSearch || undefined,
        is_active: true,
        limit: 50,
    }, { skip: !dialogOpen });

    // Load pauta products for inconsistency autocomplete
    const { data: dialogPautaDetail } = useGetPautaQuery(dialogPauta?.id ?? 0, { skip: !dialogOpen || !dialogPauta });
    const pautaProducts = dialogPautaDetail?.product_details ?? [];

    // Mutations
    const [checkoutSecurity, { isLoading: isSecurityLoading }] = useCheckoutSecurityMutation();
    const [checkoutOps, { isLoading: isOpsLoading }] = useCheckoutOpsMutation();
    const [dispatchPauta, { isLoading: isDispatchLoading }] = useDispatchPautaMutation();
    const [startAudit, { isLoading: isAuditLoading }] = useStartAuditMutation();
    const [createInconsistency] = useCreateInconsistencyMutation();

    // Snackbar
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success',
    });

    // Menu handlers
    const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLElement>, row: PautaListItem) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedRow(row);
    }, []);

    const handleCloseMenu = useCallback(() => {
        setAnchorEl(null);
        setSelectedRow(null);
    }, []);

    // Checkout dialog
    const openDialog = useCallback((pauta: PautaListItem, flow: ValidationFlow) => {
        setDialogPauta(pauta);
        setDialogFlow(flow);
        setValidatorId('');
        setSelectedValidator(null);
        setValidatorSearch('');
        setExitPassConsumables(false);
        setInconsistencies([]);
        setDialogOpen(true);
        handleCloseMenu();
    }, [handleCloseMenu]);

    const closeDialog = useCallback(() => {
        setDialogOpen(false);
        setDialogPauta(null);
    }, []);

    const addInconsistencyRow = useCallback(() => {
        setInconsistencies((prev) => [...prev, { ...EMPTY_INCONSISTENCY }]);
    }, []);

    const removeInconsistencyRow = useCallback((index: number) => {
        setInconsistencies((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const updateInconsistencyRow = useCallback(
        (index: number, field: keyof InconsistencyRow, value: string | number) => {
            setInconsistencies((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
        }, [],
    );

    const handleConfirmValidation = async () => {
        if (!dialogPauta || validatorId === '') return;
        try {
            for (const inc of inconsistencies) {
                if (inc.material_code && inc.expected_quantity !== '' && inc.actual_quantity !== '') {
                    await createInconsistency({
                        pauta: dialogPauta.id,
                        phase: 'CHECKOUT',
                        inconsistency_type: inc.inconsistency_type,
                        material_code: inc.material_code,
                        product_name: inc.product_name,
                        expected_quantity: Number(inc.expected_quantity),
                        actual_quantity: Number(inc.actual_quantity),
                        notes: inc.notes,
                    }).unwrap();
                }
            }
            if (dialogFlow === 'security') {
                await checkoutSecurity({ id: dialogPauta.id, validator_id: validatorId as number }).unwrap();
            } else {
                await checkoutOps({ id: dialogPauta.id, validator_id: validatorId as number }).unwrap();
            }
            setSnackbar({ open: true, message: `Checkout de ${dialogFlow === 'security' ? 'seguridad' : 'operaciones'} registrado.`, severity: 'success' });
            closeDialog();
        } catch (err: any) {
            setSnackbar({ open: true, message: err?.data?.detail || err?.data?.error || 'Error al registrar el checkout.', severity: 'error' });
        }
    };

    const handleDispatch = async (pautaId: number) => {
        handleCloseMenu();
        try {
            await dispatchPauta(pautaId).unwrap();
            setSnackbar({ open: true, message: 'Pauta despachada correctamente.', severity: 'success' });
        } catch (err: any) {
            setSnackbar({ open: true, message: err?.data?.detail || err?.data?.error || 'Error al despachar.', severity: 'error' });
        }
    };

    const handleStartAudit = async (pautaId: number) => {
        handleCloseMenu();
        try {
            await startAudit(pautaId).unwrap();
            setSnackbar({ open: true, message: 'Auditoría iniciada.', severity: 'success' });
        } catch (err: any) {
            setSnackbar({ open: true, message: err?.data?.detail || err?.data?.error || 'Error al iniciar auditoría.', severity: 'error' });
        }
    };

    // Helpers
    const getSecurityValidated = (pauta: PautaListItem) => ['CHECKOUT_SECURITY', 'CHECKOUT_OPS'].includes(pauta.status);
    const getOpsValidated = (pauta: PautaListItem) => pauta.status === 'CHECKOUT_OPS';

    // Stats
    const stats = useMemo(() => {
        if (!data?.results) return { pendientes: 0, enCheckout: 0, total: 0 };
        return {
            pendientes: data.results.filter((p) => ['COUNTED', 'PENDING_CHECKOUT'].includes(p.status)).length,
            enCheckout: data.results.filter((p) => ['CHECKOUT_SECURITY', 'CHECKOUT_OPS'].includes(p.status)).length,
            total: data.count,
        };
    }, [data]);

    // Action button for each row
    const renderActionButton = (row: PautaListItem) => {
        if (['COUNTED', 'PENDING_CHECKOUT'].includes(row.status)) {
            return (
                <Tooltip title="Checkout Seguridad">
                    <Button size="small" variant="outlined" color="primary"
                        startIcon={!isMobile ? <SecurityIcon /> : undefined}
                        onClick={(e) => { e.stopPropagation(); openDialog(row, 'security'); }}
                        sx={{ minWidth: isMobile ? 36 : undefined, px: isMobile ? 1 : undefined }}
                    >
                        {isMobile ? <SecurityIcon fontSize="small" /> : 'Seguridad'}
                    </Button>
                </Tooltip>
            );
        }
        if (row.status === 'CHECKOUT_SECURITY') {
            return (
                <Tooltip title="Checkout Operaciones">
                    <Button size="small" variant="contained" color="secondary"
                        startIcon={!isMobile ? <EngineeringIcon /> : undefined}
                        onClick={(e) => { e.stopPropagation(); openDialog(row, 'ops'); }}
                        sx={{ minWidth: isMobile ? 36 : undefined, px: isMobile ? 1 : undefined }}
                    >
                        {isMobile ? <EngineeringIcon fontSize="small" /> : 'Operaciones'}
                    </Button>
                </Tooltip>
            );
        }
        if (row.status === 'CHECKOUT_OPS') {
            return (
                <Tooltip title="Despachar">
                    <Button size="small" variant="contained" color="success"
                        startIcon={!isMobile ? <LocalShippingIcon /> : undefined}
                        onClick={(e) => { e.stopPropagation(); handleDispatch(row.id); }}
                        disabled={isDispatchLoading}
                        sx={{ minWidth: isMobile ? 36 : undefined, px: isMobile ? 1 : undefined }}
                    >
                        {isMobile ? <LocalShippingIcon fontSize="small" /> : 'Despachar'}
                    </Button>
                </Tooltip>
            );
        }
        return null;
    };

    // Columns
    const columns: GridColDef[] = useMemo(() => {
        const cols: GridColDef[] = [];

        if (isMobile) {
            cols.push({
                field: 'info',
                headerName: 'Pauta',
                flex: 1,
                minWidth: 200,
                sortable: false,
                renderCell: (params: GridRenderCellParams) => (
                    <Box sx={{ py: 0.5 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                            T-{params.row.transport_number} / V-{params.row.trip_number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {params.row.truck_code || '?'} - {params.row.truck_plate}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                            <PautaStatusBadge status={params.row.status as PautaStatus} />
                        </Box>
                    </Box>
                ),
            });
        } else {
            cols.push(
                { field: 'transport_number', headerName: 'Transporte', width: 110 },
                { field: 'trip_number', headerName: 'Viaje', width: 80 },
                {
                    field: 'truck_code', headerName: 'Camión', flex: 1, minWidth: 150,
                    renderCell: (params: GridRenderCellParams) => (
                        <Typography variant="body2" noWrap>{params.row.truck_code || '?'} - {params.row.truck_plate}</Typography>
                    ),
                },
                { field: 'total_boxes', headerName: 'Cajas', width: 80, align: 'right', headerAlign: 'right' },
                {
                    field: 'status', headerName: 'Estado', width: 160,
                    renderCell: (params: GridRenderCellParams) => <PautaStatusBadge status={params.value as PautaStatus} />,
                },
                {
                    field: 'security', headerName: 'Seg.', width: 60, align: 'center', headerAlign: 'center', sortable: false,
                    renderCell: (params: GridRenderCellParams) => getSecurityValidated(params.row)
                        ? <CheckCircleIcon color="success" fontSize="small" />
                        : <CancelIcon color="disabled" fontSize="small" />,
                },
                {
                    field: 'operations', headerName: 'Ops.', width: 60, align: 'center', headerAlign: 'center', sortable: false,
                    renderCell: (params: GridRenderCellParams) => getOpsValidated(params.row)
                        ? <CheckCircleIcon color="success" fontSize="small" />
                        : <CancelIcon color="disabled" fontSize="small" />,
                },
            );
        }

        // Action button column
        cols.push({
            field: 'actionBtn', headerName: 'Acción', width: isMobile ? 60 : 150, sortable: false, align: 'center', headerAlign: 'center',
            renderCell: (params: GridRenderCellParams) => renderActionButton(params.row),
        });

        // View detail
        cols.push({
            field: 'view', headerName: '', width: 50, sortable: false, align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Tooltip title="Ver Detalle">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/truck-cycle/pautas/${params.row.id}`); }}>
                        <ViewIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            ),
        });

        return cols;
    }, [isMobile, handleOpenMenu, isDispatchLoading, navigate]);

    if (error) {
        return (
            <Container maxWidth="xl" sx={{ mt: 2 }}>
                <Alert severity="error">Error al cargar las pautas para checkout.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 2 }}>
            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={600} sx={{ mb: 1 }}>
                Checkout - Doble Validación
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Validación de seguridad y operaciones antes del despacho
            </Typography>

            {/* Stat Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={4}>
                    <StatCard title="Pendientes" value={stats.pendientes} icon={<PendingIcon />} color="#F9A825" />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <StatCard title="En Checkout" value={stats.enCheckout} icon={<SecurityIcon />} color={theme.palette.info.main} />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatCard title="Total" value={stats.total} icon={<TotalIcon />} color={theme.palette.primary.main} />
                </Grid>
            </Grid>

            {/* DataGrid */}
            <Card variant="outlined">
                <DataGrid
                    rows={data?.results || []}
                    columns={columns}
                    rowCount={data?.count || 0}
                    loading={isLoading || isFetching}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    paginationMode="server"
                    pageSizeOptions={[10, 25, 50]}
                    disableRowSelectionOnClick
                    autoHeight
                    rowHeight={isMobile ? 80 : 52}
                    sx={{
                        border: 0,
                        '& .MuiDataGrid-cell': { fontSize: isMobile ? '0.8125rem' : '0.875rem', py: isMobile ? 1.5 : 1 },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                            fontWeight: 600,
                        },
                    }}
                    slots={{
                        noRowsOverlay: () => (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <Typography variant="body2" color="text.secondary">No hay pautas pendientes de checkout.</Typography>
                            </Box>
                        ),
                        loadingOverlay: () => (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <CircularProgress />
                            </Box>
                        ),
                    }}
                />
            </Card>

            {/* Validation Dialog - Redesigned */}
            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
                {/* Colored header */}
                <Box sx={{
                    bgcolor: dialogFlow === 'security' ? 'primary.main' : 'secondary.main',
                    color: 'white',
                    px: 3,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                }}>
                    {dialogFlow === 'security' ? <SecurityIcon /> : <EngineeringIcon />}
                    <Typography variant="h6" fontWeight={600}>
                        {dialogFlow === 'security' ? 'Checkout de Seguridad' : 'Checkout de Operaciones'}
                    </Typography>
                </Box>

                <DialogContent sx={{ p: 3 }}>
                    {dialogPauta && (
                        <Box>
                            {/* Pauta info card */}
                            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="caption" color="text.secondary">Transporte</Typography>
                                        <Typography variant="body2" fontWeight={600}>{dialogPauta.transport_number}</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="caption" color="text.secondary">Viaje</Typography>
                                        <Typography variant="body2" fontWeight={600}>{dialogPauta.trip_number}</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="caption" color="text.secondary">Camión</Typography>
                                        <Typography variant="body2" fontWeight={600}>{dialogPauta.truck_code || '?'} - {dialogPauta.truck_plate}</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="caption" color="text.secondary">Cajas</Typography>
                                        <Typography variant="body2" fontWeight={600}>{dialogPauta.total_boxes}</Typography>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Validator Autocomplete */}
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                {dialogFlow === 'security' ? 'Validador de Seguridad' : 'Validador de Operaciones'}
                            </Typography>
                            <Autocomplete
                                options={personnelData?.results || []}
                                getOptionLabel={(option) => `${option.employee_code} - ${option.full_name}`}
                                value={selectedValidator}
                                onChange={(_, newValue) => {
                                    setSelectedValidator(newValue);
                                    setValidatorId(newValue?.id ?? '');
                                }}
                                onInputChange={(_, newInput) => setValidatorSearch(newInput)}
                                loading={loadingPersonnel}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Buscar por nombre o código..."
                                        size="small"
                                        fullWidth
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loadingPersonnel ? <CircularProgress size={18} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props} key={option.id}>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>{option.full_name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {option.employee_code} - {option.position}
                                            </Typography>
                                        </Box>
                                    </li>
                                )}
                                noOptionsText="Sin resultados"
                                loadingText="Cargando..."
                                sx={{ mb: 2 }}
                            />

                            {/* Exit pass consumables */}
                            <FormControlLabel
                                control={<Checkbox checked={exitPassConsumables} onChange={(e) => setExitPassConsumables(e.target.checked)} />}
                                label="Pase de salida de consumibles verificado"
                                sx={{ mb: 2, display: 'block' }}
                            />

                            <Divider sx={{ my: 2 }} />

                            {/* Inconsistencies section */}
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Inconsistencias (opcional)
                                </Typography>
                                <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={addInconsistencyRow}>
                                    Agregar
                                </Button>
                            </Stack>

                            {inconsistencies.length === 0 && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Sin inconsistencias registradas.
                                </Typography>
                            )}

                            {inconsistencies.map((inc, idx) => (
                                <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                                    <Grid container spacing={1.5} alignItems="center">
                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                select
                                                size="small"
                                                label="Tipo"
                                                value={inc.inconsistency_type}
                                                onChange={(e) => updateInconsistencyRow(idx, 'inconsistency_type', e.target.value)}
                                                fullWidth
                                            >
                                                {INCONSISTENCY_TYPE_OPTIONS.map((opt) => (
                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12} sm={5}>
                                            <Autocomplete
                                                size="small"
                                                options={pautaProducts}
                                                getOptionLabel={(opt) => `${opt.material_code} - ${opt.product_name}`}
                                                onChange={(_e, val) => {
                                                    if (val) {
                                                        updateInconsistencyRow(idx, 'material_code', val.material_code);
                                                        updateInconsistencyRow(idx, 'product_name', val.product_name);
                                                        updateInconsistencyRow(idx, 'expected_quantity', String(val.total_boxes));
                                                    }
                                                }}
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Producto" placeholder="Buscar..." />
                                                )}
                                                noOptionsText="Sin productos"
                                            />
                                        </Grid>
                                        <Grid item xs={4} sm={1.5}>
                                            <TextField
                                                size="small"
                                                type="number"
                                                label="Esperado"
                                                value={inc.expected_quantity}
                                                onChange={(e) => updateInconsistencyRow(idx, 'expected_quantity', e.target.value === '' ? '' : Number(e.target.value))}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={4} sm={1.5}>
                                            <TextField
                                                size="small"
                                                type="number"
                                                label="Real"
                                                value={inc.actual_quantity}
                                                onChange={(e) => updateInconsistencyRow(idx, 'actual_quantity', e.target.value === '' ? '' : Number(e.target.value))}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={4} sm={1}>
                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                <IconButton size="small" color="error" onClick={() => removeInconsistencyRow(idx)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                size="small"
                                                label="Notas"
                                                value={inc.notes}
                                                onChange={(e) => updateInconsistencyRow(idx, 'notes', e.target.value)}
                                                fullWidth
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={closeDialog}>Cancelar</Button>
                    <Button
                        variant="contained"
                        color={dialogFlow === 'security' ? 'primary' : 'secondary'}
                        onClick={handleConfirmValidation}
                        disabled={validatorId === '' || (dialogFlow === 'security' ? isSecurityLoading : isOpsLoading)}
                        startIcon={(dialogFlow === 'security' ? isSecurityLoading : isOpsLoading) ? <CircularProgress size={16} /> : undefined}
                    >
                        {(dialogFlow === 'security' ? isSecurityLoading : isOpsLoading) ? 'Procesando...' : 'Confirmar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
