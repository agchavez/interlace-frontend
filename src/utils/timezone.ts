/**
 * Devuelve la fecha operativa actual en Honduras (America/Tegucigalpa) en
 * formato YYYY-MM-DD, independientemente de la zona horaria del cliente.
 */
export const HN_TIMEZONE = 'America/Tegucigalpa';

export function todayInHonduras(): string {
    // en-CA produce YYYY-MM-DD con Intl.
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: HN_TIMEZONE,
        year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());
}
