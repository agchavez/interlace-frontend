import { useEffect, useState } from "react";
import { Box, Divider, Button, DialogContent, DialogActions, Typography, Grid, CircularProgress, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { BootstrapDialog } from "../../tracker/components/ClaimDialog";
import DialogTitle from "../../ui/components/BoostrapDialog";
import { useCreateLocationMutation, useUpdateLocationMutation } from "../../../store/maintenance/maintenanceApi";
import { CountrySelect } from "../../ui/components/CountrySelect";

const schema = yup.object().shape({
    name: yup.string().required("El nombre es obligatorio"),
    code: yup.string().required("El código es obligatorio"),
    distributor_center: yup.number().nullable(),
    country: yup.number().nullable(),
});

interface FormData {
    name: string;
    code: string;
    distributor_center: number | null;
    country: number | null;
}

interface Props {
    open: boolean;
    onClose: () => void;
    initialData: LocationType | null;
}

export function LocationDialog({ open, onClose, initialData }: Props) {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            code: "",
            distributor_center: null,
            country: null,
        },
    });

    const [createLocation, { isLoading: isCreating }] = useCreateLocationMutation();
    const [updateLocation, { isLoading: isUpdating }] = useUpdateLocationMutation();

    useEffect(() => {
        setLoading(isCreating || isUpdating);
    }, [isCreating, isUpdating]);

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                code: initialData.code,
                distributor_center: initialData.distributor_center ?? null,
                country: initialData.country ?? null,
            });
        } else {
            reset({
                name: "",
                code: "",
                distributor_center: null,
                country: null,
            });
        }
    }, [initialData, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            if (initialData) {
                await updateLocation({
                    id: initialData.id,
                    data: {
                        name: data.name,
                        code: data.code,
                        distributor_center: data.distributor_center ?? undefined,
                        country: data.country ?? undefined,
                    },
                }).unwrap();
                toast.success("Localidad actualizada");
            } else {
                await createLocation({
                    name: data.name,
                    code: data.code,
                    distributor_center: data.distributor_center ?? undefined,
                    country: data.country ?? undefined,
                }).unwrap();
                toast.success("Localidad creada");
            }
            onClose();
        } catch (error: any) {
            toast.error("No se pudo guardar la localidad");
        }
    };

    return (
        <BootstrapDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle onClose={onClose} id="customized-dialog-title">
                <Typography variant="h6" color="white" fontWeight={400}>
                    {initialData ? "Editar" : "Crear"} Localidad
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="white">
                        Complete el formulario para {initialData ? "editar" : "crear"} una localidad
                    </Typography>
                </Box>
            </DialogTitle>
            <Divider sx={{ mt: 1 }} />
            <DialogContent>
                <Box component="form">
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Nombre"
                                size="small"
                                variant="outlined"
                                fullWidth
                                {...register("name")}
                                error={!!errors.name}
                                helperText={errors.name?.message}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Código"
                                size="small"
                                variant="outlined"
                                fullWidth
                                {...register("code")}
                                error={!!errors.code}
                                helperText={errors.code?.message}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Centro de Distribución"
                                size="small"
                                variant="outlined"
                                fullWidth
                                {...register("distributor_center")}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <CountrySelect<FormData>
                                control={control}
                                name="country"
                                label="País"
                            />
                        </Grid>
                    </Grid>
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