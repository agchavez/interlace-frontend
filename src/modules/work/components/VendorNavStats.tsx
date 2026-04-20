import { useEffect, useState } from 'react';
import { Box, Typography, useTheme, alpha, Tooltip, ButtonBase } from '@mui/material';
import {
    LocalShipping as TruckIcon,
    PlayCircleFilled as ActiveIcon,
    Timer as TimerIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useGetVendorStatsQuery } from '../../truck-cycle/services/truckCycleApi';

function formatHms(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const STATUS_SHORT: Record<string, string> = {
    DISPATCHED: 'En ruta',
    IN_RELOAD_QUEUE: 'Regresó',
    PENDING_RETURN: 'Con devolución',
};

function ActiveTripChip({
    pautaId,
    transportNumber,
    truckCode,
    status,
    dispatchedAt,
}: {
    pautaId: number;
    transportNumber: string;
    truckCode: string | null;
    status: string;
    dispatchedAt: string | null;
}) {
    const theme = useTheme();
    const navigate = useNavigate();
    const [elapsed, setElapsed] = useState('00:00:00');

    useEffect(() => {
        if (!dispatchedAt) { setElapsed('—'); return; }
        const update = () => setElapsed(formatHms(Math.max(0, (Date.now() - new Date(dispatchedAt).getTime()) / 1000)));
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [dispatchedAt]);

    return (
        <Tooltip title={`Mi viaje actual · T-${transportNumber}`} arrow>
            <ButtonBase
                onClick={() => navigate(`/work/vendor/${pautaId}`)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1.5,
                    height: '100%',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: '#fff',
                    boxShadow: `0 2px 6px ${alpha(theme.palette.primary.main, 0.35)}`,
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.55)}`,
                    },
                }}
            >
                <TruckIcon sx={{ fontSize: { xs: '1.2rem', md: '1.45rem' } }} />
                <Box sx={{ lineHeight: 1, textAlign: 'left', minWidth: 0 }}>
                    <Typography
                        component="div"
                        sx={{
                            fontFamily: 'monospace', fontWeight: 900,
                            fontSize: { xs: '1rem', md: '1.2rem' }, lineHeight: 1,
                        }}
                    >
                        {elapsed}
                    </Typography>
                    <Typography
                        component="div"
                        sx={{
                            fontSize: { xs: '0.6rem', md: '0.7rem' },
                            opacity: 0.9, letterSpacing: 0.5, textTransform: 'uppercase', lineHeight: 1, mt: 0.3,
                        }}
                        noWrap
                    >
                        T-{transportNumber}{truckCode ? ` · ${truckCode}` : ''} · {STATUS_SHORT[status] || status}
                    </Typography>
                </Box>
            </ButtonBase>
        </Tooltip>
    );
}

const STAT_HEIGHT = 20;
const STAT_HEIGHT_MD = 34;

function Stat({
    icon, label, shortLabel, value, accent,
}: { icon: React.ReactNode; label: string; shortLabel: string; value: string | number; accent: string }) {
    return (
        <Tooltip title={label} arrow>
            <Box
                sx={{
                    display: 'flex', alignItems: 'center',
                    gap: { xs: 0.5, md: 1 },
                    px: { xs: 0.75, md: 1.25 },
                    height: { xs: STAT_HEIGHT, md: STAT_HEIGHT_MD },
                    borderRadius: { xs: 1, md: 1.5 },
                    bgcolor: alpha(accent, 0.08),
                    border: `1px solid ${alpha(accent, 0.25)}`,
                    minWidth: 0, overflow: 'hidden',
                }}
            >
                <Box sx={{ color: accent, display: 'flex', lineHeight: 1 }}>{icon}</Box>
                <Typography component="span" sx={{
                    fontSize: { xs: '0.6rem', md: '0.7rem' },
                    letterSpacing: 0.5, textTransform: 'uppercase',
                    color: 'text.secondary', fontWeight: 700, flexShrink: 0, lineHeight: 1,
                }}>
                    {shortLabel}
                </Typography>
                <Typography component="span" sx={{
                    fontWeight: 800,
                    fontSize: { xs: '0.85rem', md: '1.05rem' },
                    color: 'text.primary', fontFeatureSettings: '"tnum"', ml: 'auto', lineHeight: 1,
                }}>
                    {value}
                </Typography>
            </Box>
        </Tooltip>
    );
}

export default function VendorNavStats() {
    const theme = useTheme();
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: stats } = useGetVendorStatsQuery({ operational_date: today }, { pollingInterval: 15_000 });
    if (!stats) return null;
    const primary = theme.palette.primary.main;
    const iconSize = { xs: '0.95rem', md: '1.15rem' };
    const trip = stats.active_trip;

    return (
        <Box
            sx={{
                display: 'grid',
                // xs/sm: 2 columnas (stacked 2x2). md+: todos en una sola fila.
                gridTemplateColumns: {
                    xs: trip
                        ? 'minmax(85px, 0.75fr) minmax(85px, 0.75fr) auto'
                        : 'minmax(85px, 0.85fr) minmax(135px, 1.35fr)',
                    md: trip
                        ? 'repeat(2, minmax(110px, max-content)) auto'
                        : 'repeat(4, minmax(110px, max-content))',
                },
                gridTemplateRows: {
                    xs: `${STAT_HEIGHT}px ${STAT_HEIGHT}px`,
                    md: `${STAT_HEIGHT_MD}px`,
                },
                columnGap: { xs: 0.5, sm: 1, md: 1.25 }, rowGap: '3px',
                height: { xs: STAT_HEIGHT * 2 + 3, md: STAT_HEIGHT_MD },
                alignItems: 'stretch',
            }}
        >
            <Box sx={{
                minWidth: 0,
                gridColumn: { xs: 1, md: 1 }, gridRow: { xs: 1, md: 1 },
            }}>
                <Stat
                    icon={<ActiveIcon sx={{ fontSize: iconSize }} />}
                    label="Viajes despachados hoy"
                    shortLabel="Despachos"
                    value={stats.trips_dispatched}
                    accent={primary}
                />
            </Box>
            <Box sx={{
                minWidth: 0,
                gridColumn: { xs: 1, md: 2 }, gridRow: { xs: 2, md: 1 },
            }}>
                <Stat
                    icon={<TimerIcon sx={{ fontSize: iconSize }} />}
                    label="Viajes cerrados hoy"
                    shortLabel="Cerrados"
                    value={stats.trips_completed}
                    accent={primary}
                />
            </Box>
            {!trip && (
                <>
                    <Box sx={{
                        minWidth: 0,
                        gridColumn: { xs: 2, md: 3 }, gridRow: { xs: 1, md: 1 },
                    }}>
                        <Stat
                            icon={<ActiveIcon sx={{ fontSize: iconSize }} />}
                            label="Viajes activos"
                            shortLabel="Activos"
                            value={stats.active}
                            accent={primary}
                        />
                    </Box>
                    <Box sx={{
                        minWidth: 0,
                        gridColumn: { xs: 2, md: 4 }, gridRow: { xs: 2, md: 1 },
                    }}>
                        <Stat
                            icon={<TruckIcon sx={{ fontSize: iconSize }} />}
                            label="Cajas totales"
                            shortLabel="Cajas"
                            value={stats.total_boxes}
                            accent={primary}
                        />
                    </Box>
                </>
            )}
            {trip && (
                <Box sx={{
                    gridColumn: { xs: '2 / span 2', md: '3' },
                    gridRow: { xs: '1 / span 2', md: '1' },
                }}>
                    <ActiveTripChip
                        pautaId={trip.id}
                        transportNumber={trip.transport_number}
                        truckCode={trip.truck_code}
                        status={trip.status}
                        dispatchedAt={trip.dispatched_at}
                    />
                </Box>
            )}
        </Box>
    );
}
