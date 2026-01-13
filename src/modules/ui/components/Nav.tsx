import React, { useState } from 'react';
import { Grid, Tooltip, IconButton, Avatar, Typography, Menu, MenuItem, Divider, ListItemIcon } from '@mui/material';
import { Logout } from '@mui/icons-material';

import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import {  useAppSelector } from '../../../store';
// import { toggleSidebar } from '../../../store/ui';
// import { openLogoutModal } from '../../../store/auth';
const Navbar = () => {

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    // const dispatch = useAppDispatch();
    const { status, user } = useAppSelector(state => state.auth);
    const handleLogout = () => {
        handleClose();
    }



    return (
        <Grid container
            alignItems="center"
            justifyContent="space-between"
            style={{
                padding: '8px',
                height: '50px',
                marginBottom: '8px',
                boxShadow: '0px 0px 5px rgba(0,0,0,0.2  )',
                position: 'fixed',
                backgroundColor: 'white',
                top: 0,
                left: 0,
                zIndex: 3
            }}>
            <Grid item display={'flex'} justifyContent={'center'} alignItems={'center'}>
                {/* Logo */}
                {status == 'authenticated' && <IconButton
                    aria-label="menu"
                    sx={{ mr: 0 }}
                    onClick={() => {
                    }}
                >
                    <MenuOutlinedIcon fontSize='medium' color='primary' />
                </IconButton>}

                <Typography variant="h6" component="p" fontWeight={600} className="p-1">
                    {import.meta.env.VITE_JS_APP_NAME}
                </Typography>
            </Grid>
            <Grid item>
                {/* Nombre del usuario */}
                {status === 'authenticated' && <Grid item xs={12}
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    flexDirection={'row'}
                >

                    <Typography
                        variant="subtitle2"
                        component="h1"
                        style={{
                            color: "black",
                        }}
                        fontWeight={400}
                    >
                        { user && 
                            (user.first_name || '').toLowerCase().split(' ')[0].charAt(0).toUpperCase() + (user.first_name || '').toLowerCase().split(' ')[0].slice(1) 
                            + ' ' + 
                            (user.last_name || '').toLowerCase().split(' ')[0].charAt(0).toUpperCase() + (user.last_name || '').toLowerCase().split(' ')[0].slice(1) }
                    </Typography>

                    <Tooltip title="Configuraciones">
                        <IconButton
                            onClick={handleClick}
                            size="small"
                            aria-controls={open ? 'account-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                        >
                            <Avatar
                                sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: 'primary.main',
                                    fontSize: '0.8rem',
                                }}
                            >
                                {user && user.first_name.charAt(0).toUpperCase() + user.last_name.charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>
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
                    <MenuItem onClick={handleClose}>
                        Mi perfil
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                        Historial
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} style={{ color: 'red' }} >
                        <ListItemIcon>
                            <Logout fontSize="small" color="error" />
                        </ListItemIcon>
                        Cerar sesión
                    </MenuItem>
                </Menu>
            </Grid>
        </Grid>
    );
}

export default Navbar;