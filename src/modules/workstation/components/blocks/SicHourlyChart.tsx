/**
 * Carta SIC con datos reales por hora — agnóstica del rol/KPI.
 *
 * Recibe `metric_code` y resuelve todo lo demás (target, trigger, dirección,
 * unidad, valores por hora, turno vigente) desde `/api/metric-samples/hourly/`.
 * Si el CD tiene un turno activo, dibuja sólo sus columnas; si no, fallback al
 * primer turno del día como referencia.
 */
import { Box, Typography, alpha } from '@mui/material';
import { useGetMetricsHourlyQuery } from '../../../personnel/services/personnelApi';

const C = {
    orange:     '#f5a623',
    orangeDark: '#d97706',
    white:      '#ffffff',
    green:      '#22c55e',
    yellow:     '#eab308',
    red:        '#ef4444',
    text:       '#1f2937',
    textSoft:   '#6b7280',
};

const SIC_ZONES: Array<'green' | 'yellow' | 'red'> = [
    ...Array(6).fill('green'), ...Array(4).fill('yellow'), ...Array(2).fill('red'),
];

function ZoneLabel({ active, flex, bg, textColor, label }: {
    /** Esta zona es la del valor de la hora actual — recibe glow + scale.
     *  Las zonas inactivas siguen en opacidad plena (es leyenda, debe ser
     *  legible siempre — nunca se atenúan). */
    active: boolean;
    flex: number; bg: string; textColor: string; label: string;
}) {
    return (
        <Box sx={{
            flex, bgcolor: bg, color: textColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 0.5, px: 0.5,
            transform: active ? 'scale(1.03)' : 'scale(1)',
            transition: 'transform 0.35s ease, box-shadow 0.35s ease',
            boxShadow: active ? `0 0 12px ${alpha(bg, 0.6)}` : 'none',
            animation: active ? 'zonePulse 2s ease-in-out infinite' : 'none',
            '@keyframes zonePulse': {
                '0%, 100%': { boxShadow: `0 0 8px ${alpha(bg, 0.5)}` },
                '50%':      { boxShadow: `0 0 18px ${alpha(bg, 0.85)}` },
            },
        }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, textAlign: 'center', lineHeight: 1.1 }}>
                {label}
            </Typography>
        </Box>
    );
}

interface Props {
    metricCode: string;
    operationalDate: string;
    distributorCenterId?: number;
    personnelId?: number;
}

export default function SicHourlyChart({
    metricCode, operationalDate, distributorCenterId, personnelId,
}: Props) {
    const { data: hourly } = useGetMetricsHourlyQuery(
        {
            metric_code: metricCode,
            operational_date: operationalDate,
            ...(distributorCenterId ? { distributor_center: distributorCenterId } : {}),
            ...(personnelId ? { personnel_id: personnelId } : {}),
        },
        { pollingInterval: 30_000 },
    );

    const target = hourly?.target ?? null;
    const trigger = hourly?.trigger ?? null;
    const direction = hourly?.direction ?? null;
    const unit = hourly?.unit ?? '';

    // Rango de horas del turno vigente del CD.
    const allHours = hourly?.hours ?? [];
    const shift = hourly?.shift;
    const firstHour = shift?.start_hour ?? 6;
    const endHourRaw = shift ? Math.max(shift.start_hour, shift.end_hour - 1) : 19;
    // Turnos que cruzan medianoche: end_hour viene > 23 desde backend.
    const crossesMidnight = endHourRaw >= 24;
    const visibleHours = (() => {
        if (!crossesMidnight) {
            return allHours.filter((h) => h.hour >= firstHour && h.hour <= endHourRaw);
        }
        const until = endHourRaw - 24;
        return [
            ...allHours.filter((h) => h.hour >= firstHour),
            ...allHours.filter((h) => h.hour <= until),
        ];
    })();
    const cols = Math.max(1, visibleHours.length);

    // Hora actual dentro del turno → se usa para el badge grande.
    const currentHour = shift?.current_hour ?? new Date().getHours();
    const currentHourData = visibleHours.find((h) => h.hour === currentHour);
    const bigValue = currentHourData?.value ?? null;
    const bigBand = currentHourData?.band ?? null;

    const activeBand: 'green' | 'yellow' | 'red' | null = (() => {
        if (bigBand === 'GREEN') return 'green';
        if (bigBand === 'YELLOW') return 'yellow';
        if (bigBand === 'RED') return 'red';
        if (bigValue === null || target === null) return null;
        if (direction === 'LOWER_IS_BETTER') {
            if (bigValue <= Number(target)) return 'green';
            if (trigger !== null && bigValue <= Number(trigger)) return 'yellow';
            return 'red';
        }
        if (bigValue >= Number(target)) return 'green';
        if (trigger !== null && bigValue >= Number(trigger)) return 'yellow';
        return 'red';
    })();
    const activeColor =
        activeBand === 'green' ? C.green :
        activeBand === 'yellow' ? C.yellow :
        activeBand === 'red' ? C.red : '#9ca3af';

    // Para cada hora, cuántas filas (de abajo hacia arriba) se "llenan" en
    // esa columna. La barra crece con la performance: bar lleno = meta cumplida
    // (alcanza el verde de arriba); bar vacío = lejos de la meta.
    const totalRows = SIC_ZONES.length; // 12
    const fillRows = (hourValue: number | null): number => {
        if (hourValue === null || target === null || hourValue < 0) return 0;
        const t = Number(target);
        if (t <= 0) return 0;
        let score: number;
        if (direction === 'LOWER_IS_BETTER') {
            // Mejor = más bajo. value=0 o value<=target → score=1 (bar lleno).
            // value=2*target → score=0.5 (medio bar).
            score = hourValue <= t ? 1 : t / hourValue;
        } else {
            // HIGHER_IS_BETTER: value>=target → score=1; value=0 → score=0.
            score = Math.min(1, hourValue / t);
        }
        return Math.max(0, Math.min(totalRows, Math.round(score * totalRows)));
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '100%', minHeight: 0, position: 'relative', overflow: 'hidden' }}>
            {bigValue !== null && (
                <Box
                    key={`${Number(bigValue).toFixed(1)}-${activeColor}`}
                    sx={{
                    position: 'absolute',
                    top: 0, right: 0, zIndex: 3,
                    bgcolor: C.white,
                    border: `4px solid ${activeColor}`,
                    borderRadius: 2,
                    px: 2, py: 0.75,
                    boxShadow: `0 4px 16px ${alpha(activeColor, 0.35)}`,
                    textAlign: 'center',
                    minWidth: 110,
                    animation: 'badgeIn 0.5s ease, badgePulse 3s ease-in-out infinite 0.5s',
                    '@keyframes badgeIn': {
                        '0%':   { transform: 'scale(0.7)', opacity: 0 },
                        '60%':  { transform: 'scale(1.08)' },
                        '100%': { transform: 'scale(1)', opacity: 1 },
                    },
                    '@keyframes badgePulse': {
                        '0%, 100%': { boxShadow: `0 4px 16px ${alpha(activeColor, 0.35)}` },
                        '50%':      { boxShadow: `0 4px 24px ${alpha(activeColor, 0.7)}` },
                    },
                }}>
                    <Typography sx={{ fontSize: '0.55rem', color: shift && !shift.is_active_now ? C.red : C.textSoft, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, lineHeight: 1.2 }}>
                        {shift
                            ? (shift.is_active_now
                                ? `Turno ${shift.name} · ${String(currentHour).padStart(2, '0')}:00`
                                : `Fuera de turno · ${String(currentHour).padStart(2, '0')}:00`)
                            : 'Hora actual'}
                    </Typography>
                    <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: activeColor, lineHeight: 1, fontFeatureSettings: '"tnum"', mt: 0.25 }}>
                        {Number(bigValue).toFixed(1)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: C.text, fontWeight: 700, lineHeight: 1 }}>
                        {unit}
                    </Typography>
                </Box>
            )}

            <Box sx={{ display: 'flex', gap: 0.5, flex: 1, minHeight: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', width: 95 }}>
                    <ZoneLabel
                        active={activeBand === 'green'}
                        flex={6} bg={C.green} textColor={C.white}
                        label={`Meta${target !== null ? ` ${direction === 'LOWER_IS_BETTER' ? '≤' : '≥'}${target}` : ''}`}
                    />
                    <ZoneLabel
                        active={activeBand === 'yellow'}
                        flex={4} bg={C.yellow} textColor={C.text}
                        label={`Alerta${trigger !== null ? ` ${direction === 'LOWER_IS_BETTER' ? '≤' : '≥'}${trigger}` : ''}`}
                    />
                    <ZoneLabel
                        active={activeBand === 'red'}
                        flex={2} bg={C.red} textColor={C.white}
                        label="Fuera meta"
                    />
                </Box>

                <Box sx={{
                    flex: 1, position: 'relative', bgcolor: '#d1d5db',
                    borderRadius: 1, p: 0.5, overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${totalRows}, 1fr)`,
                    gap: '2px',
                }}>
                    {SIC_ZONES.map((zone, row) =>
                        visibleHours.map((h, col) => {
                            const rows = fillRows(h.value);
                            const filled = row >= totalRows - rows;
                            const baseColor = zone === 'green' ? C.green : zone === 'yellow' ? C.yellow : C.red;
                            const isCurrent = h.hour === currentHour;
                            return (
                                <Box
                                    key={`${row}-${col}`}
                                    title={h.value !== null ? `${String(h.hour).padStart(2, '0')}:00 · ${h.value} ${unit}` : `${String(h.hour).padStart(2, '0')}:00 · sin datos`}
                                    sx={{
                                        bgcolor: baseColor,
                                        border: isCurrent ? `2px solid ${C.orangeDark}` : '1px solid rgba(255,255,255,0.35)',
                                        opacity: filled ? 0.95 : 0.22,
                                        boxShadow: isCurrent ? `inset 0 0 0 1px ${C.white}` : 'none',
                                        transition: 'opacity 0.5s ease, background-color 0.5s ease, transform 0.4s ease',
                                        transform: isCurrent && filled ? 'scale(1.02)' : 'scale(1)',
                                    }}
                                />
                            );
                        }),
                    )}

                    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', gap: '2px', p: 0.5 }}>
                        {visibleHours.map((h) => {
                            const rows = fillRows(h.value);
                            const rawBottomPct = (rows / totalRows) * 100;
                            const bottomPct = Math.min(82, rawBottomPct);
                            const insideCap = rawBottomPct > 82;
                            const pctOfTarget = target && h.value !== null
                                ? Math.round((Number(h.value) / Number(target)) * 100)
                                : null;
                            const isCurrent = h.hour === currentHour;
                            // Color del label según la banda del valor (la trae el backend).
                            // La hora actual también toma su color de banda — el énfasis
                            // viene del borde y sombra naranja, no de sobreescribir el color.
                            const bandBg =
                                h.band === 'GREEN'  ? C.green :
                                h.band === 'YELLOW' ? C.yellow :
                                h.band === 'RED'    ? C.red : 'rgba(0,0,0,0.82)';
                            const bandFg = h.band === 'YELLOW' ? C.text : C.white;
                            return (
                                <Box key={`lbl-${h.hour}`} sx={{ flex: 1, position: 'relative' }}>
                                    {h.value !== null && (
                                        <Box sx={{
                                            position: 'absolute',
                                            bottom: `calc(${bottomPct}% + 4px)`,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            outline: insideCap ? `2px solid ${C.white}` : 'none',
                                            bgcolor: bandBg,
                                            color: bandFg,
                                            fontSize: isCurrent ? '1.15rem' : '0.95rem',
                                            fontWeight: 900,
                                            px: 1, py: 0.4,
                                            borderRadius: 0.75,
                                            whiteSpace: 'nowrap',
                                            textAlign: 'center',
                                            lineHeight: 1.05,
                                            boxShadow: isCurrent
                                                ? `0 3px 12px ${alpha(C.orangeDark, 0.85)}`
                                                : `0 2px 5px ${alpha(bandBg, 0.55)}`,
                                            transition: 'all 0.4s ease',
                                            border: isCurrent ? `3px solid ${C.orangeDark}` : 'none',
                                        }}>
                                            {Number(h.value).toFixed(1)}
                                            {pctOfTarget !== null && (
                                                <Typography component="span" sx={{
                                                    display: 'block',
                                                    fontSize: isCurrent ? '0.8rem' : '0.7rem',
                                                    opacity: 0.9, lineHeight: 1, fontWeight: 700,
                                                }}>
                                                    {pctOfTarget}%
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: '2px', mt: 0.35, pl: '99px', flexShrink: 0, height: 18 }}>
                {visibleHours.map((h) => {
                    const isCurrent = h.hour === currentHour;
                    return (
                        <Typography
                            key={h.hour}
                            sx={{
                                flex: 1, textAlign: 'center',
                                fontSize: isCurrent ? '0.75rem' : '0.55rem',
                                color: isCurrent ? C.white : (h.count > 0 ? C.text : C.textSoft),
                                bgcolor: isCurrent ? C.orangeDark : 'transparent',
                                borderRadius: 0.25,
                                fontWeight: isCurrent ? 900 : (h.count > 0 ? 800 : 600),
                                fontFamily: 'monospace',
                                lineHeight: 1.1,
                            }}
                        >
                            {String(h.hour).padStart(2, '0')}
                        </Typography>
                    );
                })}
            </Box>
        </Box>
    );
}
