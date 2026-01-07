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

  // Check if user has profile (not 404)
  const hasProfile = profileData && 'id' in profileData;

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

  // Menu items definition
  const items: SidebarItem[] = useMemo(
    () => [
      {
        text: 'Inicio',
        icon: <DashboardIcon fontSize="small" />,
        subItems: [
          { text: 'Dashboard', href: '/', id: 'dashboard' },
          { text: 'IN-OUT', href: '/tracker/view', id: 'vista' },
          { text: 'Dashboard CD', href: '/dashboard/cd', id: 'dashboardcd' },
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
          { text: 'Certificaciones', href: '/personnel/certifications', id: 'certifications' },
          { text: 'Desempeño', href: '/personnel/performance', id: 'performance' },
        ],
        id: 'personal',
      },
      {
        text: 'T1',
        icon: <AssignmentIcon fontSize="small" />,
        subItems: [
          { text: 'En Atención', href: '/tracker/check', id: 'nuevo' },
          { text: 'Gestión', href: '/tracker/manage', id: 'gestion' },
          { text: 'Pedidos', href: '/order/manage', id: 'order' },
        ],
        id: 'movimientos',
      },
      {
        text: 'T2',
        icon: <ContentPasteGoIcon fontSize="small" />,
        subItems: [
          { text: 'Cargar Preventa', href: '/tracker-t2/pre-sale', id: 'outregister' },
          { text: 'Gestión', href: '/tracker-t2/manage', id: 'outmanage' },
          { text: 'Revisión', href: '/tracker-t2/pre-sale-check', id: 'outcheck' },
        ],
        id: 't2',
      },
      {
        text: 'Reporte',
        icon: <AssessmentIcon fontSize="small" />,
        subItems: [
          { text: 'Movimientos', href: '/movimientos/crear', id: 'nuevo' },
          { text: 'Productos', href: '/report/shift', id: 'turno' },
          { text: 'RISKS - STOCK AGE', href: '/report/por-expirar', id: 'porExpirar' },
        ],
        id: 'reportes',
      },
      {
        text: 'Inventario',
        icon: <InventoryIcon fontSize="small" />,
        subItems: [{ text: 'Movimientos', href: '/inventory/', id: 'gestion' }],
        id: 'inventario',
      },
      {
        text: 'Mantenimiento',
        icon: <EngineeringTwoToneIcon fontSize="small" />,
        subItems: [
          { text: 'Centros de Distribución', href: '/maintenance/distributor-center', id: 'cd' },
          { text: 'Periodos', href: '/maintenance/period-center', id: 'period-center' },
          { text: 'Métricas de Desempeño', href: '/maintenance/metric-types', id: 'metric-types' },
        ],
        id: 'mantenimiento',
      },
    ],
    []
  );

  // Add permissions to subitems
  items.forEach((item) =>
    item.subItems.forEach(
      (sub) => (sub.permissions = RoutePermissionsDirectory[sub.href || -1])
    )
  );

  // Filter items based on permissions
  const sidebarItems = useMemo(() => {
    return items.map((item) => {
      const subitems = item.subItems.map((sub) => {
        if (
          sub.permissions?.includes('cd.more') &&
          user?.distributions_centers &&
          user?.distributions_centers.length >= 1
        ) {
          sub.visible = true;
        } else {
          sub.visible = sub.permissions?.includes('any')
            ? true
            : sub.permissions?.every((perm) => {
                return (
                  user?.list_permissions.includes(perm) ||
                  user?.user_permissions.includes(perm)
                );
              });
        }
        return sub;
      });
      item.subItems = subitems;
      item.visible = subitems.some((sub) => sub.visible);
      return item;
    });
  }, [items, user]);

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
          borderRadius: '0 16px 0 0', // Border radius en esquina superior derecha
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
