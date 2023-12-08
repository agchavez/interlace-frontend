import { Grid, Typography } from "@mui/material";
import { FunctionComponent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { useState } from 'react'
import RadioButtonCheckedOutlinedIcon from '@mui/icons-material/RadioButtonCheckedOutlined';
import KeyboardArrowRightOutlinedIcon from '@mui/icons-material/KeyboardArrowRightOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
export interface SideBarSubItems {
    href: string | undefined;
    text: string;
    id: string;
    selected?: boolean;
    permissions?: string[];
    visible?: boolean;
}

export interface SidebarItemProps {
    subItems?: SideBarSubItems[];
    icon: ReactNode;
    text: string;
    id: string;
    link?: string;
    subitemClickAction?: ()=>void
}

const SidebarItem: FunctionComponent<SidebarItemProps> = ({ subItems, icon, text, id, link = "", subitemClickAction }) => {
    const [open, setOpen] = useState(false)
    const handleClick = () => {
        setOpen(!open)
    }
    
    const selected = subItems?.find((item) => item.selected)
    return (

        <Grid item container sx={{ paddingLeft: "0.2rem", marginTop: "1rem" }}>
            <Grid item style={{ paddingLeft: "1rem", paddingRight: "1rem" }} flexGrow={1}>
                <Grid container direction={"column"}>
                    <Link to={link || "#"} style={{ textDecoration: "none" }} className={`sidebar_item__main text_gray ${selected ? "sidebar_item__main_selected" : ""}`} onClick={handleClick}>
                        <Grid container borderRadius={2} alignItems="center">
                            <Grid item xs={2} textAlign="right">
                                <Grid container alignItems="center" justifyContent="flex-end" height="100%">
                                    {icon}
                                </Grid>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography variant="body1" component="h2" fontWeight={200} lineHeight="2rem">
                                    {text}
                                </Typography>
                            </Grid>
                            <Grid item xs={2} textAlign="right">
                                <Grid container alignItems="center" justifyContent="flex-end" height="100%">
                                    {open ? <KeyboardArrowDownOutlinedIcon fontSize="small" /> : <KeyboardArrowRightOutlinedIcon fontSize="small" />}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Link>
                    {
                        subItems && subItems.map((item) => {
                            if (item.visible) {
                                return <Link to={item.href || ""} style={{ textDecoration: "none" }} className={`sidebar_item__child text_gray ${open ? "" : "close"}`} key={`${id}-${item.id}`} onClick={subitemClickAction}>
                                    <Grid container alignItems="center"> {/* Añadido alignItems */}
                                        <Grid item xs={2} textAlign="right">
                                            <Grid container alignItems="center" height="100%" justifyContent="center"> {/* Añadido contenedor para centrar verticalmente */}
                                                {item.selected === true && <RadioButtonCheckedOutlinedIcon style={{ width: "10px" }} color="primary" />}
                                            </Grid>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="body1" component="h2" fontWeight={200} lineHeight="2rem">
                                                {item.text}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Link>
                            }
                        })
                    }
                </Grid>
            </Grid>
        </Grid>

    );
}

export default SidebarItem;