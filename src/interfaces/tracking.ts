import { BaseQueryParams, LocationType } from './maintenance';
export interface Rastra {
  id: number;
  transportista: string;
  placa: string;
  tractor: string;
  cabezal: string;
}

export interface Product {
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
}


export interface ProductQuerySearch extends BaseQueryParams {
  search?: string;
  id?: number;
  bar_code?: string;
  is_output?: boolean;
}

export interface OutputType {
  id: number;
  created_at_date: string;
  created_at_time: string;
  name: string;
  required_details: boolean;
}


export interface OutputTypeQuerySearch extends BaseQueryParams {
  search?: string;
}



export interface CheckFormType {
  plateNumber: string;
  driverImport: string | null;
  originLocation: number;
  outputLocation: number;
  driver?: number | null;
  invoiceNumber: string | null;
  containernumber: number | null;
  documentNumber: number;
  transportNumber: number;
  transferNumber: number;
  documentNumberExit: number;
  outputType: string;
  timeStart: string | null;
  timeEnd: string | null;
  opm1?: number;
  opm2?: number;
  accounted: number | null;
}

// Tracker
export interface Tracker {
  id: number;
  driver_import: string | null;
  tariler_data: TarilerData;
  transporter_data: TransporterData;
  distributor_center_data: DistributorCenterData;
  user_name: string;
  tracker_detail: TrackerDetailResponse[];
  created_at: string;
  plate_number: string;
  input_document_number: number;
  output_document_number: number;
  transfer_number: number;
  accounted: number;
  input_date: string | null;
  output_date: string | null;
  time_invested: null;
  invoice_number: string | null;
  container_number: number | null;
  status: string;
  trailer: number;
  transporter: number;
  user: number;
  distributor_center: number;
  origin_location: number | null;
  destination_location: number | null;
  operator_1: number | null;
  operator_2: number | null;
  driver: number | null;
  output_type: number;
  completed_date: string | null;
  type: 'LOCAL' | 'IMPORT';
  location_data: LocationType | null;
  tracker_detail_output: TrackerDeailOutput[]
}

export enum FilterDate {
  TODAY = 'Hoy',
  WEEK = 'Esta semana',
  MONTH = 'Este mes',
  YEAR = 'Este año',
}
export interface TrackerQueryParams extends BaseQueryParams {
  search?: string;
  id?: number;
  transporter?: number[];
  trailer?: number[];
  distributor_center?: number[];
  user?: number[];
  date_after?: string;
  date_before?: string;
  status?: 'COMPLETE' | 'PENDING' | 'EDITED';
  filter_date?: FilterDate;
  onlyMyTreckers?: boolean;
}

export interface TrackerProductDetailQueryParams extends BaseQueryParams {
  search?: string;
  id?: number;
  tracker_detail?: number;
  tracker_detail__tracker?: number;
  tracker_detail__tracker__distributor_center?: number;
  tracker_detail__tracker__status?: 'COMPLETE' | 'PENDING' | 'EDITED';
  tracker_detail__tracker__user?: string;
  created_at__gte?: string;
  created_at__lte?: string;
  order_by?: string;
}

export interface LastTrackerOutputQueryParams {
  limit?: number;
}

export interface TrackerDeailOutput {
  id: number;
  product_data: ProductData;
  created_at: string;
  quantity: number;
  tracker: number;
  product: number;
  expiration_date: string;
}
export interface DistributorCenterData {
  id: number;
  name: string;
  direction: string;
  country_code: string;
}

export interface TarilerData {
  id: number;
  created_at: string | null;
  code: string;
}

export interface TransporterData {
  id: number;
  created_at: null;
  name: string;
  code: string;
  tractor: string;
  head: string;
}

export interface CreateTrackingBody {
  trailer: number;
  transporter: number;
  type: string;
}

export interface AddDetalleBody {
  quantity: number;
  tracker: number;
  product: number;
}

export interface AddDetalleData {
  quantity: number;
  product: Product
}

export interface AddDetallePalletData {
  expiration_date: string | null,
  quantity: number | null,
  tracker_detail: number | null
}

export interface UpdateDetallePalletData extends Partial<AddDetallePalletData> {
  id: number,
  tracker_detail: number
}

export interface AddDetallePalletResponse {
  id: number;
  created_at: string;
  expiration_date: string;
  quantity: number;
  tracker_detail: number;
  product_name: string;
  product_sap_code: string;
  tracker_detail_id: number;
  tracker_id: number;

}

export interface TrackerDetailResponse {
  id: number;
  tracker_product_detail: TrackerProductDetail[];
  product_data: ProductData;
  created_at: string;
  quantity: number;
  tracker: number;
  product: number;
}

export interface ProductData {
  id: number;
  created_at: null;
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

}

export interface TrackerProductDetail {
  id: number;
  created_at: string;
  expiration_date: string;
  quantity: number;
  tracker_detail: number;
  product_name: string;
  product_sap_code: string;
  tracker_detail_id: number;
  tracker_id?: number;
}

export interface LastTrackerOutput {
  required_details: boolean;
  tracking?: number;
  sap_code?: string;
  product_name?: string;
  quantity?: number;
  expiration_date?: Date;
  output_type_name: string;
}

export interface AddOutProductData {
  tracker: number;
  product: Product;
  quantity: number;
  expiration_date: string;
}

export interface AddOutProductBody {
  tracker: number;
  product: number;
  quantity: number;
  expiration_date: string;
}

