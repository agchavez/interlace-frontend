import { Box, InputAdornment, TextField, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

interface Props {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

/**
 * Buscador compacto — filtra en cliente por número de transporte, código de camión o placa.
 */
export default function PautaSearchBar({ value, onChange, placeholder = 'Buscar transporte, camión o ruta...' }: Props) {
    return (
        <Box sx={{ mb: 2 }}>
            <TextField
                fullWidth
                size="small"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                    ),
                    endAdornment: value ? (
                        <InputAdornment position="end">
                            <IconButton size="small" onClick={() => onChange('')}>
                                <ClearIcon fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    ) : null,
                    sx: {
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                    },
                }}
            />
        </Box>
    );
}

/**
 * Filtra una lista de pautas por un texto contra transporte, camión, placa, ruta.
 */
export function filterPautasByText<T extends {
    transport_number?: string;
    truck_code?: string;
    truck_plate?: string;
    route_code?: string;
}>(pautas: T[], q: string): T[] {
    if (!q) return pautas;
    const needle = q.trim().toLowerCase();
    return pautas.filter((p) => {
        const transport = (p.transport_number || '').toLowerCase();
        const truckCode = (p.truck_code || '').toLowerCase();
        const plate = (p.truck_plate || '').toLowerCase();
        const route = (p.route_code || '').toLowerCase();
        return (
            transport.includes(needle)
            || truckCode.includes(needle)
            || plate.includes(needle)
            || route.includes(needle)
        );
    });
}
