import React, { useMemo, useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  List,
  Divider,
  IconButton,
  Typography,
  Avatar,
  useTheme,
  alpha,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Backdrop,
  useMediaQuery,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InventoryIcon from '@mui/icons-material/Inventory';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import BadgeIcon from '@mui/icons-material/Badge';
import EngineeringTwoToneIcon from '@mui/icons-material/EngineeringTwoTone';
import AssignmentLateTwoToneIcon from '@mui/icons-material/AssignmentLateTwoTone';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import { useSidebar } from '../context/SidebarContext';
import SidebarItemV2, { SidebarSubItem } from './SidebarItemV2';
import { useAppDispatch, useAppSelector } from '../../../store';
import { logout } from '../../../store/auth';
import { useLogoutMutation } from '../../../store/auth/authApi';
import { RoutePermissionsDirectory } from '../../../config/directory';
import { setOpenChangeDistributionCenter } from '../../../store/ui/uiSlice';
import BootstrapDialogTitle from './BootstrapDialogTitle';
import { useGetMyProfileQuery } from '../../personnel/services/personnelApi';
import { useNavigate } from 'react-router-dom';
import { useDevRoleOverride } from '../../work/utils/useDevRoleOverride';
import { useGroupImpersonation } from '../../work/utils/useGroupImpersonation';
import { useImpersonatedGroupPerms } from '../../work/utils/useImpersonatedGroupPerms';
import { GROUP_TO_ROLE, WORK_ROLE_TO_PATH, type WorkRoleCode } from '../../work/utils/workRole';

interface SidebarItem {
  text: string;
  subItems: SidebarSubItem[];
  icon: React.ReactNode;
  id: string;
  visible?: boolean;
}

const SIDEBAR_WIDTH_OPEN = 260;
const SIDEBAR_WIDTH_COLLAPSED = 68;

const SidebarV2: React.FC = () => {
  const { isCollapsed, toggleCollapsed } = useSidebar();
  const theme = useTheme();
  const user = useAppSelector((state) => state.auth.user);
  const { status } = useAppSelector(state => state.auth);
  const distributorCenters = useAppSelector((state) => state.user.distributionCenters);
  const [logoutAPI] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // sm = 600px

  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const open = Boolean(anchorEl);

  // Get profile photo with updated SAS token
  const { data: profileData, error: profileError } = useGetMyProfileQuery(undefined, {
    skip: status !== 'authenticated',
    refetchOnMountOrArgChange: true,
  });


  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMyProfile = () => {
    navigate('/personnel/my-profile');
    handleClose();
  };

  const handleOpenLogoutDialog = () => {
    handleClose();
    setLogoutDialogOpen(true);
  };

  const handleCloseLogoutDialog = () => {
    setLogoutDialogOpen(false);
  };

  const handleConfirmLogout = () => {
    setLogoutDialogOpen(false);
    logoutAPI(undefined);
    dispatch(logout());
  };

  // Get country code and flag URL
  const { country_code, flagUrl } = useMemo(() => {
    const country_code =
      distributorCenters.find((dc) => dc.id === user?.centro_distribucion)
        ?.country_code || "hn";
    return {
      country_code,
      flagUrl: `https://flagcdn.com/h240/${country_code?.toLowerCase()}.png`,
    };
  }, [distributorCenters, user?.centro_distribucion]);

  // Check if user is in Security group
  const isSecurityUser = user?.list_groups?.includes('SEGURIDAD') || false;

  // Override de rol en modo dev — permite a un tester ver un sidebar como si
  // fuera de ese rol aunque su usuario real no tenga el grupo/permiso.
  const devRole = useDevRoleOverride();
  const devGroup = useGroupImpersonation();
  // Permisos del grupo impersonado, cargados del backend bajo demanda.
  const impersonated = useImpersonatedGroupPerms();

  // Grupos "efectivos": cuando hay impersonation activa, el sidebar se comporta
  // como si el usuario solo fuera miembro de ese grupo. En prod devGroup es null.
  const effectiveGroups: string[] = devGroup ? [devGroup] : (user?.list_groups || []);
  // Permisos efectivos: al impersonar usamos los permisos reales del grupo
  // (cargados del backend). Esto hace que el sidebar muestre los items que
  // ese grupo realmente puede ver — no solo los items con fallback por grupo.
  const effectivePerms: string[] = devGroup ? impersonated.perms : (user?.list_permissions || []);
  // SUPERADMIN se comporta como superuser para que el sidebar muestre todo.
  const effectiveIsSuperuser: boolean = devGroup
    ? impersonated.isSuperadmin
    : (user?.is_superuser === true);

  // Helper para visibilidad de pantallas /work/*: grupo, permiso o dev-override.
  // Nota: NO acepta superuser/staff como bypass — los /work/* son específicos
  // del rol operativo. Admins pueden entrar vía el dev role switcher.
  const canAccessWork = (group: string, permission: string, roleCode: string): boolean => {
    if (!user) return false;
    if (devRole === roleCode) return true;
    if (user.list_groups?.includes(group)) return true;
    if (user.list_permissions?.includes(permission)) return true;
    return false;
  };
  const canPicker   = canAccessWork('Picker',            'truck_cycle.access_work_picker',   'PICKER');
  const canCounter  = canAccessWork('Contador',          'truck_cycle.access_work_counter',  'COUNTER');
  const canSecurity = canAccessWork('Seguridad Ciclo',   'truck_cycle.access_work_security', 'SECURITY');
  const canOps      = canAccessWork('Operaciones Ciclo', 'truck_cycle.access_work_ops',      'OPS');
  const canYard     = canAccessWork('Chofer de Patio',   'truck_cycle.access_work_yard',     'YARD_DRIVER');
  const canVendor   = canAccessWork('Chofer Vendedor',   'truck_cycle.access_work_vendor',   'VENDOR');

  // Menu items definition
  const items: SidebarItem[] = useMemo(
    () => [
      // Security-only item - shown at top for security users
      ...(isSecurityUser ? [{
        text: 'Caseta de Seguridad',
        icon: <QrCodeScannerIcon fontSize="small" />,
        subItems: [
          { text: 'Validar Tokens', href: '/tokens/validate', id: 'validate-security', visible: true, permissions: ['any'] as string[] },
        ],
        id: 'seguridad',
        visible: true,
      }] : []),
      {
        text: 'Inicio',
        icon: <DashboardIcon fontSize="small" />,
        subItems: [
          { text: 'Dashboard', href: '/', id: 'dashboard' },
          { text: 'Mi Workstation', href: '/my-workstation', id: 'my-workstation' },
          // { text: 'IN-OUT', href: '/tracker/view', id: 'vista' },
          // { text: 'Dashboard CD', href: '/dashboard/cd', id: 'dashboardcd' },
        ],
        id: 'inicio',
      },
      {
        text: 'Usuario',
        icon: <PeopleIcon fontSize="small" />,
        subItems: [
          { text: 'Registro', href: '/user/register', id: 'crear' },
          { text: 'Administrar', href: '/user', id: 'gestion' },
        ],
        id: 'usuarios',
      },
      {
        text: 'Personal',
        icon: <BadgeIcon fontSize="small" />,
        subItems: [
          { text: 'Dashboard', href: '/personnel/dashboard', id: 'dashboard' },
          { text: 'Listado', href: '/personnel', id: 'list' },
          { text: 'Certificaciones y Entrenamientos', href: '/personnel/certifications', id: 'certifications' },
          { text: 'Desempeño', href: '/personnel/performance', id: 'performance' },
        ],
        id: 'personal',
      },
      // {
      //   text: 'T1',
      //   icon: <AssignmentIcon fontSize="small" />,
      //   subItems: [
      //     { text: 'En Atención', href: '/tracker/check', id: 'nuevo' },
      //     { text: 'Gestión', href: '/tracker/manage', id: 'gestion' },
      //     { text: 'Pedidos', href: '/order/manage', id: 'order' },
      //   ],
      //   id: 'movimientos',
      // },
      // {
      //   text: 'T2',
      //   icon: <ContentPasteGoIcon fontSize="small" />,
      //   subItems: [
      //     { text: 'Cargar Preventa', href: '/tracker-t2/pre-sale', id: 'outregister' },
      //     { text: 'Gestión', href: '/tracker-t2/manage', id: 'outmanage' },
      //     { text: 'Revisión', href: '/tracker-t2/pre-sale-check', id: 'outcheck' },
      //   ],
      //   id: 't2',
      // },
      {
        text: 'Reporte',
        icon: <AssessmentIcon fontSize="small" />,
        subItems: [
          // { text: 'Movimientos', href: '/movimientos/crear', id: 'nuevo' },
          // { text: 'Productos', href: '/report/shift', id: 'turno' },
          // { text: 'RISKS - STOCK AGE', href: '/report/por-expirar', id: 'porExpirar' },
        ],
        id: 'reportes',
      },
      // {
      //   text: 'Inventario',
      //   icon: <InventoryIcon fontSize="small" />,
      //   subItems: [{ text: 'Movimientos', href: '/inventory', id: 'gestion' }],
      //   id: 'inventario',
      // },
      // {
      //   text: 'Reclamos',
      //   icon: <AssignmentLateTwoToneIcon fontSize="small" />,
      //   subItems: [
      //     { text: 'Seguimiento', href: '/claim', id: 'reclamos' },
      //     { text: 'Mis Reclamos', href: '/claim/mine', id: 'misreclamos' },
      //   ],
      //   id: 'claim',
      // },
      {
        text: 'Ciclo del Camión',
        icon: <LocalShippingIcon fontSize="small" />,
        subItems: [
          { text: 'Dashboard', href: '/truck-cycle', id: 'tc-dashboard' },
          { text: 'Cargar Pallet Complex', href: '/truck-cycle/upload', id: 'tc-upload' },
          { text: 'Pautas', href: '/truck-cycle/pautas', id: 'tc-pautas' },
          { text: 'Operaciones del Día', href: '/truck-cycle/operations', id: 'tc-operations' },
          { text: 'Picking', href: '/work/picker', id: 'tc-picking', visible: canPicker },
          { text: 'Conteo', href: '/work/counter', id: 'tc-counting', visible: canCounter },
          { text: 'Seguridad', href: '/work/security', id: 'tc-security', visible: canSecurity },
          { text: 'Operaciones', href: '/work/ops', id: 'tc-ops', visible: canOps },
          { text: 'Chofer de Patio', href: '/work/yard', id: 'tc-yard', visible: canYard },
          { text: 'Chofer Vendedor', href: '/work/vendor', id: 'tc-vendor', visible: canVendor },
          { text: 'KPI', href: '/truck-cycle/kpi/report', id: 'tc-kpi' },
          { text: 'Metas KPI', href: '/truck-cycle/kpi/config', id: 'tc-kpi-config' },
        ],
        id: 'truck-cycle',
      },
      {
        text: 'Workstations',
        icon: <WorkspacesIcon fontSize="small" />,
        subItems: [
          { text: 'Torre de Control', href: '/truck-cycle/workstation', id: 'ws-overview' },
          { text: 'Picker', href: '/work/picker/workstation', id: 'ws-picker' },
          { text: 'Contador', href: '/work/counter/workstation', id: 'ws-counter' },
          { text: 'Chofer de Patio', href: '/work/yard/workstation', id: 'ws-yard' },
        ],
        id: 'workstations',
      },
      {
        text: 'Tokens',
        icon: <ConfirmationNumberIcon fontSize="small" />,
        subItems: [
          { text: 'Listado', href: '/tokens', id: 'list' },
          { text: 'Crear', href: '/tokens/create', id: 'create' },
          { text: 'Pendientes', href: '/tokens/pending', id: 'pending' },
          { text: 'Validar', href: '/tokens/validate', id: 'validate' },
        ],
        id: 'tokens',
      },
      {
        text: 'Mantenimiento',
        icon: <EngineeringTwoToneIcon fontSize="small" />,
        subItems: [
          { text: 'Centros de Distribución', href: '/maintenance/distributor-center', id: 'cd' },
          { text: 'Camiones', href: '/maintenance/trucks', id: 'mt-trucks' },
          { text: 'Bahías', href: '/maintenance/bays', id: 'mt-bays' },
          { text: 'Métricas de Desempeño', href: '/maintenance/metric-types', id: 'metric-types' },
          { text: 'Productos', href: '/maintenance/products', id: 'products' },
          { text: 'Materiales', href: '/tokens/materials', id: 'materials' },
          { text: 'Personas Externas', href: '/tokens/external-persons', id: 'external-persons' },
          { text: 'Tipos de Hora Extra', href: '/maintenance/overtime-types', id: 'overtime-types' },
          { text: 'Motivos de Hora Extra', href: '/maintenance/overtime-reasons', id: 'overtime-reasons' },
        ],
        id: 'mantenimiento',
      },
    ],
    [isSecurityUser]
  );

  // Add permissions to subitems
  items.forEach((item) =>
    item.subItems.forEach(
      (sub) => (sub.permissions = RoutePermissionsDirectory[sub.href || -1])
    )
  );

  // Filter items based on permissions
  const sidebarItems = useMemo(() => {
    const isSuperuser = effectiveIsSuperuser;

    const processed = items.map((item) => {
      const subitems = item.subItems.map((sub) => {
        // Get permissions from directory if not set
        const permissions = sub.permissions || RoutePermissionsDirectory[sub.href || ''] || [];

        if (
          permissions.includes('cd.more') &&
          user?.distributions_centers &&
          user?.distributions_centers.length >= 1
        ) {
          sub.visible = true;
        } else if (permissions.includes('cd') && user?.centro_distribucion) {
          // Permiso especial para usuarios con centro de distribución asignado
          sub.visible = true;
        } else {
          // Reglas especiales para /work/* — nunca visibles por bypass de superuser:
          // solo cuando el usuario pertenece al grupo CICLO_* o tiene el permiso.
          const PERM_TO_GROUP: Record<string, string> = {
            'truck_cycle.access_work_picker':   'Picker',
            'truck_cycle.access_work_counter':  'Contador',
            'truck_cycle.access_work_security': 'Seguridad Ciclo',
            'truck_cycle.access_work_ops':      'Operaciones Ciclo',
            'truck_cycle.access_work_yard':     'Chofer de Patio',
            'truck_cycle.access_work_vendor':   'Chofer Vendedor',
          };
          const PERM_TO_ROLE: Record<string, string> = {
            'truck_cycle.access_work_picker':   'PICKER',
            'truck_cycle.access_work_counter':  'COUNTER',
            'truck_cycle.access_work_security': 'SECURITY',
            'truck_cycle.access_work_ops':      'OPS',
            'truck_cycle.access_work_yard':     'YARD_DRIVER',
            'truck_cycle.access_work_vendor':   'VENDOR',
          };
          const isWorkItem = permissions.some((p: string) => p in PERM_TO_GROUP);

          if (isWorkItem) {
            sub.visible = permissions.every((perm: string) => {
              if (devRole && PERM_TO_ROLE[perm] === devRole) return true;
              if (effectivePerms.includes(perm)) return true;
              const group = PERM_TO_GROUP[perm];
              return group ? effectiveGroups.includes(group) : false;
            });
          } else if (isSuperuser) {
            sub.visible = true;
          } else if (!permissions || permissions.length === 0) {
            sub.visible = false;
          } else {
            sub.visible = permissions.includes('any')
              ? true
              : permissions.every((perm: string) => effectivePerms.includes(perm));
          }
        }
        return sub;
      });
      item.subItems = subitems;
      item.visible = subitems.some((sub) => sub.visible);
      return item;
    });

    // Si el usuario está "bloqueado" en un rol operativo (dev override o grupo
    // del Ciclo), el sidebar solo muestra la pantalla /work/<rol> correspondiente
    // — todo lo demás se oculta para que el operario no tenga distracciones.
    const activeWorkRole: WorkRoleCode | null = devRole ?? (() => {
      for (const g of effectiveGroups) {
        if (GROUP_TO_ROLE[g]) return GROUP_TO_ROLE[g];
      }
      return null;
    })();

    if (activeWorkRole) {
      const allowedHref = WORK_ROLE_TO_PATH[activeWorkRole];
      return processed.map((item) => {
        const filtered = item.subItems.filter((s) => s.visible && s.href === allowedHref);
        return { ...item, subItems: filtered, visible: filtered.length > 0 };
      });
    }

    return processed;
  }, [items, user, devRole, devGroup, impersonated.perms, impersonated.isSuperadmin]);

  const drawerWidth = isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_OPEN;

  // Auto-cerrar sidebar en mobile cuando cambia la ruta
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      toggleCollapsed();
    }
  }, [location.pathname]);

  return (
    <>
      {/* Backdrop para móviles */}
      {isMobile && !isCollapsed && (
        <Backdrop
          open={!isCollapsed}
          onClick={toggleCollapsed}
          sx={{
            zIndex: 1299,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            top: 60,
          }}
        />
      )}

      <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          backgroundColor: '#1a1a1a',
          top: 60, // Height of navbar (60px)
          height: 'calc(100vh - 60px)',
          borderRadius: '0 10px 10px 0', // Border radius en esquina superior derecha
          // Mobile responsive
          '@media (max-width: 600px)': {
            display: isCollapsed ? 'none' : 'block',
            width: isCollapsed ? 0 : 260,
            position: 'fixed',
            zIndex: 1300,
          },
        },
      }}
    >

      {/* Navigation Items */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 2, px: 1.5 }}>
        <List component="nav" disablePadding>
          {sidebarItems.map((item) => {
            if (item.visible) {
              return (
                <SidebarItemV2
                  key={item.id}
                  text={item.text}
                  icon={item.icon}
                  id={item.id}
                  subItems={item.subItems}
                  visible={item.visible}
                />
              );
            }
            return null;
          })}
        </List>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

      {/* User Profile & Logout */}
      <Box sx={{ p: 1.5 }}>
        {user && (
          <Box>
            {/* Distribution Center */}
            {!isCollapsed && user.centro_distribucion_name && (
              <Box
                onClick={() => dispatch(setOpenChangeDistributionCenter(true))}
                sx={{
                  cursor: 'pointer',
                  px: 2,
                  py: 1.5,
                  borderRadius: 3, // Aumentado de 2 a 3
                  mb: 1.5,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.dark, 0.1)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.25)} 0%, ${alpha(theme.palette.primary.dark, 0.15)} 100%)`,
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {/* Country Flag */}
                  <Box
                    component="img"
                    src={flagUrl}
                    alt={country_code}
                    sx={{
                      width: 24,
                      height: 16,
                      borderRadius: 1, // Aumentado de 0.5 a 1
                      objectFit: 'cover',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                    }}
                  />

                  <Typography
                    variant="body2"
                    sx={{
                      color: 'primary.light',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      transition: 'color 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      flex: 1,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.6)}`,
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%, 100%': {
                            opacity: 1,
                          },
                          '50%': {
                            opacity: 0.6,
                          },
                        },
                      }}
                    />
                    {user.centro_distribucion_name}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* User Avatar and Info */}
            <Tooltip title="Mi cuenta" arrow placement="right">
              <Box
                onClick={handleClick}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 3, // Aumentado de 2 a 3
                  backgroundColor: alpha(theme.palette.secondary.main, 0.08),
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.secondary.main, 0.15),
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Avatar
                  src={(profileData && 'photo_url' in profileData ? profileData.photo_url : undefined) || undefined}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: theme.palette.secondary.main,
                    fontSize: 14,
                    fontWeight: 600,
                    borderRadius: 2.5, // Más redondeado para el avatar
                  }}
                >
                  {user.first_name?.[0]?.toUpperCase()}{user.last_name?.[0]?.toUpperCase()}
                </Avatar>
                {!isCollapsed && (
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: 'white',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '0.875rem',
                      }}
                    >
                      {(user.first_name || '').toLowerCase().split(' ')[0].charAt(0).toUpperCase() +
                        (user.first_name || '').toLowerCase().split(' ')[0].slice(1)} {' '}
                      {(user.last_name || '').toLowerCase().split(' ')[0].charAt(0).toUpperCase() +
                        (user.last_name || '').toLowerCase().split(' ')[0].slice(1)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                        fontSize: '0.7rem',
                      }}
                    >
                      Ver perfil
                    </Typography>
                  </Box>
                )}
              </Box>
            </Tooltip>

            {/* User Menu */}
            <Menu
              anchorEl={anchorEl}
              id="user-menu"
              open={open}
              onClose={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
              PaperProps={{
                elevation: 0,
                sx: {
                  mt: -1,
                  ml: 1,
                  minWidth: 240,
                  borderRadius: 4, // Aumentado de 3 a 4
                  overflow: 'visible',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: '#2a2a2a',
                  '& .MuiMenuItem-root': {
                    px: 2.5,
                    py: 1.75,
                    borderRadius: 3, // Aumentado de 2 a 3
                    mx: 1.5,
                    my: 0.75,
                    fontFamily: 'Inter',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    color: 'white',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.secondary.main, 0.15),
                      transform: 'translateX(4px)',
                    },
                    '&:first-of-type': {
                      mt: 1.5,
                    },
                    '&:last-of-type': {
                      mb: 1.5,
                    },
                  },
                },
              }}
            >
              <MenuItem onClick={handleMyProfile}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2.5, // Aumentado de 2 a 2.5
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: alpha(theme.palette.secondary.main, 0.15),
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <AccountCircleIcon fontSize="small" sx={{ color: 'secondary.light' }} />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    fontSize: '0.9375rem',
                  }}
                >
                  Mi Perfil
                </ListItemText>
              </MenuItem>

              <Divider sx={{ my: 1, mx: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

              <MenuItem onClick={handleOpenLogoutDialog}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2.5, // Aumentado de 2 a 2.5
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(244, 67, 54, 0.12)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <LogoutIcon fontSize="small" sx={{ color: 'error.light' }} />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    fontSize: '0.9375rem',
                  }}
                >
                  Cerrar Sesión
                </ListItemText>
              </MenuItem>
            </Menu>

            {/* Logout Confirmation Dialog */}
            <Dialog
              open={logoutDialogOpen}
              onClose={handleCloseLogoutDialog}
              maxWidth="xs"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: 4, // Aumentado de 3 a 4
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              <BootstrapDialogTitle id="logout-dialog-title" onClose={handleCloseLogoutDialog}>
                <Typography variant="h6" fontWeight={600} color={'#fff'}>
                  Cerrar Sesión
                </Typography>
              </BootstrapDialogTitle>
              <DialogContent>
                <DialogContentText sx={{ fontFamily: 'Inter', fontSize: '0.9375rem' }}>
                  ¿Estás seguro que deseas cerrar sesión?
                </DialogContentText>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                  onClick={handleCloseLogoutDialog}
                  variant="outlined"
                  color="secondary"
                  sx={{
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    textTransform: 'none',
                    borderRadius: 3, // Aumentado de 2 a 3
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmLogout}
                  variant="contained"
                  color="error"
                  sx={{
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    textTransform: 'none',
                    borderRadius: 3, // Aumentado de 2 a 3
                  }}
                >
                  Cerrar Sesión
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
      </Box>
    </Drawer>
    </>
  );
};

export default SidebarV2;
