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
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    LocalShipping as TruckIcon,
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
    PlayArrow as PlayIcon,
    AssignmentTurnedIn as AssignmentIcon,
    Warehouse as WarehouseIcon,
    FactCheck as FactCheckIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineOppositeContent,
    timelineOppositeContentClasses,
} from '@mui/lab';
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import PautaStatusBadge from '../components/PautaStatusBadge';
import PalletPrintContent from '../components/PalletPrintContent';
import PrintComponent from '../../../utils/componentPrinter';
import {
    useGetPautaQuery,
    useStartPickingMutation,
    useCompletePickingMutation,
    useCompleteLoadingMutation,
    useCompleteCountMutation,
    useDispatchPautaMutation,
    useClosePautaMutation,
    useStartAuditMutation,
    useGeneratePalletTicketsMutation,
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

const getTimelineIcon = (eventType: string): { icon: React.ReactNode; color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'grey' } => {
    const type = eventType.toUpperCase();
    if (type.includes('INICIO') || type.includes('START')) return { icon: <PlayIcon fontSize="small" />, color: 'primary' };
    if (type.includes('FIN') || type.includes('COMPLETE') || type.includes('DONE')) return { icon: <CheckIcon fontSize="small" />, color: 'success' };
    if (type.includes('ANDEN') || type.includes('BAY') || type.includes('BAHIA')) return { icon: <WarehouseIcon fontSize="small" />, color: 'info' };
    if (type.includes('CONTEO') || type.includes('COUNT')) return { icon: <FactCheckIcon fontSize="small" />, color: 'warning' };
    if (type.includes('DESPACHO') || type.includes('DISPATCH')) return { icon: <TruckIcon fontSize="small" />, color: 'success' };
    if (type.includes('CANCEL')) return { icon: <CancelIcon fontSize="small" />, color: 'error' };
    if (type.includes('ASIGN') || type.includes('ASSIGN')) return { icon: <AssignmentIcon fontSize="small" />, color: 'secondary' };
    return { icon: <DateIcon fontSize="small" />, color: 'grey' };
};

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
    const [startAudit, { isLoading: startingAudit }] = useStartAuditMutation();
    const [generateTickets, { isLoading: generatingTickets }] = useGeneratePalletTicketsMutation();
    const [willPrintTickets, setWillPrintTickets] = useState(false);

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

    // Pallet Print — hooks must be before any early return
    const palletPrintComponent = pauta ? (
        <PalletPrintContent
            pauta={{
                transport_number: pauta.transport_number,
                trip_number: pauta.trip_number,
                truck_code: pauta.truck_code,
                truck_plate: pauta.truck_plate,
                route_code: pauta.route_code,
                total_boxes: pauta.total_boxes,
                total_pallets: pauta.total_pallets,
            }}
            tickets={pauta.pallet_tickets}
        />
    ) : null;

    const palletPrint = PrintComponent({
        pageOrientation: 'landscape',
        component: palletPrintComponent,
        margin: '5mm',
    });

    useEffect(() => {
        if (willPrintTickets && pauta && pauta.pallet_tickets.length > 0) {
            palletPrint.print();
            setWillPrintTickets(false);
        }
    }, [willPrintTickets, pauta?.pallet_tickets.length]);

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
            label: 'Verificar',
            action: () => navigate(`/truck-cycle/verify/${pauta.id}`),
            loading: false,
            color: 'primary',
        },
        COUNTED: {
            label: 'Checkout Seguridad',
            action: () => navigate(`/truck-cycle/verify/${pauta.id}?phase=CHECKOUT`),
            loading: false,
            color: 'primary',
        },
        CHECKOUT_OPS: {
            label: 'Despachar',
            action: () => dispatchPauta({ id: pauta.id }),
            loading: dispatching,
            color: 'warning',
        },
        IN_AUDIT: {
            label: 'Completar Auditoría',
            action: () => navigate(`/truck-cycle/verify/${pauta.id}?phase=AUDIT`),
            loading: false,
            color: 'warning',
        },
        RETURN_PROCESSED: {
            label: 'Cerrar Pauta',
            action: () => closePauta(pauta.id),
            loading: closing,
            color: 'error',
        },
        AUDIT_COMPLETE: {
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
        { field: 'actual_quantity', headerName: 'Cantidad', flex: 0.5, minWidth: 90, align: 'right', headerAlign: 'right' },
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
                <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'grey.100' }}>
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
                                        value={`${Number(pauta.complexity_score).toFixed(2)}%`}
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
                                        <Typography variant="caption" color="text.secondary">Pallets Completas</Typography>
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
                            <Tab label="Línea de Tiempo" />
                            <Tab label="Asignaciones" />
                            <Tab label={`Inconsistencias (${pauta.inconsistencies.length})`} />
                            <Tab label={`Fotos (${pauta.photos.length})`} />
                        </Tabs>

                        {/* Timeline Tab */}
                        {tabIndex === 0 && (() => {
                            // Build lookup: event_type → timestamp for duration calculations
                            const tsByType: Record<string, string> = {};
                            for (const ts of pauta.timestamps) {
                                tsByType[ts.event_type] = ts.timestamp;
                            }

                            // Duration pairs: end event → start event, label
                            const DURATION_PAIRS: Record<string, { start: string; label: string; chipColor: 'primary' | 'success' | 'info' | 'warning' }> = {
                                T1_PICKING_END: { start: 'T0_PICKING_START', label: 'Picking', chipColor: 'primary' },
                                T4_LOADING_END: { start: 'T2_BAY_ASSIGNED', label: 'Carga', chipColor: 'info' },
                                T6_COUNT_END: { start: 'T5_COUNT_START', label: 'Conteo', chipColor: 'warning' },
                                T8_CHECKOUT_OPS: { start: 'T7_CHECKOUT_SECURITY', label: 'Checkout', chipColor: 'success' },
                            };

                            const formatDuration = (startTs: string, endTs: string) => {
                                const diff = Math.max(0, new Date(endTs).getTime() - new Date(startTs).getTime());
                                const h = Math.floor(diff / 3_600_000);
                                const m = Math.floor((diff % 3_600_000) / 60_000);
                                const s = Math.floor((diff % 60_000) / 1_000);
                                if (h > 0) return `${h}h ${m}m ${s}s`;
                                if (m > 0) return `${m}m ${s}s`;
                                return `${s}s`;
                            };

                            // Map event types to the relevant assignment role
                            const EVENT_ROLE_MAP: Record<string, string> = {
                                T0_PICKING_START: 'PICKER',
                                T1_PICKING_END: 'PICKER',
                                T5_COUNT_START: 'COUNTER',
                                T6_COUNT_END: 'COUNTER',
                                T2_BAY_ASSIGNED: 'YARD_DRIVER',
                                T7_CHECKOUT_SECURITY: 'SECURITY',
                                T8_CHECKOUT_OPS: 'OPERATIONS',
                            };

                            // Build role → personnel name from assignments
                            const rolePersonnel: Record<string, string> = {};
                            for (const a of pauta.assignments) {
                                rolePersonnel[a.role] = a.personnel_name;
                            }

                            return (
                            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                                {pauta.timestamps.length === 0 ? (
                                    <Box sx={{ p: 3, textAlign: 'center' }}>
                                        <Typography color="text.secondary">Sin eventos registrados.</Typography>
                                    </Box>
                                ) : (
                                    <Timeline
                                        sx={{
                                            p: 0,
                                            [`& .${timelineOppositeContentClasses.root}`]: {
                                                flex: { xs: 0, sm: 0.3 },
                                            },
                                        }}
                                    >
                                        {pauta.timestamps.map((ts, index) => {
                                            const { icon, color } = getTimelineIcon(ts.event_type_display);
                                            const isLast = index === pauta.timestamps.length - 1;

                                            // Duration chip for end events
                                            const durationInfo = DURATION_PAIRS[ts.event_type];
                                            const startTs = durationInfo ? tsByType[durationInfo.start] : null;
                                            const durationLabel = durationInfo && startTs
                                                ? `${durationInfo.label}: ${formatDuration(startTs, ts.timestamp)}`
                                                : null;

                                            // Assigned personnel for this event
                                            const role = EVENT_ROLE_MAP[ts.event_type];
                                            const assignedName = role ? rolePersonnel[role] : null;

                                            return (
                                                <TimelineItem key={ts.id}>
                                                    <TimelineOppositeContent
                                                        sx={{
                                                            display: { xs: 'none', sm: 'block' },
                                                            pt: 2,
                                                            typography: 'body2',
                                                            color: 'text.secondary',
                                                        }}
                                                    >
                                                        {formatDateTime(ts.timestamp)}
                                                    </TimelineOppositeContent>
                                                    <TimelineSeparator>
                                                        <TimelineDot color={color} variant={isLast ? 'filled' : 'outlined'}>
                                                            {icon}
                                                        </TimelineDot>
                                                        {!isLast && <TimelineConnector />}
                                                    </TimelineSeparator>
                                                    <TimelineContent sx={{ pt: 1.5, pb: 3 }}>
                                                        <Typography variant="body1" fontWeight={600}>
                                                            {ts.event_type_display}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'block', sm: 'none' }, mt: 0.25 }}>
                                                            {formatDateTime(ts.timestamp)}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                                            {ts.recorded_by_name}
                                                        </Typography>
                                                        {assignedName && (
                                                            <Chip
                                                                icon={<PersonIcon sx={{ fontSize: 16 }} />}
                                                                label={assignedName}
                                                                size="small"
                                                                variant="outlined"
                                                                color="secondary"
                                                                sx={{ mt: 0.75, fontWeight: 500 }}
                                                            />
                                                        )}
                                                        {durationLabel && (
                                                            <Chip
                                                                icon={<SpeedIcon sx={{ fontSize: 16 }} />}
                                                                label={durationLabel}
                                                                size="small"
                                                                color={durationInfo!.chipColor}
                                                                sx={{ mt: 0.75, ml: assignedName ? 0.75 : 0, fontWeight: 600, fontFamily: 'monospace' }}
                                                            />
                                                        )}
                                                        {ts.notes && (
                                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                                                {ts.notes}
                                                            </Typography>
                                                        )}
                                                    </TimelineContent>
                                                </TimelineItem>
                                            );
                                        })}
                                    </Timeline>
                                )}
                            </Box>
                            );
                        })()}

                        {/* Assignments Tab */}
                        {tabIndex === 1 && (
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
                        {tabIndex === 2 && (
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
                        {tabIndex === 3 && (
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

                                {/* Enviar a Auditoría */}
                                {['COUNTED', 'RETURN_PROCESSED'].includes(pauta.status) && (
                                    <>
                                        <Divider />
                                        <Button
                                            variant="outlined"
                                            color="warning"
                                            size="small"
                                            onClick={() => startAudit(pauta.id)}
                                            disabled={startingAudit}
                                            startIcon={startingAudit ? <CircularProgress size={16} /> : undefined}
                                            fullWidth
                                        >
                                            Enviar a Auditoría
                                        </Button>
                                    </>
                                )}

                                {/* Pallet Tickets */}
                                {!['PENDING_PICKING', 'PICKING_ASSIGNED', 'CLOSED', 'CANCELLED'].includes(pauta.status) && (
                                    <>
                                        <Divider />
                                        <Button
                                            variant="outlined"
                                            color="info"
                                            size="small"
                                            onClick={async () => {
                                                if (pauta.pallet_tickets.length === 0) {
                                                    try {
                                                        await generateTickets({ pauta_id: pauta.id }).unwrap();
                                                        toast.success('Tickets generados');
                                                    } catch {
                                                        toast.error('Error al generar tickets');
                                                        return;
                                                    }
                                                }
                                                setWillPrintTickets(true);
                                            }}
                                            disabled={generatingTickets}
                                            startIcon={generatingTickets ? <CircularProgress size={16} /> : <QrIcon />}
                                            fullWidth
                                        >
                                            {pauta.pallet_tickets.length > 0
                                                ? `Imprimir Tickets (${pauta.pallet_tickets.length})`
                                                : 'Generar Pallet Tickets'}
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
                                                ? `${pauta.checkout_validation.security_validator_name || 'Sin asignar'} - ${formatDateTime(pauta.checkout_validation.security_validated_at)}`
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
                                                ? `${pauta.checkout_validation.ops_validator_name || 'Sin asignar'} - ${formatDateTime(pauta.checkout_validation.ops_validated_at)}`
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

            {/* Pallet Print (hidden, for react-to-print) */}
            {palletPrint.component}
        </Container>
    );
}
