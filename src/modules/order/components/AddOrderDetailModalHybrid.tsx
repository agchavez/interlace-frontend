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
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { FunctionComponent, useRef, useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../../store/store";
// import * as yup from "yup";
// import { yupResolver } from "@hookform/resolvers/yup";
import QRCodeScanner from "./QRCodeScanner";
import { toast } from "sonner";
import {
  useGetTrackerByIdQuery,
  useGetTrackerDetailQuery,
} from "../../../store/seguimiento/trackerApi";
import { addOrderDetailState } from "../../../store/order";
import { Tracker, TrackerProductDetail } from "../../../interfaces/tracking";
import { OrderDetailMode, OrderDetailHybridForm } from "../../../interfaces/orders";
import BootstrapDialogTitle from "../../ui/components/BoostrapDialog";
import { ProductSelect } from "../../ui/components/ProductSelect";
import { Product } from "../../../interfaces/tracking";

interface CreateCheckProps {
  open: boolean;
  handleClose?:
    | ((event: object, reason: "backdropClick" | "escapeKeyDown") => void)
    | undefined;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const AddOrderDetailModalHybrid: FunctionComponent<CreateCheckProps> = ({
  open,
  handleClose,
}) => {
  // FUNCIONALIDAD HÍBRIDA: Modo de operación
  const [mode, setMode] = useState<OrderDetailMode>("tracker");
  
  // Estados para modo tracker (funcionalidad original)
  const [readQR, setReadQR] = useState(false);
  const [idTrackerDetailProduct, setIdtrackerDetailProduct] = useState<number>(-1);
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [trackerDetailProduct, setTrackerDetail] = useState<TrackerProductDetail | null>(null);
  const [maxqt, setMaxqt] = useState(0);
  
  // Estados para modo directo (nueva funcionalidad)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const loading = useAppSelector((state) => state.maintenance.loading);
  const formRef = useRef<HTMLFormElement>(null);
  const dispatch = useAppDispatch();

  const { order } = useAppSelector((state) => state.order);
  const { user } = useAppSelector((state) => state.auth);

  // Ya no necesitamos esta query, ProductSelect maneja la carga de productos internamente

  // Schema de validación híbrido (deshabilitado por ahora para evitar errores de TypeScript)
  /*
  const _schema = useMemo(() => {
    const baseQuantityValidation = yup
      .number()
      .required("Campo requerido")
      .min(1, "La cantidad debe ser mayor a 0");
    
    const quantity = mode === "tracker" 
      ? baseQuantityValidation.max(maxqt, `La cantidad máxima es ${maxqt}`)
      : baseQuantityValidation.max(directInventoryAvailable, `La cantidad máxima disponible es ${directInventoryAvailable}`);

    if (mode === "tracker") {
      // Validación para modo tracker (original)
      return yup.object().shape({
        quantity,
        idTrackerDetailProduct: yup
          .number()
          .required("Campo requerido")
          .min(0, "Campo requerido"),
        idTracker: yup
          .number()
          .required("Campo requerido")
          .min(0, "Campo requerido"),
      });
    } else {
      // Validación para modo directo (nuevo)
      return yup.object().shape({
        quantity,
        product: yup
          .number()
          .required("Campo requerido")
          .min(1, "Debe seleccionar un producto"),
        manual_expiration_date: yup
          .string()
          .required("Campo requerido"),
      });
    }
  }, [maxqt, directInventoryAvailable, mode]);
  */

  const { data, error, isLoading, isFetching } = useGetTrackerDetailQuery({
    id: idTrackerDetailProduct,
    limit: 1,
    offset: 0,
  }, {skip: idTrackerDetailProduct < 1 || mode !== "tracker"});

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    reset,
    setFocus,
    setValue,
    watch,
  } = useForm<any>({
    defaultValues: {
      mode: "tracker",
      idTrackerDetail: "",
      idTrackerDetailProduct: "",
      quantity: 0,
      product: undefined,
      manual_expiration_date: "",
    },
    // resolver: yupResolver(schema) as any,
  });

  const {
    data: trackerData,
    isFetching: trackerFetching,
    isLoading: trackerLoading,
    error: trackerError,
    refetch: refetchTracker,
  } = useGetTrackerByIdQuery(watch("idTracker")?.toString() || "", {
    skip: !watch("idTracker") || watch("idTracker")! <= 0 || mode !== "tracker",
  });

  // Efectos para modo tracker (funcionalidad original)
  useEffect(() => {
    if (mode !== "tracker") return;
    if (trackerLoading || trackerFetching) return;
    if (trackerError) {
      if (watch("idTracker") && watch("idTracker")! >= 0)
        toast.error("Tracker no encontrado");
      setTracker(null);
      return;
    }
    if (!trackerData) return;
    setTracker(trackerData);
  }, [trackerFetching, trackerLoading, mode]);

  useEffect(() => {
    if (mode !== "tracker") return;
    if (watch("idTracker") && watch("idTracker")! >= 0) refetchTracker();
  }, [watch("idTracker"), mode]);

  useEffect(() => {
    if (mode !== "tracker") return;
    if (isLoading || isFetching) return;
    if (error) {
      if (idTrackerDetailProduct >= 0)
        toast.error("ID de detalle no encontrado");
      setMaxqt(0);
      setValue("quantity", 0);
      setValue("idTrackerDetail", "");
      return;
    }
    if (!data) return;
    setMaxqt(data.available_quantity);
    setTrackerDetail(data);
  }, [idTrackerDetailProduct, isLoading, isFetching, mode]);

  // Los productos directos no tienen límite de inventario

  // Focus al abrir el modal
  useEffect(() => {
    setTimeout(() => {
      if (mode === "tracker") {
        setFocus("idTracker");
      }
    }, 100);
  }, [open, mode, setFocus]);

  // Reset al cambiar modo
  useEffect(() => {
    reset({
      mode,
      quantity: 0,
      idTracker: undefined,
      idTrackerDetail: "",
      idTrackerDetailProduct: "",
      product: undefined,
      manual_expiration_date: "",
    });
    setIdtrackerDetailProduct(-1);
    setTracker(null);
    setSelectedProduct(null);
    setMaxqt(0);
  }, [mode, reset]);

  useEffect(() => {
    reset();
    setIdtrackerDetailProduct(-1);
  }, [readQR]);

  const handleSubmitForm = async (data: OrderDetailHybridForm) => {
    if (+data.quantity === 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    if (mode === "tracker") {
      // LÓGICA ORIGINAL PARA TRACKER
      if (trackerDetailProduct === null) return;
      
      // Validar duplicados
      if (
        order.order_detail.find(
          (x) => x.tracker_detail_product === +data.idTrackerDetailProduct!
        )
      ) {
        toast.error("El pedido ya contiene este detalle");
        return;
      }
      
      if (data.quantity > maxqt) {
        toast.error("La cantidad elegida supera la cantidad máxima");
        return;
      }

      dispatch(
        addOrderDetailState(trackerDetailProduct.tracker_detail_id, {
          id: null,
          order_detail_history: [],
          tracking_id: trackerDetailProduct.tracker_id || 0,
          expiration_date: trackerDetailProduct.expiration_date,
          expiration_date_display: trackerDetailProduct.expiration_date,
          created_at: "",
          quantity: data.quantity,
          quantity_available: data.quantity,
          order: -1,
          tracker_detail_product: trackerDetailProduct.id,
          product: null,
          distributor_center: null,
        })
      );
    } else {
      // NUEVA LÓGICA PARA PRODUCTO DIRECTO
      if (!selectedProduct) {
        toast.error("Debe seleccionar un producto");
        return;
      }

      // Validar duplicados para producto directo
      if (
        order.order_detail.find(
          (x) => x.product === data.product && 
                 x.expiration_date === data.manual_expiration_date &&
                 x.distributor_center === user?.distributions_centers[0]
        )
      ) {
        toast.error("El pedido ya contiene este producto con la misma fecha de vencimiento");
        return;
      }

      // No hay límite de inventario para productos directos

      // Crear orden detail para producto directo
      dispatch(
        addOrderDetailState(-1, {
          id: null,
          order_detail_history: [],
          tracking_id: null,
          expiration_date: data.manual_expiration_date!,
          expiration_date_display: data.manual_expiration_date!,
          created_at: "",
          quantity: data.quantity,
          quantity_available: data.quantity,
          order: -1,
          tracker_detail_product: null,
          product: selectedProduct.id,
          distributor_center: user?.distributions_centers[0] || null,
        })
      );
    }

    reset();
    toast.success(`Producto ${mode === "tracker" ? "del tracker" : "directo"} agregado correctamente`);
  };

  const handleClickCreate = () => {
    formRef.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true })
    );
  };

  const handleReadQR = (text: string) => {
    if (mode !== "tracker") return;
    
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
        setIdtrackerDetailProduct(parseInt(palletId!));
      } else {
        toast.error("Código QR inválido");
      }
    } catch (error) {
      toast.error("Código QR inválido");
    }
  };

  const trackerProductDetailOptions = useMemo(() => {
    if (mode !== "tracker") return [];
    const idTrackerDetail = parseInt(watch("idTrackerDetail") || "0");
    const tracker_detail = tracker?.tracker_detail.find(
      (detail) => detail.id === idTrackerDetail
    );
    if (tracker_detail === undefined) return [];
    return tracker_detail.tracker_product_detail;
  }, [watch("idTrackerDetail"), watch("idTracker"), idTrackerDetailProduct, mode]);

  const expirationdate = useMemo(() => {
    if (mode !== "tracker") return null;
    return tracker?.tracker_detail.find(
      (detail) => detail.id === parseInt(watch("idTrackerDetail") || "0")
    ) &&
      tracker?.tracker_detail
        .find((detail) => detail.id === parseInt(watch("idTrackerDetail") || "0"))
        ?.tracker_product_detail.find(
          (productDetail) =>
            productDetail.id === parseInt(watch("idTrackerDetailProduct") || "0")
        )?.expiration_date;
  }, [tracker, mode]);

  const watchIdTracker = watch("idTracker");
  const watchIdTrackerDetail = watch("idTrackerDetail");
  
  useEffect(() => {
    if (mode === "tracker") {
      setMaxqt(0);
    }
  }, [watchIdTracker, watchIdTrackerDetail, mode]);

  const handleModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: OrderDetailMode,
  ) => {
    if (newMode !== null) {
      setMode(newMode);
      setValue("mode", newMode);
    }
  };

  const handleProductSelect = (product: Product | null) => {
    setSelectedProduct(product);
    if (product) {
      setValue("product", product.id);
    } else {
      setValue("product", undefined);
    }
  };

  return (
    <BootstrapDialog
      open={open}
      onClose={handleClose}
      fullWidth={true}
      maxWidth="md"
    >
      <BootstrapDialogTitle 
        onClose={() => handleClose && handleClose({}, "backdropClick")} 
        id="form-dialog-title"
      >
        Nuevo detalle de pedido
      </BootstrapDialogTitle>
      <DialogContent dividers>
        <Box>
          <Container maxWidth={false}>
            <Grid container spacing={3}>
              {/* SELECTOR DE MODO HÍBRIDO */}
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Selecciona el tipo de producto que deseas agregar
                </Alert>
                <ToggleButtonGroup
                  value={mode}
                  exclusive
                  onChange={handleModeChange}
                  aria-label="mode selection"
                  fullWidth
                  size="large"
                  color="primary"
                >
                  <ToggleButton value="tracker" aria-label="tracker mode">
                    🏷️ Con Tracker (Actual)
                  </ToggleButton>
                  <ToggleButton value="direct" aria-label="direct mode">
                    📦 Producto Directo (Nuevo)
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              {/* CONTENIDO PARA MODO TRACKER (FUNCIONALIDAD ORIGINAL) */}
              {mode === "tracker" && (
                <>
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
                  
                  {readQR && (
                    <Grid item xs={12}>
                      <QRCodeScanner id="qrreader-1" onRead={handleReadQR} />
                    </Grid>
                  )}
                </>
              )}

              {/* CONTENIDO PARA MODO DIRECTO (NUEVA FUNCIONALIDAD) */}
              {mode === "direct" && (
                <Grid item xs={12}>
                  <Alert severity="success">
                    🆕 Modo producto directo: Agrega productos sin necesidad de tracker asociado
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <form onSubmit={handleSubmit(handleSubmitForm)} ref={formRef} autoComplete="off">
                  <Grid container spacing={3}>
                    
                    {/* FORMULARIO PARA MODO TRACKER */}
                    {mode === "tracker" && (
                      <>
                        {readQR && watch("idTracker") && (
                          <Grid item xs={12} md={6}>
                            <Typography variant="body1" component="h1" fontWeight={600} color="gray.500">
                              Id Tracker
                            </Typography>
                            <Divider />
                            <Typography variant="body1" component="h1" fontWeight={400} color="gray.500">
                              TRK-{watch("idTracker") && watch("idTracker")!.toString().padStart(5, "0")}
                            </Typography>
                          </Grid>
                        )}
                        
                        <Grid item xs={2} md={1} display={readQR ? "none" : "block"}>
                          <Typography
                            variant="h6"
                            component="h1"
                            fontWeight={600}
                            color="gray.500"
                            align="right"
                          >
                            TRK-
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={10} md={5} display={readQR ? "none" : "block"}>
                          <TextField
                            fullWidth
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
                            value={watch("idTracker") || ""}
                            error={!!errors.idTracker}
                            helperText={errors.idTracker ? "Este campo es requerido" : ""}
                            disabled={readQR}
                          />
                        </Grid>

                        {readQR && tracker && (
                          <Grid item xs={12} md={6}>
                            <Typography variant="body1" component="h1" fontWeight={600} color="gray.500">
                              Producto
                            </Typography>
                            <Divider />
                            <Typography variant="body1" component="h1" fontWeight={400} color="gray.500">
                              {tracker?.tracker_detail.find(
                                (detail) => detail.id === parseInt(watch("idTrackerDetail") || "0")
                              )?.product_data.name}
                            </Typography>
                          </Grid>
                        )}

                        <Grid item xs={12} md={6} display={readQR ? "none" : "block"}>
                          <FormControl fullWidth>
                            <InputLabel size="small">Producto</InputLabel>
                            <Select
                              size="small"
                              label="Producto"
                              value={watch("idTrackerDetail") || ""}
                              onChange={(event: SelectChangeEvent<string>) => {
                                setValue("idTrackerDetail", event.target.value);
                                setValue("idTrackerDetailProduct", "");
                              }}
                              error={!!errors.idTrackerDetail}
                              disabled={tracker === null || readQR}
                            >
                              {tracker?.tracker_detail.map((trackerDetail) => (
                                <MenuItem key={trackerDetail.id} value={trackerDetail.id}>
                                  {trackerDetail.product_data.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        {readQR && tracker && (
                          <Grid item xs={12} md={6}>
                            <Typography variant="body1" component="h1" fontWeight={600} color="gray.500">
                              Fecha de Vencimiento
                            </Typography>
                            <Divider />
                            <Typography variant="body1" component="h1" fontWeight={400} color="gray.500">
                              {expirationdate}
                            </Typography>
                          </Grid>
                        )}

                        <Grid item xs={12} md={6} display={readQR ? "none" : "block"}>
                          <FormControl fullWidth>
                            <InputLabel size="small">Fecha de Vencimiento</InputLabel>
                            <Select
                              size="small"
                              label="Fecha de Vencimiento"
                              value={watch("idTrackerDetailProduct") || ""}
                              onChange={(event: SelectChangeEvent<string>) => {
                                const productDet = trackerProductDetailOptions.find(
                                  (tpd) => tpd.id === parseInt(event.target.value)
                                );
                                if (productDet !== undefined) {
                                  setMaxqt(productDet.available_quantity);
                                } else {
                                  setMaxqt(0);
                                  setValue("quantity", 0);
                                }
                                setValue("idTrackerDetailProduct", event.target.value);
                                setIdtrackerDetailProduct(parseInt(event.target.value));
                              }}
                              error={!!errors.idTrackerDetailProduct}
                              disabled={watch("idTrackerDetail") === "" || readQR}
                            >
                              {tracker?.tracker_detail.find(
                                (detail) => detail.id === parseInt(watch("idTrackerDetail") || "0")
                              )?.tracker_product_detail.map((productDetail) => (
                                <MenuItem key={productDetail.id} value={productDetail.id}>
                                  {productDetail.expiration_date}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </>
                    )}

                    {/* FORMULARIO PARA MODO DIRECTO */}
                    {mode === "direct" && (
                      <>
                        <Grid item xs={12} md={6}>
                          <ProductSelect
                            control={control}
                            name="product"
                            placeholder="Buscar producto..."
                            isOutput={false}
                            onChange={handleProductSelect}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Controller
                            name="manual_expiration_date"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <DatePicker
                                label="Fecha de Vencimiento"
                                value={field.value ? new Date(field.value) : null}
                                onChange={(newValue) => {
                                  const dateString = newValue ? newValue.toISOString().split('T')[0] : '';
                                  field.onChange(dateString);
                                }}
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    size: "small",
                                    error: !!error,
                                    helperText: error?.message || "",
                                  },
                                }}
                              />
                            )}
                          />
                        </Grid>

                        {selectedProduct && (
                          <Grid item xs={12}>
                            <Alert severity="info">
                              <strong>Producto seleccionado:</strong> {selectedProduct.name}<br/>
                              <strong>Código SAP:</strong> {selectedProduct.sap_code}<br/>
                              <strong>Marca:</strong> {selectedProduct.brand}<br/>
                              <strong>Sin límite de inventario</strong> para productos directos
                            </Alert>
                          </Grid>
                        )}
                      </>
                    )}

                    {/* CAMPO CANTIDAD (COMÚN PARA AMBOS MODOS) */}
                    {((!readQR || (readQR && tracker)) && mode === "tracker") || 
                     (mode === "direct" && selectedProduct) ? (
                      <Grid item xs={12} md={6}>
                        <Grid container alignItems="center" gap={1}>
                          <Grid item flexGrow={1}>
                            <TextField
                              fullWidth
                              label="Cantidad"
                              variant="outlined"
                              size="small"
                              type="number"
                              inputProps={{ 
                                min: 1, 
                                max: mode === "tracker" ? maxqt : undefined 
                              }}
                              onChange={(e) => {
                                if (e.target.value === "") return;
                                const value = parseInt(e.target.value);
                                setValue("quantity", value);
                              }}
                              value={watch("quantity") || ""}
                              error={!!errors.quantity}
                              helperText={errors.quantity?.message?.toString() || ""}
                            />
                          </Grid>
                          {mode === "tracker" && maxqt > 0 && (
                            <Grid>
                              <Typography variant="body2" color="text.secondary">
                                Max: {maxqt}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Grid>
                    ) : null}
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
          variant="contained"
        >
          Agregar {mode === "tracker" ? "desde Tracker" : "Producto Directo"}
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default AddOrderDetailModalHybrid;

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