import { Route, Routes } from "react-router-dom"
import ShiftReportPage from './pages/ShiftReportPage';

const ReportRouter = () => {
    return (
        <>
            <Routes>
                <Route path="shift" element={<ShiftReportPage />} />
            </Routes>

        </>
    )
}

export default ReportRouter