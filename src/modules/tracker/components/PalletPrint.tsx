import { Divider, Grid, Typography } from '@mui/material';
import { FunctionComponent } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
const THEME = createTheme({
    typography: {
        fontFamily: `"Bahnschrift", url('/BAHSCHRIFT.TTF')`
    }
})

const PalletPrintContent: FunctionComponent = () => {
    return (
        <ThemeProvider theme={THEME}>
            <Grid xs={6} component="div" paddingRight="2pt">
                <Grid container sx={{ borderRadius: "30pt", overflow: "hidden", backgroundColor: "#ddd" }}>
                    <Grid item xs={12} sx={{ backgroundColor: "black", color: "white", textAlign: "center" }}>
                        <Typography component="h1" fontSize={25} color="white" margin="3pt">
                            TRK-750896538
                        </Typography>
                    </Grid>
                    <Grid item xs={12} container padding="3pt">
                        <Grid item xs={4} sx={{ backgroundColor: "green", textAlign: "center", borderRadius: "5pt" }}>
                            <Typography component="h1" fontSize={170} color="white" fontWeight={800} lineHeight="1em">
                                A
                            </Typography>
                        </Grid>
                        <Grid item xs={8} sx={{ textAlign: "center" }} margin="auto">
                            <Grid item>
                                <Typography fontSize={18}>
                                    Origen: SH01 - Planta de Refresco CSD
                                </Typography>
                                <Typography fontSize={120} lineHeight="1em" fontWeight={800}>
                                    13958
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} sx={{ backgroundColor: "black", color: "white", textAlign: "center" }}>
                        <Typography fontSize={45}>
                            COCA COLA 500 ML PET
                        </Typography>
                    </Grid>
                    <Grid item xs={12} container sx={{ textAlign: "center" }}>
                        <Grid item container direction="column" xs={5} sx={{ textAlign: "center", marginTop: "5pt" }}>
                            <Grid item sx={{ backgroundColor: "black", color: "white" }}>
                                <Typography fontSize={43}>
                                    MR25
                                </Typography>
                            </Grid>
                            <Grid item >
                                <Typography fontWeight={500} fontSize={20}>
                                    750896538
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid item xs={7} container>
                            <Grid item xs={4} container direction="column" margin="auto">
                                <Typography fontSize={13}>
                                    # PALLETS INGRESADOS
                                </Typography>
                                <Typography fontSize={40} fontWeight={900}>
                                    10
                                </Typography>
                            </Grid>
                            <Grid item xs={4} container direction="column" margin="auto">
                                <Typography fontSize={13}>
                                    CAJAS X PALLET
                                </Typography>
                                <Typography fontSize={40} fontWeight={900}>
                                    120
                                </Typography>
                            </Grid>
                            <Grid item xs={4} container direction="column" alignItems="center" margin="auto">
                                <Typography fontSize={15}>
                                    TA
                                </Typography>
                                <Typography fontSize={15}>
                                    1-SEPT-23
                                </Typography>
                                <Typography fontSize={15}>
                                    15:45:23 PM
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Divider sx={{ borderWidth: "1pt", borderColor: "black", width: "100%", marginTop: "5pt", marginBottom: "5pt" }} orientation='horizontal' />
                    <Grid item xs={12}>
                        <Typography fontSize={60} textAlign="center" fontWeight={600}>
                            21-DIC-2023
                        </Typography>
                    </Grid>
                    <Divider sx={{ borderWidth: "1pt", borderColor: "black", width: "100%", marginBottom: "5pt" }} orientation='horizontal' />
                    <Grid item container xs={12}>
                        <Grid item xs={6}>
                            <Typography fontSize={25} textAlign="center" fontWeight={500}>
                                PRE-BLOQUEO
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography fontSize={25} textAlign="center" fontWeight={500}>
                                BLOQUEO
                            </Typography>
                        </Grid>
                    </Grid>
                    <Divider sx={{ borderWidth: "1pt", borderColor: "black", width: "100%", marginTop: "5pt", marginBottom: "5pt" }} orientation='horizontal' />
                    <Grid item container xs={12}>
                        <Grid item xs={6}>
                            <Typography fontSize={30} textAlign="center" fontWeight={700}>
                                21-NOV-2023
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography fontSize={30} textAlign="center" fontWeight={700}>
                                01-DIC-2023
                            </Typography>
                        </Grid>
                    </Grid>
                    <Divider sx={{ borderWidth: "1pt", borderColor: "black", width: "100%", marginTop: "5pt", marginBottom: "5pt" }} orientation='horizontal' />
                    <Grid item container xs={12} marginTop="7pt" marginBottom="10pt">
                        <Grid item xs={4} margin="auto">
                            <Typography fontSize={30} textAlign="center" fontWeight={700}>
                                TRACK
                            </Typography>
                            <Typography fontSize={22} textAlign="center" fontWeight={700}>
                                QR CODE
                            </Typography>
                        </Grid>
                        <Grid item xs={8} container margin="auto">
                            <Grid item xs={5}>
                                <img src='/logo-tracker.ico' width="150pt" />
                            </Grid>
                            <Grid item xs={7} margin="auto">
                                <Typography fontSize={15} textAlign="center">
                                    ESCANEA EL QR
                                </Typography>
                                <Typography fontSize={15} textAlign="center">
                                    PARA <span style={{ fontWeight: 700 }}>CHECK</span>
                                </Typography>
                                <Typography fontSize={15} textAlign="center" fontWeight={700}>
                                    DE STOCK AGE
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </ThemeProvider>
    )
}

export default PalletPrintContent;