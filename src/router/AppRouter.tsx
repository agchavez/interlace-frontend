
import { useEffect, lazy } from 'react'
import { Route, Routes } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import AuthRouter from '../modules/auth/AuthRouter';
import { useAppDispatch, useAppSelector } from '../store';
import { checkToken } from "../store/auth/thunks";
import HomeRouter from "../modules/home/HomeRouter";
import { login } from "../store/auth";
import { LazyLoading } from '../module/ui/components/LazyLoading';

const UserRouter = lazy(() => import('../module/user/UserRouter'));

export function AppRouter() {
    const { status } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch()
    console.log("status", status)
    useEffect(()=>{
        dispatch(checkToken());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

   
    useEffect(() => {
        setTimeout(() => {
            dispatch(login({
                usuario: {
                    usuarioId: 1,
                    correo: "",
                    nombre: "abc",
                    apellido: "def",
                    grupos: [],
                    activo: true
                },
                success: true,
                token: "",
            }))
        }, 1000);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // if (status === 'checking') {
    //     return <>Loading</>
    // }
    return <Routes>
        <Route path="/auth/*" element={
            <PrivateRoute access={status === 'unauthenticated'} path="/">
                <AuthRouter />
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
            <Routes>
                <Route path="/*" element= {
                    <PrivateRoute access={status === 'authenticated'} path="/auth/login">
                        <HomeRouter /> 
                    </PrivateRoute>
                }/>
            </Routes>
        } />
        <Route path="*" element={<>Error</>} />
    </Routes>
}