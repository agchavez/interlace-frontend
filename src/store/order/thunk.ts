import { AppThunk, RootState } from "..";
import backendApi from "../../config/apiConfig";
import {
  addOrderDetail,
  clearOrderDetailDelete,
  setLoadingOrder,
  setOrder,
} from "./orderSlice";
import { errorApiHandler } from "../../utils/error";
import { toast } from "sonner";
import {
  EditableOrderCreateBody,
  EditableOrderDetailCreateBody,
  LocationRouteCreateData,
  Order,
  OrderCreateBody,
  OrderDetail,
  OrderDetailCreateBody,
  OutOrder,
  OutOrderData,
  ProductData,
} from "../../interfaces/orders";
import { AxiosError, AxiosResponse } from "axios";
import { TrackerDetailResponse } from "../../interfaces/tracking";
import { CreateLocationBody, CreateRouteBody, LocationType, Route } from "../../interfaces/maintenance";
import { OrderExcelResponse } from '../../interfaces/orders';
// Restablecer contraseña de usuario
export const createOrder = (order: OrderCreateBody, navigate?:(to:string)=>void): AppThunk => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoadingOrder(true));
      const {
        auth,
        order: {
          order: { order_detail },
        },
      } = getState() as RootState;
      const resp = await backendApi.post<Order, AxiosResponse<Order>>(
        `/order/`,
        order,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      if (resp.status === 201) {
        const details = order_detail.map((detail) => {
          const createBody: OrderDetailCreateBody = {
            quantity: detail.quantity,
            order: resp.data.id,
          };
          
          // FUNCIONALIDAD HÍBRIDA: Agregar campos según tipo
          if (detail.tracker_detail_product) {
            createBody.tracker_detail_product = detail.tracker_detail_product;
          } else if (detail.product) {
            createBody.product = detail.product;
            createBody.distributor_center = detail.distributor_center || undefined;
            createBody.expiration_date = detail.expiration_date;
          }
          
          return apicreateOrderDetail(auth.token, createBody);
        });
        Promise.allSettled(details).then(async () => {
          toast.success("Pedido guardado con exito");
          navigate && navigate(`/order/register?edit=true&orderId=${resp.data.id}`)
        });
      }
    } catch (error) {
      errorApiHandler(error, "No se pudo guardar el Pedido");
    } finally {
      dispatch(setLoadingOrder(false));
    }
  };
};

export const createOrderByExcel = (
  file: File, location: number, obs: string, onCompleted: (data: OrderExcelResponse) => void
): AppThunk => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoadingOrder(true));
      const {
        auth,
      } = getState() as RootState;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("location", location.toString());
      formData.append("observations", obs);
      const resp = await backendApi.post<OrderExcelResponse, AxiosResponse<OrderExcelResponse>>(
        `/order-detail/load-excel/`,
        formData,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      if (resp.status === 201) {
        toast.success("Pedido guardado con exito");
      }
      onCompleted(resp.data);
    } catch (error) {
      errorApiHandler(error, "No se pudo guardar el Pedido");
    } finally {
      dispatch(setLoadingOrder(false));
    }
  };
}

export const createLocationAndRoute = (locationRouteData: LocationRouteCreateData): AppThunk => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoadingOrder(true));
      const {
        auth
      } = getState() as RootState;
      const locationBody:CreateLocationBody = {
        name:locationRouteData.name,
        code:locationRouteData.code,
      }
      const resp_location = await backendApi.post<LocationType, AxiosResponse<LocationType>>(
        `/location/`,
        locationBody,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      if (resp_location.status === 201) {
        const routeBody:CreateRouteBody = {
          distributor_center:locationRouteData.distributor_center,
          code:locationRouteData.routeCode,
          location: resp_location.data.id
        }
        const resp_route = await backendApi.post<Route, AxiosResponse<Route>>(
          `/route/`,
          routeBody,
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
        if(resp_route.status === 201) {
          toast.success("Creado con exito")
        }
      }
    } catch (error) {
      errorApiHandler(error, "No se pudo guardar");
    } finally {
      dispatch(setLoadingOrder(false));
    }
  };
};

export const updateOrder = (
  id: number,
  order: Partial<EditableOrderCreateBody>
): AppThunk => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoadingOrder(true));
      const {
        auth,
        order: {
          order_detail_delete,
          order: { order_detail },
        },
      } = getState() as RootState;
      const resp = await backendApi.patch<Order, AxiosResponse<Order>>(
        `/order/${id}/`,
        order,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      if (resp.status === 200) {
        const deleteDetails = order_detail_delete.map((id) => {
          return dispatch(deleteOrderDetail(id))
        });
        await Promise.all(deleteDetails)
        .then(async () => {
          await backendApi.get<Order>(`/order/${id}/`, {
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          dispatch(clearOrderDetailDelete());
        })
        .catch((reason) => {
          console.log(reason);
        });
        const details = order_detail.map((detail) => {
          if (detail.id) {
            return 
            // dispatch(updateOrderDetail(detail.id, detail));
          }
          const createBody: OrderDetailCreateBody = {
            quantity: detail.quantity,
            order: resp.data.id,
          };
          
          // FUNCIONALIDAD HÍBRIDA: Agregar campos según tipo
          if (detail.tracker_detail_product) {
            createBody.tracker_detail_product = detail.tracker_detail_product;
          } else if (detail.product) {
            createBody.product = detail.product;
            createBody.distributor_center = detail.distributor_center || undefined;
            createBody.expiration_date = detail.expiration_date;
          }
          
          return apicreateOrderDetail(auth.token, createBody);
        });
        await Promise.all(details)
          .then(async () => {
            const resp = await backendApi.get<Order>(`/order/${id}/`, {
              headers: { Authorization: `Bearer ${auth.token}` },
            });
            dispatch(clearOrderDetailDelete());
            dispatch(setOrder(resp.data));
            toast.success("Pedido actualizado con exito");
          })
          .catch((reason) => {
            console.log(reason);
          });
      }
    } catch (error) {
      errorApiHandler(error, "No se pudo actualizar el Pedido");
    } finally {
      dispatch(setLoadingOrder(false));
    }
  };
};

export const deleteOrder = (id: number, cb?:()=>void): AppThunk => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoadingOrder(true));
      const { auth } = getState() as RootState;
      const resp = await backendApi.delete(`/order/${id}/`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (resp.status === 204) {
        toast.success("Pedido eliminado con exito");
        cb && cb()
      }
    } catch (error) {
      errorApiHandler(error, "No se pudo eliminar el pedido");
    } finally {
      dispatch(setLoadingOrder(false));
    }
  };
};

export const getOrder = (id: number, cb?:()=>void): AppThunk => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoadingOrder(true));
      const { auth } = getState() as RootState;
      const resp = await backendApi.get<Order, AxiosResponse<Order>>(`/order/${id}/`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (resp.status === 200) {
        dispatch(setOrder(resp.data))
        cb && cb()
      }
    } catch (error) {
      console.log("error", error)
      errorApiHandler(error, "No se pudo obtener el pedido");
    } finally {
      dispatch(setLoadingOrder(false));
    }
  };
};

export const createOrderDetail = (
  order: OrderDetailCreateBody,
  cb?: () => void
): AppThunk => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoadingOrder(true));
      const { auth } = getState() as RootState;
      const resp = await backendApi.post<
        Order,
        AxiosResponse<OrderDetail, AxiosResponse<OrderDetail>>
      >(`/order-detail/`, order, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (resp.status === 200) {
        cb && cb();
      }
    } catch (error) {
      errorApiHandler(error, "No se pudo guardar el detalle de pedido");
    } finally {
      dispatch(setLoadingOrder(false));
    }
  };
};

const apicreateOrderDetail = async (token: string, order: OrderDetailCreateBody) => {
  try {
    // FUNCIONALIDAD HÍBRIDA: Preparar payload según tipo de producto
    const payload = {
      quantity: order.quantity,
      order: order.order,
    };

    // Si tiene tracker_detail_product, es modo tracker (actual)
    if (order.tracker_detail_product) {
      Object.assign(payload, {
        tracker_detail_product: order.tracker_detail_product,
      });
    }
    // Si tiene product, es modo directo (nuevo)
    else if (order.product) {
      Object.assign(payload, {
        product: order.product,
        distributor_center: order.distributor_center,
        expiration_date: order.expiration_date,
      });
    }

    return await backendApi.post<
      Order,
      AxiosResponse<OrderDetail, AxiosResponse<OrderDetail>>
    >(`/order-detail/`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    if (error instanceof AxiosError) toast.error(error.response?.data.mensage);
    throw error;
  }
};

export const updateOrderDetail = (
  id: number,
  order: EditableOrderDetailCreateBody
): AppThunk => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoadingOrder(true));
      const { auth } = getState() as RootState;
      const resp = await backendApi.patch<
        OrderDetail,
        AxiosResponse<OrderDetail>
      >(`/order-detail/${id}/`, order, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (resp.status === 200) {
        toast.success("Detalle de pedido actualizado con exito");
      }
    } catch (error) {
      errorApiHandler(error);
    } finally {
      dispatch(setLoadingOrder(false));
    }
  };
};

export const fetchUpdateOrderDetail = async (
  token: string,
  id: number,
  order: EditableOrderDetailCreateBody
) => {
  const resp = await backendApi.patch<OrderDetail, AxiosResponse<OrderDetail>>(
    `/order-detail/${id}/`,
    order,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (resp.status === 200) {
    toast.success("Detalle de pedido actualizado con exito");
  }
};

export const deleteOrderDetail = (id: number): AppThunk => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoadingOrder(true));
      const { auth } = getState() as RootState;
      const resp = await backendApi.delete(`/order-detail/${id}/`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (resp.status === 200) {
        toast.success(
          "Detalle de pedido eliminado con exito"
        );
      }
    } catch (error) {
      errorApiHandler(error, "No se pudo eliminar el detalle de pedido");
    } finally {
      dispatch(setLoadingOrder(false));
    }
  };
};

export const fetchDeleteOrderDetail = async (token: string, id: number) => {
  try {
    return await backendApi.delete(`/order-detail/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    if (error instanceof AxiosError) toast.error(error.response?.data.mensage);
    throw error;
  }
};

export const addOrderDetailState = (
  trackerDetailId: number,
  orderDetail: Omit<OrderDetail, "product_data">
): AppThunk => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoadingOrder(true));
      const { auth } = getState() as RootState;
      
      // FUNCIONALIDAD HÍBRIDA: Si trackerDetailId es -1, es producto directo
      if (trackerDetailId === -1) {
        // Producto directo - necesitamos obtener los datos del producto
        if (orderDetail.product) {
          const productResponse = await backendApi.get<ProductData>(
            `/product/${orderDetail.product}/`,
            {
              headers: { Authorization: `Bearer ${auth.token}` },
            }
          );
          if (productResponse.status === 200) {
            dispatch(
              addOrderDetail({
                ...orderDetail,
                product_data: productResponse.data,
              })
            );
          }
        } else {
          dispatch(
            addOrderDetail({
              ...orderDetail,
              product_data: null,
            })
          );
        }
      } else {
        // Producto con tracker (funcionalidad original)
        const response = await backendApi.get<TrackerDetailResponse>(
          `/tracker-detail/${trackerDetailId}/`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        const product = response.data.product_data;
        if (response.status === 200) {
          dispatch(
            addOrderDetail({
              ...orderDetail,
              product_data: product,
            })
          );
        }
      }
    } catch (error) {
      errorApiHandler(error, "No se pudo agregar el detalle de pedido");
    } finally {
      dispatch(setLoadingOrder(false));
    }
  };
};

export const addOutOrder = (
  orderOutData: OutOrderData
): AppThunk => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoadingOrder(true));
      const { auth, } = getState() as RootState;
      const orderOutBody = new FormData()
      orderOutBody.append("fleet", orderOutData.fleet)
      orderOutBody.append("order", orderOutData.order.toString())
      orderOutBody.append("type", orderOutData.type)
      orderOutBody.append("document_number", orderOutData.document_number)
      orderOutBody.append("vehicle", orderOutData.vehicle)
      orderOutData.document_name && orderOutBody.append("document_name", orderOutData.document_name)
      orderOutData.document && orderOutBody.append("document", orderOutData.document)
      const response = await backendApi.post<OutOrder, AxiosResponse<OutOrder>>(
        `/out-order/`,
        orderOutBody,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      if (response.status === 201) {
        const resp = await backendApi.get<Order>(`/order/${orderOutData.order}/`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        dispatch(setOrder(resp.data));
      }
    } catch (error) {
      errorApiHandler(error, "No se pudo guardar la Salida de Pedido");
    } finally {
      dispatch(setLoadingOrder(false));
    }
  };
};


export const downloadDocument =
  (outOrderId: number, onStopLoading?: () => void): AppThunk =>
  async (dispatch, getState) => {
    try {
      dispatch(setLoadingOrder(true));
      const { token } = getState().auth;
      const { seguimientos, seguimeintoActual } = getState().seguimiento;
      const response = await backendApi.get(`/out-order/${outOrderId}/get-file/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });
      if (response.status >= 400) {
        toast.error("No se ha podido descargar");
        return;
      }
      if (response.status !== 200) {
        toast.error(
          `Error al descargar el archivo. Código de estado: ${response.status}`
        );
        return;
      }
      const contentDisposition = response.headers["content-disposition"];
      let fileName;
      const filenameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      );
      if (contentDisposition) {
        if (filenameMatch) {
          fileName = filenameMatch[1]
            .trim()
            .replace(/^("+|"+)$/g, "")
            .replace(/"/g, "");
        } else {
          fileName =
            seguimeintoActual !== undefined
              ? seguimientos[seguimeintoActual].id
              : "archivo_tracking";
        }
      }
      const blob = new Blob([response.data], {
        type: "application/octet-stream",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = decodeURIComponent(fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Liberar la URL del objeto
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      errorApiHandler(error, "No se pudo guardar la Salida de Pedido");
    } finally {
      dispatch(setLoadingOrder(false));
      onStopLoading && onStopLoading();
    }
  };