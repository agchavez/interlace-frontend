import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { regextEmail } from "../../../utils/common"
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Container, IconButton, InputAdornment, OutlinedInput, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { VisibilityOutlined, VisibilityOffOutlined } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { setStatus } from "../../../store/auth";
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
    const dispatch = useDispatch()
    const onSubmit = (data: LoginData) => {
        data
        dispatch(setStatus("authenticated"))
    }
    return (
        <Paper elevation={3} className="auth__papaer" sx={{ borderRadius: 5 }}>
            <Container style={{ paddingLeft: 0 }}>
                <Typography component="h1" variant="h5" textAlign="left">
                    Iniciar Sesión
                </Typography>
            </Container>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <label htmlFor="email" className="text__primary">
                    Correo:
                </label>
                <TextField
                    placeholder="Correo"
                    variant="outlined"
                    size="small"
                    color="primary"
                    margin="normal"
                    fullWidth
                    id="email"
                    {...register("email")}
                    error={errors.email?.message ? true : false}
                    helperText={errors.email?.message}
                    className="auth__input"
                    style={{ marginTop: 0 }}
                />
                <label htmlFor="password" className="text__primary">
                    Contraseña:
                </label>
                <OutlinedInput
                    id="password"
                    placeholder="Contraseña"
                    color="primary"
                    label="Contraseña"
                    autoComplete="off"
                    size="small"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    {...register('password')}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword(!showPassword)}
                                onMouseDown={() => setShowPassword(!showPassword)}
                                edge="end"
                            >
                                {
                                    showPassword ? <VisibilityOutlined /> : <VisibilityOffOutlined />
                                }
                            </IconButton>
                        </InputAdornment>
                    }
                    error={errors.password?.message ? true : false}
                    aria-errormessage={errors.password?.message}
                />
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    type="submit"
                    className="auth__submit"
                    sx={{ marginTop: "1rem", marginBottom: "1rem" }}
                >
                    Iniciar Sesión
                </Button>
            </form>
        </Paper>
    )
}