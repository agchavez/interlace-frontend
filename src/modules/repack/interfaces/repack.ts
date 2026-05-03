export type RepackStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface RepackEntry {
    id: number;
    session: number;
    product: number | null;
    material_code: string;
    product_name: string;
    box_count: number;
    expiration_date: string;
    notes: string;
    created_at: string;
}

export interface RepackSession {
    id: number;
    personnel: number;
    personnel_name: string;
    distributor_center: number;
    distributor_center_name: string;
    operational_date: string;
    started_at: string;
    ended_at: string | null;
    status: RepackStatus;
    status_display: string;
    notes: string;
    total_boxes: number;
    duration_seconds: number;
    boxes_per_hour: number;
    entries_count: number;
    entries?: RepackEntry[];
    created_at: string;
}
