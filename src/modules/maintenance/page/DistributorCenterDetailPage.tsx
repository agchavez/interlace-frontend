import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Tabs,
    Tab,
    Button,
    IconButton,
    Chip,
    Divider,
    CircularProgress,
    Alert,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Switch,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Business as BusinessIcon,
    LocationOn as LocationIcon,
    Schedule as ShiftIcon,
    LocalShipping as TruckIcon,
    MeetingRoom as BayIcon,
    Edit as EditIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Flag as FlagIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { toast } from 'sonner';
import {
    useGetDistributorCentersQuery,
} from '../../../store/maintenance/maintenanceApi';
import {
    useGetTrucksQuery,
    useCreateTruckMutation,
    useUpdateTruckMutation,
    useDeleteTruckMutation,
    useGetBaysQuery,
    useCreateBayMutation,
    useUpdateBayMutation,
    useDeleteBayMutation,
} from '../../truck-cycle/services/truckCycleApi';
import type { Truck, Bay } from '../../truck-cycle/interfaces/truckCycle';

// Info item helper
const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1 }}>
        <Box sx={{ color: 'secondary.main', mt: 0.3 }}>{icon}</Box>
        <Box>
            <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
            <Typography variant="body2" fontWeight={500}>{value || '-'}</Typography>
        </Box>
    </Box>
);

const DAY_LABELS: Record<string, string> = {
    MON: 'Lunes', TUE: 'Martes', WED: 'Miércoles', THU: 'Jueves',
    FRI: 'Viernes', SAT: 'Sábado', SUN: 'Domingo',
};

export function DistributorCenterDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [tabIndex, setTabIndex] = useState(0);

    // Fetch DC data
    const { data: dcData, isLoading, error } = useGetDistributorCentersQuery({ limit: 100, offset: 0, search: '' });
    const dc = dcData?.results?.find((d) => d.id === Number(id));

    // Trucks & Bays
    const { data: trucksData, isLoading: loadingTrucks } = useGetTrucksQuery();
    const { data: baysData, isLoading: loadingBays } = useGetBaysQuery();

    const [createTruck] = useCreateTruckMutation();
    const [updateTruck] = useUpdateTruckMutation();
    const [deleteTruck] = useDeleteTruckMutation();
    const [createBay] = useCreateBayMutation();
    const [updateBay] = useUpdateBayMutation();
    const [deleteBay] = useDeleteBayMutation();

    // Truck dialog
    const [truckDialogOpen, setTruckDialogOpen] = useState(false);
    const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
    const [truckForm, setTruckForm] = useState({ code: '', plate: '', pallet_type: 'STANDARD' as 'STANDARD' | 'HALF', pallet_spaces: 0 });

    // Bay dialog
    const [bayDialogOpen, setBayDialogOpen] = useState(false);
    const [editingBay, setEditingBay] = useState<Bay | null>(null);
    const [bayForm, setBayForm] = useState({ code: '', name: '' });

    if (isLoading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !dc) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">No se pudo cargar el centro de distribución.</Alert>
                <Button startIcon={<BackIcon />} onClick={() => navigate('/maintenance/distributor-center')} sx={{ mt: 2 }}>
                    Volver
                </Button>
            </Box>
        );
    }

    const shifts = (dc as any).shifts || [];
    const trucks = trucksData?.results?.filter((t) => t.distributor_center === dc.id) || [];
    const bays = baysData?.results?.filter((b) => b.distributor_center === dc.id) || [];

    // Truck handlers
    const handleOpenTruckDialog = (truck?: Truck) => {
        if (truck) {
            setEditingTruck(truck);
            setTruckForm({ code: truck.code, plate: truck.plate, pallet_type: truck.pallet_type, pallet_spaces: truck.pallet_spaces });
        } else {
            setEditingTruck(null);
            setTruckForm({ code: '', plate: '', pallet_type: 'STANDARD', pallet_spaces: 0 });
        }
        setTruckDialogOpen(true);
    };

    const handleSaveTruck = async () => {
        try {
            if (editingTruck) {
                await updateTruck({ id: editingTruck.id, data: truckForm }).unwrap();
                toast.success('Camión actualizado');
            } else {
                await createTruck({ ...truckForm, distributor_center: dc.id }).unwrap();
                toast.success('Camión creado');
            }
            setTruckDialogOpen(false);
        } catch { toast.error('Error al guardar camión'); }
    };

    const handleDeleteTruck = async (truckId: number) => {
        if (!confirm('¿Eliminar este camión?')) return;
        try {
            await deleteTruck(truckId).unwrap();
            toast.success('Camión eliminado');
        } catch { toast.error('Error al eliminar'); }
    };

    // Bay handlers
    const handleOpenBayDialog = (bay?: Bay) => {
        if (bay) {
            setEditingBay(bay);
            setBayForm({ code: bay.code, name: bay.name });
        } else {
            setEditingBay(null);
            setBayForm({ code: '', name: '' });
        }
        setBayDialogOpen(true);
    };

    const handleSaveBay = async () => {
        try {
            if (editingBay) {
                await updateBay({ id: editingBay.id, data: bayForm }).unwrap();
                toast.success('Bahía actualizada');
            } else {
                await createBay({ ...bayForm, distributor_center: dc.id }).unwrap();
                toast.success('Bahía creada');
            }
            setBayDialogOpen(false);
        } catch { toast.error('Error al guardar bahía'); }
    };

    const handleDeleteBay = async (bayId: number) => {
        if (!confirm('¿Eliminar esta bahía?')) return;
        try {
            await deleteBay(bayId).unwrap();
            toast.success('Bahía eliminada');
        } catch { toast.error('Error al eliminar'); }
    };

    const handleToggleTruck = async (truck: Truck) => {
        try {
            await updateTruck({ id: truck.id, data: { is_active: !truck.is_active } }).unwrap();
        } catch { toast.error('Error al actualizar'); }
    };

    const handleToggleBay = async (bay: Bay) => {
        try {
            await updateBay({ id: bay.id, data: { is_active: !bay.is_active } }).unwrap();
        } catch { toast.error('Error al actualizar'); }
    };

    // Truck columns
    const truckColumns: GridColDef[] = [
        { field: 'code', headerName: 'Código', flex: 1, minWidth: 100 },
        { field: 'plate', headerName: 'Placa', flex: 1, minWidth: 100 },
        {
            field: 'pallet_type', headerName: 'Tipo Pallet', width: 120,
            renderCell: (params) => (
                <Chip label={params.value === 'STANDARD' ? 'Estándar' : 'Medio'} size="small" color={params.value === 'STANDARD' ? 'primary' : 'warning'} variant="outlined" />
            ),
        },
        { field: 'pallet_spaces', headerName: 'Espacios', width: 100, align: 'right', headerAlign: 'right' },
        {
            field: 'is_active', headerName: 'Activo', width: 80, align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Switch size="small" checked={params.value} onChange={() => handleToggleTruck(params.row)} />
            ),
        },
        {
            field: 'actions', headerName: '', width: 100, sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box>
                    <IconButton size="small" onClick={() => handleOpenTruckDialog(params.row)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteTruck(params.row.id)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
            ),
        },
    ];

    // Bay columns
    const bayColumns: GridColDef[] = [
        { field: 'code', headerName: 'Código', flex: 1, minWidth: 100 },
        { field: 'name', headerName: 'Nombre', flex: 1.5, minWidth: 150 },
        {
            field: 'is_active', headerName: 'Activo', width: 80, align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Switch size="small" checked={params.value} onChange={() => handleToggleBay(params.row)} />
            ),
        },
        {
            field: 'actions', headerName: '', width: 100, sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box>
                    <IconButton size="small" onClick={() => handleOpenBayDialog(params.row)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteBay(params.row.id)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
            ),
        },
    ];

    // Group shifts by day
    const shiftsByDay: Record<string, any[]> = {};
    shifts.forEach((shift: any) => {
        const day = shift.day_of_week;
        if (!shiftsByDay[day]) shiftsByDay[day] = [];
        shiftsByDay[day].push(shift);
    });

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/maintenance/distributor-center')} sx={{ bgcolor: 'grey.100' }}>
                    <BackIcon />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {dc.data_country?.flag && (
                        <Box
                            component="img"
                            src={`https://flagcdn.com/w80/${dc.data_country.flag.toLowerCase()}.png`}
                            alt={dc.data_country.name}
                            sx={{ width: 36, height: 24, borderRadius: 0.5, boxShadow: 1 }}
                        />
                    )}
                    <Box>
                        <Typography variant="h5" fontWeight={600}>{dc.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {dc.location_distributor_center_code} &middot; {dc.direction}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Summary cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Camiones</Typography>
                        <Typography variant="h4" fontWeight={700} color="primary.main">{trucks.filter((t) => t.is_active).length}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Bahías</Typography>
                        <Typography variant="h4" fontWeight={700} color="secondary.main">{bays.filter((b) => b.is_active).length}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Turnos</Typography>
                        <Typography variant="h4" fontWeight={700} color="warning.main">{shifts.length}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Tabs
                    value={tabIndex}
                    onChange={(_, v) => setTabIndex(v)}
                    variant={isMobile ? 'scrollable' : 'standard'}
                    scrollButtons={isMobile ? 'auto' : false}
                    sx={{ borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' } }}
                >
                    <Tab label="Información" />
                    <Tab label={`Turnos (${shifts.length})`} />
                    <Tab label={`Camiones (${trucks.length})`} />
                    <Tab label={`Bahías (${bays.length})`} />
                </Tabs>

                {/* Info tab */}
                {tabIndex === 0 && (
                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <InfoItem icon={<BusinessIcon fontSize="small" />} label="Nombre" value={dc.name} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoItem icon={<LocationIcon fontSize="small" />} label="Código Localidad" value={dc.location_distributor_center_code} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoItem icon={<LocationIcon fontSize="small" />} label="Dirección" value={dc.direction} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoItem
                                    icon={
                                        dc.data_country?.flag ? (
                                            <Box
                                                component="img"
                                                src={`https://flagcdn.com/w40/${dc.data_country.flag.toLowerCase()}.png`}
                                                alt={dc.data_country.name}
                                                sx={{ width: 24, height: 16, borderRadius: 0.5 }}
                                            />
                                        ) : (
                                            <FlagIcon fontSize="small" />
                                        )
                                    }
                                    label="País"
                                    value={dc.data_country?.name || dc.country_code || '-'}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Shifts tab */}
                {tabIndex === 1 && (
                    <Box sx={{ p: 3 }}>
                        {shifts.length === 0 ? (
                            <Typography color="text.secondary" textAlign="center" py={3}>No hay turnos configurados.</Typography>
                        ) : (
                            <Grid container spacing={2}>
                                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => {
                                    const dayShifts = shiftsByDay[day] || [];
                                    if (dayShifts.length === 0) return null;
                                    return (
                                        <Grid item xs={12} sm={6} md={4} key={day}>
                                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                                    {DAY_LABELS[day] || day}
                                                </Typography>
                                                <Divider sx={{ mb: 1 }} />
                                                {dayShifts.map((shift: any) => (
                                                    <Box key={shift.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                                                        <Chip label={shift.shift_name} size="small" color="secondary" variant="outlined" />
                                                        <Typography variant="body2">
                                                            {shift.start_time?.slice(0, 5)} - {shift.end_time?.slice(0, 5)}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Paper>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        )}
                    </Box>
                )}

                {/* Trucks tab */}
                {tabIndex === 2 && (
                    <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={() => handleOpenTruckDialog()}>
                                Agregar Camión
                            </Button>
                        </Box>
                        <DataGrid
                            rows={trucks}
                            columns={truckColumns}
                            autoHeight
                            disableRowSelectionOnClick
                            pageSizeOptions={[10, 25]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                            loading={loadingTrucks}
                            localeText={{ noRowsLabel: 'Sin camiones.' }}
                            sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { backgroundColor: theme.palette.action.hover } }}
                        />
                    </Box>
                )}

                {/* Bays tab */}
                {tabIndex === 3 && (
                    <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={() => handleOpenBayDialog()}>
                                Agregar Bahía
                            </Button>
                        </Box>
                        <DataGrid
                            rows={bays}
                            columns={bayColumns}
                            autoHeight
                            disableRowSelectionOnClick
                            pageSizeOptions={[10, 25]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                            loading={loadingBays}
                            localeText={{ noRowsLabel: 'Sin bahías.' }}
                            sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { backgroundColor: theme.palette.action.hover } }}
                        />
                    </Box>
                )}
            </Card>

            {/* Truck Dialog */}
            <Dialog open={truckDialogOpen} onClose={() => setTruckDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingTruck ? 'Editar Camión' : 'Agregar Camión'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField label="Código" size="small" value={truckForm.code} onChange={(e) => setTruckForm((f) => ({ ...f, code: e.target.value }))} fullWidth />
                        <TextField label="Placa" size="small" value={truckForm.plate} onChange={(e) => setTruckForm((f) => ({ ...f, plate: e.target.value }))} fullWidth />
                        <TextField select label="Tipo de Pallet" size="small" value={truckForm.pallet_type} onChange={(e) => setTruckForm((f) => ({ ...f, pallet_type: e.target.value as 'STANDARD' | 'HALF' }))} fullWidth>
                            <MenuItem value="STANDARD">Estándar</MenuItem>
                            <MenuItem value="HALF">Medio</MenuItem>
                        </TextField>
                        <TextField label="Espacios de Pallet" size="small" type="number" value={truckForm.pallet_spaces} onChange={(e) => setTruckForm((f) => ({ ...f, pallet_spaces: Number(e.target.value) }))} fullWidth />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTruckDialogOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveTruck}>{editingTruck ? 'Guardar' : 'Crear'}</Button>
                </DialogActions>
            </Dialog>

            {/* Bay Dialog */}
            <Dialog open={bayDialogOpen} onClose={() => setBayDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingBay ? 'Editar Bahía' : 'Agregar Bahía'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField label="Código" size="small" value={bayForm.code} onChange={(e) => setBayForm((f) => ({ ...f, code: e.target.value }))} fullWidth />
                        <TextField label="Nombre" size="small" value={bayForm.name} onChange={(e) => setBayForm((f) => ({ ...f, name: e.target.value }))} fullWidth />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBayDialogOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveBay}>{editingBay ? 'Guardar' : 'Crear'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
