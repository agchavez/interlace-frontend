import { useEffect, useState } from 'react';
import { getGroupImpersonation, subscribeGroupImpersonation } from './workRole';

/**
 * Hook que devuelve el nombre del grupo impersonado actualmente (solo DEV),
 * o null si no hay ninguno. Re-renderiza cuando cambia.
 */
export function useGroupImpersonation(): string | null {
    const [group, setGroup] = useState<string | null>(() => getGroupImpersonation());
    useEffect(() => subscribeGroupImpersonation(() => setGroup(getGroupImpersonation())), []);
    return group;
}
