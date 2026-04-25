// Paginated response (matches Django REST Framework LimitOffset)
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// ==================== CATALOGS ====================
export interface Truck {
    id: number;
    code: string;
    plate: string;
    pallet_type: 'STANDARD' | 'HALF';
    pallet_spaces: number;
    is_active: boolean;
    distributor_center: number;
    created_at: string;
}

export interface Bay {
    id: number;
    code: string;
    name: string;
    row: number;
    column: number;
    is_active: boolean;
    distributor_center: number;
    created_at?: string;
}

export interface KPITarget {
    id: number;
    kpi_type: 'BOXES_PER_HOUR' | 'COUNT_ACCURACY' | 'PICKING_ERROR_RATE' | 'LOADING_TIME' | 'DISPATCH_TIME' | null;
    metric_type: number | null;
    direction: 'HIGHER_IS_BETTER' | 'LOWER_IS_BETTER';
    target_value: number;
    unit: string;
    warning_threshold: number | null;
    effective_from: string;
    effective_to: string | null;
    distributor_center: number;
}

export interface ProductCatalog {
    id: number;
    sku_code: string;
    description: string;
    division: string;
    brand: string;
    boxes_per_pallet: number;
    is_active: boolean;
    distributor_center: number;
}

// ==================== UPLOADS ====================
export interface PalletComplexUpload {
    id: number;
    file_name: string;
    upload_date: string;
    status: 'PREVIEW' | 'CONFIRMED' | 'CANCELLED';
    errors_json: Record<string, unknown>;
    row_count: number;
    distributor_center: number;
    uploaded_by: number;
    created_at: string;
}

export interface UploadPreviewResponse {
    upload_id: number;
    file_name: string;
    row_count: number;
    pautas_count: number;
    pautas_preview: PautaPreview[];
    errors: string[];
    warnings: string[];
    missing_trucks?: string[];
}

export interface PautaPreview {
    transport_number: string;
    trip_number: string;
    truck_code: string;
    truck_plate: string;
    route_code: string;
    total_boxes: number;
    total_skus: number;
    full_pallets: number;
    assembled_fractions: number;
    complexity_score: number;
}

// ==================== PAUTAS ====================
export type PautaStatus =
    | 'PENDING_PICKING' | 'PICKING_ASSIGNED' | 'PICKING_IN_PROGRESS' | 'PICKING_DONE'
    | 'MOVING_TO_BAY' | 'IN_BAY' | 'PENDING_COUNT' | 'COUNTING' | 'COUNTED'
    | 'PENDING_CHECKOUT' | 'CHECKOUT_SECURITY' | 'CHECKOUT_OPS' | 'DISPATCHED'
    | 'IN_RELOAD_QUEUE' | 'PENDING_RETURN' | 'RETURN_PROCESSED'
    | 'IN_AUDIT' | 'AUDIT_COMPLETE' | 'CLOSED' | 'CANCELLED';

export interface PautaListItem {
    id: number;
    transport_number: string;
    trip_number: string;
    route_code: string;
    total_boxes: number;
    total_skus: number;
    total_pallets: number;
    status: PautaStatus;
    status_display: string;
    operational_date: string;
    is_reload: boolean;
    reentered_at: string | null;
    truck_plate: string;
    truck_code: string;
    created_at: string;
    last_status_change: string | null;
    status_started_at?: string | null;
    assigned_to: { name: string; role: string } | null;
    roles?: Record<string, { name: string; role_display: string; since: string | null }>;
    inconsistencies_count?: number;
    photos_count?: number;
    assembled_fractions?: number;
    bay_code: string | null;
    bay_id: number | null;
}

export interface PautaProductDetail {
    id: number;
    material_code: string;
    product_name: string;
    category: string;
    total_boxes: number;
    full_pallets: number;
    fraction: number;
}

export interface PautaDeliveryDetail {
    id: number;
    route_code: string;
    delivery_number: string;
    material_code: string;
    delivery_quantity: number;
}

export interface PautaAssignment {
    id: number;
    role: string;
    role_display: string;
    assigned_at: string;
    is_active: boolean;
    personnel_name: string;
    personnel_id: number;
    assigned_by_name: string;
}

export interface PautaTimestamp {
    id: number;
    event_type: string;
    event_type_display: string;
    timestamp: string;
    notes: string;
    recorded_by_name: string;
}

export interface Inconsistency {
    id: number;
    phase: 'VERIFICATION' | 'CHECKOUT' | 'RETURN' | 'AUDIT';
    inconsistency_type: 'FALTANTE' | 'SOBRANTE' | 'CRUCE' | 'DANADO';
    material_code: string;
    product_name: string;
    expected_quantity: number;
    actual_quantity: number;
    difference: number;
    notes: string;
    pauta: number;
    reported_by_name: string;
    created_at: string;
}

export interface PautaPhoto {
    id: number;
    phase: string;
    photo: string;
    description: string;
    pauta: number;
    uploaded_by_name: string;
    created_at: string;
}

export interface CheckoutValidation {
    id: number;
    security_validated: boolean;
    security_validated_at: string | null;
    ops_validated: boolean;
    ops_validated_at: string | null;
    exit_pass_consumables: boolean;
    notes: string;
    security_validator_name: string | null;
    ops_validator_name: string | null;
}

export interface PalletTicket {
    id: number;
    ticket_number: string;
    qr_code: string;
    is_full_pallet: boolean;
    box_count: number;
    scanned: boolean;
    scanned_at: string | null;
    pauta: number;
}

export interface BayAssignment {
    id: number;
    bay_code: string;
    bay_name: string;
    assigned_at: string;
    released_at: string | null;
}

export interface PautaDetail extends PautaListItem {
    truck: number;
    complexity_score: number;
    reload_count: number;
    notes: string;
    parent_pauta: number | null;
    product_details: PautaProductDetail[];
    delivery_details: PautaDeliveryDetail[];
    assignments: PautaAssignment[];
    timestamps: PautaTimestamp[];
    bay_assignment: BayAssignment | null;
    inconsistencies: Inconsistency[];
    photos: PautaPhoto[];
    checkout_validation: CheckoutValidation | null;
    pallet_tickets: PalletTicket[];
    truck_primary_driver_id: number | null;
    truck_primary_driver_name: string | null;
}

export interface WorkstationStatusGroup {
    label: string;
    count: number;
    pautas: PautaListItem[];
}

export interface WorkstationData {
    [status: string]: WorkstationStatusGroup;
}

export interface PickerStats {
    date: string;
    completed_count: number;
    total_boxes: number;
    avg_picking_minutes: number | null;
    boxes_per_hour: number | null;
    in_progress: {
        id: number;
        transport_number: string;
        total_boxes: number;
        started_at: string | null;
    } | null;
}

export interface CounterStats {
    date: string;
    completed_count: number;
    total_boxes: number;
    avg_counting_minutes: number | null;
    boxes_per_hour: number | null;
    in_progress: {
        id: number;
        transport_number: string;
        total_boxes: number;
        started_at: string | null;
    } | null;
}

export interface ValidatorStats {
    date: string;
    completed_count: number;
    total_boxes: number;
    avg_validation_minutes: number | null;
    pautas_per_hour: number | null;
}

export interface YardDriverStats {
    date: string;
    completed_count: number;
    total_boxes: number;
    avg_movement_minutes: number | null;
    boxes_per_hour: number | null;
    in_progress: {
        id: number;
        transport_number: string;
        total_boxes: number;
        started_at: string | null;
    } | null;
}

export interface VendorStats {
    date: string;
    trips_dispatched: number;
    trips_completed: number;
    active: number;
    total_boxes: number;
    active_trip: {
        id: number;
        transport_number: string;
        status: string;
        truck_code: string | null;
        dispatched_at: string | null;
        trip_started_at: string | null;
    } | null;
}

export interface KPISummary {
    operational_date: string;
    total_pautas: number;
    completed_pautas: number;
    avg_boxes_per_hour: number | null;
    avg_count_accuracy: number | null;
    avg_picking_error_rate: number | null;
    pautas_by_status: { status: string; count: number }[];
}

// ==================== FILTER PARAMS ====================
export interface PautaFilterParams {
    status?: string;
    operational_date_after?: string;
    operational_date_before?: string;
    truck?: number;
    transport_number?: string;
    is_reload?: boolean;
    assigned_role?: string;
    my_vendor_pautas?: boolean;
    limit?: number;
    offset?: number;
}

export interface TruckFilterParams {
    is_active?: boolean;
    limit?: number;
    offset?: number;
}
