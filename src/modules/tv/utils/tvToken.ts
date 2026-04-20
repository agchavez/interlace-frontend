const TV_TOKEN_KEY = 'tvAccessToken';
const TV_DASHBOARD_KEY = 'tvDashboard';
const TV_CODE_KEY = 'tvCode';
const TV_LABEL_KEY = 'tvLabel';

export type TvDashboard = 'WORKSTATION' | 'WORKSTATION_PICKING';

export function updateTvDashboard(dashboard: TvDashboard, label?: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TV_DASHBOARD_KEY, dashboard);
    if (label !== undefined) window.localStorage.setItem(TV_LABEL_KEY, label);
}

export function getTvToken(): string | null {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(TV_TOKEN_KEY);
}

export function getTvDashboard(): TvDashboard | null {
    if (typeof window === 'undefined') return null;
    const v = window.localStorage.getItem(TV_DASHBOARD_KEY);
    return (v === 'WORKSTATION' ? v : null) as TvDashboard | null;
}

export function getTvCode(): string | null {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(TV_CODE_KEY);
}

export function getTvLabel(): string | null {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(TV_LABEL_KEY);
}

export function setTvSession(opts: {
    token: string;
    dashboard: TvDashboard;
    code: string;
    label?: string;
}): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TV_TOKEN_KEY, opts.token);
    window.localStorage.setItem(TV_DASHBOARD_KEY, opts.dashboard);
    window.localStorage.setItem(TV_CODE_KEY, opts.code);
    if (opts.label) window.localStorage.setItem(TV_LABEL_KEY, opts.label);
}

export function clearTvSession(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(TV_TOKEN_KEY);
    window.localStorage.removeItem(TV_DASHBOARD_KEY);
    window.localStorage.removeItem(TV_CODE_KEY);
    window.localStorage.removeItem(TV_LABEL_KEY);
}
