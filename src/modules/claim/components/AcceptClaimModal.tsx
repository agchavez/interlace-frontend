import { FC, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  Button,
  Divider,
  Typography,
  Grid,
  DialogContent,
  TextField,
  Box,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { styled } from "@mui/material/styles";

import { errorApiHandler } from "../../../utils/error.ts";
import {
  Claim,
  useChangeClaimStatusMutation,
} from "../../../store/claim/claimApi.ts";
import { toast } from "sonner";
import { useAppSelector } from "../../../store/store.ts";
import { ImagePreviewDropzone } from "../../ui/components/ImagePreviewDropzone.tsx";
import BootstrapDialogTitleGray from "../../ui/components/claimDialogs/ClaimDialogTitle.tsx";
import CheckCircleTwoToneIcon from "@mui/icons-material/CheckCircleTwoTone";

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

export interface FormData {
  claimNumber: string;
  status: string;
  discardDoc: string;
  observations: string;
  claimFile: File | null;
  creditMemoFile: File | null;
  observationsFile: File | null;
}

export const AcceptClaimModal: FC<ClaimModalProps> = ({
  open,
  onClose,
  claim,
}) => {
  const { register, handleSubmit, setValue } = useForm<FormData>({
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

  const onSubmit = async (data: FormData) => {
    try {
      if (!claim) return;
      if (!user) return;
      if (claim?.status !== "EN_REVISION") return;
      const formData = new FormData();
      formData.append("new_state", "APROBADO");
      formData.append("changed_by_id", user?.id.toString() || "");
      formData.append("new_claim_number", data.claimNumber);
      formData.append("new_discard_doc", data.discardDoc);
      formData.append("new_observations", data.observations);
      if (data.claimFile) formData.append("new_claim_file", data.claimFile);
      if (data.creditMemoFile)
        formData.append("new_credit_memo_file", data.creditMemoFile);
      if (data.observationsFile)
        formData.append("new_observations_file", data.observationsFile);
      await updateStatus({ id: claim?.id || 0, formData }).unwrap();
      onClose();
    } catch (err) {
      console.error("Error al registrar el reclamo:", err);
      errorApiHandler(err, "Error al cambiar el estado del reclamo");
    }
  };

  useEffect(() => {
    if (isSuccess && !isLoading) {
      toast.success("Estado actualizado con éxito");
      onClose();
    }
  }, [isSuccess, isLoading, error, onClose]);

  useEffect(() => {
    if (open) {
      setValue("claimNumber", claim?.claim_number || "");
      setValue("status", claim?.status || "PENDIENTE");
      setValue("discardDoc", claim?.discard_doc || "");
      setValue("observations", claim?.observations || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const islocal = claim?.type === "ALERT_QUALITY";

  return (
    <BootstrapDialog open={open} maxWidth="lg" fullWidth onClose={onClose}>
      <BootstrapDialogTitleGray onClose={onClose} id="customized-dialog-title">
        <Typography variant="h6" color="black" fontWeight={450}>
          {islocal ? "Aprobar Alerta de Calidad - Tracker Local" : "Aprobar Reclamo - Tracker Importado"}
        </Typography>
        <Typography variant="body1">
          {islocal ? "¿Está seguro que desea aceptar esta alerta de calidad?" : "¿Está seguro que desea aceptar este reclamo?"}
        </Typography>
      </BootstrapDialogTitleGray>
      <DialogContent sx={{ pb: 0 }}>
        <Grid container spacing={1} marginTop={1}>
          <Grid item xs={12}>
            <Typography variant="body2">
              {islocal ? "Al aceptar esta alerta de calidad no podra editarla nuevamente." : "Al aceptar este reclamo no podra editarlo nuevamente."} 
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                alignContent: "center",
                alignItems: "center",
                my: 2,
              }}
            >
              <Divider sx={{ flexGrow: 1 }} />
              <Typography variant="body2" marginX={1}>
                Datos Generales
              </Typography>
              <Divider sx={{ flexGrow: 10 }} />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Número de Claim"
              fullWidth
              size="small"
              color="secondary"
              {...register("claimNumber")}
            />
          </Grid>

          {/* Documento de Descarte */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Documento de Descarte"
              fullWidth
              size="small"
              color="secondary"
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
              color="secondary"
              {...register("observations")}
            />
          </Grid>
        </Grid>
        <Box
          sx={{
            display: "flex",
            alignContent: "center",
            alignItems: "center",
            my: 2,
          }}
        >
          <Divider sx={{ flexGrow: 1 }} />
          <Typography variant="body2" marginX={1}>
            {islocal ? "Archivos de la Alerta de Calidad" : "Archivos del Reclamo"}
          </Typography>
          <Divider sx={{ flexGrow: 10 }} />
        </Box>
        <Grid container spacing={1}>
          {/* Archivos adjuntos */}
          <Grid item xs={12} sm={6} md={4}>
            <ImagePreviewDropzone
              files={[]}
              onFilesChange={(files: File[]) =>
                setValue("claimFile", files[0] || null)
              }
              label={ islocal ? "Subir Solicitud de Resolución (PDF/Excel)" : "Subir archivo Claim (PDF/Excel)"}
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
              label={islocal ? "Subir Memorandum de Credito (PDF)" : "Subir Nota de Crédito (PDF)"}
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
      <DialogActions sx={{ display: "flex", justifyContent: "right" }}>
        <Button
          variant="outlined"
          type="submit"
          color="secondary"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          type="submit"
          color="secondary"
          onClick={handleSubmit(onSubmit)}
          startIcon={<CheckCircleTwoToneIcon />}
        >
          {islocal ? "Aprobar Alerta de Calidad" : "Aprobar Reclamo"}
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default AcceptClaimModal;
