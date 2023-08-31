import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { regextEmail } from "../../../utils/common"
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Container, Divider, IconButton, InputAdornment, OutlinedInput, Paper, TextField, Typography, FormControl, InputLabel, Grid } from '@mui/material';
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
            <Container>
                <Typography component="h1" variant="h5" textAlign="center">
                    Iniciar Sesión
                </Typography>
                <Divider sx={{ marginTop: "1rem", marginBottom: "1rem" }} />
                <Typography component="body" variant="body1" textAlign="start">
                    Ingrese sus credenciales para acceder al sistema
                </Typography>
            </Container>
            <form onSubmit={handleSubmit(onSubmit)} noValidate 
                style={{ padding: "1rem", width: "100%" }}
                autoComplete="off">
                <Grid container spacing={2} sx={{ width: "100%" }}>
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            size="medium"
                            label="Correo"
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
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl variant="outlined" fullWidth error={errors.password?.message ? true : false}>
                            <InputLabel htmlFor="outlined-adornment-password">
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
                                label="Password"
                            />
                            <Typography component="body" variant="body2" textAlign="start" color="red">
                                {errors.password?.message}
                            </Typography>
                        </FormControl>
                    </Grid>
                </Grid>
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    type="submit"
                    sx={{ marginTop: "1rem", marginBottom: "1rem" }}
                >
                    <Typography component="body" variant="body1" textAlign="center">
                    Iniciar Sesión
                    </Typography>
                </Button>
            </form>
        </Paper>
    )
}