// import {DistributorCenterListPage} from "./page/DistributorCenterListPage.tsx";

import {Route, Routes, Navigate} from "react-router-dom";
// import {PeriodListPage} from "./page/PeriodListPage.tsx";
import {MetricTypesPage} from "./page/MetricTypesPage.tsx";
import {ProductListPage} from "./page/ProductListPage.tsx";

function MaintenanceRouter() {
    return (
        <Routes>
            {/* <Route
                element={<DistributorCenterListPage />}
                path="/distributor-center"
                /> */}

            {/* <Route
                element={<PeriodListPage />}
                path="/period-center"
                /> */}

            <Route
                element={<MetricTypesPage />}
                path="/metric-types"
                />

            <Route
                element={<ProductListPage />}
                path="/products"
                />

            <Route path="*" element={<Navigate to="/distributor-center" />} />

        </Routes>
    );
}

export default MaintenanceRouter;