import { Container, Divider, Grid, Typography } from "@mui/material"

export const ListUserPage = () => {
  return (
    <Container maxWidth="lg">
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h5" component="h1" fontWeight={200}>
                    Administrar Usuarios
                </Typography>
                <Divider sx={{marginBottom: 2, marginTop: 1}} />
            </Grid>
        </Grid>

    </Container>
  )
}
