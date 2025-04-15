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
                    // Añadimos padding top por defecto para evitar problemas con el navbar
                    pt: { xs: '60px', sm: '70px' },
                    pb: { xs: '20px' },
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
                {/* En móviles, primero el contenido, luego el formulario */}
                {isMobile ? (
                    <>
                        <Box sx={{ p: 2, mb: 4, mt: 100 }}>
                            <Content />
                        </Box>
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                            <SignInCard />
                        </Box>
                    </>
                ) : (
                    // En desktop, lado a lado como antes
                    <Stack
                        direction="row"
                        sx={{
                            justifyContent: 'center',
                            alignItems: 'center', 
                            gap: { md: 8, lg: 12 },
                            p: 2,
                            height: '100%',
                            flex: 1
                        }}
                    >
                        <Content />
                        <SignInCard />
                    </Stack>
                )}
            </Box>
        </>
    );
}