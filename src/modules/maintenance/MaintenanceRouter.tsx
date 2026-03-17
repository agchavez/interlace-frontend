// import {DistributorCenterListPage} from "./page/DistributorCenterListPage.tsx";

import {Route, Routes, Navigate} from "react-router-dom";
// import {PeriodListPage} from "./page/PeriodListPage.tsx";
import {MetricTypesPage} from "./page/MetricTypesPage.tsx";
import {ProductListPage} from "./page/ProductListPage.tsx";
import {OvertimeTypesPage} from "./page/OvertimeTypesPage.tsx";
import {OvertimeReasonsPage} from "./page/OvertimeReasonsPage.tsx";

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

            <Route
                element={<OvertimeTypesPage />}
                path="/overtime-types"
                />

            <Route
                element={<OvertimeReasonsPage />}
                path="/overtime-reasons"
                />

            <Route path="*" element={<Navigate to="/distributor-center" />} />

        </Routes>
    );
}

export default MaintenanceRouter;