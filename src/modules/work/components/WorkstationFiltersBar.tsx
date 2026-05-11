/**
 * Barra de filtros para la Workstation operativa (RoleWorkstationPage).
 * Permite filtrar por personal (multi), fecha y turno del CD. Los filtros
 * activos se muestran como chips debajo, estilo TokenListPage.
 */
import { useEffect, useMemo } from 'react';
import {
    Autocomplete, Box, MenuItem, TextField, Stack, Grid,
} from '@mui/material';
import {
    Person as PersonIcon, Schedule as ShiftIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { format, parse } from 'date-fns';
import { todayInHonduras } from '../../../utils/timezone';
import { useGetDcShiftsQuery } from '../../../store/maintenance/maintenanceApi';
import ChipFilterCategory from '../../ui/components/ChipFilter';

export interface PersonOption {
    id: number;
    name: string;
    code: string;
}

interface Props {
    personnelOptions: PersonOption[];
    selectedPersonnelIds: number[];
    onPersonnelChange: (ids: number[]) => void;
    date: string;
    onDateChange: (date: string) => void;
    dcId?: number | null;
    shiftId: number | null;
    onShiftChange: (id: number | null) => void;
}

const DOW_FROM_INDEX: Array<'MON'|'TUE'|'WED'|'THU'|'FRI'|'SAT'|'SUN'> = [
    'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT',
];

export default function WorkstationFiltersBar({
    personnelOptions, selectedPersonnelIds, onPersonnelChange,
    date, onDateChange,
    dcId, shiftId, onShiftChange,
}: Props) {
    const today = useMemo(() => todayInHonduras(), []);

    // Día de la semana de la fecha seleccionada → filtra los turnos disponibles.
    const dayOfWeek = useMemo(() => {
        const d = parse(date, 'yyyy-MM-dd', new Date());
        return DOW_FROM_INDEX[d.getDay()];
    }, [date]);

    const { data: shiftsResp } = useGetDcShiftsQuery(
        { distributor_center: dcId || undefined, day_of_week: dayOfWeek, is_active: true, limit: 100 },
        { skip: !dcId },
    );
    const shifts = shiftsResp?.results || [];

    const selectedPeople = useMemo(
        () => personnelOptions.filter((p) => selectedPersonnelIds.includes(p.id)),
        [personnelOptions, selectedPersonnelIds],
    );
    const selectedShift = useMemo(
        () => shifts.find((s) => s.id === shiftId) || null,
        [shifts, shiftId],
    );

    /** Turno actualmente aplicado al SIC/agregados:
     *  - Si el usuario eligió uno explícito → ese.
     *  - Si no y es hoy → el turno cuyo rango horario contiene la hora actual.
     *  - Si no se puede inferir → null. */
    const activeShift = useMemo(() => {
        if (selectedShift) return selectedShift;
        if (date !== today || shifts.length === 0) return null;
        const now = new Date();
        const minutesNow = now.getHours() * 60 + now.getMinutes();
        const toMinutes = (hhmmss: string) => {
            const [h, m] = hhmmss.split(':');
            return parseInt(h, 10) * 60 + parseInt(m, 10);
        };
        for (const s of shifts) {
            const start = toMinutes(s.start_time);
            const end = toMinutes(s.end_time);
            const inRange = end > start
                ? (minutesNow >= start && minutesNow < end)
                : (minutesNow >= start || minutesNow < end); // cruza medianoche
            if (inRange) return s;
        }
        return null;
    }, [selectedShift, date, today, shifts]);

    // Si el turno seleccionado deja de estar disponible (al cambiar el día),
    // limpiamos la selección para no enviar un shift_id inválido al backend.
    useEffect(() => {
        if (shiftId && shifts.length > 0 && !shifts.some((s) => s.id === shiftId)) {
            onShiftChange(null);
        }
    }, [shifts, shiftId, onShiftChange]);

    const filterChips = (
        <Grid container spacing={1}>
            {selectedPeople.length > 0 && (
                <ChipFilterCategory
                    label="Personal:"
                    items={selectedPeople.map((p) => ({
                        id: String(p.id),
                        label: `${p.name.split(' ').slice(0, 2).join(' ')} · ${p.code}`,
                        deleteAction: () => onPersonnelChange(
                            selectedPersonnelIds.filter((id) => id !== p.id),
                        ),
                    }))}
                />
            )}
            {date !== today && (
                <ChipFilterCategory
                    label="Fecha:"
                    items={[{
                        id: 'date',
                        label: new Date(date + 'T00:00:00').toLocaleDateString('es-HN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                        }),
                        deleteAction: () => onDateChange(today),
                    }]}
                />
            )}
            {selectedShift && (
                <ChipFilterCategory
                    label="Turno:"
                    items={[{
                        id: 'shift',
                        label: `${selectedShift.shift_name} (${selectedShift.start_time.slice(0,5)}–${selectedShift.end_time.slice(0,5)})`,
                        deleteAction: () => onShiftChange(null),
                    }]}
                />
            )}
        </Grid>
    );

    const hasActiveChips = selectedPeople.length > 0 || date !== today || !!selectedShift;

    return (
        <Stack spacing={1} sx={{ width: '100%' }}>
            {/* Banner del turno actual — siempre visible para que el usuario sepa
                qué turno está viendo. Si seleccionó uno, lo muestra; si no y es
                hoy, deduce el turno cuya franja horaria contiene la hora actual. */}
            {activeShift && (
                <Box sx={{
                    display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start',
                    bgcolor: 'rgba(255,255,255,0.92)', color: '#1f2937',
                    borderRadius: 1, px: 1, py: 0.4,
                    border: '2px solid #d97706', gap: 0.6,
                    fontSize: '0.75rem', fontWeight: 800,
                }}>
                    <span style={{ opacity: 0.7 }}>TURNO ACTUAL:</span>
                    <span>{activeShift.shift_name}</span>
                    <span style={{ opacity: 0.7, fontFamily: 'monospace', fontWeight: 700 }}>
                        {activeShift.start_time.slice(0, 5)}–{activeShift.end_time.slice(0, 5)}
                    </span>
                </Box>
            )}
            <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap',
                bgcolor: 'rgba(255,255,255,0.85)', borderRadius: 1, p: 0.75,
            }}>
                <Autocomplete<PersonOption, true>
                    multiple
                    size="small"
                    options={personnelOptions}
                    value={selectedPeople}
                    onChange={(_, newValue) => onPersonnelChange(newValue.map((p) => p.id))}
                    getOptionLabel={(o) => `${o.name} · ${o.code}`}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    sx={{ minWidth: 240, flex: '1 1 260px', maxWidth: 420 }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder={selectedPeople.length ? '' : 'Todas las personas'}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <>
                                        <PersonIcon sx={{ fontSize: 18, mr: 0.5, color: 'action.active' }} />
                                        {params.InputProps.startAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />
                <DatePicker
                    value={parse(date, 'yyyy-MM-dd', new Date())}
                    onChange={(d) => {
                        if (!d || isNaN(d.getTime())) return;
                        onDateChange(format(d, 'yyyy-MM-dd'));
                    }}
                    maxDate={parse(today, 'yyyy-MM-dd', new Date())}
                    format="dd/MM/yyyy"
                    slotProps={{
                        textField: { size: 'small', sx: { minWidth: 170 } },
                    }}
                />
                <TextField
                    select
                    size="small"
                    value={shiftId ?? ''}
                    onChange={(e) => onShiftChange(e.target.value ? Number(e.target.value) : null)}
                    sx={{ minWidth: 180 }}
                    InputProps={{
                        startAdornment: (
                            <ShiftIcon sx={{ fontSize: 18, mr: 0.5, color: 'action.active' }} />
                        ),
                    }}
                >
                    <MenuItem value="">Turno activo</MenuItem>
                    {shifts.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                            {s.shift_name} · {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>
            {hasActiveChips && <Box>{filterChips}</Box>}
        </Stack>
    );
}
