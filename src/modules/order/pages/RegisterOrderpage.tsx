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
  Paper,
  Collapse,
  Box,
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
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import {
  changeOrder,
  createOrder,
  createOrderByExcel,
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
import { OrderDetail, OrderExcelResponse } from '../../../interfaces/orders';
import { FileUploader } from "react-drag-drop-files";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { toast } from "sonner";
import CloudUploadTwoToneIcon from '@mui/icons-material/CloudUploadTwoTone';
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

  const [urlSearchParams, setParams] = useSearchParams();
  const edit = urlSearchParams.get("edit");
  const type = urlSearchParams.get("type");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edit]);

  useEffect(() => {
    if (order.id) {
      const observations = order.observations || undefined;
      const location = order.location || undefined;
      reset({ observations: observations, location: location });
      navigate(`?edit=${true}&orderId=${order.id}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id]);

  useEffect(() => {
    dispatch(changeOrder({ location: watch("location") }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("location")]);

  useEffect(() => {
    dispatch(changeOrder({ observations: watch("observations") }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("observations")]);

  const handleClickSave = () => {
    formRef.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true })
    );
  };

  const handleComple = (data: OrderExcelResponse) => {
    setParams({ edit: "true", orderId: data.order.id.toString() });
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
      if (type === "excel") {
        dispatch(createOrderByExcel(file.file!, watch("location"), watch("observations"), handleComple));
      }else{
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
    }
  };

  const disabled = order.id !== null && order.status !== "PENDING";

  const [file, setfile] = useState<{ file: File | null, fileName: string | null }>({ file: null, fileName: null });
  const [dragging, setDragging] = useState(false);
  const handleFileChange = (file: File) => {
    // Solo se admiten .xlsx
    if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      toast.error("Solo se admiten archivos .xlsx");
      return;
    }
    setfile({ file: file, fileName: file.name });
  }


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
              <IconButton onClick={() => navigate('/order/manage', {replace: true})} title="Regresar">
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
                disabled={!changedData || (order.order_detail.length === 0 && !file.file)}
                endIcon={
                  type === "excel" ? <CloudUploadTwoToneIcon fontSize="small" /> :
                <CheckTwoToneIcon fontSize="small" />}
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
              onSubmit={handleSubmit(handleSubmitForm, () => {})}>
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
                    {watch("location") && <Chip
                      label={
                        (dataRoute?.results &&
                          dataRoute?.results.length > 0 &&
                          dataRoute?.results[0].code) ||
                        ""
                      }
                      color="secondary"
                      size="medium"
                      sx={{ marginRight: 1 }}
                    />}
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
                        value={watch("observations") || ""}
                        error={errors.observations?.message ? true : false}
                        helperText={errors.observations?.message}
                      />
                      {errors.observations && (
                        <h1>{errors.observations.message}</h1>
                      )}
                    </>
                  )}
                </Grid>
                {order.id && <Grid item xs={12}>
                  <Typography
                    variant="h4"
                    component="h1"
                    fontWeight={400}
                    color={"white"}
                    align="center"
                    bgcolor={"#1c2536"}
                  >
                    ORD-{order.id?.toString().padStart(0, "0")}
                  </Typography>
                </Grid>}
                <Grid item xs={12}>
                  <Divider>
                    <Typography variant="body1" component="h2" fontWeight={400}>
                      Detalle del pedido
                    </Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} md={8} lg={10}></Grid>
                {!disabled && type !== 'excel' && (
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
                {type === 'excel' ?
                  <Grid item xs={12} md={12} lg={12}>
                    <Typography variant="body1" textAlign="start" sx={{ mb: 1 }} color="text.secondary">
                      Adjuntar archivo, solo se admiten archivos .xlsx
                    </Typography>
                    <FileUploader
                      name="file"
                      label="Arrastre un archivo o haga click para seleccionar uno"
                      dropMessageStyle={{ backgroundColor: "red" }}
                      maxSize={10}
                      multiple={false}
                      onDraggingStateChange={(d: boolean) => setDragging(d)}
                      onDrop={handleFileChange}
                      onSelect={handleFileChange}
                      onSizeError={() => toast.error("No se admiten archivos de archivos mayores a 20 MB")}
                    >
                      <Paper
                        style={{
                          width: "100%",
                          height: 200,
                          border: "2px dashed #aaaaaa",
                          borderRadius: 5,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          position: "relative",
                          overflow: "hidden",
                          backgroundColor: dragging ? "#F0E68C" : "transparent",
                        }}
                      >
                        <CloudUploadIcon
                          style={{
                            fontSize: 40,
                            color: "#aaaaaa",
                          }}
                        />
                        <Typography
                          variant="body1"
                          style={{ color: "#aaaaaa" }}
                          textAlign="center"
                        >
                          {dragging
                            ? "Suelta el Archivo"
                            : file.file != null
                              ? file.fileName
                              : "Arrastra y suelta archivos aquí o haz clic para seleccionar archivos"}
                        </Typography>
                        <input type="file" style={{ display: "none" }} />
                      </Paper>
                    </FileUploader>
                  </Grid>
                  : <Grid item xs={12}>
                    <TableContainer sx={{ maxHeight: 400 }}>
                      <Table
                        size="small"
                        aria-label="a dense table"
                        sx={{ marginTop: 2 }}
                      >
                        <TableHead>
                          <TableRow>
                            <StyledTableCell align="left">
                            </StyledTableCell>
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
                  </Grid>}
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
  const [open, setOpen] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const dispatch = useAppDispatch();
  const handleClickDeleteOrderDetail = (index: number) => {
    dispatch(removeOrderDetail({ index }));
  };
  return (
    <>
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
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          TRK-
          {row.tracking_id.toString().padStart(5, "0")}
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
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Detalles
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Tracking</TableCell>
                    <TableCell>Cajas</TableCell>
                    <TableCell>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.order_detail_history.map((historyRow) => (
                    <TableRow key={historyRow.id}>
                      <TableCell>
                        TRK-
                        {historyRow.tracker.toString().padStart(8, "0")}
                      </TableCell>
                      <TableCell>{historyRow.quantity}</TableCell>
                      <TableCell>
                      {format(
                          toDate(
                            new Date(historyRow.created_at)
                              .toISOString()
                              .split("T")[0]
                          ),
                          "yyyy-MM-dd"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
