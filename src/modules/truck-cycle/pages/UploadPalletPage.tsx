import { useRef, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Card,
    Chip,
    Step,
    StepLabel,
    Stepper,
    Paper,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Autocomplete,
    Grid,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Download as DownloadIcon,
    CheckCircle as ConfirmIcon,
    InsertDriveFile as FileIcon,
    ArrowBack as BackIcon,
    ArrowForward as NextIcon,
    Inventory as BoxIcon,
    LocalShipping as TruckIcon,
    FlashOn as EmergencyIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
    usePreviewUploadMutation,
    useConfirmUploadMutation,
    useLazyDownloadTemplateQuery,
    useCreateManualPautaMutation,
    useGetTrucksQuery,
} from '../services/truckCycleApi';
import type { Truck } from '../interfaces/truckCycle';
import type { UploadPreviewResponse } from '../interfaces/truckCycle';
import DatePickerButton from '../components/DatePickerButton';
import { format } from 'date-fns';

const STEPS = ['Preparar Plantilla', 'Subir Archivo', 'Revisar y Confirmar', 'Resultados'];

export default function UploadPalletPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeStep, setActiveStep] = useState(0);
    const [preview, setPreview] = useState<UploadPreviewResponse | null>(null);
    const [fileName, setFileName] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const [confirmResult, setConfirmResult] = useState<any>(null);
    const [operationalDate, setOperationalDate] = useState<string>(todayStr);

    const [previewUpload, { isLoading: previewing, error: previewError }] = usePreviewUploadMutation();
    const [confirmUpload, { isLoading: confirming }] = useConfirmUploadMutation();
    const [downloadTemplate] = useLazyDownloadTemplateQuery();
    const [createManualPauta, { isLoading: creatingManual }] = useCreateManualPautaMutation();
    const { data: trucksData } = useGetTrucksQuery({ limit: 1000, offset: 0 });

    // Carga emergente (manual)
    const [emergencyOpen, setEmergencyOpen] = useState(false);
    const [emergencyError, setEmergencyError] = useState<string | null>(null);
    const [emergencySuccess, setEmergencySuccess] = useState<string | null>(null);
    const [emergencyForm, setEmergencyForm] = useState({
        trip_number: '1',
        transport_number: '',
        truck: null as Truck | null,
        route_code: '',
        total_boxes: '' as string | number,
        total_skus: '' as string | number,
        total_pallets: '' as string | number,
        assembled_fractions: '' as string | number,
        complexity_score: '' as string | number,
    });

    const resetEmergencyForm = () => {
        setEmergencyForm({
            trip_number: '1',
            transport_number: '',
            truck: null,
            route_code: '',
            total_boxes: '',
            total_skus: '',
            total_pallets: '',
            assembled_fractions: '',
            complexity_score: '',
        });
        setEmergencyError(null);
    };

    const handleEmergencySubmit = async () => {
        setEmergencyError(null);
        if (!emergencyForm.truck) { setEmergencyError('Seleccione un camión.'); return; }
        if (!emergencyForm.transport_number.trim()) { setEmergencyError('Transporte es requerido.'); return; }
        if (!emergencyForm.trip_number.trim()) { setEmergencyError('Viaje es requerido.'); return; }
        try {
            const created = await createManualPauta({
                trip_number: emergencyForm.trip_number.trim(),
                transport_number: emergencyForm.transport_number.trim(),
                truck_id: emergencyForm.truck.id,
                route_code: emergencyForm.route_code.trim(),
                total_boxes: Number(emergencyForm.total_boxes) || 0,
                total_skus: Number(emergencyForm.total_skus) || 0,
                total_pallets: Number(emergencyForm.total_pallets) || 0,
                assembled_fractions: Number(emergencyForm.assembled_fractions) || 0,
                complexity_score: Number(emergencyForm.complexity_score) || 0,
                operational_date: operationalDate,
            }).unwrap();
            setEmergencySuccess(`Pauta creada: T-${created.transport_number}`);
            resetEmergencyForm();
            setEmergencyOpen(false);
        } catch (err: any) {
            setEmergencyError(err?.data?.error || err?.data?.detail || 'Error al crear la pauta.');
        }
    };

    const handleDownloadTemplate = async () => {
        const result = await downloadTemplate();
        if (result.data) {
            const url = URL.createObjectURL(result.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'plantilla_pautas.xlsx';
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const processFile = async (file: File) => {
        setFileName(file.name);
        setPreview(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('operational_date', operationalDate);

        try {
            const result = await previewUpload(formData).unwrap();
            setPreview(result);
            setActiveStep(2);
        } catch {
            // Error handled by RTK Query
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            processFile(file);
        }
    };

    const handleConfirm = async (opts?: { skipInvalid?: boolean }) => {
        if (!preview) return;
        try {
            const result = await confirmUpload({
                uploadId: preview.upload_id,
                operational_date: operationalDate,
                skip_invalid: opts?.skipInvalid,
            }).unwrap();
            setConfirmResult(result);
            setActiveStep(3);
        } catch {
            // Error handled by RTK Query
        }
    };

    const handleReupload = () => {
        setPreview(null);
        setFileName('');
        setActiveStep(1);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleReset = () => {
        setActiveStep(0);
        setPreview(null);
        setFileName('');
        setConfirmResult(null);
        setOperationalDate(todayStr);
    };

    const previewColumns: GridColDef[] = [
        { field: 'trip_number', headerName: 'Viaje', width: 80 },
        { field: 'transport_number', headerName: 'Transporte', flex: 1, minWidth: 120 },
        { field: 'truck_code', headerName: 'Camión', flex: 0.8, minWidth: 100 },
        { field: 'truck_plate', headerName: 'Placa (catálogo)', flex: 0.8, minWidth: 110 },
        { field: 'route_code', headerName: 'Ruta', flex: 0.8, minWidth: 100 },
        { field: 'total_boxes', headerName: 'Cajas', width: 90, align: 'right', headerAlign: 'right' },
        { field: 'total_skus', headerName: 'SKUs', width: 80, align: 'right', headerAlign: 'right' },
        { field: 'full_pallets', headerName: 'P. Completas', width: 110, align: 'right', headerAlign: 'right' },
        { field: 'assembled_fractions', headerName: 'Frac. Armadas', width: 120, align: 'right', headerAlign: 'right' },
        {
            field: 'complexity_score',
            headerName: 'Complejidad',
            width: 110,
            align: 'right',
            headerAlign: 'right',
            valueFormatter: (params) => {
                const v = Number(params.value);
                return Number.isFinite(v) ? `${v.toFixed(2)}%` : '';
            },
        },
    ];

    // Step content renderers
    const renderStep0 = () => (
        <Card>
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <TruckIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2, opacity: 0.7 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    Preparar el archivo de Pautas
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                    Descargue la plantilla Excel con el formato correcto. Cada fila representa una pauta
                    (un viaje de un camión con su carga asignada).
                </Typography>

                <Alert severity="info" sx={{ mb: 3, textAlign: 'left', maxWidth: 560, mx: 'auto' }}>
                    <Typography variant="body2">
                        <strong>Columnas:</strong> Viaje, Transporte, Camión, Ruta, Cajas, SKUs, Pallets Completas, Fracciones Armadas, Complejidad %
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        La placa la resuelve el sistema desde el catálogo a partir del código del camión.
                    </Typography>
                </Alert>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadTemplate}
                        size="large"
                    >
                        Descargar Plantilla
                    </Button>
                    <Button
                        variant="contained"
                        endIcon={<NextIcon />}
                        onClick={() => setActiveStep(1)}
                        size="large"
                    >
                        Continuar
                    </Button>
                </Box>
            </Box>
        </Card>
    );

    const renderStep1 = () => (
        <Card>
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    hidden
                    onChange={handleFileSelect}
                />

                {/* Operational date selector — must be set before upload */}
                <Paper variant="outlined" sx={{ p: 2.5, mb: 3, textAlign: 'left', maxWidth: 560, mx: 'auto' }}>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                        Fecha Operativa
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        Las pautas se asignarán a esta fecha. Sólo se permite hoy en adelante.
                    </Typography>
                    <DatePickerButton
                        value={operationalDate}
                        onChange={setOperationalDate}
                        label="Fecha operativa"
                        minDate={todayStr}
                        size="small"
                    />
                </Paper>

                {/* Drop zone */}
                <Paper
                    variant="outlined"
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => !previewing && fileInputRef.current?.click()}
                    sx={{
                        p: 6,
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        borderColor: isDragOver ? 'primary.main' : 'divider',
                        bgcolor: isDragOver ? 'primary.50' : 'grey.50',
                        cursor: previewing ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
                    
                        mx: 'auto',
                    }}
                >
                    {previewing ? (
                        <Box>
                            <CircularProgress size={48} sx={{ mb: 2 }} />
                            <Typography variant="body1" fontWeight={500}>
                                Procesando archivo...
                            </Typography>
                            {fileName && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {fileName}
                                </Typography>
                            )}
                        </Box>
                    ) : (
                        <Box>
                            <UploadIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2, opacity: 0.7 }} />
                            <Typography variant="h6" fontWeight={500} gutterBottom>
                                Sube tu archivo Excel
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Arrastra y suelta aquí o haz clic para seleccionar
                            </Typography>
                            <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                                Formatos aceptados: .xlsx, .xls
                            </Typography>
                        </Box>
                    )}
                </Paper>

                {previewError && (
                    <Alert severity="error" sx={{ mt: 2, maxWidth: 500, mx: 'auto' }}>
                        Error al procesar el archivo. Verifique el formato e intente nuevamente.
                    </Alert>
                )}

                <Box sx={{ mt: 3 }}>
                    <Button startIcon={<BackIcon />} onClick={() => setActiveStep(0)}>
                        Anterior
                    </Button>
                </Box>
            </Box>
        </Card>
    );

    const renderStep2 = () => {
        if (!preview) return null;
        const hasErrors = preview.errors.length > 0;
        const missingTrucks = preview.missing_trucks || [];

        return (
            <Box>
                {/* Summary chips */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip icon={<FileIcon />} label={fileName} variant="outlined" />
                    <Chip label={`Fecha: ${operationalDate}`} color="default" variant="outlined" />
                    <Chip icon={<BoxIcon />} label={`${preview.row_count} filas`} color="info" variant="outlined" />
                    <Chip icon={<TruckIcon />} label={`${preview.pautas_preview?.length || 0} pautas válidas`} color="primary" />
                    {hasErrors && <Chip label={`${preview.errors.length} errores`} color="error" />}
                </Box>

                {missingTrucks.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight={600} gutterBottom>
                            Camiones no registrados en el catálogo:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                            {missingTrucks.map((code) => (
                                <Chip key={code} label={code} size="small" color="warning" />
                            ))}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            Registre estos camiones en el catálogo antes de volver a subir el archivo.
                        </Typography>
                    </Alert>
                )}

                {hasErrors && (
                    <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                        action={
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Button color="inherit" size="small" onClick={handleReupload} startIcon={<UploadIcon />}>
                                    Re-cargar archivo
                                </Button>
                            </Box>
                        }
                    >
                        <Typography variant="body2" fontWeight={600} gutterBottom>
                            {preview.errors.length} fila{preview.errors.length === 1 ? '' : 's'} con error:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {preview.errors.slice(0, 10).map((err, i) => (
                                <li key={i}><Typography variant="body2">{err}</Typography></li>
                            ))}
                            {preview.errors.length > 10 && (
                                <li><Typography variant="body2">...y {preview.errors.length - 10} más</Typography></li>
                            )}
                        </ul>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            Puede continuar omitiendo las filas inválidas, corregir el archivo y volver a cargarlo,
                            o registrar los camiones faltantes en el catálogo.
                        </Typography>
                    </Alert>
                )}

                {preview.warnings && preview.warnings.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight={600} gutterBottom>Advertencias:</Typography>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {preview.warnings.map((w, i) => (
                                <li key={i}><Typography variant="body2">{w}</Typography></li>
                            ))}
                        </ul>
                    </Alert>
                )}

                <Card>
                    <DataGrid
                        rows={(preview.pautas_preview || []).map((p, i) => ({ id: i, ...p }))}
                        columns={previewColumns}
                        autoHeight
                        disableRowSelectionOnClick
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-columnHeaders': { backgroundColor: theme.palette.action.hover },
                        }}
                    />
                </Card>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, flexWrap: 'wrap', gap: 1 }}>
                    <Button startIcon={<BackIcon />} onClick={handleReupload}>
                        Subir otro archivo
                    </Button>
                    {hasErrors ? (
                        <Button
                            variant="contained"
                            color="warning"
                            size="large"
                            startIcon={confirming ? <CircularProgress size={18} color="inherit" /> : <ConfirmIcon />}
                            onClick={() => handleConfirm({ skipInvalid: true })}
                            disabled={confirming || (preview.pautas_preview?.length || 0) === 0}
                        >
                            {confirming
                                ? 'Confirmando...'
                                : `Continuar omitiendo ${preview.errors.length} fila${preview.errors.length === 1 ? '' : 's'}`}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="success"
                            size="large"
                            startIcon={confirming ? <CircularProgress size={18} color="inherit" /> : <ConfirmIcon />}
                            onClick={() => handleConfirm()}
                            disabled={confirming}
                        >
                            {confirming ? 'Confirmando...' : `Confirmar Carga (${operationalDate})`}
                        </Button>
                    )}
                </Box>
            </Box>
        );
    };

    const renderStep3 = () => {
        const skippedErrors: string[] = confirmResult?.skipped_errors || [];
        return (
            <Card>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <ConfirmIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                        Carga completada
                    </Typography>
                    {confirmResult && (
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            {confirmResult.message || `Se crearon ${confirmResult.pauta_ids?.length || 0} pautas exitosamente.`}
                        </Typography>
                    )}
                    {skippedErrors.length > 0 && (
                        <Alert severity="warning" sx={{ mb: 3, textAlign: 'left', maxWidth: 600, mx: 'auto' }}>
                            <Typography variant="body2" fontWeight={600} gutterBottom>
                                Filas omitidas durante la carga:
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {skippedErrors.slice(0, 10).map((err, i) => (
                                    <li key={i}><Typography variant="body2">{err}</Typography></li>
                                ))}
                                {skippedErrors.length > 10 && (
                                    <li><Typography variant="body2">...y {skippedErrors.length - 10} más</Typography></li>
                                )}
                            </ul>
                        </Alert>
                    )}
                    <Divider sx={{ my: 3 }} />
                    <Button variant="contained" onClick={handleReset} startIcon={<UploadIcon />}>
                        Cargar otro archivo
                    </Button>
                </Box>
            </Card>
        );
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={400}>
                        Carga de Pautas
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Cargue las pautas de distribución desde una plantilla Excel para iniciar el ciclo del camión
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<EmergencyIcon />}
                    onClick={() => { resetEmergencyForm(); setEmergencyOpen(true); }}
                >
                    Carga Emergente
                </Button>
            </Box>

            {emergencySuccess && (
                <Alert severity="success" onClose={() => setEmergencySuccess(null)} sx={{ mb: 2 }}>
                    {emergencySuccess}
                </Alert>
            )}

            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel={isMobile}>
                {STEPS.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {/* Step Content */}
            {activeStep === 0 && renderStep0()}
            {activeStep === 1 && renderStep1()}
            {activeStep === 2 && renderStep2()}
            {activeStep === 3 && renderStep3()}

            {/* Carga Emergente Dialog */}
            <Dialog
                open={emergencyOpen}
                onClose={() => setEmergencyOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <Box sx={{
                    px: 3, pt: 2.5, pb: 2,
                    borderBottom: 1, borderColor: 'divider',
                    display: 'flex', alignItems: 'center', gap: 1.5,
                }}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: 1.5,
                        bgcolor: 'warning.main', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <EmergencyIcon fontSize="small" />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                            Carga Emergente
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Crear pauta manual · fecha operativa {operationalDate}
                        </Typography>
                    </Box>
                </Box>

                <DialogContent sx={{ pt: 2.5, pb: 1 }}>
                    {emergencyError && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>{emergencyError}</Alert>
                    )}

                    {/* Sección 1: Identificación */}
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1, fontWeight: 600 }}>
                        Identificación
                    </Typography>
                    <Grid container spacing={1.5} sx={{ mt: 0.25, mb: 2.5 }}>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth size="small" label="Viaje" type="number" required
                                value={emergencyForm.trip_number}
                                onChange={(e) => setEmergencyForm((p) => ({ ...p, trip_number: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={8}>
                            <TextField
                                fullWidth size="small" label="No. Transporte" required
                                value={emergencyForm.transport_number}
                                onChange={(e) => setEmergencyForm((p) => ({ ...p, transport_number: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                size="small"
                                options={trucksData?.results || []}
                                value={emergencyForm.truck}
                                getOptionLabel={(t) => `${t.code} — ${t.plate}`}
                                onChange={(_, val) => setEmergencyForm((p) => ({ ...p, truck: val }))}
                                renderInput={(params) => <TextField {...params} label="Camión" required />}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth size="small" label="Ruta (opcional)"
                                value={emergencyForm.route_code}
                                onChange={(e) => setEmergencyForm((p) => ({ ...p, route_code: e.target.value }))}
                            />
                        </Grid>
                    </Grid>

                    {/* Sección 2: Carga */}
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1, fontWeight: 600 }}>
                        Carga
                    </Typography>
                    <Grid container spacing={1.5} sx={{ mt: 0.25 }}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth size="small" type="number" label="Cajas"
                                value={emergencyForm.total_boxes}
                                onChange={(e) => setEmergencyForm((p) => ({ ...p, total_boxes: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth size="small" type="number" label="SKUs"
                                value={emergencyForm.total_skus}
                                onChange={(e) => setEmergencyForm((p) => ({ ...p, total_skus: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth size="small" type="number" label="Pallets Completas"
                                value={emergencyForm.total_pallets}
                                onChange={(e) => setEmergencyForm((p) => ({ ...p, total_pallets: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth size="small" type="number" label="Fracciones"
                                value={emergencyForm.assembled_fractions}
                                onChange={(e) => setEmergencyForm((p) => ({ ...p, assembled_fractions: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth size="small" type="number"
                                label="Complejidad (%)"
                                placeholder="0 – 100"
                                value={emergencyForm.complexity_score}
                                onChange={(e) => setEmergencyForm((p) => ({ ...p, complexity_score: e.target.value }))}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
                    <Button onClick={() => setEmergencyOpen(false)} sx={{ textTransform: 'none' }}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained" color="warning" disableElevation
                        startIcon={creatingManual ? <CircularProgress size={16} color="inherit" /> : <EmergencyIcon />}
                        disabled={creatingManual}
                        onClick={handleEmergencySubmit}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Crear pauta
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
