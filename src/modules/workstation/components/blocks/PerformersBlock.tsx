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

const C = {
    pink:      '#db2777',
    pinkSoft:  'rgba(236,72,153,0.10)',
    pinkBg:    '#ec4899',
    text:      '#1f2937',
    soft:      '#831843',
    white:     '#ffffff',
};

interface Props {
    workstationId: number;
    config: PerformersBlockConfig;
    variant: 'top' | 'bottom';
}

export default function PerformersBlock({ workstationId, config, variant }: Props) {
    const metricCode = config.metric_code || '';
    const { data, isLoading } = useGetPerformersQuery(
        {
            workstationId,
            metric_code: metricCode,
            top_count: config.top_count ?? 3,
            bottom_count: config.bottom_count ?? 3,
            period: config.period ?? 'today',
        },
        { skip: !metricCode, pollingInterval: 60_000 },
    );

    const title = config.title ?? (variant === 'top' ? 'Top performers' : 'Bottom performers');
    const rows = variant === 'top' ? data?.top : data?.bottom;
    const Icon = variant === 'top' ? TrophyIcon : DownIcon;
    const unit = data?.metric?.unit || '';

    return (
        <Box sx={{
            bgcolor: C.pinkSoft, border: `2px solid ${C.pinkBg}`, borderRadius: 2,
            p: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0,
        }}>
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
                bgcolor: C.pink, color: C.white, borderRadius: 0.75, py: 0.5, mb: 1,
            }}>
                <Icon sx={{ fontSize: '0.9rem' }} />
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 800 }}>
                    {title}
                </Typography>
            </Box>

            {!metricCode ? (
                <CenterText soft>Configurá el KPI para ranquear desde el editor</CenterText>
            ) : isLoading ? (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress size={18} sx={{ color: C.pink }} />
                </Box>
            ) : !rows || rows.length === 0 ? (
                <CenterText soft>Sin datos por ahora</CenterText>
            ) : (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, minHeight: 0, overflow: 'auto' }}>
                    {rows.map((p, idx) => (
                        <Box
                            key={p.personnel_id}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 0.75,
                                bgcolor: C.white, borderRadius: 0.75,
                                px: 0.75, py: 0.5,
                                border: `1px solid rgba(236,72,153,0.25)`,
                                minWidth: 0,
                            }}
                        >
                            <Box sx={{
                                width: 20, height: 20, borderRadius: '50%',
                                bgcolor: C.pink, color: C.white,
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
                                    fontSize: '0.7rem', fontWeight: 800, color: C.pink,
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

function CenterText({ children, soft }: { children: React.ReactNode; soft?: boolean }) {
    return (
        <Box sx={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: soft ? C.soft : C.text, fontStyle: 'italic',
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
