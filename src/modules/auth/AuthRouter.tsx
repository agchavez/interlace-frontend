import { Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";

export default function AuthRouter() {
    return <Routes>
        <Route path="/login" element= {<LoginPage />}/>
    </Routes>
}