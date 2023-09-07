export interface RegisterUserForm {
    fistName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    group: string;
    cd?: string;
}


export type UserResponse = {
    count?:    number;
    next?:     string;
    previous?: string;
    results?:  User[];
}

export interface CreateUserResponse {
    id:                  number;
    list_groups:         any[];
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
    codigo_empleado:     number;
    groups:              any[];
    user_permissions:    any[];
}

export interface CreateUserBody {
    centro_distribucion: number;
    password: string;
    is_superuser: boolean;
    username: string;
    is_staff: boolean;
    is_active: boolean;
    first_name: string;
    last_name: string;
    email:string;
    codigo_empleado: number;
    group: number;
}

export type User = {
    id?:                 number;
    listGroups?:         string[];
    listPermissions?:    string[];
    centroDistribucion?: null;
    lastLogin?:          Date;
    isSuperuser?:        boolean;
    username?:           string;
    isStaff?:            boolean;
    isActive?:           boolean;
    dateJoined?:         Date;
    firstName?:          string;
    lastName?:           string;
    email?:              string;
    codigoEmpleado?:     null;
    createdAt?:          Date;
    groups?:             string[];
    userPermissions?:    string[];
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