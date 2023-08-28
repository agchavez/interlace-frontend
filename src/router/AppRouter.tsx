import { useEffect } from 'react'
import { Route, Routes } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store"
import { PrivateRoute } from "./PrivateRoute";
import { login } from "../store/auth";

export function AppRouter() {
    const { status } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch()
    useEffect(()=>{
        setTimeout(() => {
            dispatch(login({
                usuario:{
                    usuarioId:1,
                    correo: "",
                    nombre: "abc",
                    apellido: "def",
                    grupos:[],
                    activo:true
                },
                success: true,
                token: "",
            }))
        }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (status === 'checking') {
        return <>Loading</>
    }
    return <Routes>
        <Route path="/auth/*" element={
            <PrivateRoute access={status === 'unauthenticated'} path="/">
                <>hola</>
            </PrivateRoute>
        } />
        <Route path="/*" element={
            <>Home</>
        } />
        <Route path="*" element={<>Error</>} />
    </Routes>
}