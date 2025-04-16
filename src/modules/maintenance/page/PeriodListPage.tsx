
import { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Divider,
    Button,
    IconButton,
    Box,
    Grid,
} from "@mui/material";
import {
    DataGrid,
    GridColDef,
    GridPaginationModel,
    GridRenderCellParams,
} from "@mui/x-data-grid";
import { useGetPeriodListQuery, useDeletePeriodMutation } from "../../../store/maintenance/maintenanceApi";
import { Period } from "../../../interfaces/maintenance";
import { tableBase } from "../../ui"; // tu config base de DataGrid
import { CustomSearch } from "../../ui/components/CustomSearch";
import AddIcon from "@mui/icons-material/Add";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import { toast } from "sonner";
import { PeriodDialog } from "../components/PeriodDialog";
import {PeriodMassUploadDialog} from "../components/PeriodMassUploadDialog.tsx";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {format} from "date-fns";

export function PeriodListPage() {
    const [search, setSearch] = useState("");
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: 10,
        page: 0,
    });
    const [openMassDialog, setOpenMassDialog] = useState(false);


    // Convert to limit/offset
    const limit = paginationModel.pageSize;
    const offset = paginationModel.page * paginationModel.pageSize;

    // RTK Query
    const { data, isLoading, refetch } = useGetPeriodListQuery({
        limit,
        offset,
        search,
    });
    const [deletePeriod] = useDeletePeriodMutation();

    // Dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);

    const handleOpenCreate = () => {
        setSelectedPeriod(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (period: Period) => {
        setSelectedPeriod(period);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    async function handleDelete(id: number) {
        if (!confirm("Are you sure to delete this period?")) return;
        try {
            await deletePeriod(id).unwrap();
            toast.success("Deleted successfully");
        } catch (err) {
            toast.error("Error deleting Period");
        }
    }

    // Efecto: cuando search o pagination cambian, llamamos refetch
    useEffect(() => {
        refetch();
    }, [search, paginationModel, refetch]);

    const columns: GridColDef<Period>[] = [
        {
            field: "label",
            headerName: "Tipo",
            flex: 1,
            minWidth: 100,
        },
        {
            field: "initialDate",
            headerName: "Fecha de inicio",
            flex: 1,
            minWidth: 120,
            renderCell: (params: GridRenderCellParams<Period>) => {
                const date = new Date(params.value as string);
                return format(date, "dd/MM/yyyy");
            }
        },
        {
            field: "distributor_name",
            headerName: "Centro de distribución",
            flex: 1,
            minWidth: 100,
            renderCell: (params: GridRenderCellParams<Period>) => {
                return params.row.distributor_center_data.location_distributor_center_code + params.row.distributor_center_data.name;
            }
        },
        {
            field: "product_name",
            headerName: "Producto",
            flex: 1,
            minWidth: 100,
        },
        {
            field: "actions",
            headerName: "Acciones",
            width: 100,
            sortable: false,
            renderCell: (params: GridRenderCellParams<Period>) => {
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

    const totalCount = data?.count || 0;
    const rows = data?.results || [];

    return (
        <Container maxWidth="xl" sx={{ mt: 2 }}>
            <Typography variant="h5" mb={1}>
                Period List
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={8}>
                    <CustomSearch
                        placeholder="Buscar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onClick={() => console.log("search click")}
                    />
                </Grid>
                <Grid item xs={12} md={2}>
                    <Button
                        startIcon={<AddIcon />}
                        fullWidth
                        variant="outlined"
                        onClick={handleOpenCreate}
                    >
                        Nuevo Período
                    </Button>
                </Grid>
                <Grid item xs={12} md={2}>
                    {/* Botón para abrir el diálogo de carga masiva */}
                    <Button
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                        variant="outlined"
                        onClick={() => setOpenMassDialog(true)}
                    >
                        Carga Masiva
                    </Button>
                </Grid>
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
                    onCellDoubleClick={(params) => handleOpenEdit(params.row as Period)}
                />
            </div>

            {openDialog && (
                <PeriodDialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    initialData={selectedPeriod}
                />
            )}
            {openMassDialog && (
                <PeriodMassUploadDialog
                    open={openMassDialog}
                    onClose={() => setOpenMassDialog(false)}
                />
            )}
        </Container>
    );
}
