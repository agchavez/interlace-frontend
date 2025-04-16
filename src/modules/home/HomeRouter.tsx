import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DashboardCdPage from "./pages/DashboardCdPage";
import NotificationPage from "./pages/NotificationPage.tsx";

export default function HomeRouter() {
    return <Routes>
        <Route path="/" element= {<HomePage />}/>
        <Route path="/dashboard/cd" element= {<DashboardCdPage />}/>
        <Route path='/notifications' element={<NotificationPage />} />
        <Route path="*" element= {<Navigate to="/"/>}/>
    </Routes>
}