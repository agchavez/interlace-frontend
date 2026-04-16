import { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Chip,
    Avatar,
    Switch,
    Menu,
    ListItemIcon,
    ListItemText,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material';
import BootstrapDialogTitle from '../../ui/components/BootstrapDialogTitle';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
    useGetTrucksQuery,
    useCreateTruckMutation,
    useUpdateTruckMutation,
    useDeleteTruckMutation,
} from '../services/truckCycleApi';
import { useGetDistributorCentersQuery } from '../../../store/maintenance/maintenanceApi';
import { useAppSelector } from '../../../store';
import type { Truck } from '../interfaces/truckCycle';

interface TruckFormData {
    code: string;
    plate: string;
    pallet_type: 'STANDARD' | 'HALF';
    pallet_spaces: number;
    is_active: boolean;
}

const emptyForm: TruckFormData = {
    code: '',
    plate: '',
    pallet_type: 'STANDARD',
    pallet_spaces: 0,
    is_active: true,
};

export default function TruckCatalogPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const user = useAppSelector((state) => state.auth.user);
    const cdName = user?.centro_distribucion_name || '';
    const { data: dcData } = useGetDistributorCentersQuery({ limit: 100, offset: 0, search: '' });
    const currentDc = dcData?.results?.find((d) => d.id === user?.centro_distribucion);
    const flagCode = currentDc?.data_country?.flag?.toLowerCase();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
    const [form, setForm] = useState<TruckFormData>(emptyForm);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [menuRow, setMenuRow] = useState<Truck | null>(null);

    const { data, isLoading, error } = useGetTrucksQuery();
    const [createTruck, { isLoading: creating }] = useCreateTruckMutation();
    const [updateTruck, { isLoading: updating }] = useUpdateTruckMutation();
    const [deleteTruck] = useDeleteTruckMutation();

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, row: Truck) => {
        setAnchorEl(event.currentTarget);
        setMenuRow(row);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setMenuRow(null);
    };

    const handleOpenCreate = () => {
        setEditingTruck(null);
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const handleOpenEdit = (truck: Truck) => {
        setEditingTruck(truck);
        setForm({
            code: truck.code,
            plate: truck.plate,
            pallet_type: truck.pallet_type,
            pallet_spaces: truck.pallet_spaces,
            is_active: truck.is_active,
        });
        setDialogOpen(true);
        handleCloseMenu();
    };

    const handleSave = async () => {
        try {
            if (editingTruck) {
                await updateTruck({ id: editingTruck.id, data: form }).unwrap();
            } else {
                await createTruck(form).unwrap();
            }
            setDialogOpen(false);
        } catch {
            // Error handled by RTK Query
        }
    };

    const handleDelete = async (id: number) => {
        handleCloseMenu();
        if (window.confirm('Desea eliminar este camion?')) {
            await deleteTruck(id);
        }
    };

    const handleToggleActive = async (truck: Truck) => {
        await updateTruck({ id: truck.id, data: { is_active: !truck.is_active } });
    };

    const columns: GridColDef[] = [
        { field: 'code', headerName: 'Código', flex: 1, minWidth: 100 },
        { field: 'plate', headerName: 'Placa', flex: 1, minWidth: 100 },
        {
            field: 'distributor_center',
            headerName: 'Centro de Distribución',
            flex: 1.2,
            minWidth: 180,
            renderCell: () => (
                <Chip
                    label={cdName || '-'}
                    size="small"
                    variant="outlined"
                    avatar={flagCode ? (
                        <Avatar
                            src={`https://flagcdn.com/w40/${flagCode}.png`}
                            alt={cdName}
                            sx={{ width: 20, height: 14 }}
                        />
                    ) : undefined}
                />
            ),
        },
        {
            field: 'pallet_type',
            headerName: 'Tipo Pallet',
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value === 'STANDARD' ? 'Estándar' : 'Medio'}
                    size="small"
                />
            ),
        },
        { field: 'pallet_spaces', headerName: 'Espacios', type: 'number', flex: 0.7, minWidth: 90 },
        {
            field: 'is_active',
            headerName: 'Activo',
            flex: 0.7,
            minWidth: 80,
            renderCell: (params) => (
                <Switch
                    checked={params.value}
                    onChange={() => handleToggleActive(params.row)}
                    size="small"
                />
            ),
        },
        {
            field: 'actions',
            headerName: '',
            width: 60,
            sortable: false,
            renderCell: (params) => (
                <IconButton size="small" onClick={(e) => handleOpenMenu(e, params.row)}>
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            ),
        },
    ];

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Error al cargar camiones.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={400}>
                        Catálogo de Camiones
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Gestione los camiones disponibles para el ciclo de distribución del centro actual
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                >
                    Nuevo Camión
                </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
                <strong>Centro de Distribución:</strong> Los camiones mostrados corresponden al centro de distribución activo. Cambie de centro para ver camiones de otra localidad.
            </Alert>

            <Card>
                        <DataGrid
                            rows={data?.results || []}
                            columns={columns}
                            loading={isLoading}
                            pageSizeOptions={[10, 25, 50]}
                            disableRowSelectionOnClick
                            autoHeight
                            sx={{
                                border: 0,
                                '& .MuiDataGrid-cell': { py: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: 'rgba(0,0,0,0.02)',
                                    fontWeight: 600,
                                },
                            }}
                            slots={{
                                noRowsOverlay: () => (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                        <Typography color="text.secondary">No se encontraron registros.</Typography>
                                    </Box>
                                ),
                            }}
                        />
                    </Card>

            {/* Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                PaperProps={{ elevation: 3, sx: { minWidth: 200, borderRadius: 2, mt: 1 } }}
            >
                <MenuItem onClick={() => menuRow && handleOpenEdit(menuRow)}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Editar</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => menuRow && handleDelete(menuRow.id)}>
                    <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                    <ListItemText>Eliminar</ListItemText>
                </MenuItem>
            </Menu>

            {/* Create/Edit Dialog */}
            <BootstrapDialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <BootstrapDialogTitle id="truck-dialog" onClose={() => setDialogOpen(false)}>
                    {editingTruck ? 'Editar Camión' : 'Nuevo Camión'}
                </BootstrapDialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Código"
                                size="small"
                                fullWidth
                                value={form.code}
                                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                                helperText="Ej: C-101, C-102"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Placa"
                                size="small"
                                fullWidth
                                value={form.plate}
                                onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value }))}
                                helperText="Ej: PBR-4521"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Tipo de Pallet"
                                size="small"
                                fullWidth
                                value={form.pallet_type}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, pallet_type: e.target.value as 'STANDARD' | 'HALF' }))
                                }
                                helperText="Tipo de pallet que transporta"
                            >
                                <MenuItem value="STANDARD">Estándar</MenuItem>
                                <MenuItem value="HALF">Medio</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Espacios de Pallet"
                                size="small"
                                fullWidth
                                type="number"
                                value={form.pallet_spaces}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, pallet_spaces: parseInt(e.target.value, 10) || 0 }))
                                }
                                helperText="Cantidad de pallets que caben"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={creating || updating}
                    >
                        {editingTruck ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </Box>
    );
}
