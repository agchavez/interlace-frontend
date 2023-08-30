import { Button, Divider, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography, CircularProgress } from '@mui/material';
import CleaningServicesTwoToneIcon from '@mui/icons-material/CleaningServicesTwoTone';
// react hook form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { RegisterUserForm } from '../../../interfaces/user';
import { FC } from 'react';



const schema = yup.object().shape({
    fistName: yup.string().required("El nombre es requerido"),
    lastName: yup.string().required("El apellido es requerido"),
    email: yup.string().email("Ingrese un correo válido").required("El correo es requerido"),
    password: yup.string().required("La contraseña es requerida"),
    confirmPassword: yup.string().required("La contraseña es requerida").oneOf([yup.ref('password')], 'Las contraseñas deben coincidir'),
    group: yup.string().required("El grupo es requerido"),
});


interface UserFormProps {
    onSubmit: (data: RegisterUserForm) => void;
    loading: boolean;
    initialValues?: RegisterUserForm;
    isEdit?: boolean;
}

export const UserForm:FC<UserFormProps> = ({ onSubmit, loading, initialValues, isEdit }) => {
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<RegisterUserForm>({
        defaultValues: initialValues,
        resolver: yupResolver(schema)
    });


  return (
    <>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                autoComplete='off'
                                label="Nombre"
                                variant="outlined"
                                margin="dense"
                                size='small'
                                {...register("fistName")}
                                value={watch('fistName')}
                                error={errors.fistName ? true : false}
                                helperText={errors.fistName?.message}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Apellido"
                                variant="outlined"
                                margin="dense"
                                size='small'
                                {...register("lastName")}
                                error={errors.lastName ? true : false}
                                helperText={errors.lastName?.message}
                            />
                        </Grid>
                        <Grid item xs={12} md={12}>
                            <TextField
                                fullWidth
                                autoComplete='off'
                                label="Correo"
                                variant="outlined"
                                margin="dense"
                                size='small'
                                {...register("email")}
                                value={watch('email')}
                                error={errors.email ? true : false}
                                helperText={errors.email?.message}  
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth margin="dense" size='small' variant="outlined" >
                                <InputLabel id='role-label' component="legend" style={{marginBottom: 5}}>
                                    Grupo
                                </InputLabel>
                                <Select
                                    labelId="role-label"
                                    id="role"
                                    label="Grupo"
                                    {...register("group")}
                                    error={errors.group ? true : false}
                                    value={watch('group') || ''}
                                >
                                    <MenuItem value={''}></MenuItem>
                                    <MenuItem value={1}>Administrador</MenuItem>
                                    <MenuItem value={2}>Usuario</MenuItem>

                                </Select>
                                { errors.group &&
                                    <Typography variant="caption" component="p" style={{color: '#f44336'}}>
                                    Seleccione el grupo al que pertenece el usuario.
                                </Typography>}
                            </FormControl>
                            
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth margin="dense" size='small' variant="outlined" >
                                <InputLabel id='cd-label' component="legend" style={{marginBottom: 5}}>
                                    Centro de distribución
                                </InputLabel>
                                <Select
                                    labelId="cd-label"
                                    id="cd"
                                    label="Centro de distribución"
                                    {...register("cd")}
                                    error={errors.cd ? true : false}
                                    value={watch('cd') || ''}
                                >
                                    <MenuItem value={''}></MenuItem>
                                    <MenuItem value={'DH01'}>DH01 - CD La Granja</MenuItem>
                                    <MenuItem value={'DH09'}>DH09 - CD Comayagua
                                </MenuItem>

                                </Select>
                                { errors.cd &&
                                    <Typography variant="caption" component="p" style={{color: '#f44336'}}>
                                    Seleccione el centro de distribución al que pertenece el usuario.
                                </Typography>}
                            </FormControl>
                        </Grid>
                        {   !isEdit &&
                            <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                
                                label="Contraseña"
                                variant="outlined"
                                margin="dense"
                                size='small'
                                {...register("password")}
                                value={watch('password')}
                                error={errors.password ? true : false}
                                helperText={errors.password?.message}
                            />
                        </Grid>}
                        { !isEdit &&
                            <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                
                                label="Confirmar contraseña"
                                variant="outlined"
                                margin="dense"
                                size='small'
                                {...register("confirmPassword")}
                                error={errors.confirmPassword ? true : false}
                                
                            />
                        </Grid>}
                        <Grid item xs={12}>
                            <Divider sx={{marginBottom: 1, marginTop: 1}} />
                        </Grid>
                        <Grid item xs={12} md={3} lg={2}>
                            <Button
                                disabled={loading}
                                fullWidth
                                variant="text"
                                color="primary"
                                size="small"
                                onClick={() => reset(
                                    initialValues
                                )}
                                startIcon={<CleaningServicesTwoToneIcon />}
                            >
                                Limpiar
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={6} lg={8}>
                        </Grid>
                        <Grid item xs={12} md={3} lg={2}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={loading ? <CircularProgress size={20} /> : null}
                                type='submit'
                                disabled={loading}
                            >
                                Registrar
                            </Button>
                        </Grid>

                        
                    </Grid>

                </form>
    </>
  )
}
