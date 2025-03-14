
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../../store/auth/authApi";
import { Navigate } from "react-router-dom";
import { toast } from 'sonner';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import {  SitemarkIcon } from './CustomIcons';
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "../../ui/components/BoostrapDialog";
import {login} from "../../../store/auth";
import {Alert} from "@mui/material";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialogContent-root": {
        padding: theme.spacing(2),
    },
    "& .MuiDialogActions-root": {
        padding: theme.spacing(1),
    },
}));

const schema = yup.object().shape({
    email: yup.string()
        .required('Campo requerido')
        .email('Correo inválido'),
    password: yup.string()
        .required('La contraseña es requerida')
});

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    [theme.breakpoints.up('sm')]: {
        width: '450px',
    },
}));

export default function SignInCard() {
    const dispatch = useDispatch();
    const [loginAPI, resultLogin] = useLoginMutation();
    const [openDialog, setOpenDialog] = useState(false);
    const [remember, setRemember] = useState(localStorage.getItem('remember') ? true : false)
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: localStorage.getItem('remember') || '',
            password: '' },
        resolver: yupResolver(schema)
    });

    const onSubmit = async (data) => {
        const { email, password } = data;
        if(remember){
            localStorage.setItem('remember', email);
        }else{
            localStorage.removeItem('remember');
        }
        await loginAPI({
            email,
            password
        });
    };

    useEffect(() => {
        if (resultLogin.error) {
            toast.error("Correo o Contraseña incorrecto");
        }
    }, [resultLogin.error]);

    if (resultLogin.isSuccess) {
        dispatch(login(resultLogin.data))
        return <Navigate to="/" />
    }

    return (
        <>
        <Card variant="outlined">
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <SitemarkIcon />
            </Box>
            <Typography component="h1" variant="h4">
                Iniciar Sesión
            </Typography>
            <Typography variant="body1">
                Ingrese sus credenciales para acceder al sistema
            </Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl>
                    <FormLabel htmlFor="email">Correo</FormLabel>
                    <TextField
                        id="email"
                        type="email"
                        {...register("email")}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        required
                        fullWidth
                    />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="password">
                        Contraseña
                    </FormLabel>
                    <TextField
                        id="password"
                        type="password"
                        {...register("password")}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        required
                        fullWidth
                    />
                </FormControl>
                <FormControlLabel
                    control={<Checkbox checked={remember} onChange={()=>setRemember(!remember)} value={remember} /> }
                    label="Recordar usuario"
                />
                <Button type="submit" variant="contained" color="primary" disabled={resultLogin.isLoading}>
                    {resultLogin.isLoading ? "Cargando..." : "Iniciar Sesión"}
                </Button>
                <Button color="secondary" onClick={() => setOpenDialog(true)}>
                    ¿No tienes cuenta?
                </Button>
            </Box>


        </Card>

            <BootstrapDialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle onClose={() => setOpenDialog(false)} id="customized-dialog-title">
                    Solicitud de Cuenta
                </DialogTitle>
                <DialogContent >
                    <Box sx={{
                        p:2
                    }}>
                        <Typography variant="body1" component="div" gutterBottom>
                            Para crear una cuenta, comuníquese con el administrador del sistema
                        </Typography>
                    </Box>
                </DialogContent>
            </BootstrapDialog>
    </>
    );
}
