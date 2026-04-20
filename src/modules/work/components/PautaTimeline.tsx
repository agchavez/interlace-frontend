import { useEffect, useState } from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import {
    Inventory as PickingIcon,
    MeetingRoom as BayIcon,
    ContentPasteSearch as CountingIcon,
    Security as SecurityIcon,
    Engineering as OpsIcon,
    LocalShipping as DispatchedIcon,
    CheckCircle as DoneIcon,
    RadioButtonUnchecked as PendingIcon,
    PlayCircleFilled as ActiveIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { PautaStatus } from '../../truck-cycle/interfaces/truckCycle';

interface TimelineEntry {
    key: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    startEvent: string;
    endEvent?: string;
    /** Estados donde este paso está "en curso". */
    inProgress: PautaStatus[];
    /** Estados mínimos donde ya está completo. */
    completedFrom: PautaStatus[];
}

const TIMELINE: TimelineEntry[] = [
    {
        key: 'picking',
        label: 'Picking',
        description: 'Armado de la pauta',
        icon: <PickingIcon />,
        startEvent: 'T0_PICKING_START',
        endEvent: 'T1_PICKING_END',
        inProgress: ['PENDING_PICKING', 'PICKING_ASSIGNED', 'PICKING_IN_PROGRESS'],
        completedFrom: ['PICKING_DONE', 'MOVING_TO_BAY', 'IN_BAY', 'PENDING_COUNT', 'COUNTING',
            'COUNTED', 'PENDING_CHECKOUT', 'CHECKOUT_SECURITY', 'CHECKOUT_OPS', 'DISPATCHED',
            'IN_RELOAD_QUEUE', 'PENDING_RETURN', 'RETURN_PROCESSED', 'IN_AUDIT',
            'AUDIT_COMPLETE', 'CLOSED'],
    },
    {
        key: 'bay',
        label: 'En bahía',
        description: 'Camión posicionado y carga',
        icon: <BayIcon />,
        startEvent: 'T1A_YARD_START',
        endEvent: 'T4_LOADING_END',
        inProgress: ['PICKING_DONE', 'MOVING_TO_BAY', 'IN_BAY'],
        completedFrom: ['PENDING_COUNT', 'COUNTING', 'COUNTED', 'PENDING_CHECKOUT',
            'CHECKOUT_SECURITY', 'CHECKOUT_OPS', 'DISPATCHED', 'IN_RELOAD_QUEUE',
            'PENDING_RETURN', 'RETURN_PROCESSED', 'IN_AUDIT', 'AUDIT_COMPLETE', 'CLOSED'],
    },
    {
        key: 'count',
        label: 'Conteo',
        description: 'Verificación de cajas y SKUs',
        icon: <CountingIcon />,
        startEvent: 'T5_COUNT_START',
        endEvent: 'T6_COUNT_END',
        inProgress: ['PENDING_COUNT', 'COUNTING'],
        completedFrom: ['COUNTED', 'PENDING_CHECKOUT', 'CHECKOUT_SECURITY', 'CHECKOUT_OPS',
            'DISPATCHED', 'IN_RELOAD_QUEUE', 'PENDING_RETURN', 'RETURN_PROCESSED',
            'IN_AUDIT', 'AUDIT_COMPLETE', 'CLOSED'],
    },
    {
        key: 'security',
        label: 'Checkout Seguridad',
        description: 'Validación de seguridad',
        icon: <SecurityIcon />,
        startEvent: 'T7_CHECKOUT_SECURITY',
        inProgress: ['COUNTED', 'PENDING_CHECKOUT'],
        completedFrom: ['CHECKOUT_SECURITY', 'CHECKOUT_OPS', 'DISPATCHED', 'IN_RELOAD_QUEUE',
            'PENDING_RETURN', 'RETURN_PROCESSED', 'IN_AUDIT', 'AUDIT_COMPLETE', 'CLOSED'],
    },
    {
        key: 'ops',
        label: 'Checkout Operaciones',
        description: 'Validación operativa (opcional)',
        icon: <OpsIcon />,
        startEvent: 'T8_CHECKOUT_OPS',
        inProgress: ['CHECKOUT_SECURITY'],
        completedFrom: ['CHECKOUT_OPS', 'DISPATCHED', 'IN_RELOAD_QUEUE',
            'PENDING_RETURN', 'RETURN_PROCESSED', 'IN_AUDIT', 'AUDIT_COMPLETE', 'CLOSED'],
    },
    {
        key: 'dispatched',
        label: 'Listo para salir',
        description: 'Despachado',
        icon: <DispatchedIcon />,
        startEvent: 'T9_DISPATCH',
        inProgress: [],
        completedFrom: ['DISPATCHED', 'IN_RELOAD_QUEUE', 'PENDING_RETURN',
            'RETURN_PROCESSED', 'IN_AUDIT', 'AUDIT_COMPLETE', 'CLOSED'],
    },
];

type State = 'completed' | 'in_progress' | 'pending';

function getState(entry: TimelineEntry, status: PautaStatus): State {
    if (entry.completedFrom.includes(status)) return 'completed';
    if (entry.inProgress.includes(status)) return 'in_progress';
    return 'pending';
}

function findTimestamp(timestamps: any[], eventType: string): string | null {
    if (!timestamps) return null;
    const t = timestamps.find((ts) => ts.event_type === eventType);
    return t?.timestamp ?? null;
}

function useLiveElapsed(since: string | null): string {
    const [val, setVal] = useState('0m');
    useEffect(() => {
        if (!since) { setVal('0m'); return; }
        const update = () => {
            const diff = Math.max(0, (Date.now() - new Date(since).getTime()) / 1000);
            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            setVal(h > 0 ? `${h}h ${m}m` : `${m}m`);
        };
        update();
        const id = setInterval(update, 30_000);
        return () => clearInterval(id);
    }, [since]);
    return val;
}

interface Props {
    status: PautaStatus;
    timestamps: any[];
}

export default function PautaTimeline({ status, timestamps }: Props) {
    const theme = useTheme();

    // Último startedAt para el step en progreso — calcular tiempo vivo.
    const activeStepIdx = TIMELINE.findIndex((t) => getState(t, status) === 'in_progress');
    const activeStartedAt = activeStepIdx >= 0
        ? findTimestamp(timestamps, TIMELINE[activeStepIdx].startEvent)
        : null;
    const liveElapsed = useLiveElapsed(activeStartedAt);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {TIMELINE.map((entry, idx) => {
                const state = getState(entry, status);
                const isLast = idx === TIMELINE.length - 1;
                const start = findTimestamp(timestamps, entry.startEvent);
                const end = entry.endEvent ? findTimestamp(timestamps, entry.endEvent) : null;

                const color =
                    state === 'completed'
                        ? theme.palette.success.main
                        : state === 'in_progress'
                        ? theme.palette.warning.main
                        : theme.palette.grey[400];

                const StateIcon = state === 'completed' ? DoneIcon : state === 'in_progress' ? ActiveIcon : PendingIcon;

                return (
                    <Box key={entry.key} sx={{ display: 'flex', gap: 1.5, position: 'relative' }}>
                        {/* Columna izquierda: icono + línea */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: state === 'pending' ? alpha(color, 0.12) : color,
                                    color: state === 'pending' ? color : '#fff',
                                    border: state === 'in_progress' ? `2px solid ${color}` : 'none',
                                    boxShadow: state === 'in_progress' ? `0 0 0 4px ${alpha(color, 0.2)}` : 'none',
                                    animation: state === 'in_progress' ? 'pulseTl 1.6s ease-in-out infinite' : 'none',
                                    '@keyframes pulseTl': {
                                        '0%, 100%': { boxShadow: `0 0 0 0 ${alpha(color, 0.35)}` },
                                        '50%': { boxShadow: `0 0 0 8px ${alpha(color, 0)}` },
                                    },
                                    zIndex: 2,
                                }}
                            >
                                <StateIcon sx={{ fontSize: '1.2rem' }} />
                            </Box>
                            {!isLast && (
                                <Box
                                    sx={{
                                        width: 3,
                                        flex: 1,
                                        minHeight: 42,
                                        my: 0.5,
                                        bgcolor: state === 'completed'
                                            ? theme.palette.success.main
                                            : alpha(theme.palette.grey[400], 0.35),
                                    }}
                                />
                            )}
                        </Box>

                        {/* Contenido */}
                        <Box sx={{ flex: 1, pb: isLast ? 0 : 2.5, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Box sx={{ color: state !== 'pending' ? color : 'text.disabled', display: 'flex' }}>
                                    {entry.icon}
                                </Box>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={800}
                                    sx={{ color: state !== 'pending' ? 'text.primary' : 'text.disabled', lineHeight: 1.1 }}
                                >
                                    {entry.label}
                                </Typography>
                                {state === 'in_progress' && activeStartedAt && (
                                    <Box
                                        sx={{
                                            ml: 'auto',
                                            bgcolor: alpha(color, 0.15),
                                            color,
                                            px: 1,
                                            py: 0.25,
                                            borderRadius: 1,
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            fontFamily: 'monospace',
                                        }}
                                    >
                                        hace {liveElapsed}
                                    </Box>
                                )}
                            </Box>
                            <Typography
                                variant="caption"
                                sx={{ color: state !== 'pending' ? 'text.secondary' : 'text.disabled', display: 'block', mb: 0.5 }}
                            >
                                {entry.description}
                            </Typography>
                            {start && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                    {state === 'completed' && end
                                        ? `${format(new Date(start), 'HH:mm')} → ${format(new Date(end), 'HH:mm')}`
                                        : `Inicio: ${format(new Date(start), 'HH:mm')}`}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}
