import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Tabs, Tab, CircularProgress, IconButton,
    useTheme, useMediaQuery,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    ArrowBack as BackIcon,
    Inbox as EmptyIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppSelector } from '../../../store/store';
import { useGetPautasQuery } from '../../truck-cycle/services/truckCycleApi';
import VendorPautaCard from '../components/VendorPautaCard';
import PautaSearchBar, { filterPautasByText } from '../components/PautaSearchBar';
import type { PautaListItem } from '../../truck-cycle/interfaces/truckCycle';

const ACTIVE_STATUSES = 'DISPATCHED,IN_RELOAD_QUEUE,PENDING_RETURN';
const PENDING_STATUSES = 'PENDING_PICKING,PICKING_ASSIGNED,PICKING_IN_PROGRESS,PICKING_DONE,MOVING_TO_BAY,IN_BAY,PENDING_COUNT,COUNTING,COUNTED,CHECKOUT_SECURITY,CHECKOUT_OPS';

export default function VendorHome() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const user = useAppSelector((s) => s.auth.user);
    const isAdmin = Boolean(user?.is_superuser || user?.is_staff);

    const today = format(new Date(), 'yyyy-MM-dd');
    const [tab, setTab] = useState<0 | 1>(0);
    const [search, setSearch] = useState('');

    // Vendedor solo ve RECARGAS (is_reload=true), no el primer viaje (carga).
    const commonParams = {
        operational_date_after: today,
        operational_date_before: today,
        my_vendor_pautas: isAdmin ? undefined : true,
        is_reload: true,
        limit: 100,
    } as any;

    const {
        data: activeData, isLoading: loadingActive, refetch: refetchActive,
    } = useGetPautasQuery({ ...commonParams, status: ACTIVE_STATUSES }, { pollingInterval: 20_000 });

    const {
        data: pendingData, isLoading: loadingPending, refetch: refetchPending,
    } = useGetPautasQuery({ ...commonParams, status: PENDING_STATUSES }, { pollingInterval: 30_000 });

    const allActive = activeData?.results || [];
    const pending = pendingData?.results || [];

    // Vendor puede estar en UN solo viaje a la vez.
    // Priorizo: PENDING_RETURN > IN_RELOAD_QUEUE > DISPATCHED; dentro del mismo grupo, la más antigua por id.
    const activePriority = (p: PautaListItem): number => {
        if (p.status === 'PENDING_RETURN') return 0;
        if (p.status === 'IN_RELOAD_QUEUE') return 1;
        if (p.status === 'DISPATCHED') return 2;
        return 99;
    };
    const sortedActive = [...allActive].sort((a, b) => {
        const pa = activePriority(a);
        const pb = activePriority(b);
        if (pa !== pb) return pa - pb;
        return a.id - b.id;
    });
    const active: PautaListItem[] = sortedActive.slice(0, 1);
    const waitingAfterDispatch: PautaListItem[] = sortedActive.slice(1);

    const filteredActive = useMemo(() => filterPautasByText(active, search), [active, search]);
    const filteredWaiting = useMemo(() => filterPautasByText(waitingAfterDispatch, search), [waitingAfterDispatch, search]);
    const filteredPending = useMemo(() => filterPautasByText(pending, search), [pending, search]);

    const activeDataSlot = useMemo(() => {
        if (tab === 0) return { items: filteredActive, loading: loadingActive };
        // En preparación: incluir las demás DISPATCHED que están esperando que termine la activa.
        return { items: [...filteredWaiting, ...filteredPending], loading: loadingPending };
    }, [tab, filteredActive, filteredWaiting, filteredPending, loadingActive, loadingPending]);

    const handleRefresh = () => { refetchActive(); refetchPending(); };

    const handleCardClick = (pauta: PautaListItem) => {
        navigate(`/work/vendor/${pauta.id}`);
    };

    return (
        <Box sx={{ height: 'calc(100dvh - 60px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
            <Box sx={{ flexShrink: 0, bgcolor: 'primary.main', color: '#fff' }}>
                <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', gap: 1, py: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant={isMobile ? 'subtitle1' : 'h5'} fontWeight={800} sx={{ lineHeight: 1.1 }}>
                            Mi viaje
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.85 }}>
                            {user?.first_name ? `Hola, ${user.first_name}` : ''} · {today}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={handleRefresh} sx={{ color: '#fff' }}>
                        <RefreshIcon />
                    </IconButton>
                </Container>

                <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        variant={isMobile ? 'fullWidth' : 'standard'}
                        textColor="inherit"
                        TabIndicatorProps={{ sx: { bgcolor: '#fff', height: 3 } }}
                        sx={{
                            minHeight: 42,
                            '& .MuiTab-root': {
                                color: 'rgba(255,255,255,0.8)', minHeight: 42, fontWeight: 700, textTransform: 'none',
                                fontSize: { xs: '0.85rem', sm: '0.95rem' },
                            },
                            '& .Mui-selected': { color: '#fff' },
                        }}
                    >
                        <Tab label="Mi viaje actual" />
                        <Tab label={`En preparación${(pending.length + waitingAfterDispatch.length) ? ` (${pending.length + waitingAfterDispatch.length})` : ''}`} />
                    </Tabs>
                </Container>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f5f5f5' }}>
                <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
                    {tab === 1 && <PautaSearchBar value={search} onChange={setSearch} />}

                    {/* Aviso cuando hay más viajes esperando */}
                    {tab === 0 && active.length === 1 && waitingAfterDispatch.length > 0 && (
                        <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: theme.palette.info.main + '15', border: `1px solid ${theme.palette.info.main}55` }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.info.dark }}>
                                Tienes {waitingAfterDispatch.length} viaje{waitingAfterDispatch.length === 1 ? '' : 's'} esperando. Termina este primero para tomar el siguiente.
                            </Typography>
                        </Box>
                    )}

                    {activeDataSlot.loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                    )}

                    {!activeDataSlot.loading && activeDataSlot.items.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <EmptyIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="body1" color="text.secondary">
                                {search
                                    ? 'No se encontraron viajes con esa búsqueda.'
                                    : tab === 0
                                    ? 'No tienes un viaje activo ahora mismo.'
                                    : 'No tienes recargas en preparación.'}
                            </Typography>
                        </Box>
                    )}

                    {!activeDataSlot.loading && activeDataSlot.items.length > 0 && (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))',
                                    lg: 'repeat(4, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))',
                                },
                                gap: { xs: 1.25, sm: 2 },
                            }}
                        >
                            {activeDataSlot.items.map((p) => (
                                <VendorPautaCard key={p.id} pauta={p} onClick={handleCardClick} />
                            ))}
                        </Box>
                    )}
                </Container>
            </Box>
        </Box>
    );
}
