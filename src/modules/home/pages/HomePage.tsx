import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

export default function HomePage() {
    const navigate = useNavigate();
    return <>
        <Button onClick={() => navigate("/user")}>Ir a usuarios</Button>
        <Button onClick={() => navigate("/user/register")}>registro</Button>

    </>
}