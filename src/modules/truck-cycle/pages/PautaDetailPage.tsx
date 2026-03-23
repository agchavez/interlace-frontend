import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tabs,
    Tab,
    Chip,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useState } from 'react';
import PautaStatusBadge from '../components/PautaStatusBadge';
import {
    useGetPautaQuery,
    useStartPickingMutation,
    useCompletePickingMutation,
    useCompleteLoadingMutation,
    useCompleteCountMutation,
    useDispatchPautaMutation,
    useClosePautaMutation,
} from '../services/truckCycleApi';
import type { PautaStatus } from '../interfaces/truckCycle';

export default function PautaDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tabIndex, setTabIndex] = useState(0);

    const { data: pauta, isLoading, error } = useGetPautaQuery(Number(id));

    const [startPicking, { isLoading: startingPicking }] = useStartPickingMutation();
    const [completePicking, { isLoading: completingPicking }] = useCompletePickingMutation();
    const [completeLoading, { isLoading: completingLoading }] = useCompleteLoadingMutation();
    const [completeCount, { isLoading: completingCount }] = useCompleteCountMutation();
    const [dispatchPauta, { isLoading: dispatching }] = useDispatchPautaMutation();
    const [closePauta, { isLoading: closing }] = useClosePautaMutation();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !pauta) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Error al cargar la pauta.</Alert>
            </Box>
        );
    }

    const actionButtons: Record<string, { label: string; action: () => void; loading: boolean }> = {
        PICKING_ASSIGNED: {
            label: 'Iniciar Picking',
            action: () => startPicking(pauta.id),
            loading: startingPicking,
        },
        PICKING_IN_PROGRESS: {
            label: 'Completar Picking',
            action: () => completePicking(pauta.id),
            loading: completingPicking,
        },
        IN_BAY: {
            label: 'Completar Carga',
            action: () => completeLoading(pauta.id),
            loading: completingLoading,
        },
        COUNTING: {
            label: 'Completar Conteo',
            action: () => completeCount(pauta.id),
            loading: completingCount,
        },
        CHECKOUT_OPS: {
            label: 'Despachar',
            action: () => dispatchPauta(pauta.id),
            loading: dispatching,
        },
        RETURN_PROCESSED: {
            label: 'Cerrar Pauta',
            action: () => closePauta(pauta.id),
            loading: closing,
        },
    };

    const currentAction = actionButtons[pauta.status];

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Button startIcon={<BackIcon />} onClick={() => navigate('/truck-cycle/pautas')}>
                    Volver
                </Button>
                <Typography variant="h5" fontWeight={600}>
                    Pauta #{pauta.transport_number} - Viaje {pauta.trip_number}
                </Typography>
                <PautaStatusBadge status={pauta.status as PautaStatus} size="medium" />
                {pauta.is_reload && <Chip label="Recarga" color="info" size="small" />}
            </Box>

            {/* Info Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="caption" color="text.secondary">Camion</Typography>
                            <Typography fontWeight={600}>{pauta.truck_code} - {pauta.truck_plate}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="caption" color="text.secondary">Total Cajas</Typography>
                            <Typography fontWeight={600}>{pauta.total_boxes}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="caption" color="text.secondary">Total SKUs</Typography>
                            <Typography fontWeight={600}>{pauta.total_skus}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="caption" color="text.secondary">Pallets</Typography>
                            <Typography fontWeight={600}>{pauta.total_pallets}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Action Button */}
            {currentAction && (
                <Box sx={{ mb: 3 }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={currentAction.action}
                        disabled={currentAction.loading}
                        startIcon={currentAction.loading ? <CircularProgress size={16} /> : undefined}
                    >
                        {currentAction.label}
                    </Button>
                </Box>
            )}

            <Divider sx={{ mb: 2 }} />

            {/* Tabs */}
            <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
                <Tab label="Productos" />
                <Tab label="Linea de Tiempo" />
                <Tab label="Asignaciones" />
                <Tab label={`Inconsistencias (${pauta.inconsistencies.length})`} />
                <Tab label={`Fotos (${pauta.photos.length})`} />
            </Tabs>

            {/* Products Tab */}
            {tabIndex === 0 && (
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Codigo Material</TableCell>
                                <TableCell>Producto</TableCell>
                                <TableCell>Categoria</TableCell>
                                <TableCell align="right">Cajas</TableCell>
                                <TableCell align="right">Pallets Completos</TableCell>
                                <TableCell align="right">Fraccion</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pauta.product_details.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.material_code}</TableCell>
                                    <TableCell>{p.product_name}</TableCell>
                                    <TableCell>{p.category}</TableCell>
                                    <TableCell align="right">{p.total_boxes}</TableCell>
                                    <TableCell align="right">{p.full_pallets}</TableCell>
                                    <TableCell align="right">{p.fraction}</TableCell>
                                </TableRow>
                            ))}
                            {pauta.product_details.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography color="text.secondary" sx={{ py: 2 }}>
                                            Sin productos.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Timeline Tab */}
            {tabIndex === 1 && (
                <List>
                    {pauta.timestamps.map((ts) => (
                        <ListItem key={ts.id} divider>
                            <ListItemText
                                primary={ts.event_type_display}
                                secondary={`${new Date(ts.timestamp).toLocaleString()} - ${ts.recorded_by_name}${ts.notes ? ` | ${ts.notes}` : ''}`}
                            />
                        </ListItem>
                    ))}
                    {pauta.timestamps.length === 0 && (
                        <Typography color="text.secondary" sx={{ py: 2 }}>
                            Sin eventos registrados.
                        </Typography>
                    )}
                </List>
            )}

            {/* Assignments Tab */}
            {tabIndex === 2 && (
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Rol</TableCell>
                                <TableCell>Personal</TableCell>
                                <TableCell>Asignado por</TableCell>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Activo</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pauta.assignments.map((a) => (
                                <TableRow key={a.id}>
                                    <TableCell>{a.role_display}</TableCell>
                                    <TableCell>{a.personnel_name}</TableCell>
                                    <TableCell>{a.assigned_by_name}</TableCell>
                                    <TableCell>{new Date(a.assigned_at).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={a.is_active ? 'Si' : 'No'}
                                            color={a.is_active ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {pauta.assignments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography color="text.secondary" sx={{ py: 2 }}>
                                            Sin asignaciones.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Inconsistencies Tab */}
            {tabIndex === 3 && (
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Fase</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Producto</TableCell>
                                <TableCell align="right">Esperado</TableCell>
                                <TableCell align="right">Real</TableCell>
                                <TableCell align="right">Diferencia</TableCell>
                                <TableCell>Reportado por</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pauta.inconsistencies.map((inc) => (
                                <TableRow key={inc.id}>
                                    <TableCell>{inc.phase}</TableCell>
                                    <TableCell>
                                        <Chip label={inc.inconsistency_type} size="small" color="warning" />
                                    </TableCell>
                                    <TableCell>{inc.product_name}</TableCell>
                                    <TableCell align="right">{inc.expected_quantity}</TableCell>
                                    <TableCell align="right">{inc.actual_quantity}</TableCell>
                                    <TableCell align="right">{inc.difference}</TableCell>
                                    <TableCell>{inc.reported_by_name}</TableCell>
                                </TableRow>
                            ))}
                            {pauta.inconsistencies.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography color="text.secondary" sx={{ py: 2 }}>
                                            Sin inconsistencias.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Photos Tab */}
            {tabIndex === 4 && (
                <Grid container spacing={2}>
                    {pauta.photos.map((photo) => (
                        <Grid item xs={12} sm={6} md={4} key={photo.id}>
                            <Card variant="outlined">
                                <Box
                                    component="img"
                                    src={photo.photo}
                                    alt={photo.description}
                                    sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                                />
                                <CardContent sx={{ py: 1 }}>
                                    <Typography variant="body2">{photo.description}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {photo.phase} - {photo.uploaded_by_name}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                    {pauta.photos.length === 0 && (
                        <Grid item xs={12}>
                            <Typography color="text.secondary">Sin fotos.</Typography>
                        </Grid>
                    )}
                </Grid>
            )}
        </Box>
    );
}
