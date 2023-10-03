
import { Container, Divider, Grid, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TrackerProductDetail, TrackerProductDetailQueryParams } from '../../../interfaces/tracking';
import { tableBase } from '../../ui/index';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../../store/store';
import { useGetTrackerPalletsQuery } from '../../../store/seguimiento/trackerApi';
import { format } from 'date-fns';
import { ExportReportShift } from '../components/ExportReportShift';
export const ShiftReportPage = () => {
    const user = useAppSelector((state) => state.auth.user);
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
                        TRK-{params.row.tracker_id.toString().padStart(5, "0")}
                    </Typography>
                );
            },
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
                return (
                    <Typography variant="body2">
                        {params.value ? params.value : "-"}
                    </Typography>
                );
            },
        },

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

    const getTurnoTimeRange = () => {
        const turno = getTurnoFromCurrentTime();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(today);
        switch (turno) {
            case 'A':
                return {
                    start: new Date(today.setHours(6, 0, 0, 0)),
                    end: new Date(today.setHours(14, 0, 0, 0))
                };
            case 'B':
                return {
                    start: new Date(today.setHours(14, 0, 0, 0)),
                    end: new Date(today.setHours(20, 30, 0, 0))
                };
            case 'C':
                endOfToday.setDate(endOfToday.getDate() + 1);
                endOfToday.setHours(6, 0, 0, 0);
                return {
                    start: new Date(today.setHours(20, 30, 0, 0)),
                    end: endOfToday
                };
            default:
                return null;
        }
    };
    const turnoTimeRange = getTurnoTimeRange();

    const [query, setquery] = useState<TrackerProductDetailQueryParams>({
        limit: 15,
        offset: 0,
        tracker_detail__tracker__user: user?.id,
        created_at__gte: turnoTimeRange?.start.toISOString(),
        created_at__lte: turnoTimeRange?.end.toISOString(),
    });

    const {
        data: trackerPallets,
        isLoading,
        isFetching,
        refetch
    } = useGetTrackerPalletsQuery(query);

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
            <Container maxWidth="xl" sx={{ marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                <Typography variant="h5" component="h1" fontWeight={400}>
                                    Reporte por turno
                                </Typography>
                                <Typography variant="body1" component="p" fontWeight={200}>
                                    {user?.centro_distribucion_name} - TURNO {getTurnoFromCurrentTime()}
                                </Typography>
                            </div>
                            <div>
                                <Typography variant="body1" component="p" fontWeight={200}>
                                    <b>Fecha:</b> {format(new Date(), "dd/MM/yyyy")}
                                </Typography>
                                <Typography variant="body1" component="p" fontWeight={200}>
                                    <b>Horario:</b> {turnoTimeRange ? format(turnoTimeRange.start, "HH:mm") : '-'} - {turnoTimeRange ? format(turnoTimeRange.end, "HH:mm") : '-'}
                                </Typography>
                            </div>
                        </div>
                        <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                    </Grid>
                    <Grid item xs={12} md={8} lg={9} xl={10}>
                        <Typography variant="body1" component="p" fontWeight={200}>
                           Lista de productos registrados.  
                        </Typography>

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