import { useMemo, useState } from 'react';
import {
    Box, Paper, Typography, Button, Chip, IconButton, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
    CircularProgress, Alert, Divider, Switch, FormControlLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
    Tv as TvIcon,
    Edit as EditIcon,
    LinkOff as RevokeIcon,
    QrCode2 as QrIcon,
    Refresh as RefreshIcon,
    CheckCircle as OnIcon,
    Circle as OffIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import {
    useGetMyTvSessionsQuery,
    useUpdateTvSessionConfigMutation,
    useRevokeTvSessionMutation,
    usePairTvSessionMutation,
    useGetTvSessionQuery,
    TV_DASHBOARDS,
    type TvSessionAdmin,
} from '../services/tvApi';
import { toast } from 'sonner';

const STATUS_CHIP: Record<string, { label: string; color: 'success' | 'warning' | 'default' | 'error' }> = {
    PAIRED:  { label: 'Activa',     color: 'success' },
    PENDING: { label: 'Pendiente',  color: 'warning' },
    EXPIRED: { label: 'Expirada',   color: 'default' },
    REVOKED: { label: 'Revocada',   color: 'error'   },
};

function relativeTime(iso: string | null): string {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `hace ${days}d`;
}

function isOnline(session: TvSessionAdmin): boolean {
    if (!session.last_seen_at) return false;
    const diff = Date.now() - new Date(session.last_seen_at).getTime();
    return diff < 3 * 60_000; // < 3 min
}

interface Props {
    distributorCenterId: number;
    distributorCenterName: string;
}

export default function TvSessionsTab({ distributorCenterId, distributorCenterName }: Props) {
    const [includeInactive, setIncludeInactive] = useState(false);
    // Poll cada 20s para que `last_seen_at` se mantenga fresco — sin esto,
    // el chip "En línea / Sin señal" muestra el valor del momento en que se
    // abrió la pestaña y nunca cambia aunque la TV esté mandando heartbeats.
    const { data, isLoading, refetch } = useGetMyTvSessionsQuery({
        distributor_center: distributorCenterId,
        include_inactive: includeInactive,
    }, { pollingInterval: 20_000 });
    const [updateConfig, { isLoading: updating }] = useUpdateTvSessionConfigMutation();
    const [revoke, { isLoading: revoking }] = useRevokeTvSessionMutation();

    const [editing, setEditing] = useState<TvSessionAdmin | null>(null);
    const [form, setForm] = useState({ dashboard: 'WORKSTATION', label: '' });

    // Diálogo para parear una TV introduciendo el code manualmente (sin QR).
    const [pairOpen, setPairOpen] = useState(false);
    const [pairForm, setPairForm] = useState({ code: '', dashboard: TV_DASHBOARDS[0]?.value || 'WORKSTATION', label: '', ttl_days: 7 });
    const [pair, { isLoading: pairing }] = usePairTvSessionMutation();

    const sessions = data || [];
    const active = useMemo(() => sessions.filter((s) => s.status === 'PAIRED'), [sessions]);
    const inactive = useMemo(() => sessions.filter((s) => s.status !== 'PAIRED'), [sessions]);

    const openEdit = (s: TvSessionAdmin) => {
        setEditing(s);
        setForm({ dashboard: s.dashboard, label: s.label });
    };

    const saveEdit = async () => {
        if (!editing) return;
        try {
            await updateConfig({
                code: editing.code,
                dashboard: form.dashboard,
                label: form.label,
            }).unwrap();
            toast.success('Configuración actualizada — la TV se actualizará sola.');
            setEditing(null);
        } catch (err: any) {
            toast.error(err?.data?.error || 'No se pudo actualizar.');
        }
    };

    const handleRevoke = async (s: TvSessionAdmin) => {
        if (!confirm(`¿Revocar acceso de "${s.label || s.code}"? La TV volverá a la pantalla de pareo.`)) return;
        try {
            await revoke(s.code).unwrap();
            toast.success('TV revocada.');
        } catch (err: any) {
            toast.error(err?.data?.error || 'No se pudo revocar.');
        }
    };

    const handlePairNew = () => {
        setPairForm({ code: '', dashboard: TV_DASHBOARDS[0]?.value || 'WORKSTATION', label: '', ttl_days: 7 });
        setPairOpen(true);
    };

    const openTvInNewTab = () => {
        window.open('/tv', '_blank', 'noopener');
    };

    const normalizeCode = (raw: string): string => {
        const clean = raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
        // Formato esperado: XXXX-XXXX. Si el usuario olvida el guión, lo insertamos.
        if (/^[A-Z0-9]{8}$/.test(clean)) return `${clean.slice(0, 4)}-${clean.slice(4)}`;
        return clean;
    };

    const handlePairSubmit = async () => {
        const code = normalizeCode(pairForm.code);
        if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
            toast.error('El código debe tener el formato XXXX-XXXX.');
            return;
        }
        try {
            await pair({
                code,
                distributor_center: distributorCenterId,
                dashboard: pairForm.dashboard,
                label: pairForm.label,
                ttl_days: pairForm.ttl_days,
            }).unwrap();
            toast.success('TV pareada. La pantalla se actualizará sola.');
            setPairOpen(false);
        } catch (err: any) {
            toast.error(err?.data?.error || 'No se pudo parear — verifica el código.');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
                    TVs conectadas · {distributorCenterName}
                </Typography>
                <FormControlLabel
                    control={<Switch size="small" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />}
                    label={<Typography variant="caption">Ver revocadas / expiradas</Typography>}
                />
                <Tooltip title="Refrescar">
                    <IconButton size="small" onClick={() => refetch()}>
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Button
                    variant="outlined" size="small"
                    startIcon={<QrIcon />}
                    onClick={openTvInNewTab}
                >
                    Abrir pantalla de QR
                </Button>
                <Button
                    variant="contained" size="small"
                    startIcon={<TvIcon />}
                    onClick={handlePairNew}
                >
                    Emparejar nueva TV
                </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Cada TV se identifica con un token opaco. Puedes cambiarle el dashboard en caliente
                o revocarla en cualquier momento — la pantalla volverá sola a la pantalla de pareo.
            </Typography>

            {isLoading && (
                <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
            )}

            {!isLoading && active.length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    No hay TVs pareadas. Usa <b>Emparejar nueva TV</b> para montar una.
                </Alert>
            )}

            {active.length > 0 && (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: inactive.length ? 3 : 0 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Etiqueta</TableCell>
                                <TableCell>Código</TableCell>
                                <TableCell>Dashboard</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Última señal</TableCell>
                                <TableCell>Expira</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {active.map((s) => {
                                const online = isOnline(s);
                                const dash = TV_DASHBOARDS.find((d) => d.value === s.dashboard);
                                return (
                                    <TableRow key={s.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <TvIcon fontSize="small" color="action" />
                                                <Typography fontWeight={600}>{s.label || '(sin etiqueta)'}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.code}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip size="small" label={dash?.label || s.dashboard} />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                icon={online ? <OnIcon sx={{ fontSize: 12 }} /> : <OffIcon sx={{ fontSize: 12 }} />}
                                                label={online ? 'En línea' : 'Sin señal'}
                                                color={online ? 'success' : 'default'}
                                                variant={online ? 'filled' : 'outlined'}
                                                sx={{ '& .MuiChip-icon': { ml: 0.5 } }}
                                            />
                                        </TableCell>
                                        <TableCell><Typography variant="caption">{relativeTime(s.last_seen_at)}</Typography></TableCell>
                                        <TableCell><Typography variant="caption">{new Date(s.expires_at).toLocaleDateString('es-HN')}</Typography></TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Cambiar dashboard / etiqueta">
                                                <IconButton size="small" onClick={() => openEdit(s)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Revocar acceso">
                                                <IconButton size="small" onClick={() => handleRevoke(s)} disabled={revoking} sx={{ color: 'error.main' }}>
                                                    <RevokeIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {includeInactive && inactive.length > 0 && (
                <>
                    <Divider sx={{ my: 2 }}>
                        <Typography variant="caption" color="text.secondary">Historial</Typography>
                    </Divider>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, opacity: 0.75 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Etiqueta</TableCell>
                                    <TableCell>Código</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell>Última señal</TableCell>
                                    <TableCell>Pareada por</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {inactive.map((s) => {
                                    const chip = STATUS_CHIP[s.status];
                                    return (
                                        <TableRow key={s.id}>
                                            <TableCell>{s.label || '(sin etiqueta)'}</TableCell>
                                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{s.code}</TableCell>
                                            <TableCell><Chip size="small" label={chip?.label || s.status} color={chip?.color || 'default'} /></TableCell>
                                            <TableCell><Typography variant="caption">{relativeTime(s.last_seen_at)}</Typography></TableCell>
                                            <TableCell><Typography variant="caption">{s.paired_by_name || '—'}</Typography></TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {/* Emparejar nueva TV sin escanear QR — ingresas el code que ves en la pantalla. */}
            <Dialog open={pairOpen} onClose={() => !pairing && setPairOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Emparejar nueva TV</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            En la TV abre <b>/tv</b> y copia el código que aparece en pantalla. Lo pegas aquí y
                            la TV se actualizará sola — sin necesidad de escanear el QR.
                        </Typography>

                        <TextField
                            fullWidth
                            autoFocus
                            label="Código de la TV"
                            placeholder="A3F9-K2Q1"
                            value={pairForm.code}
                            onChange={(e) => setPairForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                            onBlur={(e) => setPairForm((f) => ({ ...f, code: normalizeCode(e.target.value) }))}
                            inputProps={{ style: { fontFamily: 'monospace', letterSpacing: 3, textAlign: 'center', fontSize: '1.15rem' } }}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            select fullWidth label="Dashboard"
                            value={pairForm.dashboard}
                            onChange={(e) => setPairForm((f) => ({ ...f, dashboard: e.target.value }))}
                            sx={{ mb: 2 }}
                        >
                            {TV_DASHBOARDS.map((d) => (
                                <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            label="Etiqueta (opcional)"
                            placeholder="Ej. TV Muelle 3"
                            value={pairForm.label}
                            onChange={(e) => setPairForm((f) => ({ ...f, label: e.target.value }))}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            select fullWidth label="Duración del token"
                            value={pairForm.ttl_days}
                            onChange={(e) => setPairForm((f) => ({ ...f, ttl_days: Number(e.target.value) }))}
                        >
                            <MenuItem value={1}>1 día</MenuItem>
                            <MenuItem value={7}>7 días</MenuItem>
                            <MenuItem value={14}>14 días</MenuItem>
                            <MenuItem value={30}>30 días</MenuItem>
                        </TextField>

                        <Box sx={{ mt: 2, p: 1.5, bgcolor: (t) => alpha(t.palette.primary.main, 0.08), borderRadius: 1.5 }}>
                            <Typography variant="caption">
                                CD: <b>{distributorCenterName}</b> — se usa este centro de distribución automáticamente.
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPairOpen(false)} disabled={pairing}>Cancelar</Button>
                    <Button variant="contained" onClick={handlePairSubmit} disabled={pairing || !pairForm.code.trim()}>
                        {pairing ? <CircularProgress size={18} color="inherit" /> : 'Emparejar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Editor de dashboard / etiqueta */}
            <Dialog open={!!editing} onClose={() => setEditing(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Configurar TV</DialogTitle>
                <DialogContent>
                    {editing && (
                        <Box sx={{ pt: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                Código: <Box component="span" sx={{ fontFamily: 'monospace' }}>{editing.code}</Box>
                            </Typography>
                            <TextField
                                select fullWidth label="Dashboard"
                                value={form.dashboard}
                                onChange={(e) => setForm((f) => ({ ...f, dashboard: e.target.value }))}
                                sx={{ mb: 2 }}
                            >
                                {TV_DASHBOARDS.map((d) => (
                                    <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                fullWidth label="Etiqueta"
                                placeholder="Ej. TV Muelle 3"
                                value={form.label}
                                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                            />
                            <Box sx={{ mt: 2, p: 1.5, bgcolor: (t) => alpha(t.palette.info.main, 0.08), borderRadius: 1.5 }}>
                                <Typography variant="caption">
                                    La TV se actualizará sola por WebSocket — no hace falta reparearla.
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditing(null)} disabled={updating}>Cancelar</Button>
                    <Button variant="contained" onClick={saveEdit} disabled={updating}>
                        {updating ? <CircularProgress size={18} color="inherit" /> : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
