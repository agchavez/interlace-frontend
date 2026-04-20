import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Tabs, Tab, CircularProgress, IconButton, Button,
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
import YardPautaCard from '../components/YardPautaCard';
import PautaSearchBar, { filterPautasByText } from '../components/PautaSearchBar';
import type { PautaListItem } from '../../truck-cycle/interfaces/truckCycle';

const AVAILABLE_STATUSES = 'PICKING_DONE';
const MINE_STATUSES = 'MOVING_TO_BAY';
const DONE_STATUSES = 'IN_BAY,PENDING_COUNT,COUNTING,COUNTED,CHECKOUT_SECURITY,CHECKOUT_OPS,DISPATCHED';

export default function YardHome() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const user = useAppSelector((s) => s.auth.user);
    const isAdmin = Boolean(user?.is_superuser || user?.is_staff);

    const today = format(new Date(), 'yyyy-MM-dd');
    const [tab, setTab] = useState<0 | 1 | 2>(0);
    const [search, setSearch] = useState('');

    const commonParams = {
        operational_date_after: today,
        operational_date_before: today,
        is_reload: false, // Solo cargas (trip 1)
        limit: 100,
    } as any;

    const {
        data: availableData, isLoading: loadingAvailable, refetch: refetchAvailable,
    } = useGetPautasQuery({ ...commonParams, status: AVAILABLE_STATUSES }, { pollingInterval: 20_000 });

    const {
        data: mineData, isLoading: loadingMine, refetch: refetchMine,
    } = useGetPautasQuery(
        { ...commonParams, status: MINE_STATUSES, assigned_role: isAdmin ? undefined : 'YARD_DRIVER' } as any,
        { pollingInterval: 15_000 },
    );

    const {
        data: doneData, isLoading: loadingDone, refetch: refetchDone,
    } = useGetPautasQuery(
        { ...commonParams, status: DONE_STATUSES, assigned_role: isAdmin ? undefined : 'YARD_DRIVER' } as any,
    );

    const available = availableData?.results || [];
    const mine = mineData?.results || [];
    const done = doneData?.results || [];

    const activeData = useMemo(() => {
        const base = tab === 0
            ? { items: available, loading: loadingAvailable }
            : tab === 1
            ? { items: mine, loading: loadingMine }
            : { items: done, loading: loadingDone };
        return { items: filterPautasByText(base.items, search), loading: base.loading };
    }, [tab, available, mine, done, loadingAvailable, loadingMine, loadingDone, search]);

    const handleRefresh = () => { refetchAvailable(); refetchMine(); refetchDone(); };

    const handleCardClick = (pauta: PautaListItem) => {
        navigate(`/work/yard/${pauta.id}`);
    };

    return (
        <Box sx={{ height: 'calc(100dvh - 60px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
            <Box sx={{ flexShrink: 0, bgcolor: 'primary.main', color: '#fff' }}>
                <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', gap: 1, py: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant={isMobile ? 'subtitle1' : 'h5'} fontWeight={800} sx={{ lineHeight: 1.1 }}>
                            Chofer de Patio
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
                        <Tab label={`Por mover${available.length ? ` (${available.length})` : ''}`} />
                        <Tab label={`Moviendo${mine.length ? ` (${mine.length})` : ''}`} />
                        <Tab label={`Posicionadas${done.length ? ` (${done.length})` : ''}`} />
                    </Tabs>
                </Container>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f5f5f5' }}>
                <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
                    <PautaSearchBar value={search} onChange={setSearch} />

                    {activeData.loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                    )}

                    {!activeData.loading && activeData.items.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <EmptyIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="body1" color="text.secondary">
                                {tab === 0 && 'No hay pautas listas para mover.'}
                                {tab === 1 && 'No estás moviendo ningún camión ahora mismo.'}
                                {tab === 2 && 'Aún no posicionaste camiones hoy.'}
                            </Typography>
                            {tab === 1 && available.length > 0 && (
                                <Button onClick={() => setTab(0)} sx={{ mt: 1.5 }}>
                                    Ver por mover ({available.length})
                                </Button>
                            )}
                        </Box>
                    )}

                    {!activeData.loading && activeData.items.length > 0 && (
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
                            {activeData.items.map((p) => (
                                <YardPautaCard key={p.id} pauta={p} onClick={handleCardClick} />
                            ))}
                        </Box>
                    )}
                </Container>
            </Box>
        </Box>
    );
}
