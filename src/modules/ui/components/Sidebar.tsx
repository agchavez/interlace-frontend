import { Grid, Typography } from "@mui/material";
import { FunctionComponent, ReactNode } from "react";
import SidebarItem, { SideBarSubItems } from "./SidebarItem";
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useDispatch } from "react-redux";
import { logout } from "../../../store/auth";
import { useLocation } from "react-router-dom";
interface SidebarProps {
    open: boolean
}

interface SideBarItem {
    text: string;
    subItems: SideBarSubItems[];
    icon?: ReactNode;
    id: string;
    link?: string;
}

const items: SideBarItem[] = [
    {
        text: "Usiaros",
        icon: <PeopleOutlineIcon sx={{ width: "30px" }} color="primary" />,
        subItems: [
            { text: "Crear", href: "/user/register", id: "crear", selected: true },
            { text: "Gestión", href: "/user/", id: "gestion" }
        ],
        id: "usuarios"
    },
    {
        text: "Movimientos",
        subItems: [
            { text: "Nuevo", href: "/movimientos/crear", id: "nuevo" },
            { text: "Historial", href: "/movimientos", id: "historial" },
        ],
        icon: <FactCheckOutlinedIcon sx={{ width: "30px" }} color="primary" />,
        id: "movimientos"
    },
    {
        text: "Reportes",
        subItems: [
            { text: "Crear Reporte", href: "/movimientos/crear", id: "nuevo" },
        ],
        icon: <AssessmentOutlinedIcon sx={{ width: "30px" }} color="primary" />,
        id: "reportes"
    }
]

const Sidebar: FunctionComponent<SidebarProps> = ({ open }) => {
    const dispatch = useDispatch()
    const handleClickLogout = ()=>{
        dispatch(logout())
    }
    const location = useLocation()
    items.forEach(item => {
        item.subItems.forEach(item => item.selected = item.href === location.pathname)
    });
    return (
        <Grid item display={open ? "flex" : "none"} xs={2} className="sidebar__root">
            <Grid container direction="column" justifyContent="space-between">
                <Grid>
                    {
                        items.map((item) => {
                            return (
                                <SidebarItem subItems={item.subItems} icon={item.icon} text={item.text} id={item.id} key={item.id}/>
                            )
                        })
                    }
                </Grid>
                <Grid item container sx={{ paddingLeft: "1.2rem", marginBottom: "1rem", paddingRight: "1rem" }}>
                    <Grid container borderRadius={2} alignItems="center" className={`sidebar_item__main text_gray`} onClick={handleClickLogout}>
                        <Grid item xs={2} textAlign="right">
                            <Grid container alignItems="center" justifyContent="flex-end" height="100%">
                                <LogoutOutlinedIcon color="primary" />
                            </Grid>
                        </Grid>
                        <Grid item flexGrow={1}>
                            <Typography variant="body1" component="h2" fontWeight={200} lineHeight="2rem">
                                Logout
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default Sidebar;