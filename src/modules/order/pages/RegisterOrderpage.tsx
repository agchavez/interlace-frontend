import {
  Container,
  Divider,
  Grid,
  Typography,
  IconButton,
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { LocationSelect } from "../../ui/components/LocationSelect";
import OpenInNewTwoToneIcon from "@mui/icons-material/OpenInNewTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import CheckTwoToneIcon from "@mui/icons-material/CheckTwoTone";
import { StyledTableCell } from "../../tracker/components/CheckForm";
import * as yup from "yup";
import { useRef, useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  changeOrder,
  createOrder,
  getOrder,
  removeOrderDetail,
  setChanged,
  updateOrder,
} from "../../../store/order";
import AddClientModal from "../components/AddClientModal";
import AddOrderDetailModal from "../components/AddOrderDetailModal";
import { format, toDate } from "date-fns-tz";
import { useGetRouteQuery } from "../../../store/maintenance/maintenanceApi";
import { DeleteOrderModal } from "../components/DeleteOrderModal";
import { OrderDetail } from "../../../interfaces/orders";
interface OrderData {
  location: number;
  observations: string;
}

const schema = yup.object().shape({
  observations: yup.string().required("Campo requerido"),
  location: yup.number().required("Campo requerido").min(0, "Campo requerido"),
});

export const RegisterOrderpage = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const formRef = useRef<HTMLFormElement>(null);

  const [urlSearchParams] = useSearchParams();
  const edit = urlSearchParams.get("edit");
  const orderId = urlSearchParams.get("orderId");

  const [openAddClientModal, setOpenAddClientModal] = useState(false);
  const [openAddOrderDetailtModal, setOpenAddOrderDetailModal] =
    useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const {
    order,
    changed: changedData,
    loading,
  } = useAppSelector((state) => state.order);

  const setChangedData = (c: boolean) => {
    dispatch(setChanged(c));
  };

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<OrderData>({
    defaultValues: {
      observations: order.observations || "",
      location: order.location || undefined,
    },
    resolver: yupResolver(schema),
  });

  const { data: dataRoute } = useGetRouteQuery({
    location: watch("location"),
    distributorCenter: user?.centro_distribucion || -1,
    limit: 1,
    offset: 0,
  });

  useEffect(() => {
    if (edit && orderId !== null) {
      let idOrder: number;
      try {
        idOrder = parseInt(orderId);
      } catch {
        return;
      }
      dispatch(
        getOrder(idOrder, async () => {
          setChangedData(false);
        })
      );
    }
  }, [edit]);

  useEffect(() => {
    if (order.id) {
      const observations = order.observations || undefined;
      const location = order.location || undefined;
      reset({ observations: observations, location: location });
      navigate(`?edit=${true}&orderId=${order.id}`, { replace: true });
    }
  }, [order.id]);

  useEffect(() => {
    dispatch(changeOrder({ location: watch("location") }));
  }, [watch("location")]);

  useEffect(() => {
    dispatch(changeOrder({ observations: watch("observations") }));
  }, [watch("observations")]);

  const handleClickSave = () => {
    formRef.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true })
    );
  };

  const handleSubmitForm = (data: OrderData) => {
    if (!user?.centro_distribucion) return;
    if (order.id) {
      dispatch(
        updateOrder(order.id, {
          status: "PENDING",
          observations: data.observations,
          location: data.location,
        })
      );
    } else {
      dispatch(
        createOrder({
          status: "PENDING",
          distributor_center: user.centro_distribucion,
          observations: data.observations,
          location: data.location,
          user: +user.id,
        })
      );
    }
  };

  const disabled = order.id !== null && order.status !== "PENDING";

  return (
    <>
      <AddClientModal
        open={openAddClientModal}
        handleClose={() => setOpenAddClientModal(false)}
      />
      {openAddOrderDetailtModal && (
        <AddOrderDetailModal
          open={openAddOrderDetailtModal}
          handleClose={() => setOpenAddOrderDetailModal(false)}
        />
      )}
      <Container maxWidth="xl" sx={{ marginTop: 2 }}>
        <Grid container spacing={1}>
          <Grid item xs={12} display="flex" justifyContent="space-between">
            <div style={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={() => navigate(-1)} title="Regresar">
                <ArrowBack color="primary" fontSize="medium" />
              </IconButton>
              <Typography variant="h5" component="h1" fontWeight={400}>
                Registro de pedidos de T1
              </Typography>
            </div>
            {loading && <CircularProgress />}
            {!disabled && (
              <Button
                variant="contained"
                color="success"
                size="medium"
                disabled={!changedData || (order.order_detail.length === 0)}
                endIcon={<CheckTwoToneIcon fontSize="small" />}
                onClick={handleClickSave}
              >
                {changedData ? "Guardar" : "Guardado"}
              </Button>
            )}
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" component="h2" fontWeight={400}>
              Complete el formulario para registrar un nuevo pedido de T1, los
              campos marcados con asterisco (*) son obligatorios.
            </Typography>
          </Grid>
          <Grid item xs={12} sx={{ marginTop: 2 }}>
            <form
              ref={formRef}
              onSubmit={handleSubmit(handleSubmitForm, (err) =>
                console.log(err)
              )}
            >
              <Grid container spacing={2}>
                <Grid item xs={8} md={8} lg={4}>
                  {disabled ? (
                    <>
                      <Typography
                        variant="body1"
                        component="h1"
                        fontWeight={600}
                        color={"gray.500"}
                      >
                        Cliente
                      </Typography>
                      <Divider />
                      <Typography
                        variant="body1"
                        component="h1"
                        fontWeight={400}
                        color={"gray.500"}
                      >
                        {order.location_data?.name} -{order.location_data?.code}
                      </Typography>
                    </>
                  ) : (
                    <LocationSelect
                      control={control}
                      name="location"
                      label="Cliente"
                      locationId={watch("location")}
                    />
                  )}
                </Grid>
                {!disabled && (
                  <Grid item xs={4} md={4} lg={2}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="medium"
                      fullWidth
                      endIcon={<OpenInNewTwoToneIcon fontSize="small" />}
                      onClick={() => setOpenAddClientModal(true)}
                    >
                      Nuevo cliente
                    </Button>
                  </Grid>
                )}
                {watch("location") !== null && (
                  <Grid
                    item
                    xs={12}
                    md={12}
                    lg={6}
                    alignItems="center"
                    display="flex"
                  >
                    <Chip
                      label={
                        (dataRoute?.results &&
                          dataRoute?.results.length > 0 &&
                          dataRoute?.results[0].code) ||
                        ""
                      }
                      color="secondary"
                      size="medium"
                      sx={{ marginRight: 1 }}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  {disabled ? (
                    <>
                      <Typography
                        variant="body1"
                        component="h1"
                        fontWeight={600}
                        color={"gray.500"}
                      >
                        Observaciones
                      </Typography>
                      <Divider />
                      <Typography
                        variant="body1"
                        component="h1"
                        fontWeight={400}
                        color={"gray.500"}
                      >
                        {order.observations}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <TextField
                        {...register("observations")}
                        fullWidth
                        label="Observaciones"
                        variant="outlined"
                        required
                        size="small"
                        multiline
                        rows={3}
                        error={errors.observations?.message ? true : false}
                        helperText={errors.observations?.message}
                      />
                      {errors.observations && (
                        <h1>{errors.observations.message}</h1>
                      )}
                    </>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Divider>
                    <Typography variant="body1" component="h2" fontWeight={400}>
                      Detalle del pedido
                    </Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} md={8} lg={10}></Grid>
                {!disabled && (
                  <Grid item xs={12} md={4} lg={2}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="medium"
                      fullWidth
                      endIcon={<OpenInNewTwoToneIcon fontSize="small" />}
                      onClick={() => setOpenAddOrderDetailModal(true)}
                    >
                      Agregar
                    </Button>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table
                      size="small"
                      aria-label="a dense table"
                      sx={{ marginTop: 2 }}
                    >
                      <TableHead>
                        <TableRow>
                          <StyledTableCell align="left">
                            Tracking
                          </StyledTableCell>
                          <StyledTableCell align="left">
                            No. SAP
                          </StyledTableCell>
                          <StyledTableCell align="left">
                            Producto
                          </StyledTableCell>
                          <StyledTableCell align="left">Cajas</StyledTableCell>
                          <StyledTableCell align="left">
                            Cajas disponibles
                          </StyledTableCell>
                          <StyledTableCell align="left">
                            Fecha Expiración
                          </StyledTableCell>
                          {!disabled && (
                            <StyledTableCell align="right">
                              Acciones
                            </StyledTableCell>
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.order_detail.map((detail, index) => {
                          return (
                            <Row
                              key={detail.id}
                              index={index}
                              disabled={disabled}
                              row={detail}
                            />
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

const Row = ({
  row,
  index,
  disabled,
}: {
  row: OrderDetail;
  index: number;
  disabled: boolean;
}) => {
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const dispatch = useAppDispatch();
  const handleClickDeleteOrderDetail = (index: number) => {
    dispatch(removeOrderDetail({ index }));
  };
  return (
    <TableRow key={row.id}>
      {openModalDelete && (
        <DeleteOrderModal
          title="Eliminar Detalle de Pedido"
          message="¿Está seguro que desea eliminar el detalle de pedido?"
          open={openModalDelete}
          handleClose={() => setOpenModalDelete(false)}
          onDelete={() => handleClickDeleteOrderDetail(index)}
        />
      )}
      <TableCell>
        TRK-
        {row.tracking_id.toString().padStart(8, "0")}
      </TableCell>
      <TableCell>{row.product_data?.sap_code}</TableCell>
      <TableCell>{row.product_data?.name}</TableCell>
      <TableCell>{row.quantity}</TableCell>
      <TableCell>{row.quantity_available}</TableCell>
      <TableCell>
        {format(
          toDate(new Date(row.expiration_date).toISOString().split("T")[0]),
          "yyyy-MM-dd"
        )}
      </TableCell>
      {!disabled && (
        <TableCell align="right">
          <IconButton color="error" onClick={() => setOpenModalDelete(true)}>
            <DeleteTwoToneIcon fontSize="medium" />
          </IconButton>
        </TableCell>
      )}
    </TableRow>
  );
};
