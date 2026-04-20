import { format } from 'date-fns';
import { useGetSecurityStatsQuery } from '../../truck-cycle/services/truckCycleApi';
import ValidatorNavStats from './ValidatorNavStats';

export default function SecurityNavStats() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: stats } = useGetSecurityStatsQuery(
        { operational_date: today },
        { pollingInterval: 15_000 },
    );
    return <ValidatorNavStats stats={stats} />;
}
