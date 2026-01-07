/**
 * Utilidades para formatear y traducir campos de notificaciones
 */

import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Diccionario de traducciones para campos comunes
 */
export const FIELD_TRANSLATIONS: Record<string, string> = {
  // Campos comunes
  test: 'Prueba',
  timestamp: 'Fecha y hora',
  method: 'Método',
  data: 'Datos',

  // Reuniones y eventos
  meeting_time: 'Hora de reunión',
  attendees: 'Asistentes',
  location: 'Ubicación',
  duration: 'Duración',

  // Pedidos y productos
  order_id: 'N° de Pedido',
  status: 'Estado',
  items: 'Productos',
  total: 'Total',
  items_count: 'Cantidad de productos',

  // Productos
  product_id: 'ID Producto',
  old_price: 'Precio anterior',
  new_price: 'Precio nuevo',
  sku: 'SKU',

  // Tareas
  task_id: 'N° de Tarea',
  priority: 'Prioridad',
  due_date: 'Fecha límite',

  // Errores
  error_code: 'Código de error',
  retry_count: 'Intentos',
  next_retry: 'Próximo intento',

  // Usuarios
  user_id: 'ID Usuario',
  department: 'Departamento',
  role: 'Rol',

  // Solicitudes
  request_type: 'Tipo de solicitud',
  employee: 'Empleado',
  start_date: 'Fecha inicio',
  end_date: 'Fecha fin',

  // Reclamos
  claim_id: 'N° de Reclamo',
  client: 'Cliente',
  reason: 'Motivo',
  can_resubmit: 'Puede reenviar',

  // Tracking
  tracking_number: 'N° de Rastreo',
  current_location: 'Ubicación actual',
  next_location: 'Próxima ubicación',
  eta: 'Llegada estimada',

  // Seguridad
  days_until_expiry: 'Días hasta expiración',
  security_level: 'Nivel de seguridad',

  // Inventario
  pending_count: 'Cantidad pendiente',
  critical_products: 'Productos críticos',
  minimum_threshold: 'Umbral mínimo',
  average_stock: 'Stock promedio',

  // Otros
  version: 'Versión',
  source: 'Origen',
  batch: 'Lote',
  welcome: 'Bienvenida',
  critical_level: 'Nivel crítico',
  current_stock: 'Stock actual',
  custom_field: 'Campo personalizado',
};

/**
 * Diccionario de traducciones para valores
 */
export const VALUE_TRANSLATIONS: Record<string, string> = {
  // Estados
  confirmed: 'Confirmado',
  pending: 'Pendiente',
  in_transit: 'En tránsito',
  delivered: 'Entregado',
  cancelled: 'Cancelado',

  // Prioridades
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',

  // Booleanos
  true: 'Sí',
  false: 'No',

  // Niveles de seguridad
  critical: 'Crítico',
  warning: 'Advertencia',
  info: 'Información',

  // Tipos de solicitud
  vacation: 'Vacaciones',
  sick_leave: 'Licencia médica',
  permission: 'Permiso',
};

/**
 * Formatea un valor basado en su tipo
 */
export function formatValue(key: string, value: any): string {
  // Si es null o undefined
  if (value === null || value === undefined) {
    return 'N/A';
  }

  // Si es booleano
  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }

  // Si es un array
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  // Si es número
  if (typeof value === 'number') {
    // Verificar si es un precio (contiene 'price' o 'total' en la key)
    if (key.toLowerCase().includes('price') || key.toLowerCase().includes('total')) {
      return `$${value.toFixed(2)}`;
    }
    return value.toString();
  }

  // Si es una fecha/hora ISO 8601
  if (typeof value === 'string') {
    // Intentar parsear como fecha
    if (value.match(/^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}:\d{2}/)) {
      try {
        const date = parseISO(value);
        // Si la key indica que es solo fecha
        if (key.toLowerCase().includes('date') && !key.toLowerCase().includes('time')) {
          return format(date, 'dd/MM/yyyy', { locale: es });
        }
        // Si incluye hora
        return format(date, "dd/MM/yyyy 'a las' HH:mm", { locale: es });
      } catch (e) {
        // Si falla el parseo, devolver el valor original
        return value;
      }
    }

    // Intentar parsear como fecha simple (YYYY-MM-DD)
    if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      try {
        const date = parseISO(value);
        return format(date, 'dd/MM/yyyy', { locale: es });
      } catch (e) {
        return value;
      }
    }

    // Traducir valores conocidos
    const translated = VALUE_TRANSLATIONS[value.toLowerCase()];
    if (translated) {
      return translated;
    }

    return value;
  }

  return String(value);
}

/**
 * Traduce el nombre de un campo
 */
export function translateFieldName(fieldName: string): string {
  return FIELD_TRANSLATIONS[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Obtiene el color para un campo basado en su valor o tipo
 */
export function getFieldColor(key: string, value: any): string {
  // Prioridad alta
  if (key === 'priority' && value === 'high') {
    return '#d32f2f'; // rojo
  }
  if (key === 'priority' && value === 'medium') {
    return '#ed6c02'; // naranja
  }
  if (key === 'priority' && value === 'low') {
    return '#2e7d32'; // verde
  }

  // Estados
  if (key === 'status') {
    if (value === 'confirmed' || value === 'delivered') {
      return '#2e7d32'; // verde
    }
    if (value === 'pending' || value === 'in_transit') {
      return '#ed6c02'; // naranja
    }
    if (value === 'cancelled') {
      return '#d32f2f'; // rojo
    }
  }

  // Niveles de seguridad
  if (key === 'security_level') {
    if (value === 'critical') {
      return '#d32f2f';
    }
    if (value === 'warning' || value === 'medium') {
      return '#ed6c02';
    }
    return '#2e7d32';
  }

  // Booleanos críticos
  if (typeof value === 'boolean' && key.toLowerCase().includes('critical')) {
    return value ? '#d32f2f' : '#2e7d32';
  }

  // Números negativos o críticos
  if (typeof value === 'number') {
    if (key.toLowerCase().includes('critical') || key.toLowerCase().includes('low') || key.toLowerCase().includes('minimum')) {
      if (value < 10) {
        return '#d32f2f'; // rojo para niveles críticos
      }
    }
  }

  // Default - sin color especial
  return 'inherit';
}

/**
 * Verifica si un campo debe destacarse visualmente
 */
export function shouldHighlightField(key: string, value: any): boolean {
  // Destacar campos críticos o importantes
  const criticalKeys = ['priority', 'status', 'error_code', 'security_level', 'days_until_expiry'];
  return criticalKeys.includes(key);
}
