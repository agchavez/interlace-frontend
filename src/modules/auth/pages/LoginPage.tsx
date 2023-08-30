import { Container } from "@mui/material";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {

    return <>
        <Container component="main" maxWidth="xs" className="auth__root">
            <LoginForm />
        </Container>
    </>
}