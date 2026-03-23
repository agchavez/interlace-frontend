import { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    TextField,
} from '@mui/material';
import {
    LocalShipping as TruckIcon,
    Inventory as BoxIcon,
    CheckCircle as DoneIcon,
    Schedule as PendingIcon,
} from '@mui/icons-material';
import { useGetWorkstationQuery, useGetKPISummaryQuery } from '../services/truckCycleApi';

export default function DashboardPage() {
    const [operationalDate, setOperationalDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    const { data: workstation, isLoading: wsLoading, error: wsError } = useGetWorkstationQuery();
    const { data: kpi, isLoading: kpiLoading } = useGetKPISummaryQuery({
        operational_date: operationalDate,
    });

    const totalByStatus = workstation
        ? Object.entries(workstation).map(([status, pautas]) => ({
            status,
            count: pautas.length,
        }))
        : [];

    if (wsLoading || kpiLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (wsError) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Error al cargar datos del dashboard.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight={600}>
                    Dashboard - Ciclo de Camiones
                </Typography>
                <TextField
                    type="date"
                    size="small"
                    label="Fecha operativa"
                    value={operationalDate}
                    onChange={(e) => setOperationalDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
            </Box>

            {/* KPI Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TruckIcon color="primary" />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Total Pautas
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700}>
                                {kpi?.total_pautas ?? 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <DoneIcon color="success" />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Completadas
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700}>
                                {kpi?.completed_pautas ?? 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <BoxIcon color="info" />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Cajas/Hora Promedio
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700}>
                                {kpi?.avg_boxes_per_hour != null
                                    ? kpi.avg_boxes_per_hour.toFixed(1)
                                    : '--'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <PendingIcon color="warning" />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Precision Conteo
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700}>
                                {kpi?.avg_count_accuracy != null
                                    ? `${(kpi.avg_count_accuracy * 100).toFixed(1)}%`
                                    : '--'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Status breakdown */}
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Pautas por Estado
            </Typography>
            <Grid container spacing={2}>
                {totalByStatus.map(({ status, count }) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={status}>
                        <Card variant="outlined">
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h5" fontWeight={700}>
                                    {count}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {status.replace(/_/g, ' ')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                {totalByStatus.length === 0 && (
                    <Grid item xs={12}>
                        <Typography color="text.secondary">
                            No hay pautas activas para esta fecha.
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}
