import { BaseQueryParams } from './maintenance';
export interface Rastra {
    id: number;
    transportista: string;
    placa: string;
    tractor: string;
    cabezal: string;
}

export interface Product {
    id:               number;
    created_at_date:  Date;
    created_at_time:  string;
    name:             string;
    sap_code:         string;
    brand:            string;
    boxes_pre_pallet: number;
    useful_life:      number;
    bar_code:         string;
}

export interface ProductQuerySearch extends BaseQueryParams {
    search?: string;
    id?: number;
    bar_code?: string;
}

export interface OutputType {
  id:               number;
  created_at_date:  Date;
  created_at_time:  string;
  name:             string;
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