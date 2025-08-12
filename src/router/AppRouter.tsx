import { useEffect, lazy, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { useAppDispatch, useAppSelector } from '../store';
import { checkToken } from "../store/auth";
import HomeRouter from "../modules/home/HomeRouter";

import { LazyLoading } from '../modules/ui/components/LazyLoading';

import { getDistributionCenters } from '../store/user';
import { getMaintenanceData } from '../store/maintenance/maintenanceThunk';
import { permisions } from '../config/directory';
import { LogOutTimer } from '../modules/auth/components/LogoutTimer';
import {Side2bar} from "../modules/ui/components/Side2Bar.tsx";
import NotificationManager from "../modules/ui/components/NotificationManager.tsx";
import AppFooter from "../modules/ui/components/AppFooter";

const UserRouter = lazy(() => import('../modules/user/UserRouter'));
const AuthRouter = lazy(() => import('../modules/auth/AuthRouter'));
const TrackerRouter = lazy(() => import('../modules/tracker/TrackerRouter'));
const TrackerT2Router = lazy(() => import('../modules/tracker_t2/TrackerT2Router'));
const ReportRouter = lazy(() => import('../modules/report/ReportRouter'));
const OrderRouter = lazy(() => import('../modules/order/OrderRouter'));
const InventoryRouter = lazy(() => import('../modules/inventory/InventoryRouter'));
const ClaimRouter = lazy(() => import('../modules/claim/ClaimRouter.tsx'));
const MaintenanceRouter = lazy(() => import('../modules/maintenance/MaintenanceRouter'));
export function AppRouter() {
    const { status, user } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch()
    const location = useLocation()
    const openSidebar = useAppSelector((state) => state.ui.openSidebar);
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
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
        if (requiredPermissions.includes("cd.more") && user?.distributions_centers && user?.distributions_centers?.length >= 1) return true;
        return requiredPermissions.every(r_perm =>
            user?.list_permissions.includes(r_perm) ||
            user?.user_permissions.includes(r_perm)
        )
    }, [location.pathname, user?.list_permissions, user?.user_permissions, user?.distributions_centers])
    const [openMobileSidebar, setOpenMobileSidebar] = useState(false)
    if (status === 'checking') return <></>

    if (!permitedRoute) {
        return <Navigate to={`/?next=${location.pathname}`}/>
    }

    const next = queryParams.get('next')

    return <>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {status === 'authenticated' && <Side2bar open={openMobileSidebar} setOpen={setOpenMobileSidebar} />}
            <NotificationManager/>
            <LogOutTimer />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className={status === 'authenticated' ? !openSidebar ?
                    'ui__container': 'ui__container close' :
                    'ui__container__auth'} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                    <div style={{ flex: 1, maxWidth: '100%', width: '100%', }}>
                        <Routes>
                            <Route path="/auth/*" element={
                                <PrivateRoute access={status === 'unauthenticated'} path="/" next={next || undefined}>
                                    <LazyLoading Children={
                                        AuthRouter
                                    } />
                                </PrivateRoute>
                            } />
                            <Route path="/user/*" element={
                                <PrivateRoute access={status === 'authenticated'} path="/" next={next || undefined}>
                                    <LazyLoading Children={
                                        UserRouter
                                    } />
                                </PrivateRoute>
                            } />
                            <Route path="/tracker/*" element={
                                <PrivateRoute access={status === 'authenticated'} path='/' next={next || undefined}>
                                    <LazyLoading Children={
                                        TrackerRouter
                                    } />
                                </PrivateRoute>
                            } />
                            <Route path="/tracker-t2/*" element={
                                <PrivateRoute access={status === 'authenticated'} path="/" next={next || undefined}>
                                    <LazyLoading Children={
                                        TrackerT2Router
                                    } />
                                </PrivateRoute>
                            } />
                            <Route path="/*" element={
                                <PrivateRoute access={status === 'authenticated'} path='/auth/login' next={next || undefined}>
                                    <HomeRouter />
                                </PrivateRoute>
                            } />
                            <Route path="/report/*" element={
                                <PrivateRoute access={status === 'authenticated'} path="/" next={next || undefined}>
                                    <LazyLoading Children={
                                        ReportRouter
                                    } />
                                </PrivateRoute>
                            } />
                            <Route path="/order/*" element={
                                <PrivateRoute access={status === 'authenticated'} path="/" next={next || undefined}>
                                    <LazyLoading Children={
                                        OrderRouter
                                    } />
                                </PrivateRoute>
                            } />
                            <Route path="/inventory/*" element={
                                <PrivateRoute access={status === 'authenticated'} path="/" next={next || undefined}>
                                    <LazyLoading Children={
                                        InventoryRouter
                                    } />
                                </PrivateRoute>
                            } />
                            <Route path="/maintenance/*" element={
                                <PrivateRoute access={status === 'authenticated'} path="/" next={next || undefined}>
                                    <LazyLoading Children={
                                        MaintenanceRouter
                                    } />
                                </PrivateRoute>
                            } />
                            <Route path="/claim/*" element={
                                <PrivateRoute access={status === 'authenticated'} path="/" next={next || undefined}>
                                    <LazyLoading Children={
                                        ClaimRouter
                                    } />
                                </PrivateRoute>
                            } />
                            <Route path="*" element={<>Error</>} />
                        </Routes>
                    </div>

                    {status === 'authenticated' && <AppFooter />}
                </div>
            </div>
        </div>
    </>
}