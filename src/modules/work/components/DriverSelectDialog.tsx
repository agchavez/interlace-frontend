import { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Autocomplete, TextField,
    Box, Typography, Chip, CircularProgress,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import {
    useGetPersonnelAutocompleteQuery,
    type PersonnelAutocompleteItem,
} from '../../personnel/services/personnelApi';

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: (driverId: number) => void;
    loading?: boolean;
    suggestedDriverId?: number | null;
    suggestedDriverName?: string | null;
    truckCode?: string | null;
};

export default function DriverSelectDialog({
    open, onClose, onConfirm, loading,
    suggestedDriverId, suggestedDriverName, truckCode,
}: Props) {
    const [selected, setSelected] = useState<PersonnelAutocompleteItem | null>(null);

    const { data: drivers = [], isFetching } = useGetPersonnelAutocompleteQuery(
        { position_type: 'DELIVERY_DRIVER', is_active: true, limit: 200 },
        { skip: !open },
    );

    useEffect(() => {
        if (!open) { setSelected(null); return; }
        if (suggestedDriverId && drivers.length) {
            const found = drivers.find((d) => d.id === suggestedDriverId);
            if (found) setSelected(found);
        }
    }, [open, suggestedDriverId, drivers]);

    const handleConfirm = () => {
        if (selected) onConfirm(selected.id);
    };

    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="h6" fontWeight={800} component="span">
                        Chofer del viaje
                    </Typography>
                </Box>
                {truckCode && (
                    <Typography variant="caption" color="text.secondary">
                        Camión {truckCode}
                    </Typography>
                )}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Selecciona el chofer que llevará este transporte.
                </Typography>
                {suggestedDriverId && suggestedDriverName && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            Sugerencia (chofer habitual de este camión):
                        </Typography>
                        <Chip
                            label={suggestedDriverName}
                            color={selected?.id === suggestedDriverId ? 'primary' : 'default'}
                            variant={selected?.id === suggestedDriverId ? 'filled' : 'outlined'}
                            onClick={() => {
                                const found = drivers.find((d) => d.id === suggestedDriverId);
                                if (found) setSelected(found);
                            }}
                            size="small"
                        />
                    </Box>
                )}
                <Autocomplete
                    options={drivers}
                    value={selected}
                    onChange={(_, v) => setSelected(v)}
                    getOptionLabel={(o) => `${o.full_name}${o.employee_code ? ` · ${o.employee_code}` : ''}`}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    loading={isFetching}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Chofer"
                            placeholder="Buscar por nombre o código"
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {isFetching ? <CircularProgress size={16} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={loading}>Cancelar</Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={!selected || loading}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    Despachar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
