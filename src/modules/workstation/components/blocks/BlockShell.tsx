/**
 * Marco común de un bloque (header naranja con título + cuerpo crema).
 * Permite header opcional vía prop `title`.
 */
import { Box, Typography } from '@mui/material';

const C = {
    orange: '#f5a623',
    cream:  '#fef3d6',
    white:  '#ffffff',
    text:   '#1f2937',
};

interface Props {
    title?: string;
    children: React.ReactNode;
    bodyBg?: string;
    headerColor?: string;
    /** Sin header — para bloques tipo TEXT o IMAGE que no quieren chrome */
    bare?: boolean;
}

export default function BlockShell({ title, children, bodyBg, headerColor, bare }: Props) {
    if (bare) {
        return (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {children}
            </Box>
        );
    }
    return (
        <Box sx={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            bgcolor: C.white,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
            {title && (
                <Box sx={{ bgcolor: headerColor || C.orange, px: 2, py: 0.75, flexShrink: 0 }}>
                    <Typography fontWeight={700} sx={{
                        color: C.white, textAlign: 'center', letterSpacing: '0.01em',
                        fontSize: { xs: '0.85rem', md: '1rem', lg: '1.15rem' },
                    }}>
                        {title}
                    </Typography>
                </Box>
            )}
            <Box sx={{
                flex: 1, p: 1.25, minHeight: 0, overflow: 'hidden',
                bgcolor: bodyBg || C.cream,
            }}>
                {children}
            </Box>
        </Box>
    );
}
