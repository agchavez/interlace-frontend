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
    IconButton,
    Switch,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
    useGetBaysQuery,
    useCreateBayMutation,
    useUpdateBayMutation,
    useDeleteBayMutation,
} from '../services/truckCycleApi';
import type { Bay } from '../interfaces/truckCycle';

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
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBay, setEditingBay] = useState<Bay | null>(null);
    const [form, setForm] = useState<BayFormData>(emptyForm);

    const { data, isLoading, error } = useGetBaysQuery();
    const [createBay, { isLoading: creating }] = useCreateBayMutation();
    const [updateBay, { isLoading: updating }] = useUpdateBayMutation();
    const [deleteBay] = useDeleteBayMutation();

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
        if (window.confirm('Desea eliminar esta bahia?')) {
            await deleteBay(id);
        }
    };

    const handleToggleActive = async (bay: Bay) => {
        await updateBay({ id: bay.id, data: { is_active: !bay.is_active } });
    };

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Error al cargar bahias.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight={600}>
                    Gestion de Bahias
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    Agregar Bahia
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
                                <TableCell>Nombre</TableCell>
                                <TableCell>Activo</TableCell>
                                <TableCell>Fecha Creacion</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data?.results.map((bay) => (
                                <TableRow key={bay.id}>
                                    <TableCell>{bay.code}</TableCell>
                                    <TableCell>{bay.name}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={bay.is_active}
                                            onChange={() => handleToggleActive(bay)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{new Date(bay.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => handleOpenEdit(bay)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(bay.id)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {data?.results.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography color="text.secondary" sx={{ py: 2 }}>
                                            No hay bahias registradas.
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
                <DialogTitle>{editingBay ? 'Editar Bahia' : 'Nueva Bahia'}</DialogTitle>
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
                            label="Nombre"
                            size="small"
                            fullWidth
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
