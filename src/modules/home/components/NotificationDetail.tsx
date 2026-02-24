import { Avatar, Box, Button, Card, CardContent, Divider, Paper, Table, TableBody, TableCell, TableContainer, Typography, useTheme, useMediaQuery, Chip } from '@mui/material'

import { FC } from 'react'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom';
import { iconsActionsNotifi } from '../../../utils/notificationsUtils';
import {Notificacion} from "../../../interfaces/auth";
import {StyledTableCellDetail, StyledTableRow} from "../../ui/components/TableStyle.tsx";
import { translateFieldName, formatValue, getFieldColor, shouldHighlightField } from '../../../utils/notificationFormatters';

interface NotificationDetailProps {
    select: Notificacion
}
export const NotificationDetail: FC<NotificationDetailProps> = ({ select }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                {/* Header Section */}
                <Box
                    sx={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'flex-start',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        mb: 3,
                    }}
                >
                    <Avatar
                        aria-label="notification icon"
                        sx={{
                            width: { xs: 50, sm: 60 },
                            height: { xs: 50, sm: 60 },
                            bgcolor: !select.read ? 'primary.main' : 'grey.400',
                        }}
                    >
                        {iconsActionsNotifi[select.module]?.[select.type] || <NotificationsIcon />}
                    </Avatar>
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 1 }}>
                        <Typography
                            variant={isMobile ? 'h6' : 'h5'}
                            component="h1"
                            fontWeight={600}
                            color="secondary"
                            sx={{ lineHeight: 1.3 }}
                        >
                            {select.title}
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                justifyContent: 'space-between',
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                width: '100%',
                                gap: 1,
                            }}
                        >
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: '0.8125rem', fontWeight: 500 }}
                            >
                                {select.subtitle}
                            </Typography>
                            <Chip
                                icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                                label={formatDistanceToNow(new Date(select?.created_at), {
                                    addSuffix: true,
                                    locale: es,
                                    includeSeconds: false,
                                })}
                                size="small"
                                variant="outlined"
                                sx={{
                                    fontSize: '0.75rem',
                                    height: 28,
                                }}
                            />
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Description Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="body1"
                        color="text.primary"
                        sx={{
                            fontSize: { xs: '0.9375rem', sm: '1rem' },
                            lineHeight: 1.7,
                            mb: 2,
                        }}
                    >
                        {select.description}
                    </Typography>

                    {/* HTML Content */}
                    {select.html && (
                        <Card
                            elevation={0}
                            sx={{
                                p: { xs: 2, sm: 3 },
                                border: 2,
                                borderStyle: 'dashed',
                                borderColor: 'divider',
                                borderRadius: 2,
                                bgcolor: 'background.default',
                                my: 3,
                            }}
                        >
                            <div dangerouslySetInnerHTML={{ __html: select.html }} />
                        </Card>
                    )}
                </Box>

                {/* Additional Details Section */}
                {select?.json && Object.keys(select?.json).length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <InfoOutlinedIcon color="primary" sx={{ fontSize: 20 }} />
                            <Typography
                                variant="h6"
                                color="text.primary"
                                sx={{
                                    fontSize: { xs: '1rem', sm: '1.125rem' },
                                    fontWeight: 600,
                                }}
                            >
                                Detalles adicionales
                            </Typography>
                        </Box>
                        <TableContainer
                            component={Paper}
                            elevation={0}
                            sx={{
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 2,
                            }}
                        >
                            <Table size={isMobile ? 'small' : 'medium'}>
                                <TableBody>
                                    {Object.keys(select?.json).map((key, index) => {
                                        const value = select?.json[key];
                                        const isHighlighted = shouldHighlightField(key, value);
                                        const fieldColor = getFieldColor(key, value);

                                        if (Array.isArray(value)) {
                                            return (
                                                <StyledTableRow key={index}>
                                                    <StyledTableCellDetail
                                                        component="th"
                                                        scope="row"
                                                        sx={{
                                                            fontSize: '0.8125rem',
                                                            fontWeight: 600,
                                                            color: 'secondary.main',
                                                        }}
                                                    >
                                                        {translateFieldName(key)}
                                                    </StyledTableCellDetail>
                                                    <TableCell
                                                        align="left"
                                                        sx={{
                                                            fontSize: '0.8125rem',
                                                            fontWeight: isHighlighted ? 600 : 400,
                                                        }}
                                                    >
                                                        {(value as string[])?.map((item, idx) => (
                                                            <Box
                                                                key={idx}
                                                                component="span"
                                                                sx={{
                                                                    display: 'block',
                                                                    mb: idx < value.length - 1 ? 0.5 : 0,
                                                                }}
                                                            >
                                                                • {formatValue(key, item)}
                                                            </Box>
                                                        ))}
                                                    </TableCell>
                                                </StyledTableRow>
                                            );
                                        } else if (
                                            typeof value === 'string' ||
                                            typeof value === 'number' ||
                                            typeof value === 'boolean'
                                        ) {
                                            return (
                                                <StyledTableRow
                                                    key={index}
                                                    sx={{
                                                        bgcolor: isHighlighted
                                                            ? 'rgba(25, 118, 210, 0.05)'
                                                            : 'transparent',
                                                    }}
                                                >
                                                    <StyledTableCellDetail
                                                        component="th"
                                                        scope="row"
                                                        sx={{
                                                            fontSize: '0.8125rem',
                                                            fontWeight: 600,
                                                            color: 'secondary.main',
                                                        }}
                                                    >
                                                        {translateFieldName(key)}
                                                    </StyledTableCellDetail>
                                                    <TableCell
                                                        align="left"
                                                        sx={{
                                                            fontSize: '0.8125rem',
                                                            fontWeight: isHighlighted ? 600 : 400,
                                                            color: fieldColor,
                                                        }}
                                                    >
                                                        {formatValue(key, value)}
                                                    </TableCell>
                                                </StyledTableRow>
                                            );
                                        }
                                        return null;
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {/* Action Buttons */}
                {select?.url ? (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: { xs: 'center', sm: 'flex-end' },
                            alignItems: 'center',
                            width: '100%',
                            pt: 2,
                        }}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => select.url && navigate(select.url)}
                            endIcon={<ArrowForwardIosIcon />}
                            fullWidth={isMobile}
                            sx={{
                                minHeight: 48,
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                maxWidth: { sm: 200 },
                            }}
                        >
                            Ver Detalles
                        </Button>
                    </Box>
                ) : (
                    <>
                        {select?.identifier && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: { xs: 'center', sm: 'flex-end' },
                                    alignItems: 'center',
                                    width: '100%',
                                    pt: 2,
                                }}
                            >
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={() =>
                                        navigate(
                                            `/documentos/${select.identifier}?alerta=${
                                                select.type === 'ALERTA' ? 'true' : 'false'
                                            }`
                                        )
                                    }
                                    endIcon={<ArrowForwardIosIcon />}
                                    fullWidth={isMobile}
                                    sx={{
                                        minHeight: 48,
                                        fontSize: '0.8125rem',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        maxWidth: { sm: 250 },
                                    }}
                                >
                                    {select.type === 'ALERTA' ? 'Ver Alerta' : 'Ver Documento'}
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </CardContent>
        </>
    );
};
