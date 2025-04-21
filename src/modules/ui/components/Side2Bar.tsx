import React, { FunctionComponent, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../store";
import { logout } from "../../../store/auth"; // o la acción real de logout
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import DashboardTwoToneIcon from "@mui/icons-material/DashboardTwoTone";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import Inventory2TwoToneIcon from "@mui/icons-material/Inventory2TwoTone";
import ContentPasteGoTwoToneIcon from "@mui/icons-material/ContentPasteGoTwoTone";
import EngineeringTwoToneIcon from '@mui/icons-material/EngineeringTwoTone';
import { SideBarItem } from "./SideBar2Item";
import {Avatar, Tooltip, useMediaQuery} from "@mui/material";
import {RoutePermissionsDirectory} from "../../../config/directory.ts";
import AssignmentLateTwoToneIcon from '@mui/icons-material/AssignmentLateTwoTone';
import {toggleSidebar} from "../../../store/ui/uiSlice.ts";

// ============================
// Interfaz para subitems
// ============================
export interface SideBarSubItems {
    href: string | undefined;
    text: string;
    id: string;
    selected?: boolean;
    permissions?: string[];
    visible?: boolean;
}

// ============================
// Interfaz para items
// ============================
export interface SideBarMainItem {
    text: string;
    icon?: React.ReactNode;
    id: string;
    link?: string;                   // Si el item principal tiene un link directo
    subItems: SideBarSubItems[];     // subitems
    visible?: boolean;               // se setea dinámicamente
}

// ============================
// Lista de items (ejemplo)
// ============================
const items: SideBarMainItem[] = [
    {
        text: "Inicio",
        icon: <DashboardTwoToneIcon style={{ marginRight: "5px" }} color="primary" />,
        id: "inicio",
        subItems: [
            {
                text: "Dashboard",
                href: "/",
                id: "dashboard",
                permissions: ["any"], // por ejemplo, cualquiera lo ve
            },
            {
                text: "IN-OUT",
                href: "/tracker/view",
                id: "vista",
                permissions: ["tracker.view"],
            },
            {
                text: "DashboardCD",
                href: "/dashboard/cd",
                id: "dashboardcd",
                permissions: ["cd.more"], // ejemplo
            },
        ],
    },
    {
        text: "Usuario",
        icon: <PeopleOutlineIcon style={{ marginRight: "5px" }} color="primary" />,
        id: "usuarios",
        subItems: [
            {
                text: "Registro",
                href: "/user/register",
                id: "crear",
                permissions: ["user.create"],
            },
            {
                text: "Administrar",
                href: "/user",
                id: "gestion",
                permissions: ["user.manage"],
            },
        ],
    },
    {
        text: "T1",
        icon: <FactCheckOutlinedIcon style={{ marginRight: "5px" }} color="primary" />,
        id: "movimientos",
        subItems: [
            {
                text: "En Atención",
                href: "/tracker/check",
                id: "nuevo",
                permissions: ["tracker.check"],
            },
            {
                text: "Gestión",
                href: "/tracker/manage",
                id: "gestion",
                permissions: ["tracker.manage"],
            },
            {
                text: "Pedidos",
                href: "/order/manage",
                id: "order",
                permissions: ["order.manage"],
            },
            {
                text: "Exportar Excel",
                href: "/tracker/export",
                id: "tracker-export",
                permissions: ["report.shift"],
            },
        ],
    },
    {
        text: "T2",
        icon: <ContentPasteGoTwoToneIcon style={{ marginRight: "5px" }}  color="primary"/>,
        id: "t2",
        subItems: [
            {
                text: "Cargar Preventa",
                href: "/tracker-t2/pre-sale",
                id: "outregister",
                permissions: ["t2.preSale"],
            },
            {
                text: "Gestión",
                href: "/tracker-t2/manage",
                id: "outmanage",
                permissions: ["t2.manage"],
            },
            {
                text: "Revision",
                href: "/tracker-t2/pre-sale-check",
                id: "outcheck",
                permissions: ["t2.check"],
            },
        ],
    },
    {
        text: "Reporte",
        icon: <AssessmentOutlinedIcon style={{ marginRight: "5px" }}  color="primary"/>,
        id: "reportes",
        subItems: [
            {
                text: "Movimientos",
                href: "/movimientos/crear",
                id: "nuevo",
                permissions: ["report.movimientos"],
            },
            {
                text: "Productos",
                href: "/report/shift",
                id: "turno",
                permissions: ["report.shift"],
            },
            {
                text: "RISKS - STOCK AGE",
                href: "/report/por-expirar",
                id: "porExpirar",
                permissions: ["report.risks"],
            },
        ],
    },
    {
        text: "Inventario",
        icon: <Inventory2TwoToneIcon style={{ marginRight: "5px" }}  color="primary"/>,
        id: "inventario",
        subItems: [
            {
                text: "Movimientos",
                href: "/inventory/",
                id: "gestion",
                permissions: ["inventory.manage"],
            },
        ],
    },
    {
        text: "Reclamos",
        icon: <AssignmentLateTwoToneIcon style={{ marginRight: "5px" }}  color="primary"/>,
        id: "claim",
        subItems: [
            {
                text: "Seguimiento",
                href: "/claim/",
                id: "reclamos",
                permissions: ["any"],
            },
            {
                text: "Mis Reclamos",
                href: "/claim/mine",
                id: "misreclamos",
                permissions: ["cd"],
            }
        ],
    },
    {
        text: "Mantenimiento",
        icon: <EngineeringTwoToneIcon style={{ marginRight: "5px" }}  color="primary"/>,
        id: "mantenimiento",
        subItems: [
            {
                text: "Centros de Distribución",
                href: "/maintenance/distributor-center",
                id: "cd",
                permissions: ["any"],
            },
            {
                text: "Periodos",
                href: "/maintenance/period-center",
                id: "period-cente",
                permissions: ["any"],
            }
        ],
    }

];

// Aquí podrías inyectar `RoutePermissionsDirectory` o algo parecido
items.forEach((item) =>
  item.subItems.forEach(
    (sub) => (sub.permissions = RoutePermissionsDirectory[sub.href || -1])
  )
);

// ============================
// Sidebar principal
// ============================
interface Props {
    open: boolean;              // si el sidebar está abierto/cerrado (estilo hamburger)
    setOpen: (val: boolean) => void;
}

export const Side2bar: FunctionComponent<Props> = ({ setOpen }) => {
    const location = useLocation();
    const openSidebar = useAppSelector((state) => state.ui.openSidebar);
    const distributorCenters = useAppSelector((state) => state.maintenance.disctributionCenters);
    const dispatch = useAppDispatch();

    const user = useAppSelector((state) => state.auth.user);

    const sidebarSelected = useMemo(() => {
        return items.map((item) => {
            const subitems = item.subItems.map((sub) => {
                const isSelected = sub.href === location.pathname;
                return { ...sub, selected: isSelected };
            });
            return { ...item, subItems: subitems };
        });
    }, [location.pathname]);

    const sidebarItems = useMemo(() => {
        return sidebarSelected.map((item) => {
            const subitems = item.subItems.map((sub) => {

                if (
                    sub.permissions?.includes("cd.more") &&
                    user?.distributions_centers &&
                    user.distributions_centers.length >= 1
                ) {
                    return { ...sub, visible: true };
                } else if (sub.permissions?.includes("cd") && user?.centro_distribucion) {
                    return { ...sub, visible: true };
                }
                else {
                    if (sub.permissions?.includes("any")) {
                        return { ...sub, visible: true };
                    }
                    const canView = sub.permissions?.every((perm) => {
                        return (
                            user?.list_permissions.includes(perm) ||
                            user?.user_permissions.includes(perm)
                        );
                    });
                    return { ...sub, visible: !!canView };
                }
            });
            const isItemVisible = subitems.some((s) => s.visible);
            return { ...item, subItems: subitems, visible: isItemVisible };
        });
    }, [user, sidebarSelected]);

    const handleClickLogout = () => {
        // Llamar tu logout
        dispatch(logout());
    };

    const isMobile = useMediaQuery('(max-width:600px)');

    const handleCloseByMobile = () => {
        // Si es dispositivo móvil, cerrar el sidebar
        if (isMobile) {
            dispatch(toggleSidebar());
        }
    }

    const { country_code, flagurl } = useMemo(() => {
        const country_code =
          distributorCenters.find((dc) => dc.id === user?.centro_distribucion)
            ?.country_code || "hn";
        return {
          country_code,
          flagurl: `https://flagcdn.com/h240/${country_code?.toLowerCase()}.png`,
        };
      }, [distributorCenters, user?.centro_distribucion]);

    return (
        <div className={openSidebar? "sidebar close": "sidebar"}>
            <ul className="nav-links">
                {sidebarItems.map((item) => {
                    if (!item.visible) return null;

                    return (
                        <SideBarItem
                            key={item.id}
                            item={item}
                            subitemClickAction={() => {
                                setOpen(false)
                                handleCloseByMobile()
                            }}
                        />
                    );
                })}

                <li>
                    <div className="profile-details" >
                        <div className="">
                            <Avatar
                                variant="rounded"
                                alt={country_code}
                                src={flagurl}
                            />
                        </div>
                        <div className="name-job">
                            <div className="profile_name">
                                {user?.first_name} {user?.last_name}
                            </div>
                            <div className="job">
                                {user?.centro_distribucion_name || "--"}
                            </div>
                        </div>
                        <div className="log_out">
                        <Tooltip title="Cerrar sesion" placement="right">
                            <i className='bx bx-log-out' onClick={handleClickLogout} style={{ cursor: 'pointer' }}>
                                <LogoutOutlinedIcon fontSize="medium" color="secondary" />
                            </i>
                        </Tooltip>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    );
};
