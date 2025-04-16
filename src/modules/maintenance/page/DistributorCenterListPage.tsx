// DistributorCenterListPage.tsx

import { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Divider,
    Button,
    IconButton,
    Chip,
    Box, Avatar, Grid,
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
import { DistributorCenter } from "../../../interfaces/maintenance";
import {
    useDeleteDistributorCenterMutation,
    useGetDistributorCentersQuery
} from "../../../store/maintenance/maintenanceApi";
import {DistributorCenterDialog} from "../components/DistributorCenterDialog.tsx";
import {toast} from "sonner";
import {tableBase} from "../../ui";
import {CustomSearch} from "../../ui/components/CustomSearch.tsx";

export function DistributorCenterListPage() {
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
        if (!confirm("Are you sure to delete this distribution center?")) return;
        try {
            await deleteDC(id).unwrap();
            toast.success("Deleted successfully");
        } catch (err) {
            toast.error("Error deleting");
        }
    }

    useEffect(() => {
        refetch();
    }, [search, paginationModel]);

    const columns: GridColDef<DistributorCenter>[] = [
        {
            field: "name",
            headerName: "Nombre",
            flex: 1,
            minWidth: 150,
        },
        {
            field: "direction",
            headerName: "Dirección",
            flex: 1,
            minWidth: 200,
        },
        {
            field: "location_distributor_center_code",
            headerName: "Codigo localidad",
            flex: 1,
            minWidth: 200,
        },
        {
            field: "data_country",
            headerName: "Country",
            flex: 1,
            minWidth: 150,
            renderCell: (params: GridRenderCellParams<DistributorCenter>) => {
                const row = params.row;
                if (!row.data_country) return null;
                return (
                    <Chip
                        sx={{ cursor: "default" }}
                        label={row.data_country.name}
                        size={"small"}
                        avatar={
                            // <Box
                            //     component="img"
                            //     src={`https://flagcdn.com/w20/${row.data_country.flag.toLowerCase()}.png`}
                            //     srcSet={`https://flagcdn.com/w40/${row.data_country.flag.toLowerCase()}.png 2x`}
                            //     alt=""
                            //     sx={{ width: 20, height: 14, ml: 1 }}
                            // />
                            <Avatar
                                src={`https://flagcdn.com/w80/${row.data_country.flag.toLowerCase()}.png`}
                                alt={row.data_country.flag}
                                sizes={"small"}
                                />
                        }
                    />
                );
            },
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 100,
            sortable: false,
            renderCell: (params) => {
                const row = params.row;
                return (
                    <Box>
                        <IconButton size="small" onClick={() => handleOpenEdit(row)}>
                            <EditTwoToneIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(row.id)}>
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
        <Container maxWidth="xl" sx={{ mt: 2 }}>
            <Typography variant="h5" mb={1}>
                Distributor Centers
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
            {/* Search bar */}
            <Grid item xs={12} md={10}>
                <CustomSearch
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onClick={() => console.log('click')}
                />
            </Grid>
                <Grid item xs={12} md={2}>
                    <Button
                        startIcon={<AddIcon />}
                        fullWidth
                        variant={"outlined"}
                        onClick={()=>handleOpenCreate()}
                        >
                        Agregar
                    </Button>
                </Grid>

            <div style={{ height: 500, width: "100%" }}>
                <DataGrid
                    {...tableBase}
                    rows={rows}
                    columns={columns}
                    rowCount={totalCount}
                    loading={isLoading}
                    paginationMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[5, 10, 20]}
                    getRowId={(row) => row.id}
                    onCellDoubleClick={(params) => handleOpenEdit(params.row as DistributorCenter)}
                />
            </div>
        </Grid>
            {/* Dialog para crear/editar */}
            {openDialog && (
                <DistributorCenterDialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    initialData={selectedDC}
                />
            )}
        </Container>
    );
}
