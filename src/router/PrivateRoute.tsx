import { Navigate } from "react-router-dom";
import { JSX } from "react/jsx-dev-runtime";

interface Props {
    children: JSX.Element;
    access: boolean;
    path: string;
    next?: string;
}

export const PrivateRoute = ({children, access, path, next}:Props) => {
    let to = ''
    if (!access){
        if (next){
            to = path+"?next="+next
        } else {
            to = path+'?next='+location.pathname
        }
    }
    if (access) {
        return <>{children}</>
    } else {
        return <Navigate to={to} />
    }
}