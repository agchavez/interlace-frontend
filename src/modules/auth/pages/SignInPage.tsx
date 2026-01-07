import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Content from "../components/Contend.tsx";
import SignInCard from "../components/SignInCard.tsx";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

export default function SignInSide() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <>
            <CssBaseline enableColorScheme />
            <Box
                component="main"
                sx={{
                    minHeight: '100vh',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    // Padding reducido y optimizado
                    pt: { xs: 2, sm: 3, md: 0 },
                    pb: { xs: 2, sm: 3, md: 0 },
                    px: { xs: 2, sm: 3, md: 4 },
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        zIndex: -1,
                        inset: 0,
                        backgroundImage:
                            theme.palette.mode === 'dark'
                                ? 'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))'
                                : 'radial-gradient(ellipse at 50% 50%, hsl(39, 100%, 97%), hsl(0, 0%, 100%))',
                        backgroundRepeat: 'no-repeat',
                    },
                }}
            >
                {/* En móviles, PRIMERO el formulario (prioridad), DESPUÉS el contenido */}
                {isMobile ? (
                    <Stack
                        spacing={3}
                        sx={{
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        {/* Formulario de login primero - lo más importante */}
                        <Box sx={{ width: '100%', maxWidth: 500 }}>
                            <SignInCard />
                        </Box>

                        {/* Contenido informativo después - opcional de ver */}
                        <Box sx={{ width: '100%', maxWidth: 500 }}>
                            <Content />
                        </Box>
                    </Stack>
                ) : (
                    // En desktop, lado a lado optimizado
                    <Stack
                        direction="row"
                        sx={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: { md: 6, lg: 8 },
                            height: '100%',
                            flex: 1,
                            maxWidth: 1400,
                            mx: 'auto',
                            width: '100%',
                        }}
                    >
                        <Box sx={{ flex: '1 1 auto', maxWidth: 500 }}>
                            <Content />
                        </Box>
                        <Box sx={{ flex: '1 1 auto', maxWidth: 500 }}>
                            <SignInCard />
                        </Box>
                    </Stack>
                )}
            </Box>
        </>
    );
}