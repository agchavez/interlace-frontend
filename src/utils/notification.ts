// src/mockData/notificaciones.ts

export interface Notificacion {
    id: number;
    creado: string;
    modificado: string;
    tipo: string;
    titulo: string;
    subtitulo: string;
    descripcion: string;
    leido: boolean;
    identificador: number;
    url: string;
    modulo: string;
    json: Record<string, any>;
    html: string | null;
    usuario: number;
}

// Este es el array de ejemplo que proporcionaste (lo copio tal cual).
export const notificacionesMock: Notificacion[] = [
    {
        "id": 140,
        "creado": "2025-02-11T15:03:09.704459-06:00",
        "modificado": "2025-02-11T15:05:46.097700-06:00",
        "tipo": "CONFIRMACION",
        "titulo": "Confirmación de cambio de ubicación",
        "subtitulo": "Documento #291, Certificados de Acciones/Participaciones",
        "descripcion": "El usuario Gabriel Chavez Vigil ha confirmado su solicitud de cambio de ubicación ...",
        "leido": true,
        "identificador": 291,
        "url": "/documentos/291?ubicacion=true",
        "modulo": "DOCUMENTOS",
        "json": { /* ... */ },
        "html": null,
        "usuario": 5
    },
    {
        "id": 139,
        "creado": "2025-02-11T15:02:14.707749-06:00",
        "modificado": "2025-02-11T15:03:39.986933-06:00",
        "tipo": "UBICACION",
        "titulo": "Solicitud de custodia de documento",
        "subtitulo": "Documento #291, Certificados ...",
        "descripcion": "El usuario Gabriel Chavez Vigil ha solicitado un cambio ...",
        "leido": true,
        "identificador": 291,
        "url": "/documentos/291?ubicacion=true",
        "modulo": "DOCUMENTOS",
        "json": { /* ... */ },
        "html": null,
        "usuario": 5
    },
    // ... resto de notificaciones ...
    {
        "id": 80,
        "creado": "2024-10-18T11:35:01.422393-06:00",
        "modificado": "2024-11-15T12:06:05.866439-06:00",
        "tipo": "ALERTA",
        "titulo": "Alerta Escritura de Constitución",
        "subtitulo": "Alerta programada de documento",
        "descripcion": "Esta alerta fue programada para el documento ID#1 de tipo Escritura de Constitución",
        "leido": true,
        "identificador": 1,
        "url": "/documentos/1?alerta=true",
        "modulo": "DOCUMENTOS",
        "json": {},
        "html": "<h2>Revisar Información</h2><p>Se le notifica ...</p>",
        "usuario": 5
    }
];
