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
        title: 'Rendimiento adaptable',
        description:
            'Nuestra plataforma se ajusta sin esfuerzo a tus necesidades, mejorando la eficiencia y simplificando la gestión de traslados.',
    },
    {
        icon: <ConstructionRoundedIcon sx={{ color: 'text.secondary' }} />,
        title: 'Construido para durar',
        description:
            'Experimenta una durabilidad inigualable que va más allá, asegurando una inversión a largo plazo en la gestión de logística.',
    },
    {
        icon: <ThumbUpAltRoundedIcon sx={{ color: 'text.secondary' }} />,
        title: 'Excelente experiencia de usuario',
        description:
            'Integra nuestra plataforma en tu rutina con una interfaz intuitiva y fácil de usar, optimizando la gestión de pedidos y stocks.',
    },
    {
        icon: <AutoFixHighRoundedIcon sx={{ color: 'text.secondary' }} />,
        title: 'Funcionalidad innovadora',
        description:
            'Mantente a la vanguardia con características que establecen nuevos estándares, abordando tus necesidades logísticas en constante evolución.',
    },
];

export default function Content() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    return (
        <Box sx={{ maxWidth: isMobile ? '100%' : 450 }}>
            <Box sx={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start', mb: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={logo} alt="img" width={isMobile ? 80 : 100} style={{ marginRight: '4px' }} />
                    <Typography variant="body2" component="p" fontWeight={100} sx={{
                        borderLeft: '2px solid black',
                        paddingLeft: '4px',
                    }}>
                        {import.meta.env.VITE_JS_APP_NAME}
                    </Typography>
                </div>
            </Box>
            
            {isMobile ? (
                // En móviles, mostrar en grid compacto
                <Grid container spacing={2}>
                    {items.map((item, index) => (
                        <Grid item xs={6} key={index}>
                            <Box sx={{ 
                                p: 1.5, 
                                height: '100%',
                                borderRadius: 1,
                                backgroundColor: theme.palette.background.paper,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    {item.icon}
                                    <Typography variant="subtitle2" sx={{ ml: 1, fontWeight: 'medium' }}>
                                        {item.title}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
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