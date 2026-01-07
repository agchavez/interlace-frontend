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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                position: 'relative',
                py: { xs: 2, sm: 3, md: 3 },
                px: { xs: 1.5, sm: 2, md: 3 },
                overflow: 'auto',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 50%, rgba(220, 187, 32, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(102, 126, 234, 0.2) 0%, transparent 50%)',
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