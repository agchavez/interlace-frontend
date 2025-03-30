import { createAsyncThunk } from "@reduxjs/toolkit";
import { errorApiHandler } from "../../utils/errorApiHandler";
import { claimApi } from "./claimApi";
import { setError, setLoading, setSelectedClaim } from "./claimSlice";

export const getClaimById = createAsyncThunk(
  "claim/getClaimById",
  async (id: number, { dispatch, getState, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));

      // Utiliza el endpoint de RTK Query para obtener la información del reclamo
      const claimResponse = await dispatch(
        claimApi.endpoints.getClaimById.initiate(id)
      ).unwrap();

      dispatch(setSelectedClaim(claimResponse));
      dispatch(setLoading(false));
      return claimResponse;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error?.data?.message || "Error al obtener el reclamo"));
      errorApiHandler(error, "Error al cargar la información del reclamo");
      return rejectWithValue(error);
    }
  }
);

export const updateClaimStatus = createAsyncThunk(
  "claim/updateClaimStatus",
  async (
    {
      id,
      new_state,
      changed_by_id
    }: {
      id: number;
      new_state: string;
      changed_by_id?: number
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setLoading(true));

      const response = await dispatch(
        claimApi.endpoints.changeClaimStatus.initiate({
          id,
          new_state,
          changed_by_id
        })
      ).unwrap();

      // Actualiza el reclamo seleccionado con los nuevos datos
      dispatch(setSelectedClaim(response));
      dispatch(setLoading(false));

      // Muestra mensaje de éxito
      errorApiHandler(
        { data: { mensage: `Estado del reclamo actualizado a: ${new_state}` } },
        ""
      );

      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error?.data?.message || "Error al actualizar el estado del reclamo"));
      errorApiHandler(error, "Error al cambiar el estado del reclamo");
      return rejectWithValue(error);
    }
  }
);

export const createClaim = createAsyncThunk(
  "claim/createClaim",
  async (formData: FormData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));

      const response = await dispatch(
        claimApi.endpoints.createClaim.initiate(formData)
      ).unwrap();

      dispatch(setLoading(false));

      // Muestra mensaje de éxito con el ID del reclamo creado
      errorApiHandler(
        { data: { mensage: `Reclamo #${response.id} creado correctamente` } },
        ""
      );

      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error?.data?.message || "Error al crear el reclamo"));
      errorApiHandler(error, "Error al crear el reclamo");
      return rejectWithValue(error);
    }
  }
);

export const updateClaim = createAsyncThunk(
  "claim/updateClaim",
  async (
    { id, formData }: { id: number; formData: FormData },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setLoading(true));

      const response = await dispatch(
        claimApi.endpoints.updateClaim.initiate({ id, formData })
      ).unwrap();

      dispatch(setLoading(false));

      // Actualiza el reclamo seleccionado si es necesario
      dispatch(setSelectedClaim(response));

      // Muestra mensaje de éxito
      errorApiHandler(
        { data: { mensage: `Reclamo #${response.id} actualizado correctamente` } },
        ""
      );

      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error?.data?.message || "Error al actualizar el reclamo"));
      errorApiHandler(error, "Error al actualizar el reclamo");
      return rejectWithValue(error);
    }
  }
);

// También se incluye una función que podría ser útil para obtener múltiples reclamos
// cuando no quieres usar directamente el hook de RTK Query
export const getAllClaims = createAsyncThunk(
  "claim/getAllClaims",
  async (params: any, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));

      const response = await dispatch(
        claimApi.endpoints.getClaims.initiate(params)
      ).unwrap();

      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error?.data?.message || "Error al obtener los reclamos"));
      errorApiHandler(error, "Error al cargar los reclamos");
      return rejectWithValue(error);
    }
  }
);