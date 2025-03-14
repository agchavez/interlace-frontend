import { Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import SignInSide from "./pages/SignInPage.tsx";

export default function AuthRouter() {
    return <Routes>
        <Route path="/login" element= {<SignInSide />}/>
    </Routes>
}