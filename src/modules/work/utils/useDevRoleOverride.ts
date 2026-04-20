import { useEffect, useState } from 'react';
import { getDevRoleOverride, subscribeDevRoleOverride, type WorkRoleCode } from './workRole';

/**
 * Hook que devuelve el override de rol dev actual y re-renderiza el componente
 * cada vez que cambia (sin importar en qué pestaña/componente se modificó).
 */
export function useDevRoleOverride(): WorkRoleCode | null {
    const [role, setRole] = useState<WorkRoleCode | null>(() => getDevRoleOverride());
    useEffect(() => subscribeDevRoleOverride(() => setRole(getDevRoleOverride())), []);
    return role;
}
