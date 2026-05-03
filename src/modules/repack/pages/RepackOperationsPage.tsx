/**
 * Operaciones del Día · Almacén · Reempaque.
 *
 * Vista del supervisor: ve todas las sesiones del día (activas + cerradas),
 * puede iniciar una nueva asignándole un operario (filtrado por
 * WAREHOUSE_ASSISTANT/LOADER), y puede finalizar o cancelar las activas.
 */
import { useMemo, useState } from 'react';
import {
    Alert,
    Autocomplete,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    PlayArrow as StartIcon,
    Stop as StopIcon,
    Cancel as CancelIcon,
    Add as AddIcon,
    Visibility as ViewIcon,
    Inventory2 as BoxIcon,
    Schedule as ClockIcon,
    Person as PersonIcon,
    TrendingUp as TrendIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { toast } from 'sonner';

import {
    useListSessionsQuery,
    useStartSessionMutation,
    useFinishSessionMutation,
    useCancelSessionMutation,
} from '../services/repackApi';
import { useConfirm } from '../../ui/components/ConfirmDialog';
import type { RepackSession, RepackStatus } from '../interfaces/repack';
import {
    useGetPersonnelAutocompleteQuery,
    type PersonnelAutocompleteItem,
} from '../../personnel/services/personnelApi';
import DatePickerButton from '../../truck-cycle/components/DatePickerButton';

const C = {
    primary:    '#7b1fa2',
    primaryDark: '#5e1782',
    primaryBg:  'rgba(123,31,162,0.08)',
    success:    '#16a34a',
    warning:    '#f59e0b',
    danger:     '#dc2626',
    text:       '#1f2937',
    soft:       '#6b7280',
};

// position_types que pueden hacer reempaque (operarios de almacén).
const REPACK_POSITION_TYPES = 'WAREHOUSE_ASSISTANT,LOADER';


export default function RepackOperationsPage() {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const [date, setDate] = useState(todayStr);
    const [statusFilter, setStatusFilter] = useState<RepackStatus | 'ALL'>('ALL');
    const [startDialog, setStartDialog] = useState(false);

    const { data, isLoading } = useListSessionsQuery({
        operational_date: date,
        ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
        limit: 200,
    });
    const sessions = data?.results || [];

    const stats = useMemo(() => {
        const active = sessions.filter((s) => s.status === 'ACTIVE');
        const completed = sessions.filter((s) => s.status === 'COMPLETED');
        const totalBoxes = sessions.reduce((sum, s) => sum + s.total_boxes, 0);
        const validBph = completed.filter((s) => s.boxes_per_hour > 0);
        const avgBph = validBph.length
            ? Math.round(validBph.reduce((sum, s) => sum + s.boxes_per_hour, 0) / validBph.length * 10) / 10
            : 0;
        return {
            active: active.length,
            completed: completed.length,
            totalBoxes,
            avgBph,
        };
    }, [sessions]);

    return (
        <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4 } }}>
            <Header
                date={date}
                onDateChange={setDate}
                onNew={() => setStartDialog(true)}
            />

            <StatsRow stats={stats} statusFilter={statusFilter} onFilterChange={setStatusFilter} />

            <Card sx={{ borderRadius: 3, mt: 3 }}>
                <CardContent sx={{ p: { xs: 1, md: 2 } }}>
                    <SessionsTable sessions={sessions} loading={isLoading} />
                </CardContent>
            </Card>

            {startDialog && (
                <StartSessionDialog
                    open={startDialog}
                    onClose={() => setStartDialog(false)}
                    operationalDate={date}
                />
            )}
        </Container>
    );
}


function Header({
    date, onDateChange, onNew,
}: {
    date: string;
    onDateChange: (d: string) => void;
    onNew: () => void;
}) {
    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 2, mb: 3, flexWrap: 'wrap',
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: C.primary, width: 44, height: 44 }}>
                    <BoxIcon />
                </Avatar>
                <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                        Operaciones · Reempaque
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sesiones activas y cerradas del día · supervisar y asignar operarios
                    </Typography>
                </Box>
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <DatePickerButton value={date} onChange={onDateChange} />
                <Button
                    variant="contained" onClick={onNew}
                    startIcon={<AddIcon />}
                    sx={{
                        bgcolor: C.primary, textTransform: 'none', fontWeight: 700,
                        '&:hover': { bgcolor: C.primaryDark },
                    }}
                >
                    Iniciar sesión
                </Button>
            </Stack>
        </Box>
    );
}


function StatsRow({
    stats,
    statusFilter,
    onFilterChange,
}: {
    stats: { active: number; completed: number; totalBoxes: number; avgBph: number };
    statusFilter: RepackStatus | 'ALL';
    onFilterChange: (f: RepackStatus | 'ALL') => void;
}) {
    const cards: Array<{
        label: string;
        value: string | number;
        icon: React.ReactNode;
        color: string;
        filter: RepackStatus | 'ALL';
    }> = [
        { label: 'Activas',    value: stats.active,    icon: <StartIcon />, color: C.warning, filter: 'ACTIVE' },
        { label: 'Completadas', value: stats.completed, icon: <StopIcon />,  color: C.success, filter: 'COMPLETED' },
        { label: 'Cajas total', value: stats.totalBoxes, icon: <BoxIcon />,  color: C.primary, filter: 'ALL' },
        { label: 'Promedio c/h', value: stats.avgBph || '—', icon: <TrendIcon />, color: C.primary, filter: 'ALL' },
    ];

    return (
        <Grid container spacing={2}>
            {cards.map((card) => {
                const selected = statusFilter === card.filter && card.filter !== 'ALL';
                return (
                    <Grid item xs={6} md={3} key={card.label}>
                        <Card
                            elevation={selected ? 4 : 1}
                            onClick={() => {
                                if (card.filter !== 'ALL') {
                                    onFilterChange(statusFilter === card.filter ? 'ALL' : card.filter);
                                }
                            }}
                            sx={{
                                cursor: card.filter !== 'ALL' ? 'pointer' : 'default',
                                borderRadius: 3,
                                border: selected ? `2px solid ${card.color}` : '1px solid transparent',
                                transition: 'all .2s ease',
                                '&:hover': card.filter !== 'ALL' ? { boxShadow: 4 } : {},
                            }}
                        >
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{ bgcolor: `${card.color}22`, color: card.color, width: 40, height: 40 }}>
                                        {card.icon}
                                    </Avatar>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="caption" sx={{
                                            color: 'text.secondary', textTransform: 'uppercase',
                                            fontWeight: 600, letterSpacing: 0.5, fontSize: '0.65rem',
                                        }}>
                                            {card.label}
                                        </Typography>
                                        <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.1, color: card.color }}>
                                            {card.value}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
}


function SessionsTable({ sessions, loading }: { sessions: RepackSession[]; loading: boolean }) {
    const [finish, { isLoading: finishing }] = useFinishSessionMutation();
    const [cancel, { isLoading: cancelling }] = useCancelSessionMutation();
    const confirm = useConfirm();

    const onFinish = async (id: number) => {
        const ok = await confirm({
            title: 'Cerrar sesión de reempaque',
            message: 'Se calculará la métrica final (cajas/hora) y la sesión quedará registrada.',
            confirmText: 'Cerrar sesión',
            confirmColor: 'success',
            severity: 'success',
        });
        if (!ok) return;
        try {
            await finish(id).unwrap();
            toast.success('Sesión cerrada.');
        } catch (err: any) {
            toast.error(err?.data?.error || 'Error al cerrar sesión');
        }
    };
    const onCancel = async (id: number) => {
        const ok = await confirm({
            title: 'Cancelar sesión',
            message: 'La sesión se cerrará sin registrar la métrica de cajas/hora.',
            confirmText: 'Cancelar sesión',
            confirmColor: 'error',
            severity: 'danger',
        });
        if (!ok) return;
        try {
            await cancel(id).unwrap();
            toast.success('Sesión cancelada.');
        } catch (err: any) {
            toast.error(err?.data?.error || 'Error al cancelar');
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'personnel_name',
            headerName: 'Operario',
            flex: 1.2, minWidth: 180,
            renderCell: (p: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: C.primaryBg, color: C.primary, fontSize: '0.75rem' }}>
                        <PersonIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body2" fontWeight={600} noWrap>
                        {p.row.personnel_name}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'started_at',
            headerName: 'Inicio',
            width: 120,
            renderCell: (p: GridRenderCellParams) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {format(new Date(p.row.started_at), 'HH:mm')}
                </Typography>
            ),
        },
        {
            field: 'ended_at',
            headerName: 'Fin',
            width: 120,
            renderCell: (p: GridRenderCellParams) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {p.row.ended_at ? format(new Date(p.row.ended_at), 'HH:mm') : '—'}
                </Typography>
            ),
        },
        {
            field: 'duration_seconds',
            headerName: 'Duración',
            width: 110,
            renderCell: (p: GridRenderCellParams) => {
                const secs = p.row.status === 'ACTIVE'
                    ? Math.floor((Date.now() - new Date(p.row.started_at).getTime()) / 1000)
                    : p.row.duration_seconds;
                return (
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {fmtDuration(secs)}
                    </Typography>
                );
            },
        },
        {
            field: 'entries_count',
            headerName: 'Lotes',
            width: 80, align: 'right', headerAlign: 'right',
        },
        {
            field: 'total_boxes',
            headerName: 'Cajas',
            width: 90, align: 'right', headerAlign: 'right',
            renderCell: (p: GridRenderCellParams) => (
                <Typography variant="body2" fontWeight={700}>
                    {p.row.total_boxes}
                </Typography>
            ),
        },
        {
            field: 'boxes_per_hour',
            headerName: 'Cajas / h',
            width: 100, align: 'right', headerAlign: 'right',
            renderCell: (p: GridRenderCellParams) => (
                <Typography variant="body2" fontWeight={700} sx={{ color: C.primary, fontFamily: 'monospace' }}>
                    {p.row.boxes_per_hour ? p.row.boxes_per_hour : '—'}
                </Typography>
            ),
        },
        {
            field: 'status_display',
            headerName: 'Estado',
            width: 130,
            renderCell: (p: GridRenderCellParams) => {
                const status: RepackStatus = p.row.status;
                const colorMap: Record<RepackStatus, 'warning' | 'success' | 'default'> = {
                    ACTIVE: 'warning', COMPLETED: 'success', CANCELLED: 'default',
                };
                return <Chip size="small" label={p.row.status_display} color={colorMap[status]} />;
            },
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 130, align: 'center', headerAlign: 'center', sortable: false,
            renderCell: (p: GridRenderCellParams) => {
                if (p.row.status !== 'ACTIVE') {
                    return (
                        <Tooltip title="Ver detalle">
                            <IconButton size="small">
                                <ViewIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    );
                }
                return (
                    <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Finalizar sesión">
                            <span>
                                <IconButton
                                    size="small" color="success"
                                    onClick={() => onFinish(p.row.id)}
                                    disabled={finishing}
                                >
                                    <StopIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Cancelar">
                            <span>
                                <IconButton
                                    size="small" color="error"
                                    onClick={() => onCancel(p.row.id)}
                                    disabled={cancelling}
                                >
                                    <CancelIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Stack>
                );
            },
        },
    ];

    return (
        <DataGrid
            rows={sessions}
            columns={columns}
            loading={loading}
            autoHeight
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            sx={{ border: 0 }}
            localeText={{ noRowsLabel: 'Sin sesiones para esta fecha.' }}
        />
    );
}


function StartSessionDialog({
    open, onClose, operationalDate,
}: { open: boolean; onClose: () => void; operationalDate: string }) {
    const [start, { isLoading }] = useStartSessionMutation();
    const [personnel, setPersonnel] = useState<PersonnelAutocompleteItem | null>(null);
    const [search, setSearch] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { data: options = [], isFetching } = useGetPersonnelAutocompleteQuery({
        search,
        position_type: REPACK_POSITION_TYPES,
        is_active: true,
        limit: 50,
    });

    const onSubmit = async () => {
        setError(null);
        if (!personnel) {
            setError('Seleccioná un operario.');
            return;
        }
        try {
            await start({
                personnel_id: personnel.id,
                notes,
                operational_date: operationalDate,
            }).unwrap();
            toast.success(`Sesión iniciada para ${personnel.full_name}`);
            onClose();
        } catch (err: any) {
            setError(err?.data?.error || err?.data?.detail || 'No se pudo iniciar la sesión');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <Avatar sx={{ bgcolor: C.primary, width: 36, height: 36 }}>
                    <StartIcon fontSize="small" />
                </Avatar>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                        Iniciar sesión de Reempaque
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Asignar a un operario · {operationalDate}
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Autocomplete
                    options={options}
                    value={personnel}
                    onChange={(_, val) => setPersonnel(val)}
                    inputValue={search}
                    onInputChange={(_, val) => setSearch(val)}
                    getOptionLabel={(o) => `${o.full_name} (${o.employee_code})`}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    loading={isFetching}
                    filterOptions={(x) => x}
                    noOptionsText={search ? 'Sin resultados' : 'Escriba para buscar'}
                    renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                            <Box>
                                <Typography variant="body2" fontWeight={600}>
                                    {option.full_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    #{option.employee_code} · {option.position}
                                </Typography>
                            </Box>
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Operario *"
                            placeholder="Buscar ayudante de almacén…"
                            size="small"
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {isFetching ? <CircularProgress color="inherit" size={16} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                    sx={{ mb: 2 }}
                />

                <TextField
                    label="Notas (opcional)"
                    fullWidth size="small" multiline rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                    Filtramos personal con posición <b>Ayudante de Almacén</b> o <b>Cargador</b>. Si necesitás otro
                    rol, ajustamos el filtro.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancelar</Button>
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={isLoading || !personnel}
                    startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : <StartIcon />}
                    sx={{
                        bgcolor: C.primary, textTransform: 'none', fontWeight: 700,
                        '&:hover': { bgcolor: C.primaryDark },
                    }}
                >
                    Iniciar sesión
                </Button>
            </DialogActions>
        </Dialog>
    );
}


function fmtDuration(secs: number): string {
    if (secs <= 0) return '—';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
}
