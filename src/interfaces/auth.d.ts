import { BaseApiParams } from './api';
export interface VerifyTokenResp {
    access_token: string;
    response: {
        id: number;
    }
  }


  export interface AccesosEmpreas {
    pais:     string;
    id_pais:  number;
    empresas: EmpresaAcc[];
}

export interface EmpresaAcc {
    empresa:    string;
    id_empresa: number;
    modulos:    Modulo[];
}

export interface Modulo {
    modulo:  string;
    accesos: Acceso[];
}

export interface Acceso {
    tipo_documento: number;
    id:          number;
    key:         string;
    descripcion: string;
    leer:        boolean;
    crear:       boolean;
    editar:      boolean;
    eliminar:    boolean;
}


export interface AccessBody {
    usuarios:       number[];
    empreasas:      number[];
    delete_accesos: string[];
    proceso:       'TODOS' | 'USUARIO' | 'GRUPO';
    accesos:        AccesoDetail[];
}

export interface AccesoDetail {
    acceso:   number;
    leer:     boolean;
    editar:   boolean;
    eliminar: boolean;
    crear:    boolean;
}


type tipoNotificacion = 'UBICACION' | 'ALERTA' | 'RECORDATORIO' | 'TAREA' | 'MENSAJE' | 'OTRO';
type moduloNotificacion = 'DOCUMENTO' | 'OTRO';
export interface Notificacion {
    id:            number;
    creado:        string;
    type:          tipoNotificacion;
    title:        string;
    subtitle:     string;
    description:   string;
    read:         boolean;
    identifier: null;
    url:           null;
    module:        moduloNotificacion;
    user:       number;
    html:          string;
    json:        {
        [key: string]: string | number | boolean | Date | string[] | number[] | {
            [key: string]: string | number | boolean | Date
        }
    };
}


export interface NotificacionQuery  extends BaseApiParams {
    id?: number;
    read?: boolean;
    search?: string;
    user: number;
    created_at?: string;
    created_at__gte?: string;
    created_at__lte?: string;
}