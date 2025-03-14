import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Content from "../components/Contend.tsx";
import SignInCard from "../components/SignInCard.tsx";
import { useTheme } from '@mui/material/styles';

export default function SignInSide() {
    const theme = useTheme(); // Obtiene el tema actual

    return (
        <>
            <CssBaseline enableColorScheme />
            <Stack
                direction="column"
                component="main"
                sx={[
                    {
                        justifyContent: 'center',
                        height: 'calc((1 - var(--template-frame-height, 0)) * 100%)',
                        marginTop: 'max(40px - var(--template-frame-height, 0px), 0px)',
                        minHeight: '100%',
                    },
                    {
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
                    },
                ]}
            >
                <Stack
                    direction={{ xs: 'column-reverse', md: 'row' }}
                    sx={{
                        justifyContent: 'center',
                        gap: { xs: 6, sm: 12 },
                        p: 2,
                        mx: 'auto',
                    }}
                >
                    <Stack
                        direction={{ xs: 'column-reverse', md: 'row' }}
                        sx={{
                            justifyContent: 'center',
                            gap: { xs: 6, sm: 12 },
                            m: 'auto',
                        }}
                    >
                        <Content />
                        <SignInCard />
                    </Stack>
                </Stack>
            </Stack>
        </>
    );
}
