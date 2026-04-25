import type { Theme } from '@mui/material/styles';
import type { Band, Direction, MetricValueWithBand } from '../../personnel/services/personnelApi';

export function computeBand(
    value: number | null | undefined,
    target: number | null | undefined,
    trigger: number | null | undefined,
    direction: Direction,
): Band {
    if (value === null || value === undefined || target === null || target === undefined) return 'GRAY';
    const v = Number(value);
    const t = Number(target);
    const w = trigger !== null && trigger !== undefined ? Number(trigger) : null;

    if (direction === 'HIGHER_IS_BETTER') {
        if (v >= t) return 'GREEN';
        if (w === null) return 'RED';
        return v >= w ? 'YELLOW' : 'RED';
    }
    // LOWER_IS_BETTER
    if (v <= t) return 'GREEN';
    if (w === null) return 'RED';
    return v <= w ? 'YELLOW' : 'RED';
}

export function bandColor(theme: Theme, band: Band): string {
    switch (band) {
        case 'GREEN':  return theme.palette.success.main;
        case 'YELLOW': return theme.palette.warning.main;
        case 'RED':    return theme.palette.error.light;
        default:       return theme.palette.text.disabled;
    }
}

export function bandContrast(theme: Theme, band: Band): string {
    switch (band) {
        case 'GREEN':  return theme.palette.success.contrastText;
        case 'YELLOW': return theme.palette.warning.contrastText;
        case 'RED':    return theme.palette.error.contrastText;
        default:       return theme.palette.text.primary;
    }
}

export function bandLabel(band: Band): string {
    switch (band) {
        case 'GREEN':  return 'En meta';
        case 'YELLOW': return 'En alerta';
        case 'RED':    return 'Fuera de meta';
        default:       return 'Sin datos';
    }
}

/** Formatea MetricValueWithBand como string humano (con unidad) */
export function formatMetric(m: MetricValueWithBand | undefined | null, digits = 1): string {
    if (!m || m.value === null || m.value === undefined) return '—';
    const rounded = Number(m.value).toLocaleString('es-HN', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
    return m.unit ? `${rounded} ${m.unit}` : rounded;
}

/** Solo el número formateado (sin unidad) */
export function formatMetricValue(m: MetricValueWithBand | undefined | null, digits = 1): string {
    if (!m || m.value === null || m.value === undefined) return '—';
    return Number(m.value).toLocaleString('es-HN', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
}
