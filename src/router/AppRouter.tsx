
import { useEffect, lazy } from 'react'
import { Route, Routes } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { useAppDispatch, useAppSelector } from '../store';
import { checkToken } from "../store/auth/thunks";
import HomeRouter from "../modules/home/HomeRouter";

import { LazyLoading } from '../modules/ui/components/LazyLoading';
import Sidebar from '../modules/ui/components/Sidebar';
import { Grid } from '@mui/material';
import Navbar from '../modules/ui/components/Navbar';

const UserRouter = lazy(() => import('../modules/user/UserRouter'));
const AuthRouter = lazy(() => import('../modules/auth/AuthRouter'));
const TrackerRouter = lazy(() => import('../modules/tracker/TrackerRouter'));

export function AppRouter() {
    const { status } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(checkToken());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    // useEffect(() => {
    //     setTimeout(() => {
    //         dispatch(login({
    //             "user": {
    //                 "id": "cc9fc03d-2379-476f-b56d-346b15e8f125",
    //                 "list_groups": [],
    //                 "list_permissions": [
    //                     "contenttypes.view_contenttype",
    //                     "sessions.add_session",
    //                     "maintenance.view_centrodistribucion",
    //                     "auth.view_group",
    //                     "user.change_detailgroup",
    //                     "user.view_usermodel",
    //                     "contenttypes.add_contenttype",
    //                     "maintenance.delete_centrodistribucion",
    //                     "sessions.change_session",
    //                     "auth.view_permission",
    //                     "user.delete_detailgroup",
    //                     "auth.add_permission",
    //                     "auth.change_group",
    //                     "auth.change_permission",
    //                     "auth.delete_group",
    //                     "contenttypes.delete_contenttype",
    //                     "user.change_usermodel",
    //                     "auth.delete_permission",
    //                     "maintenance.change_centrodistribucion",
    //                     "admin.change_logentry",
    //                     "admin.add_logentry",
    //                     "user.view_detailgroup",
    //                     "user.add_usermodel",
    //                     "sessions.view_session",
    //                     "user.add_detailgroup",
    //                     "admin.view_logentry",
    //                     "sessions.delete_session",
    //                     "admin.delete_logentry",
    //                     "user.delete_usermodel",
    //                     "contenttypes.change_contenttype",
    //                     "maintenance.add_centrodistribucion",
    //                     "auth.add_group"
    //                 ],
    //                 "centro_distribucion": null,
    //                 "last_login": new Date("2023-08-30T06:32:08.853477-06:00"),
    //                 "is_superuser": true,
    //                 "username": "agchavez",
    //                 "is_staff": true,
    //                 "is_active": true,
    //                 "date_joined": new Date("2023-08-28T20:02:34.782965-06:00"),
    //                 "first_name": "GABRIEL",
    //                 "last_name": "CHAVEZ",
    //                 "email": "agchavez@unah.hn",
    //                 "created_at": new Date("2023-08-28T20:02:34.935469-06:00"),
    //                 "groups": [],
    //                 "user_permissions": []
    //             },
    //             token: {
    //                 access: "",
    //                 refresh: "",
    //                 exp: 0,
    //             },
    //         }))
    //     }, 1000);
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [])

    // if (status === 'checking') {
    //     return <>Loading</>
    // }

    return <>
        <div >
            {status === 'authenticated' && <Sidebar open={true} />}
                    <Navbar />
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
                            
                            <Route path="*" element={<>Error</>} />
                        </Routes>
                </div>
            </div>
        </div>
    </>
}