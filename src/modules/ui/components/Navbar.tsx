import { Typography } from "@mui/material";
import { FunctionComponent } from "react";

interface NavbarProps {

}

const Navbar: FunctionComponent<NavbarProps> = () => {
    return (
        <nav className="home__navbar">
            <div className="home__user">
                <Typography >
                    Usuario: Gabriel Chavez
                </Typography>
            </div>
            <div className="home__store">
                <Typography >
                    Almacén Tegucigalpa
                </Typography>
            </div>
        </nav>
    );
}

export default Navbar;