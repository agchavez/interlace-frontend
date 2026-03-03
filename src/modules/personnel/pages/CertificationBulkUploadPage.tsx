import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Tab,
  Tabs,
  Grid,
  Stack,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import SchoolIcon from '@mui/icons-material/School';
import RefreshIcon from '@mui/icons-material/Refresh';
import TableChartIcon from '@mui/icons-material/TableChart';
import ChecklistIcon from '@mui/icons-material/Checklist';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { useNavigate } from 'react-router-dom';
import { useStore } from 'react-redux';
import { toast } from 'sonner';
import {
  usePreviewCertificationBulkMutation,
  useConfirmCertificationBulkMutation,
} from '../services/personnelApi';
import type {
  CertificationBulkPreviewResponse,
  CertificationBulkConfirmResponse,
} from '../../../interfaces/personnel';
import type { RootState } from '../../../store';

const STEPS = ['Preparar Plantilla', 'Subir Archivo', 'Revisar y Confirmar', 'Resultados'];

const REQUIRED_COLS = [
  { col: 'Codigo_Empleado*', desc: 'Código del empleado en el sistema' },
  { col: 'Codigo_Certificacion*', desc: 'Ver hoja "Tipos_Certificacion" en la plantilla para los códigos válidos' },
];

const OPTIONAL_COLS = [
  { col: 'Fecha_Inicio', desc: 'Formato DD/MM/YYYY' },
  { col: 'Fecha_Fin', desc: 'Formato DD/MM/YYYY' },
  { col: 'Instructor_Autoridad', desc: 'Nombre del instructor' },
  { col: 'Numero_Certificacion', desc: 'Número de registro' },
  { col: 'Notas', desc: 'Observaciones adicionales' },
];

const INSTRUCTIONS = [
  'Borra la fila 2 (es solo un ejemplo, no subas esos datos)',
  'Completa desde la fila 3 en adelante',
  'No modifiques los nombres de las columnas',
  'Consulta la hoja "Tipos_Certificacion" para los códigos válidos',
  'Los Codigos_Empleado deben existir en el sistema',
  'Fechas en formato DD/MM/YYYY (ej: 15/03/2026)',
  'Sin Fecha_Fin, se calcula según el período de validez del tipo',
  'Elige el estado inicial (Pendiente o En Progreso) al confirmar la carga',
  'Máximo 500 registros por archivo',
];

// ── Sección con borde lateral de color ────────────────────────────────────────
const AccentSection: React.FC<{
  color: string;
  title: string;
  children: React.ReactNode;
}> = ({ color, title, children }) => (
  <Box sx={{ borderLeft: `4px solid ${color}`, pl: 2, mb: 2 }}>
    <Typography
      variant="caption"
      fontWeight={700}
      sx={{ color, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', mb: 1 }}
    >
      {title}
    </Typography>
    {children}
  </Box>
);

// ── Skeleton de tabla ──────────────────────────────────────────────────────────
const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 6, cols = 5 }) => (
  <Box sx={{ px: 2, pb: 2 }}>
    {/* Header */}
    <Box sx={{ display: 'flex', gap: 1, mb: 1, pt: 1 }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={36} sx={{ flex: i === 0 ? 0.4 : 1, borderRadius: 1 }} />
      ))}
    </Box>
    <Divider />
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <Box key={i} sx={{ display: 'flex', gap: 1, mt: 1 }}>
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton
            key={j}
            variant="rectangular"
            height={32}
            sx={{ flex: j === 0 ? 0.4 : 1, borderRadius: 1, opacity: 1 - i * 0.1 }}
          />
        ))}
      </Box>
    ))}
  </Box>
);

// ── Loading panel genérico ─────────────────────────────────────────────────────
const LoadingPanel: React.FC<{ message: string; subMessage?: string }> = ({ message, subMessage }) => (
  <Paper sx={{ p: 4 }}>
    {/* Indicador central */}
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 2 }}>
      <CircularProgress size={56} thickness={4} />
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" fontWeight={600}>{message}</Typography>
        {subMessage && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subMessage}
          </Typography>
        )}
      </Box>
    </Box>

    <Divider sx={{ mb: 2 }} />

    {/* Esqueleto de la tabla que aparecerá */}
    <Box sx={{ mb: 1 }}>
      <Skeleton variant="rectangular" height={20} width={160} sx={{ borderRadius: 1, mb: 1 }} />
      <Skeleton variant="rectangular" height={12} width={220} sx={{ borderRadius: 1, mb: 2 }} />
    </Box>
    <TableSkeleton />
  </Paper>
);

// ── Columnas DataGrid ──────────────────────────────────────────────────────────
const validColumns: GridColDef[] = [
  {
    field: 'fila',
    headerName: '#',
    width: 60,
    renderCell: (p) => (
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        F{p.value}
      </Typography>
    ),
  },
  {
    field: 'employee_code',
    headerName: 'Código Empleado',
    width: 170,
    renderCell: (p) => (
      <Chip size="small" label={p.value} variant="outlined" color="primary" />
    ),
  },
  {
    field: 'certification_type_name',
    headerName: 'Tipo de Certificación',
    flex: 1,
    minWidth: 200,
    renderCell: (p) => {
      const code = p.row.certification_type_code;
      return (
        <Box>
          <Typography variant="body2" fontWeight={500} noWrap>{p.value || code}</Typography>
          {p.value && (
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{code}</Typography>
          )}
        </Box>
      );
    },
  },
  {
    field: 'issue_date',
    headerName: 'Fecha Inicio',
    width: 120,
    renderCell: (p) => (
      <Typography variant="body2" color={p.value ? 'text.primary' : 'text.disabled'}>
        {p.value || '—'}
      </Typography>
    ),
  },
  {
    field: 'expiration_date',
    headerName: 'Fecha Fin',
    width: 120,
    renderCell: (p) => (
      <Typography variant="body2" color={p.value ? 'text.primary' : 'text.disabled'}>
        {p.value || '—'}
      </Typography>
    ),
  },
  {
    field: 'issuing_authority',
    headerName: 'Instructor / Autoridad',
    flex: 1,
    minWidth: 180,
    renderCell: (p) =>
      p.value ? (
        <Tooltip title={p.value}>
          <Typography variant="body2" noWrap>{p.value}</Typography>
        </Tooltip>
      ) : (
        <Typography variant="body2" color="text.disabled">—</Typography>
      ),
  },
  {
    field: 'certification_number',
    headerName: 'N° Certificación',
    width: 150,
    renderCell: (p) => (
      <Typography variant="body2" color={p.value ? 'text.primary' : 'text.disabled'}>
        {p.value || '—'}
      </Typography>
    ),
  },
];

const STATUS_CHIP: Record<string, React.ReactElement> = {
  PENDING: (
    <Chip size="small" label="Pendiente" icon={<HourglassEmptyIcon />} variant="outlined"
      sx={{ bgcolor: 'grey.50', color: 'text.secondary', borderColor: 'grey.400' }} />
  ),
  IN_PROGRESS: (
    <Chip size="small" label="En Progreso" icon={<PlayCircleIcon />} color="primary" variant="outlined" />
  ),
};

const buildResultColumns = (): GridColDef[] => [
  {
    field: 'rowNum',
    headerName: '#',
    width: 60,
    renderCell: (p) => (
      <Typography variant="caption" color="text.secondary" fontWeight={600}>{p.value}</Typography>
    ),
  },
  {
    field: 'employee_code',
    headerName: 'Código Empleado',
    width: 160,
    renderCell: (p) => (
      <Chip size="small" label={p.value} variant="outlined" color="primary" />
    ),
  },
  { field: 'employee_name', headerName: 'Nombre', flex: 1, minWidth: 180 },
  { field: 'certification_type', headerName: 'Tipo de Certificación', flex: 1, minWidth: 200 },
  {
    field: 'certification_number',
    headerName: 'N° Certificación',
    width: 150,
    renderCell: (p) => (
      <Typography variant="body2" color={p.value ? 'text.primary' : 'text.disabled'}>
        {p.value || '—'}
      </Typography>
    ),
  },
  {
    field: 'status',
    headerName: 'Estado',
    width: 140,
    renderCell: (p) => STATUS_CHIP[p.value] ?? STATUS_CHIP.PENDING,
  },
];

// ── Componente Principal ───────────────────────────────────────────────────────
const CertificationBulkUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const store = useStore<RootState>();
  const API_URL = import.meta.env.VITE_JS_APP_API_URL;

  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewData, setPreviewData] = useState<CertificationBulkPreviewResponse | null>(null);
  const [reviewTab, setReviewTab] = useState(0);
  const [confirmResult, setConfirmResult] = useState<CertificationBulkConfirmResponse | null>(null);
  const [initialStatus, setInitialStatus] = useState<'PENDING' | 'IN_PROGRESS'>('PENDING');

  const [bulkPreview, { isLoading: loadingPreview }] = usePreviewCertificationBulkMutation();
  const [bulkConfirm, { isLoading: loadingConfirm }] = useConfirmCertificationBulkMutation();

  // ── Descarga plantilla ─────────────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    // Lee el token del store en el momento del clic (nunca stale closure)
    const token = store.getState().auth.token;
    fetch(`${API_URL}/api/certifications/bulk_upload_template/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.blob(); })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'plantilla_certificaciones.xlsx'; a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => toast.error('No se pudo descargar la plantilla'));
  };

  // ── Manejo de archivo ──────────────────────────────────────────────────────
  const handleFileSelect = (file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.xlsx', '.xls'].includes(ext)) {
      toast.error('Solo se aceptan archivos .xlsx o .xls'); return;
    }
    setSelectedFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Preview ────────────────────────────────────────────────────────────────
  const handleProcessFile = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const result = await bulkPreview(formData).unwrap();
      setPreviewData(result);
      setActiveStep(2);
      setReviewTab(0);
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Error al procesar el archivo');
    }
  };

  // ── Confirmar ──────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!previewData) return;
    try {
      const result = await bulkConfirm({ rows: previewData.valid_rows, initial_status: initialStatus }).unwrap();
      setConfirmResult(result);
      setActiveStep(3);
      toast.success(`${result.created} certificaciones creadas exitosamente`);
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Error al confirmar la carga');
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setActiveStep(0); setSelectedFile(null);
    setPreviewData(null); setConfirmResult(null); setReviewTab(0);
    setInitialStatus('PENDING');
  };

  // ── Datos para DataGrids ───────────────────────────────────────────────────
  const errorGridRows = previewData
    ? previewData.error_rows.map((row) => ({
        id: row.fila,
        fila: row.fila,
        employee_code: row.datos.employee_code || '—',
        certification_type_code: row.datos.certification_type_code || '—',
        certification_type_name: row.datos.certification_type_name || '',
        errores: row.errores,
      }))
    : [];

  const errorColumns: GridColDef[] = [
    {
      field: 'fila',
      headerName: '#',
      width: 65,
      renderCell: (p) => (
        <Typography variant="caption" color="error.main" fontWeight={700}>F{p.value}</Typography>
      ),
    },
    {
      field: 'employee_code',
      headerName: 'Código Empleado',
      width: 160,
      renderCell: (p) => (
        <Chip size="small" label={p.value} variant="outlined" color={p.value === '—' ? 'default' : 'primary'} />
      ),
    },
    {
      field: 'certification_type_code',
      headerName: 'Código Certificación',
      width: 200,
      renderCell: (p) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{p.value || '—'}</Typography>
      ),
    },
    {
      field: 'errores',
      headerName: 'Errores encontrados',
      flex: 1,
      minWidth: 300,
      renderCell: (p) => (
        <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ py: 0.5 }}>
          {(p.value as { campo: string; mensaje: string }[]).map((err, i) => (
            <Tooltip key={i} title={err.mensaje} arrow>
              <Chip
                size="small"
                color="error"
                variant="outlined"
                label={`${err.campo}: ${err.mensaje}`}
                sx={{ maxWidth: 260, '.MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
              />
            </Tooltip>
          ))}
        </Stack>
      ),
    },
  ];

  const resultGridRows = confirmResult
    ? confirmResult.records.map((r, idx) => ({ ...r, rowNum: idx + 1 }))
    : [];

  const resultColumns = buildResultColumns();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ width: '100%', p: { xs: 2, md: 3 }, boxSizing: 'border-box' }}>

      {/* ── Encabezado ─────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/personnel/certifications')}
          variant="outlined"
          size="small"
          sx={{ mt: 0.5, flexShrink: 0 }}
        >
          Volver
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Carga Masiva de Certificaciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Planifica múltiples certificaciones desde una plantilla Excel. Elige el estado inicial al confirmar.
          </Typography>
        </Box>
      </Box>

      {/* ── Stepper ────────────────────────────────────────────────────────── */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Stepper activeStep={activeStep}>
          {STEPS.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>
      </Paper>

      {/* ════════════════════════════════════════════════════════════════════
          PASO 0 — Preparar Plantilla
      ════════════════════════════════════════════════════════════════════ */}
      {activeStep === 0 && (
        <Grid container spacing={3}>
          {/* Columna izquierda */}
          <Grid item xs={12} lg={7}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TableChartIcon sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Plantilla Excel</Typography>
                  <Typography variant="caption" color="text.secondary">Incluye encabezados y una fila de ejemplo</Typography>
                </Box>
              </Box>

              <Button variant="contained" size="large" startIcon={<DownloadIcon />} onClick={handleDownloadTemplate} sx={{ mb: 3, px: 3 }}>
                Descargar Plantilla
              </Button>

              <Divider sx={{ mb: 3 }} />

              <AccentSection color="#B71C1C" title="Campos Obligatorios">
                <Stack spacing={1}>
                  {REQUIRED_COLS.map(({ col, desc }) => (
                    <Box key={col} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Chip size="small" label={col} sx={{ bgcolor: '#FFEBEE', color: '#B71C1C', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.75rem', minWidth: 190 }} />
                      <Typography variant="body2" color="text.secondary">{desc}</Typography>
                    </Box>
                  ))}
                </Stack>
              </AccentSection>

              <AccentSection color="#1565C0" title="Campos Opcionales">
                <Stack spacing={1}>
                  {OPTIONAL_COLS.map(({ col, desc }) => (
                    <Box key={col} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Chip size="small" label={col} sx={{ bgcolor: '#E3F2FD', color: '#1565C0', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.75rem', minWidth: 190 }} />
                      <Typography variant="body2" color="text.secondary">{desc}</Typography>
                    </Box>
                  ))}
                </Stack>
              </AccentSection>
            </Paper>
          </Grid>

          {/* Columna derecha */}
          <Grid item xs={12} lg={5}>
            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'info.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChecklistIcon sx={{ color: 'info.dark' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Instrucciones</Typography>
                  <Typography variant="caption" color="text.secondary">Sigue estos pasos para evitar errores</Typography>
                </Box>
              </Box>

              <List disablePadding sx={{ flex: 1 }}>
                {INSTRUCTIONS.map((text, i) => (
                  <ListItem key={i} disableGutters sx={{ py: 0.75, alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 32, mt: 0.25 }}>
                      <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'info.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                        {i + 1}
                      </Box>
                    </ListItemIcon>
                    <ListItemText primary={text} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={() => setActiveStep(1)} endIcon={<UploadFileIcon />}>
                  Continuar a subir archivo
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PASO 1 — Subir Archivo
      ════════════════════════════════════════════════════════════════════ */}
      {activeStep === 1 && (
        <>
          {loadingPreview ? (
            <LoadingPanel
              message="Analizando archivo..."
              subMessage={`Validando registros de "${selectedFile?.name}"`}
            />
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>Sube tu archivo Excel</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Arrastra el archivo o haz clic en el área de carga. Solo se aceptan archivos <code>.xlsx</code> o <code>.xls</code>.
                  </Typography>

                  <Box
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      border: '2px dashed',
                      borderColor: isDragOver ? 'primary.main' : selectedFile ? 'success.main' : 'divider',
                      borderRadius: 3, p: { xs: 5, md: 8 }, textAlign: 'center', cursor: 'pointer',
                      bgcolor: isDragOver ? 'primary.50' : selectedFile ? 'success.50' : 'background.default',
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                      mb: 2,
                    }}
                  >
                    {selectedFile ? (
                      <>
                        <InsertDriveFileIcon sx={{ fontSize: 64, color: 'success.main', mb: 1 }} />
                        <Typography variant="h6" fontWeight={600} color="success.dark">{selectedFile.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(selectedFile.size / 1024).toFixed(1)} KB · Haz clic para cambiar el archivo
                        </Typography>
                      </>
                    ) : (
                      <>
                        <UploadFileIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body1" fontWeight={600}>Arrastra tu archivo aquí</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          o haz clic para seleccionar desde tu computadora
                        </Typography>
                        <Chip label=".xlsx  /  .xls  •  Máx. 500 registros" variant="outlined" size="small" />
                      </>
                    )}
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => setActiveStep(0)}>Atrás</Button>
                    <Button
                      variant="contained" size="large"
                      onClick={handleProcessFile}
                      disabled={!selectedFile}
                    >
                      Procesar y Revisar
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>¿Qué sucede al procesar?</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List disablePadding>
                    {[
                      { icon: <CheckCircleIcon color="success" fontSize="small" />, text: 'Validamos cada fila contra la base de datos' },
                      { icon: <CheckCircleIcon color="success" fontSize="small" />, text: 'Verificamos que existan los códigos de empleado y certificación' },
                      { icon: <CheckCircleIcon color="success" fontSize="small" />, text: 'Revisamos el formato de las fechas' },
                      { icon: <InfoIcon color="info" fontSize="small" />, text: 'Las filas con errores se mostrarán separadas' },
                      { icon: <InfoIcon color="info" fontSize="small" />, text: 'Podrás confirmar solo las filas válidas' },
                    ].map(({ icon, text }, i) => (
                      <ListItem key={i} disableGutters sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>{icon}</ListItemIcon>
                        <ListItemText primary={text} primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PASO 2 — Revisar y Confirmar
      ════════════════════════════════════════════════════════════════════ */}
      {activeStep === 2 && (
        <>
          {loadingConfirm ? (
            <LoadingPanel
              message="Creando certificaciones..."
              subMessage={`Registrando ${previewData?.valid ?? 0} certificaciones en estado ${initialStatus === 'IN_PROGRESS' ? 'En Progreso' : 'Pendiente'}`}
            />
          ) : previewData && (
            <Box>
              {/* Resumen */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { label: 'Total filas leídas', value: previewData.total, color: 'text.primary', bg: 'background.paper' },
                  { label: 'Se crearán', value: previewData.valid, color: 'success.dark', bg: '#F1F8E9' },
                  { label: 'Con errores', value: previewData.errors, color: previewData.errors > 0 ? 'error.dark' : 'text.disabled', bg: previewData.errors > 0 ? '#FFEBEE' : 'background.paper' },
                ].map(({ label, value, color, bg }) => (
                  <Grid item xs={12} sm={4} key={label}>
                    <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: bg, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Typography variant="h3" fontWeight={800} sx={{ color }}>{value}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={reviewTab} onChange={(_, v) => setReviewTab(v)}>
                  <Tab label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon fontSize="small" color="success" />
                      <span>Se crearán ({previewData.valid})</span>
                    </Box>
                  } />
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ErrorIcon fontSize="small" color={previewData.errors > 0 ? 'error' : 'disabled'} />
                        <span>Con errores ({previewData.errors})</span>
                      </Box>
                    }
                    disabled={previewData.errors === 0}
                  />
                </Tabs>
              </Box>

              {/* DataGrid válidos */}
              {reviewTab === 0 && (
                <Paper sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, mb: 3 }}>
                  <DataGrid
                    rows={previewData.valid_rows}
                    columns={validColumns}
                    getRowId={(r) => r.fila}
                    autoHeight
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                    disableRowSelectionOnClick
                    density="compact"
                    getRowHeight={() => 'auto'}
                    sx={{
                      border: 'none',
                      '--DataGrid-overlayHeight': '200px',
                      '& .MuiDataGrid-cell': { py: 0.75 },
                    }}
                  />
                </Paper>
              )}

              {/* DataGrid errores */}
              {reviewTab === 1 && (
                <Paper sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, mb: 3 }}>
                  <Alert severity="error" sx={{ borderRadius: 0 }}>
                    <strong>Estas filas NO se crearán.</strong> Corrígelas en tu archivo Excel y vuelve a cargar.
                  </Alert>
                  <DataGrid
                    rows={errorGridRows}
                    columns={errorColumns}
                    autoHeight
                    pageSizeOptions={[10, 25]}
                    initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                    disableRowSelectionOnClick
                    density="comfortable"
                    getRowHeight={() => 'auto'}
                    sx={{
                      border: 'none',
                      '--DataGrid-overlayHeight': '200px',
                      '& .MuiDataGrid-cell': { py: 1 },
                    }}
                  />
                </Paper>
              )}

              {previewData.valid === 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  No hay filas válidas para crear. Corrige los errores en tu archivo y vuelve a cargar.
                </Alert>
              )}

              {/* Selector estado inicial */}
              <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Estado inicial de las certificaciones
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Elige cómo se registrarán las certificaciones al crearse.
                </Typography>
                <ToggleButtonGroup
                  value={initialStatus}
                  exclusive
                  onChange={(_, val) => { if (val) setInitialStatus(val); }}
                  size="small"
                >
                  <ToggleButton value="PENDING" sx={{ gap: 1, px: 2.5 }}>
                    <HourglassEmptyIcon fontSize="small" />
                    Pendiente
                  </ToggleButton>
                  <ToggleButton value="IN_PROGRESS" sx={{ gap: 1, px: 2.5 }}>
                    <PlayCircleIcon fontSize="small" />
                    En Progreso
                  </ToggleButton>
                </ToggleButtonGroup>
                {initialStatus === 'IN_PROGRESS' && (
                  <Alert severity="info" sx={{ mt: 2 }} icon={<PlayCircleIcon />}>
                    Las certificaciones se crearán directamente <strong>En Progreso</strong>. Úsalo cuando la capacitación ya está en curso.
                  </Alert>
                )}
              </Paper>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => setActiveStep(1)}>Volver a subir</Button>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {previewData.errors > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {previewData.errors} fila(s) con errores serán omitidas
                    </Typography>
                  )}
                  <Button
                    variant="contained" color="success" size="large"
                    onClick={handleConfirm}
                    disabled={previewData.valid === 0}
                    startIcon={<CheckCircleIcon />}
                  >
                    Confirmar y Crear {previewData.valid} certificaciones
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PASO 3 — Resultados
      ════════════════════════════════════════════════════════════════════ */}
      {activeStep === 3 && confirmResult && (
        <Box>
          <Alert severity="success" icon={<CheckCircleIcon sx={{ fontSize: 36 }} />} sx={{ mb: 3, py: 2.5, alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={700}>¡Carga completada!</Typography>
            <Typography variant="body2">
              Se crearon <strong>{confirmResult.created}</strong> certificaciones en estado{' '}
              <strong>{confirmResult.records[0]?.status === 'IN_PROGRESS' ? 'En Progreso' : 'Pendiente'}</strong>.
            </Typography>
          </Alert>

          <Paper sx={{ overflow: 'hidden', mb: 3 }}>
            <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <SchoolIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={700}>
                Certificaciones creadas ({confirmResult.created})
              </Typography>
            </Box>
            <DataGrid
              rows={resultGridRows}
              columns={resultColumns}
              autoHeight
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              disableRowSelectionOnClick
              density="compact"
              sx={{ border: 'none' }}
            />
          </Paper>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleReset}>Nueva Carga</Button>
            <Button variant="contained" startIcon={<SchoolIcon />} onClick={() => navigate('/personnel/certifications')}>
              Ver Certificaciones
            </Button>
          </Box>
        </Box>
      )}

    </Box>
  );
};

export default CertificationBulkUploadPage;
