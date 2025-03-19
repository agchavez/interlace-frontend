
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import { SitemarkIcon } from './CustomIcons';
import logo from "../../../assets/logo.png";
import React from "react";

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
    return (
        <Stack
            sx={{ flexDirection: 'column', alignSelf: 'center', gap: 4, maxWidth: 450 }}
        >
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                <div className="" style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={logo} alt="img" width={100} className="p-1" style={{ marginRight: '4px' }} />
                    <Typography variant="body2" component="p" fontWeight={100} className="p-1" sx={{
                        borderLeft: '2px solid black',
                        paddingLeft: '4px',
                    }}>
                        {import.meta.env.VITE_JS_APP_NAME}
                    </Typography>
                </div>
            </Box>
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
    );
}
