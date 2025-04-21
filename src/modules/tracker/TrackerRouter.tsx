
import { Route, Routes } from 'react-router-dom'
import { CheckPage } from './Pages/CheckPage';
import { ManagePage } from './Pages/ManagePage';
import { DetailPage } from './Pages/DetailPage';
import QRCheckPage from './Pages/QrCheckPage';
import ViewTrackerPage from './Pages/ViewTrackerPage';
import ReportExportPage from './Pages/ExportPage';

export const TrackerRouter = () => {
  return (
    <>
    <Routes>
      <Route path="check" element={<CheckPage />} />
      <Route path="manage" element={<ManagePage />} />
      <Route path="detail/:id" element={<DetailPage />} />
      
      <Route path="pallet-detail/:id" element={<QRCheckPage />} />
      <Route path="view" element={<ViewTrackerPage />} />
      <Route path="export" element={<ReportExportPage />} />
      <Route path="*" element={<CheckPage />} />
    </Routes>

    </>
  )
}

export default TrackerRouter
