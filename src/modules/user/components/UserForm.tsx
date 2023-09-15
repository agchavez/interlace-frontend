import { Button, Divider, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography, CircularProgress } from '@mui/material';
import CleaningServicesTwoToneIcon from '@mui/icons-material/CleaningServicesTwoTone';
// react hook form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { RegisterUserForm } from '../../../interfaces/user';
import { FC, useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../../../store';
interface UserFormProps {
    onSubmit: (data: RegisterUserForm) => void;
    loading: boolean;
    initialValues?: RegisterUserForm;
    isEdit?: boolean;
    resetForm?: boolean,
    setResetForm?: (value: boolean) => unknown
}

export const UserForm: FC<UserFormProps> = ({ onSubmit, loading, initialValues, isEdit, resetForm, setResetForm }) => {
    const [needDC, setNeedDC] = useState(false)
    const schema = useMemo(() => {
        const shape: yup.ObjectShape = {
            fistName: yup.string().required("El nombre es requerido"),
            lastName: yup.string().required("El apellido es requerido"),
            email: yup.string().email("Ingrese un correo válido").required("El correo es requerido"),
            group: yup.string().required("El grupo es requerido"),
        }
        !isEdit && (shape.password = yup.string().required("La contraseña es requerida"))
        !isEdit && (shape.confirmPassword = yup.string().required("La contraseña es requerida").oneOf([yup.ref('password')], 'Las contraseñas deben coincidir'))
        needDC && (shape.cd = yup.number().required("El centro de distribucion es requerido").min(1, "El centro de distribucion es requerido"))
        return yup.object().shape(shape);
    }, [needDC, isEdit])
    const { register, handleSubmit, formState: { errors }, reset, watch, setFocus } = useForm<RegisterUserForm>({
        defaultValues: initialValues,
        resolver: yupResolver(schema as yup.ObjectSchema<RegisterUserForm>)
    });

    if (resetForm) {
        reset(initialValues);
        setResetForm && setResetForm(false)
        setFocus("fistName")
    }

    const { distributionCenters } = useAppSelector(state => state.user)
    const { groups } = useAppSelector(state => state.maintenance)
    const groupId = +watch("group")
    const selectedGroup = useMemo(() => {
        return groups.find(group => group.id === groupId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupId])
    useEffect(() => {
        if (selectedGroup && selectedGroup.requiered_access) {
            setNeedDC(true)
        } else {
            setNeedDC(false)
        }
    }, [selectedGroup])
    useEffect(() => {
        if (isEdit) {
            reset(initialValues)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValues])
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
                            value={watch('lastName')}
                            error={errors.lastName ? true : false}
                            helperText={errors.lastName?.message}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
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
                        <TextField
                            fullWidth
                            autoComplete='off'
                            label="Numero de empleado"
                            variant="outlined"
                            margin="dense"
                            size='small'
                            {...register("employee_number")}
                            value={watch('employee_number') || ''}
                            error={errors.employee_number ? true : false}
                            helperText={errors.employee_number?.message}
                        />

                        </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth margin="dense" size='small' variant="outlined" >
                            <InputLabel id='role-label' component="legend" style={{ marginBottom: 5 }}>
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
                                {
                                    groups.map((group) => {
                                        return <MenuItem value={group.id} key={group.id}>
                                            {group.group.name}
                                        </MenuItem>
                                    })
                                }
                            </Select>
                            {errors.group &&
                                <Typography variant="caption" component="p" style={{ color: '#f44336' }}>
                                    Seleccione el grupo al que pertenece el usuario.
                                </Typography>}
                        </FormControl>

                    </Grid>
                    <Grid item xs={12} md={6}>
                        {
                            needDC &&
                            <FormControl fullWidth margin="dense" size='small' variant="outlined" >
                                <InputLabel id='cd-label' component="legend" style={{ marginBottom: 5 }}>
                                    Centro de distribución
                                </InputLabel>
                                <Select
                                    labelId="cd-label"
                                    id="cd"
                                    label="Centro de distribución"
                                    {...register("cd")}
                                    error={errors.cd ? true : false}
                                    value={watch('cd') || 0}
                                >
                                    <MenuItem value={0}></MenuItem>
                                    {
                                        distributionCenters?.map(distributionCenter =>
                                            <MenuItem
                                                key={distributionCenter.id}
                                                value={distributionCenter.id}
                                            >
                                                {distributionCenter.name}
                                            </MenuItem>
                                        )
                                    }
                                </Select>
                                {errors.cd &&
                                    <Typography variant="caption" component="p" style={{ color: '#f44336' }}>
                                        Seleccione el centro de distribución al que pertenece el usuario.
                                    </Typography>}
                            </FormControl>
                        }
                    </Grid>
                    {!isEdit &&
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
                    {!isEdit &&
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
                        <Divider sx={{ marginBottom: 1, marginTop: 1 }} />
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
                            <Typography variant="button" fontWeight={300}>
                                Limpiar
                            </Typography>
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
                            <Typography variant="button" fontWeight={300}>
                                {
                                    isEdit ? "Guardar":"Registrar"
                                }
                            </Typography>
                        </Button>
                    </Grid>


                </Grid>

            </form>
        </>
    )
}
