import { useEffect, useState } from "react";
import { Container, Grid, Typography, Button, Divider, Chip, IconButton } from "@mui/material";
import FilterListTwoToneIcon from '@mui/icons-material/FilterListTwoTone';
import { DataGrid, GridCellParams, GridColDef } from "@mui/x-data-grid";
import { OutputT2, OutputT2QueryParams } from '../../../interfaces/trackingT2';
import { format, parseISO } from "date-fns";
import { tableBase } from '../../ui/index';
import { useNavigate } from "react-router-dom";
import { FormFilterT2, FilterPreSale } from '../components/FilterPreSale';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { setManagerT2QueryParams } from "../../../store/ui/uiSlice";
import { useGetT2TrackingQuery } from "../../../store/seguimiento/trackerApi";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChipFilterCategory from "../../ui/components/ChipFilter";

const ManagePreSalePage = () => {
    const [openFilter, setOpenFilter] = useState(false);
    const navigate = useNavigate();
    const { managerT2QueryParams } = useAppSelector((state) => state.ui);
    const {disctributionCenters} = useAppSelector(state => state.maintenance)
    const {user} = useAppSelector(state => state.auth)

    const dispatch = useAppDispatch();
    const handleFilter = (data: FormFilterT2) => {
        dispatch(setManagerT2QueryParams(data));
    }
    const [query, setquery] = useState<OutputT2QueryParams>({
        limit: 15,
        offset: 0,
        date_after: format(new Date(managerT2QueryParams.date_after), "yyyy-MM-dd"),
        date_before: format(new Date(managerT2QueryParams.date_before), "yyyy-MM-dd"),
        pre_sale_date: managerT2QueryParams.pre_sale_date? format(new Date(managerT2QueryParams.pre_sale_date), "yyyy-MM-dd") : undefined,
        status: managerT2QueryParams.status,
        distributor_center: managerT2QueryParams.distribution_center,
        id: managerT2QueryParams.id ? managerT2QueryParams.id : undefined,
        
    });
    const { data, isLoading, isFetching, refetch } = useGetT2TrackingQuery(query);

    useEffect(() => {
        setquery((prev) => {
            return {
                ...prev,
            date_after: !managerT2QueryParams.pre_sale_date ? format(new Date(managerT2QueryParams.date_after), "yyyy-MM-dd") : undefined,
            date_before: !managerT2QueryParams.pre_sale_date ? format(new Date(managerT2QueryParams.date_before), "yyyy-MM-dd") : undefined,
            status: managerT2QueryParams.status,
            distributor_center: managerT2QueryParams.distribution_center,
            id: managerT2QueryParams.id ? managerT2QueryParams.id : undefined,
            pre_sale_date: managerT2QueryParams.pre_sale_date? format(new Date(managerT2QueryParams.pre_sale_date), "yyyy-MM-dd") : undefined,
            };
        });
    }, [managerT2QueryParams]);

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);
    
    const columns: GridColDef<OutputT2>[] = [
        {
            field: "created_at",
            headerName: "Registro",
            flex: 1,
            width: 160,
            minWidth: 160,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? format(new Date(params.value), "dd/MM/yyyy HH:mm") : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "pre_sale_date",
            headerName: "Fecha de preventa",
            flex: 1,
            width: 160,
            minWidth: 160,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? format(new Date(parseISO(params.value)), "dd/MM/yyyy") : "-"}
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
                        T2OUT-{params.value.toString().padStart(1, "0")}
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
            field: "user_check_name",
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
                const data = params.row;
                return <Chip
                    sx={{ mt: 0.5 }}
                    label={
                        data?.status === "APPLIED"
                            ? "Completado"
                            : data?.status === "REJECTED"
                                ? "Rechazado"
                                : data?.status === "AUTHORIZED"
                                    ? "Autorizado"
                                    : "En revisión"
                    }
                    color={
                        data?.status === "APPLIED"
                            ? "success"
                            : data?.status === "REJECTED"
                                ? "error"
                                : "info"
                    }
                    size="medium"
                    variant="outlined"
                />

            },
        },
        {
            field: "count_details",
            headerName: "Cantidad de detalles",
            flex: 1,
            width: 170,
            minWidth: 170,
            renderCell: (params) => {
                return <Typography variant="body2">{params.value}</Typography>;
            }
        },
        {
            field: "ver",
            headerName: "Ver",
            flex: 0,
            width: 80,
            renderCell: (params) => {
                return (
                    <> 
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate("/tracker-t2/detail/" + params.row.id)}
                        >
                            <ArrowForwardIcon />
                        </IconButton>
                    </>
                );
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


    useEffect(() => {
        setquery((query) => ({
            ...query,
            limit: paginationModel.pageSize,
            offset: paginationModel.page * paginationModel.pageSize,
        }));
    }, [paginationModel]);


    return (
      <>
        {openFilter && <FilterPreSale
          open={openFilter}
          handleClose={() => setOpenFilter(false)}
          handleFilter={handleFilter}
        />}
        <Container maxWidth="xl" sx={{ marginTop: 2 }}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant="h5" component="h1" fontWeight={400}>
                T2 - Gestión
              </Typography>
              <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" component="h2" fontWeight={400}>
                A continuación se muestra el listado la informacion de las
                preventas cargadas en el sistema.
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
            {/* Inicio Chips para Filtros */}
            <Grid item xs={12}>
              <Grid container spacing={1}>
                {managerT2QueryParams.search.length > 0 && (
                  <ChipFilterCategory
                    label="Buscar: "
                    items={[
                      {
                        label: `TRK-${managerT2QueryParams.id?.toString().padStart(5, '0')}`,
                        id: "",
                        deleteAction: () => dispatch(setManagerT2QueryParams({...managerT2QueryParams, search: ""})),
                      },
                    ]}
                  />
                )}
                {managerT2QueryParams.id && (
                  <ChipFilterCategory
                    label="Tracking: "
                    items={[
                      {
                        label: managerT2QueryParams.id.toString(),
                        id: "",
                        deleteAction: () => dispatch(setManagerT2QueryParams({...managerT2QueryParams, id:null})),
                      },
                    ]}
                  />
                )}
                {(managerT2QueryParams.date_after || managerT2QueryParams.date_before) && (
                  <ChipFilterCategory
                    label="Fecha de Registro: "
                    items={[
                      {
                        label: `Desde: ${managerT2QueryParams.date_after ? format(new Date(managerT2QueryParams.date_after), "dd/MM/yyyy") : "-"}`,
                        id: "date_after",
                      },
                      {
                        label: `Hasta: ${managerT2QueryParams.date_before ? format(new Date(managerT2QueryParams.date_before), "dd/MM/yyyy") : "-"}`,
                        id: "date_before",
                      },
                    ]}
                  />
                )}
                {(managerT2QueryParams.status.length > 0) && (
                  <ChipFilterCategory
                    label="Estado: "
                    items={managerT2QueryParams.status.map(st => {
                        return {
                            label: StatusOptions[st],
                            id:st,
                            deleteAction: ()=>dispatch(setManagerT2QueryParams({...managerT2QueryParams, status: managerT2QueryParams.status.filter(stat => stat !== st)})),
                        }
                    })}
                  />
                )}
                {(managerT2QueryParams.distribution_center) && (
                  <ChipFilterCategory
                    label="Centro de Distribución: "
                    items={[
                        {
                            label: disctributionCenters.find(dc => dc.id === managerT2QueryParams.distribution_center)?.name || "",
                            id:"",
                            deleteAction: !user?.centro_distribucion? (()=>dispatch(setManagerT2QueryParams({...managerT2QueryParams, distribution_center: undefined}))): undefined
                        }
                    ]}
                  />
                )}
              </Grid>
            </Grid>
            {/* Fin Chips para Filtros */}
            <Grid item xs={12}>
              <DataGrid
                {...tableBase}
                columns={columns}
                rows={data?.results || []}
                paginationMode="server"
                rowCount={data?.count || 0}
                pagination
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                loading={isLoading || isFetching}
                onRowDoubleClick={(params) =>
                  navigate(`/tracker-t2/detail/${params.id}`)
                }
              />
            </Grid>
          </Grid>
        </Container>
      </>
    );
}

export default ManagePreSalePage;

const StatusOptions = {
    APPLIED: "Compleado",
    CREATED: "Pendiente",
    CHECKED: "Revisado",
    REJECTED: "Rechazado",
    AUTHORIZED: "Desautorizado",
}