import { Box, Typography, useTheme, alpha } from '@mui/material';
import {
    Inventory as PickingIcon,
    MeetingRoom as BayIcon,
    ContentPasteSearch as CountingIcon,
    Security as SecurityIcon,
    LocalShipping as DispatchedIcon,
} from '@mui/icons-material';
import type { PautaStatus } from '../../truck-cycle/interfaces/truckCycle';

export interface StepDef {
    key: string;
    label: string;
    icon: React.ReactNode;
    /** Estados que pertenecen a este paso (está "en curso"). */
    inProgress: PautaStatus[];
    /** Estados que cumplen o superan este paso (paso completado). */
    passedFrom: PautaStatus[];
}

const DEFAULT_STEPS: StepDef[] = [
    {
        key: 'picking',
        label: 'Picking',
        icon: <PickingIcon />,
        inProgress: ['PENDING_PICKING', 'PICKING_ASSIGNED', 'PICKING_IN_PROGRESS'],
        passedFrom: ['PICKING_DONE', 'MOVING_TO_BAY', 'IN_BAY', 'PENDING_COUNT', 'COUNTING', 'COUNTED',
            'PENDING_CHECKOUT', 'CHECKOUT_SECURITY', 'CHECKOUT_OPS', 'DISPATCHED',
            'IN_RELOAD_QUEUE', 'PENDING_RETURN', 'RETURN_PROCESSED', 'IN_AUDIT', 'AUDIT_COMPLETE', 'CLOSED'],
    },
    {
        key: 'bay',
        label: 'Bahía',
        icon: <BayIcon />,
        inProgress: ['PICKING_DONE', 'MOVING_TO_BAY', 'IN_BAY'],
        passedFrom: ['PENDING_COUNT', 'COUNTING', 'COUNTED', 'PENDING_CHECKOUT',
            'CHECKOUT_SECURITY', 'CHECKOUT_OPS', 'DISPATCHED', 'IN_RELOAD_QUEUE',
            'PENDING_RETURN', 'RETURN_PROCESSED', 'IN_AUDIT', 'AUDIT_COMPLETE', 'CLOSED'],
    },
    {
        key: 'count',
        label: 'Conteo',
        icon: <CountingIcon />,
        inProgress: ['PENDING_COUNT', 'COUNTING'],
        passedFrom: ['COUNTED', 'PENDING_CHECKOUT', 'CHECKOUT_SECURITY', 'CHECKOUT_OPS',
            'DISPATCHED', 'IN_RELOAD_QUEUE', 'PENDING_RETURN', 'RETURN_PROCESSED',
            'IN_AUDIT', 'AUDIT_COMPLETE', 'CLOSED'],
    },
    {
        key: 'checkout',
        label: 'Seguridad',
        icon: <SecurityIcon />,
        inProgress: ['COUNTED', 'PENDING_CHECKOUT', 'CHECKOUT_SECURITY', 'CHECKOUT_OPS'],
        passedFrom: ['DISPATCHED', 'IN_RELOAD_QUEUE', 'PENDING_RETURN', 'RETURN_PROCESSED',
            'IN_AUDIT', 'AUDIT_COMPLETE', 'CLOSED'],
    },
    {
        key: 'ready',
        label: 'Listo',
        icon: <DispatchedIcon />,
        inProgress: [],
        passedFrom: ['DISPATCHED', 'IN_RELOAD_QUEUE', 'PENDING_RETURN', 'RETURN_PROCESSED',
            'IN_AUDIT', 'AUDIT_COMPLETE', 'CLOSED'],
    },
];

type StepState = 'completed' | 'in_progress' | 'pending';

function getStepState(step: StepDef, currentStatus: PautaStatus): StepState {
    if (step.passedFrom.includes(currentStatus)) return 'completed';
    if (step.inProgress.includes(currentStatus)) return 'in_progress';
    return 'pending';
}

interface Props {
    status: PautaStatus;
    compact?: boolean;
}

export default function PautaProgressStepper({ status, compact = false }: Props) {
    const theme = useTheme();
    const steps = DEFAULT_STEPS;

    const circleSize = compact ? 24 : 32;
    const iconSize = compact ? '0.8rem' : '1rem';

    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0, position: 'relative' }}>
            {steps.map((step, idx) => {
                const state = getStepState(step, status);
                const isLast = idx === steps.length - 1;
                const nextState = !isLast ? getStepState(steps[idx + 1], status) : null;
                const connectorFilled = state === 'completed';

                const color =
                    state === 'completed'
                        ? theme.palette.success.main
                        : state === 'in_progress'
                        ? theme.palette.warning.main
                        : theme.palette.grey[400];

                return (
                    <Box
                        key={step.key}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1,
                            minWidth: 0,
                            position: 'relative',
                        }}
                    >
                        {/* Círculo */}
                        <Box
                            sx={{
                                width: circleSize,
                                height: circleSize,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: state === 'pending' ? alpha(color, 0.15) : color,
                                color: state === 'pending' ? color : '#fff',
                                border: `2px solid ${state === 'in_progress' ? color : 'transparent'}`,
                                boxShadow: state === 'in_progress' ? `0 0 0 4px ${alpha(color, 0.2)}` : 'none',
                                zIndex: 2,
                                position: 'relative',
                                animation: state === 'in_progress' ? 'pulseStep 1.6s ease-in-out infinite' : 'none',
                                '@keyframes pulseStep': {
                                    '0%, 100%': { boxShadow: `0 0 0 0 ${alpha(color, 0.35)}` },
                                    '50%': { boxShadow: `0 0 0 6px ${alpha(color, 0)}` },
                                },
                                '& svg': { fontSize: iconSize },
                            }}
                        >
                            {step.icon}
                        </Box>

                        {/* Label */}
                        {!compact && (
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: '0.6rem',
                                    letterSpacing: 0.3,
                                    fontWeight: state !== 'pending' ? 700 : 500,
                                    color: state === 'pending' ? 'text.disabled' : color,
                                    mt: 0.5,
                                    textAlign: 'center',
                                    lineHeight: 1.1,
                                }}
                                noWrap
                            >
                                {step.label}
                            </Typography>
                        )}

                        {/* Connector a la derecha (excepto el último) */}
                        {!isLast && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: circleSize / 2 - 1.5,
                                    left: `calc(50% + ${circleSize / 2}px)`,
                                    right: `calc(-50% + ${circleSize / 2}px)`,
                                    height: 3,
                                    bgcolor: connectorFilled
                                        ? theme.palette.success.main
                                        : alpha(theme.palette.grey[400], 0.4),
                                    zIndex: 1,
                                }}
                            />
                        )}
                    </Box>
                );
            })}
        </Box>
    );
}
