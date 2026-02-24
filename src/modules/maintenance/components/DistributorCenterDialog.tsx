// DistributorCenterDialog.tsx

import { useEffect } from "react";
import {
    DialogContent,
    DialogActions,
    Button,
    TextField, Typography, Box, Divider
} from "@mui/material";
import DialogTitle from "../../ui/components/BootstrapDialogTitle";
import { useForm } from "react-hook-form";
import {CountrySelect} from "../../ui/components/CountrySelect.tsx";
import {DistributorCenter} from "../../../interfaces/maintenance";
import {
    useCreateDistributorCenterMutation,
    useUpdateDistributorCenterMutation
} from "../../../store/maintenance/maintenanceApi.ts";
import {toast} from "sonner";
import {BootstrapDialog} from "../../tracker/components/ClaimDialog.tsx";


interface Props {
    open: boolean;
    onClose: () => void;
    initialData: DistributorCenter | null; // si es null => crear, si no => editar
}

interface FormData {
    name: string;
    direction: string;
    country: number | null; // guardamos el ID del país
    location: string
}

export function DistributorCenterDialog({ open, onClose, initialData }: Props) {
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            name: "",
            direction: "",
            country: null,
            location: ""
        },
    });

    const [createDC] = useCreateDistributorCenterMutation();
    const [updateDC] = useUpdateDistributorCenterMutation();

    // Cada vez que cambie initialData, cargamos sus valores
    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                direction: initialData.direction,
                country: initialData.country ?? null,
                location: ""
            });
        } else {
            reset({
                name: "",
                direction: "",
                country: null,
                location: ""
            });
        }
    }, [initialData, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            if (initialData) {
                // actualizar
                await updateDC({
                    id: initialData.id,
                    data: {
                        name: data.name,
                        direction: data.direction,
                        country: data.country ?? undefined,
                    },
                }).unwrap();
                toast.success("Distributor Center updated");
            } else {
                // crear
                await createDC({
                    name: data.name,
                    direction: data.direction,
                    country: data.country ?? undefined,
                }).unwrap();
                toast.success("Distributor Center created");
            }
            onClose();
        } catch (error: any) {
            toast.error("Could not save");
        }
    };

    return (
        <BootstrapDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle onClose={onClose} id="customized-dialog-title">
                <Typography variant="h6" color="white" fontWeight={400}>
                    {initialData ? "Editar" : "Crear"} Centro de Distribución
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="white">
                    Complete el formulario para {initialData ? "editar" : "crear"} un centro de distribución
                </Typography>
                </Box>
            </DialogTitle>
            <Divider sx={{ mt: 1 }} />
            <DialogContent>
                <TextField
                    label="Nombre"
                    size={"small"}
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2 }}
                    {...register("name", { required: "Name is required" })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                />

                <TextField
                    label="Direction"
                    variant="outlined"
                    size={"small"}
                    fullWidth
                    multiline
                    rows={4}
                    sx={{ mb: 2 }}
                    {...register("direction")}
                />

                <CountrySelect<FormData>
                    control={control}
                    name="country"
                    label="País"
                    searchBase={initialData?.data_country?.name ?? ""}
                />
                <Divider>
                    <Typography variant="body2" textAlign="start" sx={{ mb: 1 }} color="text.secondary">
                        Localidad
                    </Typography>
                </Divider>
                <TextField
                    label="Localidad"
                    variant="outlined"
                    size={"small"}
                    fullWidth
                    multiline
                    rows={4}
                    sx={{ mb: 2 }}
                    {...register("location" as const)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit(onSubmit)}>
                    Guardar
                </Button>
            </DialogActions>
        </BootstrapDialog>
    );
}
