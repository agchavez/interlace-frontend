import { useMemo, useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Tooltip,
    Paper,
    Alert,
    ToggleButton,
    ToggleButtonGroup,
    useTheme,
    alpha,
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    DragIndicator as DragIcon,
    DoNotDisturb as DisabledIcon,
    Save as SaveIcon,
    RestartAlt as ResetIcon,
    Warehouse as DockIcon,
    ArrowUpward,
    ArrowDownward,
    ArrowBack,
    ArrowForward,
} from '@mui/icons-material';
import type { Bay } from '../interfaces/truckCycle';
import TruckSilhouette from './TruckSilhouette';
import type { DockPosition } from './BayGridPicker';

interface Props {
    bays: Bay[];
    onSave: (changes: Array<{ id: number; row: number; column: number }>) => Promise<void> | void;
    saving?: boolean;
    dockPosition?: DockPosition;
    onDockPositionChange?: (dock: DockPosition) => void;
}

// Palette (igual que picker)
const PAVEMENT = '#d9d9d9';
const PAVEMENT_DARK = '#bfbfbf';
const LANE_STRIPE = '#ffffff';
const PARKING_LINE = '#ffd54f';
const DOCK_BG = '#37474f';
const DOCK_BORDER = '#263238';
const SLOT_BG = '#f5f5f5';
const SLOT_BG_INACTIVE = '#ef9a9a';
const SLOT_BG_DROP = '#c8e6c9';

type BayMap = Map<string, Bay>;

function buildMap(bays: Bay[]): BayMap {
    const m: BayMap = new Map();
    for (const b of bays) m.set(`${b.row}-${b.column}`, b);
    return m;
}

function autoLayout(bays: Bay[]): { bays: Bay[]; adjusted: boolean } {
    if (bays.length === 0) return { bays, adjusted: false };
    const seen = new Set<string>();
    const sorted = [...bays].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    let adjusted = false;
    const result: Bay[] = [];
    let nextRow = 0;
    for (const b of sorted) {
        const key = `${b.row}-${b.column}`;
        if (seen.has(key)) {
            while (seen.has(`${nextRow}-0`)) nextRow++;
            result.push({ ...b, row: nextRow, column: 0 });
            seen.add(`${nextRow}-0`);
            nextRow++;
            adjusted = true;
        } else {
            seen.add(key);
            result.push({ ...b });
            nextRow = Math.max(nextRow, b.row + 1);
        }
    }
    return { bays: result, adjusted };
}

function rotationForDock(dock: DockPosition): number {
    switch (dock) {
        case 'top': return 0;
        case 'bottom': return 180;
        case 'left': return 90;
        case 'right': return 270;
    }
}

export default function BayGridEditor({
    bays,
    onSave,
    saving = false,
    dockPosition = 'top',
    onDockPositionChange,
}: Props) {
    const theme = useTheme();

    const [localBays, setLocalBays] = useState<Bay[]>(() => autoLayout(bays).bays);
    const [autoAdjusted, setAutoAdjusted] = useState<boolean>(() => autoLayout(bays).adjusted);
    const [dragBayId, setDragBayId] = useState<number | null>(null);

    const [syncedFrom, setSyncedFrom] = useState<Bay[]>(bays);
    if (syncedFrom !== bays) {
        setSyncedFrom(bays);
        const out = autoLayout(bays);
        setLocalBays(out.bays);
        setAutoAdjusted(out.adjusted);
    }

    const inferredDims = useMemo(() => {
        let maxRow = 0;
        let maxCol = 0;
        for (const b of localBays) {
            if (b.row > maxRow) maxRow = b.row;
            if (b.column > maxCol) maxCol = b.column;
        }
        return { rows: maxRow + 1, cols: maxCol + 1 };
    }, [localBays]);

    const [extraRows, setExtraRows] = useState(0);
    const [extraCols, setExtraCols] = useState(0);
    const rows = Math.max(1, inferredDims.rows + extraRows);
    const cols = Math.max(1, inferredDims.cols + extraCols);

    const cellMap = useMemo(() => buildMap(localBays), [localBays]);

    const pendingChanges = useMemo(() => {
        const original = new Map(bays.map((b) => [b.id, b] as const));
        const changes: Array<{ id: number; row: number; column: number }> = [];
        for (const b of localBays) {
            const o = original.get(b.id);
            if (!o) continue;
            if (o.row !== b.row || o.column !== b.column) {
                changes.push({ id: b.id, row: b.row, column: b.column });
            }
        }
        return changes;
    }, [localBays, bays]);

    const handleDragStart = (bayId: number) => (e: React.DragEvent) => {
        setDragBayId(bayId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(bayId));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = useCallback((targetRow: number, targetCol: number) => (e: React.DragEvent) => {
        e.preventDefault();
        const bayId = dragBayId;
        setDragBayId(null);
        if (bayId == null) return;

        setLocalBays((prev) => {
            const moving = prev.find((b) => b.id === bayId);
            if (!moving) return prev;
            if (moving.row === targetRow && moving.column === targetCol) return prev;

            const occupant = prev.find((b) => b.row === targetRow && b.column === targetCol && b.id !== bayId);
            return prev.map((b) => {
                if (b.id === bayId) return { ...b, row: targetRow, column: targetCol };
                if (occupant && b.id === occupant.id) return { ...b, row: moving.row, column: moving.column };
                return b;
            });
        });
    }, [dragBayId]);

    const handleReset = () => setLocalBays(bays.map((b) => ({ ...b })));

    const handleSave = async () => {
        if (pendingChanges.length === 0) return;
        await onSave(pendingChanges);
    };

    const isHorizontal = dockPosition === 'left' || dockPosition === 'right';
    const truckRotation = rotationForDock(dockPosition);

    const renderSlot = (bay: Bay | null, r: number, c: number) => {
        const isDropTarget = dragBayId != null;
        const isBeingDragged = bay && dragBayId === bay.id;

        return (
            <Box
                key={`${r}-${c}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop(r, c)}
                sx={{
                    position: 'relative',
                    minHeight: isHorizontal ? 100 : 240,
                    minWidth: isHorizontal ? 240 : 100,
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: bay
                        ? bay.is_active
                            ? isDropTarget ? SLOT_BG_DROP : SLOT_BG
                            : SLOT_BG_INACTIVE
                        : alpha('#000', 0.03),
                    // Líneas de parqueo amarillas perpendiculares al muelle
                    borderTop: dockPosition === 'top' ? `4px solid ${DOCK_BG}` : isHorizontal && bay ? `3px solid ${PARKING_LINE}` : undefined,
                    borderBottom: dockPosition === 'bottom' ? `4px solid ${DOCK_BG}` : isHorizontal && bay ? `3px solid ${PARKING_LINE}` : undefined,
                    borderLeft: dockPosition === 'left' ? `4px solid ${DOCK_BG}` : !isHorizontal && bay ? `3px solid ${PARKING_LINE}` : undefined,
                    borderRight: dockPosition === 'right' ? `4px solid ${DOCK_BG}` : !isHorizontal && bay ? `3px solid ${PARKING_LINE}` : undefined,
                    border: !bay ? `2px dashed ${alpha('#000', 0.2)}` : undefined,
                    borderRadius: 1,
                    overflow: 'hidden',
                    opacity: isBeingDragged ? 0.4 : 1,
                    transition: 'all 0.15s ease',
                }}
            >
                {bay ? (
                    <>
                        {/* Handle de arrastre (esquina superior, sobre la silueta) */}
                        <Box
                            draggable
                            onDragStart={handleDragStart(bay.id)}
                            sx={{
                                position: 'absolute',
                                top: 4,
                                left: 4,
                                zIndex: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 0.75,
                                py: 0.3,
                                bgcolor: alpha('#000', 0.7),
                                color: '#fff',
                                borderRadius: 0.5,
                                cursor: 'grab',
                                '&:active': { cursor: 'grabbing' },
                            }}
                        >
                            <DragIcon sx={{ fontSize: '0.85rem' }} />
                            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.7rem', letterSpacing: 0.5 }}>
                                {bay.code}
                            </Typography>
                        </Box>

                        {!bay.is_active && (
                            <Box sx={{ position: 'absolute', top: 4, right: 6, zIndex: 3 }}>
                                <DisabledIcon sx={{ color: '#c62828', fontSize: '1rem' }} />
                            </Box>
                        )}

                        {/* Silueta del camión en el centro */}
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                            }}
                        >
                            <Box sx={{ transform: `rotate(${truckRotation}deg)`, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TruckSilhouette
                                    color={!bay.is_active ? '#b71c1c' : theme.palette.grey[500]}
                                    variant="outline"
                                    opacity={bay.is_active ? 0.9 : 0.5}
                                />
                            </Box>
                        </Box>

                        {/* Fila/Col al pie */}
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 4,
                                right: 6,
                                px: 0.6,
                                py: 0.2,
                                bgcolor: alpha('#fff', 0.7),
                                color: alpha('#000', 0.7),
                                borderRadius: 0.5,
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                zIndex: 2,
                            }}
                        >
                            F{bay.row + 1}·C{bay.column + 1}
                        </Box>
                    </>
                ) : (
                    <Typography
                        variant="caption"
                        sx={{
                            color: alpha('#000', 0.4),
                            textAlign: 'center',
                            m: 'auto',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: 2,
                            textTransform: 'uppercase',
                        }}
                    >
                        vacío
                    </Typography>
                )}
            </Box>
        );
    };

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

    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                        Editor de Layout
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Arrastre desde el código de la bahía para reordenar. Suelte sobre otro slot para intercambiar.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title="Quitar columna">
                        <span>
                            <IconButton size="small" onClick={() => setExtraCols((n) => Math.max(-inferredDims.cols + 1, n - 1))}>
                                <RemoveIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center' }}>
                        {cols} col
                    </Typography>
                    <Tooltip title="Agregar columna">
                        <IconButton size="small" onClick={() => setExtraCols((n) => n + 1)}>
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Box sx={{ width: 8 }} />
                    <Tooltip title="Quitar fila">
                        <span>
                            <IconButton size="small" onClick={() => setExtraRows((n) => Math.max(-inferredDims.rows + 1, n - 1))}>
                                <RemoveIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center' }}>
                        {rows} filas
                    </Typography>
                    <Tooltip title="Agregar fila">
                        <IconButton size="small" onClick={() => setExtraRows((n) => n + 1)}>
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Selector de dirección del muelle */}
            {onDockPositionChange && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
                    <Typography variant="caption" fontWeight={600}>
                        PATIO DE MANIOBRAS en:
                    </Typography>
                    <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={dockPosition}
                        onChange={(_, v) => v && onDockPositionChange(v)}
                    >
                        <ToggleButton value="top" aria-label="muelle arriba"><ArrowUpward fontSize="small" />&nbsp;Arriba</ToggleButton>
                        <ToggleButton value="bottom" aria-label="muelle abajo"><ArrowDownward fontSize="small" />&nbsp;Abajo</ToggleButton>
                        <ToggleButton value="left" aria-label="muelle izquierda"><ArrowBack fontSize="small" />&nbsp;Izquierda</ToggleButton>
                        <ToggleButton value="right" aria-label="muelle derecha"><ArrowForward fontSize="small" />&nbsp;Derecha</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            )}

            {autoAdjusted && (
                <Alert severity="warning" sx={{ mb: 2 }} variant="outlined">
                    Detectamos bahías sin posición configurada. Las distribuimos en una columna para que puedas arrastrarlas a su ubicación real. Ajusta y presiona "Guardar".
                </Alert>
            )}

            {pendingChanges.length > 0 && (
                <Alert severity="info" sx={{ mb: 2 }} variant="outlined">
                    {pendingChanges.length} cambio{pendingChanges.length === 1 ? '' : 's'} pendiente{pendingChanges.length === 1 ? '' : 's'}. Presione "Guardar" para aplicar.
                </Alert>
            )}

            {/* Estacionamiento (pavimento + muelle + grid + carril) */}
            <Box
                sx={{
                    position: 'relative',
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: PAVEMENT,
                    backgroundImage: `repeating-linear-gradient(45deg, ${PAVEMENT} 0 10px, ${PAVEMENT_DARK} 10px 11px)`,
                    p: { xs: 1.5, sm: 2 },
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

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                            gap: 1.25,
                            flex: 1,
                            minHeight: 160,
                        }}
                    >
                        {Array.from({ length: rows * cols }).map((_, idx) => {
                            const r = Math.floor(idx / cols);
                            const c = idx % cols;
                            return renderSlot(cellMap.get(`${r}-${c}`) || null, r, c);
                        })}
                    </Box>

                    {renderLane()}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                <Button
                    onClick={handleReset}
                    startIcon={<ResetIcon />}
                    disabled={pendingChanges.length === 0 || saving}
                >
                    Deshacer
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={pendingChanges.length === 0 || saving}
                    startIcon={<SaveIcon />}
                >
                    {saving ? 'Guardando...' : 'Guardar'}
                </Button>
            </Box>
        </Paper>
    );
}
