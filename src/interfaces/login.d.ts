export interface Usuario {
    usuarioId: number;
    correo: string;
    nombre: string;
    apellido: string;
    grupos: number[];
    activo: boolean;
}

export interface LoginResponse {
    success: boolean;
    usuario: Usuario;
    token: string;
}

export interface LoginResponseOk {
    user:  User;
    token: Token;
}

export interface Token {
    access:  string;
    refresh: string;
    exp:     number;
}

export interface User {
    id:                  string;
    list_groups:         string[];
    list_permissions:    string[];
    centro_distribucion: number | null;
    is_superuser:        boolean;
    centro_distribucion_name: string;
    username:            string;
    is_staff:            boolean;
    is_active:           boolean;
    date_joined:         string | null;
    first_name:          string;
    last_name:           string;
    email:               string;
    created_at:          string | null;
    groups:              number[];
    user_permissions:    string[];
}

export interface LoginBody {
    email: string;
    password: string;
}


export interface DashboardResponse {
    total_trackers_completed: number;
    total_trackers_pending:   TotalTrackersPending[];
    time_average:             number;
}

export interface TotalTrackersPending {
    created_at: Date;
    status:     string;
    id:         number;
}


export interface DashboardQueryParams {
    start_date?: string;
    end_date?:   string;
}

