/**
 * Bloque TRIGGERS — tabla de KPIs con Indicador / Meta / Disparador.
 * Estilo del screenshot: header naranja, filas crema, monoespaciado para
 * números (con unidad chica debajo en lugar de inline).
 */
import { Box, Typography, Tooltip } from '@mui/material';
import {
    ArrowUpward as UpIcon, ArrowDownward as DownIcon,
} from '@mui/icons-material';
import BlockShell from './BlockShell';
import type { TriggersBlockConfig } from '../../interfaces/workstation';

const C = {
    orange: '#f5a623',
    white:  '#ffffff',
    text:   '#1f2937',
    soft:   '#6b7280',
    green:  '#16a34a',
    red:    '#dc2626',
    border: 'rgba(245,166,35,0.4)',
};

/** Quita ".00" o ceros sobrantes (9.00 → 9, 9.50 → 9.5). */
function fmtNumber(s: string | number): string {
    const n = typeof s === 'number' ? s : Number(s);
    if (!isFinite(n)) return String(s);
    if (Number.isInteger(n)) return String(n);
    return n.toString().replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
}

export default function TriggersBlock({ config }: { config: TriggersBlockConfig }) {
    const items = config.items || [];

    return (
        <BlockShell title={config.title || 'Disparador resolución de problemas'}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0.4 }}>
                <Typography sx={{
                    fontSize: '0.65rem', color: C.soft, fontStyle: 'italic',
                    lineHeight: 1.15, mb: 0.25,
                }}>
                    Valores vigentes del CD según configuración de Metas KPI.
                </Typography>

                {/* Header */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr 1fr', gap: 0.3 }}>
                    <HeaderCell align="left">Indicador</HeaderCell>
                    <HeaderCell>Meta</HeaderCell>
                    <HeaderCell>Disparador</HeaderCell>
                </Box>

                {/* Rows */}
                <Box sx={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    gap: 0.3, minHeight: 0, overflow: 'auto',
                }}>
                    {items.length === 0 && (
                        <Typography sx={{
                            fontSize: '0.72rem', color: C.soft, textAlign: 'center',
                            mt: 1, fontStyle: 'italic',
                        }}>
                            Sin disparadores. Configurá los KPIs en el editor.
                        </Typography>
                    )}
                    {items.map((t, i) => (
                        <Box key={i} sx={{
                            display: 'grid', gridTemplateColumns: '1.7fr 1fr 1fr', gap: 0.3,
                        }}>
                            <IndicatorCell name={t.indicator} direction={t.direction} />
                            <ValueCell value={t.meta} unit={t.unit} />
                            <ValueCell value={t.disparador} unit={t.unit} />
                        </Box>
                    ))}
                </Box>
            </Box>
        </BlockShell>
    );
}

function HeaderCell({
    children, align = 'center',
}: { children: React.ReactNode; align?: 'left' | 'center' }) {
    return (
        <Box sx={{
            bgcolor: C.orange, color: C.white,
            px: 1, py: 0.5, borderRadius: 0.5,
            display: 'flex', alignItems: 'center',
            justifyContent: align === 'left' ? 'flex-start' : 'center',
        }}>
            <Typography sx={{
                fontSize: { xs: '0.7rem', md: '0.85rem' },
                fontWeight: 800, letterSpacing: 0.3,
            }}>
                {children}
            </Typography>
        </Box>
    );
}

function IndicatorCell({
    name, direction,
}: { name: string; direction?: 'HIGHER_IS_BETTER' | 'LOWER_IS_BETTER' }) {
    const Icon = direction === 'LOWER_IS_BETTER' ? DownIcon
              : direction === 'HIGHER_IS_BETTER' ? UpIcon
              : null;
    const iconColor = direction === 'LOWER_IS_BETTER' ? C.red : C.green;
    const dirLabel = direction === 'LOWER_IS_BETTER' ? 'Menor es mejor'
                  : direction === 'HIGHER_IS_BETTER' ? 'Mayor es mejor'
                  : '';
    return (
        <Box sx={{
            bgcolor: C.white, border: `1px solid ${C.border}`,
            px: 0.85, py: 0.45, borderRadius: 0.5,
            display: 'flex', alignItems: 'center', gap: 0.5,
            minWidth: 0,
        }}>
            {Icon && (
                <Tooltip title={dirLabel}>
                    <Icon sx={{ fontSize: '0.85rem', color: iconColor, flexShrink: 0 }} />
                </Tooltip>
            )}
            <Typography
                title={name}
                sx={{
                    fontSize: { xs: '0.72rem', md: '0.82rem' },
                    fontWeight: 700, color: C.text, lineHeight: 1.15,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flex: 1, minWidth: 0,
                }}
            >
                {name}
            </Typography>
        </Box>
    );
}

function ValueCell({ value, unit }: { value: string | number; unit?: string }) {
    return (
        <Box sx={{
            bgcolor: C.white, border: `1px solid ${C.border}`,
            px: 0.5, py: 0.35, borderRadius: 0.5,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minWidth: 0,
        }}>
            <Typography sx={{
                fontSize: { xs: '0.95rem', md: '1.1rem', lg: '1.25rem' },
                fontWeight: 800, color: C.text,
                fontFamily: 'monospace', lineHeight: 1.1,
            }}>
                {fmtNumber(value)}
            </Typography>
            {unit && (
                <Typography sx={{
                    fontSize: '0.55rem', color: C.soft, lineHeight: 1,
                    mt: 0.15, letterSpacing: 0.2,
                }} noWrap>
                    {unit}
                </Typography>
            )}
        </Box>
    );
}
