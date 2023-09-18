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
}

export interface ProductQuerySearch extends BaseQueryParams {
  search?: string;
  id?: number;
  bar_code?: string;
}

export interface OutputType {
  id: number;
  created_at_date: Date;
  created_at_time: string;
  name: string;
  required_details: boolean;
}


export interface OutputTypeQuerySearch extends BaseQueryParams {
  search?: string;
}



  interface CheckFormType {
    plateNumber: string;
    originLocation: number;
    outputLocation: number;
    driver?: number;
    documentNumber: number;
    transportNumber: number;
    transferNumber: number;
    documentNumberExit: number;
    outputType: number;
    timeStart: Date | null;
    timeEnd: Date | null;
    opm1?: number;
    opm2?: number;
    accounted: number | null;
  }

// Tracker
export interface Tracker {
  id: number;
  tariler_data: TarilerData;
  transporter_data: TransporterData;
  distributor_center_data: DistributorCenterData;
  user_name: string;
  tracker_detail: TrackerDetailResponse[];
  created_at: Date;
  plate_number: string;
  input_document_number: number;
  output_document_number: number;
  transfer_number: number;
  accounted: number;
  input_date: string | null;
  output_date: string | null;
  time_invested: null;
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
  location_data: LocationType | null;
  tracker_detail_output: TrackerDeailOutput[]
}
export interface TrackerDeailOutput {
  id:           number;
  product_data: ProductData;
  created_at:   string; 
  quantity:     number;
  tracker:      number;
  product:      number;
}
export interface DistributorCenterData {
  id: number;
  name: string;
  direction: string;
  country_code: string;
}

export interface TarilerData {
  id: number;
  created_at: Date | null;
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
    expiration_date: Date | null,
    quantity: number | null,
    tracker_detail: number | null
}

export interface UpdateDetallePalletData extends Partial<AddDetallePalletData> {
  id: number,
  tracker_detail: number
}

export interface AddDetallePalletResponse {
  id: number,
  created_at: string,
  expiration_date: string,
  quantity: number,
  tracker_detail: number
}

export interface TrackerDetailResponse {
  id:                     number;
  tracker_product_detail: TrackerProductDetail[];
  product_data:           ProductData;
  created_at:             string;
  quantity:               number;
  tracker:                number;
  product:                number;
}

export interface ProductData {
  id:               number;
  created_at:       null;
  name:             string;
  sap_code:         string;
  brand:            string;
  boxes_pre_pallet: number;
  useful_life:      number;
  bar_code:         string;
}

export interface TrackerProductDetail {
  id:              number;
  created_at:      string;
  expiration_date: string;
  quantity:        number;
  tracker_detail:  number;
}

export interface AddOutProductData {
  tracker: number;
  product: Product;
  quantity: number;
}

export interface AddOutProductBody {
  tracker: number;
  product: number;
  quantity: number;
}