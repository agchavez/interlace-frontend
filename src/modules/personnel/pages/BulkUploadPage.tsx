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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Autocomplete,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Tab,
  Tabs,
  InputAdornment,
  IconButton,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  useBulkUploadPreviewMutation,
  useBulkUploadConfirmMutation,
  type BulkUploadValidRow,
  type BulkUploadErrorRow,
  type BulkUploadConfirmRow,
} from '../../../store/user/userApi';
import { useAppSelector } from '../../../store/store';

// ── Constantes ────────────────────────────────────────────────────────────────

const STEPS = ['Preparar Plantilla', 'Subir Archivo', 'Revisar y Confirmar', 'Resultados'];

const TEMPLATE_URL = `${import.meta.env.VITE_JS_APP_API_URL}/api/users/bulk-upload-template/`;

// ── Labels legibles ───────────────────────────────────────────────────────────
const AREA_LABELS: Record<string, string> = {
  OPERATIONS: 'Operaciones', ADMINISTRATION: 'Administración',
  PEOPLE: 'People/RRHH', SECURITY: 'Seguridad', DELIVERY: 'Delivery',
};
const JERARQUIA_LABELS: Record<string, string> = {
  OPERATIVE: 'Operativo', SUPERVISOR: 'Supervisor',
  AREA_MANAGER: 'Jefe de Área', CD_MANAGER: 'Gerente CD',
};
const POSICION_LABELS: Record<string, string> = {
  PICKER: 'Picker', COUNTER: 'Contador', OPM: 'Operador Montacargas',
  YARD_DRIVER: 'Conductor Patio', LOADER: 'Cargador',
  WAREHOUSE_ASSISTANT: 'Ayudante Almacén', SECURITY_GUARD: 'Guardia Seguridad',
  DELIVERY_DRIVER: 'Conductor Delivery', ADMINISTRATIVE: 'Administrativo', OTHER: 'Otro',
};
const CONTRATO_LABELS: Record<string, string> = {
  PERMANENT: 'Permanente', TEMPORARY: 'Temporal', CONTRACT: 'Contrato',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const lbl = (map: Record<string, string>, key: string | null) =>
  key ? (map[key] ?? key) : '—';

// ── Componente Principal ──────────────────────────────────────────────────────

export const BulkUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accessToken = useAppSelector((state) => state.auth.token);

  // ── Estado general ───────────────────────────────────────────────────────────
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCenter, setSelectedCenter] = useState<{ id: number; name: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // ── Estado de revisión ───────────────────────────────────────────────────────
  const [previewData, setPreviewData] = useState<{
    validRows: BulkUploadValidRow[];
    errorRows: BulkUploadErrorRow[];
    totalFilas: number;
  } | null>(null);
  const [reviewTab, setReviewTab] = useState(0); // 0=válidos, 1=errores
  // Contraseñas para filas CON_USUARIO (key = fila)
  const [passwords, setPasswords] = useState<Record<number, string>>({});
  const [showPwd, setShowPwd] = useState<Record<number, boolean>>({});

  // ── Estado de resultados ─────────────────────────────────────────────────────
  const [confirmResult, setConfirmResult] = useState<{
    created: number;
    registros: Array<{ employee_code: string; full_name: string; tipo: string; tiene_usuario: boolean; username: string | null }>;
  } | null>(null);

  // ── RTK Query / Store ─────────────────────────────────────────────────────────
  const distributionCenters = useAppSelector((state) => state.user.distributionCenters);
  const [bulkPreview, { isLoading: loadingPreview }] = useBulkUploadPreviewMutation();
  const [bulkConfirm, { isLoading: loadingConfirm }] = useBulkUploadConfirmMutation();

  // ── Descarga plantilla ────────────────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    fetch(TEMPLATE_URL, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((res) => { if (!res.ok) throw new Error(); return res.blob(); })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'plantilla_carga_masiva_personal.xlsx'; a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => toast.error('No se pudo descargar la plantilla'));
  };

  // ── Manejo de archivo ─────────────────────────────────────────────────────────
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

  // ── Procesar archivo → preview ────────────────────────────────────────────────
  const handleProcessFile = async () => {
    if (!selectedFile || !selectedCenter) return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('centro_distribucion', String(selectedCenter.id));

    try {
      const result = await bulkPreview(formData).unwrap();
      setPreviewData({
        validRows: result.valid_rows,
        errorRows: result.error_rows,
        totalFilas: result.total_filas,
      });
      // Inicializar contraseñas para CON_USUARIO
      const initPwd: Record<number, string> = {};
      result.valid_rows.filter(r => r.tipo === 'CON_USUARIO').forEach(r => { initPwd[r.fila] = ''; });
      setPasswords(initPwd);
      setActiveStep(2);
      setReviewTab(0);
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Error al procesar el archivo');
    }
  };

  // ── Confirmar carga ───────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!previewData || !selectedCenter) return;

    const conUsuario = previewData.validRows.filter(r => r.tipo === 'CON_USUARIO');
    const missingPwd = conUsuario.some(r => !passwords[r.fila] || passwords[r.fila].length < 8);
    if (missingPwd) {
      toast.error('Todos los registros CON_USUARIO necesitan una contraseña de al menos 8 caracteres');
      return;
    }

    const rows: BulkUploadConfirmRow[] = previewData.validRows.map(row => ({
      ...row,
      password: row.tipo === 'CON_USUARIO' ? passwords[row.fila] : undefined,
    }));

    try {
      const result = await bulkConfirm({ centro_distribucion: selectedCenter.id, rows }).unwrap();
      setConfirmResult({ created: result.created, registros: result.registros });
      setActiveStep(3);
      toast.success(`${result.created} empleados registrados exitosamente`);
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Error al confirmar la carga');
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setActiveStep(0); setSelectedFile(null); setPreviewData(null);
    setPasswords({}); setShowPwd({}); setConfirmResult(null); setReviewTab(0);
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1300, mx: 'auto' }}>

      {/* Encabezado */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/personnel')} variant="outlined" size="small">
          Volver
        </Button>
        <Box>
          <Typography variant="h5" fontWeight={700}>Carga Masiva de Personal</Typography>
          <Typography variant="body2" color="text.secondary">
            Registra múltiples empleados desde una plantilla Excel. Soporta registros con y sin acceso al sistema.
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
        {STEPS.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {/* ══════════════════════════════════════════════════════════
          PASO 0 — Preparar Plantilla
      ══════════════════════════════════════════════════════════ */}
      {activeStep === 0 && (
        <Box>
          <Paper sx={{ p: 4, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              1. Selecciona el Centro de Distribución
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Todos los empleados cargados quedarán asignados a este centro.
            </Typography>
            <Autocomplete
              options={distributionCenters}
              getOptionLabel={(opt: any) => opt.name || ''}
              value={selectedCenter}
              onChange={(_, val) => setSelectedCenter(val ? { id: val.id, name: val.name } : null)}
              renderInput={(params) => <TextField {...params} label="Centro de Distribución" size="small" />}
              sx={{ maxWidth: 420 }}
            />
          </Paper>

          <Paper sx={{ p: 4, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              2. Descarga la Plantilla Excel
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              La plantilla incluye todos los campos necesarios y dos filas de ejemplo que puedes borrar.
            </Typography>

            {/* Tipos de registro */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 240, borderColor: 'info.main' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PersonIcon color="info" />
                  <Typography variant="subtitle2" fontWeight={700} color="info.main">SOLO_PERSONAL</Typography>
                </Box>
                <Typography variant="body2">
                  Crea únicamente el <strong>perfil del empleado</strong>. No genera login al sistema.<br />
                  Ideal para <em>operativos: pickers, contadores, cargadores, guardias, etc.</em>
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 240, borderColor: 'success.main' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ManageAccountsIcon color="success" />
                  <Typography variant="subtitle2" fontWeight={700} color="success.main">CON_USUARIO</Typography>
                </Box>
                <Typography variant="body2">
                  Crea el perfil <strong>y un usuario con acceso</strong> al sistema.<br />
                  Requiere <em>Email_Sistema</em> y <em>Contraseña</em> (mín. 8 caracteres).<br />
                  Ideal para <em>supervisores, jefes de área, administrativos.</em>
                </Typography>
              </Paper>
            </Box>

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
              disabled={!selectedCenter}
              sx={{ mb: 2 }}
            >
              Descargar Plantilla Excel
            </Button>
            {!selectedCenter && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Selecciona un centro de distribución para habilitar la descarga.
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Campos de la plantilla
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {[
                { color: '#1565C0', label: 'Tipo de Registro', items: ['Tipo_Registro* (SOLO_PERSONAL / CON_USUARIO)'] },
                { color: '#1976D2', label: 'Datos Personales', items: ['Nombres*, Apellidos*, Codigo_Empleado*', 'Num_Identidad, Fecha_Nacimiento*, Genero* (M/F)', 'Estado_Civil, Telefono*, Email_Contacto, Direccion, Ciudad'] },
                { color: '#2E7D32', label: 'Datos Laborales', items: ['Fecha_Ingreso*, Tipo_Contrato*', 'Area*, Nivel_Jerarquico*', 'Puesto*, Tipo_Posicion*'] },
                { color: '#6A1B9A', label: 'Tallas EPP (opcionales)', items: ['Talla_Camisa, Talla_Pantalon', 'Talla_Zapatos, Talla_Guantes, Talla_Casco'] },
                { color: '#B71C1C', label: 'Acceso al Sistema (solo CON_USUARIO)', items: ['Email_Sistema*, Contrasena_Sistema*', 'Username_Sistema (auto si vacío)', 'Grupo_Sistema'] },
              ].map(sec => (
                <Box key={sec.label} sx={{ minWidth: 200 }}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: sec.color, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                    {sec.label}
                  </Typography>
                  {sec.items.map(it => (
                    <Typography key={it} variant="caption" display="block" color="text.secondary">• {it}</Typography>
                  ))}
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              3. Instrucciones adicionales
            </Typography>
            <List dense disablePadding>
              {[
                'Llena desde la fila 4 en adelante (las filas 2 y 3 son ejemplos, bórralas)',
                'No modifiques los nombres de las columnas (fila 1)',
                'Los campos con valores fijos tienen listas desplegables — haz clic en la celda para seleccionar',
                'Consulta la hoja "Valores Válidos" si necesitas ver todas las opciones disponibles',
                'Fechas en formato DD/MM/YYYY (ej: 15/03/1995)',
                'Los Codigo_Empleado deben ser únicos en el sistema',
                'Para CON_USUARIO: Email_Sistema y Contraseña son obligatorios',
                'Máximo 500 registros por archivo',
              ].map(t => (
                <ListItem key={t} disableGutters sx={{ py: 0.2 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}><InfoIcon fontSize="small" color="info" /></ListItemIcon>
                  <ListItemText primary={t} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItem>
              ))}
            </List>

            <Button variant="outlined" onClick={() => setActiveStep(1)} sx={{ mt: 2 }}>
              Continuar a subir archivo →
            </Button>
          </Paper>
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════════
          PASO 1 — Subir Archivo
      ══════════════════════════════════════════════════════════ */}
      {activeStep === 1 && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>Sube tu archivo Excel</Typography>

          {/* Dropzone */}
          <Box
            data-testid="dropzone"
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: '2px dashed', borderColor: isDragOver ? 'primary.main' : 'divider',
              borderRadius: 3, p: 8, textAlign: 'center', cursor: 'pointer',
              bgcolor: isDragOver ? 'primary.50' : 'background.default',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
              mb: 2,
            }}
          >
            <UploadFileIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" fontWeight={500}>Arrastra tu archivo aquí o haz clic para seleccionar</Typography>
            <Typography variant="caption" color="text.secondary">Formatos: .xlsx, .xls • Máx. 500 registros</Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              data-testid="file-input"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
            />
          </Box>

          {selectedFile && (
            <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
              Archivo: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => setActiveStep(0)}>Atrás</Button>
            <Button
              variant="contained"
              onClick={handleProcessFile}
              disabled={!selectedFile || !selectedCenter || loadingPreview}
              startIcon={loadingPreview ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {loadingPreview ? 'Analizando...' : 'Procesar y Revisar'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* ══════════════════════════════════════════════════════════
          PASO 2 — Revisar y Confirmar
      ══════════════════════════════════════════════════════════ */}
      {activeStep === 2 && previewData && (
        <Box>
          {/* Resumen */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            {[
              { label: 'Total filas', value: previewData.totalFilas, color: 'text.primary' },
              { label: 'Se registrarán', value: previewData.validRows.length, color: 'success.main' },
              { label: 'Con errores (se omitirán)', value: previewData.errorRows.length, color: 'error.main' },
              {
                label: 'Solo perfil',
                value: previewData.validRows.filter(r => r.tipo === 'SOLO_PERSONAL').length,
                color: 'info.main',
              },
              {
                label: 'Con acceso al sistema',
                value: previewData.validRows.filter(r => r.tipo === 'CON_USUARIO').length,
                color: 'success.dark',
              },
            ].map(({ label, value, color }) => (
              <Paper key={label} sx={{ p: 2, flex: 1, minWidth: 130, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} sx={{ color }}>{value}</Typography>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
              </Paper>
            ))}
          </Box>

          {/* Tabs válidos / errores */}
          <Tabs value={reviewTab} onChange={(_, v) => setReviewTab(v)} sx={{ mb: 2 }}>
            <Tab
              label={`✅ Se registrarán (${previewData.validRows.length})`}
              sx={{ fontWeight: 600 }}
            />
            <Tab
              label={`❌ Con errores (${previewData.errorRows.length})`}
              sx={{ fontWeight: 600, color: previewData.errorRows.length > 0 ? 'error.main' : undefined }}
              disabled={previewData.errorRows.length === 0}
            />
          </Tabs>

          {/* ── Tabla válidos ── */}
          {reviewTab === 0 && (
            <Paper sx={{ overflow: 'hidden', mb: 3 }}>
              {previewData.validRows.filter(r => r.tipo === 'CON_USUARIO').length > 0 && (
                <Alert severity="info" sx={{ m: 2, mb: 0 }}>
                  Las filas de tipo <strong>CON_USUARIO</strong> requieren que ingreses una contraseña antes de confirmar.
                </Alert>
              )}
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Nombre Completo</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Identidad</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Género</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Teléfono</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Área</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Nivel</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Puesto</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tipo Posición</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Contrato</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Ingreso</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 60 }}>Camisa</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 100, bgcolor: 'success.50' }}>
                        Email Sistema
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 100, bgcolor: 'success.50' }}>
                        Username
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 200, bgcolor: 'warning.50' }}>
                        Contraseña (CON_USUARIO)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewData.validRows.map(row => (
                      <TableRow key={row.fila} hover
                        sx={{ bgcolor: row.tipo === 'CON_USUARIO' ? 'success.50' : undefined }}
                      >
                        <TableCell>
                          <Chip
                            size="small"
                            icon={row.tipo === 'CON_USUARIO' ? <ManageAccountsIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                            label={row.tipo === 'CON_USUARIO' ? 'Con Usuario' : 'Solo Perfil'}
                            color={row.tipo === 'CON_USUARIO' ? 'success' : 'info'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell><strong>{row.employee_code}</strong></TableCell>
                        <TableCell>{`${row.first_name} ${row.last_name}`}</TableCell>
                        <TableCell>{row.personal_id || '—'}</TableCell>
                        <TableCell>{row.gender === 'M' ? 'Masculino' : row.gender === 'F' ? 'Femenino' : '—'}</TableCell>
                        <TableCell>{row.phone}</TableCell>
                        <TableCell>{lbl(AREA_LABELS, row.area)}</TableCell>
                        <TableCell>
                          <Chip size="small" label={lbl(JERARQUIA_LABELS, row.hierarchy_level)} variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <Tooltip title={row.position}><span>{row.position}</span></Tooltip>
                        </TableCell>
                        <TableCell>{lbl(POSICION_LABELS, row.position_type)}</TableCell>
                        <TableCell>{lbl(CONTRATO_LABELS, row.contract_type)}</TableCell>
                        <TableCell>{row.hire_date || '—'}</TableCell>
                        <TableCell>{row.shirt_size || '—'}</TableCell>
                        <TableCell sx={{ bgcolor: 'success.50' }}>
                          {row.tipo === 'CON_USUARIO' ? (row.email_sistema || '—') : <Typography variant="caption" color="text.disabled">N/A</Typography>}
                        </TableCell>
                        <TableCell sx={{ bgcolor: 'success.50' }}>
                          {row.tipo === 'CON_USUARIO' ? (
                            <Chip size="small" label={row.username || '(auto)'} variant="outlined" color="success" />
                          ) : (
                            <Typography variant="caption" color="text.disabled">N/A</Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ bgcolor: 'warning.50' }}>
                          {row.tipo === 'CON_USUARIO' ? (
                            <TextField
                              size="small"
                              type={showPwd[row.fila] ? 'text' : 'password'}
                              placeholder="Mín. 8 caracteres"
                              value={passwords[row.fila] ?? ''}
                              onChange={e => setPasswords(p => ({ ...p, [row.fila]: e.target.value }))}
                              error={(passwords[row.fila] ?? '').length > 0 && (passwords[row.fila] ?? '').length < 8}
                              sx={{ width: 190 }}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setShowPwd(p => ({ ...p, [row.fila]: !p[row.fila] }))}>
                                      {showPwd[row.fila] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.disabled">No aplica</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* ── Tabla errores ── */}
          {reviewTab === 1 && (
            <Paper sx={{ overflow: 'hidden', mb: 3 }}>
              <Box sx={{ p: 2, bgcolor: 'error.50', display: 'flex', alignItems: 'center', gap: 1 }}>
                <ErrorIcon color="error" />
                <Typography variant="subtitle2" fontWeight={600} color="error.dark">
                  Estas filas NO se registrarán. Corrígelas en el archivo y vuelve a cargar.
                </Typography>
              </Box>
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Fila</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Código</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Errores encontrados</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewData.errorRows.map(row => (
                      <TableRow key={row.fila} hover sx={{ bgcolor: 'error.50' }}>
                        <TableCell><strong>{row.fila}</strong></TableCell>
                        <TableCell>{row.datos.tipo || '—'}</TableCell>
                        <TableCell>{row.datos.employee_code || '—'}</TableCell>
                        <TableCell>{`${row.datos.first_name} ${row.datos.last_name}`}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {row.errores.map((err, i) => (
                              <Tooltip key={i} title={err.mensaje}>
                                <Chip
                                  size="small" color="error" variant="outlined"
                                  label={`${err.campo}: ${err.mensaje}`}
                                  sx={{ maxWidth: 280, '.MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
                                />
                              </Tooltip>
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {previewData.validRows.length === 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              No hay filas válidas. Corrige los errores y vuelve a cargar el archivo.
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => setActiveStep(1)}>Volver a subir</Button>
            <Button
              variant="contained" color="success" onClick={handleConfirm}
              disabled={previewData.validRows.length === 0 || loadingConfirm}
              startIcon={loadingConfirm ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
            >
              {loadingConfirm
                ? 'Registrando...'
                : `Confirmar y Registrar ${previewData.validRows.length} empleados`}
            </Button>
          </Box>
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════════
          PASO 3 — Resultados
      ══════════════════════════════════════════════════════════ */}
      {activeStep === 3 && confirmResult && (
        <Box>
          <Alert severity="success" icon={<CheckCircleIcon fontSize="large" />} sx={{ mb: 4, py: 2 }}>
            <Typography variant="h6" fontWeight={700}>¡Carga completada exitosamente!</Typography>
            <Typography variant="body2">
              Se registraron <strong>{confirmResult.created}</strong> empleados en <strong>{selectedCenter?.name}</strong>.
            </Typography>
          </Alert>

          <Paper sx={{ overflow: 'hidden', mb: 3 }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={600}>Empleados registrados</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Código</TableCell>
                    <TableCell>Nombre Completo</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Acceso al sistema</TableCell>
                    <TableCell>Username</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {confirmResult.registros.map((r, idx) => (
                    <TableRow key={r.employee_code} hover>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell><strong>{r.employee_code}</strong></TableCell>
                      <TableCell>{r.full_name}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          icon={r.tipo === 'CON_USUARIO' ? <ManageAccountsIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                          label={r.tipo === 'CON_USUARIO' ? 'Con Usuario' : 'Solo Perfil'}
                          color={r.tipo === 'CON_USUARIO' ? 'success' : 'info'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={r.tiene_usuario ? 'Sí' : 'No'} color={r.tiene_usuario ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell>
                        {r.username
                          ? <Chip size="small" label={r.username} variant="outlined" color="primary" />
                          : <Typography variant="caption" color="text.disabled">—</Typography>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleReset}>Nueva Carga</Button>
            <Button variant="contained" startIcon={<PeopleIcon />} onClick={() => navigate('/personnel')}>Ver Personal</Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BulkUploadPage;
