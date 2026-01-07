import { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from "react-hook-form"
import * as yup from 'yup'
import { regextEmail } from "../../../utils/common"
import { yupResolver } from '@hookform/resolvers/yup';
import {
    Button,
    Box,
    IconButton,
    InputAdornment,
    OutlinedInput,
    Paper,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Grid,
    CircularProgress,
    Checkbox,
    FormControlLabel,
    Link,
    Alert,
    Collapse,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    VisibilityOutlined,
    VisibilityOffOutlined,
    EmailOutlined,
    LockOutlined,
    LoginOutlined
} from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../../store/auth/authApi";
import { Navigate } from "react-router-dom";
import { login } from "../../../store/auth";
import { toast } from 'sonner';

const schema = yup.object().shape({
    email: yup.string()
        .required('El correo electrónico es requerido')
        .test(
            "email",
            "Formato de correo inválido",
            (value) => regextEmail.test(value)
        ),
    password: yup.string()
        .required('La contraseña es requerida')
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
})

interface LoginData {
    email: string;
    password: string;
}

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const emailInputRef = useRef<HTMLInputElement>(null)
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const { register, handleSubmit, formState: { errors }, control, setFocus } = useForm<LoginData>({
        defaultValues: {
            email: localStorage.getItem('rememberedEmail') || '',
            password: ''
        },
        resolver: yupResolver(schema)
    })

    const [loginAPI, resultLogin] = useLoginMutation()
    const dispatch = useDispatch()

    // Auto-focus en el campo de email al cargar
    useEffect(() => {
        if (emailInputRef.current) {
            emailInputRef.current.focus()
        }
    }, [])

    const onSubmit = async (data: LoginData) => {
        setErrorMessage('')

        // Guardar email si "recordar" está activado
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', data.email)
        } else {
            localStorage.removeItem('rememberedEmail')
        }

        await loginAPI(data)
    }

    useEffect(() => {
        if (resultLogin.error) {
            const error: any = resultLogin.error

            // Manejo de errores estandarizados del backend
            if (error?.data?.mensage) {
                setErrorMessage(error.data.mensage)
                toast.error(error.data.mensage)
            } else if (error?.data?.detail) {
                setErrorMessage(error.data.detail)
                toast.error(error.data.detail)
            } else if (error?.data?.non_field_errors) {
                const errorMsg = Array.isArray(error.data.non_field_errors)
                    ? error.data.non_field_errors[0]
                    : error.data.non_field_errors
                setErrorMessage(errorMsg)
                toast.error(errorMsg)
            } else {
                setErrorMessage('Error al iniciar sesión. Por favor, inténtelo de nuevo.')
                toast.error('Error al iniciar sesión')
            }

            // Focus en el campo de contraseña si hay error
            setTimeout(() => setFocus('password'), 100)
        }
    }, [resultLogin.error, setFocus])

    if (resultLogin.isSuccess) {
        dispatch(login(resultLogin.data))
        return <Navigate to="/" />
    } 
    
    return (
        <Paper
            elevation={0}
            className="auth__paper"
            sx={{
                borderRadius: { xs: 2.5, sm: 3, md: 4 },
                width: '100%',
                maxWidth: '100%',
                p: { xs: 2, sm: 3.5, md: 4 },
                backgroundColor: 'rgba(255, 255, 255, 0.97)',
                backdropFilter: 'blur(24px)',
                border: '1px solid',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                boxShadow: {
                    xs: '0 12px 40px rgba(0, 0, 0, 0.25)',
                    sm: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 1px rgba(255, 255, 255, 0.5) inset'
                },
                animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                '@keyframes fadeInUp': {
                    '0%': {
                        opacity: 0,
                        transform: 'translateY(30px)',
                    },
                    '100%': {
                        opacity: 1,
                        transform: 'translateY(0)',
                    },
                },
            }}
        >
            {/* Logo/Icon Section */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: { xs: 1.5, sm: 2.5, md: 2.5 },
                }}
            >
                <Box
                    sx={{
                        width: { xs: 60, sm: 90, md: 100 },
                        height: { xs: 60, sm: 90, md: 100 },
                        borderRadius: { xs: '16px', sm: '24px' },
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: {
                            xs: '0 8px 20px rgba(102, 126, 234, 0.35), 0 0 0 3px rgba(255, 255, 255, 0.25)',
                            sm: '0 12px 32px rgba(102, 126, 234, 0.4), 0 0 0 4px rgba(255, 255, 255, 0.3)',
                        },
                        position: 'relative',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        '@keyframes pulse': {
                            '0%, 100%': {
                                boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4), 0 0 0 4px rgba(255, 255, 255, 0.3)',
                            },
                            '50%': {
                                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.6), 0 0 0 6px rgba(255, 255, 255, 0.5)',
                            },
                        },
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: { xs: '1.875rem', sm: '2.75rem', md: '3rem' },
                            fontWeight: 800,
                            color: 'white',
                            fontFamily: 'Inter',
                            letterSpacing: '-0.02em',
                            textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                        }}
                    >
                        T
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 }, textAlign: 'center' }}>
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        fontSize: { xs: '1.375rem', sm: '1.75rem', md: '1.875rem' },
                        mb: { xs: 0.25, sm: 0.75, md: 0.75 },
                        fontFamily: 'Inter',
                        letterSpacing: '-0.02em',
                        color: '#1c2536',
                    }}
                >
                    Bienvenido
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                        fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        px: { xs: 1, sm: 0 },
                    }}
                >
                    Ingrese sus credenciales para continuar
                </Typography>
            </Box>

            {/* Error Alert */}
            <Collapse in={!!errorMessage} sx={{ width: '100%', mb: { xs: 1.5, sm: 2 } }}>
                <Alert
                    severity="error"
                    onClose={() => setErrorMessage('')}
                    sx={{
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        fontFamily: 'Inter',
                        borderRadius: 2,
                        animation: 'shake 0.5s',
                        '@keyframes shake': {
                            '0%, 100%': { transform: 'translateX(0)' },
                            '25%': { transform: 'translateX(-8px)' },
                            '75%': { transform: 'translateX(8px)' },
                        },
                    }}
                >
                    {errorMessage}
                </Alert>
            </Collapse>
            <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
                <Grid container spacing={{ xs: 1.75, sm: 2.5, md: 3 }}>
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            size={isMobile ? "small" : "medium"}
                            label="Correo electrónico"
                            color="primary"
                            fullWidth
                            id="email"
                            autoComplete="email"
                            inputRef={emailInputRef}
                            {...register("email")}
                            error={!!errors.email?.message}
                            helperText={errors.email?.message}
                            disabled={resultLogin.isLoading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailOutlined
                                            sx={{
                                                color: errors.email ? 'error.main' : 'text.secondary',
                                                fontSize: { xs: '1.25rem', sm: '1.375rem' }
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                                    fontFamily: 'Inter',
                                    borderRadius: { xs: 1.5, sm: 2 },
                                    transition: 'all 0.2s',
                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'primary.main',
                                        borderWidth: '2px',
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: 'white',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderWidth: '2px',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    fontFamily: 'Inter',
                                    fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                                },
                                '& .MuiFormHelperText-root': {
                                    fontFamily: 'Inter',
                                    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                    mx: 0.5,
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl
                            variant="outlined"
                            fullWidth
                            error={!!errors.password?.message}
                            size={isMobile ? "small" : "medium"}
                        >
                            <InputLabel
                                htmlFor="outlined-adornment-password"
                                sx={{
                                    fontFamily: 'Inter',
                                    fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                                }}
                            >
                                Contraseña
                            </InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                {...register('password')}
                                disabled={resultLogin.isLoading}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <LockOutlined
                                            sx={{
                                                color: errors.password ? 'error.main' : 'text.secondary',
                                                fontSize: { xs: '1.25rem', sm: '1.375rem' }
                                            }}
                                        />
                                    </InputAdornment>
                                }
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(prevState => !prevState)}
                                            onMouseDown={(e) => e.preventDefault()}
                                            edge="end"
                                            size={isMobile ? "small" : "medium"}
                                            sx={{
                                                color: 'text.secondary',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    color: 'primary.main',
                                                    transform: 'scale(1.1)',
                                                },
                                            }}
                                        >
                                            {showPassword ? <VisibilityOutlined fontSize={isMobile ? "small" : "medium"} /> : <VisibilityOffOutlined fontSize={isMobile ? "small" : "medium"} />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Contraseña"
                                sx={{
                                    fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                                    fontFamily: 'Inter',
                                    borderRadius: { xs: 1.5, sm: 2 },
                                    transition: 'all 0.2s',
                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'primary.main',
                                        borderWidth: '2px',
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: 'white',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderWidth: '2px',
                                    },
                                }}
                            />
                            {errors.password?.message && (
                                <Typography
                                    variant="caption"
                                    color="error"
                                    sx={{
                                        mt: 0.5,
                                        ml: 1.5,
                                        fontFamily: 'Inter',
                                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                    }}
                                >
                                    {errors.password?.message}
                                </Typography>
                            )}
                        </FormControl>
                    </Grid>

                    {/* Remember Me & Forgot Password */}
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: { xs: 1, sm: 0 },
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        color="primary"
                                        size={isMobile ? "small" : "medium"}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: 'rgba(102, 126, 234, 0.04)',
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography
                                        sx={{
                                            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                            fontFamily: 'Inter',
                                            color: 'text.secondary',
                                        }}
                                    >
                                        Recordar sesión
                                    </Typography>
                                }
                            />
                            <Link
                                href="#"
                                underline="hover"
                                sx={{
                                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                    fontFamily: 'Inter',
                                    fontWeight: 500,
                                    color: 'primary.main',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        color: 'primary.dark',
                                        transform: 'translateX(2px)',
                                    },
                                }}
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </Box>
                    </Grid>
                </Grid>
                <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    disabled={resultLogin.isLoading}
                    size={isMobile ? "medium" : "large"}
                    startIcon={
                        resultLogin.isLoading ? (
                            <CircularProgress size={isMobile ? 18 : 20} color="inherit" />
                        ) : (
                            <LoginOutlined fontSize={isMobile ? "small" : "medium"} />
                        )
                    }
                    sx={{
                        mt: { xs: 2.5, sm: 3.5, md: 4 },
                        py: { xs: 1.5, sm: 1.75, md: 2 },
                        fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                        fontWeight: 600,
                        fontFamily: 'Inter',
                        textTransform: 'none',
                        borderRadius: { xs: 2, sm: 2.5 },
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                            transition: 'left 0.5s ease',
                        },
                        '&:hover:not(:disabled)': {
                            boxShadow: '0 12px 28px rgba(102, 126, 234, 0.5)',
                            transform: 'translateY(-2px)',
                            '&::before': {
                                left: '100%',
                            },
                        },
                        '&:active:not(:disabled)': {
                            transform: 'translateY(0)',
                            boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                        },
                        '&:disabled': {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            opacity: 0.7,
                            cursor: 'not-allowed',
                        },
                    }}
                >
                    {resultLogin.isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
            </form>

            {/* Footer */}
            <Box
                sx={{
                    mt: { xs: 2.5, sm: 3.5, md: 4 },
                    pt: { xs: 2, sm: 3 },
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center',
                }}
            >
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                        fontFamily: 'Inter',
                    }}
                >
                    Sistema de Gestión y Seguimiento
                </Typography>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                        fontFamily: 'Inter',
                        mt: 0.5,
                        display: 'block',
                    }}
                >
                    © {new Date().getFullYear()} Todos los derechos reservados
                </Typography>
            </Box>
        </Paper>
    )
}