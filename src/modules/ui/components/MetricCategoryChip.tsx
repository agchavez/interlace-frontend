/**
 * Chip que clasifica una métrica/KPI según el prefijo de su `code`.
 *
 * El backend usa convención de prefijos en el `code` del PerformanceMetricType:
 *   repack_*    → Reempaque
 *   picker_*    → Picking
 *   counter_*   → Conteo
 *   yard_*      → Patio
 *   security_*  → Seguridad
 *   ops_*       → Operaciones
 *
 * Este chip se renderiza al lado del nombre en cualquier lista/selector de KPI
 * para que el supervisor identifique de un vistazo a qué módulo pertenece.
 */
import { Chip, type ChipProps } from '@mui/material';


export interface MetricCategory {
    label: string;
    color: string;
    bg: string;
}


/** Devuelve la categoría inferida del code, o null si no matchea ningún prefijo. */
export function getMetricCategory(code: string | undefined | null): MetricCategory | null {
    if (!code) return null;
    const c = code.toLowerCase();
    if (c.startsWith('repack_'))   return { label: 'Reempaque',  color: '#7b1fa2', bg: 'rgba(123,31,162,0.10)' };
    if (c.startsWith('picker_'))   return { label: 'Picking',    color: '#0288d1', bg: 'rgba(2,136,209,0.10)' };
    if (c.startsWith('counter_'))  return { label: 'Conteo',     color: '#f57c00', bg: 'rgba(245,124,0,0.10)' };
    if (c.startsWith('yard_'))     return { label: 'Patio',      color: '#388e3c', bg: 'rgba(56,142,60,0.10)' };
    if (c.startsWith('security_')) return { label: 'Seguridad',  color: '#5e35b1', bg: 'rgba(94,53,177,0.10)' };
    if (c.startsWith('ops_'))      return { label: 'Operaciones', color: '#c62828', bg: 'rgba(198,40,40,0.10)' };
    return null;
}


interface Props extends Omit<ChipProps, 'label' | 'color'> {
    code: string | undefined | null;
}


export default function MetricCategoryChip({ code, sx, size = 'small', ...rest }: Props) {
    const cat = getMetricCategory(code);
    if (!cat) return null;
    return (
        <Chip
            label={cat.label}
            size={size}
            sx={{
                bgcolor: cat.bg,
                color: cat.color,
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 18,
                borderRadius: 0.75,
                '& .MuiChip-label': { px: 0.85 },
                ...sx,
            }}
            {...rest}
        />
    );
}
