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
import SecurityPautaCard from '../components/SecurityPautaCard';
import BayMapView from '../components/BayMapView';
import type { PautaListItem } from '../../truck-cycle/interfaces/truckCycle';

// Disponibles: listas para validar seguridad.
const AVAILABLE_STATUSES = 'COUNTED,PENDING_CHECKOUT';
// Por despachar: ya validadas (por seguridad o ops), esperando despacho.
const MINE_STATUSES = 'CHECKOUT_SECURITY,CHECKOUT_OPS';
// Despachadas hoy.
const DONE_STATUSES = 'DISPATCHED';

const STATUS_LABELS: Record<string, string> = {
    COUNTED: 'Listo',
    PENDING_CHECKOUT: 'Pendiente',
    CHECKOUT_SECURITY: 'Por despachar',
    CHECKOUT_OPS: 'Por despachar',
};

export default function SecurityHome() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const user = useAppSelector((s) => s.auth.user);

    const today = format(new Date(), 'yyyy-MM-dd');
    const [tab, setTab] = useState<0 | 1 | 2>(0);

    const commonParams = {
        operational_date_after: today,
        operational_date_before: today,
        limit: 100,
    };

    const {
        data: availableData, isLoading: loadingAvailable, refetch: refetchAvailable,
    } = useGetPautasQuery({ ...commonParams, status: AVAILABLE_STATUSES }, { pollingInterval: 20_000 });

    const {
        data: mineData, isLoading: loadingMine, refetch: refetchMine,
    } = useGetPautasQuery({ ...commonParams, status: MINE_STATUSES }, { pollingInterval: 15_000 });

    const {
        data: doneData, isLoading: loadingDone, refetch: refetchDone,
    } = useGetPautasQuery({ ...commonParams, status: DONE_STATUSES });

    const available = availableData?.results || [];
    const mine = mineData?.results || [];
    const done = doneData?.results || [];

    const activeData = useMemo(() => {
        if (tab === 0) return { items: available, loading: loadingAvailable };
        if (tab === 1) return { items: mine, loading: loadingMine };
        return { items: done, loading: loadingDone };
    }, [tab, available, mine, done, loadingAvailable, loadingMine, loadingDone]);

    const handleRefresh = () => { refetchAvailable(); refetchMine(); refetchDone(); };

    const handleCardClick = (pauta: PautaListItem) => {
        navigate(`/work/security/${pauta.id}`);
    };

    return (
        <Box sx={{ height: 'calc(100dvh - 60px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
            <Box sx={{ flexShrink: 0, bgcolor: 'primary.main', color: '#fff' }}>
                <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', gap: 1, py: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant={isMobile ? 'subtitle1' : 'h5'} fontWeight={800} sx={{ lineHeight: 1.1 }}>
                            Seguridad
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
                        <Tab label={`Por validar${available.length ? ` (${available.length})` : ''}`} />
                        <Tab label={`Por despachar${mine.length ? ` (${mine.length})` : ''}`} />
                        <Tab label={`Despachadas${done.length ? ` (${done.length})` : ''}`} />
                    </Tabs>
                </Container>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f5f5f5' }}>
                <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
                    {activeData.loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                    )}

                    {!activeData.loading && activeData.items.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <EmptyIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="body1" color="text.secondary">
                                {tab === 0 && 'No hay pautas esperando validación de seguridad.'}
                                {tab === 1 && 'No hay pautas listas para despachar.'}
                                {tab === 2 && 'Aún no hay despachos hoy.'}
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
                                    <SecurityPautaCard key={p.id} pauta={p} onClick={handleCardClick} />
                                ))}
                            </Box>
                        ) : (
                            <BayMapView
                                pautas={activeData.items}
                                onPautaClick={handleCardClick}
                                statusLabels={STATUS_LABELS}
                                emptyMessage={
                                    tab === 0
                                        ? 'No hay pautas esperando seguridad en las bahías.'
                                        : 'No hay pautas listas para despachar en bahía.'
                                }
                                renderPautaWithoutBay={(p) => (
                                    <SecurityPautaCard pauta={p} onClick={handleCardClick} />
                                )}
                            />
                        )
                    )}
                </Container>
            </Box>
        </Box>
    );
}
