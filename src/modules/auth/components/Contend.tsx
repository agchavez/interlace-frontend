import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Grid from '@mui/material/Grid';

import logo from "../../../assets/logo.png";

const items = [
    {
        icon: <SettingsSuggestRoundedIcon sx={{ color: 'text.secondary' }} />,
        title: 'Gestión de Personal',
        description:
            'Administra tu equipo de trabajo de manera centralizada: perfiles, departamentos, historial y documentación de cada colaborador.',
    },
    {
        icon: <ConstructionRoundedIcon sx={{ color: 'text.secondary' }} />,
        title: 'Tokens y Solicitudes',
        description:
            'Gestiona permisos, horas extra, cambios de turno y pases de salida con un flujo de aprobación claro y trazable.',
    },
    {
        icon: <ThumbUpAltRoundedIcon sx={{ color: 'text.secondary' }} />,
        title: 'Evaluaciones de Desempeño',
        description:
            'Realiza seguimiento del rendimiento de tu personal con métricas configurables, evaluaciones periódicas y reportes detallados.',
    },
    {
        icon: <AutoFixHighRoundedIcon sx={{ color: 'text.secondary' }} />,
        title: 'Certificaciones y Competencias',
        description:
            'Controla las certificaciones de tu equipo, recibe alertas de vencimiento y asegura el cumplimiento de requisitos en todo momento.',
    },
];

export default function Content() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    return (
        <Box sx={{ maxWidth: isMobile ? '100%' : 450 }}>
            <Box sx={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start', mb: isMobile ? 2 : 3 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={logo} alt="img" width={isMobile ? 70 : 100} style={{ marginRight: '4px' }} />
                    <Typography variant="body2" component="p" fontWeight={100} sx={{
                        borderLeft: '2px solid black',
                        paddingLeft: '4px',
                        fontSize: isMobile ? '0.8125rem' : '0.875rem',
                    }}>
                        {import.meta.env.VITE_JS_APP_NAME}
                    </Typography>
                </div>
            </Box>

            {isMobile ? (
                // En móviles, mostrar en grid compacto
                <Grid container spacing={1.5}>
                    {items.map((item, index) => (
                        <Grid item xs={6} key={index}>
                            <Box sx={{
                                p: 1.25,
                                height: '100%',
                                borderRadius: 1,
                                backgroundColor: theme.palette.background.paper,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
                                    {item.icon}
                                    <Typography variant="subtitle2" sx={{ ml: 0.75, fontWeight: 'medium', fontSize: '0.8125rem' }}>
                                        {item.title}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.75rem', lineHeight: 1.4 }}>
                                    {item.description}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                // En desktop, mantener el diseño original en lista
                <Stack sx={{ gap: 4 }}>
                    {items.map((item, index) => (
                        <Stack key={index} direction="row" sx={{ gap: 2 }}>
                            {item.icon}
                            <div>
                                <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
                                    {item.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {item.description}
                                </Typography>
                            </div>
                        </Stack>
                    ))}
                </Stack>
            )}
        </Box>
    );
}