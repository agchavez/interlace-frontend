import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    MenuItem,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    CircularProgress,
    Alert,
} from '@mui/material';
import PautaStatusBadge from '../components/PautaStatusBadge';
import { useGetPautasQuery } from '../services/truckCycleApi';
import type { PautaFilterParams, PautaStatus } from '../interfaces/truckCycle';

const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'PENDING_PICKING', label: 'Pendiente de Picking' },
    { value: 'PICKING_ASSIGNED', label: 'Picker Asignado' },
    { value: 'PICKING_IN_PROGRESS', label: 'Picking en Progreso' },
    { value: 'PICKING_DONE', label: 'Picking Completado' },
    { value: 'IN_BAY', label: 'En Bahia' },
    { value: 'PENDING_COUNT', label: 'Pendiente de Conteo' },
    { value: 'COUNTING', label: 'En Conteo' },
    { value: 'COUNTED', label: 'Contado' },
    { value: 'PENDING_CHECKOUT', label: 'Pendiente de Checkout' },
    { value: 'DISPATCHED', label: 'Despachado' },
    { value: 'CLOSED', label: 'Cerrada' },
    { value: 'CANCELLED', label: 'Cancelada' },
];

export default function PautaListPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [filters, setFilters] = useState<PautaFilterParams>({});

    const { data, isLoading, error } = useGetPautasQuery({
        ...filters,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
    });

    const handleFilterChange = (field: keyof PautaFilterParams, value: string) => {
        setPage(0);
        setFilters((prev) => ({
            ...prev,
            [field]: value || undefined,
        }));
    };

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Error al cargar las pautas.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                Listado de Pautas
            </Typography>

            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        label="Estado"
                        value={filters.status || ''}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        size="small"
                        label="No. Transporte"
                        value={filters.transport_number || ''}
                        onChange={(e) => handleFilterChange('transport_number', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        type="date"
                        fullWidth
                        size="small"
                        label="Fecha desde"
                        InputLabelProps={{ shrink: true }}
                        value={filters.operational_date_after || ''}
                        onChange={(e) => handleFilterChange('operational_date_after', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        type="date"
                        fullWidth
                        size="small"
                        label="Fecha hasta"
                        InputLabelProps={{ shrink: true }}
                        value={filters.operational_date_before || ''}
                        onChange={(e) => handleFilterChange('operational_date_before', e.target.value)}
                    />
                </Grid>
            </Grid>

            {/* Table */}
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper variant="outlined">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Transporte</TableCell>
                                    <TableCell>Viaje</TableCell>
                                    <TableCell>Camion</TableCell>
                                    <TableCell align="right">Cajas</TableCell>
                                    <TableCell align="right">SKUs</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell>Fecha</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data?.results.map((pauta) => (
                                    <TableRow
                                        key={pauta.id}
                                        hover
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/truck-cycle/pautas/${pauta.id}`)}
                                    >
                                        <TableCell>{pauta.transport_number}</TableCell>
                                        <TableCell>{pauta.trip_number}</TableCell>
                                        <TableCell>
                                            {pauta.truck_code} - {pauta.truck_plate}
                                        </TableCell>
                                        <TableCell align="right">{pauta.total_boxes}</TableCell>
                                        <TableCell align="right">{pauta.total_skus}</TableCell>
                                        <TableCell>
                                            <PautaStatusBadge status={pauta.status as PautaStatus} />
                                        </TableCell>
                                        <TableCell>{pauta.operational_date}</TableCell>
                                    </TableRow>
                                ))}
                                {data?.results.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Typography color="text.secondary" sx={{ py: 2 }}>
                                                No se encontraron pautas.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={data?.count || 0}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[10, 25, 50]}
                        labelRowsPerPage="Filas por pagina:"
                    />
                </Paper>
            )}
        </Box>
    );
}
