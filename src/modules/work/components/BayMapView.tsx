import { useMemo } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { useAppSelector } from '../../../store/store';
import { useGetBaysQuery } from '../../truck-cycle/services/truckCycleApi';
import BayGridPicker, { type BayOccupancy, type DockPosition } from '../../truck-cycle/components/BayGridPicker';
import type { PautaListItem } from '../../truck-cycle/interfaces/truckCycle';

interface Props {
    /** Pautas que queremos mostrar en el mapa. Las que tengan bay_id se ubican en su bahía; las que no, van a una sección abajo. */
    pautas: PautaListItem[];
    onPautaClick: (pauta: PautaListItem) => void;
    /** Diccionario status code → label corto para el chip (ej. COUNTING → "En conteo"). */
    statusLabels?: Record<string, string>;
    /** Mensaje vacío cuando no hay pautas. */
    emptyMessage?: string;
    renderPautaWithoutBay?: (pauta: PautaListItem) => React.ReactNode;
}

export default function BayMapView({
    pautas,
    onPautaClick,
    statusLabels,
    emptyMessage = 'No hay pautas en bahías ahora mismo.',
    renderPautaWithoutBay,
}: Props) {
    const currentDcId = useAppSelector((s) => s.auth.user?.centro_distribucion);
    const { data: baysData, isLoading } = useGetBaysQuery();
    const bays = baysData?.results || [];

    const dockPosition = useMemo<DockPosition>(() => {
        const key = `bayDock_${currentDcId ?? 'default'}`;
        const stored = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
        return (stored === 'top' || stored === 'bottom' || stored === 'left' || stored === 'right') ? stored : 'top';
    }, [currentDcId]);

    // Pautas con bahía asignada
    const pautasWithBay = pautas.filter((p) => p.bay_id != null);
    const pautasWithoutBay = pautas.filter((p) => p.bay_id == null);

    // Mapa de ocupación para el BayGridPicker
    const occupied: Record<number, BayOccupancy> = useMemo(() => {
        const map: Record<number, BayOccupancy> = {};
        for (const p of pautasWithBay) {
            if (p.bay_id != null) {
                map[p.bay_id] = {
                    transportNumber: p.transport_number,
                    truckCode: p.truck_code,
                    truckPlate: p.truck_plate,
                    status: statusLabels?.[p.status] || undefined,
                };
            }
        }
        return map;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pautas, statusLabels]);

    // Deshabilitar las bahías que no tienen pauta en este filtro
    const occupiedBayIds = new Set(pautasWithBay.map((p) => p.bay_id!));
    const disabledBayIds = bays.filter((b) => !occupiedBayIds.has(b.id)).map((b) => b.id);

    const handleBayClick = (bay: { id: number }) => {
        const pauta = pautasWithBay.find((p) => p.bay_id === bay.id);
        if (pauta) onPautaClick(pauta);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
            </Box>
        );
    }

    if (bays.length === 0) {
        return (
            <Alert severity="info">
                No hay bahías configuradas en este centro de distribución.
            </Alert>
        );
    }

    return (
        <Box>
            {pautasWithBay.length === 0 && pautasWithoutBay.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                    {emptyMessage}
                </Alert>
            ) : null}

            {/* Mapa del estacionamiento */}
            <BayGridPicker
                bays={bays}
                value={null}
                onChange={handleBayClick}
                occupied={occupied}
                disabledBayIds={disabledBayIds}
                dockPosition={dockPosition}
            />

            {/* Pautas sin bahía asignada */}
            {pautasWithoutBay.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
                        Sin bahía asignada ({pautasWithoutBay.length})
                    </Typography>
                    {renderPautaWithoutBay ? (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 1.25 }}>
                            {pautasWithoutBay.map((p) => (
                                <Box key={p.id}>{renderPautaWithoutBay(p)}</Box>
                            ))}
                        </Box>
                    ) : (
                        <Alert severity="warning">
                            Hay {pautasWithoutBay.length} pauta{pautasWithoutBay.length === 1 ? '' : 's'} sin bahía asignada.
                        </Alert>
                    )}
                </Box>
            )}
        </Box>
    );
}
