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
    Avatar,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format, isValid } from 'date-fns';
import {
    LocalShipping as TruckIcon,
    Inventory as BoxIcon,
    CheckCircle as DoneIcon,
    Schedule as PendingIcon,
} from '@mui/icons-material';
import { useGetWorkstationQuery, useGetKPISummaryQuery } from '../services/truckCycleApi';

export default function DashboardPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [dateValue, setDateValue] = useState<Date | null>(new Date());
    const operationalDate = dateValue && isValid(dateValue) ? format(dateValue, 'yyyy-MM-dd') : '';

    const { data: workstation, isLoading: wsLoading, error: wsError } = useGetWorkstationQuery();
    const { data: kpi, isLoading: kpiLoading } = useGetKPISummaryQuery({
        operational_date: operationalDate,
    });

    const totalByStatus = workstation
        ? Object.entries(workstation)
            .filter(([, group]) => group.count > 0)
            .map(([status, group]) => ({
                status,
                label: group.label,
                count: group.count,
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
            <Container maxWidth="xl" sx={{ mt: 2 }}>
                <Alert severity="error">Error al cargar datos del dashboard.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
                {/* Header */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                            Dashboard - Ciclo de Camiones
                        </Typography>
                        <DatePicker
                            label="Fecha operativa"
                            value={dateValue}
                            onChange={(v) => setDateValue(v)}
                            slotProps={{ textField: { size: 'small' } }}
                        />
                    </Box>
                </Grid>

                {/* KPI Summary Cards */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={3} sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Total Pautas
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', fontSize: { xs: '1.5rem', sm: '2.125rem' }, mt: 0.5 }}>
                                        {kpi?.total_pautas ?? 0}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'primary.main', width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}>
                                    <TruckIcon />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={3} sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Completadas
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', fontSize: { xs: '1.5rem', sm: '2.125rem' }, mt: 0.5 }}>
                                        {kpi?.completed_pautas ?? 0}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'success.main', width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}>
                                    <DoneIcon />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={3} sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Cajas/Hora Promedio
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main', fontSize: { xs: '1.5rem', sm: '2.125rem' }, mt: 0.5 }}>
                                        {kpi?.avg_boxes_per_hour != null
                                            ? kpi.avg_boxes_per_hour.toFixed(1)
                                            : '--'}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'info.main', width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}>
                                    <BoxIcon />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={3} sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Precision Conteo
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main', fontSize: { xs: '1.5rem', sm: '2.125rem' }, mt: 0.5 }}>
                                        {kpi?.avg_count_accuracy != null
                                            ? `${(kpi.avg_count_accuracy * 100).toFixed(1)}%`
                                            : '--'}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'warning.main', width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}>
                                    <PendingIcon />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Status breakdown */}
                <Grid item xs={12}>
                    <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, mb: 1 }}>
                        Pautas por Estado
                    </Typography>
                </Grid>

                {totalByStatus.map(({ status, label, count }) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={status}>
                        <Card elevation={3} sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                            <CardContent sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                                    {count}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                    {label || status.replace(/_/g, ' ')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                {totalByStatus.length === 0 && (
                    <Grid item xs={12}>
                        <Typography color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                            No hay pautas activas para esta fecha.
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
}
