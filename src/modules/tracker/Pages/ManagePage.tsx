import {
  Button,
  Container,
  Divider,
  Grid,
  Typography,
  IconButton,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { DataGrid, GridColDef, esES } from "@mui/x-data-grid";
import {
  Tracker,
  TrackerQueryParams,
  TrackerType,
} from "../../../interfaces/tracking";
import FilterListTwoToneIcon from "@mui/icons-material/FilterListTwoTone";
import { format } from "date-fns/esm";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useLocation, useNavigate } from "react-router-dom";
import { FilterManage, FormFilterTrack } from "../components/FilterManage";
import { useGetTrackerQuery } from "../../../store/seguimiento/trackerApi";
import { useAppSelector } from "../../../store";
import { setManageQueryParams } from "../../../store/ui/uiSlice";
import { useAppDispatch } from "../../../store/store";
import {
  chanceStatusTracking,
} from "../../../store/seguimiento/trackerThunk";
import { EditNoteOutlined } from "@mui/icons-material";
import ExportManageMenu from "../components/ExportManageMenu";
import { optionsTypeTracker } from "../../../utils/common";

const tableBase = {
  localeText: esES.components.MuiDataGrid.defaultProps.localeText,
  className: "base__table",
  columnHeaderHeight: 35,
  style: { height: "60vh", width: "100%", cursor: "pointer" },
  pageSizeOptions: [15, 20, 50],
  disableColumnFilter: true,
  disableColumnMenu: true,
};

export const ManagePage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { manageQueryParams } = useAppSelector((state) => state.ui);

  const statusQueryParam = queryParams.get("status");
  const statusManageQueryParams = manageQueryParams.status;

  const handleEditState = (id: number) => {
    dispatch(
      chanceStatusTracking("EDITED", id, () =>
        navigate("/tracker/check/?id=" + id)
      )
    );
  };

  const [query, setquery] = useState<TrackerQueryParams>(() => {
    const onlyMyTreckers =
      manageQueryParams.onlyMyTreckers !== undefined
        ? manageQueryParams.onlyMyTreckers
        : user?.list_groups.includes("SUPERVISOR");
    let userId: number[] | undefined;
    if (onlyMyTreckers) {
      userId = user !== null && user.id ? [+user.id] : undefined;
    }
    return {
      limit: parseInt(
        queryParams.get("limit") || manageQueryParams.limit.toString()
      ),
      offset: parseInt(
        queryParams.get("offset") || manageQueryParams.offset.toString()
      ),
      distributor_center: user?.centro_distribucion
        ? [user.centro_distribucion]
        : manageQueryParams.distributor_center,
      search: queryParams.get("search") || manageQueryParams.search,
      trailer:
        queryParams.getAll("trailer").length > 0
          ? queryParams.getAll("trailer").map((trailer) => parseInt(trailer))
          : manageQueryParams.trailer,
      transporter:
        queryParams.getAll("transporter").length > 0
          ? queryParams
              .getAll("transporter")
              .map((transporter) => parseInt(transporter))
          : manageQueryParams.transporter,
      date_after: manageQueryParams.date_after,
      date_before: manageQueryParams.date_before,
      status:
        statusQueryParam === "COMPLETE" ||
        statusManageQueryParams === "COMPLETE"
          ? "COMPLETE"
          : statusQueryParam === "PENDING" ||
            statusManageQueryParams === "PENDING"
          ? "PENDING"
          : undefined,
      user: userId,
      onlyMyTreckers: onlyMyTreckers,
      type: manageQueryParams.type,
    };
  });
  const [paginationModel, setPaginationModel] = useState<{
    pageSize: number;
    page: number;
  }>({
    pageSize: query.limit,
    page: query.offset,
  });

  useEffect(() => {
    setquery({
      ...query,
      limit: paginationModel.pageSize,
      offset: paginationModel.page * paginationModel.pageSize,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel]);

  const { data, isLoading, isFetching, refetch } = useGetTrackerQuery(query);

  const columns: GridColDef<Tracker>[] = [
    {
      field: "id",
      headerName: "Tracking",
      flex: 1,
      width: 140,
      minWidth: 140,
      renderCell: (params) => {
        return (
          <Typography variant="body2">
            TRK-{params.value.toString().padStart(10, "0")}
          </Typography>
        );
      },
    },
    {
      field: "type",
      headerName: "Tipo",
      flex: 1,
      width: 140,
      minWidth: 140,
      renderCell: (params) => {
        const option = params.value as TrackerType;
        return (
          <Typography variant="body2">{optionsTypeTracker[option]}</Typography>
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
      field: "tariler_data",
      headerName: "Trailer",
      flex: 0,
      width: 80,
      renderCell: (params) => {
        return <Typography variant="body2">{params.value.code}</Typography>;
      },
    },
    {
      field: "input_document_number",
      headerName: "Tranferencia de entrada",
      flex: 1,
      width: 180,
      minWidth: 180,
      renderCell: (params) => {
        return (
          <Typography variant="body2">
            {params.value ? params.value : "-"}
          </Typography>
        );
      },
    },
    {
      field: "invoice_number",
      headerName: "No. Factura",
      flex: 1,
      width: 130,
      minWidth: 130,
      renderCell: (params) => {
        return (
          <Typography variant="body2">
            {params.value ? params.value : "-"}
          </Typography>
        );
      },
    },

    {
      field: "transfer_number",
      headerName: "Traslado 5001",
      flex: 1,
      width: 130,
      minWidth: 130,
      renderCell: (params) => {
        return (
          <Typography variant="body2">
            {params.value ? params.value : "-"}
          </Typography>
        );
      },
    },
    {
      field: "output_document_number",
      headerName: "Tranferencia de salida",
      flex: 1,
      width: 180,
      minWidth: 180,
      renderCell: (params) => {
        return (
          <Typography variant="body2">
            {params.value ? params.value : "-"}
          </Typography>
        );
      },
    },
    {
      field: "accounted",
      headerName: "Contabilizado",
      flex: 1,
      width: 120,
      minWidth: 120,
      renderCell: (params) => {
        return (
          <Typography variant="body2">
            {params.value ? params.value : "-"}
          </Typography>
        );
      },
    },
    {
      field: "status",
      headerName: "Estado",
      flex: 1,
      width: 120,
      minWidth: 120,
      renderCell: (params) => {
        return (
          <Chip
            label={
              params.value == "COMPLETE"
                ? "Completado"
                : params.value == "PENDING"
                ? "Pendiente"
                : "En atención"
            }
            variant="outlined"
            color={
              params.value == "COMPLETE"
                ? "success"
                : params.value == "PENDING"
                ? "warning"
                : "info"
            }
          />
        );
      },
    },
    {
      field: "created_at",
      headerName: "Registrado el",
      flex: 1,
      width: 120,
      minWidth: 120,
      renderCell: (params) => {
        return (
          <Typography variant="body2">
            {format(new Date(params.value), "dd/MM/yyyy")}
          </Typography>
        );
      },
    },
    {
      field: "completed_date",
      headerName: "Compleado el",
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
      field: "ver",
      headerName: "Acciones",
      flex: 0,
      width: 80,
      renderCell: (params) => {
        return (
          <>
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate("/tracker/detail/" + params.row.id)}
            >
              <ArrowForwardIcon />
            </IconButton>
            {params.row.status === "PENDING" &&
              user != null &&
              params.row.user === +user.id && (
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleEditState(params.row.id)}
                >
                  <EditNoteOutlined />
                </IconButton>
              )}
          </>
        );
      },
    },
  ];

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleFilter = (data: FormFilterTrack) => {
    const userId = user && data.onlyMyTreckers ? [+user.id] : undefined;
    const queryProcess: TrackerQueryParams = {
      ...query,
      distributor_center: data.distribution_center ? [data.distribution_center]: undefined,
      search: data.search,
      trailer: data.trailer ? [data.trailer] : undefined,
      transporter: data.transporter ? [data.transporter] : undefined,
      filter_date: data.date_range,
      date_after: data.date_after,
      date_before: data.date_before,
      status: data.status,
      user: userId,
      id: data.id ? data.id : undefined,
      onlyMyTreckers: data.onlyMyTreckers,
      type: data.type,
    };
    setquery(queryProcess);
    dispatch(setManageQueryParams(queryProcess));
  };

  const [openFilter, setopenFilter] = useState(false);
  return (
    <>
      <FilterManage
        open={openFilter}
        handleClose={() => setopenFilter(false)}
        handleFilter={handleFilter}
      />
      <Container maxWidth="xl" sx={{ marginTop: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" component="h1" fontWeight={400}>
              T1 - Gestión
            </Typography>
            <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" component="h2" fontWeight={400}>
              A continuación se muestra el listado de los tracking completados
              registrados en el sistema, para ver el detalle de cada uno de
              ellos, haga click en el botón ver o presione doble click sobre el
              registro.
            </Typography>
          </Grid>
          <Grid item xs={12} display="flex" justifyContent="flex-end">
            <Button
              variant="outlined"
              color="secondary"
              sx={{ marginRight: 1 }}
              endIcon={<FilterListTwoToneIcon />}
              onClick={() => setopenFilter(true)}
            >
              Filtrar
            </Button>
            <ExportManageMenu
              disabled={(data?.count || 0) <= 0 || isLoading || isFetching}
              query={query}
              t1Count={data?.count || 0}
            />
          </Grid>
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
                navigate(`/tracker/detail/${params.id}`)
              }
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
