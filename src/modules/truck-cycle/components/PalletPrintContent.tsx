import { Box, Divider, Grid, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { PalletTicket } from '../interfaces/truckCycle';

const THEME = createTheme({
    typography: {
        fontFamily: 'Bahnschrift, Arial, sans-serif',
    },
});

interface PautaInfo {
    transport_number: string;
    trip_number: string;
    truck_code: string;
    truck_plate: string;
    route_code: string;
    total_boxes: number;
    total_pallets: number;
}

interface PalletPrintItemProps {
    pauta: PautaInfo;
    ticket: PalletTicket;
    index: number;
    total: number;
}

function PalletPrintItem({ pauta, ticket, index, total }: PalletPrintItemProps) {
    const qrUrl = `${import.meta.env.VITE_JS_FRONTEND_URL || window.location.origin}/truck-cycle/pautas/${ticket.pauta}`;
    const turno = (() => {
        const h = format(new Date(), 'HH:mm:ss');
        if (h >= '06:00:00' && h < '14:00:00') return 'TA';
        if (h >= '14:00:00' && h < '20:30:00') return 'TB';
        return 'TC';
    })();

    return (
        <Grid item xs={6} component="div" sx={{ p: '4pt' }}>
            <Grid
                container
                sx={{
                    borderRadius: '20pt',
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                    border: '2pt solid #000',
                    pageBreakInside: 'avoid',
                }}
            >
                {/* Header negro — Transporte */}
                <Grid item xs={12} sx={{ backgroundColor: 'black', color: 'white', textAlign: 'center', py: '2pt' }}>
                    <Typography fontSize={28} fontWeight={700} color="white">
                        T-{pauta.transport_number}
                    </Typography>
                </Grid>

                {/* Pallet number + Camión */}
                <Grid item xs={12} container sx={{ p: '4pt' }}>
                    <Grid item xs={4} sx={{ backgroundColor: '#1976d2', textAlign: 'center', borderRadius: '8pt', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', py: '4pt' }}>
                        <Typography fontSize={14} color="white" fontWeight={500}>
                            PALLET
                        </Typography>
                        <Typography fontSize={80} color="white" fontWeight={800} lineHeight="1em">
                            {index}
                        </Typography>
                        <Typography fontSize={14} color="white">
                            de {total}
                        </Typography>
                    </Grid>
                    <Grid item xs={8} sx={{ textAlign: 'center' }} margin="auto">
                        <Typography fontSize={16}>Camión</Typography>
                        <Typography fontSize={60} lineHeight="1em" fontWeight={800}>
                            {pauta.truck_code}
                        </Typography>
                        <Typography fontSize={18} fontWeight={500}>
                            {pauta.truck_plate}
                        </Typography>
                    </Grid>
                </Grid>

                {/* Ruta */}
                <Grid item xs={12} sx={{ backgroundColor: 'black', color: 'white', textAlign: 'center', py: '1pt' }}>
                    <Typography fontSize={24} fontWeight={600}>
                        Ruta: {pauta.route_code} · Viaje {pauta.trip_number}
                    </Typography>
                </Grid>

                {/* Datos */}
                <Grid item xs={12} container sx={{ textAlign: 'center', py: '4pt' }}>
                    <Grid item xs={3} container direction="column" margin="auto">
                        <Typography fontSize={12}>CAJAS</Typography>
                        <Typography fontSize={30} fontWeight={900}>
                            {ticket.box_count}
                        </Typography>
                    </Grid>
                    <Grid item xs={3} container direction="column" margin="auto">
                        <Typography fontSize={12}>TIPO</Typography>
                        <Typography fontSize={20} fontWeight={700}>
                            {ticket.is_full_pallet ? 'COMPLETO' : 'FRACCIÓN'}
                        </Typography>
                    </Grid>
                    <Grid item xs={3} container direction="column" margin="auto">
                        <Typography fontSize={12}>TURNO</Typography>
                        <Typography fontSize={30} fontWeight={700}>
                            {turno}
                        </Typography>
                    </Grid>
                    <Grid item xs={3} container direction="column" margin="auto">
                        <Typography fontSize={12}>FECHA</Typography>
                        <Typography fontSize={14} fontWeight={600}>
                            {format(new Date(), 'dd-MMM-yyyy', { locale: es }).toUpperCase()}
                        </Typography>
                        <Typography fontSize={14}>
                            {format(new Date(), 'HH:mm')}
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ borderWidth: '1pt', borderColor: 'black', width: '100%' }} />

                {/* QR + Scan */}
                <Grid container xs={12} sx={{ py: '6pt', px: '4pt' }}>
                    <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <QRCodeSVG
                            value={qrUrl}
                            size={100}
                            level="M"
                        />
                    </Grid>
                    <Grid item xs={7} container margin="auto" direction="column" sx={{ textAlign: 'center' }}>
                        <Typography fontSize={11} color="#666">
                            {ticket.ticket_number}
                        </Typography>
                        <Typography fontSize={16} fontWeight={700} sx={{ mt: '2pt' }}>
                            SCAN TO TRACK
                        </Typography>
                        <Box textAlign="center" sx={{ mt: '2pt' }}>
                            <Box component="img" src="/logo-qr.png" width="30pt" height="30pt" onError={(e: any) => { e.target.style.display = 'none'; }} />
                        </Box>
                        <Typography fontSize={12} fontWeight={600} sx={{ mt: '2pt' }}>
                            CICLO DEL CAMIÓN | INTERLACE
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}

interface Props {
    pauta: PautaInfo;
    tickets: PalletTicket[];
}

export default function PalletPrintContent({ pauta, tickets }: Props) {
    return (
        <ThemeProvider theme={THEME}>
            <Box sx={{ p: '10mm', backgroundColor: '#fff' }}>
                <style>{`
                    @media print {
                        .no-print { display: none !important; }
                        body { margin: 0; padding: 0; }
                    }
                `}</style>

                {/* Botón imprimir (solo pantalla) */}
                <Box className="no-print" sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h5" fontWeight={700}>
                            Pallet Tickets — T-{pauta.transport_number}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {pauta.truck_code} - {pauta.truck_plate} · Viaje {pauta.trip_number} · {tickets.length} tickets
                        </Typography>
                    </Box>
                    <Box
                        component="button"
                        onClick={() => window.print()}
                        sx={{
                            px: 3, py: 1.5,
                            fontSize: 16, fontWeight: 600,
                            backgroundColor: '#1976d2', color: 'white',
                            border: 'none', borderRadius: 2, cursor: 'pointer',
                            '&:hover': { backgroundColor: '#1565c0' },
                        }}
                    >
                        Imprimir
                    </Box>
                </Box>

                {/* Grid de 2 tickets por fila */}
                <Grid container>
                    {tickets.map((ticket, idx) => (
                        <PalletPrintItem
                            key={ticket.id}
                            pauta={pauta}
                            ticket={ticket}
                            index={idx + 1}
                            total={tickets.length}
                        />
                    ))}
                </Grid>
            </Box>
        </ThemeProvider>
    );
}
