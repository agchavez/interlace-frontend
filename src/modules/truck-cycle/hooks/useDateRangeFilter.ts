import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { es } from 'date-fns/locale';

export type DateRangeKey = 'today' | 'week' | 'month' | 'year';

export const DATE_LABELS: Record<DateRangeKey, string> = {
    today: 'Hoy',
    week: 'Esta semana',
    month: 'Este mes',
    year: 'Este año',
};

export function useDateRangeFilter(defaultRange: DateRangeKey = 'today') {
    const [dateRange, setDateRange] = useState<DateRangeKey>(defaultRange);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

    const { dateAfter, dateBefore } = useMemo(() => {
        const now = new Date();
        const fmt = (d: Date) => format(d, 'yyyy-MM-dd');
        switch (dateRange) {
            case 'today': return { dateAfter: fmt(now), dateBefore: fmt(now) };
            case 'week': return { dateAfter: fmt(startOfWeek(now, { locale: es })), dateBefore: fmt(endOfWeek(now, { locale: es })) };
            case 'month': return { dateAfter: fmt(startOfMonth(now)), dateBefore: fmt(endOfMonth(now)) };
            case 'year': return { dateAfter: fmt(startOfYear(now)), dateBefore: fmt(endOfYear(now)) };
        }
    }, [dateRange]);

    return {
        dateRange,
        setDateRange,
        menuAnchor,
        setMenuAnchor,
        dateAfter,
        dateBefore,
        label: DATE_LABELS[dateRange],
    };
}
