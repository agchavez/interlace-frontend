import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    MenuItem,
    Grid,
    Card,
    Alert,
    TextField,
    Button,
    IconButton,
    Menu,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Tooltip,
    Avatar,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Visibility as ViewIcon,
    FileDownload as ExcelIcon,
    PictureAsPdf as PdfIcon,
    LocalShipping as TruckIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers';
import { format, isValid, parseISO } from 'date-fns';
import { toast } from 'sonner';
import PautaStatusBadge from '../components/PautaStatusBadge';
import { useGetPautasQuery } from '../services/truckCycleApi';
import { useAppSelector } from '../../../store';
import type { PautaFilterParams, PautaStatus, PautaListItem } from '../interfaces/truckCycle';

const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'PENDING_PICKING', label: 'Pendiente de Picking' },
    { value: 'PICKING_ASSIGNED', label: 'Picker Asignado' },
    { value: 'PICKING_IN_PROGRESS', label: 'Picking en Progreso' },
    { value: 'PICKING_DONE', label: 'Picking Completado' },
    { value: 'IN_BAY', label: 'En Bahía' },
    { value: 'PENDING_COUNT', label: 'Pendiente de Conteo' },
    { value: 'COUNTING', label: 'En Conteo' },
    { value: 'COUNTED', label: 'Contado' },
    { value: 'PENDING_CHECKOUT', label: 'Pendiente de Checkout' },
    { value: 'DISPATCHED', label: 'Despachado' },
    { value: 'CLOSED', label: 'Cerrada' },
    { value: 'CANCELLED', label: 'Cancelada' },
];

export default function PautaListPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const navigate = useNavigate();
    const authToken = useAppSelector((state) => state.auth.token);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
    const [filters, setFilters] = useState<PautaFilterParams>({});
    const [exportLoading, setExportLoading] = useState<'excel' | 'pdf' | null>(null);

    // Row action menu
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedRow, setSelectedRow] = useState<PautaListItem | null>(null);

    const { data, isLoading, error } = useGetPautasQuery({
        ...filters,
        limit: paginationModel.pageSize,
        offset: paginationModel.page * paginationModel.pageSize,
    });

    const handleFilterChange = (field: keyof PautaFilterParams, value: string) => {
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
        setFilters((prev) => ({ ...prev, [field]: value || undefined }));
    };

    const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLElement>, row: PautaListItem) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedRow(row);
    }, []);

    const handleCloseMenu = useCallback(() => {
        setAnchorEl(null);
        setSelectedRow(null);
    }, []);

    const handleExport = async (type: 'excel' | 'pdf') => {
        setExportLoading(type);
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.transport_number) params.append('transport_number', filters.transport_number);
            if (filters.operational_date_after) params.append('operational_date_after', filters.operational_date_after);
            if (filters.operational_date_before) params.append('operational_date_before', filters.operational_date_before);

            const endpoint = type === 'excel' ? 'export_excel' : 'export_pdf';
            const response = await fetch(
                `${import.meta.env.VITE_JS_APP_API_URL}/api/truck-cycle-pauta/${endpoint}/?${params.toString()}`,
                { headers: { 'Authorization': `Bearer ${authToken}` } },
            );
            if (!response.ok) throw new Error('Error en la exportación');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `pautas.${type === 'excel' ? 'xlsx' : 'pdf'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success(`Exportación ${type.toUpperCase()} descargada`);
        } catch {
            toast.error('Error al exportar');
        } finally {
            setExportLoading(null);
        }
    };

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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                            <TruckIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Box sx={{ overflow: 'hidden' }}>
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
                    headerName: 'Camión',
                    flex: 1,
                    minWidth: 150,
                    renderCell: (params: GridRenderCellParams) => (
                        <Typography variant="body2" noWrap>
                            {params.row.truck_code || '?'} - {params.row.truck_plate}
                        </Typography>
                    ),
                },
                {
                    field: 'total_boxes',
                    headerName: 'Cajas',
                    type: 'number',
                    width: 80,
                    align: 'right',
                    headerAlign: 'right',
                },
            );

            if (!isTablet) {
                cols.push(
                    {
                        field: 'total_skus',
                        headerName: 'SKUs',
                        type: 'number',
                        width: 80,
                        align: 'right',
                        headerAlign: 'right',
                    },
                    {
                        field: 'operational_date',
                        headerName: 'Fecha',
                        width: 110,
                    },
                );
            }

            cols.push({
                field: 'status',
                headerName: 'Estado',
                width: 180,
                renderCell: (params) => <PautaStatusBadge status={params.value as PautaStatus} />,
            });
        }

        // Actions column
        cols.push({
            field: 'actions',
            headerName: '',
            width: 50,
            sortable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <IconButton size="small" onClick={(e) => handleOpenMenu(e, params.row)}>
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            ),
        });

        return cols;
    }, [isMobile, isTablet, handleOpenMenu]);

    if (error) {
        return (
            <Container maxWidth="xl" sx={{ mt: 2 }}>
                <Alert severity="error">Error al cargar las pautas.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
                {/* Header */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                        <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                            Listado de Pautas
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Exportar Excel">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={exportLoading === 'excel' ? <CircularProgress size={16} /> : <ExcelIcon />}
                                    onClick={() => handleExport('excel')}
                                    disabled={!!exportLoading}
                                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                                >
                                    Excel
                                </Button>
                            </Tooltip>
                            <Tooltip title="Exportar PDF">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={exportLoading === 'pdf' ? <CircularProgress size={16} /> : <PdfIcon />}
                                    onClick={() => handleExport('pdf')}
                                    disabled={!!exportLoading}
                                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                                >
                                    PDF
                                </Button>
                            </Tooltip>
                            {/* Mobile: icon-only export buttons */}
                            <Tooltip title="Exportar Excel">
                                <IconButton
                                    size="small"
                                    onClick={() => handleExport('excel')}
                                    disabled={!!exportLoading}
                                    sx={{ display: { xs: 'flex', sm: 'none' } }}
                                >
                                    {exportLoading === 'excel' ? <CircularProgress size={18} /> : <ExcelIcon />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Exportar PDF">
                                <IconButton
                                    size="small"
                                    onClick={() => handleExport('pdf')}
                                    disabled={!!exportLoading}
                                    sx={{ display: { xs: 'flex', sm: 'none' } }}
                                >
                                    {exportLoading === 'pdf' ? <CircularProgress size={18} /> : <PdfIcon />}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Grid>

                {/* Filters */}
                <Grid item xs={12}>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                        <TextField
                            select
                            size="small"
                            label="Estado"
                            value={filters.status || ''}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            sx={{ minWidth: { xs: '100%', sm: 200 } }}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            size="small"
                            label="No. Transporte"
                            value={filters.transport_number || ''}
                            onChange={(e) => handleFilterChange('transport_number', e.target.value)}
                            sx={{ minWidth: { xs: '100%', sm: 180 } }}
                        />
                        <DatePicker
                            label="Fecha desde"
                            value={filters.operational_date_after ? parseISO(filters.operational_date_after) : null}
                            onChange={(v) => handleFilterChange('operational_date_after', v && isValid(v) ? format(v, 'yyyy-MM-dd') : '')}
                            slotProps={{ textField: { size: 'small', sx: { minWidth: { xs: '100%', sm: 160 } } } }}
                        />
                        <DatePicker
                            label="Fecha hasta"
                            value={filters.operational_date_before ? parseISO(filters.operational_date_before) : null}
                            onChange={(v) => handleFilterChange('operational_date_before', v && isValid(v) ? format(v, 'yyyy-MM-dd') : '')}
                            slotProps={{ textField: { size: 'small', sx: { minWidth: { xs: '100%', sm: 160 } } } }}
                        />
                    </Box>
                </Grid>

                {/* DataGrid */}
                <Grid item xs={12}>
                    <Card variant="outlined">
                        <DataGrid
                            rows={data?.results || []}
                            columns={columns}
                            rowCount={data?.count || 0}
                            loading={isLoading}
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            paginationMode="server"
                            pageSizeOptions={[10, 25, 50]}
                            disableRowSelectionOnClick
                            autoHeight
                            rowHeight={isMobile ? 80 : 52}
                            onRowClick={(params) => navigate(`/truck-cycle/pautas/${params.row.id}`)}
                            sx={{
                                border: 0,
                                cursor: 'pointer',
                                '& .MuiDataGrid-cell': {
                                    py: 1,
                                    fontSize: isMobile ? '0.8125rem' : '0.875rem',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
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
                </Grid>
            </Grid>

            {/* Row Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        minWidth: 180,
                        borderRadius: 2,
                        '& .MuiMenuItem-root': { px: 2, py: 1.5, borderRadius: 1, mx: 1, my: 0.5 },
                    },
                }}
            >
                <MenuItem onClick={() => { if (selectedRow) navigate(`/truck-cycle/pautas/${selectedRow.id}`); handleCloseMenu(); }}>
                    <ListItemIcon><ViewIcon fontSize="small" color="primary" /></ListItemIcon>
                    <ListItemText>Ver Detalle</ListItemText>
                </MenuItem>
            </Menu>
        </Container>
    );
}
