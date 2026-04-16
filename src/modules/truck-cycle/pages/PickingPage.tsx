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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Autocomplete,
    TextField,
    CircularProgress,
    Alert,
    Tooltip,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    PersonAdd as AssignIcon,
    PlayArrow as StartIcon,
    CheckCircle as CompleteIcon,
    HourglassEmpty as PendingIcon,
    Timer as InProgressIcon,
    Assignment as TotalIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import PautaStatusBadge from '../components/PautaStatusBadge';
import {
    useGetPautasQuery,
    useAssignPickerMutation,
    useStartPickingMutation,
    useCompletePickingMutation,
} from '../services/truckCycleApi';
import { useGetPersonnelProfilesQuery } from '../../../modules/personnel/services/personnelApi';
import type { PautaListItem, PautaStatus } from '../interfaces/truckCycle';
import type { PersonnelProfileList } from '../../../interfaces/personnel';

// ---- Running timer component for PICKING_IN_PROGRESS pautas ----
function PickingTimer({ createdAt }: { createdAt: string }) {
    const [elapsed, setElapsed] = useState('');
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const computeElapsed = useCallback(() => {
        const start = new Date(createdAt).getTime();
        const diff = Math.max(0, Date.now() - start);
        const hrs = Math.floor(diff / 3_600_000);
        const mins = Math.floor((diff % 3_600_000) / 60_000);
        const secs = Math.floor((diff % 60_000) / 1_000);
        setElapsed(
            `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
        );
    }, [createdAt]);

    useEffect(() => {
        computeElapsed();
        intervalRef.current = setInterval(computeElapsed, 1_000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [computeElapsed]);

    return (
        <Chip label={elapsed} size="small" color="warning" variant="outlined" sx={{ fontFamily: 'monospace', fontWeight: 600 }} />
    );
}

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

const PICKING_STATUSES = 'PENDING_PICKING,PICKING_ASSIGNED,PICKING_IN_PROGRESS';

export default function PickingPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });

    // Dialog state for assigning picker
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedPauta, setSelectedPauta] = useState<PautaListItem | null>(null);
    const [selectedPersonnel, setSelectedPersonnel] = useState<PersonnelProfileList | null>(null);
    const [personnelSearch, setPersonnelSearch] = useState('');

    // Queries
    const { data, isLoading, isFetching, error } = useGetPautasQuery({
        status: PICKING_STATUSES,
        limit: paginationModel.pageSize,
        offset: paginationModel.page * paginationModel.pageSize,
    });

    const { data: personnelData, isLoading: loadingPersonnel } = useGetPersonnelProfilesQuery({
        search: personnelSearch || undefined,
        is_active: true,
        limit: 50,
    }, { skip: !assignDialogOpen });

    // Mutations
    const [assignPicker, { isLoading: assigning }] = useAssignPickerMutation();
    const [startPicking, { isLoading: startingPicking }] = useStartPickingMutation();
    const [completePicking, { isLoading: completingPicking }] = useCompletePickingMutation();

    // Stats
    const stats = useMemo(() => {
        if (!data?.results) return { pendientes: 0, enProgreso: 0, total: 0 };
        return {
            pendientes: data.results.filter(
                (p) => p.status === 'PENDING_PICKING' || p.status === 'PICKING_ASSIGNED',
            ).length,
            enProgreso: data.results.filter((p) => p.status === 'PICKING_IN_PROGRESS').length,
            total: data.count,
        };
    }, [data]);

    // Dialog handlers
    const handleOpenAssignDialog = (pauta: PautaListItem) => {
        setSelectedPauta(pauta);
        setSelectedPersonnel(null);
        setPersonnelSearch('');
        setAssignDialogOpen(true);
    };

    const handleCloseAssignDialog = () => {
        setAssignDialogOpen(false);
        setSelectedPauta(null);
        setSelectedPersonnel(null);
    };

    const handleAssignPicker = async () => {
        if (!selectedPauta || !selectedPersonnel) return;
        try {
            await assignPicker({ id: selectedPauta.id, personnel_id: selectedPersonnel.id }).unwrap();
            handleCloseAssignDialog();
        } catch {
            // handled by RTK Query
        }
    };

    const handleStartPicking = async (pautaId: number) => {
        try { await startPicking(pautaId).unwrap(); } catch { /* handled */ }
    };

    const handleCompletePicking = async (pautaId: number) => {
        try { await completePicking(pautaId).unwrap(); } catch { /* handled */ }
    };

    // Action button renderer based on status
    const renderActionButton = (row: PautaListItem) => {
        switch (row.status) {
            case 'PENDING_PICKING':
                return (
                    <Tooltip title="Asignar Picker">
                        <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={!isMobile ? <AssignIcon /> : undefined}
                            onClick={(e) => { e.stopPropagation(); handleOpenAssignDialog(row); }}
                            sx={{ minWidth: isMobile ? 36 : undefined, px: isMobile ? 1 : undefined }}
                        >
                            {isMobile ? <AssignIcon fontSize="small" /> : 'Asignar'}
                        </Button>
                    </Tooltip>
                );
            case 'PICKING_ASSIGNED':
                return (
                    <Tooltip title="Iniciar Picking">
                        <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={!isMobile ? <StartIcon /> : undefined}
                            onClick={(e) => { e.stopPropagation(); handleStartPicking(row.id); }}
                            disabled={startingPicking}
                            sx={{ minWidth: isMobile ? 36 : undefined, px: isMobile ? 1 : undefined }}
                        >
                            {isMobile ? <StartIcon fontSize="small" /> : 'Iniciar'}
                        </Button>
                    </Tooltip>
                );
            case 'PICKING_IN_PROGRESS':
                return (
                    <Tooltip title="Completar Picking">
                        <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={!isMobile ? <CompleteIcon /> : undefined}
                            onClick={(e) => { e.stopPropagation(); handleCompletePicking(row.id); }}
                            disabled={completingPicking}
                            sx={{ minWidth: isMobile ? 36 : undefined, px: isMobile ? 1 : undefined }}
                        >
                            {isMobile ? <CompleteIcon fontSize="small" /> : 'Completar'}
                        </Button>
                    </Tooltip>
                );
            default:
                return null;
        }
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
                        <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            <PautaStatusBadge status={params.row.status as PautaStatus} />
                            {params.row.status === 'PICKING_IN_PROGRESS' && (
                                <PickingTimer createdAt={params.row.last_status_change ?? params.row.created_at} />
                            )}
                        </Box>
                    </Box>
                ),
            });
        } else {
            cols.push(
                { field: 'transport_number', headerName: 'Transporte', width: 120 },
                { field: 'trip_number', headerName: 'Viaje', width: 80 },
                {
                    field: 'truck_code',
                    headerName: 'Camión',
                    width: 130,
                    renderCell: (params: GridRenderCellParams) => (
                        <Typography variant="body2" noWrap>
                            {params.row.truck_code || '?'} - {params.row.truck_plate}
                        </Typography>
                    ),
                },
                { field: 'total_boxes', headerName: 'Cajas', width: 90, align: 'right', headerAlign: 'right' },
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
                    width: 250,
                    minWidth: 180,
                    renderCell: (params: GridRenderCellParams) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PautaStatusBadge status={params.value as PautaStatus} />
                            {params.value === 'PICKING_IN_PROGRESS' && (
                                <PickingTimer createdAt={params.row.last_status_change ?? params.row.created_at} />
                            )}
                        </Box>
                    ),
                },
            );
        }

        // Action button column
        cols.push({
            field: 'action',
            headerName: 'Acción',
            width: isMobile ? 60 : 140,
            sortable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams) => renderActionButton(params.row),
        });

        // View detail
        cols.push({
            field: 'view',
            headerName: '',
            width: 50,
            sortable: false,
            align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Tooltip title="Ver Detalle">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/truck-cycle/pautas/${params.row.id}`); }}>
                        <ViewIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            ),
        });

        return cols;
    }, [isMobile, startingPicking, completingPicking, navigate]);

    if (error) {
        return (
            <Container maxWidth="xl" sx={{ mt: 2 }}>
                <Alert severity="error">Error al cargar las pautas de picking.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 2 }}>
            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={600} sx={{ mb: 3 }}>
                Picking
            </Typography>

            {/* Stat Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={4}>
                    <StatCard title="Pendientes" value={stats.pendientes} icon={<PendingIcon />} color="#F9A825" />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <StatCard title="En Progreso" value={stats.enProgreso} icon={<InProgressIcon />} color={theme.palette.warning.main} />
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
                        '& .MuiDataGrid-cell': {
                            fontSize: isMobile ? '0.8125rem' : '0.875rem',
                            py: isMobile ? 1.5 : 1,
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                            fontSize: isMobile ? '0.8125rem' : '0.875rem',
                            fontWeight: 600,
                        },
                        '& .MuiDataGrid-footerContainer': {
                            borderTop: `1px solid ${theme.palette.divider}`,
                        },
                    }}
                    slots={{
                        noRowsOverlay: () => (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    No hay pautas pendientes de picking.
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

            {/* Assign Picker Dialog */}
            <Dialog open={assignDialogOpen} onClose={handleCloseAssignDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Asignar Picker</DialogTitle>
                <DialogContent>
                    {selectedPauta && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Transporte {selectedPauta.transport_number} - Viaje {selectedPauta.trip_number} (
                            {selectedPauta.truck_code || '?'})
                        </Typography>
                    )}
                    <Autocomplete
                        options={personnelData?.results || []}
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
                                placeholder="Buscar por nombre o código..."
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
                                    <Typography variant="body2" fontWeight={600}>{option.full_name}</Typography>
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
                        onClick={handleAssignPicker}
                        disabled={!selectedPersonnel || assigning}
                        startIcon={assigning ? <CircularProgress size={16} /> : undefined}
                    >
                        Asignar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
