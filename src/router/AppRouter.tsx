
import { useEffect, lazy } from 'react'
import { Route, Routes } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { useAppDispatch, useAppSelector } from '../store';
import { checkToken } from "../store/auth/thunks";
import HomeRouter from "../modules/home/HomeRouter";
import { LazyLoading } from '../module/ui/components/LazyLoading';
import Sidebar from '../modules/ui/components/Sidebar';
import { Grid } from '@mui/material';
import Navbar from '../modules/ui/components/Navbar';

const UserRouter = lazy(() => import('../module/user/UserRouter'));
const AuthRouter = lazy(() => import('../modules/auth/AuthRouter'));

export function AppRouter() {
    const { status } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(checkToken());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // if (status === 'checking') {
    //     return <>Loading</>
    // }
    return <>
        <Grid container >
            <Sidebar open={true} />
            <Grid item xs={10}>
                <Grid container direction="column">
                    <Navbar />
                    <Grid item >
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
                            <Route path="/*" element={
                                <PrivateRoute access={status === 'authenticated'} path="/auth/login">
                                    <HomeRouter />
                                </PrivateRoute>
                            } />
                            <Route path="*" element={<>Error</>} />
                        </Routes>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    </>
}