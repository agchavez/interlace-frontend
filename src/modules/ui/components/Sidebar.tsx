import { Grid, Typography } from "@mui/material";
import { FunctionComponent, ReactNode, useMemo } from "react";
import SidebarItem, { SideBarSubItems } from "./SidebarItem";
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { logout } from "../../../store/auth";
import { useLocation } from "react-router-dom";
import { useLogoutMutation } from "../../../store/auth/authApi";
import { useAppDispatch, useAppSelector } from "../../../store";
interface SidebarProps {
    open: boolean
}

interface SideBarItem {
    text: string;
    subItems: SideBarSubItems[];
    icon?: ReactNode;
    id: string;
    link?: string;
    visible?: boolean;
}

const items: SideBarItem[] = [
    {
        text: "USUARIO",
        icon: <PeopleOutlineIcon sx={{ width: "30px" }} color="primary" />,
        subItems: [
            {
                text: "Registro",
                href: "/user/register",
                id: "crear",
                permissions: [
                    "user.add_usermodel",
                    "user.change_usermodel"
                ]
            },
            {
                text: "Administrar",
                href: "/user/",
                id: "gestion",
                permissions: [
                    "user.view_usermodel"
                ]
            }
        ],
        id: "usuarios",
    },
    {
        text: "T1",
        subItems: [
            {
                text: "En Atención",
                href: "/tracker/check",
                id: "nuevo",
                permissions: [
                    "maintenance.view_transportermodel",
                    "maintenance.view_operatormodel",
                    "maintenance.view_locationmodel",
                    "maintenance.view_drivermodel",
                    "maintenance.view_trailermodel",
                    "maintenance.view_productmodel",
                    "maintenance.view_distributorcenter",
                ]
            },
        ],
        icon: <FactCheckOutlinedIcon sx={{ width: "30px" }} color="primary" />,
        id: "movimientos",
    },
    {
        text: "REPORTE",
        subItems: [
            { text: "Movimientos", href: "/movimientos/crear", id: "nuevo" },
        ],
        icon: <AssessmentOutlinedIcon sx={{ width: "30px" }} color="primary" />,
        id: "reportes",
    }
]

const Sidebar: FunctionComponent<SidebarProps> = ({ open }) => {
    const user = useAppSelector(state => state.auth.user)
    const [logoutAPI] = useLogoutMutation();
    const dispatch = useAppDispatch()
    const handleClickLogout = () => {
        logoutAPI(undefined)
        dispatch(logout())
    }
    const location = useLocation()
    
    const sidebarSelected = useMemo(()=>{
        return items.map(item => {
            const subitems = item.subItems.map(sub => {
                sub.selected = sub.href === location.pathname;
                return sub;
            })
            item.subItems = subitems;
            return item;
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, location.pathname]);

    const sidebarItems = useMemo(() => {
        return sidebarSelected.map(item => {
            const subitems = item.subItems.map(sub => {
                sub.visible = !sub.permissions ?
                    true 
                    :
                    sub.permissions?.every(perm => {
                        return user?.list_permissions.some(usrperm => usrperm === perm)
                            || user?.user_permissions.some(usrperm => usrperm === perm)
                    })
                return sub
            })
            item.subItems = subitems
            item.visible = subitems.some(sub => sub.visible)
            return item
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Grid item display={open ? "flex" : "none"} xs={2} className="sidebar__root">
            <Grid container direction="column" justifyContent="space-between">
                <Grid>
                    {
                        sidebarItems.map((item) => {
                            if (item.visible) {
                                return (
                                    <SidebarItem subItems={item.subItems} icon={item.icon} text={item.text} id={item.id} key={item.id} />
                                )
                            }
                        })
                    }
                </Grid>
                <Grid item container sx={{ borderTop: "1px solid #e0e0e0", padding: "0.5rem 0" }}>
                    <Grid container borderRadius={2} alignItems="center" className={`sidebar_item__main text_gray`} onClick={handleClickLogout} style={{ cursor: "pointer" }}>
                        <Grid item xs={2} textAlign="right">
                            <Grid container alignItems="center" justifyContent="flex-end" height="100%">
                                <LogoutOutlinedIcon color="primary" />
                            </Grid>
                        </Grid>
                        <Grid item flexGrow={1}>
                            <Typography variant="body1" component="h2" fontWeight={200} lineHeight="2rem">
                                Cerrar sesión
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default Sidebar;