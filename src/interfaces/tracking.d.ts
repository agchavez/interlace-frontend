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


  

  interface CheckFormType {
    plateNumber: string;
    originLocation: string;
    driver?: number;
    documentNumber: number;
    transportNumber: number;
    transferNumber: number;
    documentNumberExit: number;
    timeStart: Date | null;
    timeEnd: Date | null;
    opm1?: number;
    opm2?: number;

  }