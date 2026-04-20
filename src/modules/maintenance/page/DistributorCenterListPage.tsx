// DistributorCenterListPage.tsx — modernizado: grid de cards en vez de DataGrid.

import { useState } from "react";
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
} from "@mui/material";
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
    useGetDistributorCentersQuery
} from "../../../store/maintenance/maintenanceApi";
import { DistributorCenterDialog } from "../components/DistributorCenterDialog.tsx";
import { toast } from "sonner";

export function DistributorCenterListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 12;

    const { data, isLoading } = useGetDistributorCentersQuery({
        limit: pageSize,
        offset: (page - 1) * pageSize,
        search,
    });
    const [deleteDC] = useDeleteDistributorCenterMutation();

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedDC, setSelectedDC] = useState<DistributorCenter | null>(null);

    const handleOpenCreate = () => {
        setSelectedDC(null);
        setOpenDialog(true);
    };
    const handleOpenEdit = (dc: DistributorCenter) => {
        setSelectedDC(dc);
        setOpenDialog(true);
    };

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

    return (
        <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
            {/* Hero header */}
            <Box sx={{
                mb: 3,
                display: 'flex', flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'stretch', md: 'center' },
                gap: 2,
            }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                        Centros de Distribución
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {totalCount} centro{totalCount === 1 ? '' : 's'} — gestiona turnos, camiones, bahías y TVs.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                    <TextField
                        placeholder="Buscar por nombre o código…"
                        variant="outlined"
                        size="small"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        sx={{ width: { xs: '100%', sm: 320 }, bgcolor: 'background.paper', borderRadius: 2 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        size="medium"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreate}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                        Nuevo Centro
                    </Button>
                </Box>
            </Box>

            {/* Grid de cards */}
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : rows.length === 0 ? (
                <Card elevation={0} sx={{ p: 6, borderRadius: 3, border: 1, borderColor: 'divider', textAlign: 'center' }}>
                    <BusinessIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">No hay centros de distribución</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Crea uno nuevo para empezar a gestionar tus operaciones.
                    </Typography>
                </Card>
            ) : (
                <Grid container spacing={{ xs: 1.25, sm: 2 }}>
                    {rows.map((dc) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={dc.id}>
                            <DcCard
                                dc={dc}
                                onOpen={() => navigate(`/maintenance/distributor-center/${dc.id}`)}
                                onEdit={() => handleOpenEdit(dc)}
                                onDelete={() => handleDelete(dc.id)}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, p) => setPage(p)}
                        color="primary"
                        shape="rounded"
                    />
                </Box>
            )}

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

// ────────── Card individual de CD ──────────

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
                borderRadius: 3,
                border: 1, borderColor: 'divider',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform .15s ease, box-shadow .15s ease, border-color .15s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (t) => `0 8px 24px ${t.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(25, 118, 210, 0.15)'}`,
                    borderColor: 'primary.main',
                },
            }}
        >
            {/* Top banner — gradiente azul + bandera */}
            <Box sx={{
                background: (t) => `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.primary.dark} 100%)`,
                color: '#fff',
                px: { xs: 1.25, sm: 2 }, py: { xs: 1, sm: 1.5 },
                display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 },
            }}>
                {flagCode && (
                    <Box
                        component="img"
                        src={`https://flagcdn.com/w80/${flagCode}.png`}
                        alt={countryName}
                        sx={{ width: { xs: 28, sm: 36 }, height: { xs: 20, sm: 24 }, borderRadius: 0.5, boxShadow: '0 2px 4px rgba(0,0,0,0.25)', flexShrink: 0 }}
                    />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' }, opacity: 0.85, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
                        {dc.location_distributor_center_code || 'CD'}
                    </Typography>
                    <Typography fontWeight={800} noWrap sx={{ lineHeight: 1.1, fontSize: { xs: '0.95rem', sm: '1.15rem' } }}>
                        {dc.name}
                    </Typography>
                </Box>
                <ArrowIcon sx={{ fontSize: { xs: 14, sm: 16 }, opacity: 0.8 }} />
            </Box>

            {/* Body: info + acciones */}
            <Box sx={{
                px: { xs: 1.25, sm: 2 }, py: { xs: 1, sm: 1.5 },
                display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1.5 },
            }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <LocationIcon sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }} />
                        <Typography variant="caption" noWrap sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                            {dc.direction || 'Sin dirección'}
                        </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                        {countryName || 'País no definido'}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.25 }} onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Editar" placement="top">
                        <IconButton size="small" onClick={onEdit} sx={{ p: { xs: 0.5, sm: 0.75 } }}>
                            <EditTwoToneIcon sx={{ fontSize: { xs: '1rem', sm: '1.15rem' } }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar" placement="top">
                        <IconButton size="small" color="error" onClick={onDelete} sx={{ p: { xs: 0.5, sm: 0.75 } }}>
                            <DeleteTwoToneIcon sx={{ fontSize: { xs: '1rem', sm: '1.15rem' } }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </Card>
    );
}
