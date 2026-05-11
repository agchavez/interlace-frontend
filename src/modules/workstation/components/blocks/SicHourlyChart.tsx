/**
 * Carta SIC con datos reales por hora — agnóstica del rol/KPI.
 *
 * Layout:
 *   ┌──────────┬──────┬───────────────────────────────────┐
 *   │ Leyenda  │ Eje  │  Banda Verde / Amarilla / Roja en │
 *   │ (Meta /  │  Y   │  el FONDO según target/trigger.   │
 *   │ Alerta / │ (8,  │  - Barras por hora pintadas con   │
 *   │ Fuera)   │ 8.5, │    el color de la banda del valor │
 *   │          │ 9,   │  - Badge con valor encima de cada │
 *   │          │ 9.5, │    barra                          │
 *   │          │ 10)  │  - Eje X: horas del turno         │
 *   └──────────┴──────┴───────────────────────────────────┘
 *
 * Convención: mejor performance ARRIBA. Para HIGHER_IS_BETTER, valores
 * altos arriba; para LOWER_IS_BETTER, valores bajos arriba (eje Y invertido).
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
    barEdge:    'rgba(0,0,0,0.15)',
};

interface Props {
    metricCode: string;
    operationalDate: string;
    distributorCenterId?: number;
    personnelId?: number;
    shiftId?: number | null;
}

export default function SicHourlyChart({
    metricCode, operationalDate, distributorCenterId, personnelId, shiftId,
}: Props) {
    const { data: hourly } = useGetMetricsHourlyQuery(
        {
            metric_code: metricCode,
            operational_date: operationalDate,
            ...(distributorCenterId ? { distributor_center: distributorCenterId } : {}),
            ...(personnelId ? { personnel_ids: [personnelId] } : {}),
            ...(shiftId ? { shift_id: shiftId } : {}),
        },
        { pollingInterval: 30_000 },
    );

    const target = hourly?.target ?? null;
    const trigger = hourly?.trigger ?? null;
    const direction = hourly?.direction ?? null;
    const unit = hourly?.unit ?? '';

    // Rango de horas a mostrar (mismo flujo de la versión anterior).
    const allHours = hourly?.hours ?? [];
    const shift = hourly?.shift;
    const dataHours = allHours.filter((h) => h.count > 0).map((h) => h.hour);
    const hasShift = !!shift;
    const hasData = dataHours.length > 0;
    let firstHour: number;
    let endHourRaw: number;
    let crossesMidnight = false;
    if (hasShift) {
        firstHour = shift.start_hour;
        endHourRaw = Math.max(shift.start_hour, shift.end_hour - 1);
        crossesMidnight = endHourRaw >= 24;
    } else if (hasData) {
        const hasEarly = dataHours.some((h) => h <= 11);
        const hasLate = dataHours.some((h) => h >= 18);
        if (hasEarly && hasLate) {
            firstHour = Math.min(...dataHours.filter((h) => h >= 18));
            const maxEarly = Math.max(...dataHours.filter((h) => h <= 11));
            endHourRaw = 24 + maxEarly;
            crossesMidnight = true;
        } else {
            firstHour = Math.min(...dataHours);
            endHourRaw = Math.max(...dataHours);
        }
    } else {
        firstHour = 6;
        endHourRaw = 19;
    }
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

    // Badge grande con el valor de la hora actual.
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

    // ── Escala Y según target/trigger y valores observados ──────────────
    const values = visibleHours
        .map((h) => h.value)
        .filter((v): v is number => v !== null);
    const t = target !== null ? Number(target) : null;
    const tr = trigger !== null ? Number(trigger) : null;
    const candidates = [t, tr, ...values].filter((v): v is number => v !== null);
    let yMin = candidates.length ? Math.min(...candidates) : 0;
    let yMax = candidates.length ? Math.max(...candidates) : 1;
    const rawSpan = Math.max(yMax - yMin, 1);
    yMin = Math.max(0, yMin - rawSpan * 0.20);
    yMax = yMax + rawSpan * 0.25;

    const toTopPct = (v: number): number => {
        const normalized = (v - yMin) / (yMax - yMin);
        const clamped = Math.max(0, Math.min(1, normalized));
        return direction === 'LOWER_IS_BETTER' ? clamped * 100 : (1 - clamped) * 100;
    };

    // Bandas de fondo según target/trigger.
    const bandHi = t !== null && tr !== null
        ? { greenEnd: toTopPct(t), yellowEnd: toTopPct(tr) }
        : null;

    // Ticks del eje Y. Step adaptativo según el span.
    const yTicks = (() => {
        const span = yMax - yMin;
        let step: number;
        if (span <= 1) step = 0.1;
        else if (span <= 2.5) step = 0.25;
        else if (span <= 5) step = 0.5;
        else if (span <= 10) step = 1;
        else if (span <= 25) step = 2;
        else if (span <= 50) step = 5;
        else step = Math.ceil(span / 10);
        const start = Math.ceil(yMin / step) * step;
        const ticks: number[] = [];
        for (let v = start; v <= yMax + 1e-9; v += step) {
            ticks.push(Number(v.toFixed(2)));
        }
        return ticks;
    })();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '100%', minHeight: 0, position: 'relative', overflow: 'hidden' }}>
            {bigValue !== null && (
                <Box
                    key={`${Number(bigValue).toFixed(1)}-${activeColor}`}
                    sx={{
                    position: 'absolute',
                    top: 0, right: 0, zIndex: 5,
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
                {/* Leyenda zonas: Meta / Alerta / Fuera */}
                <Box sx={{ display: 'flex', flexDirection: 'column', width: 80, position: 'relative' }}>
                    {bandHi ? (
                        <>
                            <ZoneLabel
                                active={activeBand === 'green'}
                                top={0}
                                height={`${bandHi.greenEnd}%`}
                                bg={C.green}
                                textColor={C.white}
                                label={`Meta ${direction === 'LOWER_IS_BETTER' ? '≤' : '≥'}${t}`}
                            />
                            <ZoneLabel
                                active={activeBand === 'yellow'}
                                top={`${bandHi.greenEnd}%`}
                                height={`${bandHi.yellowEnd - bandHi.greenEnd}%`}
                                bg={C.yellow}
                                textColor={C.text}
                                label={`Alerta ${direction === 'LOWER_IS_BETTER' ? '≤' : '≥'}${tr}`}
                            />
                            <ZoneLabel
                                active={activeBand === 'red'}
                                top={`${bandHi.yellowEnd}%`}
                                height={`${100 - bandHi.yellowEnd}%`}
                                bg={C.red}
                                textColor={C.white}
                                label="Fuera meta"
                            />
                        </>
                    ) : (
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textSoft, p: 1, textAlign: 'center', fontSize: '0.65rem' }}>
                            Sin KpiTarget configurado
                        </Box>
                    )}
                </Box>

                {/* Escala Y: ticks numéricos alineados al valor real */}
                <Box sx={{ width: 32, position: 'relative', flexShrink: 0 }}>
                    {yTicks.map((tick) => (
                        <Box
                            key={`yt-${tick}`}
                            sx={{
                                position: 'absolute',
                                left: 0, right: 0,
                                top: `${toTopPct(tick)}%`,
                                transform: 'translateY(-50%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                pr: 0.5,
                            }}
                        >
                            <Typography sx={{
                                fontSize: '0.6rem', fontWeight: 700,
                                color: C.textSoft, fontFamily: 'monospace',
                                lineHeight: 1, fontFeatureSettings: '"tnum"',
                            }}>
                                {Number.isInteger(tick) ? tick : tick.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Chart con bandas de fondo + barras por hora + badges */}
                <Box sx={{
                    flex: 1, position: 'relative', bgcolor: '#f3f4f6',
                    borderRadius: 1, overflow: 'hidden',
                }}>
                    {/* Bandas verde/amarillo/rojo de fondo */}
                    {bandHi && (
                        <>
                            <Box sx={{
                                position: 'absolute', left: 0, right: 0,
                                top: 0, height: `${bandHi.greenEnd}%`,
                                bgcolor: alpha(C.green, 0.18),
                            }} />
                            <Box sx={{
                                position: 'absolute', left: 0, right: 0,
                                top: `${bandHi.greenEnd}%`, height: `${bandHi.yellowEnd - bandHi.greenEnd}%`,
                                bgcolor: alpha(C.yellow, 0.18),
                            }} />
                            <Box sx={{
                                position: 'absolute', left: 0, right: 0,
                                top: `${bandHi.yellowEnd}%`, height: `${100 - bandHi.yellowEnd}%`,
                                bgcolor: alpha(C.red, 0.18),
                            }} />
                        </>
                    )}

                    {/* Líneas guía horizontales en cada tick del eje Y */}
                    {yTicks.map((tick) => (
                        <Box key={`gl-${tick}`} sx={{
                            position: 'absolute', left: 0, right: 0,
                            top: `${toTopPct(tick)}%`, height: 0,
                            borderTop: '1px dashed rgba(0,0,0,0.08)',
                            pointerEvents: 'none',
                        }} />
                    ))}

                    {/* Líneas de target y trigger más marcadas */}
                    {bandHi && (
                        <>
                            <Box sx={{
                                position: 'absolute', left: 0, right: 0,
                                top: `${bandHi.greenEnd}%`, height: 0,
                                borderTop: `2px dashed ${C.green}`,
                                pointerEvents: 'none', zIndex: 2,
                            }} />
                            <Box sx={{
                                position: 'absolute', left: 0, right: 0,
                                top: `${bandHi.yellowEnd}%`, height: 0,
                                borderTop: `2px dashed ${C.red}`,
                                pointerEvents: 'none', zIndex: 2,
                            }} />
                        </>
                    )}

                    {/* Barras por hora */}
                    <Box sx={{
                        position: 'absolute', inset: 0,
                        display: 'grid',
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                        alignItems: 'end',
                    }}>
                        {visibleHours.map((h) => {
                            const isCurrent = h.hour === currentHour;
                            if (h.value === null) {
                                return (
                                    <Box key={`bar-${h.hour}`} sx={{
                                        borderRight: '1px dashed rgba(0,0,0,0.08)',
                                        height: '100%',
                                    }} />
                                );
                            }
                            const yPct = toTopPct(h.value);
                            const bandBg =
                                h.band === 'GREEN'  ? C.green :
                                h.band === 'YELLOW' ? C.yellow :
                                h.band === 'RED'    ? C.red : '#9ca3af';
                            // Para LOWER_IS_BETTER el bar crece desde el TOP hacia abajo
                            // (mejor está arriba — el bar "indica hasta dónde llega").
                            // Para HIGHER, crece desde el BOTTOM hacia arriba.
                            const barHeight = direction === 'LOWER_IS_BETTER'
                                ? `${yPct}%`
                                : `${100 - yPct}%`;
                            const barTop = direction === 'LOWER_IS_BETTER' ? 0 : undefined;
                            const barBottom = direction === 'LOWER_IS_BETTER' ? undefined : 0;
                            return (
                                <Box key={`bar-${h.hour}`} sx={{
                                    position: 'relative',
                                    height: '100%',
                                    borderRight: '1px dashed rgba(0,0,0,0.08)',
                                    bgcolor: isCurrent ? alpha(C.orangeDark, 0.06) : 'transparent',
                                }}>
                                    <Box sx={{
                                        position: 'absolute',
                                        left: '12%', right: '12%',
                                        top: barTop, bottom: barBottom,
                                        height: barHeight,
                                        bgcolor: bandBg,
                                        border: `1px solid ${alpha(bandBg, 0.85)}`,
                                        borderRadius: '4px 4px 0 0',
                                        boxShadow: isCurrent
                                            ? `0 0 0 2px ${C.orangeDark}, 0 4px 12px ${alpha(C.orangeDark, 0.4)}`
                                            : `0 1px 3px ${alpha(bandBg, 0.45)}`,
                                        transition: 'all 0.4s ease',
                                    }} />
                                </Box>
                            );
                        })}
                    </Box>

                    {/* Badges con valor encima de cada barra */}
                    {visibleHours.map((h, i) => {
                        if (h.value === null) return null;
                        const xPct = ((i + 0.5) / cols) * 100;
                        const yPct = toTopPct(h.value);
                        const isCurrent = h.hour === currentHour;
                        const bandBg =
                            h.band === 'GREEN'  ? C.green :
                            h.band === 'YELLOW' ? C.yellow :
                            h.band === 'RED'    ? C.red : 'rgba(0,0,0,0.82)';
                        const bandFg = h.band === 'YELLOW' ? C.text : C.white;
                        const pctOfTarget = t !== null
                            ? Math.round((Number(h.value) / t) * 100)
                            : null;
                        // El badge cae justo sobre el extremo de la barra (top
                        // de la barra para HIGHER, bottom para LOWER).
                        const isLower = direction === 'LOWER_IS_BETTER';
                        return (
                            <Box
                                key={`badge-${h.hour}`}
                                sx={{
                                    position: 'absolute',
                                    left: `${xPct}%`,
                                    top: `${yPct}%`,
                                    transform: isLower
                                        ? 'translate(-50%, 4px)'
                                        : 'translate(-50%, calc(-100% - 4px))',
                                    zIndex: 4,
                                    pointerEvents: 'none',
                                }}
                            >
                                <Box sx={{
                                    bgcolor: bandBg,
                                    color: bandFg,
                                    fontSize: isCurrent ? '0.95rem' : '0.78rem',
                                    fontWeight: 900,
                                    px: 0.75, py: 0.25,
                                    borderRadius: 0.5,
                                    whiteSpace: 'nowrap',
                                    textAlign: 'center',
                                    lineHeight: 1.05,
                                    boxShadow: isCurrent
                                        ? `0 3px 12px ${alpha(C.orangeDark, 0.85)}`
                                        : `0 2px 4px ${alpha(bandBg, 0.45)}`,
                                    border: isCurrent ? `2px solid ${C.orangeDark}` : 'none',
                                }}>
                                    {Number(h.value).toFixed(1)}
                                    {pctOfTarget !== null && (
                                        <Typography component="span" sx={{
                                            display: 'block',
                                            fontSize: isCurrent ? '0.65rem' : '0.58rem',
                                            opacity: 0.9, lineHeight: 1, fontWeight: 700,
                                        }}>
                                            {pctOfTarget}%
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            {/* Eje X: labels de hora */}
            <Box sx={{ display: 'flex', gap: '2px', mt: 0.35, pl: '116px', flexShrink: 0, height: 18 }}>
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

// Leyenda de zonas a la izquierda.
function ZoneLabel({ active, top, height, bg, textColor, label }: {
    active: boolean;
    top: number | string;
    height: number | string;
    bg: string;
    textColor: string;
    label: string;
}) {
    return (
        <Box sx={{
            position: 'absolute',
            left: 0, right: 0, top, height,
            bgcolor: bg, color: textColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 0.5, mx: 0.25,
            transform: active ? 'scale(1.03)' : 'scale(1)',
            transition: 'transform 0.35s ease, box-shadow 0.35s ease',
            boxShadow: active ? `0 0 12px ${alpha(bg, 0.6)}` : 'none',
            animation: active ? 'zonePulse 2s ease-in-out infinite' : 'none',
            '@keyframes zonePulse': {
                '0%, 100%': { boxShadow: `0 0 8px ${alpha(bg, 0.5)}` },
                '50%':      { boxShadow: `0 0 18px ${alpha(bg, 0.85)}` },
            },
        }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, textAlign: 'center', lineHeight: 1.1, px: 0.5 }}>
                {label}
            </Typography>
        </Box>
    );
}
