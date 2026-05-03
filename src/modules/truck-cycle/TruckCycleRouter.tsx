import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import UploadPalletPage from './pages/UploadPalletPage';
import PautaListPage from './pages/PautaListPage';
import PautaDetailPage from './pages/PautaDetailPage';
import PickingPage from './pages/PickingPage';
import CountingPage from './pages/CountingPage';
import CheckoutPage from './pages/CheckoutPage';
import WorkstationPage from './pages/WorkstationPage';
import WorkstationStatusDetailPage from './pages/WorkstationStatusDetailPage';
import KPIReportPage from './pages/KPIReportPage';
import OperationsPage from './pages/OperationsPage';
import VerificationPage from './pages/VerificationPage';
import PalletPrintPage from './pages/PalletPrintPage';
function TruckCycleRouter() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/upload" element={<UploadPalletPage />} />
      <Route path="/pautas" element={<PautaListPage />} />
      <Route path="/pautas/:id" element={<PautaDetailPage />} />
      <Route path="/operations" element={<OperationsPage />} />
      <Route path="/picking" element={<PickingPage />} />
      <Route path="/counting" element={<CountingPage />} />
      <Route path="/verify/:id" element={<VerificationPage />} />
      <Route path="/pallet-print/:id" element={<PalletPrintPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/workstation" element={<WorkstationPage />} />
      <Route path="/workstation/status/:status" element={<WorkstationStatusDetailPage />} />
      <Route path="/kpi/config" element={<Navigate to="/maintenance/kpi-config" replace />} />
      <Route path="/kpi/report" element={<KPIReportPage />} />
      <Route path="/trucks" element={<Navigate to="/maintenance/trucks" replace />} />
      <Route path="/bays" element={<Navigate to="/maintenance/bays" replace />} />
      <Route path="*" element={<Navigate to="/truck-cycle" />} />
    </Routes>
  );
}

export default TruckCycleRouter;
