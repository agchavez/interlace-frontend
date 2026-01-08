# ==========================================
# Etapa 1: Build de la aplicación
# ==========================================
FROM node:18-alpine AS builder

# Directorio de trabajo
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias (usar ci para builds reproducibles)
RUN npm ci

# Copiar código fuente
COPY . .

# Build arguments para variables de entorno
ARG VITE_JS_APP_API_URL
ARG VITE_JS_APP_API_URL_WS
ARG VITE_JS_FRONTEND_URL
ARG VITE_JS_APP_NAME=Tracker
ARG VITE_JS_APP_VERSION=2.0.0
ARG VITE_APP_DOMAIN
ARG VITE_VAPID_PUBLIC_KEY

# Crear archivo .env para el build
RUN echo "VITE_JS_APP_API_URL=${VITE_JS_APP_API_URL}" > .env && \
    echo "VITE_JS_APP_API_URL_WS=${VITE_JS_APP_API_URL_WS}" >> .env && \
    echo "VITE_JS_FRONTEND_URL=${VITE_JS_FRONTEND_URL}" >> .env && \
    echo "VITE_JS_APP_NAME=${VITE_JS_APP_NAME}" >> .env && \
    echo "VITE_JS_APP_VERSION=${VITE_JS_APP_VERSION}" >> .env && \
    echo "VITE_APP_DOMAIN=${VITE_APP_DOMAIN}" >> .env && \
    echo "VITE_VAPID_PUBLIC_KEY=${VITE_VAPID_PUBLIC_KEY}" >> .env

# Build de producción
RUN npm run build

# ==========================================
# Etapa 2: Nginx para servir archivos
# ==========================================
FROM nginx:alpine

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos compilados desde builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar service worker de push notifications (IMPORTANTE!)
COPY --from=builder /app/public/push-sw.js /usr/share/nginx/html/push-sw.js

# Copiar iconos PWA
COPY --from=builder /app/public/icons /usr/share/nginx/html/icons

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]