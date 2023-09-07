import { Container, Divider, Grid, Paper, Typography } from '@mui/material';

import { RegisterUserForm } from '../../../interfaces/user';
import { UserForm } from '../components/UserForm';
import { useInsertUserMutation } from '../../../store/user/userApi'
import { useEffect, useState } from 'react'
import { QueryStatus } from '@reduxjs/toolkit/dist/query';
import { toast } from 'sonner';

export const RegisterUserPage = () => {
    const [insertUser, resultInsertUser] = useInsertUserMutation()
    const [resetForm, setResetForm] = useState(false)
    const { data, status, error } = resultInsertUser;
    const onSubmit = async (data: RegisterUserForm) => {
        await insertUser({ 
            centro_distribucion: undefined, 
            password: data.password,
            email: data.email,
            first_name: data.fistName,
            // group
            last_name: data.lastName,
            is_staff:false,
            is_superuser: false,
            username: `u${Math.ceil(Math.random()*1000)}`,
            is_active: true,
            codigo_empleado: Math.ceil(Math.random()*1000)
        })
    }

    useEffect(()=>{
        if (status === QueryStatus.fulfilled) {
            setResetForm(true)
            toast.success("Usuario Registrado con éxito")
        } else if(error) {
            if("data" in error){
                toast.error(`Error: ${JSON.stringify(error.data)}`)
            } else if ("error" in error) {
                toast.error(`Error: ${JSON.stringify(error.error)}`)
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, error])

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
                                loading={false}
                                initialValues={{
                                    fistName: '',
                                    lastName: '',
                                    email: '',
                                    password: '',
                                    confirmPassword: '',
                                    group: ''

                                }}
                                isEdit={false}
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
