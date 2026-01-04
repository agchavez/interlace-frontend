import { useEffect } from 'react'
import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { regextEmail } from "../../../utils/common"
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Box, IconButton, InputAdornment, OutlinedInput, Paper, TextField, Typography, FormControl, InputLabel, Grid, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { VisibilityOutlined, VisibilityOffOutlined } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../../store/auth/authApi";
import { Navigate } from "react-router-dom";
import { login } from "../../../store/auth";
import { toast } from 'sonner';
const schema = yup.object().shape({
    email: yup.string()
        .required('Campo requerido')
        .test(
            "email",
            "Correo inválido",
            (value) => regextEmail.test(value)
        ),
    password: yup.string()
        .required('La contraseña es requerida')
})

interface LoginData {
    email: string;
    password: string;
}


export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
        defaultValues: {
            email: '',
            password: ''
        },
        resolver: yupResolver(schema)
    })
    const [loginAPI, resultLogin] = useLoginMutation()
    const dispatch = useDispatch()
    const onSubmit = async (data: LoginData) => {
        await loginAPI(data)
    }
    useEffect(() => {
        if (resultLogin.error) {
            toast.error("Correo o Contraseña incorrecto") 
            
        }
    }, [resultLogin.error])

    if (resultLogin.isSuccess) {
        dispatch(login(resultLogin.data))
        return <Navigate to="/" />
    } 
    
    return (
        <Paper
            elevation={0}
            className="auth__papaer"
            sx={{
                borderRadius: { xs: 3, sm: 4 },
                width: '100%',
                maxWidth: { xs: '100%', sm: 480 },
                p: { xs: 3, sm: 5 },
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 1px rgba(255, 255, 255, 0.5) inset',
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
                    mb: 3,
                }}
            >
                <Box
                    sx={{
                        width: { xs: 90, sm: 110 },
                        height: { xs: 90, sm: 110 },
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4), 0 0 0 4px rgba(255, 255, 255, 0.3)',
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
                            fontSize: { xs: '2.75rem', sm: '3.5rem' },
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

            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        fontSize: { xs: '1.75rem', sm: '2rem' },
                        mb: 1,
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
                        fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                        fontFamily: 'Inter',
                        fontWeight: 400,
                    }}
                >
                    Ingrese sus credenciales para continuar
                </Typography>
            </Box>
            <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
                <Grid container spacing={{ xs: 2.5, sm: 3 }}>
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            size="medium"
                            label="Correo electrónico"
                            color="primary"
                            fullWidth
                            id="email"
                            {...register("email")}
                            error={errors.email?.message ? true : false}
                            helperText={errors.email?.message}
                            className="auth__input"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                                    fontFamily: 'Inter',
                                    borderRadius: 2,
                                    '&:hover fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    fontFamily: 'Inter',
                                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                                },
                                '& .MuiFormHelperText-root': {
                                    fontFamily: 'Inter',
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl variant="outlined" fullWidth error={errors.password?.message ? true : false}>
                            <InputLabel
                                htmlFor="outlined-adornment-password"
                                sx={{
                                    fontFamily: 'Inter',
                                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                                }}
                            >
                                Contraseña
                            </InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-password"
                                type={showPassword ? "text" : "password"}
                                {...register('password')}
                                error={errors.password?.message ? true : false}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(prevState => !prevState)}
                                            onMouseDown={(e) => e.preventDefault()}
                                            edge="end"
                                            sx={{
                                                color: 'text.secondary',
                                                '&:hover': {
                                                    color: 'primary.main',
                                                },
                                            }}
                                        >
                                            {showPassword ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Contraseña"
                                sx={{
                                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                                    fontFamily: 'Inter',
                                    borderRadius: 2,
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'primary.main',
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
                                    }}
                                >
                                    {errors.password?.message}
                                </Typography>
                            )}
                        </FormControl>
                    </Grid>
                </Grid>
                <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    disabled={resultLogin.isLoading}
                    startIcon={resultLogin.isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{
                        mt: { xs: 4, sm: 4.5 },
                        py: { xs: 1.75, sm: 2 },
                        fontSize: { xs: '0.9375rem', sm: '1rem' },
                        fontWeight: 600,
                        fontFamily: 'Inter',
                        textTransform: 'none',
                        borderRadius: 2.5,
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
                        '&:hover': {
                            boxShadow: '0 12px 28px rgba(102, 126, 234, 0.5)',
                            transform: 'translateY(-2px)',
                            '&::before': {
                                left: '100%',
                            },
                        },
                        '&:active': {
                            transform: 'translateY(0)',
                        },
                        '&:disabled': {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            opacity: 0.6,
                        },
                    }}
                >
                    {resultLogin.isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
            </form>
        </Paper>
    )
}