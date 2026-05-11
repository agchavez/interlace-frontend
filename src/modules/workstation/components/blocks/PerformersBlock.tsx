/**
 * Bloque PERFORMERS — top y bottom del CD ranqueados por un KPI configurable.
 * Reemplaza al PinkPlaceholder hardcodeado del layout fijo.
 */
import { Avatar, Box, CircularProgress, Typography } from '@mui/material';
import {
    EmojiEvents as TrophyIcon,
    TrendingDown as DownIcon,
} from '@mui/icons-material';
import type { PerformersBlockConfig } from '../../interfaces/workstation';
import { useGetPerformersQuery } from '../../services/workstationApi';

// Paleta por variant. Top usa verde (positivo), bottom usa rojo (negativo).
// Reemplaza la paleta fija magenta original. Si querés volver a magenta para
// un caso puntual, basta con sobreescribir el color en el config del bloque.
const PALETTES = {
    top: {
        accent:    '#16a34a',
        accentSoft:'rgba(22,163,74,0.10)',
        accentBg:  '#22c55e',
        text:      '#1f2937',
        soft:      '#14532d',
        white:     '#ffffff',
    },
    bottom: {
        accent:    '#dc2626',
        accentSoft:'rgba(220,38,38,0.10)',
        accentBg:  '#ef4444',
        text:      '#1f2937',
        soft:      '#7f1d1d',
        white:     '#ffffff',
    },
} as const;

interface Props {
    workstationId: number;
    config: PerformersBlockConfig;
    variant: 'top' | 'bottom';
    operationalDate?: string;
}

export default function PerformersBlock({ workstationId, config, variant, operationalDate }: Props) {
    const metricCode = config.metric_code || '';
    const { data, isLoading } = useGetPerformersQuery(
        {
            workstationId,
            metric_code: metricCode,
            top_count: config.top_count ?? 3,
            bottom_count: config.bottom_count ?? 3,
            period: config.period ?? 'today',
            ...(operationalDate ? { operational_date: operationalDate } : {}),
        },
        { skip: !metricCode, pollingInterval: 60_000 },
    );

    const C = PALETTES[variant];
    const title = config.title ?? (variant === 'top' ? 'Top Pickers' : 'Bottom Pickers');
    const rows = variant === 'top' ? data?.top : data?.bottom;
    const Icon = variant === 'top' ? TrophyIcon : DownIcon;
    const unit = data?.metric?.unit || '';

    return (
        <Box sx={{
            bgcolor: C.accentSoft, border: `2px solid ${C.accentBg}`, borderRadius: 2,
            p: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0,
        }}>
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
                bgcolor: C.accent, color: C.white, borderRadius: 0.75, py: 0.5, mb: 1,
            }}>
                <Icon sx={{ fontSize: '0.9rem' }} />
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 800 }}>
                    {title}
                </Typography>
            </Box>

            {!metricCode ? (
                <CenterText soft palette={C}>Configurá el KPI para ranquear desde el editor</CenterText>
            ) : isLoading ? (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress size={18} sx={{ color: C.accent }} />
                </Box>
            ) : !rows || rows.length === 0 ? (
                <CenterText soft palette={C}>Sin datos por ahora</CenterText>
            ) : (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, minHeight: 0, overflow: 'auto' }}>
                    {rows.map((p, idx) => (
                        <Box
                            key={p.personnel_id}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 0.75,
                                bgcolor: C.white, borderRadius: 0.75,
                                px: 0.75, py: 0.5,
                                border: `1px solid ${C.accentBg}40`,
                                minWidth: 0,
                            }}
                        >
                            <Box sx={{
                                width: 20, height: 20, borderRadius: '50%',
                                bgcolor: C.accent, color: C.white,
                                fontSize: '0.7rem', fontWeight: 800,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                {idx + 1}
                            </Box>
                            <Avatar
                                src={p.photo_url || undefined}
                                sx={{ width: 24, height: 24, fontSize: '0.65rem', flexShrink: 0 }}
                            >
                                {(p.name || '?').charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                                <Typography
                                    title={p.name}
                                    sx={{
                                        fontSize: '0.72rem', fontWeight: 700, color: C.text,
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}
                                >
                                    {p.name}
                                </Typography>
                                <Typography sx={{
                                    fontSize: '0.7rem', fontWeight: 800, color: C.accent,
                                    fontFamily: 'monospace',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                    {fmtValue(p.value)}{unit ? ` ${unit}` : ''}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}

function CenterText({ children, soft, palette }: {
    children: React.ReactNode; soft?: boolean;
    palette: typeof PALETTES[keyof typeof PALETTES];
}) {
    return (
        <Box sx={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: soft ? palette.soft : palette.text, fontStyle: 'italic',
        }}>
            <Typography sx={{ fontSize: '0.7rem', textAlign: 'center', px: 1 }}>
                {children}
            </Typography>
        </Box>
    );
}

function fmtValue(v: number): string {
    if (!isFinite(v)) return String(v);
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(1).replace(/\.0$/, '');
}
