import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DashboardCdPage from "./pages/DashboardCdPage";
import NotificationPage from "./pages/NotificationPage.tsx";
import MyWorkstationPage from "./pages/MyWorkstationPage";

export default function HomeRouter() {
    return <Routes>
        <Route path="/" element= {<HomePage />}/>
        <Route path="/dashboard/cd" element= {<DashboardCdPage />}/>
        <Route path='/notifications' element={<NotificationPage />} />
        <Route path="/my-workstation" element={<MyWorkstationPage />} />
        <Route path="*" element= {<Navigate to="/"/>}/>
    </Routes>
}