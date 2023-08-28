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