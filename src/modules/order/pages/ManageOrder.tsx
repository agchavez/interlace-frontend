import { Container, Grid, Typography, Divider, Button } from "@mui/material";
import FilterListTwoToneIcon from "@mui/icons-material/FilterListTwoTone";
import PostAddTwoToneIcon from "@mui/icons-material/PostAddTwoTone";
import { useNavigate } from "react-router-dom";
import OrderTable from "../components/OrderTable";
import { useEffect, useState } from "react";
import { OrderQueryParams } from "../../../interfaces/tracking";
import { reset, useGetOrderQuery } from "../../../store/order";
import { useAppDispatch } from "../../../store";
import { FilterOrder, FormFilterOrder } from "../components/FilterOrder";
import { setOrderQueryParams } from "../../../store/ui/uiSlice";

const ManageOrder = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch()
  const [openFilter, setOpenFilter] = useState(false)

  const [query, setquery] = useState<OrderQueryParams>({
    limit: 10,
    offset: 0,
    search: undefined,
  });

  const [paginationModel, setPaginationModel] = useState<{
    pageSize: number;
    page: number;
  }>({
    pageSize: 10,
    page: 0,
  });

  const { data, isLoading, isFetching, refetch } = useGetOrderQuery(query);

  useEffect(() => {
    refetch();
  }, [query]);
  useEffect(() => {
    setquery((query) => ({
      ...query,
      limit: paginationModel.pageSize,
      offset: paginationModel.page * paginationModel.pageSize,
    }));
  }, [paginationModel]);

  const handleClickNuevo = () => {
    dispatch(reset())
    navigate(`/order/register`)
  };

  const handleFilter = (data: FormFilterOrder) => {
    const queryOrder: OrderQueryParams = {
      ...query,
      distributor_center: data.distributor_center,
      id: data.id,
      location: data.location,
      status: data.status
    };
    setquery(queryOrder);
    dispatch(setOrderQueryParams(queryOrder));
  };

  return (
    <>
      <Container maxWidth="xl" sx={{ marginTop: 2 }}>
        <FilterOrder open={openFilter} handleFilter={handleFilter} handleClose={()=>setOpenFilter(false)}/>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" component="h1" fontWeight={400}>
              T1 - Pedidos
            </Typography>
            <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
          </Grid>
          <Grid item xs={12}> 
            <Typography variant="body2" component="h2" fontWeight={400}>
              A continuación se muestra el listado de los pedidos registrados en
              el sistema para el centro de distribución, para ver el detalle de
              cada uno de ellos, haga click en el botón ver o presione doble
              click sobre el registro.
            </Typography>
          </Grid>
          <Grid item xs={12} display="flex" justifyContent="flex-end">
            <Button
              variant="outlined"
              color="secondary"
              sx={{ marginRight: 1 }}
              endIcon={<FilterListTwoToneIcon />}
                onClick={() => setOpenFilter(true)}
            >
              Filtrar
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ marginRight: 1 }}
              endIcon={<PostAddTwoToneIcon />}
              onClick={handleClickNuevo}
            >
              Nuevo
            </Button>
          </Grid>
          <Grid item xs={12}>
            <OrderTable
              rows={data?.results || []}
              count={data?.count || 0}
              paginationModel={paginationModel}
              setPaginationModel={setPaginationModel}
              loading={isLoading || isFetching}
              refetch={refetch}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default ManageOrder;
