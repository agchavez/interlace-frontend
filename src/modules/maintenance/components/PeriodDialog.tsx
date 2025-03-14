import { useEffect, useState } from "react";
import { Box, Chip, Divider, Button, DialogContent, DialogActions, Typography, Grid, CircularProgress } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { BootstrapDialog } from "../../tracker/components/ClaimDialog";
import { Period } from "../../../interfaces/maintenance";
import { ProductSelect } from "../../ui/components/ProductSelect";
import DialogTitle from "../../ui/components/BoostrapDialog";
import { format, isValid } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { useCreatePeriodMutation, useUpdatePeriodMutation } from "../../../store/maintenance/maintenanceApi.ts";

// Esquema de validación
const schema = yup.object().shape({
    label: yup.string().oneOf(["A", "B", "C"]).required("La etiqueta es obligatoria").nullable(),
    initialDate: yup.string().required("La fecha inicial es obligatoria"),
    product: yup.number().nullable().required("El producto es obligatorio"),
});

interface FormData {
    label: "A" | "B" | "C" | null;
    initialDate: string;
    product: number | null;
}

interface Props {
    open: boolean;
    onClose: () => void;
    initialData: Period | null;
}

export function PeriodDialog({ open, onClose, initialData }: Props) {
    const timeZone = "America/Tegucigalpa";
    const [loading, setLoading] = useState(false);

    const {
        handleSubmit,
        reset,
        control,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            label: null,
            initialDate: format(utcToZonedTime(new Date(), timeZone), "yyyy-MM-dd 00:00:00"),
            product: null,
        },
    });

    useEffect(() => {
        if (initialData) {
            reset({
                label: initialData.label,
                initialDate: initialData.initialDate,
                product: initialData.product || null,
            });
        } else {
            reset({
                label: null,
                initialDate: format(utcToZonedTime(new Date(), timeZone), "yyyy-MM-dd 00:00:00"),
                product: null,
            });
        }
    }, [initialData, reset, timeZone]);

    const [updatePeriod, { isLoading: isUpdating }] = useUpdatePeriodMutation();
    const [createPeriod, { isLoading: isCreating }] = useCreatePeriodMutation();

    useEffect(() => {
        setLoading(isUpdating || isCreating);
    }, [isUpdating, isCreating]);

    const onSubmit = async (data: FormData) => {
        try {
            if (initialData) {
                await updatePeriod({
                    id: initialData.id,
                    data: {
                        label: data.label!,
                        initialDate: data.initialDate.split(" ")[0],
                        product: data.product ?? undefined,
                    },
                }).unwrap();
                toast.success("Periodo actualizado");
            } else {
                await createPeriod({
                    label: data.label!,
                    initialDate: data.initialDate.split(" ")[0],
                    product: data.product ?? undefined,
                }).unwrap();
                toast.success("Periodo creado");
            }
            onClose();
        } catch (error: any) {
            toast.error("No se pudo guardar el periodo");
        }
    };

    return (
        <BootstrapDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle onClose={onClose} id="customized-dialog-title">
                <Typography variant="h6" color="white" fontWeight={400}>
                    {initialData ? "Editar Periodo" : "Crear Periodo"}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" color="white">
                        Llena el formulario para {initialData ? "editar" : "crear"} un periodo
                    </Typography>
                </Box>
            </DialogTitle>
            <Divider sx={{ mt: 1 }} />
            <DialogContent>
                <Box component="form">
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1">Etiqueta</Typography>
                            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                {["A", "B", "C"].map((label) => (
                                    <Controller
                                        key={label}
                                        name="label"
                                        control={control}
                                        render={({ field }) => (
                                            <Chip
                                                label={label}
                                                clickable
                                                color={field.value === label ? "primary" : "default"}
                                                onClick={() => field.onChange(label)}
                                            />
                                        )}
                                    />
                                ))}
                            </Box>
                            {errors.label && <Typography color="error">{errors.label.message}</Typography>}
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="initialDate"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        label="Del"
                                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                        value={isValid(new Date(watch("initialDate"))) ? utcToZonedTime(new Date(watch("initialDate")), timeZone) : null}
                                        inputRef={field.ref}
                                        format="dd/MM/yyyy"
                                        onChange={(date) => {
                                            isValid(date) && date &&
                                            field.onChange(format(zonedTimeToUtc(date, timeZone), 'yyyy-MM-dd 00:00:00'));
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <ProductSelect<FormData>
                                control={control}
                                name="product"
                                placeholder="Buscar producto"
                            />
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancelar</Button>
                <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : "Guardar"}
                </Button>
            </DialogActions>
        </BootstrapDialog>
    );
}