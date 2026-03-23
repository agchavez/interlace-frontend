import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import UploadPalletPage from './pages/UploadPalletPage';
import PautaListPage from './pages/PautaListPage';
import PautaDetailPage from './pages/PautaDetailPage';
import PickingPage from './pages/PickingPage';
import CountingPage from './pages/CountingPage';
import CheckoutPage from './pages/CheckoutPage';
import ReloadQueuePage from './pages/ReloadQueuePage';
import WorkstationPage from './pages/WorkstationPage';
import KPIConfigPage from './pages/KPIConfigPage';
import KPIReportPage from './pages/KPIReportPage';
import TruckCatalogPage from './pages/TruckCatalogPage';
import BayManagementPage from './pages/BayManagementPage';

function TruckCycleRouter() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/upload" element={<UploadPalletPage />} />
      <Route path="/pautas" element={<PautaListPage />} />
      <Route path="/pautas/:id" element={<PautaDetailPage />} />
      <Route path="/picking" element={<PickingPage />} />
      <Route path="/counting" element={<CountingPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/reload-queue" element={<ReloadQueuePage />} />
      <Route path="/workstation" element={<WorkstationPage />} />
      <Route path="/kpi/config" element={<KPIConfigPage />} />
      <Route path="/kpi/report" element={<KPIReportPage />} />
      <Route path="/trucks" element={<TruckCatalogPage />} />
      <Route path="/bays" element={<BayManagementPage />} />
      <Route path="*" element={<Navigate to="/truck-cycle" />} />
    </Routes>
  );
}

export default TruckCycleRouter;
