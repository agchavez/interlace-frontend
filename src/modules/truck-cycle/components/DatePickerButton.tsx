import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';

interface Props {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    minDate?: string;
    maxDate?: string;
    size?: 'small' | 'medium';
}

export default function DatePickerButton({
    value,
    onChange,
    label = 'Fecha',
    minDate,
    maxDate,
    size = 'small',
}: Props) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <DatePicker
                label={label}
                value={dayjs(value)}
                minDate={minDate ? dayjs(minDate) : undefined}
                maxDate={maxDate ? dayjs(maxDate) : undefined}
                onChange={(v: Dayjs | null) => {
                    if (v && v.isValid()) onChange(v.format('YYYY-MM-DD'));
                }}
                format="DD/MM/YYYY"
                slotProps={{
                    textField: {
                        size,
                        sx: { minWidth: 170 },
                    },
                }}
            />
        </LocalizationProvider>
    );
}
