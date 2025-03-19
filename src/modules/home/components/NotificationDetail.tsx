import { Avatar, Box, Button, Card, CardContent, Divider, Paper, Table, TableBody, TableCell, TableContainer, Typography } from '@mui/material'

import { FC } from 'react'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom';
import { iconsActionsNotifi } from '../../../utils/notificationsUtils';
import {Notificacion} from "../../../interfaces/auth";
import {StyledTableCellDetail, StyledTableRow} from "../../ui/components/TableStyle.tsx";

interface NotificationDetailProps {
    select: Notificacion
}
export const NotificationDetail: FC<NotificationDetailProps> = ({ select }) => {
    const navigate = useNavigate()
    return (
        <>
            <CardContent>
                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'start', alignItems: 'center', flexDirection: 'row' }}>
                    <Avatar aria-label="recipe" style={{ marginRight: '10px' }}>
                        {iconsActionsNotifi[select.module]?.[select.type] || <NotificationsIcon />}
                    </Avatar>
                    <Typography variant="h6" component="h1" fontWeight={400} color="primary" textAlign="center">
                        {select.title}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Typography variant="body2" color="textSecondary" textAlign="center">
                        {select.subtitle}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" textAlign="center">
                    {formatDistanceToNow(
                        new Date(select?.creado),
                        { addSuffix: true, locale: es, includeSeconds: false }
                    )}
                    </Typography>
                </Box>
                <Divider style={{ margin: '5px 0' }} />
                <Box mt={5}>
                    <Typography variant="body1" color="textPrimary" fontWeight={400}>
                        {select.description}
                    </Typography>
                    {select.html && <Card elevation={0} sx={{ p: 2, border: '2px dashed', borderColor: 'grey.600', mx: 0, my: 2 }}>
                       <div dangerouslySetInnerHTML={{ __html: select.html }} />
                    </Card>}
                    <Typography variant="body1" color="textPrimary" fontWeight={400} mt={2}>
                        Detalles adicionales:
                    </Typography>
                    <TableContainer component={Paper} style={{ marginTop: '10px' }}>
                    <Table size="medium" style={{ marginTop: '10px' }}>
                        <TableBody>
                            {
                                select?.json && Object.keys(select?.json).map((key, index) => {
                                    if (Array.isArray(select?.json[key])) {
                                        return (
                                            <StyledTableRow key={index}>
                                                <StyledTableCellDetail component="th" scope="row">
                                                    {key}
                                                </StyledTableCellDetail>
                                                <TableCell align="left">
                                                    {(select?.json[key] as string[])?.map((item, index) => {
                                                        return <span key={index}>
                                                            - {item}<br />
                                                        </span>
                                                    })}
                                                </TableCell>
                                            </StyledTableRow>
                                        )
                                    } else {
                                        // solo mostrar los string, number
                                        if (typeof select?.json[key] === 'string' || typeof select?.json[key] === 'number') {
                                            return (
                                                <StyledTableRow key={index}>
                                                    <StyledTableCellDetail component="th" scope="row">
                                                        {key}
                                                    </StyledTableCellDetail>
                                                    <TableCell align="left">
                                                        {select?.json[key].toString()}
                                                    </TableCell>
                                                </StyledTableRow>
                                            )
                                        }
                                    }
                                })
                            }
                        </TableBody>
                    </Table>
                    </TableContainer>
                </Box>
                {select?.identifier && <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', width: '100%', height: '100%', padding: '10px' }}>
                                        <Button
                        variant="outlined"
                        color="primary"
                        size="large"
                        onClick={() => navigate(`/documentos/${select.identifier}?alerta=${select.type === 'ALERTA' ? 'true' : 'false'}`)}
                        endIcon={<ArrowForwardIosIcon />}
                    >
                        {select.type === 'ALERTA' ? 'Ver alerta' : 'Ver documento'}
                    </Button>
                </Box>}
            </CardContent>
        </>
    )
}
