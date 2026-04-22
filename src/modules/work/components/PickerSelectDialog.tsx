import { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Autocomplete, TextField,
    Box, Typography, CircularProgress,
} from '@mui/material';
import { Inventory as PickerIcon } from '@mui/icons-material';
import {
    useGetPersonnelAutocompleteQuery,
    type PersonnelAutocompleteItem,
} from '../../personnel/services/personnelApi';

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: (personnelId: number) => void;
    loading?: boolean;
    distributorCenterId?: number | null;
    title?: string;
    description?: string;
    actionLabel?: string;
};

export default function PickerSelectDialog({
    open, onClose, onConfirm, loading,
    distributorCenterId,
    title = 'Picker asignado',
    description = 'Selecciona al picker que armará esta pauta.',
    actionLabel = 'Asignar',
}: Props) {
    const [selected, setSelected] = useState<PersonnelAutocompleteItem | null>(null);

    const { data: pickers = [], isFetching } = useGetPersonnelAutocompleteQuery(
        {
            position_type: 'PICKER,LOADER',
            is_active: true,
            limit: 200,
            ...(distributorCenterId ? { primary_distributor_center: distributorCenterId } : {}),
        },
        { skip: !open },
    );

    useEffect(() => {
        if (!open) setSelected(null);
    }, [open]);

    const handleConfirm = () => {
        if (selected) onConfirm(selected.id);
    };

    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PickerIcon color="primary" />
                    <Typography variant="h6" fontWeight={800} component="span">
                        {title}
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {description}
                </Typography>
                <Autocomplete
                    options={pickers}
                    value={selected}
                    onChange={(_, v) => setSelected(v)}
                    getOptionLabel={(o) => `${o.full_name}${o.employee_code ? ` · ${o.employee_code}` : ''}`}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    loading={isFetching}
                    autoHighlight
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Picker"
                            placeholder="Buscar por nombre o código"
                            autoFocus
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
                    {actionLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
