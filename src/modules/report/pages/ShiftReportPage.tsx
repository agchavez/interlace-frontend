
import { Button, Container, Divider, Grid, IconButton, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TrackerProductDetail, TrackerProductDetailQueryParams } from '../../../interfaces/tracking';
import { tableBase } from '../../ui/index';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../../store/store';
import { useGetTrackerPalletsQuery } from '../../../store/seguimiento/trackerApi';
import { format, parseISO } from 'date-fns';
import { ExportReportShift } from '../components/ExportReportShift';
import { FilterShiftManage, FormFilterShiftManage } from '../components/FilterShiftManage';
import FilterListTwoToneIcon from '@mui/icons-material/FilterListTwoTone';
import { toast } from 'sonner';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
export const ShiftReportPage = () => {
    const user = useAppSelector((state) => state.auth.user);
    const navigate = useNavigate();

    const columns: GridColDef<TrackerProductDetail>[] = [
        {
            field: "id",
            headerName: "Tracking",
            flex: 1,
            width: 140,
            minWidth: 140,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        TRK-{params.row.tracker_id?.toString().padStart(5, "0")}
                    </Typography>
                );
            },
        },
        {
            field: "shift",
            headerName: "Turno",
            flex: 0,
            width: 80,
            minWidth: 80,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? params.value : "-"}
                    </Typography>
                );
            }

        },
        {
            field: "product_sap_code",
            headerName: "Codigo",
            flex: 1,
            width: 80,
            minWidth: 80,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? params.value : "-"}
                    </Typography>
                );
            }
        },
        {
            field: "product_name",
            headerName: "Producto",
            flex: 1,
            width: 400,
            minWidth: 400,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? params.value : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "quantity",
            headerName: "Pallets",
            flex: 0,
            width: 150,
            minWidth: 150,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? params.value : "-"}
                    </Typography>
                );
            },
        },

        {
            field: "expiration_date",
            headerName: "Fecha de vencimiento",
            flex: 0,
            width: 200,
            minWidth: 200,
            renderCell: (params) => {
                if (!params.row.expiration_date) {
                    return (
                        <Typography variant="body2">
                            -
                        </Typography>
                    );
                }
                const datIso = parseISO(params.row.expiration_date.split("T")[0]);
                return (
                    <Typography variant="body2">
                        {format(new Date(datIso), "dd/MM/yyyy")}
                    </Typography>
                );
            },
        },
        {
            field: "actions",
            headerName: "Acciones",
            flex: 0,
            width: 80,
            minWidth: 80,
            renderCell: (params) => {
                return (
                    <IconButton size="small" color="primary" aria-label="add to shopping cart" onClick={() => navigate('/tracker/detail/' + params.row.tracker_id)}>
                        <ArrowForwardIcon />
                    </IconButton>
                );
            }

        }

    ];


    const getTurnoFromCurrentTime = () => {
        const now = new Date();
        const currentHour = now.getHours();

        if (currentHour >= 6 && currentHour < 14) {
            return 'A';
        } else if (currentHour >= 14 && currentHour < 20) {
            return 'B';
        } else {
            return 'C';
        }
    };

    // const getTurnoTimeRange = () => {
    //     const turno = getTurnoFromCurrentTime();
    //     const now = new Date();
    //     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    //     const endOfToday = new Date(today);
    //     const startOfToday = new Date(today);
    //     const horaActual = now.getHours();
    //     switch (turno) {
    //         case 'A':
    //             return {
    //                 start: new Date(today.setHours(6, 0, 0, 0)),
    //                 end: new Date(today.setHours(14, 0, 0, 0))
    //             };
    //         case 'B':
    //             return {
    //                 start: new Date(today.setHours(14, 0, 0, 0)),
    //                 end: new Date(today.setHours(20, 30, 0, 0))
    //             };
    //         case 'C':

    //             if (horaActual >= 20) {
    //                 endOfToday.setDate(endOfToday.getDate() + 1);
    //                 endOfToday.setHours(6, 0, 0, 0);
    //                 return {
    //                     start: new Date(today.setHours(20, 30, 0, 0)),
    //                     end: endOfToday
    //                 };
    //             } else {
    //                 // si es menor entonces el rango es del dia anterior a las 20:30 hasta las 6:00 del dia actual
    //                 startOfToday.setDate(startOfToday.getDate() - 1);
    //                 startOfToday.setHours(20, 30, 0, 0);
    //                 return {
    //                     start: startOfToday,
    //                     end: new Date(today.setHours(6, 0, 0, 0))
    //                 };
    //             }
    //         default:
    //             return null;
    //     }
    // };
    //const turnoTimeRange = getTurnoTimeRange();

    const [query, setquery] = useState<TrackerProductDetailQueryParams>({
        limit: 15,
        offset: 0,
        ordering: "-created_at",
        tracker_detail__tracker__distributor_center: user?.centro_distribucion || undefined,
    });

    const {
        data: trackerPallets,
        isLoading,
        isFetching,
        refetch
    } = useGetTrackerPalletsQuery(query);

    const handleFilter = (data: FormFilterShiftManage) => {
        const dateStart = data.date_after ? format(new Date(data.date_after), "yyyy-MM-dd") : undefined;
        const dateEnd = data.date_before ? format(new Date(data.date_before), "yyyy-MM-dd") : undefined;
        if (dateStart && dateEnd && dateStart > dateEnd) {
            toast.error("La fecha de inicio no puede ser mayor a la fecha final");
            return;
        }
        setquery((query) => ({
            ...query,
            created_at__gte: dateStart,
            created_at__lte: dateEnd,
            tracker_detail__tracker__distributor_center: data.distribution_center,
            shift: data.shift,
            expiration_date: data.expiration_date ? format(new Date(data.expiration_date), "yyyy-MM-dd") : undefined,
            tracker_detail__product: data.product ? data.product : undefined,
        }));

    };

    const [openFilter, setopenFilter] = useState(false);

    const [paginationModel, setPaginationModel] = useState<{
        pageSize: number;
        page: number;
    }>({
        pageSize: 15,
        page: 0,
    });

    useEffect(() => {
        refetch();
    }, [query, refetch]);

    useEffect(() => {
        setquery((query) => ({
            ...query,
            limit: paginationModel.pageSize,
            offset: paginationModel.page * paginationModel.pageSize,
        }));
    }, [paginationModel]);
    return (
        <>
            <FilterShiftManage
                open={openFilter}
                handleClose={() => setopenFilter(false)}
                handleFilter={handleFilter}
            />
            <Container maxWidth="xl" sx={{ marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                <Typography variant="h5" component="h1" fontWeight={400}>
                                    Reporte productos
                                </Typography>
                                <Typography variant="body1" component="p" fontWeight={200}>
                                    {user?.centro_distribucion_name}
                                </Typography>
                            </div>
                            <div>
                                <Typography variant="body1" component="p" fontWeight={200}>
                                    <b>Fecha:</b> {format(new Date(), "dd/MM/yyyy")}
                                </Typography>
                            </div>
                        </div>
                        <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                    </Grid>
                    <Grid item xs={12} md={4} lg={6} xl={8}>
                        <Typography variant="body1" component="p" fontWeight={200}>
                            Lista de productos registrados.
                        </Typography>

                    </Grid>
                    <Grid item xs={12} md={4} lg={3} xl={2}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            sx={{ marginRight: 1 }}
                            fullWidth
                            endIcon={<FilterListTwoToneIcon />}
                            onClick={() => setopenFilter(true)}
                        >
                            Filtrar
                        </Button>
                    </Grid>
                    <Grid item xs={12} md={4} lg={3} xl={2}>
                        <ExportReportShift
                            count={trackerPallets?.count || 0}
                            query={query}
                            disabled={isLoading || isFetching || !trackerPallets?.count || trackerPallets?.count === 0}
                            turno={getTurnoFromCurrentTime()}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <DataGrid
                            {...tableBase}
                            columns={columns}
                            rows={trackerPallets?.results || []}
                            paginationMode="server"
                            rowCount={trackerPallets?.count || 0}
                            pagination
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


export default ShiftReportPage;