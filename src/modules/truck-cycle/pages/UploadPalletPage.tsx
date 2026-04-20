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
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
    usePreviewUploadMutation,
    useConfirmUploadMutation,
    useLazyDownloadTemplateQuery,
} from '../services/truckCycleApi';
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

    const handleConfirm = async () => {
        if (!preview) return;
        try {
            const result = await confirmUpload({
                uploadId: preview.upload_id,
                operational_date: operationalDate,
            }).unwrap();
            setConfirmResult(result);
            setActiveStep(3);
        } catch {
            // Error handled by RTK Query
        }
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
        { field: 'full_pallets', headerName: 'P. Completos', width: 110, align: 'right', headerAlign: 'right' },
        { field: 'assembled_fractions', headerName: 'Frac. Armadas', width: 120, align: 'right', headerAlign: 'right' },
        { field: 'complexity_score', headerName: 'Complejidad', width: 110, align: 'right', headerAlign: 'right' },
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
                        <strong>Columnas:</strong> Viaje, Transporte, Camión, Ruta, Cajas, SKUs, Pallets Completos, Fracciones Armadas, Complejidad
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        La placa se toma del catálogo de camiones. El camión debe existir previamente registrado.
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
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight={600} gutterBottom>Errores encontrados:</Typography>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {preview.errors.slice(0, 10).map((err, i) => (
                                <li key={i}><Typography variant="body2">{err}</Typography></li>
                            ))}
                            {preview.errors.length > 10 && (
                                <li><Typography variant="body2">...y {preview.errors.length - 10} más</Typography></li>
                            )}
                        </ul>
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

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button startIcon={<BackIcon />} onClick={() => { setActiveStep(1); setPreview(null); }}>
                        Subir otro archivo
                    </Button>
                    {!hasErrors && (
                        <Button
                            variant="contained"
                            color="success"
                            size="large"
                            startIcon={confirming ? <CircularProgress size={18} color="inherit" /> : <ConfirmIcon />}
                            onClick={handleConfirm}
                            disabled={confirming}
                        >
                            {confirming ? 'Confirmando...' : `Confirmar Carga (${operationalDate})`}
                        </Button>
                    )}
                </Box>
            </Box>
        );
    };

    const renderStep3 = () => (
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
                <Divider sx={{ my: 3 }} />
                <Button variant="contained" onClick={handleReset} startIcon={<UploadIcon />}>
                    Cargar otro archivo
                </Button>
            </Box>
        </Card>
    );

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={400}>
                        Carga de Pautas
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Cargue las pautas de distribución desde una plantilla Excel para iniciar el ciclo del camión
                    </Typography>
                </Box>
            </Box>

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
        </Box>
    );
}
