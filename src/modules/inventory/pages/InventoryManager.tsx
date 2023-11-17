import { Button, Chip, Container, Divider, Grid, Typography } from "@mui/material"
import FilterListTwoToneIcon from '@mui/icons-material/FilterListTwoTone';
import PostAddTwoToneIcon from '@mui/icons-material/PostAddTwoTone';
import BookmarkAddTwoToneIcon from '@mui/icons-material/BookmarkAddTwoTone';
import BookmarkRemoveTwoToneIcon from '@mui/icons-material/BookmarkRemoveTwoTone';
import CachedTwoToneIcon from '@mui/icons-material/CachedTwoTone';
import { useGetInventoryQuery } from "../../../store/inventory/api";
import { useState } from 'react';
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { InventarioMoviment } from "../../../interfaces/tracking";
import { tableBase } from '../../ui/index';
import { format } from "date-fns";
import { NewAdjustmentModal } from "../components/NewAdjustmentModal";

const getTypoMov = (value: string) => {
    switch (value) {
        case 'IN':
            return <Chip 
                label="Ingreso" 
                icon={<BookmarkAddTwoToneIcon />}
                color="success" 
                variant="outlined"
                size="small" />
        case 'OUT':
            return <Chip
                label="Salida"
                variant="outlined"
                icon={<BookmarkRemoveTwoToneIcon />}
                color="error"
                size="small" />
        default:
            return <Chip
                label="Reajuste"
                variant="outlined"
                icon={<CachedTwoToneIcon />}
                color="secondary"
                size="small" />

    }
}
const InventoryManager = () => {

    const [paginationModel, setPaginationModel] = useState<{
        pageSize: number;
        page: number;
    }>({
        pageSize: 10,
        page: 0,
    });

    const [query, setquery] = useState()
    const { data, isLoading, isFetching, refetch, } = useGetInventoryQuery(query);

    const columns: GridColDef<InventarioMoviment>[] = [
        { field: 'Tracking', headerName: 'Tracking', width: 100, renderCell: (params) => (
            <Typography variant="body2" component="h2" fontWeight={400}>
                TRK-{params.row.tracker.toString().padStart(5, '0')}
            </Typography>
        ) },
        { field: 'distributor_center_name', headerName: 'Centro de distribución', width: 170, minWidth: 170 },
        { field: 'product_name', headerName: 'Producto', width: 300, minWidth: 300 },
        { field: 'product_sap_code', headerName: 'Código', width: 100 },
        {
            field: 'movement_type', headerName: 'Tipo de movimiento', width: 200, renderCell: (params) => getTypoMov(params.value)
        },
        {
            field: 'initial_quantity', headerName: 'Cantidad inicial', width: 140, renderCell: (params) => (
                <Typography variant="body2" component="h2" fontWeight={400}>
                    {params.row.is_applied ? params.value : '--'}
                </Typography>
            )
        },
        { field: 'quantity', headerName: 'Movimiento', width: 100 },
        {
            field: 'final_quantity', headerName: 'Cantidad final', width: 140, renderCell: (params) => (
                <Typography variant="body2" component="h2" fontWeight={400}>
                    {params.row.is_applied ? params.value : '--'}
                </Typography>
            )
        },

        {
            field: 'module', headerName: 'Modulo', width: 200, renderCell: (params) => (
                <Typography variant="body2" component="h2" fontWeight={400}>
                    {params.value === 'ADMIN' ? 'ADMINISTRACIÓN' : params.value}
                </Typography>
            )
        },
        {
            field: 'origin_id', headerName: 'Registro', width: 200, renderCell: (params) => (
                <Typography variant="body2" component="h2" fontWeight={400}>
                    {params.row.module === 'T1' ? `TRK-${params.value.toString().padStart(5, '0')}` : params.value}
                </Typography>
            )
        },

        {
            field: 'created_at', headerName: 'Creado', width: 200, renderCell: (params) => (
                <Typography variant="body2" component="h2" fontWeight={400}>
                    {format(new Date(params.value as string), 'dd/MM/yyyy HH:mm')}
                </Typography>
            )
        },
        {
            field: 'applied_date', headerName: 'Aplicado el', width: 200
            , renderCell: (params) => (
                <Typography variant="body2" component="h2" fontWeight={400}>
                    {params.value ? format(new Date(params.value as string), 'dd/MM/yyyy HH:mm') : ''}
                </Typography>
            )
        },

        { field: 'user_name', headerName: 'Usuario', width: 200 },

    ];
    const [openAdd, setopenAdd] = useState(false)
    return (
        <>
        <NewAdjustmentModal isOpen={openAdd} onClose={() => setopenAdd(false)} refetch={refetch} />
            <Container maxWidth="xl" sx={{ marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h5" component="h1" fontWeight={400}>
                            Movimientos de inventario
                        </Typography>
                        <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2" component="h2" fontWeight={400}>
                            A continuación se muestra el listado de los movimientos de inventario registrados en el sistema, por centro de distribución.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} display="flex" justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            color="secondary"
                            sx={{ marginRight: 1 }}
                            endIcon={<FilterListTwoToneIcon />}
                        // onClick={() => setOpenFilter(true)}
                        >
                            Filtrar
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            sx={{ marginRight: 1 }}
                            endIcon={<PostAddTwoToneIcon />}
                            onClick={() => setopenAdd(true)}
                        >
                            Nuevo reajuste
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <DataGrid
                            {...tableBase}
                            columns={columns}
                            rows={data?.results || []}
                            paginationMode="server"
                            rowCount={data?.count || 0}
                            pagination
                            getRowHeight={() => 'auto'}
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            loading={isLoading || isFetching}
                        />  
                    </Grid>
                </Grid>
            </Container>
        </>
    )
}

export default InventoryManager