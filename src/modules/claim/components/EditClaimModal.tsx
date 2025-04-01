// EditClaimModal.tsx
import { FC, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  Button,
  Divider,
  Typography,
  Box,
  Grid,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { styled } from "@mui/material/styles";

import { errorApiHandler } from "../../../utils/error";
import {
  Claim,
  useChangeClaimStatusMutation,
} from "../../../store/claim/claimApi";
import { toast } from "sonner";
import BootstrapDialogTitle from "../../ui/components/BoostrapDialog.tsx";
import { useAppSelector } from "../../../store/store.ts";
import { ImagePreviewDropzone } from "../../ui/components/ImagePreviewDropzone.tsx";

const claimStatuses = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_REVISION", label: "En Revisión" },
  { value: "RECHAZADO", label: "Rechazado" },
  { value: "APROBADO", label: "Aprobado" },
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export interface FormData {
  claimNumber: string;
  status: string;
  discardDoc: string;
  observations: string;
  claimFile: File | null;
  creditMemoFile: File | null;
  observationsFile: File | null;
}

export const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

interface ClaimModalProps {
  open: boolean;
  onClose: () => void;
  claim?: Claim;
}

export const EditClaimModal: FC<ClaimModalProps> = ({
  open,
  onClose,
  claim,
}) => {
  const { register, handleSubmit, control, watch, setValue } =
    useForm<FormData>({
      defaultValues: {
        claimNumber: claim?.claim_number || "",
        status: claim?.status || "PENDIENTE",
        discardDoc: claim?.discard_doc || "",
        observations: claim?.observations || "",
        claimFile: null,
        creditMemoFile: null,
        observationsFile: null,
      },
    });

  const [updateStatus, { isLoading, isSuccess, error }] =
    useChangeClaimStatusMutation();

  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isSuccess && !isLoading) {
      toast.success("Estado actualizado con éxito");
    }
  }, [isSuccess, isLoading, error]);

  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();
      formData.append("new_state", data.status);
      formData.append("changed_by_id", user?.id.toString() || "");
      formData.append("new_claim_number", data.claimNumber);
      formData.append("new_discard_doc", data.discardDoc);
      formData.append("new_observations", data.observations);
      if (data.claimFile) formData.append("new_claim_file", data.claimFile);
      if (data.creditMemoFile) formData.append("new_credit_memo_file", data.creditMemoFile);
      if (data.observationsFile) formData.append("new_observations_file", data.observationsFile);

      await updateStatus({id: claim?.id || 0, formData}).unwrap();
      onClose();
    } catch (err: any) {
      console.error("Error al enviar el reclamo:", err);
      errorApiHandler(err, "Error al registrar el reclamo");
    }
  };

  return (
    <BootstrapDialog open={open} maxWidth="lg" fullWidth>
      {/* Conservamos el DialogTitle original */}
      <BootstrapDialogTitle onClose={onClose} id="customized-dialog-title">
        <Typography variant="h6" color="white" fontWeight={400}>
          Editar Reclamo - Tracker Importado
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="white">
            Edite los datos del reclamo y luego haga clic en guardar para guardar los cambios
          </Typography>
        </Box>
      </BootstrapDialogTitle>
      <Divider sx={{ mt: 1 }} />
      <DialogContent sx={{ pb: 0 }}>
        {/* Sección "Datos Generales" que siempre se muestra arriba */}
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary">
              Datos Generales
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Número de Claim"
              fullWidth
              size="small"
              {...register("claimNumber")}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl size="small" fullWidth>
                  <InputLabel id="tipo-label">Estado del Reclamo</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="tipo"
                    {...field}
                    value={watch("status") || ""}
                    label="Estado del Reclamo"
                    MenuProps={MenuProps}
                    {...register("status")}
                  >
                    <MenuItem value="">
                      <em>Estado del Reclamo</em>
                    </MenuItem>
                    {claimStatuses.map((t) => (
                      <MenuItem key={t.value} value={t.value}>
                        {t.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          {/* Documento de Descarte */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Documento de Descarte"
              fullWidth
              size="small"
              {...register("discardDoc")}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Observaciones"
              fullWidth
              size="small"
              multiline
              rows={3}
              {...register("observations")}
            />
          </Grid>
        </Grid>

        <Grid container spacing={1}>
          {/* Datos Generales */}

          {/* Archivos adjuntos */}
          <Grid item xs={12} sm={6} md={4}>
            <ImagePreviewDropzone
              files={[]}
              onFilesChange={(files: File[]) =>
                setValue("claimFile", files[0] || null)
              }
              label="Subir archivo Claim (PDF/Excel)"
              accept={{
                "application/pdf": [".pdf"],
                "application/vnd.ms-excel": [".xls", ".xlsx"],
              }}
              maxFiles={1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ImagePreviewDropzone
              files={[]}
              onFilesChange={(files: File[]) =>
                setValue("creditMemoFile", files[0] || null)
              }
              label="Subir Nota de Crédito (PDF)"
              accept={{ "application/pdf": [".pdf"] }}
              maxFiles={1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ImagePreviewDropzone
              files={[]}
              onFilesChange={(files: File[]) =>
                setValue("observationsFile", files[0] || null)
              }
              label="Subir archivo de Observaciones (PDF)"
              accept={{ "application/pdf": [".pdf"] }}
              maxFiles={1}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button
          variant="outlined"
          type="submit"
          color="primary"
          onClick={handleSubmit(onSubmit)}
        >
          Guardar
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default EditClaimModal;
