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


//groups

export interface Group {
    id:               number;
    group:            GroupClass;
    requiered_access: boolean;
}

export interface GroupClass {
    id:          number;
    permissions: Permission[];
    name:        string;
}

export interface Permission {
    id:           number;
    content_type: ContentType;
    name:         string;
    codename:     string;
}

export interface ContentType {
    id:        number;
    app_label: AppLabel;
    model:     string;
}

export enum AppLabel {
    Admin = "admin",
    Auth = "auth",
    Contenttypes = "contenttypes",
    Maintenance = "maintenance",
    Sessions = "sessions",
    Tracker = "tracker",
    User = "user",
}


//gorups response
export interface GroupsResponse {
    count:    number;
    next:     Group | null;
    previous: Group | null;
    results:  Result[];
}