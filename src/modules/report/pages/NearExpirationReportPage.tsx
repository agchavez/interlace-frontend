import { Box, Button, Chip, Container, Divider, Grid, IconButton, Typography } from "@mui/material";
import { NearExpirationQueryParams, Product } from "../../../interfaces/tracking";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../store/store";
import { useGetNearExpirationProductsQuery } from "../../../store/seguimiento/trackerApi";
import { format } from "date-fns";
import { differenceInDays, parseISO } from "date-fns";
import FilterListTwoToneIcon from "@mui/icons-material/FilterListTwoTone";
import NearExpirationTable, {
  NearExpirationProduct,
} from "../components/NearExpirationTable";
import { ExportReportNearExpiration } from "../components/ExportReportNearExpiration";
import {
  FilterNearExpiration,
  FormFilterNearExpiration,
} from "../components/FilterNearExpiration";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

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

  const [query, setquery] = useState<NearExpirationQueryParams>({
    limit: 10,
    offset: 0,
    distributor_center: user?.centro_distribucion || undefined,
    days: 60,
    productos: []
  });

  const {
    data: nearExpirationPallets,
    isLoading,
    isFetching,
    refetch,
  } = useGetNearExpirationProductsQuery(query);

  const handleFilter = (data: FormFilterNearExpiration) => {
    setquery((query) => {
      const newQuery = {
        ...query,
        distributor_center: data.distribution_center,
        productos: data.productos,
        days: data.days === null ? undefined : data.days,
      };
      return newQuery;
    });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

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
        distributorCenter: r.distributor_center,
        productName: r.product_name,
        sap_code: r.sap_code,
        registeredDates: r.expiration_list.length,
        total: r.expiration_list
          .map((ex) => ex.available_quantity)
          .reduce((p, c) => p + c, 0),
        history: r.expiration_list.map((elr) => ({
          expirationDate: format(parseISO(elr.expiration_date.split("T")[0]), "dd/MM/yyyy"),
          quantity: elr.quantity,
          trackerId: elr.tracker_id,
          available_quantity: elr.available_quantity,
          daysExpiration: differenceInDays(
            parseISO(elr.expiration_date),
            new Date()
          ),
        })),
      };
    });

    const handleClickDeleteProductFilter = (product: Product)=>{
        const productos = query.productos
        const result = productos.filter(producto => producto.sap_code !== product.sap_code)
        const queryProcess: NearExpirationQueryParams = {
        ...query,
        productos: result,
        };
        queryProcess.product = undefined
        setquery(queryProcess);
    }

  return (
    <>
      { 
        <FilterNearExpiration
        open={openFilter}
        handleClose={() => setopenFilter(false)}
        handleFilter={handleFilter}
        query={query}
      />}
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
                  RISKS - STOCK AGE INDEX
                </Typography>
                <Typography variant="body1" component="p" fontWeight={200}>
                  Alertas de Productos Proximos a Vencer
                </Typography>
              </div>
              <div>
                <Typography variant="body1" component="p" fontWeight={200}>
                  <b>Fecha:</b> {format(new Date(), "dd/MM/yyyy")}
                </Typography>
                <Typography variant="body1" component="p" fontWeight={200}>
                  {user?.centro_distribucion_name}
                </Typography>
              </div>
            </div>
            <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
          </Grid>
          <Grid item xs={12} md={4} lg={6} xl={8}>
            <Typography variant="body1" component="p" fontWeight={200}>
              Lista de productos por vencer dentro de los próximos {query.days}{" "}
              días.
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
          <Grid container spacing={1}>
            {
              query.productos.length > 0 &&
              <Grid item>
                  <Box sx={{borderStyle: "dashed", borderRadius:3, borderWidth: 1}}>
                      <Grid container alignContent="center" alignItems="center" p={0.3} spacing={1}>
                          <Grid item>
                              <Typography>
                                  Producto:
                              </Typography>
                          </Grid>
                          {
                              query.productos.map(product =>{
                                return <Grid item key={product.sap_code}>
                                    <Chip
                                        label={product.sap_code}
                                        onDelete={() => handleClickDeleteProductFilter(product)}
                                        variant="outlined"
                                        color="secondary"
                                        deleteIcon={
                                            <IconButton sx={{m:0}}>
                                                <HighlightOffIcon />
                                            </IconButton>
                                        }
                                        />
                                  </Grid>
                              })
                          }
                      </Grid>
                  </Box>
              </Grid>
            }
          </Grid>
          </Grid>
          <Grid item xs={12}>
            <NearExpirationTable
              rows={results || []}
              count={nearExpirationPallets?.count || 0}
              paginationModel={paginationModel}
              setPaginationModel={setPaginationModel}
              loading={isLoading || isFetching}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default NearExpirationReportPage;
