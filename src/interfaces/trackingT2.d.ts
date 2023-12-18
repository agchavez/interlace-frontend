
import { DistributorCenterData } from "./tracking";
import { BaseQueryParams } from './maintenance';

export interface OutputT2 {
    id:                   number;
    output_detail_t2:     OutputDetailT2[];
    count_details:        number | undefined;
    distributor_center_data: DistributorCenterData;
    user_name:            string;
    user_authorizer_name: null;
    user_applied_name:    null;
    user_check_name:    null;
    last_update:         Date;
    created_at:           Date;
    status:               Status;
    observations:         string | null;
    user:                 number;
    user_authorizer:      null;
    user_applied:         null;
    distributor_center:   number;
}

export interface OutputT2QueryParams extends BaseQueryParams {
    distributor_center?: number;
    date_after?: string;
    date_before?: string;
    status: Status[];
    id?: number;
}

export interface OutputDetailT2 {
    id:               number;
    product_name:     string;
    product_sap_code: string;
    details:          {
        total_quantity: number;
        details: OutputDetailT2Detail[]
    };
    created_at:       Date;
    quantity:         string;
    observations:     null;
    status:           Status;
    output:           number;
    product:          number;
}

export interface OutputDetailT2Detail {
    expiration_date: Date;
    quantity:        number;
    lote:            number | null;
    code_name:       string | null;
    details:         DetailDetail[];
}

export interface DetailDetail {
    id:             number;
    created_at:     Date;
    quantity:       string;
    output_detail:  number;
    tracker_detail: number;
    tracker_id:     number;
    lote:           number | null;
    code_name:      string | null;
}

export type Status = "CREATED" | "APPLIED" | "CHECKED" | 'REJECTED' | 'AUTHORIZED'

export interface DatesT2Tracking {
    expiration_date: Date;
    total:           number;
    details:         Detail[];
}



export interface DetailDatesT2Tracking {
    id:                 number;
    available_quantity: number;
    tracker_id:         number;
}


export interface T2TrackingDetailBody {
    list:        ListT2TrackingDetail[];
    list_delete: number[];
}

export interface ListT2TrackingDetail {
    quantity:               number;
    tracker_detail_product: number;
}