/**
 * TV dashboard · Estación de Trabajo (rol COUNTER).
 * Usa el layout v2 compartido + config del workstation por (CD, role=COUNTER).
 */
import TvWorkstationDashboardBase from './TvWorkstationDashboardBase';

export default function TvWorkstationCounterPage() {
    return <TvWorkstationDashboardBase role="COUNTER" />;
}
