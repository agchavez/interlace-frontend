import { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Chip,
    Avatar,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format, isValid } from 'date-fns';
import {
    LocalShipping as TruckIcon,
    CheckCircle as DoneIcon,
    Inventory as BoxIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useGetKPISummaryQuery, useGetPautasQuery } from '../services/truckCycleApi';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
    return (
        <Card elevation={3} sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color, fontSize: { xs: '1.5rem', sm: '2.125rem' }, mt: 0.5 }}>
                            {value}
                        </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: color, width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}>
                        {icon}
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    );
}

const STATUS_COLORS: Record<string, string> = {
    PICKING_ASSIGNED: '#1976d2',
    PICKING_IN_PROGRESS: '#0288d1',
    IN_BAY: '#7b1fa2',
    COUNTING: '#f57c00',
    CHECKOUT_OPS: '#388e3c',
    DISPATCHED: '#2e7d32',
    CLOSED: '#616161',
    CANCELLED: '#d32f2f',
    RETURN_PROCESSED: '#5d4037',
};

export default function KPIReportPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [dateValue, setDateValue] = useState<Date | null>(new Date());
    const operationalDate = dateValue && isValid(dateValue) ? format(dateValue, 'yyyy-MM-dd') : '';

    const {
        data: kpi,
        isLoading: kpiLoading,
        error: kpiError,
    } = useGetKPISummaryQuery({ operational_date: operationalDate });

    const {
        data: pautasData,
        isLoading: pautasLoading,
    } = useGetPautasQuery({
        operational_date_after: operationalDate,
        operational_date_before: operationalDate,
        limit: 200,
    });

    const isLoading = kpiLoading || pautasLoading;

    const pautaColumns: GridColDef[] = [
        { field: 'transport_number', headerName: 'Transporte', flex: 0.8, minWidth: 110 },
        {
            field: 'truck',
            headerName: 'Camion',
            flex: 1,
            minWidth: 150,
            valueGetter: (params: any) => `${params.row.truck_code} (${params.row.truck_plate})`,
        },
        { field: 'total_boxes', headerName: 'Cajas', flex: 0.5, minWidth: 80, align: 'right', headerAlign: 'right' },
        {
            field: 'status',
            headerName: 'Estado',
            flex: 0.8,
            minWidth: 130,
            renderCell: (params) => (
                <Chip
                    label={params.row.status_display}
                    size="small"
                    color={
                        params.row.status === 'DISPATCHED' || params.row.status === 'CLOSED'
                            ? 'success'
                            : params.row.status === 'CANCELLED'
                                ? 'error'
                                : 'default'
                    }
                />
            ),
        },
        { field: 'route_code', headerName: 'Ruta', flex: 0.6, minWidth: 80 },
        {
            field: 'is_reload',
            headerName: 'Recarga',
            flex: 0.5,
            minWidth: 80,
            valueGetter: (params: any) => params.row.is_reload ? 'Si' : 'No',
        },
        {
            field: 'created_at',
            headerName: 'Fecha Creacion',
            flex: 0.8,
            minWidth: 120,
            valueGetter: (params: any) => new Date(params.row.created_at).toLocaleTimeString(),
        },
    ];

    if (kpiError) {
        return (
            <Container maxWidth="xl" sx={{ mt: 2 }}>
                <Alert severity="error">Error al cargar datos de KPI.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h5" fontWeight={600}>
                    Reporte de KPIs
                </Typography>
                <DatePicker
                    label="Fecha operativa"
                    value={dateValue}
                    onChange={(v) => setDateValue(v)}
                    slotProps={{ textField: { size: 'small' } }}
                />
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Stat Cards */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Total Pautas"
                                value={kpi?.total_pautas ?? 0}
                                icon={<TruckIcon />}
                                color={theme.palette.primary.main}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Completadas"
                                value={kpi?.completed_pautas ?? 0}
                                icon={<DoneIcon />}
                                color={theme.palette.success.main}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Cajas/Hora"
                                value={kpi?.avg_boxes_per_hour != null ? kpi.avg_boxes_per_hour.toFixed(1) : '--'}
                                icon={<BoxIcon />}
                                color={theme.palette.info.main}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Error Rate"
                                value={kpi?.avg_picking_error_rate != null ? `${(kpi.avg_picking_error_rate * 100).toFixed(1)}%` : '--'}
                                icon={<WarningIcon />}
                                color={theme.palette.warning.main}
                            />
                        </Grid>
                    </Grid>

                    {/* Status Breakdown */}
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                        Pautas por Estado
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {kpi?.pautas_by_status?.map(({ status, count }) => (
                            <Grid item xs={6} sm={4} md={3} lg={2} key={status}>
                                <Card
                                    elevation={2}
                                    sx={{
                                        transition: 'all 0.3s',
                                        '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                                        borderLeft: `4px solid ${STATUS_COLORS[status] ?? theme.palette.grey[500]}`,
                                    }}
                                >
                                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                        <Typography variant="h5" fontWeight={700}>
                                            {count}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                            {status.replace(/_/g, ' ')}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                        {(!kpi?.pautas_by_status || kpi.pautas_by_status.length === 0) && (
                            <Grid item xs={12}>
                                <Typography color="text.secondary">
                                    No hay datos de estado para esta fecha.
                                </Typography>
                            </Grid>
                        )}
                    </Grid>

                    {/* Pautas DataGrid */}
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                        Detalle de Pautas
                    </Typography>
                    <Card variant="outlined">
                        <DataGrid
                            rows={pautasData?.results ?? []}
                            columns={pautaColumns}
                            autoHeight
                            disableRowSelectionOnClick
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                            }}
                            localeText={{
                                noRowsLabel: 'No hay pautas para esta fecha.',
                            }}
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: theme.palette.action.hover,
                                },
                            }}
                        />
                    </Card>
                </>
            )}
        </Container>
    );
}
