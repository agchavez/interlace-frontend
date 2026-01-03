import { Box, Container } from "@mui/material";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                position: 'relative',
                py: { xs: 4, sm: 6 },
                px: { xs: 2, sm: 3 },
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 50%, rgba(220, 187, 32, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(102, 126, 234, 0.2) 0%, transparent 50%)',
                    pointerEvents: 'none',
                },
            }}
        >
            <Container
                component="main"
                maxWidth="sm"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <LoginForm />
            </Container>
        </Box>
    )
}