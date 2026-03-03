import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Container,
  Grid,
  Divider,
  CircularProgress,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridPaginationModel } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FilterListTwoToneIcon from '@mui/icons-material/FilterListTwoTone';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditNoteIcon from '@mui/icons-material/EditNote';
import GridOnIcon from '@mui/icons-material/GridOn';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useGetCertificationsQuery,
  useGetAreasQuery,
  useMarkCertificationInProgressMutation,
  useMarkCertificationNotCompletedMutation,
} from '../services/personnelApi';
import type { CertificationFilterParams, CertificationStatus } from '../../../interfaces/personnel';
import { CertificationFilters } from '../components/CertificationFilters';
import ChipFilterCategory from '../../ui/components/ChipFilter';
import { useAppSelector } from '../../../store';

// ── Colores por estado ─────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; chipColor: 'default' | 'primary' | 'success' | 'error' }> = {
  PENDING:       { label: 'Pendiente',   color: '#9e9e9e', chipColor: 'default' },
  IN_PROGRESS:   { label: 'En Progreso', color: '#1976d2', chipColor: 'primary' },
  COMPLETED:     { label: 'Completado',  color: '#4caf50', chipColor: 'success' },
  NOT_COMPLETED: { label: 'No Completó', color: '#f44336', chipColor: 'error'   },
};

const STATUS_ICON: Record<string, React.ReactElement> = {
  PENDING:       <HourglassEmptyIcon />,
  IN_PROGRESS:   <PlayCircleIcon />,
  COMPLETED:     <CheckCircleIcon />,
  NOT_COMPLETED: <ErrorIcon />,
};

const SESSION_KEY = 'cert_list_filters';

export const CertificationsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isFullHD = useMediaQuery(theme.breakpoints.up('xl'));

  // ── Filtros (persistidos en sessionStorage para conservarlos al navegar) ───

  const [openFilter, setOpenFilter] = useState(false);
  const [filters, setFilters] = useState<CertificationFilterParams>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : { limit: 25, offset: 0 };
    } catch {
      return { limit: 25, offset: 0 };
    }
  });
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(() => ({
    page: Math.floor((filters.offset || 0) / (filters.limit || 25)),
    pageSize: filters.limit || 25,
  }));

  // Guardar filtros cada vez que cambian
  useEffect(() => {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(filters)); } catch { /* noop */ }
  }, [filters]);

  // ── Menú de acciones ───────────────────────────────────────────────────────
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const menuRow = useRef<any>(null);

  // ── Dialog No Completó ─────────────────────────────────────────────────────
  const [notCompletedOpen, setNotCompletedOpen] = useState(false);
  const [notCompletedReason, setNotCompletedReason] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // ── Datos ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useGetCertificationsQuery(filters);
  const { data: areasData } = useGetAreasQuery();
  const { distributionCenters: disctributionCenters } = useAppSelector(state => state.user);

  // ── Mutaciones ─────────────────────────────────────────────────────────────
  const [markInProgress] = useMarkCertificationInProgressMutation();
  const [markNotCompleted] = useMarkCertificationNotCompletedMutation();

  // ── Export state ───────────────────────────────────────────────────────────
  const authToken = useAppSelector((state) => state.auth.token);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<HTMLElement | null>(null);
  const [registroMenuAnchor, setRegistroMenuAnchor] = useState<HTMLElement | null>(null);

  // ── Paginación ─────────────────────────────────────────────────────────────
  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    setFilters({ ...filters, limit: model.pageSize, offset: model.page * model.pageSize });
  };

  const handleFilterChange = (newFilters: CertificationFilterParams) => {
    setFilters({ ...newFilters, limit: paginationModel.pageSize, offset: 0 });
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  // ── Filtro rápido por estado ───────────────────────────────────────────────
  const setQuickStatus = (status: CertificationStatus | undefined) => {
    setFilters({ ...filters, status, offset: 0 });
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  // ── Estadísticas (página actual) ───────────────────────────────────────────
  const stats = useMemo(() => {
    if (!data?.results) return { total: 0, pending: 0, inProgress: 0, completed: 0, notCompleted: 0 };
    return {
      total:        data.count,
      pending:      data.results.filter((c: any) => c.status === 'PENDING').length,
      inProgress:   data.results.filter((c: any) => c.status === 'IN_PROGRESS').length,
      completed:    data.results.filter((c: any) => c.status === 'COMPLETED').length,
      notCompleted: data.results.filter((c: any) => c.status === 'NOT_COMPLETED').length,
    };
  }, [data]);

  // ── Menú handlers ──────────────────────────────────────────────────────────
  const openMenu = (e: React.MouseEvent<HTMLElement>, row: any) => {
    e.stopPropagation();
    menuRow.current = row;
    setMenuAnchor(e.currentTarget);
  };
  const closeMenu = () => setMenuAnchor(null);

  const handleMarkInProgress = async () => {
    const row = menuRow.current;
    closeMenu();
    setActionLoadingId(row.id);
    try {
      await markInProgress(row.id).unwrap();
      toast.success('Certificación iniciada');
    } catch {
      toast.error('Error al actualizar');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenNotCompleted = () => {
    closeMenu();
    setNotCompletedReason('');
    setNotCompletedOpen(true);
  };

  const handleConfirmNotCompleted = async () => {
    const row = menuRow.current;
    if (!notCompletedReason.trim()) return;
    setActionLoadingId(row.id);
    try {
      await markNotCompleted({ id: row.id, reason: notCompletedReason }).unwrap();
      toast.success('Marcado como No Completó');
      setNotCompletedOpen(false);
    } catch {
      toast.error('Error al actualizar');
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── Export handlers ────────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const { limit: _l, offset: _o, ...exportFilters } = filters;
      const params = new URLSearchParams(
        Object.entries(exportFilters)
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => [k, String(v)])
      );
      const url = `${import.meta.env.VITE_JS_APP_API_URL}/api/certifications/export_excel/?${params.toString()}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${authToken}` } });
      if (!res.ok) throw new Error('Error en la descarga');
      const blob = await res.blob();
      const today = new Date().toISOString().slice(0, 10);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `certificaciones-${today}.xlsx`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } catch {
      toast.error('Error al exportar Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const { limit: _l, offset: _o, ...exportFilters } = filters;
      const params = new URLSearchParams(
        Object.entries(exportFilters)
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => [k, String(v)])
      );
      const url = `${import.meta.env.VITE_JS_APP_API_URL}/api/certifications/export_pdf/?${params.toString()}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${authToken}` } });
      if (!res.ok) throw new Error('Error en la descarga');
      const blob = await res.blob();
      const today = new Date().toISOString().slice(0, 10);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `certificaciones-${today}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } catch {
      toast.error('Error al exportar PDF');
    } finally {
      setExportingPdf(false);
    }
  };

  // ── Status chip ────────────────────────────────────────────────────────────
  const getStatusChip = (status: string) => {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
    return (
      <Chip
        label={cfg.label}
        color={cfg.chipColor}
        size="small"
        icon={STATUS_ICON[status] ?? <HourglassEmptyIcon />}
      />
    );
  };

  // ── Columnas ───────────────────────────────────────────────────────────────
  const columns: GridColDef[] = useMemo(() => {
    const base: GridColDef[] = [
      {
        field: 'personnel_code',
        headerName: 'Código',
        width: isMobile ? 90 : 110,
        renderCell: (p: GridRenderCellParams) => (
          <Typography variant="body2" fontWeight={600}>{p.value}</Typography>
        ),
      },
      {
        field: 'personnel_name',
        headerName: 'Empleado',
        flex: 1,
        minWidth: isMobile ? 150 : 190,
      },
    ];

    if (!isMobile) {
      base.push(
        {
          field: 'certification_type_name',
          headerName: 'Certificación',
          flex: 1,
          minWidth: 180,
        },
        {
          field: 'issuing_authority',
          headerName: 'Organización',
          width: 150,
          renderCell: (p: GridRenderCellParams) => (
            <Typography variant="body2" color={p.value ? 'text.primary' : 'text.disabled'} noWrap>
              {p.value || '—'}
            </Typography>
          ),
        }
      );
    }

    if (!isMobile && !isTablet) {
      base.push(
        {
          field: 'issue_date',
          headerName: 'Emisión',
          width: 110,
          renderCell: (p: GridRenderCellParams) => (
            <Typography variant="body2">
              {p.value ? new Date(p.value).toLocaleDateString() : '—'}
            </Typography>
          ),
        },
        {
          field: 'expiration_date',
          headerName: 'Vencimiento',
          width: 120,
          renderCell: (p: GridRenderCellParams) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarTodayIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {p.value ? new Date(p.value).toLocaleDateString() : '—'}
              </Typography>
            </Box>
          ),
        }
      );
    }

    base.push(
      {
        field: 'status',
        headerName: 'Estado',
        width: isMobile ? 110 : 150,
        renderCell: (p: GridRenderCellParams) => getStatusChip(p.row.status),
      },
      {
        field: 'actions',
        headerName: '',
        width: 56,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (p: GridRenderCellParams) =>
          actionLoadingId === p.row.id ? (
            <CircularProgress size={18} thickness={5} />
          ) : (
            <Tooltip title="Acciones">
              <IconButton size="small" onClick={(e) => openMenu(e, p.row)}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ),
      }
    );

    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, isTablet, actionLoadingId]);

  // ── Chips de filtros activos ───────────────────────────────────────────────
  const clearFilter = (key: keyof CertificationFilterParams) => {
    const next = { ...filters };
    delete next[key];
    setFilters(next);
  };

  const hierarchyLevelLabels: Record<string, string> = {
    OPERATIVE: 'Operativo', SUPERVISOR: 'Supervisor',
    AREA_MANAGER: 'Jefe de Área', CD_MANAGER: 'Gerente de Centro',
  };
  const positionTypeLabels: Record<string, string> = {
    OPERATIONAL: 'Operacional', ADMINISTRATIVE: 'Administrativo',
    MANAGEMENT: 'Gerencial', SECURITY: 'Seguridad', DRIVER: 'Conductor',
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <CertificationFilters
        open={openFilter}
        handleClose={() => setOpenFilter(false)}
        handleFilter={handleFilterChange}
        filters={filters}
        areas={areasData}
        distributorCenters={disctributionCenters}
      />

      {/* ── Dialog No Completó ──────────────────────────────────────────────── */}
      <Dialog
        open={notCompletedOpen}
        onClose={() => setNotCompletedOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CancelIcon color="error" />
          Marcar como No Completó
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>{menuRow.current?.personnel_name}</strong> — {menuRow.current?.certification_type_name}
          </Typography>
          <TextField
            label="Motivo"
            placeholder="Describe por qué no completó la certificación..."
            multiline
            rows={3}
            fullWidth
            autoFocus
            value={notCompletedReason}
            onChange={(e) => setNotCompletedReason(e.target.value)}
            error={notCompletedReason.length === 0 && notCompletedOpen}
            helperText={notCompletedReason.length === 0 ? 'El motivo es requerido' : ' '}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNotCompletedOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmNotCompleted}
            disabled={!notCompletedReason.trim() || actionLoadingId !== null}
            startIcon={actionLoadingId !== null ? <CircularProgress size={16} /> : <CancelIcon />}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Menú contextual ────────────────────────────────────────────────── */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        <MenuItem onClick={() => { closeMenu(); navigate(`/personnel/certifications/${menuRow.current?.id}`); }}>
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          Ver Detalle
        </MenuItem>

        {menuRow.current?.status === 'PENDING' && (
          <MenuItem onClick={handleMarkInProgress}>
            <ListItemIcon><PlayCircleIcon fontSize="small" color="primary" /></ListItemIcon>
            Iniciar
          </MenuItem>
        )}

        {(menuRow.current?.status === 'PENDING' || menuRow.current?.status === 'IN_PROGRESS') && [
          <MenuItem key="complete" onClick={() => { closeMenu(); navigate(`/personnel/certifications/${menuRow.current?.id}/complete`); }}>
            <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
            Completar (capturar firma)
          </MenuItem>,
          <MenuItem key="not-completed" onClick={handleOpenNotCompleted}>
            <ListItemIcon><CancelIcon fontSize="small" color="error" /></ListItemIcon>
            No Completó
          </MenuItem>,
        ]}

        {menuRow.current?.status === 'NOT_COMPLETED' && (
          <MenuItem onClick={() => { closeMenu(); navigate(`/personnel/certifications/${menuRow.current?.id}/complete`); }}>
            <ListItemIcon><EditNoteIcon fontSize="small" color="warning" /></ListItemIcon>
            Completar de todas formas
          </MenuItem>
        )}

        {menuRow.current?.document_url && [
          <Divider key="doc-divider" />,
          <MenuItem key="doc" onClick={() => { closeMenu(); window.open(menuRow.current?.document_url, '_blank'); }}>
            <ListItemIcon><DescriptionIcon fontSize="small" /></ListItemIcon>
            Ver Documento
          </MenuItem>,
        ]}
      </Menu>

      {/* ── Menú Exportar ──────────────────────────────────────────────────── */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { minWidth: 190 } } }}
      >
        <MenuItem
          onClick={() => { setExportMenuAnchor(null); handleExportExcel(); }}
          disabled={exportingExcel || exportingPdf}
        >
          <ListItemIcon>
            {exportingExcel ? <CircularProgress size={16} /> : <GridOnIcon fontSize="small" sx={{ color: 'success.main' }} />}
          </ListItemIcon>
          Exportar Excel
        </MenuItem>
        <MenuItem
          onClick={() => { setExportMenuAnchor(null); handleExportPdf(); }}
          disabled={exportingExcel || exportingPdf}
        >
          <ListItemIcon>
            {exportingPdf ? <CircularProgress size={16} /> : <PictureAsPdfIcon fontSize="small" sx={{ color: 'error.main' }} />}
          </ListItemIcon>
          Exportar PDF
        </MenuItem>
      </Menu>

      {/* ── Menú Registro ───────────────────────────────────────────────────── */}
      <Menu
        anchorEl={registroMenuAnchor}
        open={Boolean(registroMenuAnchor)}
        onClose={() => setRegistroMenuAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { minWidth: 190 } } }}
      >
        <MenuItem onClick={() => { setRegistroMenuAnchor(null); navigate('/personnel/certifications/create'); }}>
          <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
          Nueva Certificación
        </MenuItem>
        <MenuItem onClick={() => { setRegistroMenuAnchor(null); navigate('/personnel/certifications/bulk-upload'); }}>
          <ListItemIcon><UploadFileIcon fontSize="small" /></ListItemIcon>
          Carga Masiva
        </MenuItem>
      </Menu>

      <Container maxWidth={isFullHD ? 'xl' : 'lg'} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {/* ── Encabezado ─────────────────────────────────────────────────── */}
          <Grid item xs={12}>
            <Typography variant="h4" component="h1" fontWeight={400}>
              Certificaciones y Entrenamientos
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Planifica, gestiona y completa certificaciones del personal. Cada certificación requiere la firma del participante al ser completada.
            </Typography>
          </Grid>

          {/* ── Botones de acción ───────────────────────────────────────────── */}
          <Grid item xs={12} display="flex" justifyContent="flex-end" gap={1} flexWrap="wrap">
            <Button
              variant="outlined"
              color="secondary"
              endIcon={<FilterListTwoToneIcon />}
              onClick={() => setOpenFilter(true)}
              size={isMobile ? 'small' : 'medium'}
            >
              Filtrar
            </Button>
            {/* Exportar dropdown */}
            <Button
              variant="outlined"
              endIcon={(exportingExcel || exportingPdf)
                ? <CircularProgress size={14} color="inherit" />
                : <KeyboardArrowDownIcon />}
              onClick={(e) => setExportMenuAnchor(e.currentTarget)}
              disabled={exportingExcel || exportingPdf}
              size={isMobile ? 'small' : 'medium'}
            >
              Exportar
            </Button>
            {/* Registro dropdown */}
            <Button
              variant="contained"
              endIcon={<KeyboardArrowDownIcon />}
              onClick={(e) => setRegistroMenuAnchor(e.currentTarget)}
              size={isMobile ? 'small' : 'medium'}
            >
              Registro
            </Button>
          </Grid>

          {/* ── Tarjetas de estadísticas ────────────────────────────────────── */}
          <Grid item xs={6} sm={6} md={3}>
            <StatCard title="Total" value={stats.total} icon={<AssignmentIcon />} color={theme.palette.primary.main} />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard title="Pendientes" value={stats.pending} icon={<HourglassEmptyIcon />} color="#9e9e9e" />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard title="Completadas" value={stats.completed} icon={<CheckCircleIcon />} color="#4caf50" />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard title="No Completó" value={stats.notCompleted} icon={<ErrorIcon />} color="#f44336" />
          </Grid>

          {/* ── Filtros activos ─────────────────────────────────────────────── */}
          <Grid item xs={12}>
            <Grid container spacing={1}>
              {filters.search && (
                <ChipFilterCategory label="Buscar: " items={[{ label: filters.search, id: "search", deleteAction: () => clearFilter('search') }]} />
              )}
              {filters.area && areasData && (
                <ChipFilterCategory label="Área: " items={[{ label: areasData.find(a => a.id === filters.area)?.name || '', id: "area", deleteAction: () => clearFilter('area') }]} />
              )}
              {filters.distributor_center && (
                <ChipFilterCategory label="Centro: " items={[{ label: disctributionCenters.find(dc => dc.id === filters.distributor_center)?.name || '', id: "distributor_center", deleteAction: () => clearFilter('distributor_center') }]} />
              )}
              {filters.hierarchy_level && (
                <ChipFilterCategory label="Nivel: " items={[{ label: hierarchyLevelLabels[filters.hierarchy_level] || filters.hierarchy_level, id: "hierarchy_level", deleteAction: () => clearFilter('hierarchy_level') }]} />
              )}
              {filters.position_type && (
                <ChipFilterCategory label="Posición: " items={[{ label: positionTypeLabels[filters.position_type] || filters.position_type, id: "position_type", deleteAction: () => clearFilter('position_type') }]} />
              )}
            </Grid>
          </Grid>

          {/* ── Filtro rápido por estado ────────────────────────────────────── */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                Estado:
              </Typography>
              <Chip
                label="Todos"
                size="small"
                onClick={() => setQuickStatus(undefined)}
                variant={!filters.status ? 'filled' : 'outlined'}
                color={!filters.status ? 'primary' : 'default'}
                sx={{ fontWeight: !filters.status ? 700 : 400 }}
              />
              {(Object.entries(STATUS_CONFIG) as [CertificationStatus, typeof STATUS_CONFIG[string]][]).map(([value, cfg]) => (
                <Chip
                  key={value}
                  label={cfg.label}
                  size="small"
                  icon={React.cloneElement(STATUS_ICON[value], { style: { fontSize: 14 } })}
                  onClick={() => setQuickStatus(value)}
                  variant={filters.status === value ? 'filled' : 'outlined'}
                  color={filters.status === value ? cfg.chipColor : 'default'}
                  sx={{ fontWeight: filters.status === value ? 700 : 400 }}
                />
              ))}
            </Box>
          </Grid>

          {/* ── DataGrid ────────────────────────────────────────────────────── */}
          <Grid item xs={12}>
            <Card elevation={2}>
              <DataGrid
                rows={data?.results || []}
                columns={columns}
                loading={isLoading || isFetching}
                paginationModel={paginationModel}
                onPaginationModelChange={handlePaginationChange}
                pageSizeOptions={[10, 25, 50, 100]}
                rowCount={data?.count || 0}
                paginationMode="server"
                disableRowSelectionOnClick
                onRowDoubleClick={(params) => navigate(`/personnel/certifications/${params.row.id}`)}
                autoHeight
                sx={{
                  border: 0,
                  '& .MuiDataGrid-cell': { fontSize: isMobile ? '0.75rem' : '0.875rem' },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    fontWeight: 600,
                  },
                  '& .MuiDataGrid-footerContainer': { borderTop: `1px solid ${theme.palette.divider}` },
                }}
                slots={{
                  noRowsOverlay: () => (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body2" color="text.secondary">
                        No se encontraron certificaciones
                      </Typography>
                    </Box>
                  ),
                  loadingOverlay: () => (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ),
                }}
              />
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

// ── StatCard ───────────────────────────────────────────────────────────────────
interface StatCardProps { title: string; value: number; icon: React.ReactNode; color: string; }

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card elevation={3} sx={{ height: '100%', transition: 'all 0.3s ease-in-out', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgba(0,0,0,0.15)' } }}>
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color, fontSize: { xs: '1.5rem', sm: '2.125rem' }, mt: 0.5 }}>
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: color, opacity: 0.9, width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);
