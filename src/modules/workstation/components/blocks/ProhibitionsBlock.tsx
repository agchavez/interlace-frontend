/**
 * Bloque PROHIBITIONS — círculos rojos con tachado diagonal.
 * config: { title, catalog_ids }
 */
import { Box, Typography } from '@mui/material';
import {
    Block as BlockIcon,
    DirectionsRun, ContentCut, PersonOff, LocalBar, WaterDrop, LocalShipping,
    Fastfood, PhoneIphone, SmokingRooms, Diamond,
} from '@mui/icons-material';
import BlockShell from './BlockShell';
import { useGetProhibitionCatalogQuery } from '../../services/workstationApi';
import type { ProhibitionsBlockConfig } from '../../interfaces/workstation';

const ICON_MAP: Record<string, React.ElementType> = {
    DirectionsRun, ContentCut, PersonOff, LocalBar, WaterDrop, LocalShipping,
    Fastfood, PhoneIphone, SmokingRooms, Diamond,
};

export default function ProhibitionsBlock({ config }: { config: ProhibitionsBlockConfig }) {
    const { data: catalog = [] } = useGetProhibitionCatalogQuery();
    const ids = new Set(config.catalog_ids || []);
    const items = catalog.filter(p => ids.has(p.id));

    return (
        <BlockShell title={config.title || 'Prohibiciones del área'}>
            {items.length === 0 ? (
                <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic', textAlign: 'center', mt: 1 }}>
                    Seleccioná las prohibiciones del catálogo en el editor.
                </Typography>
            ) : (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: items.length <= 2 ? `repeat(${items.length}, 1fr)` : 'repeat(2, 1fr)',
                    gap: 1, height: '100%', alignContent: 'center',
                }}>
                    {items.map(p => {
                        const Icon = ICON_MAP[p.icon_name] || BlockIcon;
                        return (
                            <Box key={p.id} sx={{ textAlign: 'center', p: 0.5 }}>
                                <Box sx={{
                                    position: 'relative', mx: 'auto',
                                    width: { xs: 44, md: 60, lg: 72 }, height: { xs: 44, md: 60, lg: 72 },
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '50%', border: `4px solid #dc2626`,
                                    '&::after': {
                                        content: '""', position: 'absolute', inset: 0, margin: 'auto',
                                        width: '130%', height: '4px', background: '#dc2626',
                                        transform: 'rotate(45deg)',
                                    },
                                }}>
                                    <Icon sx={{ color: '#1f2937', fontSize: { xs: '1.2rem', md: '1.55rem', lg: '1.85rem' } }} />
                                </Box>
                                <Typography sx={{
                                    fontSize: { xs: '0.65rem', md: '0.78rem', lg: '0.88rem' },
                                    color: '#1f2937', fontWeight: 600, mt: 0.5, lineHeight: 1.1,
                                }}>
                                    {p.name}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            )}
        </BlockShell>
    );
}
