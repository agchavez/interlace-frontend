import { useEffect, useMemo, useState } from 'react';
import { useForm } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../../store/auth/authApi";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
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
import DialogTitle from "../../ui/components/BootstrapDialogTitle";
import { login } from "../../../store/auth";
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
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
    login: yup.string()
        .required('El correo o nombre de usuario es requerido')
        .min(3, 'Mínimo 3 caracteres'),
    password: yup.string()
        .required('La contraseña es requerida')
        .min(6, 'Mínimo 6 caracteres')
});

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2.5),
    boxShadow: theme.palette.mode === 'dark'
        ? '0 8px 32px rgba(0, 0, 0, 0.4)'
        : '0 8px 32px rgba(0, 0, 0, 0.08)',
    borderRadius: '16px',
    background: theme.palette.mode === 'dark'
        ? theme.palette.background.paper
        : '#ffffff',
    border: `1px solid ${theme.palette.divider}`,

    [theme.breakpoints.up('sm')]: {
        width: '480px',
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(3),
        gap: theme.spacing(2),
    },
}));

const LoginContainer = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 0,
}));

const StyledButton = styled(Button)(({ theme }) => ({
    padding: theme.spacing(1.5),
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: '8px',
    boxShadow: 'none',

    '&:hover': {
        boxShadow: 'none',
    },

    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1.25),
        fontSize: '0.9375rem',
    },
}));

interface FormData {
    login: string;
    password: string;
}

export default function SignInCard() {
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [loginAPI, resultLogin] = useLoginMutation();
    const [openDialog, setOpenDialog] = useState(false);
    const [remember, setRemember] = useState(localStorage.getItem('remember') ? true : false);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            login: localStorage.getItem('remember') || '',
            password: ''
        },
        resolver: yupResolver(schema)
    });

    const location = useLocation();
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const navigate = useNavigate();

    const onSubmit = async (data: FormData): Promise<void> => {
        const { login, password } = data;
        if (remember) {
            localStorage.setItem('remember', login);
        } else {
            localStorage.removeItem('remember');
        }
        await loginAPI({ login, password });
    };

    useEffect(() => {
        if (resultLogin.error) {
            const error: any = resultLogin.error;
            const errorMessage = error?.data?.mensage || error?.data?.detail || "Correo o Contraseña incorrectos";
            toast.error(errorMessage);
        }
    }, [resultLogin.error]);

    if (resultLogin.isSuccess) {
        dispatch(login(resultLogin.data));
        const next = queryParams.get('next');
        if (next) {
            setTimeout(() => navigate(next), 100);
        } else {
            return <Navigate to="/" />;
        }
    }

    return (
        <LoginContainer>
            <Card variant="outlined">
                <Box sx={{ mb: 1 }}>
                    <Typography
                        component="h1"
                        variant="h4"
                        fontWeight="bold"
                        sx={{
                            mb: 0.5,
                            fontSize: { xs: '1.75rem', sm: '2rem' },
                        }}
                    >
                        Iniciar Sesión
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
                    >
                        Ingrese sus credenciales para acceder al sistema
                    </Typography>
                </Box>

                <Box
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2.5
                    }}
                >
                    <FormControl fullWidth>
                        <FormLabel
                            htmlFor="login"
                            sx={{
                                mb: 0.75,
                                fontWeight: 500,
                                fontSize: '0.875rem',
                            }}
                        >
                            Correo electrónico o nombre de usuario
                        </FormLabel>
                        <TextField
                            id="login"
                            type="text"
                            autoComplete="username"
                            placeholder="correo@ejemplo.com o usuario"
                            {...register("login")}
                            error={!!errors.login}
                            helperText={errors.login?.message}
                            required
                            fullWidth
                            size={isMobile ? "small" : "medium"}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                },
                            }}
                        />
                    </FormControl>

                    <FormControl fullWidth>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                            <FormLabel
                                htmlFor="password"
                                sx={{
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                }}
                            >
                                Contraseña
                            </FormLabel>
                        </Box>
                        <TextField
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            {...register("password")}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            required
                            size={isMobile ? "small" : "medium"}
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                },
                            }}
                        />
                    </FormControl>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={remember}
                                onChange={() => setRemember(!remember)}
                                value={remember}
                                size={isMobile ? "small" : "medium"}
                            />
                        }
                        label={
                            <Typography
                                variant="body2"
                                sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                            >
                                Recordar en este dispositivo
                            </Typography>
                        }
                        sx={{ mt: -0.5 }}
                    />

                    <StyledButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={resultLogin.isLoading}
                        startIcon={resultLogin.isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {resultLogin.isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                    </StyledButton>

                    <Button
                        color="inherit"
                        onClick={() => setOpenDialog(true)}
                        sx={{
                            mt: -0.5,
                            textTransform: 'none',
                            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                            fontWeight: 500,
                            color: 'text.secondary',
                            '&:hover': {
                                color: 'primary.main',
                                backgroundColor: 'transparent',
                            },
                        }}
                    >
                        ¿No tienes cuenta? Solicitar acceso
                    </Button>
                </Box>
            </Card>

            <BootstrapDialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle onClose={() => setOpenDialog(false)} id="customized-dialog-title">
                    Solicitud de Acceso al Sistema
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body1" gutterBottom>
                            Para obtener acceso al sistema, por favor comunícate con el administrador o el departamento de TI de tu organización.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Ellos te proporcionarán las credenciales necesarias para iniciar sesión.
                        </Typography>
                    </Box>
                </DialogContent>
            </BootstrapDialog>
        </LoginContainer>
    );
}
