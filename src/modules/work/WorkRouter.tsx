import { Routes, Route, Navigate } from 'react-router-dom';
import WorkHome from './pages/WorkHome';
import PickerHome from './pages/PickerHome';
import PickerPautaDetail from './pages/PickerPautaDetail';
import CounterHome from './pages/CounterHome';
import CounterPautaDetail from './pages/CounterPautaDetail';
import SecurityHome from './pages/SecurityHome';
import SecurityPautaDetail from './pages/SecurityPautaDetail';
import OpsHome from './pages/OpsHome';
import OpsPautaDetail from './pages/OpsPautaDetail';
import YardHome from './pages/YardHome';
import YardPautaDetail from './pages/YardPautaDetail';
import VendorHome from './pages/VendorHome';
import VendorPautaDetail from './pages/VendorPautaDetail';
import WorkRoleGuard from './components/WorkRoleGuard';
import RoleWorkstationPage from './pages/RoleWorkstationPage';
import RepackHomePage from '../repack/pages/RepackHomePage';
import RepackOperationsPage from '../repack/pages/RepackOperationsPage';
import RepackSessionDetailPage from '../repack/pages/RepackSessionDetailPage';

export default function WorkRouter() {
    return (
        <Routes>
            <Route path="/" element={<WorkHome />} />
            <Route path="/picker"     element={<WorkRoleGuard role="PICKER"><PickerHome /></WorkRoleGuard>} />
            <Route path="/picker/workstation" element={<RoleWorkstationPage role="picker" />} />
            <Route path="/picker/:id" element={<WorkRoleGuard role="PICKER"><PickerPautaDetail /></WorkRoleGuard>} />
            <Route path="/counter"    element={<WorkRoleGuard role="COUNTER"><CounterHome /></WorkRoleGuard>} />
            <Route path="/counter/workstation" element={<RoleWorkstationPage role="counter" />} />
            <Route path="/counter/:id" element={<WorkRoleGuard role="COUNTER"><CounterPautaDetail /></WorkRoleGuard>} />
            <Route path="/security"   element={<WorkRoleGuard role="SECURITY"><SecurityHome /></WorkRoleGuard>} />
            <Route path="/security/:id" element={<WorkRoleGuard role="SECURITY"><SecurityPautaDetail /></WorkRoleGuard>} />
            <Route path="/ops"        element={<WorkRoleGuard role="OPS"><OpsHome /></WorkRoleGuard>} />
            <Route path="/ops/:id"    element={<WorkRoleGuard role="OPS"><OpsPautaDetail /></WorkRoleGuard>} />
            <Route path="/yard"       element={<WorkRoleGuard role="YARD_DRIVER"><YardHome /></WorkRoleGuard>} />
            <Route path="/yard/workstation" element={<RoleWorkstationPage role="yard" />} />
            <Route path="/yard/:id"   element={<WorkRoleGuard role="YARD_DRIVER"><YardPautaDetail /></WorkRoleGuard>} />
            <Route path="/repack" element={<RepackHomePage />} />
            <Route path="/repack/operations" element={<RepackOperationsPage />} />
            <Route path="/repack/workstation" element={<RoleWorkstationPage role="repack" />} />
            <Route path="/repack/:id" element={<RepackSessionDetailPage />} />
            <Route path="/vendor"     element={<WorkRoleGuard role="VENDOR"><VendorHome /></WorkRoleGuard>} />
            <Route path="/vendor/:id" element={<WorkRoleGuard role="VENDOR"><VendorPautaDetail /></WorkRoleGuard>} />
            <Route path="*" element={<Navigate to="/work" replace />} />
        </Routes>
    );
}
