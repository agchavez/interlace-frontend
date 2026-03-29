import {DistributorCenterListPage} from "./page/DistributorCenterListPage.tsx";
import {DistributorCenterDetailPage} from "./page/DistributorCenterDetailPage.tsx";

import {Route, Routes, Navigate} from "react-router-dom";
import {MetricTypesPage} from "./page/MetricTypesPage.tsx";
import {ProductListPage} from "./page/ProductListPage.tsx";
import {OvertimeTypesPage} from "./page/OvertimeTypesPage.tsx";
import {OvertimeReasonsPage} from "./page/OvertimeReasonsPage.tsx";
import TruckCatalogPage from "../truck-cycle/pages/TruckCatalogPage.tsx";
import BayManagementPage from "../truck-cycle/pages/BayManagementPage.tsx";

function MaintenanceRouter() {
    return (
        <Routes>
            <Route
                element={<DistributorCenterListPage />}
                path="/distributor-center"
                />

            <Route
                element={<DistributorCenterDetailPage />}
                path="/distributor-center/:id"
                />

            <Route
                element={<TruckCatalogPage />}
                path="/trucks"
                />

            <Route
                element={<BayManagementPage />}
                path="/bays"
                />

            <Route
                element={<MetricTypesPage />}
                path="/metric-types"
                />

            <Route
                element={<ProductListPage />}
                path="/products"
                />

            <Route
                element={<OvertimeTypesPage />}
                path="/overtime-types"
                />

            <Route
                element={<OvertimeReasonsPage />}
                path="/overtime-reasons"
                />

            <Route path="*" element={<Navigate to="/maintenance/distributor-center" />} />

        </Routes>
    );
}

export default MaintenanceRouter;