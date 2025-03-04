import { FC, useState } from "react";
import { NavLink } from "react-router-dom";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import { SideBarMainItem } from "./Side2Bar";
import {useAppSelector} from "../../../store";

interface SidebarItemProps {
    item: SideBarMainItem;
    subitemClickAction?: () => void; // callback para cuando clickean un subitem
}

export const SideBarItem: FC<SidebarItemProps> = ({
                                                      item,
                                                      subitemClickAction,
                                                  }) => {
    const [open, setOpen] = useState(false);
    const openSidebar = useAppSelector((state) => state.ui.openSidebar);
    const handleToggle = () => {
        setOpen(!open);
    };

    return (
        <li className={open ? "showMenu" : ""}>
            {/* "Bloque" principal */}
            <div
                className="iocn-link"
                onClick={handleToggle}
                style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                {/* Bloque IZQUIERDA: icono + texto */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <i className={'bx bx-grid-alt'} >
                        {item.icon}
                    </i>
                    <span className="link_name" style={{ color: "white" }}>
                            {openSidebar? "" : item.text}
                </span>
                            </div>

                            {/* Flecha (derecha) */}
                            <i className="bx bxs-chevron-down arrow">
                                <KeyboardArrowUpOutlinedIcon fontSize="small" />
                            </i>
            </div>

            {/* Subitems */}
            <ul className="sub-menu">
                {/* Texto principal repetido en la sub-menu (opcional) */}
                <li className="link_name">{item.text}</li>
                {/* Render de cada subitem visible */}
                {item.subItems.map((sub) => {
                    if (!sub.visible) return null; // si no es visible, lo ocultamos

                    if (sub.href) {
                        return (
                            <li key={sub.id}>
                                <NavLink
                                    to={sub.href}
                                    className={({ isActive }) => {
                                        // además del isActive de react-router, revisamos sub.selected
                                        return sub.selected || isActive ? "sidebar__active" : "";
                                    }}
                                    onClick={subitemClickAction}
                                >
                                    <span>{sub.text}</span>
                                </NavLink>
                            </li>
                        );
                    } else {
                        // si no tiene href, puede ser sólo un "título" dentro del submenú
                        return (
                            <li key={sub.id}>
                                <span className="link_name">{sub.text}</span>
                            </li>
                        );
                    }
                })}
            </ul>
        </li>
    );
};
