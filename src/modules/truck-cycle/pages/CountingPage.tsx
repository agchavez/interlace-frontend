import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Autocomplete,
    TextField,
    CircularProgress,
    Alert,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    PersonAdd as AssignIcon,
    CheckCircle as CompleteIcon,
    FactCheck as VerifyIcon,
    AddCircle as AddIcon,
    PhotoCamera as PhotoIcon,
    HourglassEmpty as PendingIcon,
    Timer as InProgressIcon,
    Assignment as TotalIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import PautaStatusBadge from '../components/PautaStatusBadge';
import DatePickerButton from '../components/DatePickerButton';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { setCountingDate } from '../store/truckCycleFiltersSlice';
import {
    useGetPautasQuery,
    useAssignCounterMutation,
    useCompleteCountMutation,
    useCreateInconsistencyMutation,
    useUploadPhotoMutation,
} from '../services/truckCycleApi';
import { useGetProductQuery } from '../../../store/maintenance/maintenanceApi';
import {
    useGetPersonnelAutocompleteQuery,
    type PersonnelAutocompleteItem,
} from '../../../modules/personnel/services/personnelApi';
import type { PautaStatus, PautaListItem, Inconsistency } from '../interfaces/truckCycle';

// --------------- Timer helper ---------------

function CountingTimer({ createdAt }: { createdAt: string }) {
    const [elapsed, setElapsed] = useState('');
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const computeElapsed = useCallback(() => {
        const start = new Date(createdAt).getTime();
        const diff = Math.max(0, Date.now() - start);
        const h = Math.floor(diff / 3_600_000);
        const m = Math.floor((diff % 3_600_000) / 60_000);
        const s = Math.floor((diff % 60_000) / 1_000);
        setElapsed(
            `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
        );
    }, [createdAt]);

    useEffect(() => {
        computeElapsed();
        intervalRef.current = setInterval(computeElapsed, 1_000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [computeElapsed]);

    return (
        <Chip
            label={elapsed}
            size="small"
            color="info"
            variant="outlined"
            sx={{ fontFamily: 'monospace', fontWeight: 600 }}
        />
    );
}

// --------------- Inconsistency form types ---------------

const INCONSISTENCY_TYPES = [
    { value: 'FALTANTE', label: 'Faltante' },
    { value: 'SOBRANTE', label: 'Sobrante' },
    { value: 'DANADO', label: 'Danado' },
];

interface InconsistencyForm {
    inconsistency_type: string;
    material_code: string;
    product_name: string;
    actual_quantity: string;
    notes: string;
}

const EMPTY_INCONSISTENCY: InconsistencyForm = {
    inconsistency_type: '',
    material_code: '',
    product_name: '',
    actual_quantity: '',
    notes: '',
};

// --------------- Stat Card ---------------

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
            '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgba(0,0,0,0.15)' },
        }}
    >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, fontWeight: 600 }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color, fontSize: { xs: '1.5rem', sm: '2.125rem' }, mt: 0.5 }}
                    >
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

// --------------- Main page ---------------

const COUNTING_STATUSES = 'PENDING_COUNT,COUNTING,COUNTED';

export default function CountingPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 25,
    });
    const dispatch = useAppDispatch();
    const storedDate = useAppSelector((s) => s.truckCycleFilters.counting.date);

    // Menu state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedRow, setSelectedRow] = useState<PautaListItem | null>(null);

    // Dialog state: assign counter
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [assignPauta, setAssignPauta] = useState<PautaListItem | null>(null);
    const [selectedPersonnel, setSelectedPersonnel] = useState<PersonnelAutocompleteItem | null>(null);
    const [personnelSearch, setPersonnelSearch] = useState('');

    // Dialog state: inconsistency
    const [incDialogOpen, setIncDialogOpen] = useState(false);
    const [incPauta, setIncPauta] = useState<PautaListItem | null>(null);
    const [incForm, setIncForm] = useState<InconsistencyForm>({ ...EMPTY_INCONSISTENCY });
    const [incError, setIncError] = useState('');

    // Dialog state: photo upload
    const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
    const [photoPauta, setPhotoPauta] = useState<PautaListItem | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoDesc, setPhotoDesc] = useState('');
    const [photoError, setPhotoError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    // Queries
    const { data, isLoading, isFetching, error } = useGetPautasQuery({
        status: COUNTING_STATUSES,
        operational_date_after: storedDate,
        operational_date_before: storedDate,
        limit: paginationModel.pageSize,
        offset: paginationModel.page * paginationModel.pageSize,
    });

    const { data: personnelData, isLoading: loadingPersonnel } = useGetPersonnelAutocompleteQuery({
        search: personnelSearch || undefined,
        is_active: true,
        position_type: 'WAREHOUSE_ASSISTANT',
        limit: 50,
    }, { skip: !assignDialogOpen });

    // Load products from maintenance for inconsistency autocomplete
    const [productSearch, setProductSearch] = useState('');
    const { data: productData } = useGetProductQuery(
        { search: productSearch || undefined, limit: 50, offset: 0 },
        { skip: !incDialogOpen },
    );
    const productOptions = productData?.results ?? [];

    // Mutations
    const [assignCounter, { isLoading: assigning }] = useAssignCounterMutation();
    const [completeCount, { isLoading: completing }] = useCompleteCountMutation();
    const [createInconsistency, { isLoading: creatingInc }] = useCreateInconsistencyMutation();
    const [uploadPhoto, { isLoading: uploadingPhoto }] = useUploadPhotoMutation();

    // Stats
    const stats = useMemo(() => {
        if (!data?.results) return { pendientes: 0, enConteo: 0, contados: 0 };
        return {
            pendientes: data.results.filter((p) => p.status === 'PENDING_COUNT').length,
            enConteo: data.results.filter((p) => p.status === 'COUNTING').length,
            contados: data.results.filter((p) => p.status === 'COUNTED').length,
        };
    }, [data]);

    // Menu handlers
    const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLElement>, row: PautaListItem) => {
        setAnchorEl(event.currentTarget);
        setSelectedRow(row);
    }, []);

    const handleCloseMenu = useCallback(() => {
        setAnchorEl(null);
        setSelectedRow(null);
    }, []);

    // Assign counter dialog
    const handleOpenAssignDialog = (pauta: PautaListItem) => {
        setAssignPauta(pauta);
        setSelectedPersonnel(null);
        setPersonnelSearch('');
        setAssignDialogOpen(true);
        handleCloseMenu();
    };

    const handleCloseAssignDialog = () => {
        setAssignDialogOpen(false);
        setAssignPauta(null);
        setSelectedPersonnel(null);
    };

    const handleAssignCounter = async () => {
        if (!assignPauta || !selectedPersonnel) return;
        try {
            await assignCounter({ id: assignPauta.id, personnel_id: selectedPersonnel.id }).unwrap();
            handleCloseAssignDialog();
        } catch {
            // Error handled by RTK Query
        }
    };

    // Complete count
    const handleCompleteCount = async (pautaId: number) => {
        handleCloseMenu();
        try {
            await completeCount(pautaId).unwrap();
        } catch {
            // Error handled by RTK Query
        }
    };

    // Inconsistency dialog
    const handleOpenIncDialog = (pauta: PautaListItem) => {
        setIncPauta(pauta);
        setIncForm({ ...EMPTY_INCONSISTENCY });
        setIncError('');
        setIncDialogOpen(true);
        handleCloseMenu();
    };

    const handleCloseIncDialog = () => {
        setIncDialogOpen(false);
        setIncPauta(null);
    };

    const handleIncFormChange = (field: keyof InconsistencyForm, value: string) => {
        setIncForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmitInconsistency = async () => {
        setIncError('');
        if (
            !incForm.inconsistency_type ||
            !incForm.material_code ||
            !incForm.actual_quantity
        ) {
            setIncError('Todos los campos obligatorios deben completarse.');
            return;
        }
        if (!incPauta) return;
        try {
            await createInconsistency({
                pauta: incPauta.id,
                phase: 'VERIFICATION',
                inconsistency_type: incForm.inconsistency_type as Inconsistency['inconsistency_type'],
                material_code: incForm.material_code,
                product_name: incForm.product_name,
                actual_quantity: Number(incForm.actual_quantity),
                notes: incForm.notes,
            }).unwrap();
            handleCloseIncDialog();
        } catch {
            setIncError('Error al registrar la inconsistencia.');
        }
    };

    // Photo upload dialog
    const handleOpenPhotoDialog = (pauta: PautaListItem) => {
        setPhotoPauta(pauta);
        setPhotoFile(null);
        setPhotoDesc('');
        setPhotoError('');
        setPhotoDialogOpen(true);
        handleCloseMenu();
    };

    const handleClosePhotoDialog = () => {
        setPhotoDialogOpen(false);
        setPhotoPauta(null);
        setPhotoFile(null);
        setPhotoDesc('');
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleUploadPhoto = async () => {
        setPhotoError('');
        if (!photoFile) {
            setPhotoError('Seleccione un archivo.');
            return;
        }
        if (!photoPauta) return;
        const fd = new FormData();
        fd.append('pauta', String(photoPauta.id));
        fd.append('phase', 'VERIFICATION');
        fd.append('photo', photoFile);
        fd.append('description', photoDesc || 'Foto verificacion');
        try {
            await uploadPhoto(fd).unwrap();
            handleClosePhotoDialog();
        } catch {
            setPhotoError('Error al subir la foto.');
        }
    };

    const handlePaginationChange = (model: GridPaginationModel) => {
        setPaginationModel(model);
    };

    // Columns
    const columns: GridColDef[] = useMemo(() => {
        const cols: GridColDef[] = [];

        if (isMobile) {
            cols.push({
                field: 'info',
                headerName: 'Pauta',
                flex: 1,
                minWidth: 220,
                sortable: false,
                renderCell: (params: GridRenderCellParams) => (
                    <Box sx={{ py: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>
                            T-{params.row.transport_number} / V-{params.row.trip_number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {params.row.truck_code} - {params.row.truck_plate}
                        </Typography>
                        <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PautaStatusBadge status={params.row.status as PautaStatus} />
                            {params.row.status === 'COUNTING' && (
                                <CountingTimer createdAt={params.row.last_status_change ?? params.row.created_at} />
                            )}
                        </Box>
                    </Box>
                ),
            });
        } else {
            cols.push(
                {
                    field: 'transport_number',
                    headerName: 'Transporte',
                    width: 120,
                },
                {
                    field: 'trip_number',
                    headerName: 'Viaje',
                    width: 80,
                },
                {
                    field: 'truck_code',
                    headerName: 'Camion',
                    width: 130,
                    renderCell: (params: GridRenderCellParams) => (
                        <Typography variant="body2" noWrap>
                            {params.row.truck_code} - {params.row.truck_plate}
                        </Typography>
                    ),
                },
                {
                    field: 'total_boxes',
                    headerName: 'Cajas',
                    width: 80,
                    align: 'right',
                    headerAlign: 'right',
                },
                {
                    field: 'assigned_to',
                    headerName: 'Asignado',
                    flex: 1,
                    minWidth: 140,
                    renderCell: (params: GridRenderCellParams) => {
                        const assigned = params.row.assigned_to;
                        if (!assigned) return <Typography variant="body2" color="text.disabled">—</Typography>;
                        return (
                            <Box>
                                <Typography variant="body2" fontWeight={500} noWrap>{assigned.name}</Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>{assigned.role}</Typography>
                            </Box>
                        );
                    },
                },
                {
                    field: 'status',
                    headerName: 'Estado',
                    width: 180,
                    renderCell: (params: GridRenderCellParams) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PautaStatusBadge status={params.value as PautaStatus} />
                            {params.value === 'COUNTING' && (
                                <CountingTimer createdAt={params.row.last_status_change ?? params.row.created_at} />
                            )}
                        </Box>
                    ),
                },
            );
        }

        // Action button column
        cols.push({
            field: 'actions',
            headerName: 'Acción',
            width: isMobile ? 100 : 180,
            sortable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {params.row.status === 'PENDING_COUNT' && (
                        <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={!isMobile ? <AssignIcon /> : undefined}
                            onClick={(e) => { e.stopPropagation(); handleOpenAssignDialog(params.row); }}
                            sx={{ minWidth: isMobile ? 36 : undefined, px: isMobile ? 1 : undefined }}
                        >
                            {isMobile ? <AssignIcon fontSize="small" /> : 'Asignar'}
                        </Button>
                    )}
                    {(params.row.status === 'COUNTING' || params.row.status === 'COUNTED') && (
                        <Button
                            size="small"
                            variant={params.row.status === 'COUNTING' ? 'contained' : 'outlined'}
                            color="info"
                            startIcon={!isMobile ? <VerifyIcon /> : undefined}
                            onClick={(e) => { e.stopPropagation(); navigate(`/truck-cycle/verify/${params.row.id}`); }}
                            sx={{ minWidth: isMobile ? 36 : undefined, px: isMobile ? 1 : undefined }}
                        >
                            {isMobile ? <VerifyIcon fontSize="small" /> : 'Verificar'}
                        </Button>
                    )}
                </Box>
            ),
        });

        return cols;
    }, [isMobile, handleOpenMenu, completing]);

    if (error) {
        return (
            <Container maxWidth="xl" sx={{ mt: 2 }}>
                <Alert severity="error">Error al cargar las pautas de conteo.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={600}>
                    Conteo / Verificación
                </Typography>
                <DatePickerButton
                    value={storedDate}
                    onChange={(v) => dispatch(setCountingDate(v))}
                    label="Fecha"
                />
            </Box>

            {/* Stat Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={4}>
                    <StatCard
                        title="Pendientes"
                        value={stats.pendientes}
                        icon={<PendingIcon />}
                        color="#F9A825"
                    />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <StatCard
                        title="En Conteo"
                        value={stats.enConteo}
                        icon={<InProgressIcon />}
                        color={theme.palette.info.main}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatCard
                        title="Contados"
                        value={stats.contados}
                        icon={<TotalIcon />}
                        color={theme.palette.success.main}
                    />
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
                    onPaginationModelChange={handlePaginationChange}
                    paginationMode="server"
                    pageSizeOptions={[10, 25, 50]}
                    disableRowSelectionOnClick
                    autoHeight
                    rowHeight={isMobile ? 80 : 52}
                    sx={{
                        border: 0,
                        '& .MuiDataGrid-cell': {
                            fontSize: isMobile ? '0.8125rem' : '0.875rem',
                            py: isMobile ? 1.5 : 1,
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor:
                                theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'rgba(0,0,0,0.02)',
                            fontSize: isMobile ? '0.8125rem' : '0.875rem',
                            fontWeight: 600,
                        },
                        '& .MuiDataGrid-footerContainer': {
                            borderTop: `1px solid ${theme.palette.divider}`,
                        },
                    }}
                    slots={{
                        noRowsOverlay: () => (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%',
                                    flexDirection: 'column',
                                    gap: 1,
                                }}
                            >
                                <Typography variant="body2" color="text.secondary">
                                    No hay pautas en etapa de conteo.
                                </Typography>
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

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        minWidth: 200,
                        borderRadius: 2,
                        mt: 1,
                        '& .MuiMenuItem-root': {
                            px: 2,
                            py: 1.5,
                            borderRadius: 1,
                            mx: 1,
                            my: 0.5,
                            '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' },
                        },
                    },
                }}
            >
                {(selectedRow?.status === 'COUNTING' || selectedRow?.status === 'COUNTED') && (
                    <MenuItem onClick={() => selectedRow && handleOpenIncDialog(selectedRow)}>
                        <ListItemIcon>
                            <AddIcon fontSize="small" color="warning" />
                        </ListItemIcon>
                        <ListItemText>Registrar Inconsistencia</ListItemText>
                    </MenuItem>
                )}
                {(selectedRow?.status === 'COUNTING' || selectedRow?.status === 'COUNTED') && (
                    <MenuItem onClick={() => selectedRow && handleOpenPhotoDialog(selectedRow)}>
                        <ListItemIcon>
                            <PhotoIcon fontSize="small" color="secondary" />
                        </ListItemIcon>
                        <ListItemText>Subir Foto</ListItemText>
                    </MenuItem>
                )}
            </Menu>

            {/* Assign Counter Dialog */}
            <Dialog open={assignDialogOpen} onClose={handleCloseAssignDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Asignar Contador</DialogTitle>
                <DialogContent>
                    {assignPauta && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Transporte {assignPauta.transport_number} - Viaje {assignPauta.trip_number} (
                            {assignPauta.truck_code})
                        </Typography>
                    )}
                    <Autocomplete
                        options={personnelData || []}
                        getOptionLabel={(option) => `${option.employee_code} - ${option.full_name}`}
                        value={selectedPersonnel}
                        onChange={(_, newValue) => setSelectedPersonnel(newValue)}
                        onInputChange={(_, newInput) => setPersonnelSearch(newInput)}
                        loading={loadingPersonnel}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Seleccionar Personal"
                                placeholder="Buscar por nombre o codigo..."
                                fullWidth
                                sx={{ mt: 1 }}
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
                                    <Typography variant="body2" fontWeight={600}>
                                        {option.full_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {option.employee_code} - {option.position}
                                    </Typography>
                                </Box>
                            </li>
                        )}
                        noOptionsText="Sin resultados"
                        loadingText="Cargando..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAssignDialog}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleAssignCounter}
                        disabled={!selectedPersonnel || assigning}
                        startIcon={assigning ? <CircularProgress size={16} /> : undefined}
                    >
                        Asignar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Inconsistency Dialog */}
            <Dialog open={incDialogOpen} onClose={handleCloseIncDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Registrar Inconsistencia</DialogTitle>
                <DialogContent>
                    {incPauta && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Transporte {incPauta.transport_number} - Viaje {incPauta.trip_number} (
                            {incPauta.truck_code})
                        </Typography>
                    )}
                    {incError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {incError}
                        </Alert>
                    )}
                    <TextField
                        select
                        fullWidth
                        size="small"
                        label="Tipo *"
                        value={incForm.inconsistency_type}
                        onChange={(e) => handleIncFormChange('inconsistency_type', e.target.value)}
                        sx={{ mb: 2, mt: 1 }}
                    >
                        {INCONSISTENCY_TYPES.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Autocomplete
                        fullWidth
                        size="small"
                        options={productOptions}
                        getOptionLabel={(opt) => `${opt.sap_code} - ${opt.name}`}
                        onInputChange={(_e, value) => setProductSearch(value)}
                        onChange={(_e, val) => {
                            if (val) {
                                setIncForm((prev) => ({
                                    ...prev,
                                    material_code: val.sap_code,
                                    product_name: val.name,
                                }));
                            }
                        }}
                        filterOptions={(x) => x}
                        renderInput={(params) => (
                            <TextField {...params} label="Producto *" placeholder="Buscar producto..." />
                        )}
                        noOptionsText={productSearch ? 'Sin resultados' : 'Escriba para buscar'}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Cantidad *"
                        helperText="El tipo de inconsistencia define el signo (faltante/dañado restan, sobrante suma)."
                        value={incForm.actual_quantity}
                        onChange={(e) => handleIncFormChange('actual_quantity', e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        size="small"
                        label="Notas"
                        multiline
                        rows={2}
                        value={incForm.notes}
                        onChange={(e) => handleIncFormChange('notes', e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseIncDialog}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmitInconsistency}
                        disabled={creatingInc}
                        startIcon={creatingInc ? <CircularProgress size={16} /> : <AddIcon />}
                    >
                        Registrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Photo Upload Dialog */}
            <Dialog open={photoDialogOpen} onClose={handleClosePhotoDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Subir Foto</DialogTitle>
                <DialogContent>
                    {photoPauta && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Transporte {photoPauta.transport_number} - Viaje {photoPauta.trip_number} (
                            {photoPauta.truck_code})
                        </Typography>
                    )}
                    {photoError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {photoError}
                        </Alert>
                    )}
                    <Box sx={{ mt: 1, mb: 2 }}>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                            style={{ display: 'block', marginBottom: 16 }}
                        />
                    </Box>
                    <TextField
                        fullWidth
                        size="small"
                        label="Descripcion"
                        value={photoDesc}
                        onChange={(e) => setPhotoDesc(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePhotoDialog}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleUploadPhoto}
                        disabled={uploadingPhoto || !photoFile}
                        startIcon={uploadingPhoto ? <CircularProgress size={16} /> : <PhotoIcon />}
                    >
                        Subir
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
