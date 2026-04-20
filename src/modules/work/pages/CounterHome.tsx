import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    CircularProgress,
    IconButton,
    Button,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    ArrowBack as BackIcon,
    Inbox as EmptyIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppSelector } from '../../../store/store';
import { useGetPautasQuery } from '../../truck-cycle/services/truckCycleApi';
import CounterPautaCard from '../components/CounterPautaCard';
import BayMapView from '../components/BayMapView';
import type { PautaListItem } from '../../truck-cycle/interfaces/truckCycle';

const COUNTER_STATUS_LABELS: Record<string, string> = {
    PENDING_COUNT: 'Pendiente',
    COUNTING: 'En conteo',
    COUNTED: 'Contado',
};

const AVAILABLE_STATUSES = 'PENDING_COUNT';
const MINE_STATUSES = 'COUNTING';
const DONE_STATUSES = 'COUNTED';

export default function CounterHome() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const user = useAppSelector((s) => s.auth.user);
    const isAdmin = Boolean(user?.is_superuser || user?.is_staff);

    const today = format(new Date(), 'yyyy-MM-dd');
    const [tab, setTab] = useState<0 | 1 | 2>(1);

    const commonParams = {
        operational_date_after: today,
        operational_date_before: today,
        limit: 100,
    };

    const {
        data: availableData,
        isLoading: loadingAvailable,
        isFetching: fetchingAvailable,
        refetch: refetchAvailable,
    } = useGetPautasQuery({ ...commonParams, status: AVAILABLE_STATUSES }, { pollingInterval: 20_000 });

    const {
        data: mineData,
        isLoading: loadingMine,
        isFetching: fetchingMine,
        refetch: refetchMine,
    } = useGetPautasQuery(
        { ...commonParams, status: MINE_STATUSES, assigned_role: isAdmin ? undefined : 'COUNTER' } as any,
        { pollingInterval: 15_000 },
    );

    const {
        data: doneData,
        isLoading: loadingDone,
        refetch: refetchDone,
    } = useGetPautasQuery(
        { ...commonParams, status: DONE_STATUSES, assigned_role: isAdmin ? undefined : 'COUNTER' } as any,
    );

    const available = availableData?.results || [];
    const mine = mineData?.results || [];
    const done = doneData?.results || [];

    const activeData = useMemo(() => {
        if (tab === 0) return { items: available, loading: loadingAvailable, fetching: fetchingAvailable };
        if (tab === 1) return { items: mine, loading: loadingMine, fetching: fetchingMine };
        return { items: done, loading: loadingDone, fetching: false };
    }, [tab, available, mine, done, loadingAvailable, loadingMine, loadingDone, fetchingAvailable, fetchingMine]);

    const handleRefresh = () => {
        refetchAvailable();
        refetchMine();
        refetchDone();
    };

    const handleCardClick = (pauta: PautaListItem) => {
        navigate(`/work/counter/${pauta.id}`);
    };

    return (
        <Box
            sx={{
                height: 'calc(100dvh - 60px)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: '100%',
            }}
        >
            <Box sx={{ flexShrink: 0, bgcolor: 'primary.main', color: '#fff' }}>
                <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', gap: 1, py: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant={isMobile ? 'subtitle1' : 'h5'} fontWeight={800} sx={{ lineHeight: 1.1 }}>
                            Conteo
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
                                color: 'rgba(255,255,255,0.8)',
                                minHeight: 42,
                                fontWeight: 700,
                                textTransform: 'none',
                                fontSize: { xs: '0.85rem', sm: '0.95rem' },
                            },
                            '& .Mui-selected': { color: '#fff' },
                        }}
                    >
                        <Tab label={`Disponibles${available.length ? ` (${available.length})` : ''}`} />
                        <Tab label={`Mías${mine.length ? ` (${mine.length})` : ''}`} />
                        <Tab label={`Completadas${done.length ? ` (${done.length})` : ''}`} />
                    </Tabs>
                </Container>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f5f5f5' }}>
                <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
                    {activeData.loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {!activeData.loading && activeData.items.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <EmptyIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="body1" color="text.secondary">
                                {tab === 0 && 'No hay pautas disponibles para contar hoy.'}
                                {tab === 1 && 'No tienes pautas en conteo.'}
                                {tab === 2 && 'Aún no completaste ningún conteo hoy.'}
                            </Typography>
                            {tab === 1 && available.length > 0 && (
                                <Button onClick={() => setTab(0)} sx={{ mt: 1.5 }}>
                                    Ver disponibles ({available.length})
                                </Button>
                            )}
                        </Box>
                    )}

                    {!activeData.loading && activeData.items.length > 0 && (
                        tab === 2 ? (
                            // Completadas → grid de cards (ya no están en bahía)
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: 'repeat(2, minmax(0, 1fr))',
                                        md: 'repeat(3, minmax(0, 1fr))',
                                        lg: 'repeat(4, minmax(0, 1fr))',
                                        xl: 'repeat(5, minmax(0, 1fr))',
                                    },
                                    gap: { xs: 1.25, sm: 2 },
                                }}
                            >
                                {activeData.items.map((p) => (
                                    <CounterPautaCard key={p.id} pauta={p} onClick={handleCardClick} />
                                ))}
                            </Box>
                        ) : (
                            // Disponibles / Mías → mapa del estacionamiento
                            <BayMapView
                                pautas={activeData.items}
                                onPautaClick={handleCardClick}
                                statusLabels={COUNTER_STATUS_LABELS}
                                emptyMessage={
                                    tab === 0
                                        ? 'No hay pautas esperando conteo en ninguna bahía.'
                                        : 'No tienes pautas en conteo actualmente.'
                                }
                                renderPautaWithoutBay={(p) => (
                                    <CounterPautaCard pauta={p} onClick={handleCardClick} />
                                )}
                            />
                        )
                    )}
                </Container>
            </Box>
        </Box>
    );
}
