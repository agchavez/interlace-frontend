import { LocationType } from "./maintenance";

export interface Order {
  id: number;
  order_detail: OrderDetail[];
  created_at: string;
  status: OrderStatusType;
  observations: string;
  distributor_center: number;
  user: number;
  location: number;
  location_data: LocationType
}

export type OrderStatusType = "PENDING" | "IN_PROCESS" | "COMPLETED";

export interface OrderCreateBody {
  status: OrderStatusType;
  observations: string;
  distributor_center: number;
  user: number;
  location: number;
}

export interface LocationRouteCreateData {
  name: string;
  code: string;
  distributor_center: number;
  routeCode: string;
}


export type EditableOrderCreateBody = Omit<
  OrderCreateBody,
  "distributor_center" | "user"
>;

export interface OrderDetailCreateBody {
  quantity: number;
  order: number;
  // FUNCIONALIDAD HÍBRIDA: Solo uno de estos debe estar presente
  tracker_detail_product?: number;
  // Nuevos campos para producto directo
  product?: number;
  distributor_center?: number;
  expiration_date?: string;
}

export type EditableOrderDetailCreateBody = Omit<
  OrderDetailCreateBody,
  "order"
>;

export interface OrderDetail {
  id: number | null;
  order_detail_history: OrderDetailHistory[];
  product_data: ProductData | null;
  tracking_id: number | null;
  expiration_date: string;
  expiration_date_display: string;
  created_at: string;
  quantity: number;
  quantity_available: number;
  order: number;
  // FUNCIONALIDAD HÍBRIDA: Campos para tracker (actual)
  tracker_detail_product: number | null;
  // FUNCIONALIDAD HÍBRIDA: Campos para producto directo (nuevo)
  product: number | null;
  distributor_center: number | null;
}

export interface OrderDetailCreateBodyLegacy {
  quantity: number;
  tracker_detail_product: number;
  expiration_date: string;
  order_detail_id: number;
}

// FUNCIONALIDAD HÍBRIDA: Nuevos tipos para ambos modos
export type OrderDetailMode = "tracker" | "direct";

export interface OrderDetailHybridForm {
  mode: OrderDetailMode;
  quantity: number;
  // Campos para modo tracker (actual)
  idTracker?: number;
  idTrackerDetail?: string;
  idTrackerDetailProduct?: string;
  tracker_detail_product?: number;
  expiration_date?: string;
  // Campos para modo directo (nuevo)
  product?: number;
  distributor_center?: number;
  manual_expiration_date?: string;
}

export interface DirectProductInventory {
  id: number;
  product: ProductData;
  distributor_center: number;
  expiration_date: string;
  total_quantity: number;
  available_quantity: number;
  reserved_quantity: number;
}

export interface OrderDetailHistory {
  id?: number;
  created_at: string;
  quantity: number;
  order_detail: number;
  tracker: number;
}

export interface OrderDetailHistoryUtil extends OrderDetailHistory {
  id: number;
  created_at: string;
  quantity: number;
  order_detail: number;
  tracker: number;
}

export interface ProductData {
  id: number;
  created_at: string;
  name: string;
  sap_code: string;
  brand: string;
  boxes_pre_pallet: number;
  useful_life: number;
  bar_code: string;
  standard_cost: string;
  pre_block: number;
  block: number;
  pre_block_days: number;
  pre_block_days_next: number;
  block_days: number;
  code_feature: string;
  division: string;
  class_product: string;
  size: string;
  packaging: string;
  helectrolitos: string;
  hl_per_unit: string;
  concadenated_type: string;
  cost: string;
  description_sap: string;
  lib_to_ton: string;
  weight: string;
  ton: string;
  block_t1: number;
  days_not_accept_product: number;
  is_output: boolean;
}


export interface OrderExcelResponse {
  order:        Order;
  order_detail: OrderDetail[];
  errors:       Error[];
}

export interface Error {
  tracker_id:        number;
  codigo_sap:        number;
  fecha_vencimiento: Date;
  cantidad:          number;
}


export type FleetType = "PROPIEDAD" | "TERCERA"
export type OutOrderType = "T1" | "T2"
export interface OutOrderData {
  order: number;
  fleet: FleetType;
  type: OutOrderType;
  document_number: string;
  document?: File;
  document_name?: string;
  vehicle: string;
}

export interface OutOrderBody {
  order: number;
  fleet: FleetType;
  type: OutOrderType;
  document_number: string;
  document?: File;
}

export interface OutOrder {
  id: number;
  created_at: string;
  fleet: FleetType;
  type: OutOrderType;
  document_number: string;
  document_name: string|null;
  order: number;
  vehicle: string;
}