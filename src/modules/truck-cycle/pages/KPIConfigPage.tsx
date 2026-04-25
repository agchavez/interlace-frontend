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
    Chip,
    ListSubheader,
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
import { useGetMetricTypesQuery } from '../../personnel/services/personnelApi';
import type { KPITarget } from '../interfaces/truckCycle';

const LEGACY_KPI_LABELS: Record<string, string> = {
    BOXES_PER_HOUR: 'Cajas/Hora',
    COUNT_ACCURACY: 'Precisión Conteo',
    PICKING_ERROR_RATE: 'Error Picking',
    LOADING_TIME: 'Tiempo Carga',
    DISPATCH_TIME: 'Tiempo Despacho',
};

const DIRECTION_LABELS: Record<string, string> = {
    HIGHER_IS_BETTER: 'Mayor es mejor',
    LOWER_IS_BETTER: 'Menor es mejor',
};

interface KPITargetFormData {
    selection: string;   // 'legacy:BOXES_PER_HOUR' o 'metric:<id>'
    direction: 'HIGHER_IS_BETTER' | 'LOWER_IS_BETTER';
    target_value: number;
    unit: string;
    warning_threshold: string;
    effective_from: string;
    effective_to: string;
}

const emptyForm: KPITargetFormData = {
    selection: '',
    direction: 'HIGHER_IS_BETTER',
    target_value: 0,
    unit: '',
    warning_threshold: '',
    effective_from: '',
    effective_to: '',
};

function parseSelection(sel: string) {
    if (sel.startsWith('legacy:')) return { kpi_type: sel.slice(7), metric_type: null };
    if (sel.startsWith('metric:')) return { kpi_type: null, metric_type: Number(sel.slice(7)) };
    return { kpi_type: null, metric_type: null };
}

function buildSelectionFromTarget(t: KPITarget): string {
    if (t.metric_type) return `metric:${t.metric_type}`;
    if (t.kpi_type) return `legacy:${t.kpi_type}`;
    return '';
}

export default function KPIConfigPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTarget, setEditingTarget] = useState<KPITarget | null>(null);
    const [form, setForm] = useState<KPITargetFormData>(emptyForm);

    const { data, isLoading, error } = useGetKPITargetsQuery();
    const { data: metricTypesData } = useGetMetricTypesQuery({ is_active: true });
    const metricTypes: Array<{ id: number; code: string; name: string; unit?: string }> =
        metricTypesData?.results ?? [];
    const metricTypeById: Record<number, { id: number; code: string; name: string; unit?: string }> =
        Object.fromEntries(metricTypes.map((m) => [m.id, m]));

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
            selection: buildSelectionFromTarget(target),
            direction: target.direction ?? 'HIGHER_IS_BETTER',
            target_value: target.target_value,
            unit: target.unit ?? '',
            warning_threshold: target.warning_threshold != null ? String(target.warning_threshold) : '',
            effective_from: target.effective_from,
            effective_to: target.effective_to ?? '',
        });
        setDialogOpen(true);
    };

    const handleSelectionChange = (sel: string) => {
        const { metric_type } = parseSelection(sel);
        const mt = metric_type ? metricTypeById[metric_type] : null;
        setForm((f) => ({
            ...f,
            selection: sel,
            unit: mt?.unit ?? f.unit,
        }));
    };

    const handleSave = async () => {
        try {
            const { kpi_type, metric_type } = parseSelection(form.selection);
            const payload: Partial<KPITarget> = {
                kpi_type: kpi_type as any,
                metric_type: metric_type as any,
                direction: form.direction,
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
            field: 'metric_label',
            headerName: 'Métrica',
            flex: 1.4,
            minWidth: 200,
            valueGetter: (params: any) => {
                const row = params.row as KPITarget;
                if (row.metric_type && metricTypeById[row.metric_type]) {
                    return metricTypeById[row.metric_type].name;
                }
                if (row.kpi_type) return LEGACY_KPI_LABELS[row.kpi_type] ?? row.kpi_type;
                return '—';
            },
            renderCell: (params: any) => {
                const row = params.row as KPITarget;
                const label = params.value;
                const isLegacy = !row.metric_type && row.kpi_type;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {label}
                        {isLegacy && <Chip size="small" label="legacy" variant="outlined" />}
                    </Box>
                );
            },
        },
        {
            field: 'direction',
            headerName: 'Dirección',
            flex: 0.8,
            minWidth: 130,
            valueGetter: (params: any) => DIRECTION_LABELS[params.row.direction] ?? params.row.direction,
        },
        {
            field: 'target_value',
            headerName: 'Meta',
            flex: 0.6,
            minWidth: 90,
            align: 'right',
            headerAlign: 'right',
        },
        {
            field: 'warning_threshold',
            headerName: 'Disparador',
            flex: 0.6,
            minWidth: 110,
            align: 'right',
            headerAlign: 'right',
            valueGetter: (params: any) => params.row.warning_threshold != null ? params.row.warning_threshold : '--',
        },
        {
            field: 'unit',
            headerName: 'Unidad',
            flex: 0.6,
            minWidth: 90,
        },
        {
            field: 'effective_from',
            headerName: 'Desde',
            flex: 0.7,
            minWidth: 110,
        },
        {
            field: 'effective_to',
            headerName: 'Hasta',
            flex: 0.7,
            minWidth: 110,
            valueGetter: (params: any) => params.row.effective_to ?? '--',
        },
        {
            field: 'actions',
            headerName: '',
            width: 60,
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
                <Box>
                    <Typography variant="h5" fontWeight={600}>
                        Configuración de Metas KPI
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Meta (verde) · Disparador (amarillo, antes del rojo) · Dirección define si mayor/menor es mejor.
                    </Typography>
                </Box>
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
                            pagination: { paginationModel: { pageSize: 25 } },
                        }}
                        localeText={{
                            noRowsLabel: 'No hay metas configuradas para este CD.',
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

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingTarget ? 'Editar Meta' : 'Nueva Meta'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField
                                select
                                label="Métrica"
                                size="small"
                                fullWidth
                                value={form.selection}
                                onChange={(e) => handleSelectionChange(e.target.value)}
                            >
                                <ListSubheader>Métricas de desempeño</ListSubheader>
                                {metricTypes.map((m) => (
                                    <MenuItem key={`metric:${m.id}`} value={`metric:${m.id}`}>
                                        {m.name}
                                    </MenuItem>
                                ))}
                                <ListSubheader>KPIs legacy</ListSubheader>
                                {Object.entries(LEGACY_KPI_LABELS).map(([k, label]) => (
                                    <MenuItem key={`legacy:${k}`} value={`legacy:${k}`}>
                                        {label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                label="Dirección"
                                size="small"
                                fullWidth
                                value={form.direction}
                                onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value as any }))}
                                helperText="Define cómo se calcula la banda: mayor que la meta → verde (HIGHER) o menor que la meta → verde (LOWER)."
                            >
                                <MenuItem value="HIGHER_IS_BETTER">Mayor es mejor</MenuItem>
                                <MenuItem value="LOWER_IS_BETTER">Menor es mejor</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Meta"
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
                                label="Disparador (opcional)"
                                size="small"
                                fullWidth
                                type="number"
                                value={form.warning_threshold}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, warning_threshold: e.target.value }))
                                }
                                helperText="A partir de este valor se marca amarillo."
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Unidad"
                                size="small"
                                fullWidth
                                placeholder="ej. pallets/h, min, %"
                                value={form.unit}
                                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="Vigente Desde"
                                value={form.effective_from ? parseISO(form.effective_from) : null}
                                onChange={(v) => setForm((f) => ({ ...f, effective_from: v && isValid(v) ? format(v, 'yyyy-MM-dd') : '' }))}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="Vigente Hasta (opcional)"
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
                        disabled={creating || updating || !form.selection || !form.effective_from}
                    >
                        {editingTarget ? 'Guardar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
