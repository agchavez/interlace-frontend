
import { useEffect, lazy, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { useAppDispatch, useAppSelector } from '../store';
import { checkToken } from "../store/auth/thunks";
import HomeRouter from "../modules/home/HomeRouter";

import { LazyLoading } from '../modules/ui/components/LazyLoading';

import { getDistributionCenters } from '../store/user';
import { getMaintenanceData } from '../store/maintenance/maintenanceThunk';
import { permisions } from '../config/directory';
import { LogOutTimer } from '../modules/auth/components/LogoutTimer';
import SidebarV2 from '../modules/ui/components/SidebarV2';
import NotificationManager from "../modules/ui/components/NotificationManager.tsx";
import { ChangeDistributorCenter } from '../modules/ui/components/ChangeDistributorCenter';
import { useSidebar } from '../modules/ui/context/SidebarContext';

const UserRouter = lazy(() => import('../modules/user/UserRouter'));
const AuthRouter = lazy(() => import('../modules/auth/AuthRouter'));
const TrackerRouter = lazy(() => import('../modules/tracker/TrackerRouter'));
const TrackerT2Router = lazy(() => import('../modules/tracker_t2/TrackerT2Router'));
const ReportRouter = lazy(() => import('../modules/report/ReportRouter'));
const OrderRouter = lazy(() => import('../modules/order/OrderRouter'));
const InventoryRouter = lazy(() => import('../modules/inventory/InventoryRouter'));
const ClaimRouter = lazy(() => import('../modules/claim/ClaimRouter.tsx'));
const MaintenanceRouter = lazy(() => import('../modules/maintenance/MaintenanceRouter'));
const PersonnelRouter = lazy(() => import('../modules/personnel/PersonnelRouter'));
const TokenRouter = lazy(() => import('../modules/tokens/TokenRouter'));
const PublicTokenPage = lazy(() => import('../modules/tokens/pages/PublicTokenPage').then(m => ({ default: m.PublicTokenPage })));
const SidebarV2Demo = lazy(() => import('../modules/ui/pages/SidebarV2Demo'));
export function AppRouter() {
    const { status, user } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch()
    const location = useLocation()
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const { isCollapsed } = useSidebar();
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

    if (status === 'checking') return <></>

    if (!permitedRoute) {
        return <Navigate to={`/?next=${location.pathname}`}/>
    }

    const next = queryParams.get('next')

    return <>
        {status === 'authenticated' && <ChangeDistributorCenter />}
        {status === 'authenticated' && <SidebarV2 />}
        <NotificationManager/>
        <LogOutTimer />
        <div className={status === 'authenticated' ? `ui__container__v2 ${isCollapsed ? 'collapsed' : ''}` : 'ui__container__auth'}>
            <Routes>
                <Route path="/auth/*" element={
                    <PrivateRoute access={status === 'unauthenticated'} path="/" next={next || undefined}>
                        <LazyLoading Children={
                            AuthRouter
                        } />
                    </PrivateRoute>
                } />
                {/* Ruta pública para tokens - sin autenticación */}
                <Route path="/public/token/:uuid" element={
                    <LazyLoading Children={PublicTokenPage} />
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
                <Route path="/personnel/*" element={
                    <PrivateRoute access={status === 'authenticated'} path="/" next={next || undefined}>
                        <LazyLoading Children={
                            PersonnelRouter
                        } />
                    </PrivateRoute>
                } />
                <Route path="/tokens/*" element={
                    <PrivateRoute access={status === 'authenticated'} path="/" next={next || undefined}>
                        <LazyLoading Children={
                            TokenRouter
                        } />
                    </PrivateRoute>
                } />
                <Route path="*" element={<>Error</>} />
            </Routes>
        </div>
    </>
}