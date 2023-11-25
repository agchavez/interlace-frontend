import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import { FunctionComponent, useRef, useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import QRCodeScanner from "./QRCodeScanner";
import { toast } from "sonner";
import {
  useGetTrackerByIdQuery,
  useGetTrackerDetailQuery,
} from "../../../store/seguimiento/trackerApi";
import { addOrderDetailState } from "../../../store/order";
import { Tracker, TrackerProductDetail } from "../../../interfaces/tracking";
import BootstrapDialogTitle from "../../ui/components/BoostrapDialog";

interface CreateCheckProps {
  open: boolean;
  handleClose?:
    | ((event: object, reason: "backdropClick" | "escapeKeyDown") => void)
    | undefined;
}

interface FormValues {
  idTracker: number;
  idTrackerDetail: string;
  idTrackerDetailProduct: string;
  quantity: string;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const AddOrderDetailModal: FunctionComponent<CreateCheckProps> = ({
  open,
  handleClose,
}) => {
  const [readQR, setReadQR] = useState(false);
  // const [
  //   qrReaded,
  //   setQrReaded,
  // ] = useState(false);
  const [idTrackerDetailProduct, setIdtrackerDetailProduct] =
    useState<number>(-1);
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [trackerDetailProduct, setTrackerDetail] =
    useState<TrackerProductDetail | null>(null);
  const [maxqt, setMaxqt] = useState(0);
  const loading = useAppSelector((state) => state.maintenance.loading);
  const formRef = useRef<HTMLFormElement>(null);
  const dispatch = useAppDispatch();


  const {
    order,
  } = useAppSelector((state) => state.order);

  /// eslint-disable-next-line react-hooks/exhaustive-deps

  const schema: yup.ObjectSchema<any> = useMemo(() => {
    const quantity = yup
      .number()
      .required("Campo requerido")
      .min(0, "La cantidad debe ser mayor o igual a 0")
      .max(maxqt, `La cantidad maxima es ${maxqt}`);
    const shape: yup.ObjectShape = {
      quantity,
      idTrackerDetailProduct: yup
        .number()
        .required("Campo requerido")
        .min(0, "Campo requerido"),
      idTracker: yup
        .number()
        .required("Campo requerido")
        .min(0, "Campo requerido"),
    };
    return yup.object().shape(shape);
  }, [maxqt]);

  const { data, error, isLoading, isFetching } = useGetTrackerDetailQuery({
    id: idTrackerDetailProduct,
    limit: 1,
    offset: 0,
  }, {skip: idTrackerDetailProduct < 1});

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setFocus,
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      idTrackerDetail: "",
      idTrackerDetailProduct: "",
    },
    resolver: yupResolver(schema),
  });

  const {
    data: trackerData,
    isFetching: trackerFetching,
    isLoading: trackerLoading,
    error: trackerError,
    refetch: refetchTracker,
  } = useGetTrackerByIdQuery(watch("idTracker")?.toString(), {
    skip: !watch("idTracker") || watch("idTracker") <= 0,
  });
  useEffect(() => {
    if (trackerLoading || trackerFetching) return;
    if (trackerError) {
      if (watch("idTracker") && watch("idTracker") >= 0)
        toast.error("Tracker no encontrado");
      setTracker(null);

      return;
    }
    if (!trackerData) return;
    const resp = trackerData;
    setTracker(resp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackerFetching, trackerLoading]);

  useEffect(() => {
    if (watch("idTracker") && watch("idTracker") >= 0)  refetchTracker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("idTracker")]);

  useEffect(() => {
    if (isLoading || isFetching) return;
    if (error) {
      if (idTrackerDetailProduct >= 0)
        toast.error("id de detalle no encontrado");
      setMaxqt(0);
      setValue("quantity", "");
      setValue("idTrackerDetail", "");
      return;
    }
    if (!data) return;
    const resp = data;
    setValue("quantity", resp.available_quantity.toString());
    setMaxqt(resp.available_quantity);
    setTrackerDetail(resp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idTrackerDetailProduct, isLoading, isFetching]);

  // FOcus al abrir el modal
  useEffect(() => {
    setTimeout(() => {
      setFocus("idTracker");
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, setFocus]);

  useEffect(() => {
    reset();
    setIdtrackerDetailProduct(-1)
    // if (readQR) setQrReaded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readQR]);

  const handleSubmitForm = async (data: FormValues) => {
    if (trackerDetailProduct === null) return;
    if (+data.quantity  === 0){
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }
    // Si ya existe el detalle en el tracker lanzar error
    if (
      order.order_detail.find(
        (x) => +x.tracker_detail_product === +data.idTrackerDetailProduct
      )
    ) {
      toast.error("El pedido ya contiene este detalle");
      return;
    }
    dispatch(
      addOrderDetailState(trackerDetailProduct.tracker_detail_id, {
        id: null,
        order_detail_history: [],
        tracking_id: trackerDetailProduct.tracker_id || 0,
        expiration_date: trackerDetailProduct.expiration_date,
        created_at: "",
        quantity: parseInt(data.quantity),
        quantity_available: parseInt(data.quantity),
        order: -1,
        tracker_detail_product: trackerDetailProduct.id,
      })
    );
    reset();
  };

  const handleClickCreate = () => {
    formRef.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true })
    );
  };

  const handleReadQR = (text: string) => {
    const pathPattern = /^\/tracker\/pallet-detail\/\d+(\/.*)?$/;
    const url = text;
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      if (pathPattern.test(path)) {
        const searchParams = urlObj.searchParams;
        const tracker_id = searchParams.get("tracker_id");
        tracker_id !== null && setValue("idTracker", parseInt(tracker_id));
        const tracker_detail = searchParams.get("tracker_detail");
        tracker_detail !== null && setValue("idTrackerDetail", tracker_detail);
        const pathParts = path.split("/");
        const palletId = pathParts[pathParts.length - 1];
        setValue("idTrackerDetailProduct", palletId);
        setIdtrackerDetailProduct(parseInt(palletId));
        // setQrReaded(true);
      } else {
        toast.error("Codigo QR invalido");
      }
    } catch (error) {
      toast.error("Codigo QR invalido");
    }
  };

  const trackerProductDetailOptions = useMemo(() => {
    const idTrackerDetail = parseInt(watch("idTrackerDetail"));
    const tracker_detail = tracker?.tracker_detail.find(
      (detail) => detail.id === idTrackerDetail
    );
    if (tracker_detail === undefined) return [];
    return tracker_detail.tracker_product_detail;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("idTrackerDetail"), watch("idTracker"), idTrackerDetailProduct]);

  const expirationdate = useMemo(() => {
    return tracker?.tracker_detail.find(
      (detail) => detail.id === parseInt(watch("idTrackerDetail"))
    ) &&
      tracker?.tracker_detail
        .find((detail) => detail.id === parseInt(watch("idTrackerDetail")))
        ?.tracker_product_detail.find(
          (productDetail) =>
            productDetail.id === parseInt(watch("idTrackerDetailProduct"))
        )?.expiration_date;
        // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [tracker]); 

  return (
    <BootstrapDialog
      open={open}
      onClose={handleClose}
      fullWidth={true}
      maxWidth="md"
    >
      <BootstrapDialogTitle onClose={() => handleClose && handleClose({}, "backdropClick")} id="form-dialog-title">
        Nuevo detalle de pedido
      </BootstrapDialogTitle>
      <DialogContent dividers>
        <Box>
          <Container maxWidth={false}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body2" component="h2"></Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Android12Switch
                      checked={readQR}
                      onChange={(e) => setReadQR(e.target.checked)}
                    />
                  }
                  label="Leer QR"
                />
              </Grid>
              <Grid item xs={12}>
                {readQR && (
                  <Grid item xs={12} mb={2}>
                    <QRCodeScanner id="qrreader-1" onRead={handleReadQR} />
                  </Grid>
                )}
                </Grid>
                <Grid item xs={12}>
                <form onSubmit={handleSubmit(handleSubmitForm)} ref={formRef} autoComplete="off">
                  <Grid container spacing={3}>
                    {readQR && watch("idTracker") && (
                      <Grid item xs={12} md={6}>
                        <Typography 
                          variant="body1"
                          component="h1"
                          fontWeight={600}
                          color={"gray.500"}
                        >
                          Id Tracker
                        </Typography>
                        <Divider />
                        <Typography
                          variant="body1"
                          component="h1"
                          fontWeight={400}
                          color={"gray.500"}
                        >
                          {/* 5 CEROS MENOS EL ID COMO CATIDAD */}
                          TRK-{ watch("idTracker") && watch("idTracker").toString().padStart(5, "0") }
                        </Typography>
                      </Grid>
                    )}
                    <Grid
                      item
                      xs={12}
                      md={6}
                      display={readQR ? "none" : "block"}
                    >
                      <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Id Tracker"
                        variant="outlined"
                        size="small"
                        type="number"
                        inputProps={{ min: 0 }}
                        {...register("idTracker")}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setValue("idTracker", value);
                          setValue("idTrackerDetail", "");
                        }}
                        value={watch("idTracker")}
                        error={errors.idTracker ? true : false}
                        helperText={errors.idTracker? "Este campo es requerido" : ""}
                        disabled={readQR}
                      />
                    </Grid>
                    {readQR && tracker && (
                      <Grid item xs={12} md={6}>
                        <Typography
                          variant="body1"
                          component="h1"
                          fontWeight={600}
                          color={"gray.500"}
                        >
                          Producto
                        </Typography>
                        <Divider />
                        <Typography
                          variant="body1"
                          component="h1"
                          fontWeight={400}
                          color={"gray.500"}
                        >
                          {
                            tracker?.tracker_detail.find(
                              (detail) =>
                                detail.id === parseInt(watch("idTrackerDetail"))
                            )?.product_data.name
                          }
                        </Typography>
                      </Grid>
                    )}
                    <Grid
                      item
                      xs={12}
                      md={6}
                      display={readQR ? "none" : "block"}
                    >
                      <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label" size="small">
                          Producto
                        </InputLabel>
                        <Select
                          size="small"
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          label="Producto"
                          // value={age}
                          value={watch("idTrackerDetail")}
                          onChange={(event: SelectChangeEvent<string>) => {
                            setValue("idTrackerDetail", event.target.value);
                            setValue("idTrackerDetailProduct", "");
                          }}
                          error={errors.idTrackerDetail ? true : false}
                          disabled={tracker === null || readQR}
                          defaultValue=""
                        >
                          {tracker?.tracker_detail.map((trackerDetail) => (
                            <MenuItem
                              key={trackerDetail.id}
                              value={trackerDetail.id}
                            >
                              {trackerDetail.product_data.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    {readQR && tracker && (
                      <Grid item xs={12} md={6}>
                        <Typography
                          variant="body1"
                          component="h1"
                          fontWeight={600}
                          color={"gray.500"}
                        >
                          Fecha de Vencimiento
                        </Typography>
                        <Divider />
                        <Typography
                          variant="body1"
                          component="h1"
                          fontWeight={400}
                          color={"gray.500"}
                        >
                          {
                            expirationdate
                          }
                        </Typography>
                      </Grid>
                    )}
                    <Grid
                      item
                      xs={12}
                      md={6}
                      display={readQR ? "none" : "block"}
                    >
                      <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label" size="small">
                          Fecha de Vencimiento
                        </InputLabel>
                        <Select
                          size="small"
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          // value={age}
                          value={watch("idTrackerDetailProduct")}
                          label="Fecha de Vencimiento"
                          defaultValue=""
                          onChange={(event: SelectChangeEvent<string>) => {
                            const productDet = trackerProductDetailOptions.find(
                              (tpd) => tpd.id === parseInt(event.target.value)
                            );
                            if (productDet !== undefined) {
                              setMaxqt(productDet.available_quantity);
                              setValue("quantity", productDet.available_quantity.toString())
                            } else {
                              setMaxqt(0);
                              setValue("quantity", "")
                            }
                            setValue(
                              "idTrackerDetailProduct",
                              event.target.value
                            );
                            setIdtrackerDetailProduct(
                              parseInt(event.target.value)
                            );
                          }}
                          error={errors.idTrackerDetail ? true : false}
                          disabled={watch("idTrackerDetail") === "" || readQR}
                        >
                          {tracker?.tracker_detail.find(
                            (detail) =>
                              detail.id === parseInt(watch("idTrackerDetail"))
                          ) &&
                            tracker?.tracker_detail
                              .find(
                                (detail) =>
                                  detail.id ===
                                  parseInt(watch("idTrackerDetail"))
                              )
                              ?.tracker_product_detail.map((productDetail) => (
                                <MenuItem
                                  key={productDetail.id}
                                  value={productDetail.id}
                                >
                                  {productDetail.expiration_date}
                                </MenuItem>
                              ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    { (!readQR || (readQR && tracker)) && 
                      <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Cantidad"
                        variant="outlined"
                        size="small"
                        type="number"
                        inputProps={{ min: 0, max:maxqt }}
                        
                        onChange={(e) => {
                          if (e.target.value === "") return;
                          const value = parseInt(e.target.value);
                          setValue("quantity", value.toString());
                        }}
                        value={watch("quantity")}
                        error={errors.quantity ? true : false}
                        helperText={errors.quantity?.message}
                      />
                    </Grid>}
                    </Grid>
                </form>
                
              </Grid>
            </Grid>
          </Container>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClickCreate}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          disabled={loading}
        >
          Agregar
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default AddOrderDetailModal;

const Android12Switch = styled(Switch)(({ theme }) => ({
  padding: 8,
  "& .MuiSwitch-track": {
    borderRadius: 22 / 2,
    "&:before, &:after": {
      content: '""',
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      width: 16,
      height: 16,
    },
    "&:before": {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main)
      )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
      left: 12,
    },
    "&:after": {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main)
      )}" d="M19,13H5V11H19V13Z" /></svg>')`,
      right: 12,
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "none",
    width: 16,
    height: 16,
    margin: 2,
  },
}));
