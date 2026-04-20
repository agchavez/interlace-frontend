export type WorkRoleCode = 'PICKER' | 'COUNTER' | 'SECURITY' | 'OPS' | 'YARD_DRIVER' | 'VENDOR';

export const WORK_ROLE_TO_PATH: Record<WorkRoleCode, string> = {
    PICKER: '/work/picker',
    COUNTER: '/work/counter',
    SECURITY: '/work/security',
    OPS: '/work/ops',
    YARD_DRIVER: '/work/yard',
    VENDOR: '/work/vendor',
};

export const WORK_ROLE_LABEL: Record<WorkRoleCode, string> = {
    PICKER: 'Picker',
    COUNTER: 'Contador',
    SECURITY: 'Seguridad',
    OPS: 'Operaciones',
    YARD_DRIVER: 'Chofer de Patio',
    VENDOR: 'Chofer Vendedor',
};

// Grupos de Django → rol del módulo work.
export const GROUP_TO_ROLE: Record<string, WorkRoleCode> = {
    'Picker':              'PICKER',
    'Contador':            'COUNTER',
    'Seguridad Ciclo':     'SECURITY',
    'Operaciones Ciclo':   'OPS',
    'Chofer de Patio':     'YARD_DRIVER',
    'Chofer Vendedor':     'VENDOR',
};

export const ROLE_TO_GROUP: Record<WorkRoleCode, string> = {
    PICKER:      'Picker',
    COUNTER:     'Contador',
    SECURITY:    'Seguridad Ciclo',
    OPS:         'Operaciones Ciclo',
    YARD_DRIVER: 'Chofer de Patio',
    VENDOR:      'Chofer Vendedor',
};

export const ROLE_TO_PERMISSION: Record<WorkRoleCode, string> = {
    PICKER: 'truck_cycle.access_work_picker',
    COUNTER: 'truck_cycle.access_work_counter',
    SECURITY: 'truck_cycle.access_work_security',
    OPS: 'truck_cycle.access_work_ops',
    YARD_DRIVER: 'truck_cycle.access_work_yard',
    VENDOR: 'truck_cycle.access_work_vendor',
};

// Fallback: position_type del PersonnelProfile → rol.
export const POSITION_TYPE_TO_ROLE: Record<string, WorkRoleCode> = {
    PICKER: 'PICKER',
    LOADER: 'PICKER',
    COUNTER: 'COUNTER',
    SECURITY_GUARD: 'SECURITY',
    YARD_DRIVER: 'YARD_DRIVER',
    DELIVERY_DRIVER: 'VENDOR',
    WAREHOUSE_ASSISTANT: 'COUNTER',
};

const DEV_OVERRIDE_KEY = 'workRoleOverride';
const DEV_OVERRIDE_EVENT = 'workRoleOverrideChange';
const DEV_GROUP_KEY = 'groupImpersonation';
const DEV_GROUP_EVENT = 'groupImpersonationChange';

// Grupos Django "no-cycle" listados en el Dev Role Switcher.
// Solo los que realmente se crean por los setup commands del backend
// (apps/tokens/management/commands/load_group_data.py — nombres canónicos).
// Al elegirlos, el sidebar se comporta como si el usuario fuera miembro de ese
// grupo (solo DEV, solo lectura — no toca el usuario real en backend).
export const EXTRA_IMPERSONATION_GROUPS: Array<{ name: string; label: string }> = [
    { name: 'SUPERADMIN', label: 'Super Admin' },
    { name: 'MANAGING',   label: 'Gerencia CD (MANAGING)' },
    { name: 'SUPERVISOR', label: 'Supervisor' },
    { name: 'Area Head',  label: 'Jefe de Área' },
    { name: 'People',     label: 'People (RRHH)' },
    { name: 'Security',   label: 'Seguridad (tokens)' },
];

export function getDevRoleOverride(): WorkRoleCode | null {
    if (typeof window === 'undefined') return null;
    const v = window.localStorage.getItem(DEV_OVERRIDE_KEY);
    if (!v) return null;
    return (v as WorkRoleCode) in WORK_ROLE_TO_PATH ? (v as WorkRoleCode) : null;
}

export function setDevRoleOverride(role: WorkRoleCode | null): void {
    if (typeof window === 'undefined') return;
    if (role) window.localStorage.setItem(DEV_OVERRIDE_KEY, role);
    else window.localStorage.removeItem(DEV_OVERRIDE_KEY);
    // Notifica a los consumidores dentro de la misma pestaña (el evento `storage`
    // nativo solo dispara en otras pestañas).
    window.dispatchEvent(new CustomEvent(DEV_OVERRIDE_EVENT));
}

export function subscribeDevRoleOverride(cb: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = () => cb();
    window.addEventListener(DEV_OVERRIDE_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
        window.removeEventListener(DEV_OVERRIDE_EVENT, handler);
        window.removeEventListener('storage', handler);
    };
}

// ────────── Impersonation de grupo Django (solo DEV) ──────────
// Permite que el tester simule ser miembro de un grupo arbitrario. Cuando hay
// impersonation activa, el sidebar y los permission checks usan solo ese grupo.

export function getGroupImpersonation(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(DEV_GROUP_KEY);
}

export function setGroupImpersonation(groupName: string | null): void {
    if (typeof window === 'undefined') return;
    if (groupName) window.localStorage.setItem(DEV_GROUP_KEY, groupName);
    else window.localStorage.removeItem(DEV_GROUP_KEY);
    window.dispatchEvent(new CustomEvent(DEV_GROUP_EVENT));
}

export function subscribeGroupImpersonation(cb: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = () => cb();
    window.addEventListener(DEV_GROUP_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
        window.removeEventListener(DEV_GROUP_EVENT, handler);
        window.removeEventListener('storage', handler);
    };
}

export function detectWorkRole(
    user: { list_groups?: string[] } | null | undefined,
    positionType?: string | null,
): WorkRoleCode | null {
    const dev = getDevRoleOverride();
    if (dev) return dev;
    const groups = user?.list_groups || [];
    for (const g of groups) {
        if (GROUP_TO_ROLE[g]) return GROUP_TO_ROLE[g];
    }
    if (positionType && POSITION_TYPE_TO_ROLE[positionType]) {
        return POSITION_TYPE_TO_ROLE[positionType];
    }
    return null;
}
