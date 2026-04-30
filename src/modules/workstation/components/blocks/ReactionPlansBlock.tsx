/**
 * Bloque REACTION_PLANS — caja amarilla + QR opcional + caja roja.
 * Mismo lenguaje visual del screenshot.
 */
import { Box, Typography } from '@mui/material';
import QRCode from 'qrcode.react';
import BlockShell from './BlockShell';
import type { ReactionPlansBlockConfig } from '../../interfaces/workstation';

const C = {
    yellow:    '#facc15',  // amarillo zona
    yellowDk:  '#a16207',
    red:       '#dc2626',  // rojo zona
    blue:      '#1e40af',  // header KPI
    white:     '#ffffff',
    text:      '#1f2937',
    soft:      '#6b7280',
};

export default function ReactionPlansBlock({ config }: { config: ReactionPlansBlockConfig }) {
    return (
        <BlockShell title={config.title || 'Planes de Reacción'}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0.75 }}>
                {/* Header KPI */}
                {config.kpi_label && (
                    <Box sx={{ bgcolor: C.blue, px: 1.5, py: 0.6, borderRadius: 0.75 }}>
                        <Typography fontWeight={800} sx={{
                            color: C.white, fontSize: { xs: '0.75rem', md: '0.9rem' }, letterSpacing: '0.02em',
                        }}>
                            KPI: {config.kpi_label.toUpperCase()}
                        </Typography>
                    </Box>
                )}

                {/* Zona amarilla */}
                <Box>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: C.text, mb: 0.4 }}>
                        1. ZONA AMARILLA (alerta)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'stretch' }}>
                        <Box sx={{
                            flex: 1, bgcolor: C.yellow, color: C.text,
                            p: 1.25, borderRadius: 1,
                            display: 'flex', flexDirection: 'column', justifyContent: 'center',
                            minHeight: 60,
                        }}>
                            <Typography sx={{ fontSize: { xs: '0.85rem', md: '1rem' }, fontWeight: 800 }}>
                                {config.yellow?.title || 'Ejecutar 5 Porqué'}
                            </Typography>
                            {config.yellow?.description && (
                                <Typography sx={{ fontSize: '0.7rem', color: C.text, mt: 0.4 }}>
                                    {config.yellow.description}
                                </Typography>
                            )}
                        </Box>
                        {config.yellow?.qr_url && (
                            <Box sx={{
                                bgcolor: C.white, border: `2px solid ${C.yellowDk}`, borderRadius: 1,
                                p: 0.75, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: 0.4, minWidth: 100,
                            }}>
                                <QRCode value={config.yellow.qr_url} size={80} level="M" includeMargin={false} />
                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: C.text, lineHeight: 1 }}>
                                    {config.yellow.qr_label || '5 PORQUÉ'}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Zona roja */}
                <Box>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: C.text, mb: 0.4 }}>
                        2. ZONA ROJA (crítica)
                    </Typography>
                    <Box sx={{
                        bgcolor: C.red, color: C.white, p: 1.25, borderRadius: 1,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center',
                        textAlign: 'center', minHeight: 60,
                    }}>
                        <Typography sx={{ fontSize: { xs: '0.9rem', md: '1.1rem' }, fontWeight: 800 }}>
                            {config.red?.title || 'RELATO DE ANOMALÍA'}
                        </Typography>
                        {config.red?.description && (
                            <Typography sx={{ fontSize: '0.7rem', color: C.white, mt: 0.4 }}>
                                {config.red.description}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>
        </BlockShell>
    );
}
