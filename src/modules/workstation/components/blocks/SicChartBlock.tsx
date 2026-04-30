/**
 * Bloque SIC_CHART — gráfico SIC con tabs por KPI.
 *
 * Hoy es un placeholder: pinta tabs (KPIs) + grilla coloreada zonas
 * verde/amarillo/rojo + fila de horas. La data real vendrá cuando se
 * conecte a metric_sample.
 */
import { useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import BlockShell from './BlockShell';
import type { SicChartBlockConfig } from '../../interfaces/workstation';

const C = {
    green:  '#86efac',
    yellow: '#fde68a',
    red:    '#fecaca',
    orange: '#f5a623',
    text:   '#1f2937',
    white:  '#ffffff',
    soft:   '#6b7280',
};

export default function SicChartBlock({ config }: { config: SicChartBlockConfig }) {
    const kpis = config.kpis || [];
    const [activeIdx, setActiveIdx] = useState(0);

    // Auto-cycle entre KPIs si está configurado
    useEffect(() => {
        if (!config.cycle_seconds || kpis.length <= 1) return;
        const id = setInterval(
            () => setActiveIdx(i => (i + 1) % kpis.length),
            config.cycle_seconds * 1000,
        );
        return () => clearInterval(id);
    }, [config.cycle_seconds, kpis.length]);

    const active = kpis[activeIdx];

    const hours = useMemo(() => {
        const out: string[] = [];
        const now = new Date();
        const cur = now.getHours();
        for (let i = -5; i <= 4; i++) out.push(String((cur + i + 24) % 24).padStart(2, '0'));
        return out;
    }, []);
    const currentHourIdx = 5;  // posición central

    return (
        <BlockShell title={config.title || 'SIC / Pi Crítico'}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0.75 }}>
                {/* Tabs por KPI */}
                {kpis.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {kpis.map((k, i) => (
                            <Box
                                key={i}
                                onClick={() => setActiveIdx(i)}
                                sx={{
                                    px: 1.25, py: 0.5, borderRadius: 0.75, cursor: 'pointer',
                                    bgcolor: i === activeIdx ? C.orange : C.white,
                                    color: i === activeIdx ? C.white : C.text,
                                    fontWeight: i === activeIdx ? 800 : 600,
                                    fontSize: { xs: '0.7rem', md: '0.85rem' },
                                    border: `1px solid ${i === activeIdx ? C.orange : 'rgba(0,0,0,0.1)'}`,
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                {k.label}
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Grilla SIC */}
                <Box sx={{ flex: 1, display: 'flex', gap: 0.75, minHeight: 0 }}>
                    {/* Labels izquierda — el operador "≥" / "≤" depende de la dirección del KPI */}
                    {(() => {
                        const lower = active?.direction === 'LOWER_IS_BETTER';
                        const op = lower ? '≤' : '≥';
                        const fmt = (v: number | undefined | null) => (v ?? null) === null ? '' : `${op}${v}`;
                        return (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', width: 60 }}>
                                <Box sx={{ flex: 6, bgcolor: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0.5, px: 0.5 }}>
                                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#166534', textAlign: 'center', lineHeight: 1.1 }}>
                                        Meta {fmt(active?.goal_min)}
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: 4, bgcolor: C.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0.5, px: 0.5 }}>
                                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#854d0e', textAlign: 'center', lineHeight: 1.1 }}>
                                        Alerta {fmt(active?.yellow_min)}
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: 2, bgcolor: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0.5, px: 0.5 }}>
                                    <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color: '#991b1b', textAlign: 'center', lineHeight: 1.1 }}>
                                        Fuera meta
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })()}

                    {/* Cuadrícula */}
                    <Box sx={{
                        flex: 1, position: 'relative', bgcolor: '#e5e7eb',
                        borderRadius: 1, p: 0.5, overflow: 'hidden',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(10, 1fr)',
                        gridTemplateRows: 'repeat(12, 1fr)',
                        gap: '2px',
                    }}>
                        {Array.from({ length: 12 }).map((_, row) =>
                            Array.from({ length: 10 }).map((_, col) => {
                                const zone = row < 6 ? 'green' : row < 10 ? 'yellow' : 'red';
                                const isActive = col === currentHourIdx;
                                return (
                                    <Box key={`${row}-${col}`} sx={{
                                        bgcolor: zone === 'green' ? C.green : zone === 'yellow' ? C.yellow : C.red,
                                        border: isActive ? '1px solid rgba(245,166,35,0.8)' : '1px solid rgba(255,255,255,0.4)',
                                        opacity: 0.7,
                                    }} />
                                );
                            }),
                        )}
                    </Box>
                </Box>

                {/* Fila de horas */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '60px repeat(10, 1fr)', gap: '2px' }}>
                    <Box />
                    {hours.map((h, i) => (
                        <Box key={i} sx={{
                            bgcolor: i === currentHourIdx ? C.orange : 'transparent',
                            color: i === currentHourIdx ? C.white : C.soft,
                            fontWeight: i === currentHourIdx ? 800 : 600,
                            fontSize: { xs: '0.6rem', md: '0.75rem' },
                            textAlign: 'center', borderRadius: 0.5, py: 0.25,
                        }}>
                            {h}
                        </Box>
                    ))}
                </Box>
            </Box>
        </BlockShell>
    );
}
