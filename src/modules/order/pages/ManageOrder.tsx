import {
  Container,
  Grid,
  Typography,
  Divider,
  Button,
  MenuItem,
} from "@mui/material";
import FilterListTwoToneIcon from "@mui/icons-material/FilterListTwoTone";
import PostAddTwoToneIcon from "@mui/icons-material/PostAddTwoTone";
import { useNavigate } from "react-router-dom";
import OrderTable from "../components/OrderTable";
import { useEffect, useState } from "react";
import { OrderQueryParams } from "../../../interfaces/tracking";
import { reset, useGetOrderQuery } from "../../../store/order";
import { useAppDispatch, useAppSelector } from "../../../store";
import { FilterOrder, FormFilterOrder } from "../components/FilterOrder";
import { setOrderQueryParams } from "../../../store/ui/uiSlice";
import CodeIcon from "@mui/icons-material/Code";
import { StyledMenu } from "../../ui/components/StyledMenu";
import ChipFilterCategory from "../../ui/components/ChipFilter";
import { useGetLocationsQuery } from "../../../store/maintenance/maintenanceApi";

const ManageOrder = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [openFilter, setOpenFilter] = useState(false);
  const { orderQueryParams } = useAppSelector((state) => state.ui);

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

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

  const handleClickNuevo = (excel: boolean) => {
    dispatch(reset());
    navigate(excel ? `/order/register/?type=excel` : `/order/register/`);
  };

  const handleFilter = (data: FormFilterOrder) => {
    const queryOrder: OrderQueryParams = {
      ...query,
      distributor_center: data.distributor_center,
      id: data.id,
      location: data.location,
      status: data.status,
    };
    setquery(queryOrder);
    dispatch(setOrderQueryParams(queryOrder));
  };

  const {
    data: locationFilterSelectedData,
    isLoading: isLloadingLocation,
    isFetching: isFetchingLocation,
  } = useGetLocationsQuery({
    id: orderQueryParams.location,
    limit: 1,
    offset: 0,
  });
  const locationText =
    (locationFilterSelectedData &&
      locationFilterSelectedData?.results.length > 0 &&
      `${locationFilterSelectedData?.results[0].name} - ${locationFilterSelectedData?.results[0].code}`) ||
    "";

    const  {disctributionCenters} = useAppSelector(state => state.maintenance)
    const  {user} = useAppSelector(state => state.auth)
  return (
    <>
      <Container maxWidth="xl" sx={{ marginTop: 2 }}>
        <FilterOrder
          open={openFilter}
          handleFilter={handleFilter}
          handleClose={() => setOpenFilter(false)}
        />
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
            {/* excel */}
            <Button
              id="demo-customized-button"
              aria-controls={open ? "demo-customized-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              variant="contained"
              disableElevation
              onClick={handleClick}
              endIcon={<PostAddTwoToneIcon />}
            >
              Registrar
            </Button>
            <StyledMenu
              id="demo-customized-menu"
              MenuListProps={{
                "aria-labelledby": "demo-customized-button",
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
              <MenuItem onClick={() => handleClickNuevo(false)} disableRipple>
                <PostAddTwoToneIcon />
                <Typography ml={1}>Registro manual</Typography>
              </MenuItem>
              <MenuItem onClick={() => handleClickNuevo(true)} disableRipple>
                <CodeIcon />
                <Typography ml={1}>Registro excel</Typography>
              </MenuItem>
            </StyledMenu>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={1}>
              {orderQueryParams.location &&
                !isLloadingLocation &&
                !isFetchingLocation && (
                  <ChipFilterCategory
                    label="Cliente: "
                    items={[
                      {
                        label: locationText,
                        id: "location",
                        deleteAction: () =>{
                          dispatch(setOrderQueryParams({
                            ...orderQueryParams,
                            location: undefined,
                          }))
                          },
                      },
                    ]}
                  />
                )}
                {(orderQueryParams.distributor_center) && (
                  <ChipFilterCategory
                    label="Centro de Distribución: "
                    items={[
                        {
                            label: disctributionCenters.find(dc=> dc.id === orderQueryParams.distributor_center)?.name || "",
                            id:"",
                            deleteAction: !user?.centro_distribucion? (()=>dispatch(setOrderQueryParams({...orderQueryParams, distributor_center: undefined}))): undefined
                        }
                    ]}
                  />
                )}
                {(orderQueryParams.status) && (
                  <ChipFilterCategory
                    label="Estado: "
                    items={
                      [{
                          label: StatusOptions[orderQueryParams.status],
                          id:"status",
                      }]
                    }
                  />
                )}
                {(orderQueryParams.id) && (
                  <ChipFilterCategory
                    label="Estado: "
                    items={
                      [{
                          label: orderQueryParams.id.toString(),
                          id:"status",
                          deleteAction: ()=>dispatch(setOrderQueryParams({...orderQueryParams, id: undefined})),
                      }]
                    }
                  />
                )}
            </Grid>
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


const StatusOptions = {
  PENDING: "Pendiente",
  IN_PROCESS: "En Proceso",
  COMPLETED: "Completado",
}