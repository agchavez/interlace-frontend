import { Button, Card, Chip, Container, Divider, Grid, Typography } from '@mui/material';
// import PalletPrintContent from "../../tracker/components/PalletPrint";
import { useAppSelector } from '../../../store/store';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import image from '../../../assets/layout.png'

export default function HomePage() {
    const {
        user
    } = useAppSelector(state => state.auth);
    return <Container maxWidth="xl">

        <Grid container sx={{ mt: 3 }} spacing={2} >

            <Grid item xs={12} md={8} >
                <Card elevation={0} sx={{
                    p: 2, borderRadius: 2
                }} >
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <div>
                            <img src={image} alt="layout" width={40} />

                        </div>
                        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                        <div>
                            <Typography variant="body1" component="h6" style={{ textAlign: "start" }} color={"secondary"} fontWeight={200}>
                                Bienvenido(a)
                            </Typography>
                            <Divider />
                            <Typography variant="h6" component="p" style={{ textAlign: "start" }} color={"secondary"} fontWeight={400}>
                                {user?.first_name} {user?.last_name}
                            </Typography>
                        </div>
                    </div>

                </Card>

            </Grid>
            <Grid item xs={12} md={4} >
                <Card elevation={1} sx={{
                    p: 2, borderRadius: 2,
                }} >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                        <div>
                            <Typography variant="body1" component="h6" style={{ textAlign: "start" }} color={"secondary"} fontWeight={200}>
                                Tiempo promedio de atención
                            </Typography>
                            <Divider />
                            <Typography variant="h6" component="p" style={{ textAlign: "start" }} color={"secondary"} fontWeight={400}>
                                {user?.centro_distribucion_name}
                            </Typography>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                            <Chip
                                label={'45:00'}
                                variant='outlined'
                                color="success"
                                size="small"
                            />
                        </div>
                    </div>
                </Card>

            </Grid>
            <Grid item xs={12} md={6} >
                <Card elevation={1} sx={{
                    p: 2, borderRadius: 2
                }} >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                        <Typography variant="body1" component="h6" style={{ textAlign: "start" }} color={"secondary"} fontWeight={200}>
                            T1 - En atención
                        </Typography>
                        <Typography variant="h6" component="p" style={{ textAlign: "start" }} color={"secondary"} fontWeight={600}>
                            5
                        </Typography>
                    </div>
                    <Divider />
                    <Button variant="text" color="primary" size="medium" sx={{ mt: 1 }} endIcon={<ArrowForwardIcon />}>
                        Ver más
                    </Button>
                </Card>

            </Grid>
            <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{
                    p: 2, borderRadius: 2
                }} >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body1" component="h6" style={{ textAlign: "start" }} color={"secondary"} fontWeight={200}>
                            T1 - Completado
                        </Typography>
                        <Typography variant="h6" component="p" style={{ textAlign: "start" }} color={"secondary"} fontWeight={600}>
                            150
                        </Typography>
                    </div>
                    <Divider />
                    <Button variant="text" color="primary" size="medium" sx={{ mt: 1 }} endIcon={<ArrowForwardIcon />}>
                        Ver más
                    </Button>
                </Card>

            </Grid>


        </Grid>
    </Container>
}