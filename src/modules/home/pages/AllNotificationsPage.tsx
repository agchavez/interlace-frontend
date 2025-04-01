// src/pages/AllNotificationsPage.tsx
import React, { useState } from 'react';
import {
    Container,
    Box,
    TextField,
    Typography,
    List,
    ListItemButton,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Paper, Grid
} from '@mui/material';

import DescriptionIcon from '@mui/icons-material/Description';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import {Notificacion, notificacionesMock} from "../../../utils/notification.ts";

// Función para retornar ícono según el módulo
function getModuloIcon(modulo: string) {
    if (modulo === 'DOCUMENTOS') {
        return <DescriptionIcon color="primary" />;
    }
    return <NotificationsActiveIcon color="primary" />;
}

const AllNotificationsPage: React.FC = () => {
    // Manejamos estado local para las notificaciones
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>(notificacionesMock);
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    console.log("notificaciones");
    // Filtrar según el texto
    const filtered = notificaciones.filter((n) => {
        const text = `${n.titulo} ${n.subtitulo} ${n.descripcion}`.toLowerCase();
        return text.includes(search.toLowerCase());
    });

    // Notificación seleccionada
    const selectedNotif = notificaciones.find((n) => n.id === selectedId) || null;

    // Marcar como leído
    const markAsRead = (id: number) => {
        setNotificaciones((prev) =>
            prev.map((item) => (item.id === id ? { ...item, leido: true } : item))
        );
    };

    const handleSelect = (id: number) => {
        setSelectedId(id);
        markAsRead(id);
    };

    return (
        <Container maxWidth="xl">
            <Grid container spacing={1} sx={{ marginTop: 2 }}>
                <Grid item xs={12}>
                    <Typography variant="h5" component="h1" fontWeight={400}>
                        Todas las Notificaciones
                    </Typography>
                    <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                </Grid>
            </Grid>
            <Box sx={{ my: 2 }}>
                <TextField
                    label="Buscar notificaciones..."
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setSelectedId(null); // Limpio selección si se quiere
                    }}
                />
            </Box>

            {/* Layout de dos columnas: lista y detalle */}
            <Box sx={{ display: 'flex', gap: 2 }}>
                {/* Columna Lista */}
                <Paper sx={{ flex: 1, maxWidth: 400, overflowY: 'auto', maxHeight: '70vh' }}>
                    <List>
                        {filtered.map((notif) => (
                            <React.Fragment key={notif.id}>
                                <ListItemButton
                                    onClick={() => handleSelect(notif.id)}
                                    selected={notif.id === selectedId}
                                    sx={{
                                        backgroundColor: !notif.leido ? 'rgba(25,118,210,0.1)' : 'transparent',
                                        alignItems: 'flex-start'
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'transparent' }}>
                                            {getModuloIcon(notif.modulo)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight={notif.leido ? '400' : '600'}
                                            >
                                                {notif.titulo}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="text.secondary" noWrap>
                                                    {notif.descripcion}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(notif.creado).toLocaleString()}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItemButton>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>

                {/* Columna Detalle */}
                <Paper sx={{ flex: 2, p: 2, minHeight: 400 }}>
                    {selectedNotif ? (
                        <>
                            <Typography variant="h6" gutterBottom fontWeight="500">
                                {selectedNotif.titulo}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                {selectedNotif.subtitulo}
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            {/* Descripción principal */}
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                {selectedNotif.descripcion}
                            </Typography>

                            {/* Si trae HTML, podemos mostrarlo con dangerouslySetInnerHTML (ten cuidado con XSS) */}
                            {selectedNotif.html && (
                                <Box
                                    sx={{
                                        border: '1px solid #ddd',
                                        p: 2,
                                        borderRadius: 1,
                                        backgroundColor: '#fafafa'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: selectedNotif.html }}
                                />
                            )}

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Creado: {new Date(selectedNotif.creado).toLocaleString()}
                                </Typography>
                            </Box>
                        </>
                    ) : (
                        <Typography variant="body1">
                            Selecciona una notificación para ver su detalle
                        </Typography>
                    )}
                </Paper>
            </Box>

        </Container>
    );
};

export default AllNotificationsPage;
