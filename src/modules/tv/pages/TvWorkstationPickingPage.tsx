/**
 * TV dashboard · Estación de Trabajo (rol PICKING legacy).
 * Usa el layout v2 compartido + config del workstation por (CD, role=PICKING).
 */
import TvWorkstationDashboardBase from './TvWorkstationDashboardBase';

export default function TvWorkstationPickingPage() {
    return <TvWorkstationDashboardBase role="PICKING" />;
}
