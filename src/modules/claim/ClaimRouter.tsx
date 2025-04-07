
import MyClaimsPage from "./pages/MyClaimsPage";
import {ClaimReviewPage} from "./pages/ClaimReviewPage";
import { Navigate, Route, Routes } from "react-router-dom";
import ClaimDetailPage from "./pages/ClaimDetailPage"; 

function MaintenanceRouter() {
    return (
        <Routes>
            <Route
                element={<ClaimReviewPage />}
                path="/"
                />

            <Route
                element={<MyClaimsPage />}
                path="/mine"
                />
            <Route path="/editstatus/:id" element={<ClaimDetailPage canEditStatus={true} canEditInfo={false} />} />
            <Route path="/detail/:id" element={<ClaimDetailPage canEditStatus={false} canEditInfo={true} />} />
            <Route path="*" element={<Navigate to="/claim" />} />

        </Routes>
    );
}

export default MaintenanceRouter;