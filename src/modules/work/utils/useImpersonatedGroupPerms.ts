import { useEffect, useState } from 'react';
import { useAppSelector } from '../../../store/store';
import { useGroupImpersonation } from './useGroupImpersonation';

interface ImpersonatedGroupData {
    name: string;
    is_superadmin: boolean;
    permissions: string[];
}

interface State {
    perms: string[];
    isSuperadmin: boolean;
    loading: boolean;
}

const cache = new Map<string, ImpersonatedGroupData>();

/**
 * Cuando hay un grupo impersonado (DEV role switcher → "Otros grupos"),
 * carga sus permisos del backend para que el sidebar y los guards se comporten
 * como si el usuario fuera miembro de ese grupo.
 *
 * Devuelve permisos vacíos cuando no hay impersonation.
 */
export function useImpersonatedGroupPerms(): State {
    const group = useGroupImpersonation();
    const token = useAppSelector((s) => s.auth.token);
    const [state, setState] = useState<State>({ perms: [], isSuperadmin: false, loading: false });

    useEffect(() => {
        if (!group) {
            setState({ perms: [], isSuperadmin: false, loading: false });
            return;
        }

        const cached = cache.get(group);
        if (cached) {
            setState({ perms: cached.permissions, isSuperadmin: cached.is_superadmin, loading: false });
            return;
        }

        let cancelled = false;
        setState((prev) => ({ ...prev, loading: true }));
        const url = `${import.meta.env.VITE_JS_APP_API_URL}/api/groups/permissions-by-name/?name=${encodeURIComponent(group)}`;
        fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
            .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
            .then((data: ImpersonatedGroupData) => {
                if (cancelled) return;
                cache.set(group, data);
                setState({ perms: data.permissions || [], isSuperadmin: !!data.is_superadmin, loading: false });
            })
            .catch(() => {
                if (cancelled) return;
                setState({ perms: [], isSuperadmin: false, loading: false });
            });
        return () => {
            cancelled = true;
        };
    }, [group, token]);

    return state;
}
