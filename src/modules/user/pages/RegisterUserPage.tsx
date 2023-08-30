import { Container, Divider, Grid, Paper, Typography } from '@mui/material';

import { RegisterUserForm } from '../../../interfaces/user';
import { UserForm } from '../components/UserForm';

export const RegisterUserPage = () => {
    
    const onSubmit = (data: RegisterUserForm) => {
        console.log(data);
    }

  return (
    <>
    <Container maxWidth="lg">
        <Grid container spacing={1} sx={{ marginTop: 2 }}>
            <Grid item xs={12}>
            <Typography variant="h5" component="h1" fontWeight={400}>
                    Registrar usuarios
                </Typography>
                <Divider sx={{marginBottom: 0, marginTop: 1}} />
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
                />
                </Paper>
            </Grid>
            
        </Grid>

    </Container>

    </>
  )
}
