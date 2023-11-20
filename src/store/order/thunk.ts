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
} from "../../interfaces/orders";
import { AxiosError, AxiosResponse } from "axios";
import { TrackerDetailResponse } from "../../interfaces/tracking";
import { CreateLocationBody, CreateRouteBody, LocationType, Route } from "../../interfaces/maintenance";
import { OrderExcelResponse } from '../../interfaces/orders';
// Restablecer contraseña de usuario
export const createOrder = (order: OrderCreateBody): AppThunk => {
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
          return apicreateOrderDetail(auth.token, { ...detail, order: resp.data.id, order_detail_id: detail.id || 0 });
        });
        Promise.all(details).then(async () => {
          const response = await backendApi.get<Order>(
            `/order/${resp.data.id}/`,
            {
              headers: { Authorization: `Bearer ${auth.token}` },
            }
          );
          dispatch(setOrder(response.data));
          toast.success("Pedido guardado con exito");
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
          return apicreateOrderDetail(auth.token, { ...detail, order: resp.data.id, order_detail_id: detail.id || 0 });
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
      console.log("error")
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
    return await backendApi.post<
      Order,
      AxiosResponse<OrderDetail, AxiosResponse<OrderDetail>>
    >(`/order-detail/`, order, {
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
    } catch (error) {
      errorApiHandler(error, "No se pudo eliminar el detalle de pedido");
    } finally {
      dispatch(setLoadingOrder(false));
    }
  };
};
