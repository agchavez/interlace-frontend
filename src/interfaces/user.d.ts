export interface RegisterUserForm {
    fistName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    group: string;
    cd?: string;
    employee_number?: number;
    distributions_centers: number[];
}


export type UserResponse = {
    count?:    number;
    next?:     string;
    previous?: string;
    results?:  User[];
}

export interface CreateUserResponse {
    id:                  number;
    list_groups:         string[];
    list_permissions:    string[];
    date_joined:         Date;
    last_login:          null;
    created_at:          Date;
    centro_distribucion: number;
    is_superuser:        boolean;
    username:            string;
    is_staff:            boolean;
    is_active:           boolean;
    first_name:          string;
    last_name:           string;
    email:               string;
    employee_number:     number;
    groups:              string[];
    user_permissions:    string[];
    distributions_centers: number[];
}

export interface CreateUserBody {
    centro_distribucion?: number;
    password: string;
    is_superuser: boolean;
    username: string;
    is_staff: boolean;
    is_active: boolean;
    first_name: string;
    last_name: string;
    email:string;
    employee_number?: number;
    group: number;
    distributions_centers: number[];
}

export type User = {
    id?:                 number;
    listGroups?:         string[];
    listPermissions?:    string[];
    centroDistribucion?: number;
    lastLogin?:          Date;
    isSuperuser?:        boolean;
    username?:           string;
    isStaff?:            boolean;
    isActive?:           boolean;
    dateJoined?:         Date;
    firstName?:          string;
    lastName?:           string;
    email?:              string;
    employee_number?:    number | null;
    createdAt?:          Date;
    groups?:             number[];
    userPermissions?:    string[];
    distributions_centers: number[];
    personnel_profile_id?: number | null;
    photo_url?:          string | null;
}

export interface UserQuerySearch {
    limit?: number;
    offset?: number;
    search?: string;
}

export interface GetDistributionCenterResponse {
    id: number,
    name: string,
    direction: string,
    country_code: number
}

export interface GetAUserResponse {
    id:                       number;
    list_groups:              string[];
    list_permissions:         string[];
    date_joined:              Date;
    last_login:               null;
    created_at:               Date;
    centro_distribucion:      number;
    centro_distribucion_name: string;
    is_superuser:             boolean;
    username:                 string;
    is_staff:                 boolean;
    is_active:                boolean;
    first_name:               string;
    last_name:                string;
    email:                    string;
    codigo_empleado:          number;
    employee_number:          number;
    groups:                   number[];
    user_permissions:         string[];
    distributions_centers:    number[];
    personnel_profile_id:     number | null;
    photo_url:                string | null;
}