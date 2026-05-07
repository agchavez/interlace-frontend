/**
 * Bloque RISKS — íconos triangulares amarillos con label.
 * config: { title, catalog_ids }
 */
import { Box, Typography } from '@mui/material';
import {
    Warning as HazardIcon,
    DirectionsRun, ContentCut, PersonOff, LocalBar, WaterDrop, LocalShipping,
    Fastfood, PhoneIphone, SmokingRooms, Diamond,
} from '@mui/icons-material';
import BlockShell from './BlockShell';
import { useGetRiskCatalogQuery } from '../../services/workstationApi';
import type { RisksBlockConfig } from '../../interfaces/workstation';

const ICON_MAP: Record<string, React.ElementType> = {
    DirectionsRun, ContentCut, PersonOff, LocalBar, WaterDrop, LocalShipping,
    Fastfood, PhoneIphone, SmokingRooms, Diamond,
};

export default function RisksBlock({ config }: { config: RisksBlockConfig }) {
    const { data: catalog = [] } = useGetRiskCatalogQuery();
    const ids = new Set(config.catalog_ids || []);
    const items = catalog.filter(r => ids.has(r.id));

    return (
        <BlockShell title={config.title || 'Riesgos del área'}>
            {items.length === 0 ? (
                <EmptyHint text="Seleccioná los riesgos del catálogo en el editor." />
            ) : (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: items.length <= 3
                        ? `repeat(${items.length}, 1fr)`
                        : 'repeat(3, 1fr)',
                    gap: 0.75,
                    height: '100%', minHeight: 0,
                    placeItems: 'center',
                    overflow: 'hidden',
                }}>
                    {items.map(r => {
                        const Icon = ICON_MAP[r.icon_name] || HazardIcon;
                        return (
                            <Box key={r.id} sx={{
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                width: '100%', height: '100%',
                                minHeight: 0, p: 0.25, gap: 0.25,
                                overflow: 'hidden',
                            }}>
                                <Box sx={{
                                    position: 'relative',
                                    width: '100%',
                                    maxWidth: { xs: 40, md: 52, lg: 64 },
                                    aspectRatio: '1',
                                    minHeight: 0, flexShrink: 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <HazardIcon sx={{
                                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                                        color: '#fbbf24', stroke: '#1f2937', strokeWidth: 0.5,
                                    }} />
                                    <Icon sx={{
                                        color: '#1f2937', zIndex: 1,
                                        width: '45%', height: '45%',
                                        mt: '8%',
                                    }} />
                                </Box>
                                <Typography sx={{
                                    fontSize: { xs: '0.6rem', md: '0.72rem', lg: '0.8rem' },
                                    color: '#1f2937', fontWeight: 600, lineHeight: 1.1,
                                    textAlign: 'center',
                                }}>
                                    {r.name}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            )}
        </BlockShell>
    );
}

function EmptyHint({ text }: { text: string }) {
    return (
        <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic', textAlign: 'center', mt: 1 }}>
            {text}
        </Typography>
    );
}
