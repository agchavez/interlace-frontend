import { Container } from "@mui/material";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {

    return <>
        <Container component="main"  sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>

            <LoginForm />
        </Container>
    </>
}