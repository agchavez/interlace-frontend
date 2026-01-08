# Guía de Despliegue a Producción - Tracker Frontend

## 📋 Requisitos Previos

- Backend de Tracker desplegado y funcionando
- Dokploy configurado
- Claves VAPID generadas (deben coincidir con las del backend)

## 🚀 Despliegue Frontend en Dokploy

### 1. Variables de Entorno Requeridas

Al crear el proyecto en Dokploy, configura las siguientes **Build Arguments**:

```bash
VITE_JS_APP_API_URL=https://api.tudominio.com
VITE_JS_APP_API_URL_WS=wss://api.tudominio.com/ws
VITE_JS_FRONTEND_URL=https://tracker.tudominio.com
VITE_JS_APP_NAME=Tracker
VITE_JS_APP_VERSION=2.0.0
VITE_APP_DOMAIN=.tudominio.com
VITE_VAPID_PUBLIC_KEY=tu_clave_vapid_publica_aqui
```

**IMPORTANTE**:
- `VITE_VAPID_PUBLIC_KEY` debe ser exactamente la misma clave pública que se usó para generar el archivo `vapid_private.pem` en el backend
- Reemplaza `tudominio.com` con tu dominio real

### 2. Configuración de Dokploy

1. **Crear nuevo proyecto**: Tipo "Docker"
2. **Repositorio**: Conectar el repositorio de `tracker-frontend`
3. **Dockerfile**: Usar el `Dockerfile` en la raíz del proyecto
4. **Build Args**: Agregar todas las variables de entorno del paso 1
5. **Puerto**: 80
6. **Dominio**: Configurar el dominio deseado (ej: tracker.tudominio.com)

### 3. Build y Deploy

El Dockerfile está configurado con build multi-etapa:
- **Etapa 1 (builder)**: Compila la aplicación React con Vite
- **Etapa 2 (nginx)**: Sirve los archivos estáticos

El proceso incluye automáticamente:
- ✅ Compilación optimizada de producción
- ✅ Service worker de push notifications (`push-sw.js`)
- ✅ Iconos PWA
- ✅ Nginx configurado para SPA routing
- ✅ Compresión gzip
- ✅ Headers de seguridad

## 🔧 Configuración Backend (Push Notifications)

Para que las push notifications funcionen en producción, el backend necesita:

### 1. Archivo `vapid_private.pem`

Debe existir en la raíz del backend (`/app/vapid_private.pem` en Docker):

```
-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg0ycETnxWL8NWpryc
j94IMgoPoFge3r1UM5mt2lQxi4ShRANCAATHaNdZQFvogKznwetnbrSRFbvYvraG
8KeyWExblg1Cs5kK3E+6YQfVe0LntY67EB45QtTldNzbghiJxq6Sw8fl
-----END PRIVATE KEY-----
```

**CRÍTICO**: Esta clave debe coincidir con la clave pública que configuraste en `VITE_VAPID_PUBLIC_KEY` del frontend.

### 2. Variables de Entorno Backend

```bash
VAPID_PUBLIC_KEY=tu_clave_vapid_publica
VAPID_ADMIN_EMAIL=admin@tudominio.com
```

### 3. Dependencias Python

Asegúrate de que estén instaladas:
```bash
pip install pywebpush py-vapid
```

### 4. Verificar Configuración en `settings.py`

```python
# Web Push Notifications - VAPID Configuration
VAPID_PRIVATE_KEY_FILE = os.path.join(BASE_DIR, 'vapid_private.pem')
if os.path.exists(VAPID_PRIVATE_KEY_FILE):
    with open(VAPID_PRIVATE_KEY_FILE, 'r') as f:
        VAPID_PRIVATE_KEY = f.read().strip()
else:
    VAPID_PRIVATE_KEY = os.getenv('VAPID_PRIVATE_KEY', '').replace('\\n', '\n')

VAPID_PUBLIC_KEY = os.getenv('VAPID_PUBLIC_KEY', '')
VAPID_ADMIN_EMAIL = os.getenv('VAPID_ADMIN_EMAIL', 'admin@example.com')
```

## 🔐 Generación de Claves VAPID (si no las tienes)

Si necesitas generar nuevas claves VAPID:

```bash
# Instalar herramienta
pip install py-vapid

# Generar claves
vapid --gen

# Esto genera:
# - vapid_private.pem (archivo privado)
# - vapid_public.pem (archivo público)
# - También muestra las claves en formato string
```

**IMPORTANTE**:
- Usa la misma clave pública en frontend y backend
- La clave privada SOLO va en el backend
- NO commitees las claves al repositorio

## ✅ Checklist de Despliegue

### Frontend
- [ ] Variables de entorno configuradas en Dokploy
- [ ] `VITE_VAPID_PUBLIC_KEY` correctamente configurada
- [ ] Dominio configurado y DNS apuntando
- [ ] Build exitoso en Dokploy
- [ ] Acceso a la aplicación mediante HTTPS

### Backend
- [ ] `vapid_private.pem` copiado al servidor
- [ ] Variables `VAPID_PUBLIC_KEY` y `VAPID_ADMIN_EMAIL` configuradas
- [ ] `pywebpush` y `py-vapid` instalados
- [ ] Configuración de `settings.py` actualizada
- [ ] Backend reiniciado con nuevas configuraciones

### Pruebas
- [ ] Aplicación carga correctamente en producción
- [ ] Login funciona
- [ ] Notificaciones en tiempo real funcionan (WebSocket)
- [ ] Prompt de push notifications aparece después del login
- [ ] Push notifications se reciben correctamente
- [ ] Botón de suscripción en drawer de notificaciones funciona
- [ ] Service worker se registra correctamente (verificar en DevTools)

## 🐛 Troubleshooting

### Push Notifications no llegan

1. **Verificar service worker registrado**:
   - Abrir DevTools → Application → Service Workers
   - Debe aparecer `push-sw.js` como "activated and running"

2. **Verificar suscripción**:
   - En el drawer de notificaciones, el botón debe decir "Push activas"
   - Verificar en base de datos que existe el registro en `user_pushsubscription`

3. **Verificar claves VAPID**:
   - La clave pública del frontend debe coincidir con la del backend
   - Verificar que `vapid_private.pem` existe en el backend

4. **Logs del backend**:
   ```bash
   # Ver logs cuando se envía notificación
   docker logs -f nombre_contenedor_backend
   ```

### Service Worker no se actualiza

- Los service workers están configurados con `no-cache` en nginx
- En caso de problemas, limpiar cache del navegador
- Unregister service workers antiguos en DevTools

### Build falla en Dokploy

- Verificar que todas las variables de entorno están configuradas
- Revisar logs de build en Dokploy
- Verificar que `package.json` tiene el script `build`

## 📝 Notas Adicionales

### Arquitectura de Push Notifications

- **Frontend**: Service worker dedicado (`push-sw.js`) escucha eventos push
- **Backend**: Envía notificaciones via pywebpush usando VAPID
- **Registro**: Usuario se suscribe, frontend guarda subscription en backend
- **Envío**: Backend puede enviar notificaciones en cualquier momento

### Seguridad

- HTTPS es **obligatorio** para service workers y push notifications
- Las claves VAPID autentican al servidor que envía notificaciones
- Los permisos de notificaciones los controla el navegador

### Performance

- Service worker se carga en background
- Iconos PWA optimizados para múltiples tamaños
- Assets estáticos con cache de 1 año
- Compresión gzip habilitada

---

**¿Problemas?** Revisa los logs del navegador (DevTools → Console) y del backend.
