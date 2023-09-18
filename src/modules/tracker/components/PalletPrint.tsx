import { Divider, Grid, Typography } from '@mui/material';
import { FunctionComponent } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QRCodeSVG } from 'qrcode.react';
import { appendLeftZeros, formatDate, formatTime, getM } from '../../../utils/common';
const THEME = createTheme({
    typography: {
        fontFamily: 'Bahnschrift, sans-serif', // Usa el nombre de fuente definido en @font-face o 'sans-serif' como alternativa
    },
});

interface PalletPrintContentProps {
    pallet?: {
        numeroSap: number;
        rastra: string;
        nDocEntrada: number;
        fechaVencimiento?: string;
        nPallets: number;
        cajasPallet: number;
        origen: string;
        trimestre: "A" | "B" | "C" | "D";
        trackingId: number;
        detalle_pallet_id: number;
        tracker_detail: number;
        nombre_producto: string;
    }
}

const PalletPrintContent: FunctionComponent<PalletPrintContentProps> = ({ pallet }) => {
    const track = appendLeftZeros(pallet?.trackingId || 0, 9);
    const fechaVencimiento = new Date(pallet?.fechaVencimiento || 0)
    const date: Date = new Date(pallet?.fechaVencimiento || "");

    return (
        <ThemeProvider theme={THEME}>
            <Grid xs={6} component="div" paddingRight="8pt">
                <Grid container sx={{ borderRadius: "30pt", overflow: "hidden", backgroundColor: "#ddd" }}>
                    <Grid item xs={12} sx={{ backgroundColor: "black", color: "white", textAlign: "center" }}>
                        <Typography component="h1" fontSize={25} color="white" margin="3pt">
                            TRK-{track}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} container padding="3pt">
                        <Grid item xs={4} sx={{ backgroundColor: "green", textAlign: "center", borderRadius: "5pt" }}>
                            <Typography component="h1" fontSize={170} color="white" fontWeight={800} lineHeight="1em">
                                {pallet?.trimestre}
                            </Typography>
                        </Grid>
                        <Grid item xs={8} sx={{ textAlign: "center" }} margin="auto">
                            <Grid item>
                                <Typography fontSize={18}>
                                    Origen: {pallet?.origen}
                                </Typography>
                                <Typography fontSize={120} lineHeight="1em" fontWeight={800}>
                                    {pallet?.numeroSap}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} sx={{ backgroundColor: "black", color: "white", textAlign: "center" }}>
                        <Typography fontSize={35}>
                            {pallet?.nombre_producto.slice(0, 25)}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} container sx={{ textAlign: "center" }}>
                        <Grid item container direction="column" xs={5} sx={{ textAlign: "center", marginTop: "5pt" }}>
                            <Grid item sx={{ backgroundColor: "black", color: "white" }}>
                                <Typography fontSize={43}>
                                    {pallet?.rastra}
                                </Typography>
                            </Grid>
                            <Grid item >
                                <Typography fontWeight={500} fontSize={20}>
                                    {pallet?.nDocEntrada}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid item xs={7} container>
                            <Grid item xs={4} container direction="column" margin="auto">
                                <Typography fontSize={13}>
                                    # PALLETS INGRESADOS
                                </Typography>
                                <Typography fontSize={40} fontWeight={900}>
                                    {pallet?.nPallets}
                                </Typography>
                            </Grid>
                            <Grid item xs={4} container direction="column" margin="auto">
                                <Typography fontSize={13}>
                                    CAJAS X <br/> 
                                    PALLET
                                </Typography>
                                <Typography fontSize={40} fontWeight={900}>
                                    {pallet?.cajasPallet}
                                </Typography>
                            </Grid>
                            <Grid item xs={4} container direction="column" alignItems="center" margin="auto">
                                <Typography fontSize={15}>
                                    TA
                                </Typography>
                                <Typography fontSize={15}>
                                    {formatDate(new Date())}
                                </Typography>
                                <Typography fontSize={15}>
                                    {formatTime(new Date())}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Divider sx={{ borderWidth: "1pt", borderColor: "black", width: "100%", marginTop: "5pt", marginBottom: "5pt" }} orientation='horizontal' />
                    <Grid item xs={12}>
                        <Typography fontSize={60} textAlign="center" fontWeight={600}>
                            {
                                `${date.getDate()}-${getM(date.getMonth() || 0)}-${date.getFullYear()}`
                            }
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
                                <QRCodeSVG value={`${import.meta.env.VITE_JS_FRONTEND_URL}/tracker/pallet-detail/${pallet?.detalle_pallet_id}?tracker_id=${pallet?.trackingId}&tracker_detail=${pallet?.tracker_detail}`} 
                                    imageSettings={{
                                        src: "../../../../public/logo-qr.png",
                                        x: undefined,
                                        y: undefined,
                                        height: 40,
                                        width: 40,
                                        excavate: true,
                                      }}
                                      level='Q'
                                />
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