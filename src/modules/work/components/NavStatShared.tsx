import { Box, Typography, Tooltip, alpha } from '@mui/material';

export const STAT_HEIGHT = 20;
export const STAT_HEIGHT_MD = 34;

export function NavStat({
    icon, label, shortLabel, value, accent,
}: {
    icon: React.ReactNode;
    label: string;
    shortLabel: string;
    value: string | number;
    accent: string;
}) {
    return (
        <Tooltip title={label} arrow>
            <Box
                sx={{
                    display: 'flex', alignItems: 'center',
                    gap: { xs: 0.5, md: 1 },
                    px: { xs: 0.75, md: 1.25 },
                    height: { xs: STAT_HEIGHT, md: STAT_HEIGHT_MD },
                    borderRadius: { xs: 1, md: 1.5 },
                    bgcolor: alpha(accent, 0.08),
                    border: `1px solid ${alpha(accent, 0.25)}`,
                    minWidth: 0, overflow: 'hidden',
                }}
            >
                <Box sx={{ color: accent, display: 'flex', lineHeight: 1 }}>{icon}</Box>
                <Typography component="span" sx={{
                    fontSize: { xs: '0.6rem', md: '0.7rem' },
                    letterSpacing: 0.5, textTransform: 'uppercase',
                    color: 'text.secondary', fontWeight: 700, flexShrink: 0, lineHeight: 1,
                }}>
                    {shortLabel}
                </Typography>
                <Typography component="span" sx={{
                    fontWeight: 800,
                    fontSize: { xs: '0.85rem', md: '1.05rem' },
                    color: 'text.primary', fontFeatureSettings: '"tnum"', ml: 'auto', lineHeight: 1,
                }}>
                    {value}
                </Typography>
            </Box>
        </Tooltip>
    );
}

export const navStatsGridSx = (hasTrailing: boolean) => ({
    display: 'grid',
    gridTemplateColumns: {
        xs: hasTrailing
            ? 'minmax(85px, 0.85fr) minmax(135px, 1.35fr) auto'
            : 'minmax(85px, 0.85fr) minmax(135px, 1.35fr)',
        md: hasTrailing
            ? 'repeat(4, minmax(110px, max-content)) auto'
            : 'repeat(4, minmax(110px, max-content))',
    },
    gridTemplateRows: {
        xs: `${STAT_HEIGHT}px ${STAT_HEIGHT}px`,
        md: `${STAT_HEIGHT_MD}px`,
    },
    columnGap: { xs: 0.5, sm: 1, md: 1.25 },
    rowGap: '3px',
    height: { xs: STAT_HEIGHT * 2 + 3, md: STAT_HEIGHT_MD },
    alignItems: 'stretch',
});

// Helpers para colocar las 4 celdas de stats con layout 2x2 en xs, 4x1 en md.
export const statSx = {
    cell1: { minWidth: 0, gridColumn: { xs: 1, md: 1 }, gridRow: { xs: 1, md: 1 } },
    cell2: { minWidth: 0, gridColumn: { xs: 1, md: 2 }, gridRow: { xs: 2, md: 1 } },
    cell3: { minWidth: 0, gridColumn: { xs: 2, md: 3 }, gridRow: { xs: 1, md: 1 } },
    cell4: { minWidth: 0, gridColumn: { xs: 2, md: 4 }, gridRow: { xs: 2, md: 1 } },
    // Trailing chip: en xs ocupa la columna 3 spanneando ambas filas; en md, columna 5 de una sola fila.
    trailing: { gridColumn: { xs: '3', md: '5' }, gridRow: { xs: '1 / span 2', md: '1' } },
};
