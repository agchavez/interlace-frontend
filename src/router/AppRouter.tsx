
import { useEffect, lazy, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { useAppDispatch, useAppSelector } from '../store';
import { checkToken } from "../store/auth/thunks";
import HomeRouter from "../modules/home/HomeRouter";

import { LazyLoading } from '../modules/ui/components/LazyLoading';
import Sidebar from '../modules/ui/components/Sidebar';
import Navbar from '../modules/ui/components/Navbar';

import { getDistributionCenters } from '../store/user';
import { getMaintenanceData } from '../store/maintenance/maintenanceThunk';
import { permisions } from '../config/directory';
import { LogOutTimer } from '../modules/auth/components/LogoutTimer';

const UserRouter = lazy(() => import('../modules/user/UserRouter'));
const AuthRouter = lazy(() => import('../modules/auth/AuthRouter'));
const TrackerRouter = lazy(() => import('../modules/tracker/TrackerRouter'));
const ReportRouter = lazy(() => import('../modules/report/ReportRouter'));
const OrderRouter = lazy(() => import('../modules/order/OrderRouter'));
const InventoryRouter = lazy(() => import('../modules/inventory/InventoryRouter'));

export function AppRouter() {
    const { status, user } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch()
    const location = useLocation()
    useEffect(() => {
        dispatch(checkToken());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (status === "authenticated") {
            dispatch(getDistributionCenters())
            dispatch(getMaintenanceData());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status])

    const permitedRoute = useMemo(() => {
        const location_ = location.pathname;
        const obj = permisions.find(perm => {
            if(perm.reg) {
                return perm.reg?.test(location_)
            } else {
                return perm.url === location_ || (perm.url +'/') === location_
            }
        })
        if (!obj) return false
        const requiredPermissions = obj?.permissions
        if (requiredPermissions.includes("any")) return true;
        return requiredPermissions.every(r_perm =>
            user?.list_permissions.includes(r_perm) ||
            user?.user_permissions.includes(r_perm)
        )
    }, [location.pathname, user?.list_permissions, user?.user_permissions])
    const [openMobileSidebar, setOpenMobileSidebar] = useState(false)
    if (status === 'checking') return <></>

    if (!permitedRoute) return <Navigate to="/"/>

    return <>
        <div >
            {status === 'authenticated' && <Sidebar open={openMobileSidebar} setOpen={setOpenMobileSidebar}/>}
            <Navbar sidebarOpen={openMobileSidebar} setSidebaOpen={setOpenMobileSidebar}/>
            <LogOutTimer />
            <div>
                <div className={status === 'authenticated' ? 'ui__container' : 'ui__container__auth'}>

                    <Routes>
                        <Route path="/auth/*" element={
                            <PrivateRoute access={status === 'unauthenticated'} path="/">
                                <LazyLoading Children={
                                    AuthRouter
                                } />
                            </PrivateRoute>
                        } />
                        <Route path="/user/*" element={
                            <PrivateRoute access={status === 'authenticated'} path="/">
                                <LazyLoading Children={
                                    UserRouter
                                } />
                            </PrivateRoute>
                        } />
                        <Route path="/tracker/*" element={
                            <PrivateRoute access={status === 'authenticated'} path="/">
                                <LazyLoading Children={
                                    TrackerRouter
                                } />
                            </PrivateRoute>
                        } />
                        <Route path="/*" element={
                            <PrivateRoute access={status === 'authenticated'} path="/auth/login">
                                <HomeRouter />
                            </PrivateRoute>
                        } />
                        <Route path="/report/*" element={
                            <PrivateRoute access={status === 'authenticated'} path="/">
                                <LazyLoading Children={
                                    ReportRouter
                                } />
                            </PrivateRoute>
                        } />
                        <Route path="/order/*" element={
                            <PrivateRoute access={status === 'authenticated'} path="/">
                                <LazyLoading Children={
                                    OrderRouter
                                } />
                            </PrivateRoute>
                        } />
                        <Route path="/inventory/*" element={
                            <PrivateRoute access={status === 'authenticated'} path="/">
                                <LazyLoading Children={
                                    InventoryRouter
                                } />
                            </PrivateRoute>
                        } />
                        <Route path="*" element={<>Error</>} />
                    </Routes>
                </div>
            </div>
        </div>
    </>
}