import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import { FC, useState, useEffect } from "react";
import TableRow from "@mui/material/TableRow";
import { StyledTableCell } from "./CheckForm";
import { useForm } from "react-hook-form";
import { OrderSelect } from "../../ui/components/OrderSelect";
import { useGetOrderByIdQuery } from "../../../store/order";
import { OrderDetail, OrderDetailCreateBody } from "../../../interfaces/orders";
import { useAppDispatch } from "../../../store";
import {
  DetalleCargaSalidaUtil,
  OrderDetailHistoryUtilActionType,
  saveOrderHistories,
  updateTracking,
} from "../../../store/seguimiento/trackerThunk";
import {
  DetalleCargaSalida,
  Seguimiento,
} from "../../../store/seguimiento/seguimientoSlice";
import BootstrapDialogTitle from "../../ui/components/BoostrapDialog";
import { toast } from "sonner";

interface SelectOrderTrackerModalProps {
  open: boolean;
  handleClose: () => void;
  seguimiento: Seguimiento;
  indice: number;
  setLocalidadValue: (value: number) => unknown;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export const SelectOrderTrackerModal: FC<SelectOrderTrackerModalProps> = ({
  open,
  handleClose,
  seguimiento,
  indice,
  setLocalidadValue,
}) => {
  const { control, setValue } = useForm();
  const [id, setid] = useState<number | null>(seguimiento.order);
  const [trackerOutputActions, setTrackerOutputActions] = useState<
    (DetalleCargaSalidaUtil | null)[]
  >([]);
  const { data: order, refetch } = useGetOrderByIdQuery(id ?? 0, {
    skip: !id,
  });

  const [body, setbody] = useState<OrderDetailCreateBody[]>([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (order) {
      const actions: (DetalleCargaSalidaUtil | null)[] = order.order_detail.map(
        (d) => {
          const detalle_salida = seguimiento.detallesSalida?.find(
            (ds) =>
              ds.expiration_date === d.expiration_date &&
              ds.sap_code === d.product_data?.sap_code
          );
          let action: DetalleCargaSalidaUtil | null = null;
          if (detalle_salida) {
            action = { detalleCargaSalida: detalle_salida, action: "noaction" };
            detalle_salida.amount;
          } else {
            if (d.product_data) {
              action = {
                detalleCargaSalida: {
                  ...d.product_data,
                  tracker_detail_product: d.tracker_detail_product,
                  amount: 0,
                  idDetalle: -1,
                  idProducto: d.product_data.id,
                  expiration_date: d.expiration_date,
                },
                action: "noaction",
              };
            }
          }
          return action;
        }
      );
      setTrackerOutputActions(actions);
    }
  }, [order, seguimiento.id, seguimiento.detallesSalida]);

  useEffect(() => {
    setValue("order", seguimiento.order);
    setid(seguimiento.order)
  }, [open, seguimiento.order, setValue]);

  const handleAdd = (
    detail: OrderDetail,
    quantity: number,
    checked: boolean
  ) => {
    onChangeRow(detail, "ch-q", quantity);
    // Encuentra el índice del detalle en el estado actual
    const index = body.findIndex((item) => item.order_detail_id === detail.id);
    // Si el índice es -1 y el checkbox no está marcado, no hagas nada
    if (!checked) {
      // Quitar del array el elemento que tenga el id del detalle
      setbody((prevBody) =>
        prevBody.filter((item) => item.order_detail_id !== detail.id)
      );
      return;
    }

    // Si el índice es -1 y el checkbox está marcado, agrega un nuevo elemento al estado
    if (index === -1 && checked) {
      const newItem: OrderDetailCreateBody = {
        order_detail_id: detail.id ?? 0,
        quantity,
        expiration_date: detail.expiration_date,
        order: detail.order,
        tracker_detail_product: detail.tracker_detail_product,
      };

      setbody((prevBody) => [...prevBody, newItem]);
    } else {
      // Si el índice no es -1, actualiza la cantidad del detalle existente
      setbody((prevBody) => {
        const newBody = [...prevBody];
        newBody[index].quantity = quantity;
        return newBody;
      });
    }
  };

  useEffect(() => {
    if (id && refetch) {
      refetch();
    }
  }, [id, refetch]);

  useEffect(() => {
    return () => {
      setid(null);
    };
  }, [handleClose]);

  const handleClickConfirmar = () => {
    if (
      trackerOutputActions.some((oa) =>
        oa === null ? false : oa.action !== "noaction"
      )
    ) {
      if (
        trackerOutputActions.some((oa) => {
          if (oa === null || oa.action === "noaction") {
            return false;
          } else {
            const idx =
              order?.order_detail.findIndex((order_d) => {
                return (
                  order_d.product_data?.sap_code ===
                    oa.detalleCargaSalida.sap_code &&
                  oa.detalleCargaSalida.expiration_date ===
                    order_d.expiration_date
                );
              });
            if (idx === undefined || idx < 0 ) {
              return true;
            }
            const disponible = order?.order_detail[idx];
            if (disponible === undefined) {
              return true;
            }

            if (oa.detalleCargaSalida.amount > disponible.quantity_available) {
              toast.error(
                `la cantidad seleccionada del producto ${oa.detalleCargaSalida.name} supera a la cantidad disponible`
              );
              return true;
            }
            if (oa.detalleCargaSalida.amount < 1) {
              toast.error(
                `La cantidad debe ser de al menos 1 producto: ${oa.detalleCargaSalida.name}`
              );
              return true;
            }
            return false;
          }
        })
      ) {
        return;
      }
      dispatch(
        saveOrderHistories(
          indice,
          seguimiento,
          trackerOutputActions,
          () => {
            dispatch(
              updateTracking(indice, seguimiento.id, {
                destination_location: order?.location,
              })
            );
            if (order !== undefined) setLocalidadValue(order.location);
          },
          id as number
        )
      );
    }
    handleClose();
  };

  const onChangeRow: ChangeAction = (detail, event, quantity) => {
    const index = trackerOutputActions.findIndex((oa) =>
      oa === null
        ? false
        : oa.detalleCargaSalida.sap_code === detail.product_data?.sap_code &&
          oa.detalleCargaSalida.expiration_date === detail.expiration_date
    );
    const trackerOutputForDetail = seguimiento.detallesSalida
      ? seguimiento.detallesSalida.findIndex(
          (ds) =>
            ds.sap_code === detail.product_data?.sap_code &&
            ds.expiration_date === detail.expiration_date
        ) > -1
      : false;
    if (index > -1) {
      let action: OrderDetailHistoryUtilActionType = "noaction";
      let updateAction = true;
      const oa = { ...trackerOutputActions[index] } as DetalleCargaSalidaUtil;
      if (event === "checked") {
        if (trackerOutputForDetail) {
          updateAction = false;
        } else {
          action = "add";
        }
      } else if (event === "unchecked") {
        if (trackerOutputForDetail) {
          action = "delete";
        } else {
          action = "noaction";
        }
      } else if (event === "ch-q") {
        if (trackerOutputForDetail) {
          action = "update";
        } else {
          updateAction = false;
        }
      }
      setTrackerOutputActions((prev) => {
        const newOrderActions = [...prev];
        const newValue = { ...oa };
        const detalleCargaSalida = { ...newValue.detalleCargaSalida };
        quantity !== undefined && (detalleCargaSalida.amount = quantity);
        quantity !== undefined &&
          (newValue.detalleCargaSalida = detalleCargaSalida);
        updateAction && (newValue.action = action);
        newOrderActions.splice(index, 1, newValue);
        return newOrderActions;
      });
    }
  };
  return (
    <>
      <BootstrapDialog
        open={open}
        onClose={handleClose}
        fullWidth={true}
        maxWidth="lg"
      >
        <BootstrapDialogTitle
          onClose={() => handleClose()}
          id="customized-dialog-title"
        >
          <Typography variant="h6" component="div" fontWeight={400}>
            Configuración de pedido
          </Typography>
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <OrderSelect
                control={control}
                name="order"
                label="Pedido"
                onChange={(value) => {
                  setid(value?.id ?? null);
                }}
                ignoreCompleted={true}
              />
            </Grid>
            <Grid item xs={3} md={2}></Grid>
            <Grid item xs={3} md={2}>
              <Typography variant="body1" component="h2">
                Localidad:
                <Typography variant="body2" component="h2">
                  {order?.location_data.name}
                </Typography>
              </Typography>
            </Grid>
            <Grid item xs={3} md={2}>
              <Typography variant="body1" component="h2">
                Ruta:
                <Typography variant="body2" component="h2">
                  --
                </Typography>
              </Typography>
            </Grid>
            {order?.status === "COMPLETED" && (
              <Grid item xs={12} sx={{ marginTop: 2, color: "red" }}>
                <Typography variant="body1" component="p">
                  No se puede seleccionar una pedido que ya esté completado
                </Typography>
              </Grid>
            )}
            <Grid item xs={12} sx={{ marginTop: 2 }}>
              <Typography variant="h6" component="h2">
                Detalle del pedido
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell
                        size="small"
                        align="center"
                      ></StyledTableCell>
                      <StyledTableCell size="small" align="center">
                        #Tracking
                      </StyledTableCell>
                      <StyledTableCell size="small" align="center">
                        N° SAP
                      </StyledTableCell>
                      <StyledTableCell size="small" align="left">
                        Producto
                      </StyledTableCell>
                      <StyledTableCell size="small" align="left">
                        Fecha de vencimiento
                      </StyledTableCell>
                      <StyledTableCell size="small" align="center">
                        Cantidad a despachar
                      </StyledTableCell>
                      <StyledTableCell size="small" align="center">
                        Cantidad
                      </StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order?.order_detail
                      .filter((detail) => detail.quantity_available !== 0)
                      .map((detail) => (
                        <TableRowComponent
                          key={detail.id}
                          handleAdd={handleAdd}
                          detail={detail}
                          detallesSalida={seguimiento.detallesSalida}
                          changeAction={onChangeRow}
                        />
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={handleClickConfirmar}
            color="primary"
            disabled={
              !trackerOutputActions.some((oa) =>
                oa === null ? false : oa.action !== "noaction"
              ) || order?.status === "COMPLETED"
            }
          >
            Confirmar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </>
  );
};

type eventChangeOrderSelectModal = "checked" | "unchecked" | "ch-q";
type ChangeAction = (
  detail: OrderDetail,
  event: eventChangeOrderSelectModal,
  quantity?: number
) => unknown;
interface TableRowComponentProps {
  detail: OrderDetail;
  detallesSalida?: DetalleCargaSalida[];
  handleAdd: (detail: OrderDetail, quantity: number, checked: boolean) => void;
  changeAction: ChangeAction;
}
const TableRowComponent: FC<TableRowComponentProps> = ({
  detail,
  detallesSalida,
  handleAdd,
  changeAction,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isTextEnabled, setIsTextEnabled] = useState(isChecked);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    setIsTextEnabled(!isTextEnabled);
  };

  const { register, setValue, watch } = useForm<{ quantity: number | null }>();
  useEffect(() => {
    if (detallesSalida && isChecked) {
      setValue(
        "quantity",
        detallesSalida.find(
          (ds) =>
            ds.sap_code === detail.product_data?.sap_code &&
            ds.expiration_date === detail.expiration_date
        )?.amount ?? null
      );
    }
  }, [
    detail.id,
    detallesSalida,
    isChecked,
    setValue,
    detail.product_data?.sap_code,
    detail.expiration_date,
  ]);

  useEffect(() => {
    const checked = detallesSalida
      ? detallesSalida.findIndex(
          (ds) =>
            ds.sap_code === detail.product_data?.sap_code &&
            ds.expiration_date === detail.expiration_date
        ) > -1
      : false;
    setIsChecked(checked);
    if (checked) {
      setIsTextEnabled(checked);
    }
  }, [
    detail.expiration_date,
    detail.id,
    detail.product_data?.sap_code,
    detallesSalida,
  ]);

  useEffect(() => {
    if (isChecked) {
      setIsTextEnabled(true);
    }
  }, [isChecked]);

  return (
    <TableRow
      style={{ backgroundColor: !isTextEnabled ? "#e0e0e0" : "inherit" }} // Cambia el color de fondo si el texto está deshabilitado
    >
      <StyledTableCell size="small" align="left">
        <Checkbox
          checked={isChecked}
          onChange={() => {
            handleCheckboxChange();
            isChecked &&
              handleAdd(detail, detail.quantity_available, !isChecked);
            isChecked && setValue(`quantity`, null);
            if (isChecked) {
              changeAction(detail, "unchecked");
            } else {
              changeAction(detail, "checked");
            }
          }}
          color="secondary"
        />
      </StyledTableCell>
      <StyledTableCell size="small" align="center">
        TRK-{detail.tracking_id.toString().padStart(5, "0")}
      </StyledTableCell>
      <StyledTableCell size="small" align="center">
        {detail.product_data?.sap_code}
      </StyledTableCell>
      <StyledTableCell size="small" align="left">
        {detail.product_data?.name}
      </StyledTableCell>
      <StyledTableCell size="small" align="left">
        {detail.expiration_date}
      </StyledTableCell>
      <StyledTableCell size="small" align="left">
        {detail.quantity_available}
      </StyledTableCell>
      <StyledTableCell size="small" align="center">
        <TextField
          id="standard-basic"
          label="Cantidad"
          variant="standard"
          color="secondary"
          size="small"
          type="number"
          inputProps={{ min: 1, max: detail.quantity_available }}
          {...register(`quantity`)}
          value={watch(`quantity`) ?? ""}
          disabled={!isTextEnabled}
          onBlur={(e) => {
            changeAction(detail, "ch-q", parseInt(e.currentTarget.value));
          }}
          // onChange={() => changeAction(detail, "ch-q")}
        />
      </StyledTableCell>
    </TableRow>
  );
};

export default TableRowComponent;
