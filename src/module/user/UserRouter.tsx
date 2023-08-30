import { Route, Routes } from 'react-router-dom';
import { ListUserPage } from './pages/ListUserPage';
import { RegisterUserPage } from './pages/RegisterUserPage';

export const UserRouter = () => {
  return (
    <Routes>
        <Route 
            element={<ListUserPage />}
        path="" />
        <Route
            element={<RegisterUserPage />}
        path="/register" />

        <Route path="*" element={<ListUserPage />} />
    </Routes>
  )
}


export default UserRouter;