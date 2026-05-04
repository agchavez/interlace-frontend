/**
 * Layout fijo de la TV de Workstation, según el orden que pidió Ricardo:
 *
 *   ┌──── Header naranja ────────────────────────────────┐
 *   │ [TÍTULO]                          [DPO] [Reloj]    │
 *   ├────────┬────────────────────┬──────────────────────┤
 *   │ Riesgos│                    │   Top performers     │ ← Rosado
 *   │  +     │  Carta SIC + Resul │   Bottom perf.       │
 *   │Prohib  │  (protagonista)    │                      │
 *   │  +     │  amarillo          ├──────────────────────┤
 *   │Disp/   │                    │   Planes de Reacción │ ← Verde
 *   │Metas   │                    │   + QRs              │
 *   └────────┴────────────────────┴──────────────────────┘
 *      ROJO        AMARILLO              ROSADO/VERDE
 *
 * Toma los bloques de la Workstation y los pinta en el slot correspondiente
 * según su `type`. Si un slot está vacío, muestra hint amistoso.
 *
 * Render mode:
 *   - "tv":      full screen, sin chrome de edición
 *   - "preview": render escalado dentro del drawer del editor
 */
import { useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Schedule as ClockIcon } from '@mui/icons-material';
import RisksBlock from './blocks/RisksBlock';
import ProhibitionsBlock from './blocks/ProhibitionsBlock';
import TriggersBlock from './blocks/TriggersBlock';
import SicChartBlock from './blocks/SicChartBlock';
import ReactionPlansBlock from './blocks/ReactionPlansBlock';
import PerformersBlock from './blocks/PerformersBlock';
import { QrDocumentBlock, QrExternalBlock } from './blocks/QrBlocks';
import { ImageBlock, TextBlock } from './blocks/SimpleBlocks';
import type { PerformersBlockConfig } from '../interfaces/workstation';
import type {
    BlockType, ProhibitionsBlockConfig, ReactionPlansBlockConfig,
    RisksBlockConfig, SicChartBlockConfig, TriggersBlockConfig,
    Workstation, WorkstationBlock,
} from '../interfaces/workstation';
import { HN_TIMEZONE } from '../../../utils/timezone';

const C = {
    orange:    '#f5a623',
    cream:     '#fef3d6',
    white:     '#ffffff',
    text:      '#1f2937',
    soft:      '#6b7280',
};

export type WorkstationZone =
    | 'RISKS'
    | 'PROHIBITIONS'
    | 'TRIGGERS'
    | 'SIC_CHART'
    | 'REACTION_PLANS'
    | 'QR_DOCUMENT'
    | 'QR_EXTERNAL'
    | 'IMAGE';

interface Props {
    workstation: Workstation;
    // Modo de render:
    //   - "tv":       full screen (position fixed, z-index alto). Para /tv/dashboard/*
    //   - "preview":  position absolute dentro del padre (drawer preview)
    //   - "embedded": flow normal (relative). Para /work/<role>/workstation
    mode?: 'tv' | 'preview' | 'embedded';
    /** En modo preview/embedded: resalta la zona correspondiente con un glow */
    highlight?: WorkstationZone | null;
    /** Vista individual: restringe la Carta SIC a esta persona. */
    personnelId?: number;
    /** YYYY-MM-DD; si se omite, el bloque resuelve hoy en HN. */
    operationalDate?: string;
}

const ROLE_TITLE: Record<string, string> = {
    PICKING: 'ESTACIÓN DE TRABAJO · PICKING',
    PICKER:  'ESTACIÓN DE TRABAJO · PICKER',
    COUNTER: 'ESTACIÓN DE TRABAJO · CONTADOR',
    YARD:    'ESTACIÓN DE TRABAJO · CHOFER DE PATIO',
};

function useClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
    return now;
}

/** Estilo aplicado al wrapper de una zona resaltada (sombra animada). */
const HIGHLIGHT_SX = {
    outline: '3px solid #38bdf8',
    outlineOffset: 3,
    borderRadius: 2,
    boxShadow: '0 0 24px rgba(56,189,248,0.7)',
    animation: 'wsHighlightPulse 1.6s ease-in-out infinite',
    '@keyframes wsHighlightPulse': {
        '0%, 100%': { boxShadow: '0 0 12px rgba(56,189,248,0.5)' },
        '50%':      { boxShadow: '0 0 28px rgba(56,189,248,0.9)' },
    },
} as const;

const isOn = (zone: WorkstationZone, highlight: WorkstationZone | null | undefined) =>
    highlight === zone ? HIGHLIGHT_SX : {};

export default function WorkstationFixedLayout({
    workstation, mode = 'tv', highlight, personnelId, operationalDate,
}: Props) {
    const clock = useClock();
    const hnClock = useMemo(
        () => clock.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit', timeZone: HN_TIMEZONE }),
        [clock],
    );

    // Bloques únicos por type (los principales) y listas para los múltiples.
    const byType = useMemo(() => {
        const out: Partial<Record<BlockType, WorkstationBlock>> = {};
        const lists: Partial<Record<BlockType, WorkstationBlock[]>> = {};
        for (const b of workstation.blocks) {
            if (!b.is_active) continue;
            if (b.type === 'QR_DOCUMENT' || b.type === 'QR_EXTERNAL' || b.type === 'IMAGE' || b.type === 'TEXT') {
                if (!lists[b.type]) lists[b.type] = [];
                lists[b.type]!.push(b);
            } else {
                out[b.type] = b;
            }
        }
        return { byType: out, lists };
    }, [workstation.blocks]);

    const risks = byType.byType.RISKS;
    const prohib = byType.byType.PROHIBITIONS;
    const triggers = byType.byType.TRIGGERS;
    const sic = byType.byType.SIC_CHART;
    const plans = byType.byType.REACTION_PLANS;
    const performers = byType.byType.PERFORMERS;
    const performersCfg: PerformersBlockConfig = (performers?.config || {}) as PerformersBlockConfig;
    const qrDocs = byType.lists.QR_DOCUMENT || [];
    const qrExts = byType.lists.QR_EXTERNAL || [];

    return (
        <Box sx={{
            position:
                mode === 'tv' ? 'fixed' :
                mode === 'preview' ? 'absolute' : 'relative',
            inset: mode === 'embedded' ? undefined : 0,
            width: mode === 'embedded' ? '100%' : undefined,
            height: mode === 'embedded' ? '100%' : undefined,
            bgcolor: C.orange, color: C.text,
            p: { xs: 1, md: 1.5 },
            display: 'flex', flexDirection: 'column',
            overflow: { xs: 'auto', md: 'hidden' },
            zIndex: mode === 'tv' ? 9999 : undefined,
            borderRadius: mode === 'embedded' ? 2 : undefined,
        }}>
            {/* Header — oculto en modo embedded para no duplicar con el wrapper */}
            {mode !== 'embedded' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.25, flexShrink: 0 }}>
                    <Typography sx={{
                        color: C.white, flex: 1, textAlign: 'center', fontWeight: 900,
                        fontSize: mode === 'tv'
                            ? { xs: '1.4rem', md: '2rem', lg: '2.5rem' }
                            : '1.25rem',
                        letterSpacing: '0.02em',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.15)',
                    }}>
                        {ROLE_TITLE[workstation.role] || 'ESTACIÓN DE TRABAJO'}
                    </Typography>
                    <Box sx={{ bgcolor: C.white, borderRadius: 1.5, px: 1.25, py: 0.5, textAlign: 'center' }}>
                        <Typography fontWeight={900} sx={{ color: C.text, fontSize: '0.85rem', lineHeight: 1 }}>DPO</Typography>
                        <Typography sx={{ color: C.soft, fontSize: '0.5rem', letterSpacing: 1 }}>ES EL CAMINO</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.5, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1.5 }}>
                        <ClockIcon sx={{ color: C.white, fontSize: '1rem' }} />
                        <Typography fontWeight={800} sx={{ color: C.white, fontFamily: 'monospace', fontSize: '0.95rem' }}>
                            {hnClock}
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Body — orden Ricardo: Rojo · Amarillo · (Rosado + Verde)
                En pantallas chicas se stackean verticalmente para legibilidad. */}
            <Box sx={{
                flex: 1, display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 1, md: 1.25 },
                minHeight: 0,
                overflow: { xs: 'auto', md: 'hidden' },
            }}>
                {/* ── Columna ROJO: Riesgos + Prohibiciones + Disparadores (compactos) ── */}
                <Box sx={{
                    flex: { xs: '0 0 auto', md: 0.9 },
                    display: 'flex', flexDirection: 'column', gap: 1,
                    minWidth: 0,
                    minHeight: { xs: 360, md: 0 },
                }}>
                    <Box sx={{ flex: 1, minHeight: 0, ...isOn('RISKS', highlight) }}>
                        {risks
                            ? <RisksBlock config={risks.config as RisksBlockConfig} />
                            : <EmptySlot label="Sin riesgos configurados" />}
                    </Box>
                    <Box sx={{ flex: 1, minHeight: 0, ...isOn('PROHIBITIONS', highlight) }}>
                        {prohib
                            ? <ProhibitionsBlock config={prohib.config as ProhibitionsBlockConfig} />
                            : <EmptySlot label="Sin prohibiciones configuradas" />}
                    </Box>
                    <Box sx={{ flex: 1, minHeight: 0, ...isOn('TRIGGERS', highlight) }}>
                        {triggers
                            ? <TriggersBlock config={triggers.config as TriggersBlockConfig} />
                            : <EmptySlot label="Sin disparadores" />}
                    </Box>
                </Box>

                {/* ── Columna AMARILLO: Carta SIC + Resultados (protagonista) ── */}
                <Box sx={{
                    flex: { xs: '0 0 auto', md: 2 },
                    minWidth: 0,
                    minHeight: { xs: 320, md: 0 },
                    ...isOn('SIC_CHART', highlight),
                }}>
                    {sic
                        ? <SicChartBlock
                            config={sic.config as SicChartBlockConfig}
                            distributorCenterId={workstation.distributor_center}
                            personnelId={personnelId}
                            operationalDate={operationalDate}
                        />
                        : <EmptySlot label="Carta SIC sin configurar" tall />}
                </Box>

                {/* ── Columna derecha: Top/Bottom (rosado) + Planes/QRs (verde) ── */}
                <Box sx={{
                    flex: { xs: '0 0 auto', md: 1.4 },
                    display: 'flex', flexDirection: 'column', gap: 1,
                    minWidth: 0,
                    minHeight: { xs: 380, md: 0 },
                }}>
                    {/* Rosado: Top y Bottom performers — configurable por workstation. */}
                    <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, minHeight: 0 }}>
                        {performers && performersCfg.metric_code ? (
                            <>
                                <PerformersBlock
                                    workstationId={workstation.id}
                                    config={performersCfg}
                                    variant="top"
                                />
                                <PerformersBlock
                                    workstationId={workstation.id}
                                    config={performersCfg}
                                    variant="bottom"
                                />
                            </>
                        ) : (
                            <>
                                <PinkPlaceholder title="Top performers" />
                                <PinkPlaceholder title="Bottom performers" />
                            </>
                        )}
                    </Box>

                    {/* Verde: Planes de Reacción + QRs */}
                    <Box sx={{ flex: 1.6, minHeight: 0 }}>
                        <Box sx={{
                            height: '100%', display: 'flex', flexDirection: 'column', gap: 1,
                            p: 1, bgcolor: 'rgba(34,197,94,0.10)', border: '2px solid #22c55e', borderRadius: 2,
                        }}>
                            {plans ? (
                                <Box sx={{ flex: 1, minHeight: 0, ...isOn('REACTION_PLANS', highlight) }}>
                                    <ReactionPlansBlock config={plans.config as ReactionPlansBlockConfig} />
                                </Box>
                            ) : (qrDocs.length === 0 && qrExts.length === 0) && (
                                <EmptySlot label="Sin planes de reacción ni QRs" />
                            )}
                            {(qrDocs.length > 0 || qrExts.length > 0) && (
                                <Box sx={{
                                    // Altura fija para los QRs: no se inflan cuando no hay planes.
                                    flex: '0 0 auto',
                                    height: { xs: 140, md: 180, lg: 220 },
                                    minHeight: 0,
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${Math.min(Math.max(qrDocs.length + qrExts.length, 1), 4)}, 1fr)`,
                                    gap: 1,
                                    ...isOn('QR_DOCUMENT', highlight),
                                    ...isOn('QR_EXTERNAL', highlight),
                                }}>
                                    {qrDocs.map(b => (
                                        <QrDocumentBlock key={b.id} config={b.config as any} ws={workstation} />
                                    ))}
                                    {qrExts.map(b => (
                                        <QrExternalBlock key={b.id} config={b.config as any} />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

function EmptySlot({ label, tall }: { label: string; tall?: boolean }) {
    return (
        <Box sx={{
            width: '100%', height: '100%',
            border: '2px dashed rgba(255,255,255,0.5)',
            borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: tall ? 200 : 80,
            color: 'rgba(255,255,255,0.85)',
        }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', px: 2 }}>
                {label}
            </Typography>
        </Box>
    );
}

function PinkPlaceholder({ title }: { title: string }) {
    return (
        <Box sx={{
            bgcolor: 'rgba(236,72,153,0.10)', border: '2px solid #ec4899', borderRadius: 2,
            p: 1, display: 'flex', flexDirection: 'column',
        }}>
            <Typography sx={{
                fontSize: '0.78rem', fontWeight: 800, color: '#fff',
                textAlign: 'center', bgcolor: '#db2777', borderRadius: 0.75, py: 0.5, mb: 1,
            }}>
                {title}
            </Typography>
            <Box sx={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#831843', fontStyle: 'italic',
            }}>
                <Typography sx={{ fontSize: '0.7rem' }}>Sin datos por ahora</Typography>
            </Box>
        </Box>
    );
}
