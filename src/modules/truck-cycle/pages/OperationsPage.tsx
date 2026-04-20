import { useState, useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import DatePickerButton from '../components/DatePickerButton';
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
    Snackbar,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    PersonAdd as AssignIcon,
    PlayArrow as StartIcon,
    CheckCircle as CompleteIcon,
    Visibility as ViewIcon,
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
import { useTruckCycleSocket } from '../hooks/useTruckCycleSocket';
import {
    useGetPautasQuery,
    useGetBaysQuery,
    useGetTrucksQuery,
    useAssignPickerMutation,
    useStartPickingMutation,
    useCompletePickingMutation,
    useAssignYardDriverMutation,
    usePositionAtBayMutation,
    useReloadReentryMutation,
    useCompleteLoadingMutation,
    useAssignCounterMutation,
    useCompleteCountMutation,
    useCheckoutSecurityMutation,
    useCheckoutOpsMutation,
    useDispatchPautaMutation,
} from '../services/truckCycleApi';
import {
    useGetPersonnelAutocompleteQuery,
    type PersonnelAutocompleteItem,
} from '../../personnel/services/personnelApi';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import {
    setOperationsDate,
    toggleOperationsPhase,
    OperationsPhaseKey,
} from '../store/truckCycleFiltersSlice';
import type { PautaListItem, PautaStatus, Bay, Truck } from '../interfaces/truckCycle';
import BayGridPicker, { type BayOccupancy, type DockPosition } from '../components/BayGridPicker';

// Position types used for each assignment dialog (backend filter).
// Soporta lista separada por comas en el endpoint autocomplete.
const POSITION_TYPE_BY_DIALOG: Record<string, string> = {
    'assign-picker': 'PICKER,LOADER',
    'assign-yard-driver': 'YARD_DRIVER',
    'assign-counter': 'WAREHOUSE_ASSISTANT',
    'checkout-security': 'SECURITY_GUARD',
    'checkout-ops': 'WAREHOUSE_ASSISTANT',
};

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

// ─── Phase config ───────────────────────────────────────────────────────────
const PHASE_CONFIG: Record<OperationsPhaseKey, { label: string; color: string; icon: React.ReactNode; statuses: PautaStatus[] }> = {
    picking: {
        label: 'Picking',
        color: '#1976d2',
        icon: <BoxIcon />,
        statuses: ['PENDING_PICKING', 'PICKING_ASSIGNED', 'PICKING_IN_PROGRESS', 'PICKING_DONE'],
    },
    bay: {
        label: 'Bahía',
        color: '#ed6c02',
        icon: <BayIcon />,
        statuses: ['MOVING_TO_BAY', 'IN_BAY'],
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

const PHASE_ORDER: OperationsPhaseKey[] = ['picking', 'bay', 'counting', 'checkout', 'audit', 'dispatched'];

const STATUS_TO_PHASE: Record<string, OperationsPhaseKey> = {};
for (const [phase, cfg] of Object.entries(PHASE_CONFIG)) {
    for (const s of cfg.statuses) STATUS_TO_PHASE[s] = phase as OperationsPhaseKey;
}

const ACTIVE_STATUSES = Object.values(PHASE_CONFIG).flatMap((c) => c.statuses).join(',');

// ─── Selectable Stat Card ───────────────────────────────────────────────────
interface PhaseStatCardProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    selected: boolean;
    onToggle: () => void;
}

const PhaseStatCard = ({ label, value, icon, color, selected, onToggle }: PhaseStatCardProps) => (
    <Card
        elevation={selected ? 6 : 2}
        onClick={onToggle}
        sx={{
            height: '100%',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'all 0.2s',
            border: '2px solid',
            borderColor: selected ? color : 'transparent',
            bgcolor: selected ? `${color}14` : 'background.paper',
            '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
        }}
    >
        <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' }, fontWeight: 600, display: 'block', textTransform: 'uppercase' }} noWrap>
                        {label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color, fontSize: { xs: '1.1rem', sm: '1.5rem' }, mt: 0.25, lineHeight: 1.1 }}>
                        {value}
                    </Typography>
                </Box>
                <Avatar sx={{ bgcolor: color, opacity: selected ? 1 : 0.85, width: { xs: 28, sm: 40 }, height: { xs: 28, sm: 40 } }}>
                    {icon}
                </Avatar>
            </Box>
        </CardContent>
    </Card>
);

// ─── Dialog state ───────────────────────────────────────────────────────────
type DialogType =
    | 'assign-picker'
    | 'assign-yard-driver'
    | 'position-at-bay'
    | 'reload-reentry'
    | 'assign-counter'
    | 'checkout-security'
    | 'checkout-ops';
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
    'assign-yard-driver': 'Asignar Chofer de Patio',
    'position-at-bay': 'Posicionar en Bahía',
    'reload-reentry': 'Re-ingreso de Recarga',
    'assign-counter': 'Asignar Contador',
    'checkout-security': 'Checkout Seguridad',
    'checkout-ops': 'Checkout Operaciones (Opcional)',
};

// ═════════════════════════════════════════════════════════════════════════════
export default function OperationsPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Persistent filters from store
    const { date, phases: selectedPhases } = useAppSelector((s) => s.truckCycleFilters.operations);
    const currentDcId = useAppSelector((s) => s.auth.user?.centro_distribucion);

    // Dirección del muelle leída de localStorage (configurada en el editor por CD).
    const dockPosition = useMemo<DockPosition>(() => {
        const key = `bayDock_${currentDcId ?? 'default'}`;
        const stored = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
        return (stored === 'top' || stored === 'bottom' || stored === 'left' || stored === 'right') ? stored : 'top';
    }, [currentDcId]);

    useTruckCycleSocket();

    // ── Data ────────────────────────────────────────────────────────────────
    const { data, isLoading, isFetching, error } = useGetPautasQuery(
        {
            status: ACTIVE_STATUSES,
            operational_date_after: date,
            operational_date_before: date,
            limit: 500,
        },
        { pollingInterval: 30_000 },
    );

    // Phase counts (for cards)
    const phaseCounts = useMemo(() => {
        const counts: Record<OperationsPhaseKey, number> = { picking: 0, bay: 0, counting: 0, checkout: 0, audit: 0, dispatched: 0 };
        if (!data?.results) return counts;
        for (const p of data.results) {
            const phase = STATUS_TO_PHASE[p.status];
            if (phase) counts[phase]++;
        }
        return counts;
    }, [data]);

    // Filtered rows: if no phase selected → show all. If selected → include only those phases.
    const filteredRows = useMemo(() => {
        if (!data?.results) return [];
        if (selectedPhases.length === 0) return data.results;
        const allowedStatuses = new Set(
            selectedPhases.flatMap((ph) => PHASE_CONFIG[ph].statuses),
        );
        return data.results.filter((p) => allowedStatuses.has(p.status as PautaStatus));
    }, [data, selectedPhases]);

    // Bay occupancy map: bayId -> {transport, truck} para el BayGridPicker.
    const bayOccupancy = useMemo<Record<number, BayOccupancy>>(() => {
        const map: Record<number, BayOccupancy> = {};
        if (!data?.results) return map;
        for (const p of data.results) {
            if (p.bay_id && p.status !== 'DISPATCHED') {
                map[p.bay_id] = {
                    transportNumber: p.transport_number,
                    truckCode: p.truck_code,
                    truckPlate: p.truck_plate,
                    status: p.status,
                };
            }
        }
        return map;
    }, [data]);

    // ── Mutations ───────────────────────────────────────────────────────────
    const [assignPicker, { isLoading: assigningPicker }] = useAssignPickerMutation();
    const [startPicking] = useStartPickingMutation();
    const [completePicking] = useCompletePickingMutation();
    const [assignYardDriver, { isLoading: assigningYardDriver }] = useAssignYardDriverMutation();
    const [positionAtBay, { isLoading: positioningBay }] = usePositionAtBayMutation();
    const [reloadReentry, { isLoading: reentering }] = useReloadReentryMutation();
    const [completeLoading] = useCompleteLoadingMutation();
    const [assignCounter, { isLoading: assigningCounter }] = useAssignCounterMutation();
    const [completeCount] = useCompleteCountMutation();
    const [checkoutSecurity, { isLoading: checkingSecurity }] = useCheckoutSecurityMutation();
    const [checkoutOps, { isLoading: checkingOps }] = useCheckoutOpsMutation();
    const [dispatchPauta] = useDispatchPautaMutation();

    // ── Dialog ──────────────────────────────────────────────────────────────
    const [dialogState, dialogDispatch] = useReducer(dialogReducer, { type: 'closed' });
    const [selectedPersonnel, setSelectedPersonnel] = useState<PersonnelAutocompleteItem | null>(null);
    const [selectedBay, setSelectedBay] = useState<Bay | null>(null);
    const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
    const [personnelSearch, setPersonnelSearch] = useState('');

    const dialogOpen = dialogState.type !== 'closed';
    const needsPersonnel = dialogState.type === 'assign-picker'
        || dialogState.type === 'assign-yard-driver'
        || dialogState.type === 'assign-counter'
        || dialogState.type === 'checkout-security'
        || dialogState.type === 'checkout-ops';
    const needsBay = dialogState.type === 'position-at-bay' || dialogState.type === 'reload-reentry';
    const needsTruck = dialogState.type === 'reload-reentry';
    const positionTypeFilter = dialogState.type !== 'closed' ? POSITION_TYPE_BY_DIALOG[dialogState.type] : undefined;

    const { data: personnelData, isLoading: loadingPersonnel } = useGetPersonnelAutocompleteQuery(
        {
            search: personnelSearch || undefined,
            is_active: true,
            position_type: positionTypeFilter,
            limit: 50,
        },
        { skip: !dialogOpen || !needsPersonnel || !positionTypeFilter },
    );

    const { data: baysData, isLoading: loadingBays } = useGetBaysQuery(undefined, { skip: !needsBay });
    const { data: trucksData, isLoading: loadingTrucks } = useGetTrucksQuery(
        { is_active: true, limit: 200 },
        { skip: !needsTruck },
    );

    // ── Snackbar ────────────────────────────────────────────────────────────
    const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
    const showSnack = (message: string, severity: 'success' | 'error' = 'success') => setSnack({ open: true, message, severity });

    // ── Handlers ────────────────────────────────────────────────────────────
    const openDialog = (dialogType: DialogType, pauta: PautaListItem) => {
        setSelectedPersonnel(null);
        setSelectedBay(null);
        setSelectedTruck(null);
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
                case 'assign-yard-driver':
                    if (!selectedPersonnel) return;
                    await assignYardDriver({ id: pauta.id, personnel_id: selectedPersonnel.id }).unwrap();
                    showSnack('Chofer de patio asignado — iniciando movimiento');
                    break;
                case 'position-at-bay':
                    if (!selectedBay) return;
                    await positionAtBay({ id: pauta.id, bay_id: selectedBay.id }).unwrap();
                    showSnack('Camión posicionado en bahía');
                    break;
                case 'reload-reentry':
                    if (!selectedTruck || !selectedBay) return;
                    await reloadReentry({
                        id: pauta.id,
                        truck_id: selectedTruck.id,
                        bay_id: selectedBay.id,
                    }).unwrap();
                    showSnack('Re-ingreso registrado');
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
                    showSnack('Checkout operaciones completado (opcional)');
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
                case 'dispatch': await dispatchPauta({ id: pauta.id }).unwrap(); showSnack('Pauta despachada'); break;
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
            case 'PICKING_DONE':
                // Recarga: si no re-ingresó, abrir dialog de re-ingreso; si ya re-ingresó, el backend ya auto-avanzó.
                // Carga (trip 1): asignar chofer de patio.
                if (pauta.is_reload) {
                    if (!pauta.reentered_at) openDialog('reload-reentry', pauta);
                } else {
                    openDialog('assign-yard-driver', pauta);
                }
                break;
            case 'MOVING_TO_BAY': openDialog('position-at-bay', pauta); break;
            case 'IN_BAY': handleDirectAction(pauta, 'completeLoading'); break;
            case 'PENDING_COUNT': openDialog('assign-counter', pauta); break;
            case 'COUNTING': navigate(`/truck-cycle/verify/${pauta.id}`); break;
            case 'COUNTED': navigate(`/truck-cycle/verify/${pauta.id}?phase=CHECKOUT`); break;
            case 'CHECKOUT_SECURITY':
                // Ops es opcional — acción primaria = Despachar directo.
                handleDirectAction(pauta, 'dispatch');
                break;
            case 'CHECKOUT_OPS': handleDirectAction(pauta, 'dispatch'); break;
            case 'IN_AUDIT': navigate(`/truck-cycle/verify/${pauta.id}?phase=AUDIT`); break;
            case 'AUDIT_COMPLETE': navigate(`/truck-cycle/pautas/${pauta.id}`); break;
        }
    };

    // Secondary action for CHECKOUT_SECURITY: open optional Ops dialog.
    const handleSecondaryAction = (pauta: PautaListItem) => {
        if (pauta.status === 'CHECKOUT_SECURITY') {
            openDialog('checkout-ops', pauta);
        } else if (pauta.status === 'PICKING_DONE' && pauta.is_reload && !pauta.reentered_at) {
            openDialog('reload-reentry', pauta);
        }
    };

    // ── Action button config ────────────────────────────────────────────────
    type ActionCfg = { label: string; icon: React.ReactNode; color: 'primary' | 'success' | 'warning' | 'secondary' | 'error'; variant: 'outlined' | 'contained' };
    const ACTION_CONFIG: Record<string, ActionCfg> = {
        PENDING_PICKING: { label: 'Asignar', icon: <AssignIcon />, color: 'primary', variant: 'outlined' },
        PICKING_ASSIGNED: { label: 'Iniciar', icon: <StartIcon />, color: 'primary', variant: 'contained' },
        PICKING_IN_PROGRESS: { label: 'Completar', icon: <CompleteIcon />, color: 'success', variant: 'contained' },
        // Overridden per-row below for recargas (Re-ingreso vs Chofer).
        PICKING_DONE: { label: 'Chofer', icon: <AssignIcon />, color: 'warning', variant: 'outlined' },
        MOVING_TO_BAY: { label: 'Posicionar', icon: <BayIcon />, color: 'warning', variant: 'contained' },
        IN_BAY: { label: 'Carga OK', icon: <CompleteIcon />, color: 'success', variant: 'contained' },
        PENDING_COUNT: { label: 'Asignar', icon: <AssignIcon />, color: 'primary', variant: 'outlined' },
        COUNTING: { label: 'Verificar', icon: <CountIcon />, color: 'primary', variant: 'contained' },
        COUNTED: { label: 'Seguridad', icon: <SecurityIcon />, color: 'primary', variant: 'outlined' },
        CHECKOUT_SECURITY: { label: 'Despachar', icon: <DispatchIcon />, color: 'success', variant: 'contained' },
        CHECKOUT_OPS: { label: 'Despachar', icon: <DispatchIcon />, color: 'success', variant: 'contained' },
        IN_AUDIT: { label: 'Auditar', icon: <AuditIcon />, color: 'warning', variant: 'contained' },
        AUDIT_COMPLETE: { label: 'Ver Detalle', icon: <CompleteIcon />, color: 'success', variant: 'outlined' },
    };

    const getActionCfg = (pauta: PautaListItem): ActionCfg | null => {
        if (pauta.status === 'PICKING_DONE' && pauta.is_reload) {
            if (!pauta.reentered_at) {
                return { label: 'Re-ingreso', icon: <TruckIcon />, color: 'warning', variant: 'contained' };
            }
            // reingresada — el backend ya debió auto-avanzar; no acción aquí.
            return null;
        }
        return ACTION_CONFIG[pauta.status] || null;
    };

    const getSecondaryCfg = (pauta: PautaListItem): ActionCfg | null => {
        if (pauta.status === 'CHECKOUT_SECURITY') {
            return { label: 'Ops', icon: <OpsIcon />, color: 'secondary', variant: 'outlined' };
        }
        return null;
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
                    width: 140,
                    renderCell: (params: GridRenderCellParams) => (
                        <Typography variant="body2" noWrap>{params.row.truck_code || '?'} - {params.row.truck_plate}</Typography>
                    ),
                },
                { field: 'total_boxes', headerName: 'Cajas', width: 80, align: 'right', headerAlign: 'right' },
                {
                    field: 'phase',
                    headerName: 'Fase',
                    width: 120,
                    renderCell: (params: GridRenderCellParams) => {
                        const phase = STATUS_TO_PHASE[params.row.status];
                        if (!phase) return null;
                        const cfg = PHASE_CONFIG[phase];
                        return (
                            <Chip
                                size="small"
                                label={cfg.label}
                                icon={cfg.icon as any}
                                sx={{ bgcolor: `${cfg.color}22`, color: cfg.color, fontWeight: 600, '& .MuiChip-icon': { color: cfg.color } }}
                            />
                        );
                    },
                },
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

        cols.push({
            field: 'action',
            headerName: 'Acción',
            width: isMobile ? 90 : 210,
            sortable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams) => {
                const pauta = params.row as PautaListItem;
                const cfg = getActionCfg(pauta);
                const secondary = getSecondaryCfg(pauta);
                return (
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        {cfg && (
                            <Tooltip title={cfg.label}>
                                <Button
                                    size="small"
                                    variant={cfg.variant}
                                    color={cfg.color}
                                    startIcon={!isMobile ? cfg.icon : undefined}
                                    onClick={(e) => { e.stopPropagation(); handleAction(pauta); }}
                                    sx={{ minWidth: isMobile ? 36 : undefined, px: isMobile ? 1 : undefined }}
                                >
                                    {isMobile ? cfg.icon : cfg.label}
                                </Button>
                            </Tooltip>
                        )}
                        {secondary && (
                            <Tooltip title={secondary.label}>
                                <Button
                                    size="small"
                                    variant={secondary.variant}
                                    color={secondary.color}
                                    startIcon={!isMobile ? secondary.icon : undefined}
                                    onClick={(e) => { e.stopPropagation(); handleSecondaryAction(pauta); }}
                                    sx={{ minWidth: isMobile ? 36 : undefined, px: isMobile ? 1 : undefined }}
                                >
                                    {isMobile ? secondary.icon : secondary.label}
                                </Button>
                            </Tooltip>
                        )}
                    </Box>
                );
            },
        });

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
    const isDialogSubmitting = assigningPicker || assigningYardDriver || positioningBay || reentering || assigningCounter || checkingSecurity || checkingOps;
    const confirmDisabled = isDialogSubmitting
        || (needsPersonnel && !selectedPersonnel)
        || (needsBay && !selectedBay)
        || (needsTruck && !selectedTruck);

    const personnelOptions: PersonnelAutocompleteItem[] = personnelData || [];
    const bayOptions: Bay[] = (baysData as any)?.results || (Array.isArray(baysData) ? baysData : []);
    const truckOptions: Truck[] = (trucksData as any)?.results || (Array.isArray(trucksData) ? trucksData : []);

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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                <Box>
                    <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={600}>
                        Operaciones
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {selectedPhases.length === 0
                            ? 'Mostrando todas las fases activas'
                            : `Filtrando por: ${selectedPhases.map((p) => PHASE_CONFIG[p].label).join(', ')}`}
                    </Typography>
                </Box>
                <DatePickerButton
                    value={date}
                    onChange={(v) => dispatch(setOperationsDate(v))}
                    label="Fecha"
                />
            </Box>

            {/* Phase filter cards (single row, no Total) */}
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {PHASE_ORDER.map((phaseKey) => {
                    const cfg = PHASE_CONFIG[phaseKey];
                    return (
                        <Grid item xs={4} sm={2} key={phaseKey}>
                            <PhaseStatCard
                                label={cfg.label}
                                value={phaseCounts[phaseKey]}
                                icon={cfg.icon}
                                color={cfg.color}
                                selected={selectedPhases.includes(phaseKey)}
                                onToggle={() => dispatch(toggleOperationsPhase(phaseKey))}
                            />
                        </Grid>
                    );
                })}
            </Grid>

            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Single Table */}
            {!isLoading && (
                <Card variant="outlined">
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        disableRowSelectionOnClick
                        autoHeight
                        rowHeight={isMobile ? 80 : 56}
                        pageSizeOptions={[25, 50, 100]}
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
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', py: 6, flexDirection: 'column', gap: 1 }}>
                                    <TruckIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedPhases.length > 0
                                            ? 'Sin pautas en las fases seleccionadas.'
                                            : 'No hay pautas activas para esta fecha.'}
                                    </Typography>
                                </Box>
                            ),
                        }}
                    />
                </Card>
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

                    {needsTruck && (
                        <Autocomplete
                            options={truckOptions.filter((t) => t.is_active)}
                            getOptionLabel={(o) => `${o.code} - ${o.plate}`}
                            value={selectedTruck}
                            onChange={(_, v) => setSelectedTruck(v)}
                            loading={loadingTrucks}
                            isOptionEqualToValue={(a, b) => a.id === b.id}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Camión que re-ingresa"
                                    placeholder="Buscar camión..."
                                    fullWidth
                                    sx={{ mt: 1 }}
                                    helperText="Un camión puede traer la pauta de otro camión."
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingTrucks ? <CircularProgress size={18} /> : null}
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
                                        <Typography variant="caption" color="text.secondary">{option.plate}</Typography>
                                    </Box>
                                </li>
                            )}
                            noOptionsText="Sin camiones"
                            loadingText="Cargando..."
                        />
                    )}

                    {needsBay && (
                        <Box sx={{ mt: needsTruck ? 2 : 1 }}>
                            <Typography variant="body2" fontWeight={600} gutterBottom>
                                Seleccionar Bahía
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Toque la bahía donde se posicionará el camión. Las bahías con chip naranja están ocupadas.
                            </Typography>
                            {loadingBays ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : (
                                <BayGridPicker
                                    bays={bayOptions}
                                    value={selectedBay}
                                    onChange={setSelectedBay}
                                    occupied={bayOccupancy}
                                    dockPosition={dockPosition}
                                />
                            )}
                        </Box>
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
