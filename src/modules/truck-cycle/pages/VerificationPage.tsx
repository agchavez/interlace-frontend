import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    IconButton,
    Chip,
    Autocomplete,
    CircularProgress,
    Alert,
    Divider,
    MenuItem,
    Paper,
    Tooltip,
    Snackbar,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    FormControlLabel,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    PhotoCamera as PhotoIcon,
    CheckCircle as CompleteIcon,
    LocalShipping as TruckIcon,
    Warning as WarningIcon,
    Close as CloseIcon,
    QrCodeScanner as ScanIcon,
    Security as SecurityIcon,
} from '@mui/icons-material';
import PautaStatusBadge from '../components/PautaStatusBadge';
import {
    useGetPautaQuery,
    useCreateInconsistencyMutation,
    useDeleteInconsistencyMutation,
    useUploadPhotoMutation,
    useCompleteCountMutation,
    useCheckoutSecurityMutation,
    useCheckoutOpsMutation,
    useCompleteAuditMutation,
    useProcessReturnMutation,
} from '../services/truckCycleApi';
import { useGetProductQuery } from '../../../store/maintenance/maintenanceApi';
import {
    useGetPersonnelAutocompleteQuery,
    type PersonnelAutocompleteItem,
} from '../../personnel/services/personnelApi';
import type { PautaStatus, Inconsistency } from '../interfaces/truckCycle';
import type { Product } from '../../../interfaces/tracking';

const INCONSISTENCY_TYPES = [
    { value: 'FALTANTE', label: 'Faltante', color: 'error' as const },
    { value: 'SOBRANTE', label: 'Sobrante', color: 'warning' as const },
    { value: 'DANADO', label: 'Dañado', color: 'error' as const },
];

const TYPE_COLOR: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
    FALTANTE: 'error',
    SOBRANTE: 'warning',
    CRUCE: 'info',
    DANADO: 'error',
};

interface IncForm {
    inconsistency_type: string;
    material_code: string;
    product_name: string;
    actual_quantity: string;
    notes: string;
}

const EMPTY_FORM: IncForm = {
    inconsistency_type: 'FALTANTE',
    material_code: '',
    product_name: '',
    actual_quantity: '',
    notes: '',
};

export default function VerificationPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const productInputRef = useRef<HTMLInputElement>(null);

    // Phase: 'VERIFICATION' (counting), 'CHECKOUT' (security), 'CHECKOUT_OPS' (operations), 'RETURN' (devolución), 'AUDIT' (auditoría)
    const rawPhase = searchParams.get('phase') || 'VERIFICATION';
    const isCheckoutOps = rawPhase === 'CHECKOUT_OPS';
    // For inconsistency storage, CHECKOUT_OPS uses 'CHECKOUT' phase
    const phase = (isCheckoutOps ? 'CHECKOUT' : ['CHECKOUT', 'RETURN', 'AUDIT'].includes(rawPhase) ? rawPhase : 'VERIFICATION') as 'VERIFICATION' | 'CHECKOUT' | 'RETURN' | 'AUDIT';
    const isCheckout = phase === 'CHECKOUT' && !isCheckoutOps;
    const isAudit = phase === 'AUDIT';
    const isReturn = phase === 'RETURN';
    const needsValidator = isCheckout || isCheckoutOps;

    // Checkout-specific state
    const [selectedValidator, setSelectedValidator] = useState<PersonnelAutocompleteItem | null>(null);
    const [validatorSearch, setValidatorSearch] = useState('');
    const [exitPassConsumables, setExitPassConsumables] = useState(false);

    // Form state
    const [form, setForm] = useState<IncForm>({ ...EMPTY_FORM });
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productSearch, setProductSearch] = useState('');
    const [formError, setFormError] = useState('');

    // Scan state
    const scanInputRef = useRef<HTMLInputElement>(null);
    const [scanValue, setScanValue] = useState('');
    const [scanStatus, setScanStatus] = useState<'idle' | 'searching' | 'found' | 'not_found'>('idle');
    const expectedQtyRef = useRef<HTMLInputElement>(null);

    // Photo state
    const fileRef = useRef<HTMLInputElement>(null);

    // Tab state
    const [activeTab, setActiveTab] = useState(0);

    // Confirm complete dialog
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Snackbar
    const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success',
    });
    const showSnack = (message: string, severity: 'success' | 'error' = 'success') =>
        setSnack({ open: true, message, severity });

    // Queries
    const { data: pauta, isLoading, error, refetch } = useGetPautaQuery(Number(id));
    const { data: productData, isLoading: loadingProducts } = useGetProductQuery(
        { search: productSearch || undefined, limit: 30, offset: 0 },
        { skip: productSearch.length < 2 },
    );
    const productOptions: Product[] = productData?.results ?? [];

    // Barcode scan query — searches by bar_code when user scans
    const [barcodeLookup, setBarcodeLookup] = useState('');
    const { data: barcodeData, isFetching: scanningBarcode } = useGetProductQuery(
        { bar_code: barcodeLookup, limit: 1, offset: 0 },
        { skip: !barcodeLookup },
    );

    // Handle barcode scan result via useEffect
    const processedBarcode = useRef('');
    useEffect(() => {
        if (!barcodeLookup || scanningBarcode || barcodeLookup === processedBarcode.current) return;
        if (!barcodeData) return;
        processedBarcode.current = barcodeLookup;

        const results = barcodeData.results ?? [];
        if (results.length > 0) {
            const product = results[0];
            setSelectedProduct(product);
            setForm((prev) => ({
                ...prev,
                material_code: product.sap_code,
                product_name: product.name,
            }));
            setScanStatus('found');
            setScanValue('');
            setBarcodeLookup('');
            setTimeout(() => expectedQtyRef.current?.focus(), 100);
        } else {
            setScanStatus('not_found');
            setBarcodeLookup('');
        }
    }, [barcodeLookup, barcodeData, scanningBarcode]);

    // Handle scan Enter key
    const handleScanKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && scanValue.trim()) {
            e.preventDefault();
            setScanStatus('searching');
            processedBarcode.current = '';
            setBarcodeLookup(scanValue.trim());
        }
    };

    // Personnel query for checkout validator
    const validatorPositionType = isCheckout ? 'SECURITY_GUARD' : 'WAREHOUSE_ASSISTANT';
    const { data: personnelData, isLoading: loadingPersonnel } = useGetPersonnelAutocompleteQuery(
        {
            search: validatorSearch || undefined,
            is_active: true,
            position_type: validatorPositionType,
            limit: 50,
        },
        { skip: !needsValidator },
    );

    // Mutations
    const [createInconsistency, { isLoading: creating }] = useCreateInconsistencyMutation();
    const [deleteInconsistency] = useDeleteInconsistencyMutation();
    const [uploadPhoto, { isLoading: uploading }] = useUploadPhotoMutation();
    const [completeCount, { isLoading: completing }] = useCompleteCountMutation();
    const [checkoutSecurity, { isLoading: checkingOut }] = useCheckoutSecurityMutation();
    const [checkoutOps, { isLoading: checkingOutOps }] = useCheckoutOpsMutation();
    const [completeAudit, { isLoading: completingAudit }] = useCompleteAuditMutation();
    const [processReturn, { isLoading: processingReturn }] = useProcessReturnMutation();

    // Handlers
    const updateForm = (field: keyof IncForm, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setFormError('');
    };

    const handleProductSelect = (_: any, product: Product | null) => {
        setSelectedProduct(product);
        if (product) {
            setForm((prev) => ({
                ...prev,
                material_code: product.sap_code,
                product_name: product.name,
            }));
        } else {
            setForm((prev) => ({ ...prev, material_code: '', product_name: '' }));
        }
    };

    const resetForm = useCallback(() => {
        setForm({ ...EMPTY_FORM });
        setSelectedProduct(null);
        setProductSearch('');
        setFormError('');
        setScanValue('');
        setScanStatus('idle');
        // Focus scan input after reset for next scan
        setTimeout(() => scanInputRef.current?.focus(), 100);
    }, []);

    const handleAdd = async () => {
        if (!form.material_code) {
            setFormError('Seleccione un producto.');
            return;
        }
        if (!form.actual_quantity) {
            setFormError('Ingrese la cantidad.');
            return;
        }
        if (!pauta) return;

        try {
            await createInconsistency({
                pauta: pauta.id,
                phase: phase,
                inconsistency_type: form.inconsistency_type as Inconsistency['inconsistency_type'],
                material_code: form.material_code,
                product_name: form.product_name,
                actual_quantity: Number(form.actual_quantity),
                notes: form.notes,
            }).unwrap();
            showSnack('Inconsistencia registrada');
            resetForm();
        } catch (err: any) {
            showSnack(err?.data?.detail || 'Error al registrar', 'error');
        }
    };

    const handleDelete = async (incId: number) => {
        try {
            await deleteInconsistency(incId).unwrap();
            showSnack('Inconsistencia eliminada');
        } catch {
            showSnack('Error al eliminar', 'error');
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !pauta) return;

        for (let i = 0; i < files.length; i++) {
            const fd = new FormData();
            fd.append('pauta', String(pauta.id));
            fd.append('phase', phase);
            fd.append('photo', files[i]);
            fd.append('description', `Verificación - ${files[i].name}`);
            try {
                await uploadPhoto(fd).unwrap();
            } catch {
                showSnack(`Error al subir ${files[i].name}`, 'error');
            }
        }
        showSnack(`${files.length} foto(s) subida(s)`);
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleComplete = async () => {
        if (!pauta) return;
        try {
            if (isCheckout) {
                if (!selectedValidator) return;
                await checkoutSecurity({ id: pauta.id, validator_id: selectedValidator.id }).unwrap();
                showSnack('Checkout de seguridad completado');
                setConfirmOpen(false);
                navigate(-1);
            } else if (isCheckoutOps) {
                if (!selectedValidator) return;
                await checkoutOps({ id: pauta.id, validator_id: selectedValidator.id }).unwrap();
                showSnack('Checkout de operaciones completado');
                setConfirmOpen(false);
                navigate(-1);
            } else if (isAudit) {
                await completeAudit(pauta.id).unwrap();
                showSnack('Auditoría completada');
                setConfirmOpen(false);
                navigate(-1);
            } else if (isReturn) {
                await processReturn(pauta.id).unwrap();
                showSnack('Retorno procesado');
                setConfirmOpen(false);
                navigate(-1);
            } else {
                await completeCount(pauta.id).unwrap();
                showSnack('Conteo completado');
                setConfirmOpen(false);
                navigate(-1);
            }
        } catch (err: any) {
            showSnack(err?.data?.detail || 'Error al completar', 'error');
            setConfirmOpen(false);
        }
    };

    // Loading / Error states
    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error || !pauta) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">Error al cargar la pauta.</Alert>
                <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    Volver
                </Button>
            </Container>
        );
    }

    const inconsistencies = pauta.inconsistencies || [];
    const photos = pauta.photos || [];
    const canComplete = isCheckout
        ? ['COUNTED', 'PENDING_CHECKOUT'].includes(pauta.status)
        : isCheckoutOps
        ? pauta.status === 'CHECKOUT_SECURITY'
        : isAudit
        ? pauta.status === 'IN_AUDIT'
        : isReturn
        ? ['IN_RELOAD_QUEUE', 'PENDING_RETURN'].includes(pauta.status)
        : pauta.status === 'COUNTING';

    return (
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            {/* ── Header ──────────────────────────────────────────────── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'grey.100' }}>
                    <BackIcon />
                </IconButton>
                <Box sx={{ flex: 1 }}>
                    <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={600}>
                        {isCheckout ? 'Checkout de Seguridad' : isCheckoutOps ? 'Checkout de Operaciones' : isAudit ? 'Auditoría' : isReturn ? 'Devolución' : 'Verificación'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {isCheckout ? 'Validación de seguridad e inconsistencias'
                            : isCheckoutOps ? 'Validación de operaciones e inconsistencias'
                            : isAudit ? 'Registro de inconsistencias de auditoría'
                            : isReturn ? 'Registro de inconsistencias de devolución'
                            : 'Registro rápido de inconsistencias'}
                    </Typography>
                </Box>
            </Box>

            {/* ── Pauta Info ──────────────────────────────────────────── */}
            <Card elevation={2} sx={{ mb: 3, borderRadius: 2, bgcolor: 'secondary.main', color: 'white' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <TruckIcon sx={{ fontSize: 32 }} />
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                            <Typography variant="h6" fontWeight={700}>
                                T-{pauta.transport_number} / V-{pauta.trip_number}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {pauta.truck_code} - {pauta.truck_plate}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Paper sx={{ px: 2, py: 1, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.15)' }} elevation={0}>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>Cajas</Typography>
                                <Typography variant="h6" fontWeight={700}>{pauta.total_boxes}</Typography>
                            </Paper>
                            <Paper sx={{ px: 2, py: 1, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.15)' }} elevation={0}>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>SKUs</Typography>
                                <Typography variant="h6" fontWeight={700}>{pauta.total_skus}</Typography>
                            </Paper>
                            <PautaStatusBadge status={pauta.status as PautaStatus} size="medium" />
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* ── Checkout: Validador y pase de salida ─────────────────── */}
            {needsValidator && (
                <Card variant="outlined" sx={{ mb: 2, borderRadius: 2, borderColor: 'primary.main', borderWidth: 2 }}>
                    <CardContent sx={{ p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SecurityIcon color="primary" /> {isCheckoutOps ? 'Validador de Operaciones' : 'Validador de Seguridad'}
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <Autocomplete
                                    options={personnelData || []}
                                    getOptionLabel={(o) => `${o.employee_code} - ${o.full_name}`}
                                    value={selectedValidator}
                                    onChange={(_, v) => setSelectedValidator(v)}
                                    onInputChange={(_, v) => setValidatorSearch(v)}
                                    loading={loadingPersonnel}
                                    isOptionEqualToValue={(a, b) => a.id === b.id}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Seleccionar Validador"
                                            placeholder="Buscar por nombre o código..."
                                            size="small"
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {loadingPersonnel ? <CircularProgress size={18} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props} key={option.id}>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>{option.full_name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{option.employee_code} - {option.position}</Typography>
                                            </Box>
                                        </li>
                                    )}
                                    noOptionsText="Sin resultados"
                                    loadingText="Cargando..."
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={<Checkbox checked={exitPassConsumables} onChange={(e) => setExitPassConsumables(e.target.checked)} />}
                                    label="Pase de salida de consumibles verificado"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* ── Escáner de código de barras ──────────────────────────── */}
            <Card
                variant="outlined"
                sx={{
                    mb: 2,
                    borderRadius: 2,
                    borderColor: scanStatus === 'found' ? 'success.main' : scanStatus === 'not_found' ? 'error.main' : 'divider',
                    borderWidth: scanStatus !== 'idle' && scanStatus !== 'searching' ? 2 : 1,
                }}
            >
                <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                        <ScanIcon color={scanStatus === 'found' ? 'success' : scanStatus === 'not_found' ? 'error' : 'primary'} sx={{ fontSize: 28, flexShrink: 0 }} />
                        <TextField
                            inputRef={scanInputRef}
                            fullWidth
                            size="small"
                            placeholder="Escanear código de barras... (Enter)"
                            value={scanValue}
                            onChange={(e) => { setScanValue(e.target.value); setScanStatus('idle'); }}
                            onKeyDown={handleScanKeyDown}
                            autoFocus
                            InputProps={{
                                sx: { fontFamily: 'monospace', fontWeight: 600 },
                                endAdornment: scanStatus === 'searching' ? <CircularProgress size={20} /> : null,
                            }}
                            sx={{ minWidth: 0 }}
                        />
                        {selectedProduct && (
                            <Chip
                                label={`${selectedProduct.sap_code} - ${selectedProduct.name}`}
                                color="success"
                                onDelete={() => { setSelectedProduct(null); setForm((p) => ({ ...p, material_code: '', product_name: '' })); }}
                                sx={{ maxWidth: { xs: 150, sm: 250 }, overflow: 'hidden' }}
                            />
                        )}
                    </Box>
                    {scanStatus === 'not_found' && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                            Producto no encontrado. Intente buscar manualmente abajo.
                        </Typography>
                    )}
                    {scanStatus === 'found' && (
                        <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                            Producto encontrado. Complete las cantidades abajo.
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {/* ── Formulario de registro rápido ───────────────────────── */}
            <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AddIcon color="primary" /> Registrar Inconsistencia
                    </Typography>

                    {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

                    {/* Fila 1: Producto (ancho completo) */}
                    <Autocomplete
                        options={productOptions}
                        getOptionLabel={(o) => `${o.sap_code} - ${o.name}`}
                        value={selectedProduct}
                        onChange={handleProductSelect}
                        onInputChange={(_, v) => setProductSearch(v)}
                        loading={loadingProducts}
                        filterOptions={(x) => x}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                inputRef={productInputRef}
                                label="Producto"
                                placeholder="Buscar por código SAP, nombre o código de barras..."
                                size="small"
                                fullWidth
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loadingProducts ? <CircularProgress size={18} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props} key={option.id}>
                                <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                        {option.sap_code} - {option.name}
                                    </Typography>
                                    {option.bar_code && (
                                        <Typography variant="caption" color="text.secondary">
                                            Código de barras: {option.bar_code}
                                        </Typography>
                                    )}
                                </Box>
                            </li>
                        )}
                        noOptionsText={productSearch.length < 2 ? 'Escriba para buscar...' : 'Sin resultados'}
                        loadingText="Buscando..."
                        sx={{ mb: 2 }}
                    />

                    {/* Fila 2: Tipo + Esperada + Real */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Tipo de Inconsistencia"
                                value={form.inconsistency_type}
                                onChange={(e) => updateForm('inconsistency_type', e.target.value)}
                            >
                                {INCONSISTENCY_TYPES.map((t) => (
                                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Cantidad"
                                helperText="El tipo de inconsistencia define el signo (faltante/dañado restan, sobrante suma)."
                                inputRef={expectedQtyRef}
                                inputProps={{ inputMode: 'numeric', min: 0 }}
                                value={form.actual_quantity}
                                onChange={(e) => updateForm('actual_quantity', e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                            />
                        </Grid>
                    </Grid>

                    {/* Fila 3: Notas + Botón Agregar */}
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <TextField
                            size="small"
                            label="Notas (opcional)"
                            value={form.notes}
                            onChange={(e) => updateForm('notes', e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                            sx={{ flex: 1 }}
                        />
                        <Button
                            variant="contained"
                            startIcon={creating ? <CircularProgress size={16} /> : <AddIcon />}
                            onClick={handleAdd}
                            disabled={creating}
                            sx={{ minWidth: 130, height: 40 }}
                        >
                            Agregar
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* ── Tabs: Inconsistencias | Fotos ────────────────────────── */}
            <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' },
                    }}
                >
                    <Tab
                        label={`Inconsistencias (${inconsistencies.length})`}
                        icon={<WarningIcon fontSize="small" />}
                        iconPosition="start"
                    />
                    <Tab
                        label={`Fotos (${photos.length})`}
                        icon={<PhotoIcon fontSize="small" />}
                        iconPosition="start"
                    />
                </Tabs>

                {/* Tab 0: Inconsistencias */}
                {activeTab === 0 && (
                    <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
                        {inconsistencies.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                                No se han registrado inconsistencias. Use el formulario de arriba para agregar.
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {inconsistencies.map((inc) => (
                                    <Paper
                                        key={inc.id}
                                        variant="outlined"
                                        sx={{
                                            p: 1.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            flexWrap: 'wrap',
                                            borderLeft: `4px solid ${
                                                inc.inconsistency_type === 'FALTANTE' || inc.inconsistency_type === 'DANADO'
                                                    ? theme.palette.error.main
                                                    : inc.inconsistency_type === 'SOBRANTE'
                                                    ? theme.palette.warning.main
                                                    : theme.palette.info.main
                                            }`,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <Chip
                                                label={inc.inconsistency_type}
                                                size="small"
                                                color={TYPE_COLOR[inc.inconsistency_type] ?? 'default'}
                                            />
                                            <Chip
                                                label={inc.phase === 'VERIFICATION' ? 'Conteo' : inc.phase === 'CHECKOUT' ? 'Checkout' : inc.phase === 'RETURN' ? 'Devolución' : inc.phase === 'AUDIT' ? 'Auditoría' : inc.phase}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontSize: '0.65rem' }}
                                            />
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 150 }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {inc.material_code} - {inc.product_name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {inc.reported_by_name}
                                            </Typography>
                                            {inc.notes && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                    {inc.notes}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="caption" color="text.secondary">Cantidad</Typography>
                                                <Typography variant="body2" fontWeight={600}>{inc.actual_quantity}</Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="caption" color="text.secondary">Dif.</Typography>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={700}
                                                    color={inc.difference < 0 ? 'error.main' : inc.difference > 0 ? 'warning.main' : 'text.primary'}
                                                >
                                                    {inc.difference > 0 ? '+' : ''}{inc.difference}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Tooltip title="Eliminar">
                                            <IconButton size="small" color="error" onClick={() => handleDelete(inc.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Paper>
                                ))}
                            </Box>
                        )}
                    </Box>
                )}

                {/* Tab 1: Fotos */}
                {activeTab === 1 && (
                    <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
                        {/* Botones de subida */}
                        <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
                            <input
                                id="camera-input"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                style={{ display: 'none' }}
                                onChange={handlePhotoUpload}
                            />
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                                onChange={handlePhotoUpload}
                            />
                            <Button
                                variant="contained"
                                color="info"
                                startIcon={uploading ? <CircularProgress size={16} /> : <PhotoIcon />}
                                onClick={() => document.getElementById('camera-input')?.click()}
                                disabled={uploading}
                            >
                                {isMobile ? 'Cámara' : 'Tomar Foto'}
                            </Button>
                            <Button
                                variant="outlined"
                                color="info"
                                onClick={() => fileRef.current?.click()}
                                disabled={uploading}
                            >
                                Subir desde Archivo
                            </Button>
                        </Box>

                        {photos.length === 0 ? (
                            <Box
                                sx={{
                                    py: 5,
                                    textAlign: 'center',
                                    border: '2px dashed',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    '&:hover': { borderColor: 'info.main', bgcolor: 'action.hover' },
                                }}
                                onClick={() => document.getElementById('camera-input')?.click()}
                            >
                                <PhotoIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
                                <Typography variant="body1" color="text.secondary">
                                    Toque aquí para tomar una foto
                                </Typography>
                                <Typography variant="caption" color="text.disabled">
                                    Se requieren al menos 2 fotos (ambos lados del camión)
                                </Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {photos.map((photo) => (
                                    <Grid item xs={6} sm={4} md={3} key={photo.id}>
                                        <Card
                                            elevation={2}
                                            sx={{
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                borderRadius: 2,
                                                transition: 'all 0.2s',
                                                '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
                                            }}
                                            onClick={() => window.open(photo.photo, '_blank')}
                                        >
                                            <Box
                                                component="img"
                                                src={photo.photo}
                                                alt={photo.description}
                                                sx={{ width: '100%', height: { xs: 140, sm: 160, md: 180 }, objectFit: 'cover' }}
                                            />
                                            <Box sx={{ p: 1 }}>
                                                <Typography variant="caption" color="text.secondary" noWrap>
                                                    {photo.description || photo.phase}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled" display="block" sx={{ fontSize: '0.6rem' }}>
                                                    {photo.uploaded_by_name}
                                                </Typography>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}

                                {/* Botón para agregar más */}
                                <Grid item xs={6} sm={4} md={3}>
                                    <Box
                                        sx={{
                                            height: { xs: 140, sm: 160, md: 180 },
                                            border: '2px dashed',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            '&:hover': { borderColor: 'info.main', bgcolor: 'action.hover' },
                                        }}
                                        onClick={() => document.getElementById('camera-input')?.click()}
                                    >
                                        <AddIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            Agregar foto
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                )}
            </Card>

            {/* ── Footer ───────────────────────────────────────────────── */}
            {canComplete && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                        variant="contained"
                        color={needsValidator ? 'primary' : isAudit ? 'warning' : 'success'}
                        size="large"
                        startIcon={(completing || checkingOut || checkingOutOps || completingAudit || processingReturn) ? <CircularProgress size={20} /> : needsValidator ? <SecurityIcon /> : <CompleteIcon />}
                        onClick={() => setConfirmOpen(true)}
                        disabled={completing || checkingOut || checkingOutOps || completingAudit || processingReturn || (needsValidator && !selectedValidator)}
                    >
                        {isCheckout ? 'Confirmar Checkout Seguridad'
                            : isCheckoutOps ? 'Confirmar Checkout Operaciones'
                            : isAudit ? 'Completar Auditoría'
                            : isReturn ? 'Procesar Retorno'
                            : 'Completar Conteo'}
                    </Button>
                </Box>
            )}

            {/* ── Confirm dialog ───────────────────────────────────────── */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>
                    {isCheckout ? 'Confirmar Checkout de Seguridad'
                        : isCheckoutOps ? 'Confirmar Checkout de Operaciones'
                        : isAudit ? 'Completar Auditoría'
                        : isReturn ? 'Procesar Retorno'
                        : 'Completar Conteo'}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        Se han registrado <strong>{inconsistencies.length}</strong> inconsistencia(s)
                        y <strong>{photos.length}</strong> foto(s).
                    </Typography>
                    {isCheckout && selectedValidator && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Validador: <strong>{selectedValidator.full_name}</strong>
                        </Typography>
                    )}
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        {isCheckout ? '¿Desea confirmar el checkout de seguridad?'
                            : isCheckoutOps ? '¿Desea confirmar el checkout de operaciones?'
                            : isAudit ? '¿Desea completar la auditoría?'
                            : isReturn ? '¿Desea procesar el retorno?'
                            : '¿Desea completar el conteo de esta pauta?'}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        color={isCheckout ? 'primary' : 'success'}
                        onClick={handleComplete}
                        disabled={completing || checkingOut || checkingOutOps || completingAudit || processingReturn}
                        startIcon={(completing || checkingOut || checkingOutOps || completingAudit || processingReturn) ? <CircularProgress size={16} /> : undefined}
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Snackbar ─────────────────────────────────────────────── */}
            <Snackbar
                open={snack.open}
                autoHideDuration={3000}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} variant="filled">
                    {snack.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
