import { FunctionComponent } from "react";

interface NavbarProps {

}

const Navbar: FunctionComponent<NavbarProps> = () => {
    return (
        <nav className="home__navbar">
            <div className="home__user">Nombre de Usuario</div>
            <div className="home__store">Almacén #123</div>
        </nav>
    );
}

export default Navbar;