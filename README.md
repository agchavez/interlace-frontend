<p align="center">
  <img src="src/assets/logo.png" alt="Tracker Logo" width="200"/>
</p>

<h1 align="center">Tracker Frontend</h1>

<p align="center">
  <strong>Sistema de Gestión y Seguimiento de Operaciones Logísticas</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-4.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/MUI-5.14-007FFF?style=for-the-badge&logo=mui&logoColor=white" alt="Material UI"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Estado-Activo-success?style=flat-square" alt="Estado"/>
  <img src="https://img.shields.io/badge/Licencia-Propietaria-red?style=flat-square" alt="Licencia"/>
  <img src="https://img.shields.io/badge/Acceso-Privado-critical?style=flat-square" alt="Acceso"/>
</p>

---

## Aviso Legal

> **Este es un proyecto de software propietario y confidencial.**
>
> Todos los derechos reservados. El código fuente, diseño, documentación y cualquier material relacionado son propiedad exclusiva de **AC Solutions**. Queda estrictamente prohibida la reproducción, distribución, modificación o uso no autorizado de cualquier parte de este software sin el consentimiento expreso por escrito del propietario.

---

## Descripción

**Tracker** es una aplicación web empresarial diseñada para la gestión integral de operaciones logísticas. Proporciona herramientas avanzadas para el seguimiento de productos, gestión de inventarios, control de órdenes y generación de reportes en tiempo real.

### Características Principales

- **Seguimiento en Tiempo Real** - Monitoreo de productos y envíos mediante WebSockets
- **Gestión de Inventario** - Control completo de stock con ajustes y transferencias
- **Sistema de Órdenes** - Administración de pedidos con escaneo de códigos QR
- **Reportes Avanzados** - Generación de informes y exportación a PDF/Excel
- **Dashboard Analítico** - Visualización de métricas con gráficos interactivos
- **Gestión de Reclamos** - Sistema de tickets para seguimiento de incidencias
- **Control de Usuarios** - Administración de permisos y roles

---

## Stack Tecnológico

### Core
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| React | 18.2.0 | Biblioteca UI |
| TypeScript | 5.0 | Tipado estático |
| Vite | 4.4 | Build tool |

### UI/UX
| Tecnología | Descripción |
|------------|-------------|
| Material UI | Componentes de interfaz |
| Emotion | Estilos CSS-in-JS |
| SASS | Preprocesador CSS |
| Sonner | Notificaciones toast |

### Estado y Datos
| Tecnología | Descripción |
|------------|-------------|
| Redux Toolkit | Gestión de estado global |
| React Hook Form | Manejo de formularios |
| Yup | Validación de esquemas |
| Axios | Cliente HTTP |

### Funcionalidades
| Tecnología | Descripción |
|------------|-------------|
| React Router DOM | Enrutamiento SPA |
| Chart.js | Gráficos y visualizaciones |
| React PDF | Generación de documentos |
| html5-qrcode | Escaneo de códigos QR |
| xlsx | Exportación a Excel |
| WebSocket | Comunicación en tiempo real |

---

## Arquitectura del Proyecto

```
src/
├── assets/              # Recursos estáticos (imágenes, logos)
├── config/              # Configuraciones de la aplicación
├── hooks/               # Custom hooks reutilizables
├── interfaces/          # Definiciones de tipos TypeScript
├── modules/             # Módulos de la aplicación
│   ├── auth/            # Autenticación y sesiones
│   ├── claim/           # Gestión de reclamos
│   ├── home/            # Dashboard principal
│   ├── inventory/       # Control de inventario
│   ├── maintenance/     # Mantenimiento del sistema
│   ├── order/           # Gestión de órdenes
│   ├── report/          # Generación de reportes
│   ├── tracker/         # Seguimiento de productos
│   ├── tracker_t2/      # Seguimiento avanzado T2
│   ├── ui/              # Componentes UI reutilizables
│   └── user/            # Gestión de usuarios
├── store/               # Estado global (Redux)
├── style/               # Estilos globales SCSS
└── utils/               # Utilidades y helpers
```

---

## Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x o **yarn** >= 1.22
- Acceso al repositorio privado
- Variables de entorno configuradas

---

## Instalación

```bash
# Clonar el repositorio (requiere acceso autorizado)
git clone https://github.com/agchavez/tracker-frontend.git

# Navegar al directorio
cd tracker-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.template .env
# Editar .env con los valores correspondientes
```

---

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo en el puerto 3000 |
| `npm run build` | Compila TypeScript y genera build de producción |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | Ejecuta ESLint para análisis de código |

---

## Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_JS_APP_API_URL=       # URL de la API backend
VITE_JS_APP_API_URL_WS=    # URL del WebSocket
VITE_JS_FRONTEND_URL=      # URL del frontend
VITE_JS_APP_NAME=          # Nombre de la aplicación
VITE_JS_APP_VERSION=       # Versión de la aplicación
```

---

## Estructura de Módulos

### Auth
Manejo de autenticación, login, logout y gestión de sesiones con temporizador de inactividad.

### Home
Dashboard principal con métricas, gráficos TAT (Turn Around Time) y tablas de resumen operativo.

### Tracker
Sistema de seguimiento de productos con visualización de rutas, impresión de pallets y códigos QR.

### Inventory
Gestión de inventario con ajustes, transferencias y control de lotes.

### Order
Administración de órdenes con escaneo QR y gestión de estados.

### Report
Generación de reportes de turno, productos próximos a vencer y exportación a múltiples formatos.

### Claim
Sistema de gestión de reclamos con archivos adjuntos y seguimiento de tickets.

---

## Despliegue

La aplicación está configurada para despliegue en **Azure Static Web Apps** mediante CI/CD automatizado.

```bash
# Build de producción
npm run build

# Los archivos se generan en /dist
```

---

## Contacto

Para solicitar acceso o información adicional sobre este proyecto, contactar al equipo de desarrollo de **AC Solutions**.

---

<p align="center">
  <sub>Desarrollado con React + TypeScript</sub>
</p>

<p align="center">
  <strong>© 2024-2026 AC Solutions. Todos los derechos reservados.</strong>
</p>
