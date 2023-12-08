import { Route, Routes } from "react-router-dom";
import PreSalePage from "./Pages/PreSalePage";
import PreSaleCheckPage from "./Pages/PreSaleCheckPage";
import ManagePreSalePage from "./Pages/ManagePreSalePage";
import T2DetailPage from './Pages/T2DetailPage';

export const TrackerT2Router = () => {
    return <Routes>
        <Route path="pre-sale" element={<PreSalePage />}/>
        <Route path="manage" element={<ManagePreSalePage />}/>
        <Route path="pre-sale-check" element={<PreSaleCheckPage />}/>
        <Route path="detail/:id" element={<T2DetailPage />}/>
        <Route path="*" element={<PreSalePage />} />
    </Routes>
}

export default TrackerT2Router;