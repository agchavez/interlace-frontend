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
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "../../ui/components/BoostrapDialog";
import { login } from "../../../store/auth";
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { VisibilityOutlined, VisibilityOffOutlined } from "@mui/icons-material";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

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
    width: '100%',
    padding: theme.spacing(3),
    gap: theme.spacing(2),
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    [theme.breakpoints.up('sm')]: {
        width: '450px',
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2), // Menos padding en móviles
    },
}));

const LoginContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: theme.spacing(2),
    
    // Añadir padding-top para dispositivos móviles para evitar solapamiento con navbar
    [theme.breakpoints.down('sm')]: {
        paddingTop: theme.spacing(2), // Espacio adicional en la parte superior para móviles
        paddingBottom: theme.spacing(4),
        justifyContent: 'flex-start', // Alinear al inicio para móviles
    }
}));


export default function SignInCard() {
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [loginAPI, resultLogin] = useLoginMutation();
    const [openDialog, setOpenDialog] = useState(false);
    const [remember, setRemember] = useState(localStorage.getItem('remember') ? true : false);
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: localStorage.getItem('remember') || '',
            password: '' },
        resolver: yupResolver(schema)
    });

    interface FormData {
        email: string;
        password: string;
    }

    const onSubmit = async (data: FormData): Promise<void> => {
        const { email, password } = data;
        if (remember) {
            localStorage.setItem('remember', email);
        } else {
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
        <LoginContainer>    
            <Card variant="outlined">
            <Typography component="h2" variant="h5" fontWeight="bold" sx={{ mb: isMobile ? 0.5 : 1 }}>
                Iniciar Sesión
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: isMobile ? 0.5 : 2 }}>
                Ingrese sus credenciales para acceder al sistema
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: isMobile ? 1 : 2 
            }}>
                <FormControl>
                    <FormLabel htmlFor="email" sx={{ mb: 0.5 }}>Correo</FormLabel>
                    <TextField
                        id="email"
                        type="email"
                        {...register("email")}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        required
                        fullWidth
                        size="small"
                        sx={{ mb: isMobile ? 0.5 : 1 }}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="password" sx={{ mb: 0.5 }}>
                        Contraseña
                    </FormLabel>
                    <TextField
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        required
                        size="small"
                        fullWidth
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword(prevState => !prevState)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        edge="end"
                                        size="small"
                                    >
                                        {showPassword ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </FormControl>
                <FormControlLabel
                    control={
                        <Checkbox 
                            checked={remember} 
                            onChange={()=>setRemember(!remember)} 
                            value={remember}
                            size={isMobile ? "small" : "medium"}
                        />
                    }
                    label={<Typography variant={isMobile ? "caption" : "body2"}>Recordar usuario</Typography>}
                    sx={{ mt: 0 }}
                />
                <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    disabled={resultLogin.isLoading}
                    sx={{ py: isMobile ? 0.8 : 1.2, mt: 0.5 }}
                >
                    {resultLogin.isLoading ? "Cargando..." : "Iniciar Sesión"}
                </Button>
                <Button 
                    color="secondary" 
                    onClick={() => setOpenDialog(true)}
                    sx={{ mt: 0.5, py: isMobile ? 0.5 : 0.8 }}
                    size={isMobile ? "small" : "medium"}
                >
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
        </LoginContainer>
    );
}