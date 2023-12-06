import { useState } from "react";
import { Container, Grid, Typography, Button, Divider, Chip } from "@mui/material";
import FilterListTwoToneIcon from '@mui/icons-material/FilterListTwoTone';
import { DataGrid, GridCellParams, GridColDef } from "@mui/x-data-grid";
import { OutputT2 } from '../../../interfaces/trackingT2';
import { format } from "date-fns";
import { tableBase } from '../../ui/index';
import { useNavigate } from "react-router-dom";
import { FormFilterT2, FilterPreSale } from '../components/FilterPreSale';
import { useAppDispatch } from '../../../store/store';
import { setManagerT2QueryParams } from "../../../store/ui/uiSlice";

const ManagePreSalePage = () => {
    const [openFilter, setOpenFilter] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const handleFilter = (data: FormFilterT2) => {
        dispatch(setManagerT2QueryParams(data));
    }

    const columns: GridColDef<OutputT2>[] = [
        {
            field: "created_at",
            headerName: "Fecha",
            flex: 1,
            width: 120,
            minWidth: 120,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? format(new Date(params.value), "dd/MM/yyyy") : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "id",
            headerName: "Tracking",
            flex: 1,
            width: 140,
            minWidth: 140,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        TRK-{params.value.toString().padStart(5, "0")}
                    </Typography>
                );
            },
        },

        {
            field: "distributor_center_data",
            headerName: "Centro de distribución",
            flex: 1,
            width: 170,
            minWidth: 170,
            renderCell: (params) => {
                return <Typography variant="body2">{params.value.name}</Typography>;
            },
        },
        {
            field: "user_name",  
            headerName: "Usuario registro",
            flex: 1,
            width: 170,
            minWidth: 170,
            renderCell: (params) => {
                return <Typography variant="body2">{params.value}</Typography>;
            },
        },
        {
            field: "user_checker_name",
            headerName: "Usuario validador",
            flex: 1,
            width: 170,
            minWidth: 170,
            renderCell: (params) => {
                return <Typography variant="body2">{params.value}</Typography>;
            }

        },
        {
            field: "user_authorizer_name",
            headerName: "Usuario autorizador",
            flex: 1,
            width: 170,
            minWidth: 170,
            renderCell: (params) => {
                return <Typography variant="body2">{params.value}</Typography>;
            }
        },
        {
            field: "status",  
            headerName: "Estado",
            flex: 1,
            width: 170,
            minWidth: 170,
            renderCell: (params: GridCellParams<OutputT2>) => {
                return <Chip
                    label={params.row.status}
                    color={params.row.status === "CREATED" ? "warning" : 
                    params.row.status === "CHECKED" ? "info" : "success"}
                    size="small"
                    sx={{ textTransform: "capitalize" }}
                />;

            },
        },
    ];

    const [paginationModel, setPaginationModel] = useState<{
        pageSize: number;
        page: number;
    }>({
        pageSize: 15,
        page: 0,
    });

    

    return <>
        <FilterPreSale
            open={openFilter}
            handleClose={() => setOpenFilter(false)}
            handleFilter={handleFilter}
        />
        <Container maxWidth="xl" sx={{ marginTop: 2 }}>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <Typography variant="h5" component="h1" fontWeight={400}>
                        T2 - Gestión de preventa
                    </Typography>
                    <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body2" component="h2" fontWeight={400}>
                        A continuación se muestra el listado la informacion de las preventas cargadas en el sistema.
                    </Typography>
                </Grid>
                <Grid item xs={12} display="flex" justifyContent="flex-end">
                    <Button
                        variant="outlined"
                        color="secondary"
                        endIcon={<FilterListTwoToneIcon />}
                        onClick={() => setOpenFilter(true)}
                    >
                        Filtrar
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    
                <DataGrid
                    {...tableBase}
                    columns={columns}
                    rows={[]}
                    paginationMode="server"
                    rowCount={0}
                    pagination
                    getRowHeight={() => 'auto'}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    loading={false}
                    onRowDoubleClick={(params) =>
                        navigate(`/tracker/detail/${params.id}`)
                    }
                />
                </Grid>
            </Grid>
        </Container>
    </>
}

export default ManagePreSalePage;