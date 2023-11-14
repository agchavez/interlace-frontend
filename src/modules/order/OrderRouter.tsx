
import { Route, Routes } from 'react-router-dom';
import ManageOrder from './pages/ManageOrder';
import { RegisterOrderpage } from './pages/RegisterOrderpage';
const OrderRouter = () => {
    return (
        <>
            <Routes>
                <Route path="manage" element={<ManageOrder />} />
                <Route path="register" element={<RegisterOrderpage />} />
                <Route path="*" element={<ManageOrder />} />
            </Routes>
        </>
    )
}

export default OrderRouter