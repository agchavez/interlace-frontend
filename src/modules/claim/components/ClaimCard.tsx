import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  Divider,
  IconButton,
} from "@mui/material";
import { FC } from "react";
import { format } from "date-fns";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useAppDispatch } from "../../../store/store";
import { downloadFile } from "../../../store/seguimiento/trackerThunk";

interface ClaimCardProps {
  claim: {
    id: number;
    tracking_id: number;
    trailer: string;
    distributor_center: string;
    created_at: string;
    status: string;
    reason?: string;
    is_archivo_up?: boolean;
    archivo_name?: string;
  };
  onSelectClaim?: (claimId: number) => void;
  onPreviewFile?: (fileUrl: string, fileName: string) => void;
}

export const ClaimCard: FC<ClaimCardProps> = ({ claim, onSelectClaim, onPreviewFile }) => {
  const dispatch = useAppDispatch();

  const handleDownload = () => {
    dispatch(downloadFile(claim.tracking_id));
  };

  const statusLabels: Record<string, { label: string; color: "success" | "warning" | "error" | "secondary" | "info" }> = {
    PENDING: { label: "Pendiente", color: "warning" },
    APPROVED: { label: "Aprobado", color: "success" },
    REJECTED: { label: "Rechazado", color: "error" },
    PROCESSING: { label: "En proceso", color: "info" },
    CANCELED: { label: "Cancelado", color: "secondary" },
  };

  return (
    <Card
      sx={{
        mb: 2,
        cursor: onSelectClaim ? "pointer" : "default",
        "&:hover": onSelectClaim ? { boxShadow: 6 } : {},
        transition: "box-shadow 0.3s ease-in-out"
      }}
      onClick={onSelectClaim ? () => onSelectClaim(claim.id) : undefined}
    >
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" component="div">
                TRK-{claim.tracking_id.toString().padStart(5, '0')}
              </Typography>
              <Chip
                label={statusLabels[claim.status]?.label || claim.status}
                color={statusLabels[claim.status]?.color || "default"}
                size="small"
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Rastra: <strong>{claim.trailer}</strong>
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Centro de Distribución: <strong>{claim.distributor_center}</strong>
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {claim.reason && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Razón:
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {claim.reason}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Fecha: {format(new Date(claim.created_at), "dd/MM/yyyy HH:mm")}
              </Typography>

              {claim.is_archivo_up && (
                <Box>
                  <IconButton
                    size="small"
                    color="primary"
                    title="Ver archivo"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPreviewFile) onPreviewFile(`/api/tracking/${claim.tracking_id}/file/`, claim.archivo_name || '');
                    }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="secondary"
                    title="Descargar archivo"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload();
                    }}
                  >
                    <CloudDownloadIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};