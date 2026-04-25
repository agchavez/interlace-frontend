import { Routes, Route, Navigate } from 'react-router-dom';
import TvLandingPage from './pages/TvLandingPage';
import TvPairPage from './pages/TvPairPage';
import TvWorkstationPage from './pages/TvWorkstationPage';
import TvWorkstationPickingPage from './pages/TvWorkstationPickingPage';
import TvRoleWorkstationPage from './pages/TvRoleWorkstationPage';

export default function TvRouter() {
    return (
        <Routes>
            <Route path="/" element={<TvLandingPage />} />
            <Route path="/pair/:code" element={<TvPairPage />} />
            <Route path="/dashboard/workstation" element={<TvWorkstationPage />} />
            <Route path="/dashboard/workstation_picking" element={<TvWorkstationPickingPage />} />
            <Route path="/dashboard/workstation_picker"  element={<TvRoleWorkstationPage role="picker" />} />
            <Route path="/dashboard/workstation_counter" element={<TvRoleWorkstationPage role="counter" />} />
            <Route path="/dashboard/workstation_yard"    element={<TvRoleWorkstationPage role="yard" />} />
            <Route path="*" element={<Navigate to="/tv" replace />} />
        </Routes>
    );
}
