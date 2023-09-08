export interface BaseaAPIResponse<T> {
    previous?: string;
    next?: string;
    count?: number;
    results: T[];
}

export interface BaseQueryParams {
    limit?: number;
    offset?: number;   
}

export interface Trailer {
    id:            number;
    transporter:   Transporter;
    createdAtDate: Date;
    createdAtTime: string;
    code:          string;
}


export interface TrailerQuerySearch extends BaseQueryParams {
    search?: string;
    transporter?: number;
    id?: number;
}
export interface Transporter {
    id:            number;
    createdAtDate: Date;
    createdAtTime: string;
    name:          string;
    code:          string;
    tractor:       string;
    head:          string;
}

export interface DistributionCenter {
    id:           number;
    name:         string;
    direction:    string;
    country_code: string;
}

export interface Operator {
    id:                      number;
    distributor_center_name: string;
    created_at_date:         Date;
    created_at_time:         string;
    first_name:              string;
    last_name:               string;
    distributor_center:      number;
}


export interface OperatorQuerySearch extends BaseQueryParams {
    search?: string;
    distributorCenter?: number;
    id?: number;
}


export interface Driver {
    id:              number;
    created_at_date: Date;
    created_at_time: string;
    first_name:      string;
    last_name:       string;
    code:            string;
    sap_code:        string;
}


export interface DriverQuerySearch extends BaseQueryParams {
    search?: string;
    id?: number;
}

export interface LocationType {
    id:                       number;
    distributor_center_name?: string;
    created_at_date:          Date;
    created_at_time:          string;
    name:                     string;
    code:                     string;
    distributor_center:       number | null;
}


export interface LocationTypeQuerySearch extends BaseQueryParams {
    search?: string;
    id?: number;
}


