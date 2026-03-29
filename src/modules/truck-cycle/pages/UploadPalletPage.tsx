import { useRef, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Chip,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Download as DownloadIcon,
    CheckCircle as ConfirmIcon,
    InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
    usePreviewUploadMutation,
    useConfirmUploadMutation,
    useDownloadTemplateQuery,
} from '../services/truckCycleApi';
import type { UploadPreviewResponse } from '../interfaces/truckCycle';

export default function UploadPalletPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<UploadPreviewResponse | null>(null);
    const [fileName, setFileName] = useState('');

    const [previewUpload, { isLoading: previewing, error: previewError }] = usePreviewUploadMutation();
    const [confirmUpload, { isLoading: confirming, isSuccess: confirmed }] = useConfirmUploadMutation();
    const { refetch: downloadTemplate } = useDownloadTemplateQuery(undefined, { skip: true });

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

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setPreview(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await previewUpload(formData).unwrap();
            setPreview(result);
        } catch {
            // Error handled by RTK Query
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleConfirm = async () => {
        if (!preview) return;
        try {
            await confirmUpload(preview.upload_id).unwrap();
        } catch {
            // Error handled by RTK Query
        }
    };

    const previewColumns: GridColDef[] = [
        { field: 'transport_number', headerName: 'Transporte', flex: 1, minWidth: 120 },
        { field: 'trip_number', headerName: 'Viaje', flex: 0.6, minWidth: 80 },
        { field: 'truck_plate', headerName: 'Placa', flex: 0.8, minWidth: 100 },
        {
            field: 'route_codes',
            headerName: 'Rutas',
            flex: 1.2,
            minWidth: 150,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', py: 0.5 }}>
                    {params.value?.map((r: string) => (
                        <Chip key={r} label={r} size="small" />
                    ))}
                </Box>
            ),
        },
        { field: 'total_boxes', headerName: 'Cajas', flex: 0.6, minWidth: 80, align: 'right', headerAlign: 'right' },
        { field: 'total_skus', headerName: 'SKUs', flex: 0.6, minWidth: 80, align: 'right', headerAlign: 'right' },
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 2 }}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                Carga de Pautas
            </Typography>

            {/* Upload Area */}
            <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, alignItems: isMobile ? 'stretch' : 'center' }}>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadTemplate}
                            fullWidth={isMobile}
                        >
                            Descargar Plantilla
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<UploadIcon />}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={previewing}
                            fullWidth={isMobile}
                        >
                            {previewing ? 'Procesando...' : 'Subir Archivo'}
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            hidden
                            onChange={handleFileSelect}
                        />

                        {fileName && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FileIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                    {fileName}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {previewing && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                            <CircularProgress size={20} />
                            <Typography>Procesando archivo...</Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {previewError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error al procesar el archivo. Verifique el formato e intente nuevamente.
                </Alert>
            )}

            {confirmed && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Pautas confirmadas exitosamente.
                </Alert>
            )}

            {/* Preview results */}
            {preview && !confirmed && (
                <>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                            Vista Previa ({preview.row_count} filas)
                        </Typography>
                        {preview.errors.length === 0 && (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={confirming ? <CircularProgress size={16} /> : <ConfirmIcon />}
                                onClick={handleConfirm}
                                disabled={confirming}
                            >
                                Confirmar Carga
                            </Button>
                        )}
                    </Box>

                    {preview.errors.length > 0 && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            <Typography fontWeight={600}>Errores encontrados:</Typography>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {preview.errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </Alert>
                    )}

                    {preview.warnings.length > 0 && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            <Typography fontWeight={600}>Advertencias:</Typography>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {preview.warnings.map((w, i) => (
                                    <li key={i}>{w}</li>
                                ))}
                            </ul>
                        </Alert>
                    )}

                    <Card variant="outlined">
                        <DataGrid
                            rows={preview.pautas_preview.map((p, i) => ({ id: i, ...p }))}
                            columns={previewColumns}
                            autoHeight
                            disableRowSelectionOnClick
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                            }}
                            getRowHeight={() => 'auto'}
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: theme.palette.action.hover,
                                },
                                '& .MuiDataGrid-cell': {
                                    py: 1,
                                },
                            }}
                        />
                    </Card>
                </>
            )}
        </Container>
    );
}
