/**
 * Tipos del módulo Workstation (modelo de bloques).
 */

export type WorkstationRole = 'PICKING' | 'PICKER' | 'COUNTER' | 'YARD' | 'REPACK';
export type DocType = 'SOP' | 'OPL' | 'OTHER';

export type BlockType =
    | 'RISKS'
    | 'PROHIBITIONS'
    | 'TRIGGERS'
    | 'SIC_CHART'
    | 'REACTION_PLANS'
    | 'PERFORMERS'
    | 'QR_DOCUMENT'
    | 'QR_EXTERNAL'
    | 'IMAGE'
    | 'TEXT'
    | 'TITLE'
    | 'CLOCK'
    | 'DPO';

export interface PerformersBlockConfig {
    title?: string;
    /** Code del PerformanceMetricType para rankear. */
    metric_code?: string;
    /** Cuántos top mostrar (1-10, default 3). */
    top_count?: number;
    /** Cuántos bottom mostrar (1-10, default 3). */
    bottom_count?: number;
    /** 'today' (default) o 'week'. */
    period?: 'today' | 'week';
}

export interface PerformerEntry {
    personnel_id: number;
    name: string;
    photo_url: string | null;
    value: number;
}

export interface RiskCatalogItem {
    id: number;
    code: string;
    name: string;
    icon_name: string;
    is_active: boolean;
}

export interface ProhibitionCatalogItem {
    id: number;
    code: string;
    name: string;
    icon_name: string;
    is_active: boolean;
}

export interface WorkstationDocument {
    id: number;
    workstation: number;
    doc_type: DocType;
    name: string;
    file: string;
    qr_token: string;
    qr_url: string;
    is_active: boolean;
    created_at: string;
}

export interface WorkstationImage {
    id: number;
    workstation: number;
    name: string;
    file: string;
    alt: string;
    created_at: string;
}

// ────────── Configs por tipo de bloque ──────────

export interface RisksBlockConfig {
    title?: string;
    catalog_ids: number[];
}

export interface ProhibitionsBlockConfig {
    title?: string;
    catalog_ids: number[];
}

export interface TriggerItem {
    indicator: string;
    meta: string;
    disparador: string;
    unit?: string;
    direction?: 'HIGHER_IS_BETTER' | 'LOWER_IS_BETTER';
    metric_code?: string;  // Si vino expandido del KpiTarget
}

export interface TriggersBlockConfig {
    title?: string;
    /** Selector preferido: códigos de PerformanceMetricType. Backend expande
     *  a `items` con valores vigentes de KPITargetModel para el CD. */
    metric_codes?: string[];
    /** Items legacy (texto libre) — usados si `metric_codes` está vacío.
     *  En tiempo de render siempre llegan items expandidos del backend. */
    items: TriggerItem[];
}

export interface SicKpiConfig {
    label: string;
    /** Para HIGHER_IS_BETTER: green ≥ goal_min, yellow ∈ [yellow_min, goal_min), red < yellow_min.
     *  Para LOWER_IS_BETTER: green ≤ goal_min, yellow ∈ (goal_min, yellow_min], red > yellow_min. */
    goal_min?: number;
    yellow_min?: number;
    unit?: string;
    direction?: 'HIGHER_IS_BETTER' | 'LOWER_IS_BETTER';
    metric_code?: string;
    description?: string;
}

export interface SicChartBlockConfig {
    title?: string;
    /** Códigos de PerformanceMetricType. El backend expande a `kpis` con los
     *  valores vigentes del KPITargetModel del CD. Los `kpis` quedan read-only
     *  desde el frontend en este modo. */
    metric_codes?: string[];
    kpis: SicKpiConfig[];
    /** Ciclar entre KPIs cada N segundos en la TV (0 = no ciclar) */
    cycle_seconds?: number;
}

export interface ReactionPlansBlockConfig {
    title?: string;
    kpi_label: string;
    yellow: { title: string; description: string; qr_url?: string; qr_label?: string };
    red:    { title: string; description: string; qr_url?: string; qr_label?: string };
}

export interface QrDocumentBlockConfig {
    document_id: number | null;
    title?: string;
    show_label?: boolean;
}

export interface QrExternalBlockConfig {
    url: string;
    title?: string;
    label?: string;
}

export interface ImageBlockConfig {
    image_id: number | null;
    fit?: 'contain' | 'cover';
    title?: string;
}

export interface TextBlockConfig {
    content: string;
    size?: 'small' | 'medium' | 'large';
    align?: 'left' | 'center' | 'right';
    color?: string;
}

export interface TitleBlockConfig {
    content: string;
}

export interface ClockBlockConfig {
    show_date?: boolean;
}

export type BlockConfig =
    | RisksBlockConfig
    | ProhibitionsBlockConfig
    | TriggersBlockConfig
    | SicChartBlockConfig
    | ReactionPlansBlockConfig
    | QrDocumentBlockConfig
    | QrExternalBlockConfig
    | ImageBlockConfig
    | TextBlockConfig
    | TitleBlockConfig
    | ClockBlockConfig
    | Record<string, never>;

export interface WorkstationBlock {
    id: number;
    workstation: number;
    type: BlockType;
    config: BlockConfig;
    grid_x: number;
    grid_y: number;
    grid_w: number;
    grid_h: number;
    is_active: boolean;
    created_at: string;
}

export interface Workstation {
    id: number;
    distributor_center: number;
    distributor_center_name: string;
    role: WorkstationRole;
    role_display: string;
    name: string;
    is_active: boolean;
    created_at: string;
    blocks: WorkstationBlock[];
    documents: WorkstationDocument[];
    images: WorkstationImage[];
}

export interface WorkstationListItem {
    id: number;
    distributor_center: number;
    distributor_center_name: string;
    role: WorkstationRole;
    role_display: string;
    name: string;
    is_active: boolean;
    created_at: string;
    blocks_count: number;
    documents_count: number;
}

export const ROLE_LABELS: Record<WorkstationRole, string> = {
    PICKING: 'Picking (legacy)',
    PICKER:  'Picker',
    COUNTER: 'Contador',
    YARD:    'Chofer de Patio',
    REPACK:  'Reempaque',
};

export const ROLE_COLORS: Record<WorkstationRole, string> = {
    PICKING: '#1976d2',
    PICKER:  '#0288d1',
    COUNTER: '#f57c00',
    YARD:    '#388e3c',
    REPACK:  '#7b1fa2',
};

export const DOC_TYPE_LABELS: Record<DocType, string> = {
    SOP:   'SOP',
    OPL:   'OPL',
    OTHER: 'Otro',
};
