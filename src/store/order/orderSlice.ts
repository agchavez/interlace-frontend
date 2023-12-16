import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OrderDetail, OrderStatusType, OutOrder } from "../../interfaces/orders";
import { LocationType } from "../../interfaces/maintenance";

export interface OrderStore {
  id: number | null;
  created_at: string | null;
  order_detail: OrderDetail[];
  status: OrderStatusType | null;
  observations: string | null;
  distributor_center: number | null;
  user: number | null;
  location: number | null;
  location_data: LocationType | null;
  out_order: OutOrder | null;
}

interface orderInterface {
  loading: boolean;
  order: OrderStore;
  order_detail_delete: number[];
  changed: boolean;
}

const initialState: orderInterface = {
  loading: false,
  changed: false,
  order: {
    order_detail: [],
    status: null,
    observations: null,
    distributor_center: null,
    user: null,
    location: null,
    id: null,
    created_at: null,
    location_data: null,
    out_order: null,
  },
  order_detail_delete: [],
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    reset: (state) => {
      state.order = {
        order_detail: [],
        status: null,
        observations: null,
        distributor_center: null,
        user: null,
        location: null,
        id: null,
        created_at: null,
        location_data: null,
        out_order: null
      };
      state.order_detail_delete = [];
      state.changed = false;
    },
    setChanged: (state, action: PayloadAction<boolean>) => {
      state.changed = action.payload;
    },
    setOrder: (state, action: PayloadAction<Partial<OrderStore>>) => {
      state.changed = false;
      state.order = { ...state.order, ...action.payload };
    },
    changeOrder: (state, action: PayloadAction<Partial<OrderStore>>) => {
      if (
        (action.payload.observations !== undefined &&
          action.payload.observations !== state.order.observations) ||
        (action.payload.location !== undefined &&
          action.payload.location !== state.order.location)
      ) {
        state.changed = true;
      }
      state.order = { ...state.order, ...action.payload };
    },
    addOrderDetail: (state, action: PayloadAction<OrderDetail>) => {
      const order = state.order;
      const orderDetail = action.payload;
      order.order_detail.push(orderDetail);
      state.changed=true
    },
    setOrderDetail: (
      state,
      action: PayloadAction<{
        index: number;
        orderDetail: Partial<OrderDetail>;
      }>
    ) => {
      const order = state.order;
      const { index, orderDetail } = action.payload;
      let ordenacual = order.order_detail[index];
      ordenacual = { ...ordenacual, ...orderDetail };
      order.order_detail[index] = ordenacual;
      state.changed=true
    },
    removeOrderDetail: (
      state,
      action: PayloadAction<{
        index: number;
      }>
    ) => {
      const order = state.order;
      const index = action.payload.index;
      const order_details = order.order_detail;
      const order_detail = order_details[index];
      order_detail.id !== null &&
        state.order_detail_delete.push(order_detail.id);
      order_details.splice(index, 1);
      state.changed=true
    },
    clearOrderDetailDelete: (state) => {
      state.order_detail_delete = [];
    },
    setLoadingOrder: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setOrder,
  setOrderDetail,
  changeOrder,
  removeOrderDetail,
  setLoadingOrder,
  reset,
  addOrderDetail,
  clearOrderDetailDelete,
  setChanged,
} = orderSlice.actions;
