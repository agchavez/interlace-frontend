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
    product: number;
    product_name: string;
    distributor_center: number;
    distributor_center_data: DistributorCenter;
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
    distributor_center?: number;
    id?: number;
    location?: number;
}

export type PeriodLabel = "A" | "B" | "C"

export interface LotType {
    id:                 number;
    created_at:         Date;
    code:               string;
    distributor_center: number;
}

export interface LotTypeQuerySearch extends BaseQueryParams {
    search?: string;
    distributorCenter?: number;
    id?: number;
}

export interface LotBody {
    code: string;
    distributor_center: number;
}

// interfaces.ts

/** Interfaz del país, tal como lo devuelve tu API de /api/country/ */
export interface CountryType {
    id: number;
    created_at: string;
    name: string;
    code: string;
    flag: string; // p.ej "hn"
}

/** Interfaz del Centro de Distribución (DistributorCenter).
 *  Notar que data_country es un objeto con la info del país,
 *  y country es su ID numérico.
 */
export interface DistributorCenter {
    id: number;
    data_country: CountryType;
    name: string;
    direction: string;
    country_code?: string;
    country?: number; // ID del país
    location_distributor_center_code: string;
}


export interface CountryQueryParams extends BaseQueryParams{

    search: string;
}

/** Parámetros para la query de distributorCenters */
export interface DistributorCenterQueryParams extends BaseQueryParams {

    search: string;
}

// Parámetros de búsqueda / paginación para Period
export interface PeriodQueryParams extends  BaseQueryParams{
    search?: string;
}
