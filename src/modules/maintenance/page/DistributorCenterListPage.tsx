// DistributorCenterListPage.tsx — DataGrid en desktop + cards en mobile.

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Typography,
    Button,
    IconButton,
    Box,
    Card,
    TextField,
    InputAdornment,
    Grid,
    CircularProgress,
    Tooltip,
    Pagination,
    Divider,
    useTheme,
    useMediaQuery,
    Avatar,
} from "@mui/material";
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
} from "@mui/x-data-grid";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import LocationIcon from '@mui/icons-material/LocationOnOutlined';
import ArrowIcon from '@mui/icons-material/ArrowForwardIos';
import { DistributorCenter } from "../../../interfaces/maintenance";
import {
    useDeleteDistributorCenterMutation,
    useGetDistributorCentersQuery,
} from "../../../store/maintenance/maintenanceApi";
import { DistributorCenterDialog } from "../components/DistributorCenterDialog.tsx";
import { toast } from "sonner";

export function DistributorCenterListPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 20;

    const { data, isLoading } = useGetDistributorCentersQuery({
        limit: pageSize,
        offset: (page - 1) * pageSize,
        search,
    });
    const [deleteDC] = useDeleteDistributorCenterMutation();

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedDC, setSelectedDC] = useState<DistributorCenter | null>(null);

    const handleOpenCreate = () => { setSelectedDC(null); setOpenDialog(true); };
    const handleOpenEdit = (dc: DistributorCenter) => { setSelectedDC(dc); setOpenDialog(true); };

    async function handleDelete(id: number) {
        if (!confirm("¿Está seguro de eliminar este centro de distribución?")) return;
        try {
            await deleteDC(id).unwrap();
            toast.success("Eliminado exitosamente");
        } catch {
            toast.error("Error al eliminar");
        }
    }

    const totalCount = data?.count || 0;
    const rows = data?.results || [];
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    // Columns para DataGrid (desktop)
    const columns: GridColDef<DistributorCenter>[] = useMemo(() => [
        {
            field: 'name', headerName: 'Centro de Distribución', flex: 1.4, minWidth: 240,
            renderCell: (params: GridRenderCellParams<DistributorCenter>) => {
                const row = params.row;
                const flagCode = (row.data_country?.flag || row.country_code || '').toLowerCase();
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, width: '100%' }}>
                        {flagCode ? (
                            <Box component="img" src={`https://flagcdn.com/w80/${flagCode}.png`} alt=""
                                sx={{ width: 30, height: 20, borderRadius: 0.5, boxShadow: 1, flexShrink: 0 }} />
                        ) : (
                            <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.light', fontSize: '0.8rem' }}>
                                {row.name?.[0] || '?'}
                            </Avatar>
                        )}
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={700} noWrap>{row.name}</Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {row.location_distributor_center_code || '—'}
                            </Typography>
                        </Box>
                    </Box>
                );
            },
        },
        { field: 'direction', headerName: 'Dirección', flex: 1.5, minWidth: 220 },
        {
            field: 'data_country', headerName: 'País', flex: 0.7, minWidth: 130,
            valueGetter: (params) => params.row.data_country?.name || params.row.country_code || '—',
        },
        {
            field: 'actions', headerName: '', width: 100, sortable: false, filterable: false,
            renderCell: (params) => (
                <Box onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenEdit(params.row)}>
                            <EditTwoToneIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
                            <DeleteTwoToneIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ], []);

    return (
        <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                {/* Header */}
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant={isMobile ? 'h6' : 'h4'} fontWeight={400}
                            sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}>
                            Centros de Distribución
                        </Typography>
                    </Box>
                    <Divider sx={{ mt: 1 }} />
                </Grid>

                <Grid item xs={12} sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={400}>
                        Administre los centros de distribución, turnos, camiones, bahías y TVs.
                    </Typography>
                </Grid>

                {/* Actions */}
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <TextField
                        placeholder="Buscar por nombre o código…"
                        variant="outlined" size="small"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        sx={{ width: { xs: '100%', sm: 360 }, bgcolor: 'background.paper' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained" size={isMobile ? 'small' : 'medium'}
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreate}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                    >
                        Nuevo Centro
                    </Button>
                </Grid>

                {/* Contenido: DataGrid desktop / Cards mobile */}
                <Grid item xs={12}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress />
                        </Box>
                    ) : rows.length === 0 ? (
                        <Card variant="outlined" sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
                            <BusinessIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="h6" color="text.secondary">No hay centros de distribución</Typography>
                        </Card>
                    ) : (
                        <>
                            {/* Desktop: DataGrid */}
                            <Card variant="outlined" sx={{ display: { xs: 'none', md: 'block' }, borderRadius: 2 }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    autoHeight
                                    hideFooter
                                    disableRowSelectionOnClick
                                    onRowClick={(params) => navigate(`/maintenance/distributor-center/${params.row.id}`)}
                                    sx={{
                                        border: 0, cursor: 'pointer',
                                        '& .MuiDataGrid-cell': { fontSize: '0.875rem', py: 1 },
                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                            fontWeight: 600,
                                        },
                                    }}
                                    getRowId={(row) => row.id}
                                />
                            </Card>

                            {/* Mobile: cards */}
                            <Grid container spacing={1.25} sx={{ display: { xs: 'flex', md: 'none' } }}>
                                {rows.map((dc) => (
                                    <Grid item xs={12} sm={6} key={dc.id}>
                                        <DcCard
                                            dc={dc}
                                            onOpen={() => navigate(`/maintenance/distributor-center/${dc.id}`)}
                                            onEdit={() => handleOpenEdit(dc)}
                                            onDelete={() => handleDelete(dc.id)}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    )}
                </Grid>

                {/* Paginación */}
                {totalPages > 1 && (
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <Pagination
                            count={totalPages} page={page}
                            onChange={(_, p) => setPage(p)}
                            color="primary" shape="rounded"
                            size={isMobile ? 'small' : 'medium'}
                        />
                    </Grid>
                )}
            </Grid>

            {openDialog && (
                <DistributorCenterDialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    initialData={selectedDC}
                />
            )}
        </Box>
    );
}

// ────────── Card móvil ──────────

function DcCard({ dc, onOpen, onEdit, onDelete }: {
    dc: DistributorCenter;
    onOpen: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const flagCode = (dc.data_country?.flag || dc.country_code || '').toLowerCase();
    const countryName = dc.data_country?.name || dc.country_code || '';

    return (
        <Card
            elevation={0}
            onClick={onOpen}
            sx={{
                borderRadius: 3, border: 1, borderColor: 'divider', overflow: 'hidden',
                cursor: 'pointer', transition: 'transform .15s ease, box-shadow .15s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (t) => `0 6px 20px ${t.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(25, 118, 210, 0.12)'}`,
                    borderColor: 'primary.main',
                },
            }}
        >
            <Box sx={{
                background: (t) => `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.primary.dark} 100%)`,
                color: '#fff',
                px: 1.5, py: 1,
                display: 'flex', alignItems: 'center', gap: 1,
            }}>
                {flagCode && (
                    <Box component="img" src={`https://flagcdn.com/w80/${flagCode}.png`} alt={countryName}
                        sx={{ width: 28, height: 20, borderRadius: 0.5, boxShadow: '0 2px 4px rgba(0,0,0,0.25)', flexShrink: 0 }} />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.6rem', opacity: 0.85, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
                        {dc.location_distributor_center_code || 'CD'}
                    </Typography>
                    <Typography fontWeight={800} noWrap sx={{ lineHeight: 1.1, fontSize: '0.95rem' }}>
                        {dc.name}
                    </Typography>
                </Box>
                <ArrowIcon sx={{ fontSize: 14, opacity: 0.8 }} />
            </Box>
            <Box sx={{ px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <LocationIcon sx={{ fontSize: '0.85rem' }} />
                        <Typography variant="caption" noWrap sx={{ fontSize: '0.7rem' }}>
                            {dc.direction || 'Sin dirección'}
                        </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, fontSize: '0.65rem' }}>
                        {countryName || 'País no definido'}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.25 }} onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Editar">
                        <IconButton size="small" onClick={onEdit} sx={{ p: 0.5 }}>
                            <EditTwoToneIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton size="small" color="error" onClick={onDelete} sx={{ p: 0.5 }}>
                            <DeleteTwoToneIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </Card>
    );
}
