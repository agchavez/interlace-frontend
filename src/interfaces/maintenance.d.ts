export interface BaseaAPIResponse<T> {
    previous?: string;
    next?: string;
    count?: number;
    results: T[];
}

export interface BaseQueryParams {
    limit: number;
    offset: number;   
}

export interface Trailer {
    id:            number;
    createdAtDate: string;
    createdAtTime: string;
    code:          string;
}


export interface TrailerQuerySearch extends BaseQueryParams {
    search?: string;
    transporter?: number;
    id?: number;
}
export interface TransporterQuerySearch extends BaseQueryParams {
    search?: string;
    id?: number;
}
export interface Transporter {
    id:            number;
    createdAtDate: string;
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
    created_at_date:         string;
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
    created_at_date: string;
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
    created_at_date:         string;
    created_at_time:          string;
    name:                     string;
    code:                     string;
    distributor_center:       number | null;
}

export interface CreateLocationBody {
    name:                     string;
    code:                     string;
}

export interface CreateRouteBody {
    code:                     string;
    distributor_center:                     number;
    location:                     number;
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

export interface LocationTypeQuerySearch extends BaseQueryParams {
    search?: string;
    id?: number;
}

export interface ProductPeriodQueryParams {
    product?: number;
}

//gorups response
export interface GroupsResponse {
    count:    number;
    next:     Group | null;
    previous: Group | null;
    results:  Result[];
}

export interface Period {
    id: number;
    created_at: string;
    label: "A" | "B" | "C";
    initialDate: string;
    finalDate: string;
    year: number;
    distributor_center: number;
}
export interface Route {
    id:                      number;
    distributor_center_name: string;
    location_name:           string;
    created_at:              Date;
    code:                    string;
    distributor_center:      number;
    location:                number;
}

export interface RouteQuerySearch extends BaseQueryParams {
    search?: string;
    distributorCenter?: number;
    id?: number;
    location?: number;
}

export type PeriodLabel = "A" | "B" | "C"