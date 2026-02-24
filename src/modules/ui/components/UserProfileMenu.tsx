import React, { useState } from 'react';
import {
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../store';
import { logout } from '../../../store/auth';

interface Props {
  firstName?: string;
  lastName?: string;
  centerName?: string;
  flagUrl: string;
  countryCode: string;
}

export const UserProfileMenu: React.FC<Props> = ({
  firstName,
  lastName,
  centerName,
  flagUrl,
  countryCode,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
  };

  return (
    <>
      <div
        className="profile-details"
        onClick={handleClick}
        title="Abrir menú de usuario"
      >
        <div>
          <Avatar
            variant="rounded"
            alt={countryCode}
            src={flagUrl}
            sx={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
          />
        </div>
        <div className="name-job" style={{ maxWidth: 160, overflow: 'hidden' }}>
          <div
            className="profile_name"
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
            title={`${firstName ?? ''} ${lastName ?? ''}`}
          >
            {firstName} {lastName}
          </div>
          <div
            className="job"
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
            title={centerName || '--'}
          >
            {centerName || '--'}
          </div>
        </div>
        <div className="log_out">
          <Box
            component="i"
            className="bx bx-chevron-down"
            sx={{
              fontSize: 20,
              color: '#1c2536',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>
      </div>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 2,
            minWidth: 240,
            borderRadius: 3,
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
              borderRadius: 2,
              mx: 1.5,
              my: 0.75,
              fontFamily: 'Inter',
              fontSize: '0.9375rem',
              fontWeight: 500,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
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
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
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

        <MenuItem onClick={handleLogout}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(244, 67, 54, 0.08)',
                transition: 'all 0.2s ease',
              }}
            >
              <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
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
    </>
  );
};
