import React, { useState } from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
  Box,
  alpha,
  useTheme,
  Popover,
  Paper,
  Typography,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useSidebar } from '../context/SidebarContext';

export interface SidebarSubItem {
  text: string;
  href: string;
  id: string;
  permissions?: string[];
  visible?: boolean;
}

export interface SidebarItemV2Props {
  text: string;
  icon: React.ReactNode;
  id: string;
  subItems: SidebarSubItem[];
  visible?: boolean;
}

const SidebarItemV2: React.FC<SidebarItemV2Props> = ({
  text,
  icon,
  subItems,
  visible = true,
}) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { isCollapsed } = useSidebar();
  const location = useLocation();
  const theme = useTheme();

  if (!visible) return null;

  const hasActiveSubItem = subItems.some(
    (item) => item.visible && item.href === location.pathname
  );

  const handleClick = () => {
    if (!isCollapsed) {
      setOpen(!open);
    }
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    if (isCollapsed) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleMouseLeave = () => {
    if (isCollapsed) {
      setAnchorEl(null);
    }
  };

  const popoverOpen = Boolean(anchorEl);

  const visibleSubItems = subItems.filter((item) => item.visible);

  if (visibleSubItems.length === 0) return null;

  return (
    <>
      <ListItem
        disablePadding
        sx={{ display: 'block', mb: 0.5 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ListItemButton
          onClick={handleClick}
          sx={{
            minHeight: 44,
            justifyContent: isCollapsed ? 'center' : 'initial',
            px: 2,
            py: 1,
            borderRadius: 2.5, // Aumentado de 1.5 a 2.5
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              '& .MuiListItemIcon-root': {
                color: theme.palette.primary.light,
              },
              '& .MuiListItemText-primary': {
                color: theme.palette.primary.light,
              },
            },
            ...(hasActiveSubItem && {
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
              borderLeft: `3px solid ${theme.palette.primary.main}`,
              paddingLeft: '13px',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
            }),
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isCollapsed ? 0 : 2,
              justifyContent: 'center',
              color: hasActiveSubItem
                ? theme.palette.primary.main
                : 'rgba(255, 255, 255, 0.6)',
              transition: 'all 0.2s',
            }}
          >
            {icon}
          </ListItemIcon>
          <ListItemText
            primary={text}
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: hasActiveSubItem ? 600 : 500,
              color: hasActiveSubItem ? 'primary.main' : 'rgba(255, 255, 255, 0.9)',
            }}
            sx={{
              opacity: isCollapsed ? 0 : 1,
              transition: 'opacity 0.2s',
              display: isCollapsed ? 'none' : 'block',
            }}
          />
          {!isCollapsed && (
            <Box
              sx={{
                transition: 'transform 0.2s',
                transform: open ? 'rotate(0deg)' : 'rotate(0deg)',
                display: 'flex',
                alignItems: 'center',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              {open ? (
                <ExpandMoreIcon fontSize="small" />
              ) : (
                <ChevronRightIcon fontSize="small" />
              )}
            </Box>
          )}
        </ListItemButton>
      </ListItem>

      {/* SubItems */}
      {!isCollapsed && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {visibleSubItems.map((subItem) => {
              const isActive = subItem.href === location.pathname;
              return (
                <ListItem
                  key={subItem.id}
                  disablePadding
                  sx={{ display: 'block' }}
                >
                  <ListItemButton
                    component={Link}
                    to={subItem.href}
                    sx={{
                      minHeight: 36,
                      pl: 5,
                      pr: 2,
                      py: 0.5,
                      borderRadius: 2, // Aumentado de 1.5 a 2
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        pl: 5.5,
                        '& .MuiListItemIcon-root svg': {
                          color: theme.palette.primary.light,
                        },
                        '& .MuiListItemText-primary': {
                          color: theme.palette.primary.light,
                        },
                      },
                      ...(isActive && {
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        borderLeft: `3px solid ${theme.palette.primary.main}`,
                        pl: 4.7,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.16),
                          pl: 5.2,
                        },
                      }),
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: 1.5,
                        justifyContent: 'center',
                      }}
                    >
                      <FiberManualRecordIcon
                        sx={{
                          fontSize: 8,
                          color: isActive
                            ? theme.palette.primary.main
                            : 'rgba(255, 255, 255, 0.3)',
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={subItem.text}
                      primaryTypographyProps={{
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? 'primary.main' : 'rgba(255, 255, 255, 0.7)',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Collapse>
      )}

      {/* Popover for collapsed state */}
      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handleMouseLeave}
        disableRestoreFocus
        sx={{
          pointerEvents: 'none',
        }}
        PaperProps={{
          onMouseEnter: () => setAnchorEl(anchorEl),
          onMouseLeave: handleMouseLeave,
          sx: {
            pointerEvents: 'auto',
            ml: 1,
            minWidth: 200,
            backgroundColor: '#2a2a2a',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          },
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 600,
              fontSize: '0.875rem',
              mb: 1,
              px: 1,
            }}
          >
            {text}
          </Typography>
          <List component="div" disablePadding>
            {visibleSubItems.map((subItem) => {
              const isActive = subItem.href === location.pathname;
              return (
                <ListItemButton
                  key={subItem.id}
                  component={Link}
                  to={subItem.href}
                  sx={{
                    minHeight: 36,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    mb: 0.5,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      transform: 'translateX(4px)',
                    },
                    ...(isActive && {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                      borderLeft: `3px solid ${theme.palette.primary.main}`,
                      paddingLeft: '13px',
                    }),
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 1.5,
                      justifyContent: 'center',
                    }}
                  >
                    <FiberManualRecordIcon
                      sx={{
                        fontSize: 8,
                        color: isActive
                          ? theme.palette.primary.main
                          : 'rgba(255, 255, 255, 0.4)',
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={subItem.text}
                    primaryTypographyProps={{
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'primary.main' : 'rgba(255, 255, 255, 0.85)',
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      </Popover>
    </>
  );
};

export default SidebarItemV2;
