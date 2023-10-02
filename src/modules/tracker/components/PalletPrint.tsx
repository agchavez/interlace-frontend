import { Box, Divider, Grid, Typography } from '@mui/material';
import { FunctionComponent } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QRCodeSVG } from 'qrcode.react';
import { PeriodLabel } from '../../../interfaces/maintenance';
import { appendLeftZeros } from '../../../utils/common';
import { format, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

const THEME = createTheme({
    typography: {
        fontFamily: 'Bahnschrift, sans-serif', // Usa el nombre de fuente definido en @font-face o 'sans-serif' como alternativa
    },
});

interface PalletPrintContentProps {
    pallet?: {
        numeroSap: number;
        rastra: string;
        nDocEntrada: number | string;
        fechaVencimiento: string;
        nPallets: number;
        cajasPallet: number;
        origen: string;
        periodo?: PeriodLabel;
        trackingId: number;
        detalle_pallet_id: number;
        tracker_detail: number;
        nombre_producto: string;
        pre_block: number;
        block: number;
    }
}

const PeriodLabelColor = {
    "A":"green",
    "B":"#e2b714",
    "C":"orangered"
}

const PalletPrintContent: FunctionComponent<PalletPrintContentProps> = ({ pallet }) => {
    const track = appendLeftZeros(pallet?.trackingId || 0, 5);
    const parsedDate = parseISO(pallet?.fechaVencimiento.split("T")[0] || "");
    // Evitar la conversión de fechas ponerl la fecha en formato yyyy-MM-dd
    const bgPeriod = PeriodLabelColor[pallet?.periodo||"A"] || "green"
    
    
    return (
        <ThemeProvider theme={THEME}>
            <Grid xs={6} component="div" paddingRight="6pt">
                <Grid container sx={{ borderRadius: "30pt", overflow: "hidden", backgroundColor: "#fff" }}>
                    <Grid item xs={12} sx={{ backgroundColor: "black", color: "white", textAlign: "center" }}>
                        <Typography component="h1" fontSize={25} color="white" margin="3pt">
                            TRK-{track}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} container padding="3pt">
                        <Grid item xs={4} sx={{ backgroundColor: bgPeriod, textAlign: "center", borderRadius: "5pt" }}>
                            <Typography component="h1" fontSize={170} color="white" fontWeight={800} lineHeight="1em">
                                {pallet?.periodo}
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
                                    {/* LIMITAR SOLO A 6 DIGISTOS */}
                                    {pallet?.rastra && pallet?.rastra.length > 6 ? pallet?.rastra.slice(0, 6) : pallet?.rastra}
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
                                    {/* 
                                        TA = TURNO A DE 6:00 A 14:00
                                        TB = TURNO B DE 14:00 A 20:30
                                        TC = TURNO C DE 20:30 A 6:00
                                        en base a la fecha que se imprime se debe calcular el turno
                                    */}
                                    {

                                        format(new Date(), "HH:mm:ss") > "06:00:00" && format(new Date(), "HH:mm:ss") < "14:00:00" ? "TA" :
                                            format(new Date(), "HH:mm:ss") > "14:00:00" && format(new Date(), "HH:mm:ss") < "20:30:00" ? "TB" :
                                                format(new Date(), "HH:mm:ss") > "20:30:00" && format(new Date(), "HH:mm:ss") < "23:59:59" ? "TC" :
                                                    format(new Date(), "HH:mm:ss") > "00:00:00" && format(new Date(), "HH:mm:ss") < "06:00:00" ? "TC" : ""
                                                    
                                    }
                                </Typography>
                                <Typography fontSize={15}>
                                    {format(new Date(), "dd-MMM-yyyy",{ locale: es }).toUpperCase()}
                                </Typography>
                                <Typography fontSize={15}>
                                    {format(new Date(), "HH:mm:ss")}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Divider sx={{ borderWidth: "1pt", borderColor: "black", width: "100%", marginTop: "5pt", marginBottom: "5pt" }} orientation='horizontal' />
                    <Grid item xs={12}>
                        <Typography fontSize={60} textAlign="center" fontWeight={700}>
                            {
                                format(parsedDate, "dd-MMM-yyyy",{ locale: es }).toUpperCase()
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
                                {/* 
                                    FECHA DE VENCIMIENTO MENOS dias de pre-bloqueo
                                */}
                                {format(subDays(parsedDate, pallet?.pre_block || 0), "dd-MMM-yyyy",{ locale: es }).toUpperCase()}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography fontSize={30} textAlign="center" fontWeight={700}>
                                {/*
                                    FECHA DE VENCIMIENTO MENOS dias de bloqueo
                                */}
                                {format(subDays(parsedDate, pallet?.block || 0), "dd-MMM-yyyy",{ locale: es }).toUpperCase()}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Divider sx={{ borderWidth: "1pt", borderColor: "black", width: "100%", marginTop: "5pt", marginBottom: "5pt" }} orientation='horizontal' />
                    <Grid container xs={12} marginTop="7pt" marginBottom="10pt">
                        <Grid item container xs={6} justifyContent="center" justifyItems="center">
                            <QRCodeSVG value={`${import.meta.env.VITE_JS_FRONTEND_URL}/tracker/pallet-detail/${pallet?.detalle_pallet_id}?tracker_id=${pallet?.trackingId}&tracker_detail=${pallet?.tracker_detail}`} 
                                imageSettings={{
                                        src: "/logo-qr.png",
                                        height: 40,
                                        width: 40,
                                        excavate: true,
                                    }}
                                    level='Q'
                            />
                        </Grid>
                        <Grid item xs={6} container margin="auto" direction="column">
                            <Typography component="p" fontSize={20} textAlign="center">
                                SCAN TO TRACK
                            </Typography>
                            <Box textAlign="center">
                            <Box component="img" src="/track.png" width="40pt" height="40pt"/>
                            </Box>
                            <Typography fontSize={20} textAlign="center" fontWeight={700}>
                                STOCK AGE INDEX | FRESCURA | TRAZABILIDAD
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </ThemeProvider>
    )
}

export default PalletPrintContent;