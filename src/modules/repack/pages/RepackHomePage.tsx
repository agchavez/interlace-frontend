/**
 * Página principal del operario de Reempaque.
 *
 * Si no hay jornada activa: card grande con botón "Iniciar Reempaque".
 * Si hay jornada activa: muestra cronómetro vivo, lista de entries con
 * total acumulado, formulario para agregar lote y botón "Finalizar".
 */
import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Autocomplete,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { toast } from 'sonner';
import { useConfirm } from '../../ui/components/ConfirmDialog';
import { useGetProductQuery } from '../../../store/maintenance/maintenanceApi';
import type { Product } from '../../../interfaces/tracking';
import {
    PlayArrow as StartIcon,
    Stop as StopIcon,
    Add as AddIcon,
    Inventory2 as BoxIcon,
    Schedule as ClockIcon,
    Delete as DeleteIcon,
    Cancel as CancelIcon,
    History as HistoryIcon,
} from '@mui/icons-material';
import { format, isValid, parseISO } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers';

import {
    useGetActiveSessionQuery,
    useStartSessionMutation,
    useFinishSessionMutation,
    useCancelSessionMutation,
    useAddEntryMutation,
    useDeleteEntryMutation,
    useListSessionsQuery,
} from '../services/repackApi';
import type { RepackSession } from '../interfaces/repack';

const C = {
    primary:    '#7b1fa2',  // morado (matchea workstation REPACK)
    primaryBg:  'rgba(123,31,162,0.08)',
    border:     'rgba(123,31,162,0.25)',
    text:       '#1f2937',
    soft:       '#6b7280',
    success:    '#16a34a',
    warning:    '#f59e0b',
};


export default function RepackHomePage() {
    const { data: active, isLoading } = useGetActiveSessionQuery();

    return (
        <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4 } }}>
            <Header />
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : active ? (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                    gap: 3,
                    alignItems: 'flex-start',
                }}>
                    {/* Columna izquierda: jornada + agregar lote */}
                    <Box>
                        <ActiveSessionCard session={active} />
                        <AddEntryForm sessionId={active.id} />
                    </Box>
                    {/* Columna derecha: lotes + historial */}
                    <Box>
                        <EntriesList session={active} />
                        <RecentSessions />
                    </Box>
                </Box>
            ) : (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' },
                    gap: 3,
                }}>
                    <NoSessionView />
                    <RecentSessions />
                </Box>
            )}
        </Container>
    );
}


function Header() {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Avatar sx={{ bgcolor: C.primary, width: 44, height: 44 }}>
                <BoxIcon />
            </Avatar>
            <Box>
                <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                    Reempaque
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Tarea de almacén · medición de cajas / hora por jornada
                </Typography>
            </Box>
        </Box>
    );
}


function NoSessionView() {
    const [start, { isLoading }] = useStartSessionMutation();
    const [error, setError] = useState<string | null>(null);
    const [notes, setNotes] = useState('');

    const onStart = async () => {
        setError(null);
        try {
            await start({ notes }).unwrap();
        } catch (err: any) {
            setError(err?.data?.error || err?.data?.detail || 'No se pudo iniciar la jornada.');
        }
    };

    return (
        <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Avatar sx={{ bgcolor: C.primaryBg, color: C.primary, width: 80, height: 80, mx: 'auto', mb: 2 }}>
                    <StartIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                    Sin jornada activa
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Iniciá una jornada para empezar a digitar los lotes reempacados.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>{error}</Alert>}

                <TextField
                    label="Notas (opcional)"
                    fullWidth
                    size="small"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    sx={{ mb: 2, maxWidth: 420 }}
                />
                <Box>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <StartIcon />}
                        onClick={onStart}
                        disabled={isLoading}
                        sx={{
                            bgcolor: C.primary, textTransform: 'none', fontWeight: 700,
                            px: 4, py: 1.25, borderRadius: 2,
                            '&:hover': { bgcolor: '#5e1782' },
                        }}
                    >
                        Iniciar Reempaque
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}


function useElapsed(startedAt: string) {
    const [elapsed, setElapsed] = useState(() => Math.max(0, Date.now() - new Date(startedAt).getTime()));
    useEffect(() => {
        const id = setInterval(() => {
            setElapsed(Math.max(0, Date.now() - new Date(startedAt).getTime()));
        }, 1000);
        return () => clearInterval(id);
    }, [startedAt]);

    const totalSec = Math.floor(elapsed / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return {
        text: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
        seconds: totalSec,
    };
}


function ActiveSessionCard({ session }: { session: RepackSession }) {
    const [finish, { isLoading: finishing }] = useFinishSessionMutation();
    const [cancel, { isLoading: cancelling }] = useCancelSessionMutation();
    const confirm = useConfirm();

    const elapsed = useElapsed(session.started_at);
    const totalBoxes = (session.entries || []).reduce((s, e) => s + e.box_count, 0);
    const livePerHour = elapsed.seconds > 0 ? Math.round((totalBoxes * 3600 / elapsed.seconds) * 10) / 10 : 0;

    const onFinish = async () => {
        const ok = await confirm({
            title: 'Cerrar jornada de reempaque',
            message: 'Se calculará la métrica final (cajas/hora) y la jornada quedará registrada.',
            confirmText: 'Cerrar jornada',
            confirmColor: 'success',
            severity: 'success',
        });
        if (!ok) return;
        try {
            await finish(session.id).unwrap();
            toast.success('Jornada cerrada y métrica registrada.');
        } catch (err: any) {
            toast.error(err?.data?.error || 'Error al cerrar jornada');
        }
    };

    const onCancel = async () => {
        const ok = await confirm({
            title: 'Cancelar jornada',
            message: 'La jornada se cerrará sin registrar la métrica de cajas/hora.',
            confirmText: 'Cancelar jornada',
            confirmColor: 'error',
            severity: 'danger',
        });
        if (!ok) return;
        try {
            await cancel(session.id).unwrap();
            toast.success('Jornada cancelada.');
        } catch (err: any) {
            toast.error(err?.data?.error || 'Error al cancelar');
        }
    };

    return (
        <Card sx={{ borderRadius: 3, mb: 3, border: `2px solid ${C.primary}` }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Chip
                            size="small"
                            label="Jornada Activa"
                            sx={{ bgcolor: C.primary, color: '#fff', fontWeight: 700, mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            Iniciada: {format(new Date(session.started_at), 'dd MMM yyyy · HH:mm')}
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined" color="error" size="small"
                            startIcon={cancelling ? <CircularProgress size={14} /> : <CancelIcon />}
                            onClick={onCancel}
                            disabled={cancelling || finishing}
                            sx={{ textTransform: 'none' }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained" color="success" size="small"
                            startIcon={finishing ? <CircularProgress size={14} color="inherit" /> : <StopIcon />}
                            onClick={onFinish}
                            disabled={cancelling || finishing}
                            sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                            Finalizar
                        </Button>
                    </Stack>
                </Box>

                <Grid container spacing={1.5}>
                    <StatItem icon={<ClockIcon />} label="Tiempo" value={elapsed.text} mono />
                    <StatItem icon={<BoxIcon />} label="Cajas" value={String(totalBoxes)} />
                    <StatItem icon={<BoxIcon />} label="Cajas / hora" value={livePerHour ? `${livePerHour}` : '—'} highlight />
                </Grid>
            </CardContent>
        </Card>
    );
}


function StatItem({
    icon, label, value, mono, highlight,
}: { icon: React.ReactNode; label: string; value: string; mono?: boolean; highlight?: boolean }) {
    return (
        <Grid item xs={4}>
            <Box sx={{
                bgcolor: highlight ? C.primaryBg : 'grey.50',
                border: `1px solid ${highlight ? C.border : 'transparent'}`,
                borderRadius: 2, p: 1.5, textAlign: 'center',
            }}>
                <Box sx={{
                    display: 'flex', justifyContent: 'center', mb: 0.5,
                    color: highlight ? C.primary : C.soft,
                }}>
                    {icon}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.65rem' }}>
                    {label}
                </Typography>
                <Typography sx={{
                    fontWeight: 800, fontSize: '1.4rem',
                    fontFamily: mono ? 'monospace' : undefined,
                    color: highlight ? C.primary : C.text,
                    lineHeight: 1.2,
                }}>
                    {value}
                </Typography>
            </Box>
        </Grid>
    );
}


function AddEntryForm({ sessionId }: { sessionId: number }) {
    const [add, { isLoading }] = useAddEntryMutation();
    const [product, setProduct] = useState<Product | null>(null);
    const [productSearch, setProductSearch] = useState('');
    const [boxCount, setBoxCount] = useState<string>('');
    const [exp, setExp] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const debouncedSearch = useMemo(() => productSearch.trim(), [productSearch]);
    const { data: productsData, isFetching } = useGetProductQuery(
        { search: debouncedSearch, limit: 30, offset: 0, id: null } as any,
        { skip: debouncedSearch.length < 2 },
    );
    const productOptions: Product[] = productsData?.results || [];

    const reset = () => {
        setProduct(null); setProductSearch(''); setBoxCount(''); setExp('');
    };

    const onSubmit = async () => {
        setError(null);
        if (!product) { setError('Seleccioná un producto del catálogo.'); return; }
        if (!boxCount) { setError('Ingresá la cantidad de cajas.'); return; }
        if (!exp) { setError('Ingresá la fecha de vencimiento.'); return; }
        try {
            await add({
                session: sessionId,
                product: product.id,
                material_code: product.sap_code || String(product.id),
                product_name: product.name,
                box_count: Number(boxCount),
                expiration_date: exp,
            }).unwrap();
            reset();
            toast.success('Lote registrado');
        } catch (err: any) {
            setError(err?.data?.error || err?.data?.detail || 'Error al registrar el lote');
        }
    };

    return (
        <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Agregar lote reempacado
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Grid container spacing={1.5}>
                    <Grid item xs={12}>
                        <Autocomplete
                            options={productOptions}
                            value={product}
                            onChange={(_, val) => setProduct(val)}
                            inputValue={productSearch}
                            onInputChange={(_, val) => setProductSearch(val)}
                            getOptionLabel={(o) => `${o.sap_code || '—'} · ${o.name}`}
                            isOptionEqualToValue={(a, b) => a.id === b.id}
                            loading={isFetching}
                            filterOptions={(x) => x}
                            noOptionsText={debouncedSearch.length < 2 ? 'Escriba código o nombre…' : 'Sin resultados'}
                            renderOption={(props, option) => (
                                <li {...props} key={option.id}>
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>
                                            {option.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            SAP: {option.sap_code || '—'}{option.brand ? ` · ${option.brand}` : ''}
                                        </Typography>
                                    </Box>
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Producto *"
                                    size="small"
                                    placeholder="Buscar por código SAP o nombre…"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {isFetching ? <CircularProgress size={16} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={6} sm={6}>
                        <TextField
                            fullWidth size="small" type="number" label="Cajas *"
                            value={boxCount}
                            onChange={(e) => setBoxCount(e.target.value)}
                            inputProps={{ min: 1 }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={6}>
                        <DatePicker
                            label="Vencimiento *"
                            value={exp ? parseISO(exp) : null}
                            onChange={(v) => setExp(v && isValid(v) ? format(v, 'yyyy-MM-dd') : '')}
                            slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        />
                    </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                        variant="contained" onClick={onSubmit} disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
                        sx={{
                            bgcolor: C.primary, textTransform: 'none', fontWeight: 700,
                            '&:hover': { bgcolor: '#5e1782' },
                        }}
                    >
                        Agregar lote
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}


function EntriesList({ session }: { session: RepackSession }) {
    const [del] = useDeleteEntryMutation();
    const confirm = useConfirm();
    const entries = session.entries || [];

    const onDelete = async (entryId: number, summary: string) => {
        const ok = await confirm({
            title: 'Eliminar lote',
            message: `Se eliminará el lote: ${summary}`,
            confirmText: 'Eliminar',
            severity: 'danger',
        });
        if (!ok) return;
        del({ id: entryId, sessionId: session.id });
    };

    if (entries.length === 0) {
        return (
            <Card sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        Sin lotes registrados todavía. Agregá el primero arriba.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Lotes ({entries.length})
                </Typography>
                <Stack spacing={1}>
                    {entries.map((e) => (
                        <Box
                            key={e.id}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5,
                                p: 1.5, borderRadius: 2,
                                bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider',
                            }}
                        >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={700} noWrap>
                                    {e.material_code}{e.product_name ? ` · ${e.product_name}` : ''}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Vence: {format(new Date(e.expiration_date), 'dd MMM yyyy')}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography sx={{ fontWeight: 800, color: C.primary, fontFamily: 'monospace' }}>
                                    {e.box_count}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">cajas</Typography>
                            </Box>
                            <Tooltip title="Eliminar lote">
                                <IconButton
                                    size="small" color="error"
                                    onClick={() => onDelete(
                                        e.id,
                                        `${e.material_code}${e.product_name ? ' · ' + e.product_name : ''} (${e.box_count} cajas)`,
                                    )}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
}


function RecentSessions() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data } = useListSessionsQuery({ operational_date: today, limit: 10 });
    const sessions = (data?.results || []).filter((s) => s.status !== 'ACTIVE');
    if (sessions.length === 0) return null;

    return (
        <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <HistoryIcon fontSize="small" sx={{ color: C.soft }} />
                    <Typography variant="subtitle2" fontWeight={700}>
                        Jornadas de hoy
                    </Typography>
                </Box>
                <Divider sx={{ mb: 1.5 }} />
                <Stack spacing={1}>
                    {sessions.map((s) => (
                        <Box key={s.id} sx={{
                            display: 'flex', alignItems: 'center', gap: 2, p: 1,
                            borderRadius: 1.5, bgcolor: 'grey.50',
                        }}>
                            <Chip
                                size="small" label={s.status_display}
                                color={s.status === 'COMPLETED' ? 'success' : 'default'}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={600} noWrap>
                                    {s.personnel_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {format(new Date(s.started_at), 'HH:mm')}
                                    {s.ended_at ? ` – ${format(new Date(s.ended_at), 'HH:mm')}` : ''}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body2" fontWeight={700}>
                                    {s.total_boxes} cajas
                                </Typography>
                                <Typography variant="caption" sx={{ color: C.primary, fontWeight: 700 }}>
                                    {s.boxes_per_hour ? `${s.boxes_per_hour} c/h` : '—'}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
}
