import { useEffect, useMemo, useState } from 'react';
import { useForm } from "react-hook-form";
import logo from "../../../assets/logo.png";
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../../store/auth/authApi";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from 'sonner';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import Divider from '@mui/material/Divider';
import {
    VisibilityOutlined,
    VisibilityOffOutlined,
    PersonOutlineRounded,
    LockOutlined,
} from "@mui/icons-material";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialogContent-root": { padding: theme.spacing(2) },
    "& .MuiDialogActions-root": { padding: theme.spacing(1) },
}));

const schema = yup.object().shape({
    login: yup.string()
        .required('El usuario o correo es requerido')
        .min(3, 'Mínimo 3 caracteres'),
    password: yup.string()
        .required('La contraseña es requerida')
        .min(6, 'Mínimo 6 caracteres'),
});

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
    const [remember, setRemember] = useState(!!localStorage.getItem('remember'));
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            login: localStorage.getItem('remember') || '',
            password: '',
        },
        resolver: yupResolver(schema),
    });

    const location = useLocation();
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const navigate = useNavigate();

    const onSubmit = async (data: FormData) => {
        if (remember) {
            localStorage.setItem('remember', data.login);
        } else {
            localStorage.removeItem('remember');
        }
        await loginAPI({ login: data.login, password: data.password });
    };

    useEffect(() => {
        if (resultLogin.error) {
            const error: any = resultLogin.error;
            const msg = error?.data?.mensage || error?.data?.detail || 'Credenciales incorrectas';
            toast.error(msg);
        }
    }, [resultLogin.error]);

    if (resultLogin.isSuccess) {
        dispatch(login(resultLogin.data));
        const next = queryParams.get('next');
        if (next) {
            setTimeout(() => navigate(next), 100);
        } else {
            const userGroups = resultLogin.data.user.list_groups || [];
            if (userGroups.includes('SEGURIDAD')) {
                return <Navigate to="/tokens/validate" />;
            }
            return <Navigate to="/" />;
        }
    }

    return (
        <Box>
            {/* Encabezado */}
            <Box sx={{ mb: 4 }}>
                {/* Insertar logo */}
                <Box sx={{ display: 'flex', justifyContent: 'start', mb: 2 }}>
                    <img src={logo} alt="Logo" style={{ width: '120px', height: 'auto' }} />
                </Box>
                <Typography
                    component="h1"
                    sx={{
                        fontFamily: 'Inter',
                        fontWeight: 800,
                        fontSize: { xs: '1.6rem', sm: '1.875rem' },
                        color: '#0f172a',
                        letterSpacing: '-0.03em',
                        lineHeight: 1.2,
                        mb: 0.75,
                    }}
                >
                    Bienvenido de vuelta
                </Typography>
                
                <Typography sx={{ fontFamily: 'Inter', fontSize: '0.9rem', color: '#64748b', fontWeight: 400 }}>
                    Ingresa tus credenciales para continuar
                </Typography>
            </Box>

            {/* Formulario */}
            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
                {/* Usuario */}
                <Box>
                    <Typography
                        component="label"
                        htmlFor="login-field"
                        sx={{
                            fontFamily: 'Inter',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: '#374151',
                            display: 'block',
                            mb: 0.75,
                        }}
                    >
                        Usuario o correo electrónico
                    </Typography>
                    <TextField
                        id="login-field"
                        type="text"
                        autoComplete="username"
                        placeholder="nombre.usuario o correo@ejemplo.com"
                        {...register("login")}
                        error={!!errors.login}
                        helperText={errors.login?.message}
                        fullWidth
                        size={isMobile ? 'small' : 'medium'}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonOutlineRounded sx={{ fontSize: '1.1rem', color: errors.login ? 'error.main' : '#94a3b8' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                fontFamily: 'Inter',
                                fontSize: '0.9rem',
                                borderRadius: '10px',
                                backgroundColor: 'white',
                                transition: 'all 0.2s',
                                '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
                                '&:hover fieldset': { borderColor: '#94a3b8' },
                                '&.Mui-focused fieldset': { borderColor: '#1565c0', borderWidth: '2px' },
                            },
                            '& .MuiFormHelperText-root': { fontFamily: 'Inter', fontSize: '0.75rem', mx: 0 },
                        }}
                    />
                </Box>

                {/* Contraseña */}
                <Box>
                    <Typography
                        component="label"
                        htmlFor="password-field"
                        sx={{
                            fontFamily: 'Inter',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: '#374151',
                            display: 'block',
                            mb: 0.75,
                        }}
                    >
                        Contraseña
                    </Typography>
                    <TextField
                        id="password-field"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        {...register("password")}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        fullWidth
                        size={isMobile ? 'small' : 'medium'}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockOutlined sx={{ fontSize: '1.1rem', color: errors.password ? 'error.main' : '#94a3b8' }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(p => !p)}
                                        onMouseDown={e => e.preventDefault()}
                                        edge="end"
                                        size="small"
                                        sx={{ color: '#94a3b8', '&:hover': { color: '#1565c0' } }}
                                    >
                                        {showPassword
                                            ? <VisibilityOutlined sx={{ fontSize: '1.1rem' }} />
                                            : <VisibilityOffOutlined sx={{ fontSize: '1.1rem' }} />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                fontFamily: 'Inter',
                                fontSize: '0.9rem',
                                borderRadius: '10px',
                                backgroundColor: 'white',
                                transition: 'all 0.2s',
                                '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
                                '&:hover fieldset': { borderColor: '#94a3b8' },
                                '&.Mui-focused fieldset': { borderColor: '#1565c0', borderWidth: '2px' },
                            },
                            '& .MuiFormHelperText-root': { fontFamily: 'Inter', fontSize: '0.75rem', mx: 0 },
                        }}
                    />
                </Box>

                {/* Recordar + ¿Sin acceso? */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: -0.5 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={remember}
                                onChange={() => setRemember(!remember)}
                                size="small"
                                sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#1565c0' }, p: 0.75 }}
                            />
                        }
                        label={
                            <Typography sx={{ fontFamily: 'Inter', fontSize: '0.82rem', color: '#64748b' }}>
                                Recordar sesión
                            </Typography>
                        }
                    />
                    <Typography
                        onClick={() => setOpenDialog(true)}
                        sx={{
                            fontFamily: 'Inter',
                            fontSize: '0.82rem',
                            fontWeight: 500,
                            color: '#1565c0',
                            cursor: 'pointer',
                            '&:hover': { color: '#0d47a1', textDecoration: 'underline' },
                            transition: 'color 0.2s',
                        }}
                    >
                        ¿Sin acceso?
                    </Typography>
                </Box>

                {/* Botón */}
                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={resultLogin.isLoading}
                    startIcon={resultLogin.isLoading ? <CircularProgress size={16} color="inherit" /> : null}
                    sx={{
                        mt: 0.5,
                        py: isMobile ? 1.25 : 1.5,
                        fontFamily: 'Inter',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        textTransform: 'none',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                        boxShadow: '0 4px 14px rgba(13, 71, 161, 0.35)',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover:not(:disabled)': {
                            background: 'linear-gradient(135deg, #0d47a1 0%, #0a3578 100%)',
                            boxShadow: '0 6px 20px rgba(13, 71, 161, 0.45)',
                            transform: 'translateY(-1px)',
                        },
                        '&:active:not(:disabled)': {
                            transform: 'translateY(0)',
                            boxShadow: '0 2px 8px rgba(13, 71, 161, 0.3)',
                        },
                        '&:disabled': {
                            background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                            opacity: 0.5,
                        },
                    }}
                >
                    {resultLogin.isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 5 }}>
                <Divider sx={{ mb: 2.5, borderColor: '#e2e8f0' }} />
                <Typography sx={{ fontFamily: 'Inter', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                    © {new Date().getFullYear()} Interlace
                </Typography>
            </Box>

            {/* Dialog */}
            <BootstrapDialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle onClose={() => setOpenDialog(false)} id="access-dialog-title">
                    Solicitar Acceso al Sistema
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ p: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'Inter', mb: 1 }}>
                            Para obtener acceso al sistema comunícate con el administrador
                            o el departamento de TI de tu organización.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter' }}>
                            Ellos te proporcionarán las credenciales necesarias para ingresar.
                        </Typography>
                    </Box>
                </DialogContent>
            </BootstrapDialog>
        </Box>
    );
}
