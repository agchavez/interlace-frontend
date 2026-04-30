/**
 * TV dashboard · Estación de Trabajo (rol PICKER).
 * Usa el layout v2 compartido + config del workstation por (CD, role=PICKER).
 */
import TvWorkstationDashboardBase from './TvWorkstationDashboardBase';

export default function TvWorkstationPickerPage() {
    return <TvWorkstationDashboardBase role="PICKER" />;
}
