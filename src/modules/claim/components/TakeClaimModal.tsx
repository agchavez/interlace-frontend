import { FC, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  Button,
  Divider,
  Typography,
  Grid,
  DialogContent,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { errorApiHandler } from "../../../utils/error.ts";
import {
  Claim,
  useChangeClaimStatusMutation,
} from "../../../store/claim/claimApi.ts";
import { toast } from "sonner";
import { useAppSelector } from "../../../store/store.ts";
import BootstrapDialogTitleGray from "../../ui/components/claimDialogs/ClaimDialogTitle.tsx";
import AssignmentTurnedInTwoToneIcon from '@mui/icons-material/AssignmentTurnedInTwoTone';

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

export const TakeClaimModal: FC<ClaimModalProps> = ({
  open,
  onClose,
  claim,
}) => {
  const [updateStatus, { isLoading, isSuccess, error }] =
    useChangeClaimStatusMutation();

  const { user } = useAppSelector((state) => state.auth);

  const onSubmit = async () => {
    try {
      if (!claim) return;
      if (!user) return;
      if (claim?.status !== "PENDIENTE") return;
      const formData = new FormData();
      formData.append("new_state", "EN_REVISION");
      formData.append("changed_by_id", user?.id.toString() || "");
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
    <BootstrapDialog open={open} maxWidth="sm" fullWidth onClose={onClose}>
      <BootstrapDialogTitleGray onClose={onClose} id="customized-dialog-title">
        <Typography variant="h6" color="black" fontWeight={450}>
          {islocal ? "Tomar Alerta de Calidad - Tracker Local" : "Tomar Reclamo - Tracker Importado"}
        </Typography>
      </BootstrapDialogTitleGray>
      <DialogContent sx={{ pb: 0 }}>
        <Grid container spacing={1}>
          <Grid item xs={12} marginTop={2}>
            <Typography variant="body1" color="textSecondary">
              {islocal ? "¿Está seguro que desea tomar este alerta de calidad?" : "¿Está seguro que desea tomar este reclamo?"}
            </Typography>
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
          onClick={() => onSubmit()}
          startIcon={<AssignmentTurnedInTwoToneIcon />}
        >
          {islocal ? "Tomar Alerta de Calidad" : "Tomar Reclamo"}
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default TakeClaimModal;
