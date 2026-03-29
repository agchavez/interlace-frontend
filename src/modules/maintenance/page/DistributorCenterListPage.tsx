// DistributorCenterListPage.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Typography,
    Button,
    IconButton,
    Chip,
    Box,
    Avatar,
    Card,
    Alert,
    TextField,
    InputAdornment,
} from "@mui/material";
import {
    DataGrid,
    GridColDef,
    GridPaginationModel,
    GridRenderCellParams,
} from "@mui/x-data-grid";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { DistributorCenter } from "../../../interfaces/maintenance";
import {
    useDeleteDistributorCenterMutation,
    useGetDistributorCentersQuery
} from "../../../store/maintenance/maintenanceApi";
import {DistributorCenterDialog} from "../components/DistributorCenterDialog.tsx";
import {toast} from "sonner";
import {tableBase} from "../../ui";

export function DistributorCenterListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: 10,
        page: 0,
    });

    const limit = paginationModel.pageSize;
    const offset = paginationModel.page * paginationModel.pageSize;

    // RTK Query
    const { data, isLoading, refetch } = useGetDistributorCentersQuery({
        limit,
        offset,
        search,
    });
    const [deleteDC] = useDeleteDistributorCenterMutation();

    // Para abrir/cerrar el dialog
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
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    async function handleDelete(id: number) {
        if (!confirm("¿Está seguro de eliminar este centro de distribución?")) return;
        try {
            await deleteDC(id).unwrap();
            toast.success("Eliminado exitosamente");
        } catch (err) {
            toast.error("Error al eliminar");
        }
    }

    useEffect(() => {
        refetch();
    }, [search, paginationModel]);

    const columns: GridColDef<DistributorCenter>[] = [
        {
            field: "name",
            headerName: "Nombre",
            flex: 1.2,
            minWidth: 200,
            renderCell: (params: GridRenderCellParams<DistributorCenter>) => {
                const row = params.row;
                const flagCode = row.data_country?.flag?.toLowerCase();
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                            src={flagCode ? `https://flagcdn.com/w80/${flagCode}.png` : undefined}
                            alt={row.data_country?.name || ''}
                            sx={{ width: 32, height: 32 }}
                        >
                            {!flagCode && (row.name?.[0] || '?')}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {row.location_distributor_center_code || ''}
                            </Typography>
                        </Box>
                    </Box>
                );
            },
        },
        {
            field: "direction",
            headerName: "Dirección",
            flex: 1,
            minWidth: 200,
        },
        {
            field: "location_distributor_center_code",
            headerName: "Código Localidad",
            flex: 0.8,
            minWidth: 150,
        },
        {
            field: "data_country",
            headerName: "País",
            flex: 0.8,
            minWidth: 150,
            renderCell: (params: GridRenderCellParams<DistributorCenter>) => {
                const row = params.row;
                if (!row.data_country) return null;
                return (
                    <Chip
                        sx={{ cursor: "default" }}
                        label={row.data_country.name}
                        size="small"
                        avatar={
                            <Avatar
                                src={`https://flagcdn.com/w80/${row.data_country.flag.toLowerCase()}.png`}
                                alt={row.data_country.flag}
                            />
                        }
                    />
                );
            },
        },
        {
            field: "actions",
            headerName: "Acciones",
            width: 100,
            sortable: false,
            renderCell: (params) => {
                const row = params.row;
                return (
                    <Box>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenEdit(row); }}>
                            <EditTwoToneIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}>
                            <DeleteTwoToneIcon fontSize="small" />
                        </IconButton>
                    </Box>
                );
            },
        },
    ];

    // Extraer data
    const totalCount = data?.count || 0;
    const rows = data?.results || [];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={400}>
                        Centros de Distribución
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Gestione los centros de distribución, sus turnos, camiones y bahías
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                >
                    Nuevo Centro
                </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
                <strong>Centros de Distribución:</strong> Cada centro tiene sus propios camiones, bahías y turnos configurados. Haga clic en una fila para ver el detalle completo.
            </Alert>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <TextField
                    placeholder="Buscar por nombre o código..."
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ width: 350 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            <Card>
                <DataGrid
                    {...tableBase}
                    rows={rows}
                    columns={columns}
                    rowCount={totalCount}
                    loading={isLoading}
                    paginationMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 25, 50]}
                    getRowId={(row) => row.id}
                    disableRowSelectionOnClick
                    onRowClick={(params) => navigate(`/maintenance/distributor-center/${params.row.id}`)}
                    sx={{
                        cursor: 'pointer',
                        border: 0,
                    }}
                />
            </Card>

            {/* Dialog para crear/editar */}
            {openDialog && (
                <DistributorCenterDialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    initialData={selectedDC}
                />
            )}
        </Box>
    );
}
