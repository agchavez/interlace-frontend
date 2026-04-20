import { format } from 'date-fns';
import { useGetOpsStatsQuery } from '../../truck-cycle/services/truckCycleApi';
import ValidatorNavStats from './ValidatorNavStats';

export default function OpsNavStats() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: stats } = useGetOpsStatsQuery(
        { operational_date: today },
        { pollingInterval: 15_000 },
    );
    return <ValidatorNavStats stats={stats} />;
}
