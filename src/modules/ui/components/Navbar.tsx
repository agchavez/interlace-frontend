import React, {useState} from 'react';
import {
    Grid,
    Tooltip,
    IconButton,
    Avatar,
    Typography,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
    Badge,
    Box,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    ListItemText,
    useTheme,
    useMediaQuery
} from '@mui/material';
import logo from "../../../assets/logo.png";
import logoSmall from "../../../../public/logo-qr.png";
import { Logout } from '@mui/icons-material';
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { useAppDispatch, useAppSelector } from '../../../store';
import { logout } from '../../../store/auth';
import { ChangeDistributorCenter } from './ChangeDistributorCenter';
import {setOpenChangeDistributionCenter, toggleSidebar} from '../../../store/ui/uiSlice';
import NotificationsNoneTwoToneIcon from '@mui/icons-material/NotificationsNoneTwoTone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BootstrapDialogTitle from './BootstrapDialogTitle';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetMyProfileQuery } from '../../personnel/services/personnelApi';
import { useSidebar } from '../context/SidebarContext';

interface NavbarProps {
    notificationCount: number;
    onDrawerOpen: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ notificationCount, onDrawerOpen }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const open = Boolean(anchorEl);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { status, user } = useAppSelector(state => state.auth);

    // Detectar móvil
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Usar contexto de sidebar V2
    const { toggleCollapsed } = useSidebar();

    // Obtener foto del perfil con SAS token actualizado
    const { data: profileData, error: profileError } = useGetMyProfileQuery(undefined, {
        skip: status !== 'authenticated',
        refetchOnMountOrArgChange: true,
    });

    // Verificar si el usuario tiene perfil
    const hasProfile = profileData && 'id' in profileData;

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
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
        dispatch(logout());
    };

    return (
        <>
            <ChangeDistributorCenter />
            <Grid container
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                      padding: '8px 16px',
                      paddingRight: '24px',
                      height: '60px',
                      marginBottom: 0,
                      boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
                      position: 'fixed',
                      backgroundColor: 'white',
                      top: 0,
                      left: 0,
                      right: 0,
                      width: '100%',
                      zIndex: 3,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '0 0 16px 16px', // Bordes redondeados en la parte inferior
                  }}>
                <Grid item display={'flex'} justifyContent={'center'} alignItems={'center'}>
                    {status === 'authenticated' && <IconButton
                        aria-label="menu"
                        sx={{ mr: 0 }}
                        onClick={() => {
                            toggleCollapsed();
                        }}
                    >
                        <MenuOutlinedIcon fontSize='medium' color='primary' />
                    </IconButton>}
                </Grid>

                <Grid item display={'flex'} justifyContent={'left'} alignItems={'center'} flexGrow={1} className='navbar__logo'>
                    <div className="nav__img" style={{ display: 'flex', alignItems: 'center' }}>
                        <img
                            src={isMobile ? logoSmall : logo}
                            alt="img"
                            width={isMobile ? 40 : 120}
                            className="p-1"
                            style={{ marginRight: isMobile ? '4px' : '8px' }}
                        />
                        {!isMobile && (
                            <Typography variant="body2" component="p" sx={{
                                borderLeft: '2px solid',
                                borderColor: 'divider',
                                paddingLeft: '8px',
                                fontFamily: 'Inter',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                color: 'text.primary',
                            }}>
                                {import.meta.env.VITE_JS_APP_NAME}
                            </Typography>
                        )}
                    </div>
                </Grid>
                <Grid item display={'flex'} justifyContent={'right'} alignItems={'center'} sx={{ gap: 2 }}>
                    {status === 'authenticated' && <IconButton
                        onClick={onDrawerOpen}
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 3, // Aumentado de 2 a 3
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                backgroundColor: 'rgba(220, 187, 32, 0.1)',
                                transform: 'scale(1.05)',
                            },
                        }}
                    >
                        <Badge
                            badgeContent={notificationCount}
                            color="secondary"
                            sx={{
                                '& .MuiBadge-badge': {
                                    fontFamily: 'Inter',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                },
                            }}
                        >
                            <NotificationsNoneTwoToneIcon sx={{ fontSize: '1.5rem', color: 'text.primary' }} />
                        </Badge>
                    </IconButton>}
                    {status === 'authenticated' && <Grid item xs={12}
                                                         display={'flex'}
                                                         justifyContent={'center'}
                                                         alignItems={'center'}
                                                         flexDirection={'row'}
                                                         sx={{ gap: 1.5 }}
                    >
                        <Divider orientation='vertical' flexItem sx={{ height: '40px', my: 'auto' }} />
                        <Grid container flexDirection="column" alignItems="flex-end" sx={{ minWidth: '120px' }}>
                            <Grid item>
                                <Typography
                                    variant="subtitle2"
                                    component="h1"
                                    sx={{
                                        color: 'text.primary',
                                        fontFamily: 'Inter',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {user &&
                                        (user.first_name || '').toLowerCase().split(' ')[0].charAt(0).toUpperCase() + (user.first_name || '').toLowerCase().split(' ')[0].slice(1)
                                        + ' ' +
                                        (user.last_name || '').toLowerCase().split(' ')[0].charAt(0).toUpperCase() + (user.last_name || '').toLowerCase().split(' ')[0].slice(1)}
                                </Typography>
                            </Grid>
                            <Grid
                                item
                                onClick={()=>dispatch(setOpenChangeDistributionCenter(true))}
                                sx={{
                                    cursor: 'pointer',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 3, // Aumentado de 1.5 a 3
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(220, 187, 32, 0.08)',
                                        '& .MuiTypography-root': {
                                            color: 'primary.main',
                                        }
                                    }
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    component="h1"
                                    sx={{
                                        color: 'text.secondary',
                                        fontFamily: 'Inter',
                                        fontWeight: 500,
                                        fontSize: '0.75rem',
                                        transition: 'color 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                    }}
                                >
                                    <Box
                                        component="span"
                                        sx={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            backgroundColor: 'primary.main',
                                            opacity: 0.7,
                                        }}
                                    />
                                    {user && (user.centro_distribucion_name || '')}
                                </Typography>
                            </Grid>
                        </Grid>

                        <Tooltip
                            title="Mi perfil"
                            arrow
                            slotProps={{
                                tooltip: {
                                    sx: {
                                        fontFamily: 'Inter',
                                        fontSize: '0.8125rem',
                                        fontWeight: 500,
                                    },
                                },
                            }}
                        >
                            <Avatar
                                onClick={handleClick}
                                src={(profileData && 'photo_url' in profileData ? profileData.photo_url : undefined) || undefined}
                                sx={{
                                    width: 42,
                                    height: 42,
                                    bgcolor: 'secondary.main',
                                    fontSize: '0.9375rem',
                                    fontFamily: 'Inter',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2px solid',
                                    borderColor: 'transparent',
                                    borderRadius: 3, // Aumentado para más redondeo
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                        boxShadow: '0 6px 16px rgba(220, 187, 32, 0.3)',
                                        borderColor: 'rgba(220, 187, 32, 0.2)',
                                    },
                                }}
                            >
                                {user && user.first_name.charAt(0).toUpperCase() + user.last_name.charAt(0).toUpperCase()}
                            </Avatar>
                        </Tooltip>
                    </Grid>}
                    <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={open}
                        onClose={handleClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                mt: 2,
                                minWidth: 240,
                                borderRadius: 4, // Aumentado de 3 a 4
                                overflow: 'visible',
                                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
                                border: '1px solid',
                                borderColor: 'divider',
                                '&:before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 20,
                                    width: 12,
                                    height: 12,
                                    bgcolor: 'background.paper',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                    borderLeft: '1px solid',
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                },
                                '& .MuiMenuItem-root': {
                                    px: 2.5,
                                    py: 1.75,
                                    borderRadius: 3, // Aumentado de 2 a 3
                                    mx: 1.5,
                                    my: 0.75,
                                    fontFamily: 'Inter',
                                    fontSize: '0.9375rem',
                                    fontWeight: 500,
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(220, 187, 32, 0.1)',
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
                                        backgroundColor: 'rgba(220, 187, 32, 0.1)',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <AccountCircleIcon fontSize="small" sx={{ color: 'primary.main' }} />
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

                        <Divider sx={{ my: 1, mx: 2 }} />

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
                                        backgroundColor: 'rgba(244, 67, 54, 0.08)',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <Logout fontSize="small" sx={{ color: 'error.main' }} />
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

                    {/* Diálogo de confirmación de cierre de sesión */}
                    <Dialog
                        open={logoutDialogOpen}
                        onClose={handleCloseLogoutDialog}
                        maxWidth="xs"
                        fullWidth
                        PaperProps={{
                            sx: {
                                borderRadius: 4, // Aumentado de 3 a 4 para los diálogos
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
                </Grid>
            </Grid>
        </>
    );
}

export default Navbar;