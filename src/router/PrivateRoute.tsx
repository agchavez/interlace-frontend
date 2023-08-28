import { Navigate } from "react-router-dom";
import { JSX } from "react/jsx-dev-runtime";

interface Props {
    children: JSX.Element;
    access: boolean;
    path: string;
}

export const PrivateRoute = ({children, access, path}:Props) => {
    
    return access ? <>{children}</> : <Navigate to={path} />
}