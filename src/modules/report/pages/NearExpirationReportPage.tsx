import { Button, Container, Divider, Grid, Typography } from "@mui/material";
import { TrackerProductDetailQueryParams } from "../../../interfaces/tracking";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../store/store";
import { useGetNearExpirationProductsQuery } from "../../../store/seguimiento/trackerApi";
import { format } from "date-fns";
import { differenceInDays, parseISO } from "date-fns";
import {
  FilterShiftManage,
  FormFilterShiftManage,
} from "../components/FilterShiftManage";
import FilterListTwoToneIcon from "@mui/icons-material/FilterListTwoTone";
import { toast } from "sonner";
import NearExpirationTable, {
  NearExpirationProduct,
} from "../components/NearExpirationTable";
import { ExportReportNearExpiration } from "../components/ExportReportNearExpiration";
export const NearExpirationReportPage = () => {
  const user = useAppSelector((state) => state.auth.user);

  const getTurnoFromCurrentTime = () => {
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour >= 6 && currentHour < 14) {
      return "A";
    } else if (currentHour >= 14 && currentHour < 20) {
      return "B";
    } else {
      return "C";
    }
  };

  const [query, setquery] = useState<TrackerProductDetailQueryParams>({
    limit: 15,
    offset: 0,
    ordering: "-created_at",
    tracker_detail__tracker__distributor_center:
      user?.centro_distribucion || undefined,
  });

  const {
    data: nearExpirationPallets,
    isLoading,
    isFetching,
    refetch,
  } = useGetNearExpirationProductsQuery(query);

  const handleFilter = (data: FormFilterShiftManage) => {
    const dateStart = data.date_after
      ? format(new Date(data.date_after), "yyyy-MM-dd")
      : undefined;
    const dateEnd = data.date_before
      ? format(new Date(data.date_before), "yyyy-MM-dd")
      : undefined;
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
      expiration_date: data.expiration_date
        ? format(new Date(data.expiration_date), "yyyy-MM-dd")
        : undefined,
      tracker_detail__product: data.product ? data.product : undefined,
    }));
  };

  const [openFilter, setopenFilter] = useState(false);

  const [paginationModel, setPaginationModel] = useState<{
    pageSize: number;
    page: number;
  }>({
    pageSize: 10,
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

  const results: NearExpirationProduct[] | undefined =
    nearExpirationPallets?.results.map((r) => {
      return {
        productName: r.product_name,
        sap_code: r.sap_code,
        registeredDates: r.expiration_list.length,
        total: r.expiration_list
          .map((ex) => ex.total_quantity)
          .reduce((p, c) => p + c, 0),
        history: r.expiration_list.map((elr) => ({
          expirationDate: format(new Date(elr.expiration_date), "dd-MM-yyyy"),
          quantity: elr.total_quantity,
          daysExpiration: differenceInDays(
            parseISO(elr.expiration_date),
            new Date()
          ),
        })),
      };
    });

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
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography variant="h5" component="h1" fontWeight={400}>
                  Productos por Vencer
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
            <ExportReportNearExpiration
              count={nearExpirationPallets?.count || 0}
              query={query}
              disabled={
                isLoading ||
                isFetching ||
                !nearExpirationPallets?.count ||
                nearExpirationPallets?.count === 0
              }
              turno={getTurnoFromCurrentTime()}
            />
          </Grid>
          <Grid item xs={12}>
            <NearExpirationTable
              rows={results || []}
              count={nearExpirationPallets?.count || 0}
              paginationModel={paginationModel}
              setPaginationModel={setPaginationModel}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default NearExpirationReportPage;
