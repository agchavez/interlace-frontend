
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
            <Route path="/detail/:id" element={<ClaimDetailPage />} />
            <Route path="*" element={<Navigate to="/claims" />} />

        </Routes>
    );
}

export default MaintenanceRouter;