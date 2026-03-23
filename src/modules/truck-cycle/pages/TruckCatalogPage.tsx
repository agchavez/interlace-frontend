import { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
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
    Switch,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
    useGetTrucksQuery,
    useCreateTruckMutation,
    useUpdateTruckMutation,
    useDeleteTruckMutation,
} from '../services/truckCycleApi';
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
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
    const [form, setForm] = useState<TruckFormData>(emptyForm);

    const { data, isLoading, error } = useGetTrucksQuery();
    const [createTruck, { isLoading: creating }] = useCreateTruckMutation();
    const [updateTruck, { isLoading: updating }] = useUpdateTruckMutation();
    const [deleteTruck] = useDeleteTruckMutation();

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
        if (window.confirm('Desea eliminar este camion?')) {
            await deleteTruck(id);
        }
    };

    const handleToggleActive = async (truck: Truck) => {
        await updateTruck({ id: truck.id, data: { is_active: !truck.is_active } });
    };

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
                <Typography variant="h5" fontWeight={600}>
                    Catalogo de Camiones
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    Agregar Camion
                </Button>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Codigo</TableCell>
                                <TableCell>Placa</TableCell>
                                <TableCell>Tipo Pallet</TableCell>
                                <TableCell align="right">Espacios</TableCell>
                                <TableCell>Activo</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data?.results.map((truck) => (
                                <TableRow key={truck.id}>
                                    <TableCell>{truck.code}</TableCell>
                                    <TableCell>{truck.plate}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={truck.pallet_type === 'STANDARD' ? 'Estandar' : 'Medio'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">{truck.pallet_spaces}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={truck.is_active}
                                            onChange={() => handleToggleActive(truck)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => handleOpenEdit(truck)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(truck.id)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {data?.results.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography color="text.secondary" sx={{ py: 2 }}>
                                            No hay camiones registrados.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingTruck ? 'Editar Camion' : 'Nuevo Camion'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Codigo"
                            size="small"
                            fullWidth
                            value={form.code}
                            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                        />
                        <TextField
                            label="Placa"
                            size="small"
                            fullWidth
                            value={form.plate}
                            onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value }))}
                        />
                        <TextField
                            select
                            label="Tipo de Pallet"
                            size="small"
                            fullWidth
                            value={form.pallet_type}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, pallet_type: e.target.value as 'STANDARD' | 'HALF' }))
                            }
                        >
                            <MenuItem value="STANDARD">Estandar</MenuItem>
                            <MenuItem value="HALF">Medio</MenuItem>
                        </TextField>
                        <TextField
                            label="Espacios de Pallet"
                            size="small"
                            fullWidth
                            type="number"
                            value={form.pallet_spaces}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, pallet_spaces: parseInt(e.target.value, 10) || 0 }))
                            }
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={creating || updating}
                    >
                        {creating || updating ? <CircularProgress size={20} /> : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
