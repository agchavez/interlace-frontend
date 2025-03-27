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
    Badge
} from '@mui/material';
import logo from "../../../assets/logo.png";
import { Logout } from '@mui/icons-material';
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { useAppDispatch, useAppSelector } from '../../../store';
import { logout } from '../../../store/auth';
import { ChangeDistributorCenter } from './ChangeDistributorCenter';
import {setOpenChangeDistributionCenter, toggleSidebar} from '../../../store/ui/uiSlice';
import NotificationsNoneTwoToneIcon from '@mui/icons-material/NotificationsNoneTwoTone';

interface NavbarProps {
    notificationCount: number;
    onDrawerOpen: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ notificationCount, onDrawerOpen }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const dispatch = useAppDispatch();
    const { status, user } = useAppSelector(state => state.auth);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <>
            <ChangeDistributorCenter />
            <Grid container
                  alignItems="center"
                  justifyContent="space-between"
                  style={{
                      padding: '8px',
                      height: '50px',
                      marginBottom: '8px',
                      boxShadow: '0px 0px 5px rgba(0,0,0,0.2)',
                      position: 'fixed',
                      backgroundColor: 'white',
                      top: 0,
                      left: 0,
                      zIndex: 3
                  }}>
                <Grid item display={'flex'} justifyContent={'center'} alignItems={'center'}>
                    {status === 'authenticated' && <IconButton
                        aria-label="menu"
                        sx={{ mr: 0 }}
                        onClick={() => {
                            dispatch(toggleSidebar());
                        }}
                    >
                        <MenuOutlinedIcon fontSize='medium' color='primary' />
                    </IconButton>}
                </Grid>

                <Grid item display={'flex'} justifyContent={'left'} alignItems={'center'} flexGrow={1} className='navbar__logo'>
                    <div className="nav__img" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={logo} alt="img" width={120} className="p-1" style={{ marginRight: '4px' }} />
                        <Typography variant="body2" component="p" fontWeight={100} className="p-1" sx={{
                            borderLeft: '2px solid black',
                            paddingLeft: '4px',
                        }}>
                            {import.meta.env.VITE_JS_APP_NAME}
                        </Typography>
                    </div>
                </Grid>
                <Grid item display={'flex'} justifyContent={'right'} alignItems={'center'} sx={{ gap: 2 }}>
                    {status === 'authenticated' && <IconButton onClick={onDrawerOpen}>
                        <Badge badgeContent={notificationCount} color="secondary">
                            <NotificationsNoneTwoToneIcon />
                        </Badge>
                    </IconButton>}
                    {status === 'authenticated' && <Grid item xs={12}
                                                         display={'flex'}
                                                         justifyContent={'center'}
                                                         alignItems={'center'}
                                                         flexDirection={'row'}
                    >
                        <Divider orientation='vertical' flexItem sx={{ marginRight: 2 }} />
                        <Grid container flexDirection="column" alignItems="flex-end">
                            <Grid item>
                                <Typography
                                    variant="subtitle2"
                                    component="h1"
                                    style={{
                                        color: "black",
                                    }}
                                    fontWeight={700}
                                >
                                    {user &&
                                        (user.first_name || '').toLowerCase().split(' ')[0].charAt(0).toUpperCase() + (user.first_name || '').toLowerCase().split(' ')[0].slice(1)
                                        + ' ' +
                                        (user.last_name || '').toLowerCase().split(' ')[0].charAt(0).toUpperCase() + (user.last_name || '').toLowerCase().split(' ')[0].slice(1)}
                                </Typography>
                            </Grid>
                            <Grid item  onClick={()=>dispatch(setOpenChangeDistributionCenter(true))} style={{ cursor: 'pointer' }}>
                                <Typography
                                    variant="body2"
                                    component="h1"
                                    style={{
                                        color: "black"
                                    }}
                                    fontWeight={200}
                                    fontSize={13}
                                >
                                    {user && (user.centro_distribucion_name || '')}
                                </Typography>
                            </Grid>
                        </Grid>

                        <Tooltip title="Configuraciones">
                            <>
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: 'secondary.main',
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    {user && user.first_name.charAt(0).toUpperCase() + user.last_name.charAt(0).toUpperCase()}
                                </Avatar>
                            </>
                        </Tooltip>
                    </Grid>}
                    <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={open}
                        onClose={handleClose}
                        onClick={handleClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                mt: 1.5,
                                '& .MuiAvatar-root': {
                                    width: 32,
                                    height: 32,
                                    ml: -0.5,
                                    mr: 1,
                                },
                                '&:before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 14,
                                    width: 10,
                                    height: 10,
                                    bgcolor: 'background.paper',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={handleClose} disabled>
                            Mi perfil
                        </MenuItem>
                        <MenuItem onClick={handleClose} disabled>
                            Historial
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout} style={{ color: 'red' }} >
                            <ListItemIcon>
                                <Logout fontSize="small" color="error" />
                            </ListItemIcon>
                            Cerrar sesión
                        </MenuItem>
                    </Menu>
                </Grid>
            </Grid>
        </>
    );
}

export default Navbar;