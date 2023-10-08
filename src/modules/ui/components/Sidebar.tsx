import { Grid, Typography } from "@mui/material";
import { FunctionComponent, ReactNode, useMemo } from "react";
import SidebarItem, { SideBarSubItems } from "./SidebarItem";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import DashboardTwoToneIcon from "@mui/icons-material/DashboardTwoTone";
import { logout } from "../../../store/auth";
import { useLocation } from "react-router-dom";
import { useLogoutMutation } from "../../../store/auth/authApi";
import { useAppDispatch, useAppSelector } from "../../../store";
import { RoutePermissionsDirectory } from "../../../config/directory";
interface SidebarProps {
  open: boolean;
  setOpen: (value: boolean) => void;
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
    text: "Inicio",
    icon: <DashboardTwoToneIcon sx={{ width: "30px" }} color="primary" />,
    subItems: [
      {
        text: "Dashboard",
        href: "/",
        id: "dashboard",
      },
    ],
    id: "inicio",
  },
  {
    text: "USUARIO",
    icon: <PeopleOutlineIcon sx={{ width: "30px" }} color="primary" />,
    subItems: [
      {
        text: "Registro",
        href: "/user/register",
        id: "crear",
      },
      {
        text: "Administrar",
        href: "/user",
        id: "gestion",
      },
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
      },
      {
        text: "Gestión",
        href: "/tracker/manage",
        id: "gestion",
      },
      {
        text: "IN-OUT",
        href: "/tracker/view",
        id: "vista",
      },
    ],
    icon: <FactCheckOutlinedIcon sx={{ width: "30px" }} color="primary" />,
    id: "movimientos",
  },
  {
    text: "REPORTE",
    subItems: [
      { text: "Movimientos", href: "/movimientos/crear", id: "nuevo" },
      { text: "Productos", href: "/report/shift", id: "turno" },
      { text: "RISKS - STOCK AGE", href: "/report/por-expirar", id: "porExpirar" },
    ],
    icon: <AssessmentOutlinedIcon sx={{ width: "30px" }} color="primary" />,
    id: "reportes",
  },
];

items.forEach((item) =>
  item.subItems.forEach(
    (sub) => (sub.permissions = RoutePermissionsDirectory[sub.href || -1])
  )
);

const Sidebar: FunctionComponent<SidebarProps> = ({ open, setOpen }) => {
  const user = useAppSelector((state) => state.auth.user);
  const [logoutAPI] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const handleClickLogout = () => {
    logoutAPI(undefined);
    dispatch(logout());
  };
  const location = useLocation();

  const sidebarSelected = useMemo(() => {
    return items.map((item) => {
      const subitems = item.subItems.map((sub) => {
        sub.selected = sub.href === location.pathname;
        return sub;
      });
      item.subItems = subitems;
      return item;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.pathname]);

  const sidebarItems = useMemo(() => {
    return sidebarSelected.map((item) => {
      const subitems = item.subItems.map((sub) => {
        sub.visible = sub.permissions?.includes("any")
          ? true
          : sub.permissions?.every((perm) => {
              return (
                user?.list_permissions.includes(perm) ||
                user?.user_permissions.includes(perm)
              );
            });
        return sub;
      });
      item.subItems = subitems;
      item.visible = subitems.some((sub) => sub.visible);
      return item;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Grid item xs={2} className={`sidebar__root`}>
        <Grid container direction="column" justifyContent="space-between">
          <Grid>
            {sidebarItems.map((item) => {
              if (item.visible) {
                return (
                  <SidebarItem
                    subItems={item.subItems}
                    icon={item.icon}
                    text={item.text}
                    id={item.id}
                    key={item.id}
                  />
                );
              }
            })}
          </Grid>
          <Grid
            item
            container
            sx={{ borderTop: "1px solid #e0e0e0", padding: "0.5rem 0" }}
          >
            <Grid
              container
              borderRadius={2}
              alignItems="center"
              className={`sidebar_item__main text_gray`}
              onClick={handleClickLogout}
              style={{ cursor: "pointer" }}
            >
              <Grid item xs={2} textAlign="right">
                <Grid
                  container
                  alignItems="center"
                  justifyContent="flex-end"
                  height="100%"
                >
                  <LogoutOutlinedIcon color="primary" />
                </Grid>
              </Grid>
              <Grid item flexGrow={1}>
                <Typography
                  variant="body1"
                  component="h2"
                  fontWeight={200}
                  lineHeight="2rem"
                >
                  Cerrar sesión
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid
        item
        xs={2}
        sx={{ display: open ? "flex" : "none" }}
        className={`sidebar__root ui__sidebar_open`}
      >
        <Grid container direction="column" justifyContent="space-between">
          <Grid>
            {sidebarItems.map((item) => {
              if (item.visible) {
                return (
                  <SidebarItem
                    subItems={item.subItems}
                    icon={item.icon}
                    text={item.text}
                    id={item.id}
                    key={item.id}
                    subitemClickAction={() => setOpen(false)}
                  />
                );
              }
            })}
          </Grid>
          <Grid
            item
            container
            sx={{ borderTop: "1px solid #e0e0e0", padding: "0.5rem 0" }}
          >
            <Grid
              container
              borderRadius={2}
              alignItems="center"
              className={`sidebar_item__main text_gray`}
              onClick={handleClickLogout}
              style={{ cursor: "pointer" }}
            >
              <Grid item xs={2} textAlign="right">
                <Grid
                  container
                  alignItems="center"
                  justifyContent="flex-end"
                  height="100%"
                >
                  <LogoutOutlinedIcon color="primary" />
                </Grid>
              </Grid>
              <Grid item flexGrow={1}>
                <Typography
                  variant="body1"
                  component="h2"
                  fontWeight={200}
                  lineHeight="2rem"
                >
                  Cerrar sesión
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Sidebar;
