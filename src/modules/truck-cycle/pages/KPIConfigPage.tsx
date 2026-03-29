import { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Card,
    Grid,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { Add as AddIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers';
import { format, isValid, parseISO } from 'date-fns';
import {
    useGetKPITargetsQuery,
    useCreateKPITargetMutation,
    useUpdateKPITargetMutation,
} from '../services/truckCycleApi';
import type { KPITarget } from '../interfaces/truckCycle';

type KPIType = KPITarget['kpi_type'];

const KPI_TYPE_LABELS: Record<KPIType, string> = {
    BOXES_PER_HOUR: 'Cajas/Hora',
    COUNT_ACCURACY: 'Precision Conteo',
    PICKING_ERROR_RATE: 'Error Picking',
    LOADING_TIME: 'Tiempo Carga',
    DISPATCH_TIME: 'Tiempo Despacho',
};

interface KPITargetFormData {
    kpi_type: KPIType;
    target_value: number;
    unit: string;
    warning_threshold: string;
    effective_from: string;
    effective_to: string;
}

const emptyForm: KPITargetFormData = {
    kpi_type: 'BOXES_PER_HOUR',
    target_value: 0,
    unit: '',
    warning_threshold: '',
    effective_from: '',
    effective_to: '',
};

export default function KPIConfigPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTarget, setEditingTarget] = useState<KPITarget | null>(null);
    const [form, setForm] = useState<KPITargetFormData>(emptyForm);

    const { data, isLoading, error } = useGetKPITargetsQuery();
    const [createKPITarget, { isLoading: creating }] = useCreateKPITargetMutation();
    const [updateKPITarget, { isLoading: updating }] = useUpdateKPITargetMutation();

    const handleOpenCreate = () => {
        setEditingTarget(null);
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const handleOpenEdit = (target: KPITarget) => {
        setEditingTarget(target);
        setForm({
            kpi_type: target.kpi_type,
            target_value: target.target_value,
            unit: target.unit,
            warning_threshold: target.warning_threshold != null ? String(target.warning_threshold) : '',
            effective_from: target.effective_from,
            effective_to: target.effective_to ?? '',
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            const payload: Partial<KPITarget> = {
                kpi_type: form.kpi_type,
                target_value: form.target_value,
                unit: form.unit,
                warning_threshold: form.warning_threshold ? parseFloat(form.warning_threshold) : null,
                effective_from: form.effective_from,
                effective_to: form.effective_to || null,
            };
            if (editingTarget) {
                await updateKPITarget({ id: editingTarget.id, data: payload }).unwrap();
            } else {
                await createKPITarget(payload).unwrap();
            }
            setDialogOpen(false);
        } catch {
            // Error handled by RTK Query
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'kpi_type',
            headerName: 'Tipo KPI',
            flex: 1,
            minWidth: 150,
            valueGetter: (params: any) => KPI_TYPE_LABELS[params.row.kpi_type as KPIType] ?? params.row.kpi_type,
        },
        {
            field: 'target_value',
            headerName: 'Valor Meta',
            flex: 0.7,
            minWidth: 110,
            align: 'right',
            headerAlign: 'right',
        },
        {
            field: 'unit',
            headerName: 'Unidad',
            flex: 0.7,
            minWidth: 100,
        },
        {
            field: 'warning_threshold',
            headerName: 'Umbral Alerta',
            flex: 0.7,
            minWidth: 120,
            align: 'right',
            headerAlign: 'right',
            valueGetter: (params: any) => params.row.warning_threshold != null ? params.row.warning_threshold : '--',
        },
        {
            field: 'effective_from',
            headerName: 'Vigencia Desde',
            flex: 0.8,
            minWidth: 130,
        },
        {
            field: 'effective_to',
            headerName: 'Vigencia Hasta',
            flex: 0.8,
            minWidth: 130,
            valueGetter: (params: any) => params.row.effective_to ?? '--',
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 80,
            sortable: false,
            filterable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <IconButton size="small" onClick={() => handleOpenEdit(params.row)}>
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            ),
        },
    ];

    if (error) {
        return (
            <Container maxWidth="xl" sx={{ mt: 2 }}>
                <Alert severity="error">Error al cargar metas KPI.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h5" fontWeight={600}>
                    Configuracion de Metas KPI
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} size={isMobile ? 'small' : 'medium'}>
                    Nueva Meta
                </Button>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Card variant="outlined">
                    <DataGrid
                        rows={data?.results ?? []}
                        columns={columns}
                        autoHeight
                        disableRowSelectionOnClick
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10 } },
                        }}
                        localeText={{
                            noRowsLabel: 'No hay metas KPI registradas.',
                        }}
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: theme.palette.action.hover,
                            },
                        }}
                    />
                </Card>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingTarget ? 'Editar Meta KPI' : 'Nueva Meta KPI'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField
                                select
                                label="Tipo de KPI"
                                size="small"
                                fullWidth
                                value={form.kpi_type}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, kpi_type: e.target.value as KPIType }))
                                }
                            >
                                {(Object.keys(KPI_TYPE_LABELS) as KPIType[]).map((key) => (
                                    <MenuItem key={key} value={key}>
                                        {KPI_TYPE_LABELS[key]}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Valor Meta"
                                size="small"
                                fullWidth
                                type="number"
                                value={form.target_value}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, target_value: parseFloat(e.target.value) || 0 }))
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Unidad"
                                size="small"
                                fullWidth
                                placeholder="ej. cajas/hora, %"
                                value={form.unit}
                                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Umbral de Alerta (opcional)"
                                size="small"
                                fullWidth
                                type="number"
                                value={form.warning_threshold}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, warning_threshold: e.target.value }))
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="Vigencia Desde"
                                value={form.effective_from ? parseISO(form.effective_from) : null}
                                onChange={(v) => setForm((f) => ({ ...f, effective_from: v && isValid(v) ? format(v, 'yyyy-MM-dd') : '' }))}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="Vigencia Hasta (opcional)"
                                value={form.effective_to ? parseISO(form.effective_to) : null}
                                onChange={(v) => setForm((f) => ({ ...f, effective_to: v && isValid(v) ? format(v, 'yyyy-MM-dd') : '' }))}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={creating || updating}
                    >
                        {creating || updating ? <CircularProgress size={20} /> : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
