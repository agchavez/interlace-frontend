import React from 'react';
import {
  Box,
  IconButton,
  Breadcrumbs,
  Typography,
  Link as MuiLink,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import { useSidebar } from '../context/SidebarContext';

interface AppLayoutV2Props {
  children: React.ReactNode;
}

// Helper function to generate breadcrumbs from pathname
const generateBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter((segment) => segment !== '');

  if (segments.length === 0) {
    return [{ label: 'Dashboard', href: '/' }];
  }

  const breadcrumbs = [{ label: 'Dashboard', href: '/' }];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Format segment text
    let label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Special cases
    if (segment === 'tracker') label = 'T1';
    if (segment === 'tracker-t2') label = 'T2';
    if (segment === 'user') label = 'Usuario';
    if (segment === 'personnel') label = 'Personal';
    if (segment === 'report') label = 'Reportes';
    if (segment === 'inventory') label = 'Inventario';
    if (segment === 'order') label = 'Pedidos';
    if (segment === 'claim') label = 'Reclamos';
    if (segment === 'maintenance') label = 'Mantenimiento';

    breadcrumbs.push({
      label,
      href: currentPath,
    });
  });

  return breadcrumbs;
};

const AppLayoutV2: React.FC<AppLayoutV2Props> = ({ children }) => {
  const { isCollapsed, toggleCollapsed } = useSidebar();
  const theme = useTheme();
  const location = useLocation();

  const breadcrumbs = generateBreadcrumbs(location.pathname);
  const currentPage = breadcrumbs[breadcrumbs.length - 1];

  const sidebarWidth = isCollapsed ? 68 : 260;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: theme.transitions.create(['margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      {/* Header with Breadcrumbs */}
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 3,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          minHeight: 64,
          position: 'sticky',
          top: 60, // Below navbar (60px)
          zIndex: 1,
          borderRadius: '0 0 16px 16px', // Border radius en la parte inferior
        }}
      >

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ flex: 1 }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            if (index === 0) {
              return (
                <MuiLink
                  key={crumb.href}
                  component={Link}
                  to={crumb.href}
                  underline="hover"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'text.secondary',
                    fontSize: 14,
                    fontWeight: 500,
                    '&:hover': {
                      color: 'secondary.main',
                    },
                  }}
                >
                  <HomeIcon fontSize="small" />
                  {crumb.label}
                </MuiLink>
              );
            }

            return isLast ? (
              <Typography
                key={crumb.href}
                sx={{
                  color: 'text.primary',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {crumb.label}
              </Typography>
            ) : (
              <MuiLink
                key={crumb.href}
                component={Link}
                to={crumb.href}
                underline="hover"
                sx={{
                  color: 'text.secondary',
                  fontSize: 14,
                  fontWeight: 500,
                  '&:hover': {
                    color: 'secondary.main',
                  },
                }}
              >
                {crumb.label}
              </MuiLink>
            );
          })}
        </Breadcrumbs>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          p: 3,
          minHeight: 'calc(100vh - 124px)', // 60px navbar + 64px header
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppLayoutV2;
