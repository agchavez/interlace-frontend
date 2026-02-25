/**
 * Hook para verificar permisos de usuario
 *
 * Sistema Híbrido:
 * - Permisos Django (list_permissions) → Control de acceso a funciones
 * - Grupos (list_groups) → Fallback basado en rol
 *
 * El backend mantiene la lógica de jerarquía (hierarchy_level) y área (area.code),
 * el frontend solo verifica permisos/grupos para mostrar/ocultar UI.
 */
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

/**
 * Verifica si el usuario tiene un permiso específico
 * @param permission - Nombre del permiso (ej: 'tokens.can_validate_token')
 * @returns boolean - true si tiene el permiso
 */
export const usePermission = (permission: string): boolean => {
  const { user } = useSelector((state: RootState) => state.auth);

  return useMemo(() => {
    if (!user) return false;

    // Superusuarios tienen todos los permisos
    if (user.is_superuser) return true;

    // Staff también tiene todos los permisos
    if (user.is_staff) return true;

    // Verificar en la lista de permisos
    return user.list_permissions?.includes(permission) ?? false;
  }, [user, permission]);
};

/**
 * Verifica si el usuario tiene un permiso O pertenece a un grupo específico
 * @param permission - Nombre del permiso
 * @param fallbackGroups - Grupos que se verifican si no tiene el permiso
 * @returns boolean
 */
export const usePermissionWithFallback = (
  permission: string,
  fallbackGroups: string[]
): boolean => {
  const { user } = useSelector((state: RootState) => state.auth);

  return useMemo(() => {
    if (!user) return false;
    if (user.is_superuser || user.is_staff) return true;

    // Verificar permiso primero
    if (user.list_permissions?.includes(permission)) return true;

    // Fallback a grupos
    return fallbackGroups.some(
      (group) => user.list_groups?.includes(group) ?? false
    );
  }, [user, permission, fallbackGroups]);
};

/**
 * Verifica si el usuario tiene alguno de los permisos especificados
 * @param permissions - Array de nombres de permisos
 * @returns boolean - true si tiene al menos uno de los permisos
 */
export const useAnyPermission = (permissions: string[]): boolean => {
  const { user } = useSelector((state: RootState) => state.auth);

  return useMemo(() => {
    if (!user) return false;
    if (user.is_superuser || user.is_staff) return true;

    return permissions.some(
      (permission) => user.list_permissions?.includes(permission) ?? false
    );
  }, [user, permissions]);
};

/**
 * Verifica si el usuario tiene todos los permisos especificados
 * @param permissions - Array de nombres de permisos
 * @returns boolean - true si tiene todos los permisos
 */
export const useAllPermissions = (permissions: string[]): boolean => {
  const { user } = useSelector((state: RootState) => state.auth);

  return useMemo(() => {
    if (!user) return false;
    if (user.is_superuser || user.is_staff) return true;

    return permissions.every(
      (permission) => user.list_permissions?.includes(permission) ?? false
    );
  }, [user, permissions]);
};

/**
 * Verifica si el usuario pertenece a alguno de los grupos especificados
 * @param groups - Array de nombres de grupos
 * @returns boolean
 */
export const useAnyGroup = (groups: string[]): boolean => {
  const { user } = useSelector((state: RootState) => state.auth);

  return useMemo(() => {
    if (!user) return false;
    if (user.is_superuser || user.is_staff) return true;

    return groups.some((group) => user.list_groups?.includes(group) ?? false);
  }, [user, groups]);
};

/**
 * Constantes de permisos del módulo tokens
 */
export const TokenPermissions = {
  // Permisos estándar
  VIEW: 'tokens.view_tokenrequest',
  ADD: 'tokens.add_tokenrequest',
  CHANGE: 'tokens.change_tokenrequest',
  DELETE: 'tokens.delete_tokenrequest',

  // Permisos de aprobación
  APPROVE_L1: 'tokens.can_approve_level_1',
  APPROVE_L2: 'tokens.can_approve_level_2',
  APPROVE_L3: 'tokens.can_approve_level_3',
  APPROVE_ANY: 'tokens.can_approve_token',
  REJECT: 'tokens.can_reject_token',
  CANCEL: 'tokens.can_cancel_token',

  // Permisos de validación
  VALIDATE: 'tokens.can_validate_token',        // Seguridad (EXIT_PASS)
  VALIDATE_PAYROLL: 'tokens.can_validate_payroll', // Planilla/People (PERMIT_HOUR, OVERTIME, etc.)

  // Permisos de documentos
  DOWNLOAD_PDF: 'tokens.can_download_pdf',
  DOWNLOAD_RECEIPT: 'tokens.can_download_receipt',
  PRINT: 'tokens.can_print_token',

  // Permisos de entrega
  COMPLETE_DELIVERY: 'tokens.can_complete_delivery',

  // Permisos de reportes
  VIEW_REPORTS: 'tokens.can_view_reports',
  EXPORT_DATA: 'tokens.can_export_data',
} as const;

/**
 * Grupos del sistema (para fallback)
 */
export const TokenGroups = {
  SECURITY: 'Seguridad',
  CD_MANAGERS: 'Gerentes CD',
  AREA_MANAGERS: 'Jefes de Area',
  SUPERVISORS: 'Supervisores',
  HR: 'Personal RRHH',
  PEOPLE: 'People',
} as const;
