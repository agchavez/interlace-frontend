import { useRef, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Download as DownloadIcon,
    CheckCircle as ConfirmIcon,
} from '@mui/icons-material';
import {
    usePreviewUploadMutation,
    useConfirmUploadMutation,
    useDownloadTemplateQuery,
} from '../services/truckCycleApi';
import type { UploadPreviewResponse } from '../interfaces/truckCycle';

export default function UploadPalletPage() {
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

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                Carga de Pautas
            </Typography>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadTemplate}
                >
                    Descargar Plantilla
                </Button>

                <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={previewing}
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
            </Box>

            {fileName && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Archivo: {fileName}
                </Typography>
            )}

            {previewing && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <CircularProgress size={20} />
                    <Typography>Procesando archivo...</Typography>
                </Box>
            )}

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
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h6">
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

                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Transporte</TableCell>
                                    <TableCell>Viaje</TableCell>
                                    <TableCell>Placa</TableCell>
                                    <TableCell>Rutas</TableCell>
                                    <TableCell align="right">Cajas</TableCell>
                                    <TableCell align="right">SKUs</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {preview.pautas_preview.map((p, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{p.transport_number}</TableCell>
                                        <TableCell>{p.trip_number}</TableCell>
                                        <TableCell>{p.truck_plate}</TableCell>
                                        <TableCell>
                                            {p.route_codes.map((r) => (
                                                <Chip key={r} label={r} size="small" sx={{ mr: 0.5 }} />
                                            ))}
                                        </TableCell>
                                        <TableCell align="right">{p.total_boxes}</TableCell>
                                        <TableCell align="right">{p.total_skus}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Box>
    );
}
