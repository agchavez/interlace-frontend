
import { Box, Button, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, TextField, Typography, styled } from "@mui/material";
import { FunctionComponent, useEffect } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { GetAUserResponse, User } from "../../../interfaces/user";

import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { startResetPassword } from '../../../store/user/thunk';
import BootstrapDialogTitle from "../../ui/components/BootstrapDialogTitle";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const schema = yup.object().shape({
    password: yup.string().required("Campo requerido").min(6, "La contraseña debe tener al menos 6 caracteres")
});


interface DeleteCheckProps {
    user?: Partial<User & GetAUserResponse>;
    open: boolean;
    handleClose: () => void;
}

interface ChangePasswordForm {
    password: string;
}

export const ChangePasswordModal: FunctionComponent<DeleteCheckProps> = ({ open, handleClose, user }) => {
    const dispatch = useAppDispatch();
    const { loading } = useAppSelector(state => state.user)
    const handleClickContinuar = (data: ChangePasswordForm) => {
        dispatch(startResetPassword(user?.id as number, data.password, handleClose));
    }

    const {
        register, handleSubmit, formState: { errors }, reset
    } = useForm<ChangePasswordForm>({
        defaultValues: {
            // Una contraseña por defecto abindeb<numero random de 4 digitos>
            password: "Abinbev" + Math.floor(Math.random() * 10000)
        },
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        reset({
            password: "Abinbev" + Math.floor(Math.random() * 10000)
        });
    }, [reset, user]);


    return <BootstrapDialog open={open} onClose={handleClose} fullWidth={true} maxWidth="sm">
        <BootstrapDialogTitle id="customized-dialog-title" onClose={() => handleClose && handleClose()}>
            <Typography variant="h6" fontWeight={600} color={'#fff'}>
                Restablecer Contraseña
            </Typography>
        </BootstrapDialogTitle>
        <DialogContent dividers >
            <Box >
                <Container maxWidth="xl">
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography>
                                ¿Está seguro que desea restablecer la contraseña del usuario {`${user?.first_name} ${user?.last_name}`}?
                            </Typography>
                            <form onSubmit={handleSubmit(handleClickContinuar)}>
                            <TextField
                                id="outlined-basic"
                                label="Contraseña"
                                variant="outlined"
                                fullWidth
                                autoComplete="off"
                                size="small"
                                sx={{ mt: 2 }}
                                {...register("password")}
                                disabled={loading}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                            />
                            </form>

                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button variant="text" color="inherit" size="medium" onClick={() => handleClose && handleClose()}>
                
                    CANCELAR
            </Button>
            <Button variant="contained" color="primary" size="medium" type="submit" onClick={handleSubmit(handleClickContinuar)} 
                disabled={!!errors.password}
                startIcon={loading && <CircularProgress size={20} />}
                >
                <Typography variant="body2" component="span" fontWeight={400} color={'gray.700'}>
                    CONTINUAR
                </Typography>
            </Button>
        </DialogActions>
    </BootstrapDialog>
}