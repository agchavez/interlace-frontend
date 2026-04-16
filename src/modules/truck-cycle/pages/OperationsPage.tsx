import { useState, useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Autocomplete,
    TextField,
    CircularProgress,
    Alert,
    Tooltip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Snackbar,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    PersonAdd as AssignIcon,
    PlayArrow as StartIcon,
    CheckCircle as CompleteIcon,
    HourglassEmpty as PendingIcon,
    Timer as InProgressIcon,
    Assignment as TotalIcon,
    Visibility as ViewIcon,
    ExpandMore as ExpandIcon,
    LocalShipping as TruckIcon,
    MeetingRoom as BayIcon,
    ContentPasteSearch as CountIcon,
    Security as SecurityIcon,
    Engineering as OpsIcon,
    Send as DispatchIcon,
    Inventory as BoxIcon,
    Policy as AuditIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import PautaStatusBadge from '../components/PautaStatusBadge';
import {
    useGetPautasQuery,
    useGetBaysQuery,
    useAssignPickerMutation,
    useStartPickingMutation,
    useCompletePickingMutation,
    useAssignBayMutation,
    useCompleteLoadingMutation,
    useAssignCounterMutation,
    useCompleteCountMutation,
    useCheckoutSecurityMutation,
    useCheckoutOpsMutation,
    useDispatchPautaMutation,
} from '../services/truckCycleApi';
import { useGetPersonnelProfilesQuery } from '../../personnel/services/personnelApi';
import type { PautaListItem, PautaStatus, Bay } from '../interfaces/truckCycle';
import type { PersonnelProfileList } from '../../../interfaces/personnel';

// ─── Timer ──────────────────────────────────────────────────────────────────
function ElapsedTimer({ since, color = 'warning' }: { since: string; color?: 'warning' | 'info' | 'primary' }) {
    const [elapsed, setElapsed] = useState('');
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const compute = useCallback(() => {
        const diff = Math.max(0, Date.now() - new Date(since).getTime());
        const h = Math.floor(diff / 3_600_000);
        const m = Math.floor((diff % 3_600_000) / 60_000);
        const s = Math.floor((diff % 60_000) / 1_000);
        setElapsed(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, [since]);

    useEffect(() => {
        compute();
        intervalRef.current = setInterval(compute, 1_000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [compute]);

    return <Chip label={elapsed} size="small" color={color} variant="outlined" sx={{ fontFamily: 'monospace', fontWeight: 600 }} />;
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <Card elevation={3} sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' }, fontWeight: 600 }}>
                        {title}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color, fontSize: { xs: '1.25rem', sm: '1.5rem' }, mt: 0.25 }}>
                        {value}
                    </Typography>
                </Box>
                <Avatar sx={{ bgcolor: color, opacity: 0.9, width: { xs: 32, sm: 44 }, height: { xs: 32, sm: 44 } }}>{icon}</Avatar>
            </Box>
        </CardContent>
    </Card>
);

// ─── Phase config ───────────────────────────────────────────────────────────
type PhaseKey = 'picking' | 'bay' | 'counting' | 'checkout' | 'audit' | 'dispatched';

const PHASE_CONFIG: Record<PhaseKey, { label: string; color: string; icon: React.ReactNode; statuses: PautaStatus[] }> = {
    picking: {
        label: 'Picking',
        color: '#1976d2',
        icon: <BoxIcon />,
        statuses: ['PENDING_PICKING', 'PICKING_ASSIGNED', 'PICKING_IN_PROGRESS', 'PICKING_DONE'],
    },
    bay: {
        label: 'Bahía / Carga',
        color: '#ed6c02',
        icon: <BayIcon />,
        statuses: ['IN_BAY'],
    },
    counting: {
        label: 'Conteo',
        color: '#0288d1',
        icon: <CountIcon />,
        statuses: ['PENDING_COUNT', 'COUNTING', 'COUNTED'],
    },
    checkout: {
        label: 'Checkout',
        color: '#9c27b0',
        icon: <SecurityIcon />,
        statuses: ['CHECKOUT_SECURITY', 'CHECKOUT_OPS'],
    },
    audit: {
        label: 'Auditoría',
        color: '#e65100',
        icon: <AuditIcon />,
        statuses: ['IN_AUDIT', 'AUDIT_COMPLETE'],
    },
    dispatched: {
        label: 'Despachados',
        color: '#2e7d32',
        icon: <TruckIcon />,
        statuses: ['DISPATCHED'],
    },
};

const PHASE_ORDER: PhaseKey[] = ['picking', 'bay', 'counting', 'checkout', 'audit', 'dispatched'];

const STATUS_TO_PHASE: Record<string, PhaseKey> = {};
for (const [phase, cfg] of Object.entries(PHASE_CONFIG)) {
    for (const s of cfg.statuses) STATUS_TO_PHASE[s] = phase as PhaseKey;
}

// ─── Dialog state ───────────────────────────────────────────────────────────
type DialogType = 'assign-picker' | 'assign-bay' | 'assign-counter' | 'checkout-security' | 'checkout-ops';
type DialogState = { type: 'closed' } | { type: DialogType; pauta: PautaListItem };
type DialogAction = { type: 'OPEN'; dialogType: DialogType; pauta: PautaListItem } | { type: 'CLOSE' };

function dialogReducer(_state: DialogState, action: DialogAction): DialogState {
    switch (action.type) {
        case 'OPEN': return { type: action.dialogType, pauta: action.pauta };
        case 'CLOSE': return { type: 'closed' };
    }
}

const DIALOG_TITLES: Record<DialogType, string> = {
    'assign-picker': 'Asignar Picker',
    'assign-bay': 'Asignar Bahía',
    'assign-counter': 'Asignar Contador',
    'checkout-security': 'Checkout Seguridad',
    'checkout-ops': 'Checkout Operaciones',
};

// ─── Active statuses to fetch ───────────────────────────────────────────────
const ACTIVE_STATUSES = Object.values(PHASE_CONFIG).flatMap((c) => c.statuses).join(',');

// ═════════════════════════════════════════════════════════════════════════════
export default function OperationsPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    const today = useMemo(() => new Date().toISOString().split('T')[0], []);

    // ── Data ────────────────────────────────────────────────────────────────
    const { data, isLoading, isFetching, error } = useGetPautasQuery(
        { status: ACTIVE_STATUSES, operational_date_after: today, operational_date_before: today, limit: 200 },
        { pollingInterval: 10_000 },
    );

    const phases = useMemo(() => {
        const grouped: Record<PhaseKey, PautaListItem[]> = { picking: [], bay: [], counting: [], checkout: [], audit: [], dispatched: [] };
        if (!data?.results) return grouped;
        for (const p of data.results) {
            const phase = STATUS_TO_PHASE[p.status];
            if (phase) grouped[phase].push(p);
        }
        return grouped;
    }, [data]);

    const stats = useMemo(() => ({
        total: data?.results?.length ?? 0,
        picking: phases.picking.length,
        bay: phases.bay.length,
        counting: phases.counting.length,
        checkout: phases.checkout.length,
        audit: phases.audit.length,
        dispatched: phases.dispatched.length,
    }), [data, phases]);

    // ── Mutations ───────────────────────────────────────────────────────────
    const [assignPicker, { isLoading: assigningPicker }] = useAssignPickerMutation();
    const [startPicking] = useStartPickingMutation();
    const [completePicking] = useCompletePickingMutation();
    const [assignBay, { isLoading: assigningBay }] = useAssignBayMutation();
    const [completeLoading] = useCompleteLoadingMutation();
    const [assignCounter, { isLoading: assigningCounter }] = useAssignCounterMutation();
    const [completeCount] = useCompleteCountMutation();
    const [checkoutSecurity, { isLoading: checkingSecurity }] = useCheckoutSecurityMutation();
    const [checkoutOps, { isLoading: checkingOps }] = useCheckoutOpsMutation();
    const [dispatchPauta] = useDispatchPautaMutation();

    // ── Dialog ──────────────────────────────────────────────────────────────
    const [dialogState, dialogDispatch] = useReducer(dialogReducer, { type: 'closed' });
    const [selectedPersonnel, setSelectedPersonnel] = useState<PersonnelProfileList | null>(null);
    const [selectedBay, setSelectedBay] = useState<Bay | null>(null);
    const [selectedYardDriver, setSelectedYardDriver] = useState<PersonnelProfileList | null>(null);
    const [personnelSearch, setPersonnelSearch] = useState('');

    const dialogOpen = dialogState.type !== 'closed';
    const needsPersonnel = dialogState.type === 'assign-picker' || dialogState.type === 'assign-counter'
        || dialogState.type === 'checkout-security' || dialogState.type === 'checkout-ops';
    const needsBay = dialogState.type === 'assign-bay';

    const { data: personnelData, isLoading: loadingPersonnel } = useGetPersonnelProfilesQuery(
        { search: personnelSearch || undefined, is_active: true, limit: 50 },
        { skip: !dialogOpen || (!needsPersonnel && !needsBay) },
    );

    const { data: baysData, isLoading: loadingBays } = useGetBaysQuery(undefined, { skip: !needsBay });

    // ── Snackbar ────────────────────────────────────────────────────────────
    const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    const showSnack = (message: string, severity: 'success' | 'error' = 'success') => setSnack({ open: true, message, severity });

    // ── Handlers ────────────────────────────────────────────────────────────
    const openDialog = (dialogType: DialogType, pauta: PautaListItem) => {
        setSelectedPersonnel(null);
        setSelectedBay(null);
        setSelectedYardDriver(null);
        setPersonnelSearch('');
        dialogDispatch({ type: 'OPEN', dialogType, pauta });
    };

    const closeDialog = () => dialogDispatch({ type: 'CLOSE' });

    const handleDialogConfirm = async () => {
        if (dialogState.type === 'closed') return;
        const pauta = dialogState.pauta;
        try {
            switch (dialogState.type) {
                case 'assign-picker':
                    if (!selectedPersonnel) return;
                    await assignPicker({ id: pauta.id, personnel_id: selectedPersonnel.id }).unwrap();
                    showSnack('Picker asignado');
                    break;
                case 'assign-bay':
                    if (!selectedBay) return;
                    await assignBay({ id: pauta.id, bay_id: selectedBay.id, yard_driver_id: selectedYardDriver?.id }).unwrap();
                    showSnack('Bahía asignada');
                    break;
                case 'assign-counter':
                    if (!selectedPersonnel) return;
                    await assignCounter({ id: pauta.id, personnel_id: selectedPersonnel.id }).unwrap();
                    showSnack('Contador asignado');
                    break;
                case 'checkout-security':
                    if (!selectedPersonnel) return;
                    await checkoutSecurity({ id: pauta.id, validator_id: selectedPersonnel.id }).unwrap();
                    showSnack('Checkout seguridad completado');
                    break;
                case 'checkout-ops':
                    if (!selectedPersonnel) return;
                    await checkoutOps({ id: pauta.id, validator_id: selectedPersonnel.id }).unwrap();
                    showSnack('Checkout operaciones completado');
                    break;
            }
            closeDialog();
        } catch (err: any) {
            showSnack(err?.data?.detail || err?.data?.error || 'Error al ejecutar la acción', 'error');
        }
    };

    const handleDirectAction = async (pauta: PautaListItem, action: string) => {
        try {
            switch (action) {
                case 'startPicking': await startPicking(pauta.id).unwrap(); showSnack('Picking iniciado'); break;
                case 'completePicking': await completePicking(pauta.id).unwrap(); showSnack('Picking completado'); break;
                case 'completeLoading': await completeLoading(pauta.id).unwrap(); showSnack('Carga completada'); break;
                case 'completeCount': await completeCount(pauta.id).unwrap(); showSnack('Conteo completado'); break;
                case 'dispatch': await dispatchPauta(pauta.id).unwrap(); showSnack('Pauta despachada'); break;
            }
        } catch (err: any) {
            showSnack(err?.data?.detail || err?.data?.error || 'Error al ejecutar la acción', 'error');
        }
    };

    const handleAction = (pauta: PautaListItem) => {
        switch (pauta.status) {
            case 'PENDING_PICKING': openDialog('assign-picker', pauta); break;
            case 'PICKING_ASSIGNED': handleDirectAction(pauta, 'startPicking'); break;
            case 'PICKING_IN_PROGRESS': handleDirectAction(pauta, 'completePicking'); break;
            case 'PICKING_DONE': openDialog('assign-bay', pauta); break;
            case 'IN_BAY': handleDirectAction(pauta, 'completeLoading'); break;
            case 'PENDING_COUNT': openDialog('assign-counter', pauta); break;
            case 'COUNTING': navigate(`/truck-cycle/verify/${pauta.id}`); break;
            case 'COUNTED': navigate(`/truck-cycle/verify/${pauta.id}?phase=CHECKOUT`); break;
            case 'CHECKOUT_SECURITY': navigate(`/truck-cycle/verify/${pauta.id}?phase=CHECKOUT_OPS`); break;
            case 'CHECKOUT_OPS': handleDirectAction(pauta, 'dispatch'); break;
            case 'IN_AUDIT': navigate(`/truck-cycle/verify/${pauta.id}?phase=AUDIT`); break;
            case 'AUDIT_COMPLETE': navigate(`/truck-cycle/pautas/${pauta.id}`); break;
        }
    };

    // ── Action button config ────────────────────────────────────────────────
    const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: 'primary' | 'success' | 'warning' | 'secondary' | 'error'; variant: 'outlined' | 'contained' }> = {
        PENDING_PICKING: { label: 'Asignar', icon: <AssignIcon />, color: 'primary', variant: 'outlined' },
        PICKING_ASSIGNED: { label: 'Iniciar', icon: <StartIcon />, color: 'primary', variant: 'contained' },
        PICKING_IN_PROGRESS: { label: 'Completar', icon: <CompleteIcon />, color: 'success', variant: 'contained' },
        PICKING_DONE: { label: 'Bahía', icon: <BayIcon />, color: 'warning', variant: 'outlined' },
        IN_BAY: { label: 'Carga OK', icon: <CompleteIcon />, color: 'success', variant: 'contained' },
        PENDING_COUNT: { label: 'Asignar', icon: <AssignIcon />, color: 'primary', variant: 'outlined' },
        COUNTING: { label: 'Verificar', icon: <CountIcon />, color: 'primary', variant: 'contained' },
        COUNTED: { label: 'Seguridad', icon: <SecurityIcon />, color: 'primary', variant: 'outlined' },
        CHECKOUT_SECURITY: { label: 'Ops', icon: <OpsIcon />, color: 'secondary', variant: 'contained' },
        CHECKOUT_OPS: { label: 'Despachar', icon: <DispatchIcon />, color: 'success', variant: 'contained' },
        IN_AUDIT: { label: 'Auditar', icon: <AuditIcon />, color: 'warning', variant: 'contained' },
        AUDIT_COMPLETE: { label: 'Ver Detalle', icon: <CompleteIcon />, color: 'success', variant: 'outlined' },
    };

    const IN_PROGRESS_STATUSES = new Set(['PICKING_IN_PROGRESS', 'COUNTING']);

    // ── Columns builder ─────────────────────────────────────────────────────
    const buildColumns = useCallback((): GridColDef[] => {
        const cols: GridColDef[] = [];

        if (isMobile) {
            cols.push({
                field: 'info',
                headerName: 'Pauta',
                flex: 1,
                minWidth: 180,
                sortable: false,
                renderCell: (params: GridRenderCellParams) => (
                    <Box sx={{ py: 0.5 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                            T-{params.row.transport_number} / V-{params.row.trip_number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {params.row.truck_code || '?'} - {params.row.truck_plate} · {params.row.total_boxes} cajas
                        </Typography>
                        <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            <PautaStatusBadge status={params.row.status as PautaStatus} />
                            {IN_PROGRESS_STATUSES.has(params.row.status) && params.row.last_status_change && (
                                <ElapsedTimer since={params.row.last_status_change} />
                            )}
                        </Box>
                    </Box>
                ),
            });
        } else {
            cols.push(
                { field: 'transport_number', headerName: 'Transporte', width: 120 },
                { field: 'trip_number', headerName: 'Viaje', width: 70 },
                {
                    field: 'truck_code',
                    headerName: 'Camión',
                    width: 130,
                    renderCell: (params: GridRenderCellParams) => (
                        <Typography variant="body2" noWrap>{params.row.truck_code || '?'} - {params.row.truck_plate}</Typography>
                    ),
                },
                { field: 'total_boxes', headerName: 'Cajas', width: 80, align: 'right', headerAlign: 'right' },
                {
                    field: 'assigned_to',
                    headerName: 'Asignado',
                    flex: 1,
                    minWidth: 140,
                    renderCell: (params: GridRenderCellParams) => {
                        const assigned = params.row.assigned_to;
                        if (!assigned) return <Typography variant="body2" color="text.disabled">—</Typography>;
                        return (
                            <Box>
                                <Typography variant="body2" fontWeight={500} noWrap>{assigned.name}</Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>{assigned.role}</Typography>
                            </Box>
                        );
                    },
                },
                {
                    field: 'status',
                    headerName: 'Estado',
                    width: 260,
                    minWidth: 180,
                    renderCell: (params: GridRenderCellParams) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <PautaStatusBadge status={params.value as PautaStatus} />
                            {params.row.bay_code && (
                                <Chip label={params.row.bay_code} size="small" variant="outlined" color="warning" sx={{ fontSize: '0.7rem' }} />
                            )}
                            {IN_PROGRESS_STATUSES.has(params.value) && params.row.last_status_change && (
                                <ElapsedTimer since={params.row.last_status_change} />
                            )}
                        </Box>
                    ),
                },
            );
        }

        // Action
        cols.push({
            field: 'action',
            headerName: 'Acción',
            width: isMobile ? 55 : 130,
            sortable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams) => {
                const cfg = ACTION_CONFIG[params.row.status];
                if (!cfg) return null;
                return (
                    <Tooltip title={cfg.label}>
                        <Button
                            size="small"
                            variant={cfg.variant}
                            color={cfg.color}
                            startIcon={!isMobile ? cfg.icon : undefined}
                            onClick={(e) => { e.stopPropagation(); handleAction(params.row); }}
                            sx={{ minWidth: isMobile ? 36 : undefined, px: isMobile ? 1 : undefined }}
                        >
                            {isMobile ? cfg.icon : cfg.label}
                        </Button>
                    </Tooltip>
                );
            },
        });

        // View detail
        cols.push({
            field: 'view',
            headerName: '',
            width: 45,
            sortable: false,
            align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Tooltip title="Ver Detalle">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/truck-cycle/pautas/${params.row.id}`); }}>
                        <ViewIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            ),
        });

        return cols;
    }, [isMobile, navigate]);

    const columns = useMemo(() => buildColumns(), [buildColumns]);

    // ── Dialog confirm disabled ─────────────────────────────────────────────
    const isDialogSubmitting = assigningPicker || assigningBay || assigningCounter || checkingSecurity || checkingOps;
    const confirmDisabled = isDialogSubmitting
        || (needsPersonnel && !selectedPersonnel)
        || (needsBay && !selectedBay);

    // ── Personnel autocomplete ──────────────────────────────────────────────
    const personnelOptions: PersonnelProfileList[] = personnelData?.results || [];
    const bayOptions: Bay[] = (baysData as any)?.results || (Array.isArray(baysData) ? baysData : []);

    // ── Render ──────────────────────────────────────────────────────────────
    if (error) {
        return (
            <Container maxWidth="xl" sx={{ mt: 2 }}>
                <Alert severity="error">Error al cargar las pautas.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={600}>
                    Operaciones del Día
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {new Date().toLocaleDateString('es-HN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
            </Box>

            {/* Stats */}
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
                {([
                    { title: 'Total', value: stats.total, icon: <TotalIcon />, color: '#455a64' },
                    { title: 'Picking', value: stats.picking, icon: <BoxIcon />, color: '#1976d2' },
                    { title: 'Bahía', value: stats.bay, icon: <BayIcon />, color: '#ed6c02' },
                    { title: 'Conteo', value: stats.counting, icon: <CountIcon />, color: '#0288d1' },
                    { title: 'Checkout', value: stats.checkout, icon: <SecurityIcon />, color: '#9c27b0' },
                    { title: 'Auditoría', value: stats.audit, icon: <AuditIcon />, color: '#e65100' },
                    { title: 'Despachados', value: stats.dispatched, icon: <TruckIcon />, color: '#2e7d32' },
                ] as const).map((s) => (
                    <Grid item xs={4} sm={2} key={s.title}>
                        <StatCard {...s} />
                    </Grid>
                ))}
            </Grid>

            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Phase Sections */}
            {!isLoading && PHASE_ORDER.map((phaseKey) => {
                const cfg = PHASE_CONFIG[phaseKey];
                const pautas = phases[phaseKey];
                if (pautas.length === 0) return null;

                return (
                    <Accordion
                        key={phaseKey}
                        defaultExpanded={phaseKey !== 'dispatched'}
                        sx={{
                            mb: 1.5,
                            '&:before': { display: 'none' },
                            borderRadius: '8px !important',
                            overflow: 'hidden',
                            border: `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandIcon />}
                            sx={{
                                bgcolor: cfg.color,
                                color: '#fff',
                                minHeight: 48,
                                '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1.5, my: 0.5 },
                                '& .MuiSvgIcon-root': { color: '#fff' },
                            }}
                        >
                            {cfg.icon}
                            <Typography fontWeight={700} sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                                {cfg.label}
                            </Typography>
                            <Chip
                                label={pautas.length}
                                size="small"
                                sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#fff', fontWeight: 700, height: 24, minWidth: 32 }}
                            />
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                            <DataGrid
                                rows={pautas}
                                columns={columns}
                                disableRowSelectionOnClick
                                autoHeight
                                rowHeight={isMobile ? 80 : 52}
                                hideFooter={pautas.length <= 25}
                                pageSizeOptions={[25, 50]}
                                initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                                loading={isFetching}
                                sx={{
                                    border: 0,
                                    '& .MuiDataGrid-cell': { fontSize: isMobile ? '0.8125rem' : '0.875rem', py: isMobile ? 1.5 : 1 },
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                        fontSize: isMobile ? '0.8125rem' : '0.875rem',
                                        fontWeight: 600,
                                    },
                                }}
                                slots={{
                                    noRowsOverlay: () => (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                            <Typography variant="body2" color="text.secondary">Sin pautas en esta fase.</Typography>
                                        </Box>
                                    ),
                                }}
                            />
                        </AccordionDetails>
                    </Accordion>
                );
            })}

            {!isLoading && stats.total === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <TruckIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No hay pautas activas para hoy</Typography>
                </Box>
            )}

            {/* ── Assignment Dialog ───────────────────────────────────────── */}
            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{dialogState.type !== 'closed' ? DIALOG_TITLES[dialogState.type] : ''}</DialogTitle>
                <DialogContent>
                    {dialogState.type !== 'closed' && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            T-{dialogState.pauta.transport_number} / V-{dialogState.pauta.trip_number} — {dialogState.pauta.truck_code} ({dialogState.pauta.total_boxes} cajas)
                        </Typography>
                    )}

                    {/* Personnel autocomplete (picker, counter, validators) */}
                    {needsPersonnel && (
                        <Autocomplete
                            options={personnelOptions}
                            getOptionLabel={(o) => `${o.employee_code} - ${o.full_name}`}
                            value={selectedPersonnel}
                            onChange={(_, v) => setSelectedPersonnel(v)}
                            onInputChange={(_, v) => setPersonnelSearch(v)}
                            loading={loadingPersonnel}
                            isOptionEqualToValue={(a, b) => a.id === b.id}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Seleccionar Personal"
                                    placeholder="Buscar por nombre o código..."
                                    fullWidth
                                    sx={{ mt: 1 }}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingPersonnel ? <CircularProgress size={18} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props} key={option.id}>
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>{option.full_name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{option.employee_code} - {option.position}</Typography>
                                    </Box>
                                </li>
                            )}
                            noOptionsText="Sin resultados"
                            loadingText="Cargando..."
                        />
                    )}

                    {/* Bay selection */}
                    {needsBay && (
                        <>
                            <Autocomplete
                                options={bayOptions.filter((b) => b.is_active)}
                                getOptionLabel={(o) => `${o.code} - ${o.name}`}
                                value={selectedBay}
                                onChange={(_, v) => setSelectedBay(v)}
                                loading={loadingBays}
                                isOptionEqualToValue={(a, b) => a.id === b.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Seleccionar Bahía"
                                        placeholder="Buscar bahía..."
                                        fullWidth
                                        sx={{ mt: 1 }}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loadingBays ? <CircularProgress size={18} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props} key={option.id}>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>{option.code}</Typography>
                                            <Typography variant="caption" color="text.secondary">{option.name}</Typography>
                                        </Box>
                                    </li>
                                )}
                                noOptionsText="Sin bahías disponibles"
                                loadingText="Cargando..."
                            />

                            {/* Optional yard driver */}
                            <Autocomplete
                                options={personnelOptions}
                                getOptionLabel={(o) => `${o.employee_code} - ${o.full_name}`}
                                value={selectedYardDriver}
                                onChange={(_, v) => setSelectedYardDriver(v)}
                                onInputChange={(_, v) => setPersonnelSearch(v)}
                                loading={loadingPersonnel}
                                isOptionEqualToValue={(a, b) => a.id === b.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Conductor de Patio (opcional)"
                                        placeholder="Buscar personal..."
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loadingPersonnel ? <CircularProgress size={18} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props} key={option.id}>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>{option.full_name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{option.employee_code} - {option.position}</Typography>
                                        </Box>
                                    </li>
                                )}
                                noOptionsText="Sin resultados"
                                loadingText="Cargando..."
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleDialogConfirm}
                        disabled={confirmDisabled}
                        startIcon={isDialogSubmitting ? <CircularProgress size={16} /> : undefined}
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snack.open}
                autoHideDuration={3000}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} variant="filled">
                    {snack.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
