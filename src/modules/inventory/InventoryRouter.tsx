import { Route, Routes } from "react-router-dom";
import InventoryManager from "./pages/InventoryManager";
const InventoryRouter = () => {
  return (
    <Routes>
        <Route path="/" element={<InventoryManager /> } />
    </Routes>
  )
}

export default InventoryRouter