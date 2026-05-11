/**
 * Carta SIC con datos reales por hora — agnóstica del rol/KPI.
 *
 * Layout:
 *   ┌──────────┬─────────────────────────────────────┐
 *   │ Leyenda  │  Banda Verde / Amarilla / Roja en   │
 *   │ (Meta /  │  el FONDO según target/trigger.     │
 *   │ Alerta / │  - Badges posicionados al valor Y   │
 *   │ Fuera)   │    real (no a un "score" calculado) │
 *   │          │  - Línea SVG conectando los puntos  │
 *   │          │  - Eje X: horas del turno           │
 *   └──────────┴─────────────────────────────────────┘
 *
 * Convención: mejor performance va ARRIBA. Para HIGHER_IS_BETTER, valores
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
    line:       '#111827',
    lineSoft:   '#374151',
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

    // Rango de horas del turno vigente.
    const allHours = hourly?.hours ?? [];
    const shift = hourly?.shift;
    const firstHour = shift?.start_hour ?? 6;
    const endHourRaw = shift ? Math.max(shift.start_hour, shift.end_hour - 1) : 19;
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

    // Hora actual → badge grande.
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

    // ── Escala Y según target/trigger y los valores observados ───────────
    // Calculamos un dominio Y razonable que incluya target, trigger y todos
    // los valores con algo de aire arriba/abajo. La banda verde/amarilla/roja
    // del fondo se pinta proporcional a este dominio.
    const values = visibleHours
        .map((h) => h.value)
        .filter((v): v is number => v !== null);
    const t = target !== null ? Number(target) : null;
    const tr = trigger !== null ? Number(trigger) : null;
    const candidates = [t, tr, ...values].filter((v): v is number => v !== null);
    let yMin = candidates.length ? Math.min(...candidates) : 0;
    let yMax = candidates.length ? Math.max(...candidates) : 1;
    // Padding arriba/abajo para que los puntos no queden pegados al borde.
    const span = Math.max(yMax - yMin, 1);
    yMin = Math.max(0, yMin - span * 0.20);
    yMax = yMax + span * 0.25;

    /** Convierte un valor del KPI a un "top%" (0% = arriba del chart, 100% =
     *  abajo). Para HIGHER_IS_BETTER, valor alto → top=0%. Para
     *  LOWER_IS_BETTER, valor bajo → top=0%. */
    const toTopPct = (v: number): number => {
        const normalized = (v - yMin) / (yMax - yMin);
        const clamped = Math.max(0, Math.min(1, normalized));
        return direction === 'LOWER_IS_BETTER' ? clamped * 100 : (1 - clamped) * 100;
    };

    // ── Bandas de fondo según target/trigger ─────────────────────────────
    // Las bandas son tramos verticales que dividen el chart en 3 zonas.
    // Para HIGHER_IS_BETTER, arriba=verde (>=target), medio=amarillo
    // ([trigger, target)), abajo=rojo (<trigger). Para LOWER es al revés.
    const bandHi = t !== null && tr !== null
        ? { greenEnd: toTopPct(t), yellowEnd: toTopPct(tr) }
        : null;

    // Path de la línea conectando los valores reales.
    const linePath = (() => {
        const pts = visibleHours.map((h, i) => {
            if (h.value === null) return null;
            const xPct = ((i + 0.5) / cols) * 100;
            const yPct = toTopPct(h.value);
            return { x: xPct, y: yPct };
        }).filter((p): p is { x: number; y: number } => p !== null);
        if (pts.length < 2) return '';
        return pts
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
            .join(' ');
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
                {/* Leyenda Y a la izquierda con etiquetas Meta/Alerta/Fuera */}
                <Box sx={{ display: 'flex', flexDirection: 'column', width: 95, position: 'relative' }}>
                    {bandHi ? (
                        <>
                            <ZoneLabel
                                active={activeBand === 'green'}
                                top={0}
                                height={`${bandHi.greenEnd}%`}
                                bg={direction === 'LOWER_IS_BETTER' ? C.green : C.green}
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

                {/* Chart: bandas de fondo + grid de horas + línea + badges */}
                <Box sx={{
                    flex: 1, position: 'relative', bgcolor: '#f3f4f6',
                    borderRadius: 1, overflow: 'hidden',
                }}>
                    {/* Bandas verde/amarillo/rojo de fondo (tenues) */}
                    {bandHi && (
                        <>
                            <Box sx={{
                                position: 'absolute', left: 0, right: 0,
                                top: 0, height: `${bandHi.greenEnd}%`,
                                bgcolor: alpha(C.green, 0.18),
                                borderBottom: `1px dashed ${alpha(C.green, 0.5)}`,
                            }} />
                            <Box sx={{
                                position: 'absolute', left: 0, right: 0,
                                top: `${bandHi.greenEnd}%`, height: `${bandHi.yellowEnd - bandHi.greenEnd}%`,
                                bgcolor: alpha(C.yellow, 0.18),
                                borderBottom: `1px dashed ${alpha(C.yellow, 0.6)}`,
                            }} />
                            <Box sx={{
                                position: 'absolute', left: 0, right: 0,
                                top: `${bandHi.yellowEnd}%`, height: `${100 - bandHi.yellowEnd}%`,
                                bgcolor: alpha(C.red, 0.18),
                            }} />
                        </>
                    )}

                    {/* Columnas verticales (separadores por hora) */}
                    <Box sx={{
                        position: 'absolute', inset: 0,
                        display: 'grid',
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                        pointerEvents: 'none',
                    }}>
                        {visibleHours.map((h) => {
                            const isCurrent = h.hour === currentHour;
                            return (
                                <Box
                                    key={`col-${h.hour}`}
                                    sx={{
                                        borderRight: '1px dashed rgba(0,0,0,0.08)',
                                        bgcolor: isCurrent ? alpha(C.orangeDark, 0.06) : 'transparent',
                                    }}
                                />
                            );
                        })}
                    </Box>

                    {/* Línea SVG conectando puntos */}
                    {linePath && (
                        <Box
                            component="svg"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            sx={{
                                position: 'absolute', inset: 0,
                                width: '100%', height: '100%',
                                pointerEvents: 'none', overflow: 'visible',
                            }}
                        >
                            <path
                                d={linePath}
                                fill="none"
                                stroke={C.line}
                                strokeWidth={0.6}
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                vectorEffect="non-scaling-stroke"
                                style={{ strokeWidth: 3 }}
                            />
                        </Box>
                    )}

                    {/* Puntos (dots) + badges con valor */}
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
                        // El badge cae JUSTO al lado del punto, no encima — para que
                        // no se solape con la línea ni con los puntos vecinos.
                        return (
                            <Box
                                key={`pt-${h.hour}`}
                                sx={{
                                    position: 'absolute',
                                    left: `${xPct}%`,
                                    top: `${yPct}%`,
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: 3,
                                }}
                            >
                                <Box sx={{
                                    width: isCurrent ? 14 : 10,
                                    height: isCurrent ? 14 : 10,
                                    borderRadius: '50%',
                                    bgcolor: bandBg,
                                    border: `2px solid ${C.white}`,
                                    boxShadow: isCurrent
                                        ? `0 0 0 3px ${C.orangeDark}, 0 4px 12px ${alpha(C.orangeDark, 0.6)}`
                                        : `0 2px 4px ${alpha(bandBg, 0.6)}`,
                                }} />
                                <Box sx={{
                                    position: 'absolute',
                                    top: isCurrent ? -32 : -28,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
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

                    {/* Líneas guía: target y trigger */}
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
                </Box>
            </Box>

            {/* Eje X: labels de hora */}
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

// ── Leyenda de zonas a la izquierda ─────────────────────────────────────
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
