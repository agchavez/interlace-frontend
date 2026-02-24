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
} from "@mui/material";
import { useForm, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { styled } from "@mui/material/styles";

import { errorApiHandler } from "../../../utils/error.ts";
import {
  Claim,
  useChangeClaimStatusMutation,
} from "../../../store/claim/claimApi.ts";
import { toast } from "sonner";
import { useAppSelector } from "../../../store/store.ts";
import BootstrapDialogTitleGray from "../../ui/components/claimDialogs/ClaimDialogTitle.tsx";
import CancelTwoToneIcon from "@mui/icons-material/CancelTwoTone";
import { ArchivosAdjuntos } from "./ArchivosAdjuntosDrop.tsx";
import { FormDataAcceptClaim } from "./AcceptClaimModal";

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

export interface FormDataRejectClaim {
  reason: string;
  observationsFile: File | null;
}

export const RejectClaimModal: FC<ClaimModalProps> = ({
  open,
  onClose,
  claim,
}) => {
  const { register, handleSubmit, setValue, watch } = useForm<FormDataRejectClaim>({
    defaultValues: {
      reason: claim?.reject_reason || "",
      observationsFile: null,
    },
  });

  const [updateStatus, { isLoading, isSuccess, error }] =
    useChangeClaimStatusMutation();

  const { user } = useAppSelector((state) => state.auth);

  const onSubmit = async (data: FormDataRejectClaim) => {
    try {
      if (!claim) return;
      if (!user) return;
      if (claim?.status !== "EN_REVISION") return;
      const formData = new FormData();
      formData.append("new_state", "RECHAZADO");
      formData.append("changed_by_id", user?.id.toString() || "");
      formData.append("reject_reason", data.reason);
      if (data.observationsFile)
        formData.append("new_observations_file", data.observationsFile);
      console.log(formData);
      await updateStatus({ id: claim?.id || 0, formData }).unwrap();
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

  const islocal = claim?.type === "ALERT_QUALITY";

  return (
    <BootstrapDialog open={open} maxWidth="lg" fullWidth onClose={onClose}>
      <BootstrapDialogTitleGray onClose={onClose} id="customized-dialog-title">
        <Typography variant="h6" color="#fff" fontWeight={450}>
          {islocal
            ? "Rechazar Alerta de Calidad - Tracker Local"
            : "Rechazar Reclamo - Tracker Importado"}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {islocal
            ? "¿Está seguro que desea rechazar esta alerta de calidad? Indique por favor el motivo."
            : "¿Está seguro que desea rechazar este reclamo? Indique por favor el motivo."}
        </Typography>
      </BootstrapDialogTitleGray>
      <DialogContent sx={{ pb: 0 }}>
        <Grid container spacing={1}>
          <Grid item xs={12} marginTop={2}>
            <TextField
              label="Motivo de Rechazo"
              fullWidth
              size="small"
              multiline
              rows={3}
              color="secondary"
              {...register("reason")}
            />
          </Grid>
          {/* Archivo observaciones */}
          <Grid item xs={12} sm={6} md={4}>
            <ArchivosAdjuntos
              label="Observaciones"
              claim={claim}
              setValue={setValue as unknown as UseFormSetValue<FormDataAcceptClaim>}
              watch={watch as unknown as UseFormWatch<FormDataAcceptClaim>}
              fieldName="observationsFile"
              accept={{ "application/pdf": [".pdf"] }}
              tooltipTitle="Documento con observaciones adicionales sobre el reclamo (PDF)"
              dropZoneLabel="Subir Observaciones (PDF)"
              placeHolderText="Sin Observaciones"
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
          startIcon={<CancelTwoToneIcon />}
        >
          {isLoading ? "Guardando cambios..." : islocal ? "Rechazar Alerta de Calidad" : "Rechazar Reclamo"}
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default RejectClaimModal;
