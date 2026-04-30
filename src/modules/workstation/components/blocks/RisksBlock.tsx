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
                    gap: 1, height: '100%', alignContent: 'center',
                }}>
                    {items.map(r => {
                        const Icon = ICON_MAP[r.icon_name] || HazardIcon;
                        return (
                            <Box key={r.id} sx={{ textAlign: 'center', p: 0.5 }}>
                                <Box sx={{
                                    position: 'relative', mx: 'auto',
                                    width: { xs: 44, md: 60, lg: 72 }, height: { xs: 44, md: 60, lg: 72 },
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <HazardIcon sx={{
                                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                                        color: '#fbbf24', stroke: '#1f2937', strokeWidth: 0.5,
                                    }} />
                                    <Icon sx={{
                                        color: '#1f2937', mt: 0.4, zIndex: 1,
                                        fontSize: { xs: '1.1rem', md: '1.5rem', lg: '1.8rem' },
                                    }} />
                                </Box>
                                <Typography sx={{
                                    fontSize: { xs: '0.65rem', md: '0.78rem', lg: '0.88rem' },
                                    color: '#1f2937', fontWeight: 600, mt: 0.5, lineHeight: 1.1,
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
