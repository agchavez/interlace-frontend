import { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    Chip,
    Avatar,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Switch,
    Menu,
    MenuItem,
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
    useGetBaysQuery,
    useCreateBayMutation,
    useUpdateBayMutation,
    useDeleteBayMutation,
} from '../services/truckCycleApi';
import { useGetDistributorCentersQuery } from '../../../store/maintenance/maintenanceApi';
import { useAppSelector } from '../../../store';
import type { Bay } from '../interfaces/truckCycle';
import BayGridEditor from '../components/BayGridEditor';
import type { DockPosition } from '../components/BayGridPicker';

interface BayFormData {
    code: string;
    name: string;
    is_active: boolean;
}

const emptyForm: BayFormData = {
    code: '',
    name: '',
    is_active: true,
};

export default function BayManagementPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const user = useAppSelector((state) => state.auth.user);
    const cdName = user?.centro_distribucion_name || '';
    const { data: dcData } = useGetDistributorCentersQuery({ limit: 100, offset: 0, search: '' });
    const currentDc = dcData?.results?.find((d) => d.id === user?.centro_distribucion);
    const flagCode = currentDc?.data_country?.flag?.toLowerCase();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBay, setEditingBay] = useState<Bay | null>(null);
    const [form, setForm] = useState<BayFormData>(emptyForm);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [menuRow, setMenuRow] = useState<Bay | null>(null);

    const { data, isLoading, error } = useGetBaysQuery();
    const [createBay, { isLoading: creating }] = useCreateBayMutation();
    const [updateBay, { isLoading: updating }] = useUpdateBayMutation();
    const [deleteBay] = useDeleteBayMutation();

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, row: Bay) => {
        setAnchorEl(event.currentTarget);
        setMenuRow(row);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setMenuRow(null);
    };

    const handleOpenCreate = () => {
        setEditingBay(null);
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const handleOpenEdit = (bay: Bay) => {
        setEditingBay(bay);
        setForm({
            code: bay.code,
            name: bay.name,
            is_active: bay.is_active,
        });
        setDialogOpen(true);
        handleCloseMenu();
    };

    const handleSave = async () => {
        try {
            if (editingBay) {
                await updateBay({ id: editingBay.id, data: form }).unwrap();
            } else {
                await createBay(form).unwrap();
            }
            setDialogOpen(false);
        } catch {
            // Error handled by RTK Query
        }
    };

    const handleDelete = async (id: number) => {
        handleCloseMenu();
        if (window.confirm('Desea eliminar esta bahia?')) {
            await deleteBay(id);
        }
    };

    const handleToggleActive = async (bay: Bay) => {
        await updateBay({ id: bay.id, data: { is_active: !bay.is_active } });
    };

    const dockStorageKey = `bayDock_${user?.centro_distribucion ?? 'default'}`;
    const [dockPosition, setDockPosition] = useState<DockPosition>(() => {
        const stored = typeof window !== 'undefined' ? window.localStorage.getItem(dockStorageKey) : null;
        return (stored === 'top' || stored === 'bottom' || stored === 'left' || stored === 'right') ? stored : 'top';
    });
    const handleDockChange = (d: DockPosition) => {
        setDockPosition(d);
        try { window.localStorage.setItem(dockStorageKey, d); } catch { /* ignore */ }
    };

    const [savingLayout, setSavingLayout] = useState(false);
    const handleSaveLayout = async (
        changes: Array<{ id: number; row: number; column: number }>,
    ) => {
        setSavingLayout(true);
        try {
            await Promise.all(
                changes.map((c) => updateBay({ id: c.id, data: { row: c.row, column: c.column } }).unwrap()),
            );
        } finally {
            setSavingLayout(false);
        }
    };

    const columns: GridColDef[] = [
        { field: 'code', headerName: 'Código', flex: 1, minWidth: 100 },
        { field: 'name', headerName: 'Nombre', flex: 1.5, minWidth: 150 },
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
                <Alert severity="error">Error al cargar bahías.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={400}>
                        Gestión de Bahías
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Administre las bahías de carga disponibles en el centro de distribución
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                >
                    Nueva Bahía
                </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
                <strong>Centro de Distribución:</strong> Las bahías mostradas corresponden al centro de distribución activo. Cada bahía se asigna a una pauta durante el proceso de carga.
            </Alert>

            {/* Layout visual drag-and-drop */}
            <Box sx={{ mb: 3 }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <BayGridEditor
                        bays={data?.results || []}
                        onSave={handleSaveLayout}
                        saving={savingLayout}
                        dockPosition={dockPosition}
                        onDockPositionChange={handleDockChange}
                    />
                )}
            </Box>

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
                <BootstrapDialogTitle id="bay-dialog" onClose={() => setDialogOpen(false)}>
                    {editingBay ? 'Editar Bahía' : 'Nueva Bahía'}
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
                                helperText="Ej: B-01, B-02"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Nombre"
                                size="small"
                                fullWidth
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                helperText="Nombre descriptivo de la bahía"
                                required
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
                        {editingBay ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </Box>
    );
}
