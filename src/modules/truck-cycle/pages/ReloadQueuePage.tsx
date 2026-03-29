import { useState, useEffect, useCallback, useMemo } from 'react';
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
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress,
    Alert,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    LocalShipping as LocalShippingIcon,
    Login as LoginIcon,
    AssignmentReturn as AssignmentReturnIcon,
    CheckCircle as CheckCircleIcon,
    AccessTime as AccessTimeIcon,
    Assignment as TotalIcon,
    Queue as QueueIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import PautaStatusBadge from '../components/PautaStatusBadge';
import {
    useGetReloadQueueQuery,
    useGetPautasQuery,
    useArrivalPautaMutation,
    useProcessReturnMutation,
    useClosePautaMutation,
} from '../services/truckCycleApi';
import type { PautaListItem, PautaStatus } from '../interfaces/truckCycle';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatElapsed(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function getQueueItems(data: unknown): PautaListItem[] {
    if (!data) return [];
    if (Array.isArray(data)) return data as PautaListItem[];
    if (typeof data === 'object' && data !== null && 'results' in data) {
        return (data as { results: PautaListItem[] }).results;
    }
    return [];
}

// ---------------------------------------------------------------------------
// Elapsed-time hook (ticks every second)
// ---------------------------------------------------------------------------

function useElapsedTick(): number {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1_000);
        return () => clearInterval(id);
    }, []);
    return now;
}

// ---- Stat Card ----
interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <Card
        elevation={3}
        sx={{
            height: '100%',
            transition: 'all 0.3s ease-in-out',
            '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgba(0,0,0,0.15)' },
        }}
    >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, fontWeight: 600 }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color, fontSize: { xs: '1.5rem', sm: '2.125rem' }, mt: 0.5 }}
                    >
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReloadQueuePage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const now = useElapsedTick();

    // Data queries
    const {
        data: reloadQueueData,
        isLoading: loadingQueue,
        error: errorQueue,
    } = useGetReloadQueueQuery(undefined, { pollingInterval: 15_000 });

    const {
        data: dispatchedData,
        isLoading: loadingDispatched,
        error: errorDispatched,
    } = useGetPautasQuery({ status: 'DISPATCHED', limit: 100 });

    // Mutations
    const [arrivalPauta, { isLoading: arrivaling }] = useArrivalPautaMutation();
    const [processReturn, { isLoading: returning }] = useProcessReturnMutation();
    const [closePauta, { isLoading: closing }] = useClosePautaMutation();

    // Menu state for dispatched section
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedRow, setSelectedRow] = useState<PautaListItem | null>(null);

    // Menu state for queue section
    const [queueAnchorEl, setQueueAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedQueueRow, setSelectedQueueRow] = useState<PautaListItem | null>(null);

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ open: false, title: '', message: '', onConfirm: () => {} });

    const [actionError, setActionError] = useState<string | null>(null);

    const queueItems = getQueueItems(reloadQueueData);
    const dispatchedItems = dispatchedData?.results ?? [];

    // Menu handlers - Dispatched
    const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLElement>, row: PautaListItem) => {
        setAnchorEl(event.currentTarget);
        setSelectedRow(row);
    }, []);

    const handleCloseMenu = useCallback(() => {
        setAnchorEl(null);
        setSelectedRow(null);
    }, []);

    // Menu handlers - Queue
    const handleOpenQueueMenu = useCallback((event: React.MouseEvent<HTMLElement>, row: PautaListItem) => {
        setQueueAnchorEl(event.currentTarget);
        setSelectedQueueRow(row);
    }, []);

    const handleCloseQueueMenu = useCallback(() => {
        setQueueAnchorEl(null);
        setSelectedQueueRow(null);
    }, []);

    // Confirmation dialog
    const openConfirm = useCallback(
        (title: string, message: string, onConfirm: () => void) => {
            setConfirmDialog({ open: true, title, message, onConfirm });
        },
        [],
    );

    const closeConfirm = useCallback(() => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
    }, []);

    // Action handlers
    const handleArrival = (pauta: PautaListItem) => {
        handleCloseMenu();
        openConfirm(
            'Registrar Llegada',
            `Registrar la llegada de Transporte ${pauta.transport_number} (Viaje ${pauta.trip_number})?`,
            async () => {
                closeConfirm();
                setActionError(null);
                try {
                    await arrivalPauta(pauta.id).unwrap();
                } catch {
                    setActionError(`Error al registrar llegada de Transporte ${pauta.transport_number}.`);
                }
            },
        );
    };

    const handleProcessReturn = (pauta: PautaListItem) => {
        handleCloseQueueMenu();
        openConfirm(
            'Procesar Retorno',
            `Procesar el retorno de Transporte ${pauta.transport_number} (Viaje ${pauta.trip_number})?`,
            async () => {
                closeConfirm();
                setActionError(null);
                try {
                    await processReturn(pauta.id).unwrap();
                } catch {
                    setActionError(`Error al procesar retorno de Transporte ${pauta.transport_number}.`);
                }
            },
        );
    };

    const handleClose = (pauta: PautaListItem) => {
        handleCloseQueueMenu();
        openConfirm(
            'Cerrar Pauta',
            `Cerrar la pauta de Transporte ${pauta.transport_number} (Viaje ${pauta.trip_number})? Esta accion no se puede deshacer.`,
            async () => {
                closeConfirm();
                setActionError(null);
                try {
                    await closePauta(pauta.id).unwrap();
                } catch {
                    setActionError(`Error al cerrar pauta de Transporte ${pauta.transport_number}.`);
                }
            },
        );
    };

    // Dispatched DataGrid columns
    const dispatchedColumns: GridColDef[] = useMemo(() => {
        const cols: GridColDef[] = [];

        if (isMobile) {
            cols.push({
                field: 'info',
                headerName: 'Camion en Ruta',
                flex: 1,
                minWidth: 220,
                sortable: false,
                renderCell: (params: GridRenderCellParams) => (
                    <Box sx={{ py: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>
                            T-{params.row.transport_number} / V-{params.row.trip_number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {params.row.truck_code} - {params.row.truck_plate}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                            <PautaStatusBadge status={params.row.status as PautaStatus} />
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
                    width: 100,
                },
                {
                    field: 'truck_code',
                    headerName: 'Camion',
                    flex: 1,
                    minWidth: 160,
                    renderCell: (params: GridRenderCellParams) => (
                        <Typography variant="body2">
                            {params.row.truck_code} - {params.row.truck_plate}
                        </Typography>
                    ),
                },
                {
                    field: 'total_boxes',
                    headerName: 'Cajas',
                    width: 100,
                    align: 'right',
                    headerAlign: 'right',
                },
                {
                    field: 'status',
                    headerName: 'Estado',
                    width: 140,
                    renderCell: (params: GridRenderCellParams) => (
                        <PautaStatusBadge status={params.value as PautaStatus} />
                    ),
                },
            );
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
    }, [isMobile, handleOpenMenu]);

    const isLoading = loadingQueue || loadingDispatched;
    const hasError = errorQueue || errorDispatched;

    if (hasError) {
        return (
            <Container maxWidth="xl" sx={{ mt: 2 }}>
                <Alert severity="error">Error al cargar los datos de la cola de recarga.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 2 }}>
            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={600} sx={{ mb: 1 }}>
                Cola de Recarga
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Gestione la llegada de camiones despachados y la cola de recargas.
            </Typography>

            {actionError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
                    {actionError}
                </Alert>
            )}

            {/* Stat Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={4}>
                    <StatCard
                        title="En Ruta"
                        value={dispatchedItems.length}
                        icon={<LocalShippingIcon />}
                        color={theme.palette.success.main}
                    />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <StatCard
                        title="En Cola"
                        value={queueItems.length}
                        icon={<QueueIcon />}
                        color={theme.palette.info.main}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatCard
                        title="Total"
                        value={dispatchedItems.length + queueItems.length}
                        icon={<TotalIcon />}
                        color={theme.palette.primary.main}
                    />
                </Grid>
            </Grid>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* SECTION 1: CAMIONES EN RUTA */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <LocalShippingIcon color="success" />
                            <Typography variant="h6" fontWeight={600}>
                                Camiones en Ruta
                            </Typography>
                            <Chip label={dispatchedItems.length} size="small" color="success" variant="outlined" />
                        </Box>

                        <Card variant="outlined">
                            <DataGrid
                                rows={dispatchedItems}
                                columns={dispatchedColumns}
                                disableRowSelectionOnClick
                                autoHeight
                                rowHeight={isMobile ? 80 : 52}
                                pageSizeOptions={[10, 25, 50]}
                                initialState={{
                                    pagination: { paginationModel: { page: 0, pageSize: 10 } },
                                }}
                                sx={{
                                    border: 0,
                                    '& .MuiDataGrid-cell': {
                                        fontSize: isMobile ? '0.8125rem' : '0.875rem',
                                        py: isMobile ? 1.5 : 1,
                                    },
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor:
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255,255,255,0.05)'
                                                : 'rgba(0,0,0,0.02)',
                                        fontSize: isMobile ? '0.8125rem' : '0.875rem',
                                        fontWeight: 600,
                                    },
                                    '& .MuiDataGrid-footerContainer': {
                                        borderTop: `1px solid ${theme.palette.divider}`,
                                    },
                                }}
                                slots={{
                                    noRowsOverlay: () => (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: '100%',
                                            }}
                                        >
                                            <Typography variant="body2" color="text.secondary">
                                                No hay camiones despachados en ruta.
                                            </Typography>
                                        </Box>
                                    ),
                                }}
                            />
                        </Card>
                    </Box>

                    {/* Dispatched Action Menu */}
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
                        <MenuItem
                            onClick={() => selectedRow && handleArrival(selectedRow)}
                            disabled={arrivaling}
                        >
                            <ListItemIcon>
                                <LoginIcon fontSize="small" color="primary" />
                            </ListItemIcon>
                            <ListItemText>Registrar Llegada</ListItemText>
                        </MenuItem>
                    </Menu>

                    <Divider sx={{ mb: 4 }} />

                    {/* SECTION 2: COLA DE RECARGAS */}
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <AccessTimeIcon color="info" />
                            <Typography variant="h6" fontWeight={600}>
                                Cola de Recargas
                            </Typography>
                            <Chip label={queueItems.length} size="small" color="info" variant="outlined" />
                        </Box>

                        {queueItems.length === 0 ? (
                            <Card variant="outlined">
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No hay camiones en la cola de recarga.
                                    </Typography>
                                </Box>
                            </Card>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {queueItems.map((pauta, index) => {
                                    const arrivalTs = new Date(pauta.created_at).getTime();
                                    const elapsed = Math.max(0, now - arrivalTs);

                                    return (
                                        <Card
                                            key={pauta.id}
                                            variant="outlined"
                                            sx={{
                                                borderLeft: '5px solid',
                                                borderLeftColor: 'info.main',
                                            }}
                                        >
                                            <CardContent sx={{ pb: '12px !important' }}>
                                                <Grid container spacing={2} alignItems="center">
                                                    {/* Queue position */}
                                                    <Grid item xs="auto">
                                                        <Box
                                                            sx={{
                                                                width: 48,
                                                                height: 48,
                                                                borderRadius: '50%',
                                                                bgcolor: 'info.main',
                                                                color: 'info.contrastText',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontWeight: 700,
                                                                fontSize: '1.25rem',
                                                            }}
                                                        >
                                                            #{index + 1}
                                                        </Box>
                                                    </Grid>

                                                    {/* Details */}
                                                    <Grid item xs>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'flex-start',
                                                                flexWrap: 'wrap',
                                                                gap: 1,
                                                            }}
                                                        >
                                                            <Box>
                                                                <Typography variant="subtitle1" fontWeight={600}>
                                                                    Transporte {pauta.transport_number}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Viaje: {pauta.trip_number} | Camion:{' '}
                                                                    {pauta.truck_code
                                                                        ? `${pauta.truck_code} - `
                                                                        : ''}
                                                                    {pauta.truck_plate}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Llegada:{' '}
                                                                    {new Date(pauta.created_at).toLocaleTimeString(
                                                                        'es-HN',
                                                                        {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                        },
                                                                    )}
                                                                </Typography>
                                                            </Box>

                                                            <Box sx={{ textAlign: 'right' }}>
                                                                <PautaStatusBadge
                                                                    status={pauta.status as PautaStatus}
                                                                />
                                                                <Typography
                                                                    variant="body2"
                                                                    fontWeight={600}
                                                                    sx={{
                                                                        mt: 0.5,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'flex-end',
                                                                        gap: 0.5,
                                                                        fontFamily: 'monospace',
                                                                        color:
                                                                            elapsed > 30 * 60 * 1000
                                                                                ? 'error.main'
                                                                                : elapsed > 15 * 60 * 1000
                                                                                  ? 'warning.main'
                                                                                  : 'text.secondary',
                                                                    }}
                                                                >
                                                                    <AccessTimeIcon fontSize="small" />
                                                                    {formatElapsed(elapsed)}
                                                                </Typography>
                                                            </Box>
                                                        </Box>

                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                            Cajas: {pauta.total_boxes} | SKUs: {pauta.total_skus} | Tarimas:{' '}
                                                            {pauta.total_pallets}
                                                        </Typography>
                                                    </Grid>

                                                    {/* Actions */}
                                                    <Grid item xs={12} sm="auto">
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: { xs: 'flex-end', sm: 'flex-end' },
                                                            }}
                                                        >
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => handleOpenQueueMenu(e, pauta)}
                                                                sx={{
                                                                    '&:hover': {
                                                                        bgcolor: 'rgba(25, 118, 210, 0.1)',
                                                                    },
                                                                }}
                                                            >
                                                                <MoreVertIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>

                    {/* Queue Action Menu */}
                    <Menu
                        anchorEl={queueAnchorEl}
                        open={Boolean(queueAnchorEl)}
                        onClose={handleCloseQueueMenu}
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
                        <MenuItem
                            onClick={() => selectedQueueRow && handleProcessReturn(selectedQueueRow)}
                            disabled={returning}
                        >
                            <ListItemIcon>
                                <AssignmentReturnIcon fontSize="small" color="warning" />
                            </ListItemIcon>
                            <ListItemText>Procesar Retorno</ListItemText>
                        </MenuItem>
                        <MenuItem
                            onClick={() => selectedQueueRow && handleClose(selectedQueueRow)}
                            disabled={closing}
                        >
                            <ListItemIcon>
                                <CheckCircleIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText>Cerrar</ListItemText>
                        </MenuItem>
                    </Menu>
                </>
            )}

            {/* Confirmation dialog */}
            <Dialog open={confirmDialog.open} onClose={closeConfirm}>
                <DialogTitle>{confirmDialog.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{confirmDialog.message}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirm}>Cancelar</Button>
                    <Button onClick={confirmDialog.onConfirm} variant="contained" autoFocus>
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
