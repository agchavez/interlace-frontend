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
    username:            string;
    is_staff:            boolean;
    is_active:           boolean;
    date_joined:         Date | null;
    first_name:          string;
    last_name:           string;
    email:               string;
    created_at:          Date | null;
    groups:              number[];
    user_permissions:    string[];
}

export interface LoginBody {
    email: string;
    password: string;
}

