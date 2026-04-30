/**
 * TV dashboard · Estación de Trabajo (rol YARD).
 * Usa el layout v2 compartido + config del workstation por (CD, role=YARD).
 */
import TvWorkstationDashboardBase from './TvWorkstationDashboardBase';

export default function TvWorkstationYardPage() {
    return <TvWorkstationDashboardBase role="YARD" />;
}
