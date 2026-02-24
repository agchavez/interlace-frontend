import { Container, Divider, Grid, Paper, Typography } from '@mui/material';

import { RegisterUserForm } from '../../../interfaces/user';
import { UserForm } from '../components/UserForm';
import { useInsertUserMutation, usePatchUserMutation } from '../../../store/user/userApi'
import { useEffect, useMemo, useState } from 'react'
import { QueryStatus } from '@reduxjs/toolkit/dist/query';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store';
import { getAUser } from '../../../store/user';
import { errorApiHandler } from '../../../utils/error';

export const RegisterUserPage = () => {
    const [searchParams] = useSearchParams()
    const edit = searchParams.get("edit")
    const [insertUser, resultInsertUser] = useInsertUserMutation()
    const [patchUser, 
        resultPatchUser
    ] = usePatchUserMutation()
    const [resetForm, setResetForm] = useState(false)
    const { data, status, error, isLoading } = resultInsertUser;
    const {isLoading: isLoadingPatch} = resultPatchUser
    const editingUser = useAppSelector(state => state.user.editingUser)
    const dispatch = useAppDispatch()
    const onSubmit = async (data: RegisterUserForm) => {
        if (edit) {
            await patchUser({
                id: +(edit || 0),
                user: {
                    centro_distribucion: +(data.cd || 0) || undefined,
                    email: data.email,
                    first_name: data.fistName,
                    group: +data.group,
                    last_name: data.lastName,
                    username: data.email,
                    employee_number: data.employee_number,
                    distributions_centers: data.distributions_centers.length > 0 ? data.distributions_centers : data.cd ? [+data.cd] : []
                }
            })
        } else {
            await insertUser({
                centro_distribucion: +(data.cd || 0) || undefined,
                password: data.password,
                email: data.email,
                first_name: data.fistName,
                group: +data.group,
                last_name: data.lastName,
                is_staff: false,
                is_superuser: false,
                username: data.email,
                is_active: true,
                employee_number: data.employee_number,
                distributions_centers: data.distributions_centers.length > 0 ? data.distributions_centers : data.cd ? [+data.cd] : []
            })
        }

    }

    useEffect(() => {
        if (edit) {
            dispatch(getAUser(+edit))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [edit])

    const initialValues = useMemo(()=>{
        return edit ? {
            fistName: editingUser?.firstName || "",
            lastName: editingUser?.lastName || '',
            email: editingUser?.email || '',
            password: '',
            confirmPassword: '',
            group: `${editingUser?.groups?.[0] || ''}`,
            cd:`${editingUser?.centroDistribucion}`,
            employee_number: editingUser?.employee_number || undefined,
            distributions_centers: [...editingUser?.distributions_centers || []]
        } : {
            fistName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            group: '',
            employee_number: undefined,
            distributions_centers: []
        }
    }, [edit, editingUser]) 

    useEffect(() => {
        if (status === QueryStatus.fulfilled) {
            setResetForm(true)
            toast.success("Usuario Registrado con éxito")
        } else if (error) {
            errorApiHandler(error, "Error al registrar el usuario")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, error])

    useEffect(() => {
        if (resultPatchUser.status === QueryStatus.fulfilled) {
            toast.success("Usuario Actualizado con éxito")
        } else if (resultPatchUser.error) {
            errorApiHandler(resultPatchUser.error, "Error al actualizar el usuario")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resultPatchUser.data, resultPatchUser.error])

    return (
        <>
            <Container maxWidth="lg">
                <Grid container spacing={1} sx={{ marginTop: 2 }}>
                    <Grid item xs={12}>
                        <Typography variant="h5" component="h1" fontWeight={400}>
                            Registro de usuario
                        </Typography>
                        <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body1" component="h2" fontWeight={200}>
                            Complete el formulario para registrar un nuevo usuario en el sistema.
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper elevation={1} sx={{ padding: 2 }}>
                            <UserForm
                                onSubmit={onSubmit}
                                loading={isLoading || isLoadingPatch}
                                initialValues={initialValues}
                                isEdit={edit ? true : false}
                                resetForm={resetForm}
                                setResetForm={setResetForm}
                            />
                        </Paper>
                    </Grid>


                </Grid>

            </Container>

        </>
    )
}
