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
  tracker_detail_product: number;
}

export type EditableOrderDetailCreateBody = Omit<
  OrderDetailCreateBody,
  "order"
>;

export interface OrderDetail {
  id: number | null;
  order_detail_history: OrderDetailHistory[];
  product_data: ProductData | null;
  tracking_id: number;
  expiration_date: string;
  created_at: string;
  quantity: number;
  quantity_available: number;
  order: number;
  tracker_detail_product: number;
}

export interface OrderDetailCreateBody {
  quantity: number;
  order_: number;
  tracker_detail_product: number;
  expiration_date: string;
}

export interface OrderDetailHistory {
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
