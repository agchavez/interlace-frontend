/**
 * Bloque SIC_CHART — Carta SIC con datos reales por hora.
 *
 * Lee `config.kpis` (expandido server-side desde `metric_codes` + KPITargetModel
 * vigente del CD) y muestra una métrica a la vez. El usuario puede tocar las
 * tabs o dejar que auto-rote cada `cycle_seconds`. El gráfico mismo
 * (`SicHourlyChart`) resuelve target/trigger/dirección y agrega por hora vía
 * `/api/metric-samples/hourly/`.
 *
 * Versátil por diseño: hoy 3 KPIs, mañana 2 o 5 — depende de cuántos códigos
 * configure el admin del CD en el editor de la Workstation.
 */
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import BlockShell from './BlockShell';
import SicHourlyChart from './SicHourlyChart';
import type { SicChartBlockConfig } from '../../interfaces/workstation';
import { todayInHonduras } from '../../../../utils/timezone';

const C = {
    orange: '#f5a623',
    text:   '#1f2937',
    white:  '#ffffff',
    soft:   '#6b7280',
};

interface Props {
    config: SicChartBlockConfig;
    distributorCenterId?: number;
    /** Si está presente, restringe los samples a esta persona (vista individual). */
    personnelId?: number;
    /** YYYY-MM-DD; default: hoy en HN. */
    operationalDate?: string;
}

export default function SicChartBlock({
    config, distributorCenterId, personnelId, operationalDate,
}: Props) {
    const kpis = (config.kpis || []).filter(k => !!k.metric_code);
    const [activeIdx, setActiveIdx] = useState(0);

    // Resetear si la lista de KPIs cambia (por ejemplo, el admin agregó una métrica).
    useEffect(() => {
        if (activeIdx >= kpis.length) setActiveIdx(0);
    }, [kpis.length, activeIdx]);

    // Auto-rotación entre KPIs configurados.
    useEffect(() => {
        if (!config.cycle_seconds || kpis.length <= 1) return;
        const id = setInterval(
            () => setActiveIdx(i => (i + 1) % kpis.length),
            config.cycle_seconds * 1000,
        );
        return () => clearInterval(id);
    }, [config.cycle_seconds, kpis.length]);

    const active = kpis[activeIdx];
    const opDate = operationalDate || todayInHonduras();

    return (
        <BlockShell title={config.title || 'SIC / Pi Crítico'}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0.75 }}>
                {kpis.length > 1 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {kpis.map((k, i) => (
                            <Box
                                key={k.metric_code || i}
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

                <Box sx={{ flex: 1, minHeight: 0 }}>
                    {active?.metric_code ? (
                        <SicHourlyChart
                            key={active.metric_code}
                            metricCode={active.metric_code}
                            operationalDate={opDate}
                            distributorCenterId={distributorCenterId}
                            personnelId={personnelId}
                        />
                    ) : (
                        <Box sx={{
                            height: '100%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            color: C.soft, p: 2, textAlign: 'center',
                        }}>
                            <Typography sx={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                                Sin KPIs configurados · agregá métricas en el editor de la estación.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </BlockShell>
    );
}
