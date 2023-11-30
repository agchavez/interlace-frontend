import {
  Button,
  Container,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  TrackerQueryParams,
} from "../../../interfaces/tracking";
import FilterListTwoToneIcon from "@mui/icons-material/FilterListTwoTone";
import { useLocation } from "react-router-dom";
import { FilterManage, FormFilterTrack } from "../components/FilterManage";
import { useGetTrackerQuery } from "../../../store/seguimiento/trackerApi";
import { useAppSelector } from "../../../store";
import { setManageQueryParams } from "../../../store/ui/uiSlice";
import { useAppDispatch } from "../../../store/store";
import ExportManageMenu from "../components/ExportManageMenu";
import { TabsGridManage } from '../components/TabsGridManage';



export const ManagePage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { manageQueryParams } = useAppSelector((state) => state.ui);

  const statusQueryParam = queryParams.get("status");
  const statusManageQueryParams = manageQueryParams.status;


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
      type: 'LOCAL'
    };
  });
  
  const { data, isLoading, isFetching, refetch } = useGetTrackerQuery(query);
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleFilter = (data: FormFilterTrack) => {
    const userId = user && data.onlyMyTreckers ? [+user.id] : undefined;
    const queryProcess: TrackerQueryParams = {
      ...query,
      distributor_center: data.distribution_center ? [data.distribution_center] : undefined,
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
      shift: data.shift,
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
          <TabsGridManage
            data={data?.results || []}
            count={data?.count || 0}
            loading={isLoading || isFetching}
            query={query}
            setquery={setquery}
          />
        </Grid>
      </Container>
    </>
  );
};

