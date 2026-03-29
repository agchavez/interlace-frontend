import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    useTheme,
    useMediaQuery,
    Paper,
    Divider,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    LocalShipping as TruckIcon,
    Inventory as BoxIcon,
    Category as SkuIcon,
    ViewInAr as PalletIcon,
    Circle as CircleIcon,
    QrCode2 as QrIcon,
    ContentCopy as CopyIcon,
    PictureAsPdf as PdfIcon,
    Person as PersonIcon,
    CalendarMonth as DateIcon,
    Route as RouteIcon,
    Speed as SpeedIcon,
    Refresh as ReloadIcon,
    MeetingRoom as BayIcon,
    Security as SecurityIcon,
    Engineering as OpsIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import PautaStatusBadge from '../components/PautaStatusBadge';
import {
    useGetPautaQuery,
    useStartPickingMutation,
    useCompletePickingMutation,
    useCompleteLoadingMutation,
    useCompleteCountMutation,
    useDispatchPautaMutation,
    useClosePautaMutation,
} from '../services/truckCycleApi';
import { useAppSelector } from '../../../store';
import type { PautaStatus } from '../interfaces/truckCycle';

// Helper component for displaying info items (same pattern as TokenDetailPage)
const InfoItem = ({
    icon,
    label,
    value,
    color = 'primary',
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1 }}>
        <Box sx={{ color: `${color}.main`, mt: 0.3 }}>{icon}</Box>
        <Box>
            <Typography variant="caption" color="text.secondary" display="block">
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
                {value || '-'}
            </Typography>
        </Box>
    </Box>
);

const INCONSISTENCY_TYPE_COLORS: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
    FALTANTE: 'error',
    SOBRANTE: 'warning',
    CRUCE: 'info',
    DANADO: 'error',
};

export default function PautaDetailPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tabIndex, setTabIndex] = useState(0);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);

    const authToken = useAppSelector((state) => state.auth.token);

    const { data: pauta, isLoading, error } = useGetPautaQuery(Number(id));

    const [startPicking, { isLoading: startingPicking }] = useStartPickingMutation();
    const [completePicking, { isLoading: completingPicking }] = useCompletePickingMutation();
    const [completeLoading, { isLoading: completingLoading }] = useCompleteLoadingMutation();
    const [completeCount, { isLoading: completingCount }] = useCompleteCountMutation();
    const [dispatchPauta, { isLoading: dispatching }] = useDispatchPautaMutation();
    const [closePauta, { isLoading: closing }] = useClosePautaMutation();

    const pdfUrl = id ? `${import.meta.env.VITE_JS_APP_API_URL}/api/truck-cycle-pauta/${id}/download_pdf/` : '';
    const qrUrl = `${window.location.origin}/truck-cycle/pautas/${id}`;

    const fetchPdf = useCallback(async () => {
        if (!authToken || !pdfUrl) return;
        setPdfLoading(true);
        try {
            const response = await fetch(pdfUrl, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            if (!response.ok) throw new Error('Error al cargar el PDF');
            const blob = await response.blob();
            setPdfBlobUrl(URL.createObjectURL(blob));
        } catch {
            toast.error('No se pudo cargar el PDF');
        } finally {
            setPdfLoading(false);
        }
    }, [pdfUrl, authToken]);

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Cargando pauta...
                </Typography>
            </Container>
        );
    }

    if (error || !pauta) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">Error al cargar la pauta.</Alert>
                <Button startIcon={<BackIcon />} onClick={() => navigate('/truck-cycle/pautas')} sx={{ mt: 2 }}>
                    Volver al listado
                </Button>
            </Container>
        );
    }

    // Get active assignment (current person handling the pauta)
    const activeAssignment = pauta.assignments?.find((a) => a.is_active);

    const actionButtons: Record<string, { label: string; action: () => void; loading: boolean; color: 'primary' | 'success' | 'warning' | 'error' }> = {
        PICKING_ASSIGNED: {
            label: 'Iniciar Picking',
            action: () => startPicking(pauta.id),
            loading: startingPicking,
            color: 'primary',
        },
        PICKING_IN_PROGRESS: {
            label: 'Completar Picking',
            action: () => completePicking(pauta.id),
            loading: completingPicking,
            color: 'success',
        },
        IN_BAY: {
            label: 'Completar Carga',
            action: () => completeLoading(pauta.id),
            loading: completingLoading,
            color: 'success',
        },
        COUNTING: {
            label: 'Completar Conteo',
            action: () => completeCount(pauta.id),
            loading: completingCount,
            color: 'success',
        },
        CHECKOUT_OPS: {
            label: 'Despachar',
            action: () => dispatchPauta(pauta.id),
            loading: dispatching,
            color: 'warning',
        },
        RETURN_PROCESSED: {
            label: 'Cerrar Pauta',
            action: () => closePauta(pauta.id),
            loading: closing,
            color: 'error',
        },
    };

    const currentAction = actionButtons[pauta.status];

    const handleCopyCode = () => {
        navigator.clipboard.writeText(pauta.transport_number);
        toast.success('Código copiado');
    };

    const handleOpenPdf = async () => {
        setPdfDialogOpen(true);
        if (!pdfBlobUrl) await fetchPdf();
    };

    const handleDownloadPdf = async () => {
        if (pdfBlobUrl) {
            const link = document.createElement('a');
            link.href = pdfBlobUrl;
            link.download = `pauta_${pauta.transport_number}_V${pauta.trip_number}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const formatDateTime = (date: string | null) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('es-HN', { dateStyle: 'medium', timeStyle: 'short' });
    };

    // Product Details columns
    const productColumns: GridColDef[] = [
        { field: 'material_code', headerName: 'Código', flex: 0.8, minWidth: 120 },
        { field: 'product_name', headerName: 'Producto', flex: 1.2, minWidth: 180 },
        { field: 'category', headerName: 'Categoría', flex: 0.8, minWidth: 120 },
        { field: 'total_boxes', headerName: 'Cajas', flex: 0.5, minWidth: 80, align: 'right', headerAlign: 'right' },
        { field: 'full_pallets', headerName: 'Pallets', flex: 0.5, minWidth: 80, align: 'right', headerAlign: 'right' },
        { field: 'fraction', headerName: 'Fracción', flex: 0.5, minWidth: 80, align: 'right', headerAlign: 'right' },
    ];

    const assignmentColumns: GridColDef[] = [
        { field: 'role_display', headerName: 'Rol', flex: 1, minWidth: 120 },
        { field: 'personnel_name', headerName: 'Personal', flex: 1, minWidth: 140 },
        { field: 'assigned_by_name', headerName: 'Asignado por', flex: 1, minWidth: 140 },
        {
            field: 'assigned_at',
            headerName: 'Fecha',
            flex: 0.8,
            minWidth: 160,
            valueGetter: (params: any) => formatDateTime(params.row.assigned_at),
        },
        {
            field: 'is_active',
            headerName: 'Activo',
            flex: 0.5,
            minWidth: 80,
            renderCell: (params) => (
                <Chip label={params.value ? 'Sí' : 'No'} color={params.value ? 'success' : 'default'} size="small" />
            ),
        },
    ];

    const inconsistencyColumns: GridColDef[] = [
        { field: 'phase', headerName: 'Fase', flex: 0.7, minWidth: 100 },
        {
            field: 'inconsistency_type',
            headerName: 'Tipo',
            flex: 0.7,
            minWidth: 120,
            renderCell: (params) => (
                <Chip label={params.value} size="small" color={INCONSISTENCY_TYPE_COLORS[params.value] ?? 'warning'} />
            ),
        },
        { field: 'product_name', headerName: 'Producto', flex: 1, minWidth: 150 },
        { field: 'expected_quantity', headerName: 'Esperado', flex: 0.5, minWidth: 90, align: 'right', headerAlign: 'right' },
        { field: 'actual_quantity', headerName: 'Real', flex: 0.5, minWidth: 80, align: 'right', headerAlign: 'right' },
        { field: 'difference', headerName: 'Diferencia', flex: 0.5, minWidth: 100, align: 'right', headerAlign: 'right' },
        { field: 'reported_by_name', headerName: 'Reportado por', flex: 0.8, minWidth: 130 },
    ];

    const dataGridSx = {
        border: 'none',
        '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.action.hover,
        },
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Header Navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/truck-cycle/pautas')} sx={{ bgcolor: 'grey.100' }}>
                    <BackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight={600}>
                    Detalle de Pauta
                </Typography>
            </Box>

            {/* Main Header Card */}
            <Card
                elevation={3}
                sx={{
                    mb: 3,
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: 'secondary.main',
                    color: 'white',
                }}
            >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Grid container spacing={3} alignItems="center">
                        {/* Left: Pauta Info */}
                        <Grid item xs={12} md={8}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Avatar
                                    sx={{
                                        width: { xs: 56, md: 72 },
                                        height: { xs: 56, md: 72 },
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                    }}
                                >
                                    <TruckIcon sx={{ fontSize: { xs: 28, md: 36 } }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                                        T-{pauta.transport_number}
                                    </Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                        Viaje {pauta.trip_number} &middot; {pauta.truck_code} - {pauta.truck_plate}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                                <PautaStatusBadge status={pauta.status as PautaStatus} size="medium" />
                                {pauta.is_reload && (
                                    <Chip
                                        icon={<ReloadIcon />}
                                        label="Recarga"
                                        size="small"
                                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                    />
                                )}
                                {activeAssignment && (
                                    <Chip
                                        icon={<PersonIcon />}
                                        label={`${activeAssignment.role_display}: ${activeAssignment.personnel_name}`}
                                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                    />
                                )}
                            </Box>
                        </Grid>

                        {/* Right: QR Code */}
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                                <Paper
                                    elevation={4}
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: 'white',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'scale(1.02)' },
                                    }}
                                    onClick={() => setQrDialogOpen(true)}
                                >
                                    <QRCodeSVG
                                        value={qrUrl}
                                        size={isMobile ? 120 : 140}
                                        level="H"
                                        imageSettings={{
                                            src: '/logo-qr.png',
                                            height: isMobile ? 28 : 32,
                                            width: isMobile ? 28 : 32,
                                            excavate: true,
                                        }}
                                    />
                                </Paper>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                {/* Left Column */}
                <Grid item xs={12} md={8}>
                    {/* Info Card */}
                    <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TruckIcon color="secondary" />
                                Información de la Pauta
                            </Typography>
                            <Divider sx={{ my: 1.5 }} />

                            <Grid container spacing={1.5}>
                                <Grid item xs={6} sm={4}>
                                    <InfoItem
                                        icon={<TruckIcon fontSize="small" />}
                                        label="Transporte"
                                        value={pauta.transport_number}
                                        color="secondary"
                                    />
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <InfoItem
                                        icon={<RouteIcon fontSize="small" />}
                                        label="Viaje"
                                        value={pauta.trip_number}
                                        color="secondary"
                                    />
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <InfoItem
                                        icon={<RouteIcon fontSize="small" />}
                                        label="Ruta"
                                        value={pauta.route_code}
                                        color="secondary"
                                    />
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <InfoItem
                                        icon={<DateIcon fontSize="small" />}
                                        label="Fecha Operativa"
                                        value={pauta.operational_date}
                                        color="secondary"
                                    />
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <InfoItem
                                        icon={<TruckIcon fontSize="small" />}
                                        label="Camión"
                                        value={`${pauta.truck_code} - ${pauta.truck_plate}`}
                                        color="secondary"
                                    />
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <InfoItem
                                        icon={<SpeedIcon fontSize="small" />}
                                        label="Complejidad"
                                        value={pauta.complexity_score}
                                        color="secondary"
                                    />
                                </Grid>
                            </Grid>

                            {/* Stats row */}
                            <Divider sx={{ my: 1.5 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">Cajas</Typography>
                                        <Typography variant="h5" fontWeight={700} color="secondary.main">
                                            {pauta.total_boxes}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={4}>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">SKUs</Typography>
                                        <Typography variant="h5" fontWeight={700} color="info.main">
                                            {pauta.total_skus}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={4}>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">Pallets</Typography>
                                        <Typography variant="h5" fontWeight={700} color="warning.main">
                                            {pauta.total_pallets}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Tabs */}
                    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Tabs
                            value={tabIndex}
                            onChange={(_, v) => setTabIndex(v)}
                            variant={isMobile ? 'scrollable' : 'standard'}
                            scrollButtons={isMobile ? 'auto' : false}
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' },
                            }}
                        >
                            <Tab label="Productos" />
                            <Tab label="Línea de Tiempo" />
                            <Tab label="Asignaciones" />
                            <Tab label={`Inconsistencias (${pauta.inconsistencies.length})`} />
                            <Tab label={`Fotos (${pauta.photos.length})`} />
                        </Tabs>

                        {/* Products Tab */}
                        {tabIndex === 0 && (
                            <DataGrid
                                rows={pauta.product_details}
                                columns={productColumns}
                                autoHeight
                                disableRowSelectionOnClick
                                pageSizeOptions={[10, 25, 50]}
                                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                localeText={{ noRowsLabel: 'Sin productos.' }}
                                sx={dataGridSx}
                            />
                        )}

                        {/* Timeline Tab */}
                        {tabIndex === 1 && (
                            <>
                                {pauta.timestamps.length === 0 ? (
                                    <Box sx={{ p: 3, textAlign: 'center' }}>
                                        <Typography color="text.secondary">Sin eventos registrados.</Typography>
                                    </Box>
                                ) : (
                                    <List sx={{ p: 0 }}>
                                        {pauta.timestamps.map((ts, index) => (
                                            <ListItem
                                                key={ts.id}
                                                divider={index < pauta.timestamps.length - 1}
                                                sx={{
                                                    py: 2,
                                                    px: { xs: 2, sm: 3 },
                                                    '&:hover': { backgroundColor: theme.palette.action.hover },
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 40 }}>
                                                    <CircleIcon sx={{ fontSize: 12, color: theme.palette.primary.main }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Typography fontWeight={600} variant="body1">
                                                            {ts.event_type_display}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Box sx={{ mt: 0.5 }}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {formatDateTime(ts.timestamp)} - {ts.recorded_by_name}
                                                            </Typography>
                                                            {ts.notes && (
                                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                                                    {ts.notes}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </>
                        )}

                        {/* Assignments Tab */}
                        {tabIndex === 2 && (
                            <DataGrid
                                rows={pauta.assignments}
                                columns={assignmentColumns}
                                autoHeight
                                disableRowSelectionOnClick
                                pageSizeOptions={[10, 25]}
                                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                localeText={{ noRowsLabel: 'Sin asignaciones.' }}
                                sx={dataGridSx}
                            />
                        )}

                        {/* Inconsistencies Tab */}
                        {tabIndex === 3 && (
                            <DataGrid
                                rows={pauta.inconsistencies}
                                columns={inconsistencyColumns}
                                autoHeight
                                disableRowSelectionOnClick
                                pageSizeOptions={[10, 25]}
                                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                localeText={{ noRowsLabel: 'Sin inconsistencias.' }}
                                sx={dataGridSx}
                            />
                        )}

                        {/* Photos Tab */}
                        {tabIndex === 4 && (
                            <Box sx={{ p: 2 }}>
                                {pauta.photos.length === 0 ? (
                                    <Box sx={{ p: 3, textAlign: 'center' }}>
                                        <Typography color="text.secondary">Sin fotos.</Typography>
                                    </Box>
                                ) : (
                                    <Grid container spacing={2}>
                                        {pauta.photos.map((photo) => (
                                            <Grid item xs={12} sm={6} md={4} key={photo.id}>
                                                <Card
                                                    elevation={2}
                                                    sx={{
                                                        overflow: 'hidden',
                                                        transition: 'all 0.3s',
                                                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                                                    }}
                                                >
                                                    <Box
                                                        component="img"
                                                        src={photo.photo}
                                                        alt={photo.description}
                                                        sx={{ width: '100%', height: 220, objectFit: 'cover', cursor: 'pointer' }}
                                                        onClick={() => window.open(photo.photo, '_blank')}
                                                    />
                                                    <CardContent sx={{ py: 1.5, px: 2 }}>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {photo.description}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {photo.phase} - {photo.uploaded_by_name}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </Box>
                        )}
                    </Card>
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={4}>
                    {/* Quick Actions */}
                    <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Acciones Rápidas
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<CopyIcon />}
                                    onClick={handleCopyCode}
                                    fullWidth
                                    size="small"
                                >
                                    Copiar Código
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<QrIcon />}
                                    onClick={() => setQrDialogOpen(true)}
                                    fullWidth
                                    size="small"
                                >
                                    Ver QR Ampliado
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<PdfIcon />}
                                    onClick={handleOpenPdf}
                                    fullWidth
                                    size="small"
                                >
                                    Ver PDF
                                </Button>

                                {currentAction && (
                                    <>
                                        <Divider />
                                        <Button
                                            variant="contained"
                                            color={currentAction.color}
                                            size="large"
                                            onClick={currentAction.action}
                                            disabled={currentAction.loading}
                                            startIcon={currentAction.loading ? <CircularProgress size={16} /> : undefined}
                                            fullWidth
                                        >
                                            {currentAction.label}
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Bay Assignment */}
                    {pauta.bay_assignment && (
                        <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BayIcon color="secondary" />
                                    Bahía Asignada
                                </Typography>
                                <Divider sx={{ my: 1.5 }} />
                                <InfoItem
                                    icon={<BayIcon fontSize="small" />}
                                    label="Bahía"
                                    value={`${pauta.bay_assignment.bay_code} - ${pauta.bay_assignment.bay_name}`}
                                    color="secondary"
                                />
                                <InfoItem
                                    icon={<DateIcon fontSize="small" />}
                                    label="Asignada"
                                    value={formatDateTime(pauta.bay_assignment.assigned_at)}
                                    color="info"
                                />
                                {pauta.bay_assignment.released_at && (
                                    <InfoItem
                                        icon={<DateIcon fontSize="small" />}
                                        label="Liberada"
                                        value={formatDateTime(pauta.bay_assignment.released_at)}
                                        color="success"
                                    />
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Checkout Validation */}
                    {pauta.checkout_validation && (
                        <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SecurityIcon color="secondary" />
                                    Validación Checkout
                                </Typography>
                                <Divider sx={{ my: 1.5 }} />

                                {/* Security */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    {pauta.checkout_validation.security_validated ? (
                                        <CheckIcon color="success" fontSize="small" />
                                    ) : (
                                        <CancelIcon color="disabled" fontSize="small" />
                                    )}
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Seguridad
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {pauta.checkout_validation.security_validated
                                                ? `${pauta.checkout_validation.security_validator_name} - ${formatDateTime(pauta.checkout_validation.security_validated_at)}`
                                                : 'Pendiente'}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Operations */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {pauta.checkout_validation.ops_validated ? (
                                        <CheckIcon color="success" fontSize="small" />
                                    ) : (
                                        <CancelIcon color="disabled" fontSize="small" />
                                    )}
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Operaciones
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {pauta.checkout_validation.ops_validated
                                                ? `${pauta.checkout_validation.ops_validator_name} - ${formatDateTime(pauta.checkout_validation.ops_validated_at)}`
                                                : 'Pendiente'}
                                        </Typography>
                                    </Box>
                                </Box>

                                {pauta.checkout_validation.notes && (
                                    <Box sx={{ mt: 1.5 }}>
                                        <InfoItem
                                            icon={<OpsIcon fontSize="small" />}
                                            label="Notas"
                                            value={pauta.checkout_validation.notes}
                                            color="info"
                                        />
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Additional Info */}
                    <Card elevation={2} sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Información Adicional
                            </Typography>
                            <Divider sx={{ my: 1.5 }} />
                            <InfoItem
                                icon={<DateIcon fontSize="small" />}
                                label="Fecha de Creación"
                                value={formatDateTime(pauta.created_at)}
                                color="info"
                            />
                            {pauta.reload_count > 0 && (
                                <InfoItem
                                    icon={<ReloadIcon fontSize="small" />}
                                    label="Recargas"
                                    value={pauta.reload_count}
                                    color="warning"
                                />
                            )}
                            {pauta.notes && (
                                <InfoItem
                                    icon={<OpsIcon fontSize="small" />}
                                    label="Notas"
                                    value={pauta.notes}
                                    color="secondary"
                                />
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* QR Dialog */}
            <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="sm">
                <DialogContent sx={{ textAlign: 'center', py: 4, px: 6 }}>
                    <Paper
                        elevation={0}
                        sx={{ p: 3, display: 'inline-block', bgcolor: 'grey.100', borderRadius: 2 }}
                    >
                        <QRCodeSVG
                            value={qrUrl}
                            size={220}
                            level="H"
                            imageSettings={{
                                src: '/logo-qr.png',
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                    </Paper>
                    <Typography variant="h6" fontWeight={600} sx={{ mt: 2 }}>
                        T-{pauta.transport_number} / V-{pauta.trip_number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {pauta.truck_code} - {pauta.truck_plate}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setQrDialogOpen(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* PDF Dialog */}
            <Dialog open={pdfDialogOpen} onClose={() => setPdfDialogOpen(false)} maxWidth="lg" fullWidth>
                <DialogTitle>PDF de la Pauta</DialogTitle>
                <DialogContent sx={{ p: 0, height: '70vh' }}>
                    {pdfLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress />
                        </Box>
                    ) : pdfBlobUrl ? (
                        <iframe
                            id="pdf-iframe"
                            src={pdfBlobUrl}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            title="PDF Pauta"
                        />
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Alert severity="error">No se pudo cargar el PDF</Alert>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPdfDialogOpen(false)}>Cerrar</Button>
                    {pdfBlobUrl && (
                        <Button startIcon={<DownloadIcon />} onClick={handleDownloadPdf} variant="contained">
                            Descargar
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
}
