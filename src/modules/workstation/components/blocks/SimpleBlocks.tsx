/**
 * Bloques simples: IMAGE, TEXT, TITLE, CLOCK, DPO.
 */
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Schedule as ClockIcon } from '@mui/icons-material';
import BlockShell from './BlockShell';
import type {
    ClockBlockConfig,
    ImageBlockConfig,
    TextBlockConfig,
    TitleBlockConfig,
    Workstation,
} from '../../interfaces/workstation';
import { HN_TIMEZONE } from '../../../../utils/timezone';

const API_URL = import.meta.env.VITE_JS_APP_API_URL;

export function ImageBlock({
    config, ws,
}: {
    config: ImageBlockConfig;
    ws?: Workstation;
}) {
    const img = ws?.images.find(i => i.id === config.image_id);
    if (!img) {
        return (
            <BlockShell title={config.title || 'Imagen'}>
                <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic', textAlign: 'center', mt: 1 }}>
                    Elegí una imagen en el editor.
                </Typography>
            </BlockShell>
        );
    }

    // Asume que `file` ya viene como URL absoluta (Azure) o relativa al backend.
    const src = img.file.startsWith('http') ? img.file : `${API_URL}${img.file}`;
    const fit = config.fit || 'contain';

    return (
        <BlockShell title={config.title} bare={!config.title}>
            <Box sx={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: '#fff', overflow: 'hidden',
            }}>
                <img
                    src={src}
                    alt={img.alt || img.name}
                    style={{ width: '100%', height: '100%', objectFit: fit }}
                />
            </Box>
        </BlockShell>
    );
}

export function TextBlock({ config }: { config: TextBlockConfig }) {
    const sizeMap = { small: '0.85rem', medium: '1rem', large: '1.4rem' } as const;
    const fontSize = sizeMap[config.size || 'medium'];

    return (
        <BlockShell bare>
            <Box sx={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent:
                    config.align === 'right' ? 'flex-end' :
                    config.align === 'left' ? 'flex-start' : 'center',
                p: 1.5,
                bgcolor: '#ffffff', borderRadius: 2,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
                <Typography sx={{
                    fontSize, color: config.color || '#1f2937',
                    textAlign: config.align || 'center',
                    whiteSpace: 'pre-wrap',
                }}>
                    {config.content || ''}
                </Typography>
            </Box>
        </BlockShell>
    );
}

export function TitleBlock({ config }: { config: TitleBlockConfig }) {
    return (
        <BlockShell bare>
            <Box sx={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'transparent',
            }}>
                <Typography fontWeight={900} sx={{
                    color: '#fff',
                    fontSize: { xs: '1.4rem', md: '2rem', lg: '2.5rem' },
                    letterSpacing: '0.02em', textShadow: '2px 2px 4px rgba(0,0,0,0.15)',
                    textAlign: 'center',
                }}>
                    {config.content || ''}
                </Typography>
            </Box>
        </BlockShell>
    );
}

export function ClockBlock({ config }: { config: ClockBlockConfig }) {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const time = now.toLocaleTimeString('es-HN', {
        hour: '2-digit', minute: '2-digit', timeZone: HN_TIMEZONE,
    });
    const date = now.toLocaleDateString('es-HN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: HN_TIMEZONE,
    });

    return (
        <BlockShell bare>
            <Box sx={{
                width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1.5, p: 1, gap: 0.25,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ClockIcon sx={{ color: '#fff', fontSize: '1.5rem' }} />
                    <Typography fontWeight={800} sx={{ color: '#fff', fontFamily: 'monospace', fontSize: { xs: '1.5rem', md: '2.5rem' } }}>
                        {time}
                    </Typography>
                </Box>
                {config.show_date !== false && (
                    <Typography sx={{ color: '#fff', fontSize: '0.65rem', textTransform: 'capitalize', textAlign: 'center' }}>
                        {date}
                    </Typography>
                )}
            </Box>
        </BlockShell>
    );
}

export function DpoBlock() {
    return (
        <BlockShell bare>
            <Box sx={{
                width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                bgcolor: '#fff', borderRadius: 1.5, p: 1,
            }}>
                <Typography fontWeight={900} sx={{ color: '#1f2937', fontSize: { xs: '1.5rem', md: '2.2rem' }, lineHeight: 1 }}>
                    DPO
                </Typography>
                <Typography sx={{ color: '#6b7280', fontSize: '0.55rem', letterSpacing: 1 }}>
                    ES EL CAMINO
                </Typography>
            </Box>
        </BlockShell>
    );
}
