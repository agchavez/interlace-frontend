import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Alert,
    Button,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Avatar,
    Divider,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Visibility as ViewIcon,
    FileDownload as ExportIcon,
    GridOn as GridOnIcon,
    PictureAsPdf as PictureAsPdfIcon,
    LocalShipping as TruckIcon,
    FilterListTwoTone as FilterIcon,
    ContentCopy as CopyIcon,
    Assignment as TotalIcon,
    HourglassEmpty as HourglassIcon,
    CheckCircle as DispatchedIcon,
    Cancel as CancelledIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';
import { toast } from 'sonner';
import PautaStatusBadge from '../components/PautaStatusBadge';
import { PautaFilters } from '../components/PautaFilters';
import ChipFilterCategory from '../../ui/components/ChipFilter';
import { useGetPautasQuery } from '../services/truckCycleApi';
import { useAppSelector } from '../../../store';
import type { PautaFilterParams, PautaStatus, PautaListItem } from '../interfaces/truckCycle';

const STATUS_LABELS: Record<string, string> = {
    PENDING_PICKING: 'Pendiente de Picking',
    PICKING_ASSIGNED: 'Picker Asignado',
    PICKING_IN_PROGRESS: 'Picking en Progreso',
    PICKING_DONE: 'Picking Completado',
    IN_BAY: 'En Bahia',
    PENDING_COUNT: 'Pendiente de Conteo',
    COUNTING: 'En Conteo',
    COUNTED: 'Contado',
    PENDING_CHECKOUT: 'Pendiente de Checkout',
    DISPATCHED: 'Despachado',
    CLOSED: 'Cerrada',
    CANCELLED: 'Cancelada',
};

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <Card elevation={3} sx={{ height: '100%', transition: 'all 0.3s ease-in-out', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgba(0,0,0,0.15)' } }}>
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

export default function PautaListPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isFullHD = useMediaQuery(theme.breakpoints.up('xl'));
    const navigate = useNavigate();
    const authToken = useAppSelector((state) => state.auth.token);

    const [openFilter, setOpenFilter] = useState(false);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
    const [filters, setFilters] = useState<PautaFilterParams>({});

    // Export
    const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
    const [exportingExcel, setExportingExcel] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);

    // Row action menu
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedRow, setSelectedRow] = useState<PautaListItem | null>(null);

    const { data, isLoading, isFetching, error } = useGetPautasQuery({
        ...filters,
        limit: paginationModel.pageSize,
        offset: paginationModel.page * paginationModel.pageSize,
    });

    const stats = useMemo(() => {
        if (!data?.results) return { total: 0, inProgress: 0, dispatched: 0, cancelled: 0 };
        return {
            total: data.count,
            inProgress: data.results.filter((p: PautaListItem) =>
                ['PENDING_PICKING', 'PICKING_ASSIGNED', 'PICKING_IN_PROGRESS', 'PICKING_DONE', 'IN_BAY', 'PENDING_COUNT', 'COUNTING', 'COUNTED', 'PENDING_CHECKOUT'].includes(p.status)
            ).length,
            dispatched: data.results.filter((p: PautaListItem) => p.status === 'DISPATCHED').length,
            cancelled: data.results.filter((p: PautaListItem) => ['CANCELLED', 'CLOSED'].includes(p.status)).length,
        };
    }, [data]);

    const handlePaginationChange = (model: GridPaginationModel) => {
        setPaginationModel(model);
    };

    const handleFilterChange = (newFilters: PautaFilterParams) => {
        setFilters(newFilters);
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
    };

    const clearFilter = (filterKey: string) => {
        const newFilters = { ...filters };
        switch (filterKey) {
            case 'status': delete newFilters.status; break;
            case 'transport_number': delete newFilters.transport_number; break;
            case 'operational_date_after': delete newFilters.operational_date_after; break;
            case 'operational_date_before': delete newFilters.operational_date_before; break;
        }
        setFilters(newFilters);
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

    const handleViewDetails = () => {
        if (selectedRow) navigate(`/truck-cycle/pautas/${selectedRow.id}`);
        handleCloseMenu();
    };

    const handleCopyCode = () => {
        if (selectedRow) {
            navigator.clipboard.writeText(String(selectedRow.transport_number));
            toast.success('Numero de transporte copiado');
        }
        handleCloseMenu();
    };

    // Export
    const buildExportParams = () => {
        const params = new URLSearchParams();
        if (filters.status) params.set('status', filters.status);
        if (filters.transport_number) params.set('transport_number', filters.transport_number);
        if (filters.operational_date_after) params.set('operational_date_after', filters.operational_date_after);
        if (filters.operational_date_before) params.set('operational_date_before', filters.operational_date_before);
        return params.toString();
    };

    const handleExportExcel = async () => {
        setExportingExcel(true);
        setExportMenuAnchor(null);
        try {
            const queryStr = buildExportParams();
            const res = await fetch(
                `${import.meta.env.VITE_JS_APP_API_URL}/api/truck-cycle-pauta/export_excel/?${queryStr}`,
                { headers: { Authorization: `Bearer ${authToken}` } },
            );
            if (!res.ok) throw new Error('Error al exportar');
            const blob = await res.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `pautas-${new Date().toISOString().slice(0, 10)}.xlsx`;
            link.click();
            URL.revokeObjectURL(link.href);
            toast.success('Exportacion Excel descargada');
        } catch {
            toast.error('Error al exportar');
        } finally {
            setExportingExcel(false);
        }
    };

    const handleExportPdf = async () => {
        setExportingPdf(true);
        setExportMenuAnchor(null);
        try {
            const queryStr = buildExportParams();
            const res = await fetch(
                `${import.meta.env.VITE_JS_APP_API_URL}/api/truck-cycle-pauta/export_pdf/?${queryStr}`,
                { headers: { Authorization: `Bearer ${authToken}` } },
            );
            if (!res.ok) throw new Error('Error al exportar');
            const blob = await res.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `pautas-${new Date().toISOString().slice(0, 10)}.pdf`;
            link.click();
            URL.revokeObjectURL(link.href);
            toast.success('Exportacion PDF descargada');
        } catch {
            toast.error('Error al exportar');
        } finally {
            setExportingPdf(false);
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
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                            <TruckIcon fontSize="small" />
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
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
                    renderCell: (params: GridRenderCellParams) => (
                        <Typography variant="body2" fontWeight={600}>
                            T-{params.value}
                        </Typography>
                    ),
                },
                {
                    field: 'trip_number',
                    headerName: 'Viaje',
                    width: 80,
                },
                {
                    field: 'truck_code',
                    headerName: 'Camion',
                    flex: 1,
                    minWidth: 150,
                    renderCell: (params: GridRenderCellParams) => (
                        <Box>
                            <Typography variant="body2" fontWeight={500}>
                                {params.row.truck_code || '?'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {params.row.truck_plate}
                            </Typography>
                        </Box>
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

        cols.push({
            field: 'actions',
            headerName: '',
            width: 60,
            sortable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <IconButton
                    size="small"
                    onClick={(e) => handleOpenMenu(e, params.row)}
                    sx={{ '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' } }}
                >
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
        <>
            <PautaFilters
                open={openFilter}
                handleClose={() => setOpenFilter(false)}
                handleFilter={handleFilterChange}
                filters={filters}
            />

            <Container maxWidth={isFullHD ? 'xl' : 'lg'} sx={{ marginTop: 2 }}>
                <Grid container spacing={2}>
                    {/* Header */}
                    <Grid item xs={12}>
                        <Typography
                            variant={isMobile ? 'h6' : 'h4'}
                            component="h1"
                            fontWeight={400}
                            sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}
                        >
                            Listado de Pautas
                        </Typography>
                        <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                    </Grid>

                    <Grid item xs={12} sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Typography variant="body2" component="h2" fontWeight={400}>
                            Administre las pautas de despacho, seguimiento de picking y operaciones logisticas.
                        </Typography>
                    </Grid>

                    {/* Stat Cards */}
                    <Grid item xs={6} sm={6} md={3}>
                        <StatCard title="Total" value={stats.total} icon={<TotalIcon />} color={theme.palette.primary.main} />
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                        <StatCard title="En Proceso" value={stats.inProgress} icon={<HourglassIcon />} color="#F9A825" />
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                        <StatCard title="Despachados" value={stats.dispatched} icon={<DispatchedIcon />} color="#4caf50" />
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                        <StatCard title="Cerrados" value={stats.cancelled} icon={<CancelledIcon />} color="#f44336" />
                    </Grid>

                    {/* Actions */}
                    <Grid item xs={12} display="flex" justifyContent="flex-end" gap={1}>
                        <Button
                            variant="outlined"
                            endIcon={exportingExcel || exportingPdf ? <CircularProgress size={16} /> : <ExportIcon />}
                            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
                            disabled={exportingExcel || exportingPdf}
                            size={isMobile ? 'small' : 'medium'}
                        >
                            Exportar
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            endIcon={<FilterIcon />}
                            onClick={() => setOpenFilter(true)}
                            size={isMobile ? 'small' : 'medium'}
                        >
                            Filtrar
                        </Button>
                    </Grid>

                    {/* Active Filters */}
                    <Grid item xs={12}>
                        <Grid container spacing={1}>
                            {filters.transport_number && (
                                <ChipFilterCategory
                                    label="Transporte: "
                                    items={[{
                                        label: filters.transport_number,
                                        id: 'transport_number',
                                        deleteAction: () => clearFilter('transport_number'),
                                    }]}
                                />
                            )}
                            {filters.status && (
                                <ChipFilterCategory
                                    label="Estado: "
                                    items={[{
                                        label: STATUS_LABELS[filters.status] || filters.status,
                                        id: 'status',
                                        deleteAction: () => clearFilter('status'),
                                    }]}
                                />
                            )}
                            {filters.operational_date_after && (
                                <ChipFilterCategory
                                    label="Desde: "
                                    items={[{
                                        label: filters.operational_date_after,
                                        id: 'operational_date_after',
                                        deleteAction: () => clearFilter('operational_date_after'),
                                    }]}
                                />
                            )}
                            {filters.operational_date_before && (
                                <ChipFilterCategory
                                    label="Hasta: "
                                    items={[{
                                        label: filters.operational_date_before,
                                        id: 'operational_date_before',
                                        deleteAction: () => clearFilter('operational_date_before'),
                                    }]}
                                />
                            )}
                        </Grid>
                    </Grid>

                    {/* DataGrid */}
                    <Grid item xs={12}>
                        <Card variant="outlined">
                            {data?.count === 0 && !isLoading && (
                                <Alert severity="info" sx={{ m: 2 }}>
                                    No se encontraron pautas con los filtros aplicados.
                                </Alert>
                            )}

                            <DataGrid
                                rows={data?.results || []}
                                columns={columns}
                                rowCount={data?.count || 0}
                                loading={isLoading || isFetching}
                                paginationModel={paginationModel}
                                onPaginationModelChange={handlePaginationChange}
                                onRowDoubleClick={(params) => navigate(`/truck-cycle/pautas/${params.row.id}`)}
                                paginationMode="server"
                                pageSizeOptions={[10, 25, 50, 100]}
                                disableRowSelectionOnClick
                                autoHeight
                                rowHeight={isMobile ? 80 : 60}
                                sx={{
                                    border: 0,
                                    cursor: 'pointer',
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
                                            <TruckIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                No hay pautas registradas
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
                    </Grid>
                </Grid>
            </Container>

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
                <MenuItem onClick={handleViewDetails}>
                    <ListItemIcon><ViewIcon fontSize="small" color="primary" /></ListItemIcon>
                    <ListItemText>Ver Detalle</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleCopyCode}>
                    <ListItemIcon><CopyIcon fontSize="small" color="secondary" /></ListItemIcon>
                    <ListItemText>Copiar Transporte</ListItemText>
                </MenuItem>
            </Menu>

            {/* Export Menu */}
            <Menu
                anchorEl={exportMenuAnchor}
                open={Boolean(exportMenuAnchor)}
                onClose={() => setExportMenuAnchor(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    elevation: 3,
                    sx: { minWidth: 180, borderRadius: 2, mt: 1 },
                }}
            >
                <MenuItem onClick={handleExportExcel} disabled={exportingExcel}>
                    <ListItemIcon>
                        {exportingExcel ? <CircularProgress size={18} /> : <GridOnIcon fontSize="small" color="success" />}
                    </ListItemIcon>
                    <ListItemText>Excel</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleExportPdf} disabled={exportingPdf}>
                    <ListItemIcon>
                        {exportingPdf ? <CircularProgress size={18} /> : <PictureAsPdfIcon fontSize="small" color="error" />}
                    </ListItemIcon>
                    <ListItemText>PDF</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}
