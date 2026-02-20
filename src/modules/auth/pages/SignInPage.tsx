import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import SignInCard from "../components/SignInCard.tsx";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import BadgeIcon from '@mui/icons-material/Badge';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

const features = [
    {
        icon: <BadgeIcon sx={{ fontSize: '1rem' }} />,
        label: 'Gestión de Personal',
        desc: 'Perfiles, departamentos y documentación centralizada',
    },
    {
        icon: <ConfirmationNumberIcon sx={{ fontSize: '1rem' }} />,
        label: 'Tokens y Solicitudes',
        desc: 'Permisos, horas extra y pases de salida con aprobación',
    },
    {
        icon: <AssessmentIcon sx={{ fontSize: '1rem' }} />,
        label: 'Evaluaciones de Desempeño',
        desc: 'Métricas configurables y seguimiento periódico',
    },
    {
        icon: <WorkspacePremiumIcon sx={{ fontSize: '1rem' }} />,
        label: 'Certificaciones',
        desc: 'Alertas de vencimiento y control de competencias',
    },
];

export default function SignInSide() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <>
            <CssBaseline enableColorScheme />
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>

                {/* ── PANEL IZQUIERDO (branding) ── */}
                {!isMobile && (
                    <Box
                        sx={{
                            flex: '0 0 44%',
                            background: 'linear-gradient(160deg, #0a1628 0%, #0d2151 45%, #1565c0 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            px: 6,
                            py: 7,
                            position: 'relative',
                            overflow: 'hidden',
                            // Círculo decorativo superior
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                width: 480,
                                height: 480,
                                borderRadius: '50%',
                                border: '1px solid rgba(255,255,255,0.06)',
                                top: -160,
                                right: -160,
                            },
                            // Círculo decorativo inferior
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                width: 320,
                                height: 320,
                                borderRadius: '50%',
                                border: '1px solid rgba(255,255,255,0.05)',
                                bottom: -80,
                                left: -80,
                            },
                        }}
                    >
                        {/* Logotipo */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 1 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.12)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(8px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'Inter' }}>
                                    I
                                </Typography>
                            </Box>
                            <Typography
                                sx={{
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '1.2rem',
                                    fontFamily: 'Inter',
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                Interlace
                            </Typography>
                        </Box>

                        {/* Contenido principal */}
                        <Box sx={{ zIndex: 1 }}>
                            <Typography
                                sx={{
                                    color: 'rgba(255,255,255,0.5)',
                                    fontFamily: 'Inter',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    mb: 2,
                                }}
                            >
                                Plataforma de RRHH
                            </Typography>

                            <Typography
                                sx={{
                                    color: 'white',
                                    fontWeight: 800,
                                    fontSize: { md: '2rem', lg: '2.5rem' },
                                    fontFamily: 'Inter',
                                    letterSpacing: '-0.03em',
                                    lineHeight: 1.15,
                                    mb: 2.5,
                                }}
                            >
                                Gestiona tu equipo<br />
                                <Box component="span" sx={{ color: '#60a5fa' }}>
                                    de forma inteligente
                                </Box>
                            </Typography>

                            <Typography
                                sx={{
                                    color: 'rgba(255,255,255,0.55)',
                                    fontFamily: 'Inter',
                                    fontSize: '0.9rem',
                                    lineHeight: 1.65,
                                    mb: 5,
                                    maxWidth: 340,
                                }}
                            >
                                Centraliza la información de tu personal, automatiza solicitudes y
                                mantén el control de certificaciones desde un solo lugar.
                            </Typography>

                            {/* Features */}
                            <Stack spacing={2.5}>
                                {features.map((f) => (
                                    <Box key={f.label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: '8px',
                                                background: 'rgba(96,165,250,0.15)',
                                                border: '1px solid rgba(96,165,250,0.25)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                color: '#93c5fd',
                                            }}
                                        >
                                            {f.icon}
                                        </Box>
                                        <Box>
                                            <Typography
                                                sx={{
                                                    color: 'rgba(255,255,255,0.9)',
                                                    fontWeight: 600,
                                                    fontFamily: 'Inter',
                                                    fontSize: '0.85rem',
                                                    mb: 0.25,
                                                }}
                                            >
                                                {f.label}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    color: 'rgba(255,255,255,0.45)',
                                                    fontFamily: 'Inter',
                                                    fontSize: '0.78rem',
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                {f.desc}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>

                        {/* Footer del panel */}
                        <Box sx={{ zIndex: 1 }}>
                            <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter', fontSize: '0.75rem' }}>
                                © {new Date().getFullYear()} Interlace · Todos los derechos reservados
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* ── PANEL DERECHO (formulario) ── */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: { xs: 2, sm: 4, md: 5, lg: 8 },
                        py: { xs: 4, md: 6 },
                        backgroundColor: '#f8fafc',
                        minHeight: '100vh',
                    }}
                >
                    {/* Logo móvil */}
                    {isMobile && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 5 }}>
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: '10px',
                                    background: '#1565c0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'Inter' }}>
                                    I
                                </Typography>
                            </Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', fontFamily: 'Inter', color: '#0f172a' }}>
                                Interlace
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ width: '100%', maxWidth: 420 }}>
                        <SignInCard />
                    </Box>
                </Box>
            </Box>
        </>
    );
}
