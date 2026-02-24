import { Box, Container, useMediaQuery, useTheme } from "@mui/material";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
                position: 'relative',
                pt: { xs: '80px', sm: 3, md: 3 }, // Padding top mayor en móviles para compensar navbar
                pb: { xs: 2, sm: 3, md: 3 },
                px: { xs: 1.5, sm: 2, md: 3 },
                overflow: 'auto',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 50%, rgba(25, 118, 210, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(25, 118, 210, 0.2) 0%, transparent 50%)',
                    pointerEvents: 'none',
                    animation: 'gradient-shift 15s ease infinite',
                },
                '@keyframes gradient-shift': {
                    '0%, 100%': {
                        opacity: 0.7,
                    },
                    '50%': {
                        opacity: 1,
                    },
                },
            }}
        >
            <Container
                component="main"
                maxWidth={false}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    maxWidth: {
                        xs: '100%',
                        sm: '500px',
                        md: '540px',
                    },
                    px: { xs: 0, sm: 2 },
                }}
            >
                <LoginForm />
            </Container>
        </Box>
    )
}