 import { Route, Routes } from "react-router-dom";
import ShiftReportPage from "./pages/ShiftReportPage";
import NearExpirationReportPage from "./pages/NearExpirationReportPage";

const ReportRouter = () => {
  return (
    <>
      <Routes>
        <Route path="shift" element={<ShiftReportPage />} />
      </Routes>
      <Routes>
        <Route path="por-expirar" element={<NearExpirationReportPage />} />
      </Routes>
    </>
  );
};

export default ReportRouter;
