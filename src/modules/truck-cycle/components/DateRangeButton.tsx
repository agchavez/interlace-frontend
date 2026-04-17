import { Button, Menu, MenuItem, ListItemText } from '@mui/material';
import { FilterList as FilterIcon } from '@mui/icons-material';
import { DateRangeKey, DATE_LABELS } from '../hooks/useDateRangeFilter';

interface Props {
    dateRange: DateRangeKey;
    setDateRange: (v: DateRangeKey) => void;
    menuAnchor: null | HTMLElement;
    setMenuAnchor: (v: null | HTMLElement) => void;
}

export default function DateRangeButton({ dateRange, setDateRange, menuAnchor, setMenuAnchor }: Props) {
    return (
        <>
            <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{ textTransform: 'none', fontWeight: 600 }}
            >
                {DATE_LABELS[dateRange]}
            </Button>
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                PaperProps={{ sx: { minWidth: 160, borderRadius: 2 } }}
            >
                {(['today', 'week', 'month', 'year'] as const).map((key) => (
                    <MenuItem
                        key={key}
                        selected={dateRange === key}
                        onClick={() => { setDateRange(key); setMenuAnchor(null); }}
                    >
                        <ListItemText>{DATE_LABELS[key]}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
