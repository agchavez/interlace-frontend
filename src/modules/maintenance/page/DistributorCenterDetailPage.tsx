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
    FormControlLabel,
    Tooltip,
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
    useCreateDcShiftMutation,
    useUpdateDcShiftMutation,
    useDeleteDcShiftMutation,
    type DCShift,
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
import BayGridEditor from '../../truck-cycle/components/BayGridEditor';
import type { DockPosition } from '../../truck-cycle/components/BayGridPicker';
import TvSessionsTab from '../../tv/components/TvSessionsTab';

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

// Panel de info — ícono coloreado en círculo + label + value grande.
const InfoPanel = ({ icon, label, value, accent, monospace }: {
    icon: React.ReactNode; label: string; value: React.ReactNode; accent: string; monospace?: boolean;
}) => (
    <Box sx={{
        p: 2, borderRadius: 2,
        border: (t) => `1px solid ${t.palette.divider}`,
        bgcolor: 'background.paper',
        display: 'flex', alignItems: 'center', gap: 2,
        transition: 'box-shadow .2s ease, border-color .2s ease',
        '&:hover': { boxShadow: 2, borderColor: (t) => (t.palette as any)[accent.split('.')[0]]?.[accent.split('.')[1]] || accent },
    }}>
        <Box sx={{
            width: 44, height: 44, borderRadius: '50%',
            bgcolor: (t) => {
                const [p, s] = accent.split('.');
                const c = (t.palette as any)[p]?.[s] || accent;
                return `${c}15`;
            },
            color: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
        }}>
            {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                {label}
            </Typography>
            <Typography
                variant="body1"
                fontWeight={700}
                sx={{ fontFamily: monospace ? 'monospace' : undefined, wordBreak: 'break-word', lineHeight: 1.3 }}
            >
                {value || '—'}
            </Typography>
        </Box>
    </Box>
);

// Stat chip compacto dentro del hero del CD — blanco translúcido sobre el gradiente.
const HeroStat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) => (
    <Box sx={{
        bgcolor: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 1.5,
        px: 1.25, py: 0.75,
        display: 'flex', alignItems: 'center', gap: 0.75,
    }}>
        <Box sx={{ opacity: 0.9, display: 'flex' }}>{icon}</Box>
        <Box sx={{ lineHeight: 1 }}>
            <Typography sx={{ fontSize: '0.6rem', opacity: 0.85, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
                {label}
            </Typography>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, fontFeatureSettings: '"tnum"', lineHeight: 1.1 }}>
                {value}
            </Typography>
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

    // Shift dialog
    const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<DCShift | null>(null);
    const [shiftForm, setShiftForm] = useState<{ shift_name: string; day_of_week: string; start_time: string; end_time: string; is_active: boolean }>({
        shift_name: '', day_of_week: 'MON', start_time: '06:00', end_time: '14:00', is_active: true,
    });
    const [createShift, { isLoading: creatingShift }] = useCreateDcShiftMutation();
    const [updateShiftMut, { isLoading: updatingShift }] = useUpdateDcShiftMutation();
    const [deleteShiftMut] = useDeleteDcShiftMutation();

    // Layout (bay grid) — ojo: estos hooks TIENEN que quedar antes de cualquier
    // return condicional, o React tira "Rendered more hooks than during the
    // previous render" al pasar de loading → cargado.
    const dockStorageKey = id ? `bayDock_${id}` : 'bayDock';
    const [dockPosition, setDockPosition] = useState<DockPosition>(() => {
        const stored = typeof window !== 'undefined' ? window.localStorage.getItem(dockStorageKey) : null;
        return (stored === 'top' || stored === 'bottom' || stored === 'left' || stored === 'right') ? stored : 'top';
    });
    const [savingLayout, setSavingLayout] = useState(false);

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

    // Shift handlers
    const handleOpenShiftDialog = (shift?: any, presetDay?: string) => {
        if (shift) {
            setEditingShift(shift);
            setShiftForm({
                shift_name: shift.shift_name,
                day_of_week: shift.day_of_week,
                start_time: shift.start_time?.slice(0, 5) || '06:00',
                end_time: shift.end_time?.slice(0, 5) || '14:00',
                is_active: shift.is_active,
            });
        } else {
            setEditingShift(null);
            setShiftForm({
                shift_name: '', day_of_week: presetDay || 'MON',
                start_time: '06:00', end_time: '14:00', is_active: true,
            });
        }
        setShiftDialogOpen(true);
    };

    const handleSaveShift = async () => {
        if (!shiftForm.shift_name.trim()) {
            toast.error('El nombre del turno es requerido'); return;
        }
        const payload = {
            shift_name: shiftForm.shift_name.trim(),
            day_of_week: shiftForm.day_of_week as DCShift['day_of_week'],
            start_time: shiftForm.start_time.length === 5 ? shiftForm.start_time + ':00' : shiftForm.start_time,
            end_time: shiftForm.end_time.length === 5 ? shiftForm.end_time + ':00' : shiftForm.end_time,
            is_active: shiftForm.is_active,
        };
        try {
            if (editingShift) {
                await updateShiftMut({ id: editingShift.id, data: payload }).unwrap();
                toast.success('Turno actualizado');
            } else {
                await createShift({ ...payload, distributor_center: dc.id }).unwrap();
                toast.success('Turno creado');
            }
            setShiftDialogOpen(false);
        } catch (err: any) {
            toast.error(err?.data?.detail || err?.data?.shift_name?.[0] || 'Error al guardar turno');
        }
    };

    const handleDeleteShift = async (shiftId: number) => {
        if (!confirm('¿Eliminar este turno?')) return;
        try {
            await deleteShiftMut(shiftId).unwrap();
            toast.success('Turno eliminado');
        } catch { toast.error('Error al eliminar'); }
    };

    const handleToggleTruck = async (truck: Truck) => {
        try {
            await updateTruck({ id: truck.id, data: { is_active: !truck.is_active } }).unwrap();
        } catch { toast.error('Error al actualizar'); }
    };

    const handleDockChange = (d: DockPosition) => {
        setDockPosition(d);
        try { window.localStorage.setItem(dockStorageKey, d); } catch { /* ignore */ }
    };

    const handleSaveLayout = async (
        changes: Array<{ id: number; row: number; column: number }>,
    ) => {
        setSavingLayout(true);
        try {
            await Promise.all(
                changes.map((c) => updateBay({ id: c.id, data: { row: c.row, column: c.column } }).unwrap()),
            );
            toast.success('Layout actualizado');
        } catch {
            toast.error('Error al guardar el layout');
        } finally {
            setSavingLayout(false);
        }
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
        <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
            {/* Hero compacto — una sola fila con back + bandera + título + stats */}
            <Box sx={{
                background: (t) => `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.primary.dark} 100%)`,
                color: '#fff',
                borderRadius: 2,
                px: { xs: 1.5, sm: 2 },
                py: { xs: 1, sm: 1.25 },
                mb: 2,
                display: 'flex', alignItems: 'center',
                gap: { xs: 1, sm: 1.5 },
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
            }}>
                <IconButton
                    size="small"
                    onClick={() => navigate('/maintenance/distributor-center')}
                    sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }, flexShrink: 0 }}
                >
                    <BackIcon fontSize="small" />
                </IconButton>
                {(() => {
                    const code = (dc.data_country?.flag || dc.country_code || '').toLowerCase();
                    if (!code) return null;
                    return (
                        <Box
                            component="img"
                            src={`https://flagcdn.com/w80/${code}.png`}
                            alt={dc.data_country?.name || dc.country_code || ''}
                            sx={{ width: 28, height: 20, borderRadius: 0.5, boxShadow: '0 2px 4px rgba(0,0,0,0.2)', flexShrink: 0 }}
                        />
                    );
                })()}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography fontWeight={800} sx={{ lineHeight: 1.1, fontSize: { xs: '1rem', sm: '1.15rem' } }} noWrap>
                        {dc.name}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85, fontSize: { xs: '0.65rem', sm: '0.75rem' } }} noWrap>
                        {dc.location_distributor_center_code} · {dc.direction}
                    </Typography>
                </Box>
                {/* Stats inline en desktop, ocultas en mobile para ahorrar espacio */}
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, flexShrink: 0 }}>
                    <HeroStat icon={<TruckIcon fontSize="small" />} label="Camiones" value={trucks.filter((t) => t.is_active).length} />
                    <HeroStat icon={<BayIcon fontSize="small" />} label="Bahías" value={bays.filter((b) => b.is_active).length} />
                </Box>
            </Box>

            {/* Tabs */}
            <Card elevation={0} sx={{
                borderRadius: 3, overflow: 'hidden',
                border: (t) => `1px solid ${t.palette.divider}`,
                bgcolor: 'background.paper',
            }}>
                <Tabs
                    value={tabIndex}
                    onChange={(_, v) => setTabIndex(v)}
                    variant={isMobile ? 'scrollable' : 'standard'}
                    scrollButtons={isMobile ? 'auto' : false}
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        px: { xs: 1, sm: 2 },
                        '& .MuiTab-root': {
                            fontWeight: 600, textTransform: 'none',
                            fontSize: '0.95rem', minHeight: 48,
                        },
                        '& .Mui-selected': { fontWeight: 700 },
                        '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
                    }}
                >
                    <Tab label="Información" />
                    <Tab label="Turnos" />
                    <Tab label="Camiones" />
                    <Tab label="Bahías" />
                    <Tab label="TVs" />
                </Tabs>

                {/* Info tab */}
                {tabIndex === 0 && (
                    <Box sx={{ p: { xs: 2, sm: 3 } }}>
                        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                            <Grid item xs={12} sm={6} md={6}>
                                <InfoPanel
                                    icon={<BusinessIcon />}
                                    label="Nombre"
                                    value={dc.name}
                                    accent="primary.main"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <InfoPanel
                                    icon={<LocationIcon />}
                                    label="Código Localidad"
                                    value={dc.location_distributor_center_code}
                                    accent="info.main"
                                    monospace
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <InfoPanel
                                    icon={<LocationIcon />}
                                    label="Dirección"
                                    value={dc.direction || '—'}
                                    accent="secondary.main"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <InfoPanel
                                    icon={
                                        (() => {
                                            const code = (dc.data_country?.flag || dc.country_code || '').toLowerCase();
                                            return code
                                                ? <Box component="img" src={`https://flagcdn.com/w40/${code}.png`} alt={code} sx={{ width: 24, height: 16, borderRadius: 0.5 }} />
                                                : <FlagIcon />;
                                        })()
                                    }
                                    label="País"
                                    value={dc.data_country?.name || dc.country_code || '—'}
                                    accent="success.main"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Shifts tab */}
                {tabIndex === 1 && (
                    <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                                Los turnos que cruzan medianoche (p.ej. 20:30 → 06:00) se marcan <Box component="span" sx={{ color: 'warning.dark', fontWeight: 700 }}>⟶ día siguiente</Box>.
                            </Typography>
                            <Button
                                startIcon={<AddIcon />}
                                variant="contained"
                                size="small"
                                onClick={() => handleOpenShiftDialog()}
                                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                            >
                                Agregar Turno
                            </Button>
                        </Box>
                        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => {
                                const dayShifts = shiftsByDay[day] || [];
                                return (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={day}>
                                        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, height: '100%', opacity: dayShifts.length === 0 ? 0.6 : 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'primary.main', flex: 1 }}>
                                                    {DAY_LABELS[day] || day}
                                                </Typography>
                                                <Tooltip title="Agregar turno este día">
                                                    <IconButton size="small" onClick={() => handleOpenShiftDialog(undefined, day)}>
                                                        <AddIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                            <Divider sx={{ mb: 1.5 }} />
                                            {dayShifts.length === 0 ? (
                                                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                    Sin turnos
                                                </Typography>
                                            ) : (
                                                dayShifts.map((shift: any) => {
                                                    const start = shift.start_time?.slice(0, 5);
                                                    const end = shift.end_time?.slice(0, 5);
                                                    const overnight = start && end && start > end;
                                                    return (
                                                        <Box key={shift.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                                                            <Chip label={shift.shift_name} size="small" color="primary" sx={{ fontWeight: 700, minWidth: 48 }} />
                                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                                                                    {start} – {end}
                                                                </Typography>
                                                                {overnight && (
                                                                    <Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 600 }}>
                                                                        ⟶ día siguiente
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                            <IconButton size="small" onClick={() => handleOpenShiftDialog(shift)}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton size="small" color="error" onClick={() => handleDeleteShift(shift.id)}>
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    );
                                                })
                                            )}
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                )}

                {/* Trucks tab */}
                {tabIndex === 2 && (
                    <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                {trucks.length} camión{trucks.length === 1 ? '' : 'es'} · {trucks.filter((t) => t.is_active).length} activo{trucks.filter((t) => t.is_active).length === 1 ? '' : 's'}
                            </Typography>
                            <Button
                                startIcon={<AddIcon />} variant="contained" size="small"
                                onClick={() => handleOpenTruckDialog()}
                                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                            >
                                Agregar Camión
                            </Button>
                        </Box>

                        {loadingTrucks ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
                        ) : trucks.length === 0 ? (
                            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                                <TruckIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 0.5 }} />
                                <Typography color="text.secondary">Sin camiones configurados.</Typography>
                            </Paper>
                        ) : (
                            <>
                                {/* Desktop: DataGrid */}
                                <Card variant="outlined" sx={{ display: { xs: 'none', md: 'block' }, borderRadius: 2 }}>
                                    <DataGrid
                                        rows={trucks}
                                        columns={truckColumns}
                                        autoHeight
                                        hideFooter
                                        disableRowSelectionOnClick
                                        sx={{
                                            border: 0,
                                            '& .MuiDataGrid-cell': { fontSize: '0.875rem', py: 1 },
                                            '& .MuiDataGrid-columnHeaders': {
                                                backgroundColor: theme.palette.action.hover,
                                                fontWeight: 600,
                                            },
                                        }}
                                    />
                                </Card>

                                {/* Mobile: cards en grid */}
                                <Grid container spacing={1} sx={{ display: { xs: 'flex', md: 'none' } }}>
                                    {trucks.map((truck) => (
                                        <Grid item xs={12} sm={6} key={truck.id}>
                                            <Paper variant="outlined" sx={{
                                                p: 1.5, borderRadius: 2,
                                                opacity: truck.is_active ? 1 : 0.55,
                                                borderColor: truck.is_active ? 'primary.main' : 'divider',
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    <Chip label={truck.code} size="small" color="primary"
                                                        sx={{ fontWeight: 700, fontFamily: 'monospace' }} />
                                                    <Typography variant="body2" fontFamily="monospace" fontWeight={600} sx={{ ml: 0.5 }}>
                                                        {truck.plate}
                                                    </Typography>
                                                    <Switch size="small" checked={truck.is_active}
                                                        onChange={() => handleToggleTruck(truck)} sx={{ ml: 'auto' }} />
                                                </Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                    {truck.pallet_type === 'HALF' ? 'Media tarima' : 'Estándar'} · {truck.pallet_spaces} espacios
                                                </Typography>
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.25 }}>
                                                    <IconButton size="small" onClick={() => handleOpenTruckDialog(truck)} sx={{ p: 0.5 }}>
                                                        <EditIcon sx={{ fontSize: '1rem' }} />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => handleDeleteTruck(truck.id)} sx={{ p: 0.5 }}>
                                                        <DeleteIcon sx={{ fontSize: '1rem' }} />
                                                    </IconButton>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </>
                        )}
                    </Box>
                )}

                {/* Bays tab */}
                {tabIndex === 3 && (
                    <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                {bays.length} bahía{bays.length === 1 ? '' : 's'} · {bays.filter((b) => b.is_active).length} activa{bays.filter((b) => b.is_active).length === 1 ? '' : 's'}
                            </Typography>
                            <Button
                                startIcon={<AddIcon />}
                                variant="contained"
                                size="small"
                                onClick={() => handleOpenBayDialog()}
                                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                            >
                                Agregar Bahía
                            </Button>
                        </Box>

                        {/* Layout editor */}
                        <Box sx={{ mb: 3, overflowX: 'auto' }}>
                            {loadingBays ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : (
                                <BayGridEditor
                                    bays={bays}
                                    onSave={handleSaveLayout}
                                    saving={savingLayout}
                                    dockPosition={dockPosition}
                                    onDockPositionChange={handleDockChange}
                                />
                            )}
                        </Box>

                        {/* Lista en grid de cards — responsive, aprovecha espacio en mobile */}
                        {loadingBays ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
                        ) : bays.length === 0 ? (
                            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                                <BayIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 0.5 }} />
                                <Typography color="text.secondary">Sin bahías configuradas.</Typography>
                            </Paper>
                        ) : (
                            <>
                                {/* Mobile: grid 2-col compact cards */}
                                <Grid
                                    container
                                    spacing={1}
                                    sx={{ display: { xs: 'flex', md: 'none' } }}
                                >
                                    {bays.map((bay) => (
                                        <Grid item xs={6} sm={4} key={bay.id}>
                                            <Paper variant="outlined" sx={{
                                                p: 1.25,
                                                borderRadius: 2,
                                                display: 'flex', flexDirection: 'column', gap: 0.5,
                                                opacity: bay.is_active ? 1 : 0.55,
                                                borderColor: bay.is_active ? 'primary.main' : 'divider',
                                                borderWidth: bay.is_active ? 1.5 : 1,
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                    <Chip label={bay.code} size="small" color="primary"
                                                        sx={{ fontWeight: 700, fontFamily: 'monospace' }} />
                                                    <Switch size="small" checked={bay.is_active}
                                                        onChange={() => handleToggleBay(bay)} sx={{ ml: 'auto' }} />
                                                </Box>
                                                <Typography variant="body2" fontWeight={600}
                                                    sx={{ fontSize: '0.8rem', minHeight: '1.3em' }} noWrap>
                                                    {bay.name}
                                                </Typography>
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.25, mt: 'auto' }}>
                                                    <IconButton size="small" onClick={() => handleOpenBayDialog(bay)} sx={{ p: 0.5 }}>
                                                        <EditIcon sx={{ fontSize: '1rem' }} />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => handleDeleteBay(bay.id)} sx={{ p: 0.5 }}>
                                                        <DeleteIcon sx={{ fontSize: '1rem' }} />
                                                    </IconButton>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Desktop: list rows, una bahía por línea */}
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        display: { xs: 'none', md: 'block' },
                                        borderRadius: 2, overflow: 'hidden',
                                    }}
                                >
                                    {/* Header */}
                                    <Box sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '100px 1fr 100px 120px',
                                        alignItems: 'center',
                                        px: 2, py: 1,
                                        bgcolor: 'action.hover',
                                        borderBottom: 1, borderColor: 'divider',
                                    }}>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary">CÓDIGO</Typography>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary">NOMBRE</Typography>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" textAlign="center">ACTIVA</Typography>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" textAlign="right">ACCIONES</Typography>
                                    </Box>
                                    {bays.map((bay, i) => (
                                        <Box key={bay.id} sx={{
                                            display: 'grid',
                                            gridTemplateColumns: '100px 1fr 100px 120px',
                                            alignItems: 'center',
                                            px: 2, py: 1.25,
                                            borderBottom: i < bays.length - 1 ? 1 : 0,
                                            borderColor: 'divider',
                                            opacity: bay.is_active ? 1 : 0.55,
                                            transition: 'background-color .15s ease',
                                            '&:hover': { bgcolor: 'action.hover' },
                                        }}>
                                            <Chip
                                                label={bay.code}
                                                size="small"
                                                color="primary"
                                                sx={{ fontWeight: 700, fontFamily: 'monospace', width: 'fit-content' }}
                                            />
                                            <Typography variant="body2" fontWeight={600} noWrap>{bay.name}</Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                <Switch size="small" checked={bay.is_active} onChange={() => handleToggleBay(bay)} />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                <IconButton size="small" onClick={() => handleOpenBayDialog(bay)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteBay(bay.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    ))}
                                </Paper>
                            </>
                        )}
                    </Box>
                )}

                {tabIndex === 4 && (
                    <TvSessionsTab
                        distributorCenterId={dc.id}
                        distributorCenterName={dc.name}
                    />
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

            {/* Shift Dialog */}
            <Dialog open={shiftDialogOpen} onClose={() => !creatingShift && !updatingShift && setShiftDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>{editingShift ? 'Editar Turno' : 'Agregar Turno'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Nombre del turno"
                            placeholder="Ej. TA, TB, TC"
                            size="small"
                            value={shiftForm.shift_name}
                            onChange={(e) => setShiftForm((f) => ({ ...f, shift_name: e.target.value.toUpperCase() }))}
                            fullWidth
                            inputProps={{ maxLength: 10 }}
                        />
                        <TextField
                            select SelectProps={{ native: true }}
                            label="Día de la semana"
                            size="small" fullWidth
                            value={shiftForm.day_of_week}
                            onChange={(e) => setShiftForm((f) => ({ ...f, day_of_week: e.target.value }))}
                        >
                            <option value="MON">Lunes</option>
                            <option value="TUE">Martes</option>
                            <option value="WED">Miércoles</option>
                            <option value="THU">Jueves</option>
                            <option value="FRI">Viernes</option>
                            <option value="SAT">Sábado</option>
                            <option value="SUN">Domingo</option>
                        </TextField>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                type="time" label="Inicio" size="small" fullWidth
                                value={shiftForm.start_time}
                                onChange={(e) => setShiftForm((f) => ({ ...f, start_time: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                type="time" label="Fin" size="small" fullWidth
                                value={shiftForm.end_time}
                                onChange={(e) => setShiftForm((f) => ({ ...f, end_time: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                        {shiftForm.start_time > shiftForm.end_time && (
                            <Alert severity="info" sx={{ py: 0.5 }}>
                                Este turno cruza medianoche (termina al día siguiente).
                            </Alert>
                        )}
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={shiftForm.is_active}
                                    onChange={(e) => setShiftForm((f) => ({ ...f, is_active: e.target.checked }))}
                                />
                            }
                            label="Activo"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShiftDialogOpen(false)} disabled={creatingShift || updatingShift}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveShift}
                        disabled={creatingShift || updatingShift}
                    >
                        {(creatingShift || updatingShift) ? <CircularProgress size={18} color="inherit" /> : (editingShift ? 'Guardar' : 'Crear')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
