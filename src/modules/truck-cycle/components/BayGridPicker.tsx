import { useMemo } from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import {
    Warehouse as DockIcon,
    DoNotDisturb as DisabledIcon,
} from '@mui/icons-material';
import type { Bay } from '../interfaces/truckCycle';
import TruckSilhouette from './TruckSilhouette';

export type DockPosition = 'top' | 'bottom' | 'left' | 'right';

export interface BayOccupancy {
    transportNumber?: string;
    truckCode?: string;
    truckPlate?: string;
    status?: string;
}

interface Props {
    bays: Bay[];
    value: Bay | null;
    onChange: (bay: Bay) => void;
    occupied?: Record<number, BayOccupancy>;
    disabledBayIds?: number[];
    readOnly?: boolean;
    /** Dónde está el muelle/edificio respecto al estacionamiento. Default 'top'. */
    dockPosition?: DockPosition;
}

// ─── Paleta clara (pavimento) ──────────────────────────────────────────────
const PAVEMENT = '#d9d9d9';
const PAVEMENT_DARK = '#bfbfbf';
const LANE_STRIPE = '#ffffff';
const PARKING_LINE = '#ffd54f'; // amarillo parqueo
const DOCK_BG = '#37474f';
const DOCK_BORDER = '#263238';
const SLOT_BG = '#f5f5f5';
const SLOT_BG_SELECTED = '#c8e6c9';
const SLOT_BG_OCCUPIED = '#fff3e0';
const SLOT_BG_INACTIVE = '#ef9a9a';

function slotBgColor(bay: Bay, isSelected: boolean, isOccupied: boolean) {
    if (!bay.is_active) return SLOT_BG_INACTIVE;
    if (isSelected) return SLOT_BG_SELECTED;
    if (isOccupied) return SLOT_BG_OCCUPIED;
    return SLOT_BG;
}

function rotationForDock(dock: DockPosition): number {
    // La silueta base asume muelle arriba (caja toca arriba).
    switch (dock) {
        case 'top': return 0;
        case 'bottom': return 180;
        case 'left': return 90;
        case 'right': return 270;
    }
}

export default function BayGridPicker({
    bays,
    value,
    onChange,
    occupied = {},
    disabledBayIds = [],
    readOnly = false,
    dockPosition = 'top',
}: Props) {
    const theme = useTheme();

    const { rows, cols, cellMap } = useMemo(() => {
        const seen = new Set<string>();
        const adjusted: Bay[] = [];
        const sorted = [...bays].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
        let nextRow = 0;
        for (const b of sorted) {
            const key = `${b.row}-${b.column}`;
            if (seen.has(key)) {
                while (seen.has(`${nextRow}-0`)) nextRow++;
                adjusted.push({ ...b, row: nextRow, column: 0 });
                seen.add(`${nextRow}-0`);
                nextRow++;
            } else {
                seen.add(key);
                adjusted.push(b);
                nextRow = Math.max(nextRow, b.row + 1);
            }
        }
        const map = new Map<string, Bay>();
        let maxRow = 0;
        let maxCol = 0;
        for (const b of adjusted) {
            map.set(`${b.row}-${b.column}`, b);
            if (b.row > maxRow) maxRow = b.row;
            if (b.column > maxCol) maxCol = b.column;
        }
        return {
            rows: adjusted.length ? maxRow + 1 : 0,
            cols: adjusted.length ? maxCol + 1 : 0,
            cellMap: map,
        };
    }, [bays]);

    if (bays.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    No hay bahías configuradas para este centro.
                </Typography>
            </Box>
        );
    }

    // Orientación del slot según muelle: slot es largo en el eje perpendicular al muelle.
    const isHorizontal = dockPosition === 'left' || dockPosition === 'right';
    const truckRotation = rotationForDock(dockPosition);

    const renderDock = () => (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                py: 0.75,
                px: 1.5,
                bgcolor: DOCK_BG,
                borderRadius: 1.5,
                border: `2px solid ${DOCK_BORDER}`,
                color: '#fff',
                flexDirection: isHorizontal ? 'column' : 'row',
                writingMode: isHorizontal ? 'vertical-rl' : undefined,
                textOrientation: isHorizontal ? 'mixed' : undefined,
                minWidth: isHorizontal ? 48 : undefined,
                minHeight: isHorizontal ? 120 : 36,
            }}
        >
            <DockIcon sx={{ fontSize: '1.2rem', transform: isHorizontal ? 'rotate(90deg)' : 'none' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                PATIO DE MANIOBRAS
            </Typography>
        </Box>
    );

    const renderLane = () => (
        <Box
            sx={{
                bgcolor: PAVEMENT_DARK,
                borderRadius: 1,
                position: 'relative',
                overflow: 'hidden',
                py: isHorizontal ? 0 : 1.25,
                px: isHorizontal ? 1.25 : 0,
                minWidth: isHorizontal ? 36 : undefined,
                minHeight: isHorizontal ? 120 : 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: isHorizontal ? 0 : '50%',
                    left: isHorizontal ? '50%' : 0,
                    right: isHorizontal ? undefined : 0,
                    bottom: isHorizontal ? 0 : undefined,
                    height: isHorizontal ? undefined : '3px',
                    width: isHorizontal ? '3px' : undefined,
                    transform: isHorizontal ? 'translateX(-50%)' : 'translateY(-50%)',
                    backgroundImage: isHorizontal
                        ? `repeating-linear-gradient(0deg, ${LANE_STRIPE} 0 16px, transparent 16px 28px)`
                        : `repeating-linear-gradient(90deg, ${LANE_STRIPE} 0 18px, transparent 18px 32px)`,
                },
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    position: 'relative',
                    color: alpha('#fff', 0.85),
                    fontWeight: 700,
                    letterSpacing: 3,
                    fontSize: '0.6rem',
                    textTransform: 'uppercase',
                    writingMode: isHorizontal ? 'vertical-rl' : undefined,
                }}
            >
                Carril
            </Typography>
        </Box>
    );

    const renderSlot = (bay: Bay) => {
        const isSelected = value?.id === bay.id;
        const isDisabled = readOnly || !bay.is_active || disabledBayIds.includes(bay.id);
        const occ = occupied[bay.id];
        const isOccupied = Boolean(occ);

        // Dimensiones: el slot es largo en el eje perpendicular al muelle.
        const slotWidth = isHorizontal ? 240 : 'auto';
        const slotHeight = isHorizontal ? 'auto' : 240;

        return (
            <Box
                key={bay.id}
                onClick={() => { if (!isDisabled) onChange(bay); }}
                role="button"
                aria-pressed={isSelected}
                aria-disabled={isDisabled}
                sx={{
                    position: 'relative',
                    width: slotWidth,
                    height: slotHeight,
                    minHeight: isHorizontal ? 100 : 240,
                    minWidth: isHorizontal ? 240 : 100,
                    display: 'flex',
                    flexDirection: isHorizontal ? 'row' : 'column',
                    bgcolor: slotBgColor(bay, isSelected, isOccupied),
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    // Líneas de parqueo amarillas a los costados (perpendiculares al muelle)
                    borderTop: dockPosition === 'top' ? `4px solid ${DOCK_BG}` : isHorizontal ? `3px solid ${PARKING_LINE}` : undefined,
                    borderBottom: dockPosition === 'bottom' ? `4px solid ${DOCK_BG}` : isHorizontal ? `3px solid ${PARKING_LINE}` : undefined,
                    borderLeft: dockPosition === 'left' ? `4px solid ${DOCK_BG}` : !isHorizontal ? `3px solid ${PARKING_LINE}` : undefined,
                    borderRight: dockPosition === 'right' ? `4px solid ${DOCK_BG}` : !isHorizontal ? `3px solid ${PARKING_LINE}` : undefined,
                    borderRadius: 1,
                    outline: isSelected ? `3px solid ${theme.palette.success.main}` : 'none',
                    outlineOffset: 2,
                    transition: 'all 0.15s ease',
                    overflow: 'hidden',
                    '&:hover': !isDisabled
                        ? { transform: 'translateY(-2px)', boxShadow: 3 }
                        : undefined,
                }}
            >
                {/* Marca de agua diagonal: LIBRE / OCUPADA / INACTIVA */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        zIndex: 1,
                        overflow: 'hidden',
                    }}
                >
                    <Typography
                        sx={{
                            transform: isHorizontal ? 'rotate(90deg)' : 'rotate(-18deg)',
                            fontWeight: 900,
                            fontSize: { xs: '1.8rem', sm: '2.4rem' },
                            letterSpacing: 6,
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap',
                            color: !bay.is_active
                                ? alpha('#c62828', 0.35)
                                : isOccupied
                                ? alpha('#e65100', 0.35)
                                : alpha('#2e7d32', 0.28),
                            textShadow: !bay.is_active
                                ? `0 0 1px ${alpha('#c62828', 0.4)}`
                                : isOccupied
                                ? `0 0 1px ${alpha('#e65100', 0.4)}`
                                : `0 0 1px ${alpha('#2e7d32', 0.35)}`,
                            fontFamily: 'system-ui, sans-serif',
                        }}
                    >
                        {!bay.is_active ? 'Inactiva' : isOccupied ? 'Ocupada' : 'Libre'}
                    </Typography>
                </Box>

                {/* Código de la bahía (pequeño, esquina) */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 4,
                        left: 6,
                        px: 0.75,
                        py: 0.25,
                        bgcolor: alpha('#000', 0.7),
                        color: '#fff',
                        borderRadius: 0.5,
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        letterSpacing: 0.5,
                        zIndex: 3,
                    }}
                >
                    {bay.code}
                </Box>

                {!bay.is_active && (
                    <Box sx={{ position: 'absolute', top: 4, right: 6, zIndex: 2 }}>
                        <DisabledIcon sx={{ color: '#c62828', fontSize: '1rem' }} />
                    </Box>
                )}

                {/* Silueta del camión */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        zIndex: 2,
                    }}
                >
                    <Box sx={{ transform: `rotate(${truckRotation}deg)`, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TruckSilhouette
                            color={
                                !bay.is_active
                                    ? '#b71c1c'
                                    : isOccupied
                                    ? theme.palette.warning.dark
                                    : theme.palette.grey[500]
                            }
                            variant={isOccupied ? 'filled' : 'outline'}
                            opacity={bay.is_active ? 1 : 0.5}
                        />
                    </Box>
                </Box>

                {/* Pill de transporte cuando ocupada */}
                {isOccupied && (
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 6,
                            left: 6,
                            right: 6,
                            bgcolor: '#ef6c00',
                            color: '#fff',
                            borderRadius: 0.75,
                            py: 0.4,
                            px: 0.75,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                            textAlign: 'center',
                            zIndex: 2,
                        }}
                    >
                        {occ?.transportNumber && (
                            <Typography variant="caption" fontWeight={800} sx={{ fontSize: '0.7rem', lineHeight: 1 }}>
                                T-{occ.transportNumber}
                            </Typography>
                        )}
                        {occ?.truckCode && (
                            <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1.1, opacity: 0.9 }} noWrap>
                                {occ.truckCode}{occ.truckPlate ? ` · ${occ.truckPlate}` : ''}
                            </Typography>
                        )}
                        {occ?.status && (
                            <Box
                                sx={{
                                    mt: 0.25,
                                    mx: 'auto',
                                    px: 0.5,
                                    py: 0.1,
                                    bgcolor: alpha('#fff', 0.22),
                                    borderRadius: 0.5,
                                    fontSize: '0.55rem',
                                    fontWeight: 700,
                                    letterSpacing: 0.5,
                                    textTransform: 'uppercase',
                                    lineHeight: 1.2,
                                }}
                            >
                                {occ.status}
                            </Box>
                        )}
                    </Box>
                )}

                {/* Estado inactiva */}
                {!bay.is_active && (
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 6,
                            left: 6,
                            right: 6,
                            textAlign: 'center',
                            bgcolor: alpha('#c62828', 0.85),
                            color: '#fff',
                            borderRadius: 0.75,
                            py: 0.35,
                            zIndex: 2,
                        }}
                    >
                        <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 1, fontSize: '0.65rem' }}>
                            INACTIVA
                        </Typography>
                    </Box>
                )}
            </Box>
        );
    };

    // Grid de slots
    const grid = (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gap: 1.25,
                flex: 1,
            }}
        >
            {Array.from({ length: rows * cols }).map((_, idx) => {
                const r = Math.floor(idx / cols);
                const c = idx % cols;
                const bay = cellMap.get(`${r}-${c}`);
                if (!bay) {
                    return (
                        <Box
                            key={`empty-${r}-${c}`}
                            sx={{
                                minHeight: isHorizontal ? 100 : 240,
                                border: `2px dashed ${alpha('#000', 0.15)}`,
                                borderRadius: 1,
                                bgcolor: alpha('#000', 0.03),
                            }}
                        />
                    );
                }
                return renderSlot(bay);
            })}
        </Box>
    );

    // Layout general: muelle + grid + carril, según dockPosition.
    return (
        <Box
            sx={{
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: PAVEMENT,
                p: { xs: 1.5, sm: 2 },
                backgroundImage: `repeating-linear-gradient(45deg, ${PAVEMENT} 0 10px, ${PAVEMENT_DARK} 10px 11px)`,
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.15)',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection:
                        dockPosition === 'top' ? 'column'
                        : dockPosition === 'bottom' ? 'column-reverse'
                        : dockPosition === 'left' ? 'row'
                        : 'row-reverse',
                    gap: 1.25,
                    alignItems: 'stretch',
                }}
            >
                {renderDock()}
                {grid}
                {renderLane()}
            </Box>
        </Box>
    );
}
