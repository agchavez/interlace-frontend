import { useState } from 'react';
import {
    Fab, Menu, MenuItem, Divider, Typography, Box, ListItemText, Chip,
    ListSubheader,
} from '@mui/material';
import { BugReport as DevIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
    setDevRoleOverride, getDevRoleOverride, WORK_ROLE_TO_PATH,
    WORK_ROLE_LABEL, EXTRA_IMPERSONATION_GROUPS,
    getGroupImpersonation, setGroupImpersonation,
    type WorkRoleCode,
} from '../utils/workRole';
import { useDevRoleOverride } from '../utils/useDevRoleOverride';
import { useGroupImpersonation } from '../utils/useGroupImpersonation';

const ROLES: WorkRoleCode[] = ['PICKER', 'COUNTER', 'SECURITY', 'OPS', 'YARD_DRIVER', 'VENDOR'];

export default function DevRoleSwitcher() {
    if (!import.meta.env.DEV) return null;
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const role = useDevRoleOverride();
    const group = useGroupImpersonation();
    const navigate = useNavigate();

    const pickRole = (r: WorkRoleCode | null) => {
        setDevRoleOverride(r);
        setGroupImpersonation(null);
        setAnchorEl(null);
        if (r) navigate(WORK_ROLE_TO_PATH[r]);
        else navigate('/work');
    };

    const pickGroup = (g: string | null) => {
        setGroupImpersonation(g);
        setDevRoleOverride(null);
        setAnchorEl(null);
        navigate('/');
    };

    const clearAll = () => {
        setDevRoleOverride(null);
        setGroupImpersonation(null);
        setAnchorEl(null);
        navigate('/');
    };

    const label = role
        ? WORK_ROLE_LABEL[role]
        : group
        ? `Grupo: ${group}`
        : 'Sin override';

    return (
        <Box>
            <Fab
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                    position: 'fixed', bottom: 16, right: 16, zIndex: 2000,
                    bgcolor: 'warning.main', color: '#fff',
                    '&:hover': { bgcolor: 'warning.dark' },
                }}
                aria-label="Dev role switcher"
            >
                <DevIcon />
            </Fab>
            <Menu
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                PaperProps={{ sx: { maxHeight: 480 } }}
            >
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        DEV · Efectivo
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                        {label}
                    </Typography>
                </Box>
                <Divider />

                <ListSubheader sx={{ lineHeight: '28px', fontSize: '0.7rem' }}>
                    Roles del Ciclo
                </ListSubheader>
                {ROLES.map((r) => (
                    <MenuItem key={r} selected={role === r} onClick={() => pickRole(r)}>
                        <ListItemText>{WORK_ROLE_LABEL[r]}</ListItemText>
                        {role === r && <Chip label="actual" size="small" color="warning" />}
                    </MenuItem>
                ))}

                <Divider />
                <ListSubheader sx={{ lineHeight: '28px', fontSize: '0.7rem' }}>
                    Otros grupos
                </ListSubheader>
                {EXTRA_IMPERSONATION_GROUPS.map((g) => (
                    <MenuItem key={g.name} selected={group === g.name} onClick={() => pickGroup(g.name)}>
                        <ListItemText>{g.label}</ListItemText>
                        {group === g.name && <Chip label="actual" size="small" color="warning" />}
                    </MenuItem>
                ))}

                <Divider />
                <MenuItem onClick={clearAll}>Quitar override</MenuItem>
            </Menu>
        </Box>
    );
}
