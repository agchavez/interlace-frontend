/**
 * Página de tokens pendientes de aprobación
 * Con filtros, selección masiva y aprobación/rechazo en batch
 */
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  Stack,
  TextField,
  MenuItem,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Fade,
  Paper,
} from '@mui/material';
import {
  AccessTime as PermitHourIcon,
  EventNote as PermitDayIcon,
  ExitToApp as ExitPassIcon,
  SwapHoriz as SubstitutionIcon,
  TrendingUp as RateChangeIcon,
  MoreTime as OvertimeIcon,
  Autorenew as ShiftChangeIcon,
  Checkroom as UniformIcon,
  Person as PersonIcon,
  Business as CenterIcon,
  CalendarToday as DateIcon,
  ArrowForward as ArrowIcon,
  HourglassTop as PendingIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Search as SearchIcon,
  SelectAll as SelectAllIcon,
  Deselect as DeselectIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { isValid, format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
  useGetPendingApprovalsQuery,
  useApproveLevel1Mutation,
  useApproveLevel2Mutation,
  useApproveLevel3Mutation,
  useRejectTokenMutation,
} from '../services/tokenApi';
import {
  TokenStatus,
  TokenStatusLabels,
  TokenType,
  TokenTypeLabels,
} from '../interfaces/token';
import type { TokenListItem } from '../interfaces/token';
import { ApprovalDialog } from '../components/ApprovalDialog';

const tokenTypeConfig: Record<TokenType, { icon: React.ReactNode; color: string; bg: string }> = {
  [TokenType.PERMIT_HOUR]:     { icon: <PermitHourIcon />,   color: '#1976d2', bg: '#e3f2fd' },
  [TokenType.PERMIT_DAY]:      { icon: <PermitDayIcon />,    color: '#7b1fa2', bg: '#f3e5f5' },
  [TokenType.EXIT_PASS]:       { icon: <ExitPassIcon />,     color: '#d32f2f', bg: '#ffebee' },
  [TokenType.SUBSTITUTION]:    { icon: <SubstitutionIcon />, color: '#f57c00', bg: '#fff3e0' },
  [TokenType.RATE_CHANGE]:     { icon: <RateChangeIcon />,   color: '#388e3c', bg: '#e8f5e9' },
  [TokenType.OVERTIME]:        { icon: <OvertimeIcon />,     color: '#0288d1', bg: '#e1f5fe' },
  [TokenType.SHIFT_CHANGE]:    { icon: <ShiftChangeIcon />,  color: '#5d4037', bg: '#efebe9' },
  [TokenType.UNIFORM_DELIVERY]:{ icon: <UniformIcon />,      color: '#455a64', bg: '#eceff1' },
};

const levelColors: Record<TokenStatus, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
  [TokenStatus.DRAFT]:       'default',
  [TokenStatus.PENDING_L1]:  'warning',
  [TokenStatus.PENDING_L2]:  'warning',
  [TokenStatus.PENDING_L3]:  'warning',
  [TokenStatus.APPROVED]:    'success',
  [TokenStatus.USED]:        'info',
  [TokenStatus.EXPIRED]:     'default',
  [TokenStatus.CANCELLED]:   'default',
  [TokenStatus.REJECTED]:    'error',
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' });

const TOKEN_TYPE_OPTIONS = [
  { value: '', label: 'Todos los tipos' },
  ...Object.entries(TokenTypeLabels).map(([value, label]) => ({ value, label })),
];

export const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: tokens, isLoading, error } = useGetPendingApprovalsQuery();

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Batch action dialogs
  const [batchApproveOpen, setBatchApproveOpen] = useState(false);
  const [batchRejectOpen, setBatchRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [batchProcessing, setBatchProcessing] = useState(false);

  // Single approval dialog
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenListItem | null>(null);

  // Single reject dialog
  const [singleRejectOpen, setSingleRejectOpen] = useState(false);
  const [singleRejectToken, setSingleRejectToken] = useState<TokenListItem | null>(null);
  const [singleRejectReason, setSingleRejectReason] = useState('');

  // Mutations
  const [approveL1, { isLoading: approvingL1 }] = useApproveLevel1Mutation();
  const [approveL2, { isLoading: approvingL2 }] = useApproveLevel2Mutation();
  const [approveL3, { isLoading: approvingL3 }] = useApproveLevel3Mutation();
  const [rejectToken, { isLoading: rejecting }] = useRejectTokenMutation();

  // Filtered tokens
  const filteredTokens = useMemo(() => {
    if (!tokens) return [];
    return tokens.filter((t) => {
      // Search filter (personnel name, requested_by, display_number)
      if (search) {
        const s = search.toLowerCase();
        const matchName = t.personnel_name?.toLowerCase().includes(s);
        const matchRequester = t.requested_by_name?.toLowerCase().includes(s);
        const matchNumber = t.display_number?.toLowerCase().includes(s);
        const matchCode = t.personnel_code?.toLowerCase().includes(s);
        if (!matchName && !matchRequester && !matchNumber && !matchCode) return false;
      }
      // Type filter
      if (typeFilter && t.token_type !== typeFilter) return false;
      // Date filters
      if (dateFrom && new Date(t.valid_from) < dateFrom) return false;
      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59);
        if (new Date(t.valid_from) > endOfDay) return false;
      }
      return true;
    });
  }, [tokens, search, typeFilter, dateFrom, dateTo]);

  const count = filteredTokens.length;
  const selectedCount = selectedIds.size;
  const allSelected = count > 0 && selectedIds.size === count;

  // Selection handlers
  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTokens.map((t) => t.id)));
    }
  }, [allSelected, filteredTokens]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // Get approval level for a token
  const getApprovalLevel = (token: TokenListItem): 1 | 2 | 3 => {
    if (token.status === TokenStatus.PENDING_L1) return 1;
    if (token.status === TokenStatus.PENDING_L2) return 2;
    return 3;
  };

  // Single approve from card
  const handleOpenApproval = (token: TokenListItem) => {
    setSelectedToken(token);
    setApprovalDialogOpen(true);
  };

  const handleSingleApprove = async (data: { notes: string; signature?: Blob; photo?: File }) => {
    if (!selectedToken) return;
    const level = getApprovalLevel(selectedToken);
    try {
      const mutations = { 1: approveL1, 2: approveL2, 3: approveL3 };
      const mutation = mutations[level];
      if (data.signature || data.photo) {
        const formData = new FormData();
        if (data.notes) formData.append('notes', data.notes);
        if (data.signature) formData.append('signature', data.signature, 'signature.png');
        if (data.photo) formData.append('photo', data.photo);
        await mutation({ id: selectedToken.id, payload: formData }).unwrap();
      } else {
        await mutation({ id: selectedToken.id, payload: { notes: data.notes } }).unwrap();
      }
      toast.success(`Token ${selectedToken.display_number} aprobado`);
      setApprovalDialogOpen(false);
      setSelectedToken(null);
      // Remove from selection if was selected
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(selectedToken.id); return next; });
    } catch {
      toast.error('Error al aprobar');
    }
  };

  // Single reject from card
  const handleOpenReject = (token: TokenListItem) => {
    setSingleRejectToken(token);
    setSingleRejectReason('');
    setSingleRejectOpen(true);
  };

  const handleSingleReject = async () => {
    if (!singleRejectToken || !singleRejectReason.trim()) {
      toast.error('Debe proporcionar un motivo de rechazo');
      return;
    }
    try {
      await rejectToken({ id: singleRejectToken.id, payload: { reason: singleRejectReason } }).unwrap();
      toast.success(`Token ${singleRejectToken.display_number} rechazado`);
      setSingleRejectOpen(false);
      setSingleRejectToken(null);
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(singleRejectToken.id); return next; });
    } catch {
      toast.error('Error al rechazar');
    }
  };

  // Batch approve
  const handleBatchApprove = async (data: { notes: string; signature?: Blob; photo?: File }) => {
    setBatchProcessing(true);
    const selected = filteredTokens.filter((t) => selectedIds.has(t.id));
    let success = 0;
    let failed = 0;

    for (const token of selected) {
      const level = getApprovalLevel(token);
      const mutations = { 1: approveL1, 2: approveL2, 3: approveL3 };
      const mutation = mutations[level];
      try {
        if (data.signature || data.photo) {
          const formData = new FormData();
          if (data.notes) formData.append('notes', data.notes);
          if (data.signature) formData.append('signature', data.signature, 'signature.png');
          if (data.photo) formData.append('photo', data.photo);
          await mutation({ id: token.id, payload: formData }).unwrap();
        } else {
          await mutation({ id: token.id, payload: { notes: data.notes } }).unwrap();
        }
        success++;
      } catch {
        failed++;
      }
    }

    setBatchProcessing(false);
    setBatchApproveOpen(false);
    setSelectedIds(new Set());
    toast.success(`${success} token(s) aprobado(s)${failed > 0 ? `, ${failed} fallido(s)` : ''}`);
  };

  // Batch reject
  const handleBatchReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Debe proporcionar un motivo de rechazo');
      return;
    }
    setBatchProcessing(true);
    const selected = filteredTokens.filter((t) => selectedIds.has(t.id));
    let success = 0;
    let failed = 0;

    for (const token of selected) {
      try {
        await rejectToken({ id: token.id, payload: { reason: rejectReason } }).unwrap();
        success++;
      } catch {
        failed++;
      }
    }

    setBatchProcessing(false);
    setBatchRejectOpen(false);
    setRejectReason('');
    setSelectedIds(new Set());
    toast.success(`${success} token(s) rechazado(s)${failed > 0 ? `, ${failed} fallido(s)` : ''}`);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error al cargar tokens pendientes</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={0.5}>
            <PendingIcon sx={{ color: 'warning.main', fontSize: 32 }} />
            <Typography variant="h4" fontWeight={400}>
              Pendientes de Aprobación
            </Typography>
            {(tokens?.length ?? 0) > 0 && (
              <Chip label={tokens?.length} size="small" color="warning" sx={{ fontWeight: 700, fontSize: '0.85rem' }} />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 7 }}>
            Fichas que requieren su revisión y aprobación
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
        <TextField
          placeholder="Buscar por persona, solicitante o código..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 280 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          size="small"
          label="Tipo"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 180 } }}
        >
          {TOKEN_TYPE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
        <DatePicker
          label="Desde"
          value={dateFrom}
          onChange={(v) => setDateFrom(v && isValid(v) ? v : null)}
          slotProps={{ textField: { size: 'small', sx: { minWidth: { xs: '100%', sm: 150 } } } }}
        />
        <DatePicker
          label="Hasta"
          value={dateTo}
          onChange={(v) => setDateTo(v && isValid(v) ? v : null)}
          slotProps={{ textField: { size: 'small', sx: { minWidth: { xs: '100%', sm: 150 } } } }}
        />
      </Box>

      {/* Selection toolbar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={allSelected ? <DeselectIcon /> : <SelectAllIcon />}
            onClick={toggleSelectAll}
            disabled={count === 0}
          >
            {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </Button>
          {selectedCount > 0 && (
            <Chip label={`${selectedCount} seleccionado(s)`} size="small" color="primary" onDelete={clearSelection} />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {count} de {tokens?.length ?? 0} resultado(s)
        </Typography>
      </Box>

      {/* Batch action bar */}
      <Collapse in={selectedCount > 0}>
        <Paper
          elevation={3}
          sx={{
            mb: 3,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'grey.50',
            borderRadius: 2,
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            {selectedCount} token(s) seleccionado(s)
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<ApproveIcon />}
              onClick={() => setBatchApproveOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Aprobar ({selectedCount})
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<RejectIcon />}
              onClick={() => setBatchRejectOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Rechazar ({selectedCount})
            </Button>
          </Box>
        </Paper>
      </Collapse>

      {/* Empty state */}
      {count === 0 ? (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <PendingIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" fontWeight={500}>
              {(tokens?.length ?? 0) === 0 ? 'Todo al día' : 'Sin resultados'}
            </Typography>
            <Typography variant="body2" color="text.disabled" mt={0.5}>
              {(tokens?.length ?? 0) === 0
                ? 'No tienes fichas pendientes de aprobación'
                : 'Ajuste los filtros para ver resultados'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredTokens.map((token) => {
            const cfg = tokenTypeConfig[token.token_type as TokenType] ?? {
              icon: <PendingIcon />, color: '#757575', bg: '#f5f5f5',
            };
            const isSelected = selectedIds.has(token.id);

            return (
              <Grid item xs={12} md={6} key={token.id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                    borderColor: isSelected ? 'primary.main' : undefined,
                    borderWidth: isSelected ? 2 : 1,
                    bgcolor: isSelected ? 'primary.50' : undefined,
                    '&:hover': {
                      boxShadow: 4,
                      borderColor: isSelected ? 'primary.main' : cfg.color,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Top row: checkbox + icon + número + status */}
                    <Box display="flex" alignItems="flex-start" gap={1.5}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleSelect(token.id)}
                        size="small"
                        sx={{ mt: -0.5, ml: -0.5 }}
                      />
                      <Avatar
                        sx={{
                          bgcolor: cfg.bg,
                          color: cfg.color,
                          width: 44,
                          height: 44,
                          flexShrink: 0,
                        }}
                      >
                        {cfg.icon}
                      </Avatar>

                      <Box flex={1} minWidth={0}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap">
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            {token.display_number}
                          </Typography>
                          <Chip
                            label={TokenStatusLabels[token.status as TokenStatus]}
                            size="small"
                            color={levelColors[token.status as TokenStatus]}
                            sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                          />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={700} noWrap>
                          {token.token_type_display}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Info rows */}
                    <Stack spacing={0.75}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                        <Typography variant="body2" fontWeight={500} noWrap>
                          {token.personnel_name ?? '—'}
                        </Typography>
                        {token.personnel_code && (
                          <Typography variant="caption" color="text.secondary">
                            #{token.personnel_code}
                          </Typography>
                        )}
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary">Solicitado por:</Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {token.requested_by_name}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <CenterIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {token.distributor_center_name}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <DateIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(token.valid_from)} — {formatDate(token.valid_until)}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Actions */}
                    <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<RejectIcon />}
                        onClick={(e) => { e.stopPropagation(); handleOpenReject(token); }}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                      >
                        Rechazar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        startIcon={<ApproveIcon />}
                        onClick={(e) => { e.stopPropagation(); handleOpenApproval(token); }}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        endIcon={<ArrowIcon />}
                        onClick={(e) => { e.stopPropagation(); navigate(`/tokens/detail/${token.id}`); }}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Revisar
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Single Approval Dialog */}
      {selectedToken && (
        <ApprovalDialog
          open={approvalDialogOpen}
          onClose={() => { setApprovalDialogOpen(false); setSelectedToken(null); }}
          onApprove={handleSingleApprove}
          isLoading={approvingL1 || approvingL2 || approvingL3}
          tokenDisplayNumber={selectedToken.display_number}
          approvalLevel={getApprovalLevel(selectedToken)}
        />
      )}

      {/* Batch Approval Dialog */}
      <ApprovalDialog
        open={batchApproveOpen}
        onClose={() => setBatchApproveOpen(false)}
        onApprove={handleBatchApprove}
        isLoading={batchProcessing}
        tokenDisplayNumber={`${selectedCount} token(s)`}
        approvalLevel={0}
      />

      {/* Batch Reject Dialog */}
      <Dialog open={batchRejectOpen} onClose={() => setBatchRejectOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <Box sx={{ bgcolor: 'error.main', color: 'white', px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <RejectIcon />
          <Typography variant="h6" fontWeight={600}>
            Rechazar {selectedCount} Token(s)
          </Typography>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta acción rechazará {selectedCount} token(s) seleccionado(s). Esta acción no se puede deshacer.
          </Alert>
          <TextField
            label="Motivo de rechazo"
            multiline
            rows={3}
            fullWidth
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explique el motivo del rechazo..."
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setBatchRejectOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleBatchReject}
            disabled={batchProcessing || !rejectReason.trim()}
            startIcon={batchProcessing ? <CircularProgress size={16} /> : <RejectIcon />}
          >
            {batchProcessing ? 'Procesando...' : `Rechazar (${selectedCount})`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Single Reject Dialog */}
      <Dialog open={singleRejectOpen} onClose={() => setSingleRejectOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <Box sx={{ bgcolor: 'error.main', color: 'white', px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <RejectIcon />
          <Typography variant="h6" fontWeight={600}>
            Rechazar Token
          </Typography>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          {singleRejectToken && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Está a punto de rechazar el token <strong>{singleRejectToken.display_number}</strong> de{' '}
              <strong>{singleRejectToken.personnel_name}</strong>. Esta acción no se puede deshacer.
            </Alert>
          )}
          <TextField
            label="Motivo de rechazo"
            multiline
            rows={3}
            fullWidth
            value={singleRejectReason}
            onChange={(e) => setSingleRejectReason(e.target.value)}
            placeholder="Explique el motivo del rechazo..."
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setSingleRejectOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSingleReject}
            disabled={rejecting || !singleRejectReason.trim()}
            startIcon={rejecting ? <CircularProgress size={16} /> : <RejectIcon />}
          >
            {rejecting ? 'Rechazando...' : 'Rechazar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
