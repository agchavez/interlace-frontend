import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, useTheme, alpha } from '@mui/material';
import { ChevronRight as ChevronIcon, CheckCircle as DoneIcon } from '@mui/icons-material';

interface Props {
    label: string;
    /** Label que aparece cuando el deslizamiento está en progreso. Default: "Suelta para confirmar". */
    confirmingLabel?: string;
    /** Label cuando se ejecuta la acción. */
    loadingLabel?: string;
    /** Callback async cuando el usuario completa el swipe. */
    onConfirm: () => Promise<void> | void;
    /** Color del progreso. Default = primary. */
    color?: 'primary' | 'success' | 'warning' | 'error' | 'secondary';
    disabled?: boolean;
    loading?: boolean;
    /** Icono del handle (default flecha). */
    icon?: React.ReactNode;
}

/**
 * Slide-to-confirm: el usuario debe arrastrar el handle hasta el final para
 * confirmar la acción. Si suelta antes, el handle vuelve al inicio.
 * Soporta pointer events (mouse + touch).
 */
export default function SwipeToConfirm({
    label,
    confirmingLabel = 'Suelta para confirmar',
    loadingLabel = 'Procesando...',
    onConfirm,
    color = 'primary',
    disabled = false,
    loading = false,
    icon,
}: Props) {
    const theme = useTheme();
    const trackRef = useRef<HTMLDivElement | null>(null);
    const draggingRef = useRef(false);
    const startXRef = useRef(0);
    const confirmedRef = useRef(false);

    const [offset, setOffset] = useState(0);        // px desplazados
    const [maxOffset, setMaxOffset] = useState(0);  // ancho máximo disponible
    const [confirming, setConfirming] = useState(false);
    const [done, setDone] = useState(false);

    const HANDLE_SIZE = 48;

    const updateMax = useCallback(() => {
        if (trackRef.current) {
            setMaxOffset(trackRef.current.clientWidth - HANDLE_SIZE - 8);
        }
    }, []);

    useEffect(() => {
        updateMax();
        const obs = new ResizeObserver(updateMax);
        if (trackRef.current) obs.observe(trackRef.current);
        return () => obs.disconnect();
    }, [updateMax]);

    const resetHandle = useCallback(() => {
        setOffset(0);
        draggingRef.current = false;
    }, []);

    const triggerConfirm = useCallback(async () => {
        if (confirmedRef.current) return;
        confirmedRef.current = true;
        setConfirming(true);
        try {
            // Safety timeout: si la acción no responde en 25s, abortamos para no dejar al usuario pegado.
            await Promise.race([
                Promise.resolve(onConfirm()),
                new Promise<void>((_, reject) =>
                    setTimeout(() => reject(new Error('timeout')), 25_000),
                ),
            ]);
            setDone(true);
            setTimeout(() => {
                setDone(false);
                confirmedRef.current = false;
                resetHandle();
            }, 900);
        } catch {
            confirmedRef.current = false;
            resetHandle();
        } finally {
            setConfirming(false);
        }
    }, [onConfirm, resetHandle]);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (disabled || loading || confirming || done) return;
        draggingRef.current = true;
        startXRef.current = e.clientX - offset;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!draggingRef.current) return;
        const raw = e.clientX - startXRef.current;
        const clamped = Math.max(0, Math.min(maxOffset, raw));
        setOffset(clamped);
    };

    const handlePointerUp = () => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        if (offset >= maxOffset - 4) {
            setOffset(maxOffset);
            triggerConfirm();
        } else {
            setOffset(0);
        }
    };

    const progress = maxOffset > 0 ? offset / maxOffset : 0;
    const bg = theme.palette[color].main;
    const bgDark = theme.palette[color].dark;
    const filledBg = alpha(bg, 0.18 + progress * 0.35);

    const displayLabel = done
        ? '¡Hecho!'
        : confirming
        ? loadingLabel
        : progress > 0.85
        ? confirmingLabel
        : label;

    const isIdle = !draggingRef.current && offset === 0 && !confirming && !done;

    return (
        <Box
            ref={trackRef}
            sx={{
                position: 'relative',
                height: HANDLE_SIZE + 8,
                borderRadius: (HANDLE_SIZE + 8) / 2,
                bgcolor: filledBg,
                border: `2px solid ${alpha(bg, 0.5)}`,
                overflow: 'hidden',
                userSelect: 'none',
                touchAction: 'none',
                opacity: disabled ? 0.5 : 1,
                transition: 'background-color 0.15s ease',
                boxShadow: `inset 0 1px 3px ${alpha(bg, 0.2)}`,
                '@keyframes stcShimmer': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                '@keyframes stcChevronHint': {
                    '0%': { opacity: 0.25, transform: 'translateX(0)' },
                    '50%': { opacity: 1, transform: 'translateX(4px)' },
                    '100%': { opacity: 0.25, transform: 'translateX(0)' },
                },
                '&::before': isIdle
                    ? {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          width: '40%',
                          background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.35)}, transparent)`,
                          animation: 'stcShimmer 2.2s ease-in-out infinite',
                          pointerEvents: 'none',
                          zIndex: 1,
                      }
                    : {},
            }}
        >
            {/* Progress fill — nace en el centro del handle y crece hacia la derecha */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 4,
                    left: 4 + HANDLE_SIZE / 2,
                    bottom: 4,
                    width: `${offset}px`,
                    bgcolor: alpha(bg, 0.25),
                    borderRadius: 0,
                    transition: draggingRef.current ? 'none' : 'width 0.25s ease',
                    pointerEvents: 'none',
                }}
            />

            {/* Label */}
            <Typography
                sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    letterSpacing: 1,
                    color: theme.palette[color].dark,
                    textTransform: 'uppercase',
                    pointerEvents: 'none',
                    zIndex: 1,
                    opacity: 1 - progress * 0.4,
                    transition: draggingRef.current ? 'none' : 'opacity 0.2s ease',
                }}
            >
                {displayLabel}
            </Typography>


            {/* Handle */}
            <Box
                role="button"
                aria-label={label}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                sx={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    width: HANDLE_SIZE,
                    height: HANDLE_SIZE,
                    transform: `translateX(${offset}px)`,
                    background: `linear-gradient(135deg, ${bg} 0%, ${bgDark} 100%)`,
                    color: '#fff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 10px ${alpha(bgDark, 0.45)}, inset 0 1px 1px ${alpha('#fff', 0.25)}`,
                    cursor: disabled || loading || confirming ? 'not-allowed' : 'grab',
                    '&:active': { cursor: 'grabbing' },
                    transition: draggingRef.current ? 'none' : 'transform 0.25s ease',
                    touchAction: 'none',
                    zIndex: 2,
                    '& svg': { fontSize: '1.4rem' },
                }}
            >
                {confirming ? (
                    <CircularProgress size={20} sx={{ color: '#fff' }} />
                ) : done ? (
                    <DoneIcon />
                ) : (
                    icon || <ChevronIcon />
                )}
            </Box>
        </Box>
    );
}
