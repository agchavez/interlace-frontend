import { Navigate } from "react-router-dom";
import { JSX } from "react/jsx-dev-runtime";

interface Props {
    children: JSX.Element;
    access: boolean;
    path: string;
    next?: string;
}

export const PrivateRoute = ({ children, access, path, next }: Props) => {
  let to = "";
  if (!access) {
    const existingSearchParams = new URLSearchParams(location.search);
    existingSearchParams.delete("next");
    const nextPath = next ? next : location.pathname;
    to =
      existingSearchParams.toString().length > 0
        ? path + `?next=${nextPath + "/?" + existingSearchParams.toString()}`
        : path + `?next=${nextPath}`;
  }
  if (access) {
    return <>{children}</>;
  } else {
    return <Navigate to={to} />;
  }
};
