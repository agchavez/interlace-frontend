// Detalles de un reclamo
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import {
  Claim,
  ClaimFile,
  useGetClaimByIdQuery,
} from "../../../store/claim/claimApi";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PictureAsPdfTwoToneIcon from "@mui/icons-material/PictureAsPdfTwoTone";
import ClaimPDF from "../../tracker/components/ClaimPDF";
import DownloadIcon from "@mui/icons-material/Download";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { PDFPreviewModal } from "../../ui/components/PDFPreviewModal";
import { ImagePreviewModal } from "../../ui/components/ImagePreviewModal";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import TableChartIcon from "@mui/icons-material/TableChart";
import InventoryIcon from "@mui/icons-material/Inventory";
import InventoryTwoToneIcon from "@mui/icons-material/InventoryTwoTone";
import RejectClaimModal from "../components/RejectClaimModal";
import AcceptClaimModal from "../components/AcceptClaimModal";
import TakeClaimModal from "../components/TakeClaimModal";
import AssignmentTurnedInTwoToneIcon from '@mui/icons-material/AssignmentTurnedInTwoTone';
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';
import ClaimEditModal from "../../tracker/components/ClaimEditModal";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import { useAppSelector } from "../../../store";
import QRToBase64 from "../components/QRToBase64";
import { parseTrackerSeguimiento } from "../../../store/seguimiento/trackerThunk";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

const claimStatuses: Record<string, { label: string; color: string; bgcolor: string; icon: React.ReactNode }> = {
  PENDIENTE: { label: "Pendiente", color: "#ed6c02", bgcolor: "#fff4e5", icon: <PendingOutlinedIcon /> },
  EN_REVISION: { label: "En Revisión", color: "#0288d1", bgcolor: "#e3f2fd", icon: <HourglassEmptyIcon /> },
  RECHAZADO: { label: "Rechazado", color: "#d32f2f", bgcolor: "#ffebee", icon: <CancelOutlinedIcon /> },
  APROBADO: { label: "Aprobado", color: "#2e7d32", bgcolor: "#e8f5e9", icon: <CheckCircleOutlineIcon /> },
};

// Componente para mostrar un campo de información
const InfoField = ({ label, value, icon, color = "#1976d2" }: { label: string; value: React.ReactNode; icon?: React.ReactNode; color?: string }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
      {icon && <Box sx={{ color, display: 'flex' }}>{icon}</Box>}
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
      {value || "--"}
    </Typography>
  </Box>
);

interface ClaimDetailPageProps {
  canEditStatus?: boolean;
  canEditInfo?: boolean;
}

export default function ClaimDetailPage({
  canEditStatus = false,
  canEditInfo = false,
}: ClaimDetailPageProps) {
  const theme = useTheme(); // Add this line to access the theme object
  const { id } = useParams();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [openTake, setOpenTake] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [openAccept, setOpenAccept] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const { data, refetch } = useGetClaimByIdQuery(Number(id));

  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (data) {
      setClaim(data);
    }
  }, [data]);

  useEffect(() => {
    refetch();
  }, [id, refetch]);

  const islocal = claim?.type === "ALERT_QUALITY";

  const showEditButton = canEditInfo && ["PENDIENTE", "EN_REVISION"].includes(claim?.status || "") && user?.centro_distribucion === claim?.tracking?.distributor_center;

  const {canViewPage, canChangeStatus, canChangeInfo} = useMemo(() => {
    const resp = {canViewPage: false, canChangeStatus: false, canChangeInfo: false};
    if (!user) return resp;
    if (!claim) return resp;
    const canViewClaimsPermission = user?.list_permissions.includes("imported.view_claimmodel");
    if (!canViewClaimsPermission) return resp;
    // change status
    let canChangeStatus = false;
    if (canEditStatus) {
      const canChangeStatusClaimImport = user.list_permissions.includes("imported.change_status_claimmodel");
      const canChangeStatusClaimLocal = user.list_permissions.includes("imported.change_status_claimmodelLocal");
      if (!(canChangeStatusClaimImport || canChangeStatusClaimLocal)) return resp;
      if (islocal && !canChangeStatusClaimLocal) return resp;
      if (!islocal && !canChangeStatusClaimImport) return resp;
      if (islocal) {
        canChangeStatus= canChangeStatusClaimLocal
      } else {
        canChangeStatus= canChangeStatusClaimImport;
      }
    }
    // change info
    let canChangeInfo = false;
    if (canEditInfo) {
      const canChangeInfoClaim = user.list_permissions.includes("imported.change_claimmodel");
      canChangeInfo= canChangeInfoClaim;
    }
    return {canViewPage: true, canChangeStatus, canChangeInfo};
  }, [canEditInfo, canEditStatus, claim, islocal, user]);

  if (!user||!claim) return null;
  if (!canViewPage) return (<Navigate to="/" />);

  const statusConfig = claim?.status ? claimStatuses[claim.status] : null;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1600, mx: 'auto' }}>
      <QRToBase64 value={`${import.meta.env.VITE_JS_FRONTEND_URL}/tracker/detail/${claim?.tracking?.id}?alertClaimOpen=true`} logoSrc="/logo-qr.png" onReady={(dataUrl) => setQrDataUrl(dataUrl)} />
      {claim && <ClaimEditModal
          open={claimOpen}
          onClose={() => setClaimOpen(false)}
          claimId={claim?.id || 0}
          seguimiento={parseTrackerSeguimiento(claim.tracking)}
      />}

      {/* Header Principal */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 2,
          bgcolor: '#1c2536',
          color: 'white',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
            {/* Info Principal */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {claim?.tracking?.distributor_center_data?.country_code && (
                <Box
                  component="img"
                  src={`https://flagcdn.com/w80/${claim?.tracking?.distributor_center_data.country_code.toLowerCase()}.png`}
                  alt={claim?.tracking?.distributor_center_data.country_code}
                  sx={{ width: 50, height: 35, borderRadius: 1, border: '2px solid rgba(255,255,255,0.3)' }}
                />
              )}
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  TRK-{claim?.tracking?.id?.toString().padStart(5, "0")}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Chip
                    label={islocal ? "Alerta de Calidad" : "Importación"}
                    size="small"
                    sx={{ bgcolor: islocal ? 'warning.main' : 'info.main', color: 'white', fontWeight: 600, height: 24 }}
                  />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {claim?.tracking?.distributor_center_data?.name}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Estado y Acciones */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {statusConfig && (
                <Chip
                  icon={<Box sx={{ color: 'inherit', display: 'flex', '& svg': { fontSize: 16 } }}>{statusConfig.icon}</Box>}
                  label={statusConfig.label}
                  sx={{
                    bgcolor: statusConfig.bgcolor,
                    color: statusConfig.color,
                    fontWeight: 600,
                    '& .MuiChip-icon': { ml: 0.5, color: statusConfig.color }
                  }}
                />
              )}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {showEditButton && canChangeInfo && (
                  <IconButton onClick={() => setClaimOpen(true)} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                    <EditTwoToneIcon fontSize="small" />
                  </IconButton>
                )}
                <PDFDownloadLink
                  fileName={claim ? `CLAIM-${claim.id?.toString().padStart(5, "0")}` : ""}
                  document={<ClaimPDF claim={claim ? claim : undefined} qrDataUrl={qrDataUrl || undefined} />}
                >
                  {({ loading: pdfLoading }) => (
                    <IconButton disabled={pdfLoading} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                      {pdfLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <PictureAsPdfTwoToneIcon fontSize="small" />}
                    </IconButton>
                  )}
                </PDFDownloadLink>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      {canChangeStatus && (claim?.status === "PENDIENTE" || claim?.status === "EN_REVISION") && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {claim?.status === "PENDIENTE" && (
            <Button
              variant="contained"
              size="large"
              onClick={() => setOpenTake(true)}
              startIcon={<AssignmentTurnedInTwoToneIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              }}
            >
              {islocal ? "Tomar Alerta de Calidad" : "Tomar Reclamo"}
            </Button>
          )}
          {claim?.status === "EN_REVISION" && !islocal && (
            <Button
              variant="contained"
              color="error"
              size="large"
              onClick={() => setOpenReject(true)}
              startIcon={<CancelTwoToneIcon />}
              sx={{ borderRadius: 2, px: 3, py: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Rechazar Reclamo
            </Button>
          )}
          {claim?.status === "EN_REVISION" && (
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={() => setOpenAccept(true)}
              startIcon={<AssignmentTurnedInTwoToneIcon />}
              sx={{ borderRadius: 2, px: 3, py: 1.5, textTransform: 'none', fontWeight: 600, boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)' }}
            >
              Finalizar y Aprobar
            </Button>
          )}
        </Box>
      )}

      <Grid container spacing={2}>
        {/* Información General */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                Información General
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoField label={islocal ? "Motivo de Alerta" : "Tipo de Reclamo"} value={claim?.claim_type_data?.name} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoField label={islocal ? "No. Memorandum" : "No. Reclamo"} value={claim?.claim_number} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoField label="Tracking" value={`TRK-${claim?.tracking?.id?.toString().padStart(5, "0")}`} />
                </Grid>
                {!islocal && (
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoField label="Documento de Descarte" value={claim?.discard_doc} />
                  </Grid>
                )}
                <Grid item xs={12} sm={6} md={4}>
                  <InfoField
                    label="Centro de Distribución"
                    value={
                      <Chip
                        size="small"
                        label={claim?.tracking?.distributor_center_data?.name}
                        avatar={<Avatar src={`https://flagcdn.com/w80/${claim?.tracking?.distributor_center_data?.country_code?.toLowerCase()}.png`} sx={{ width: 20, height: 20 }} />}
                        sx={{ mt: 0.5 }}
                      />
                    }
                  />
                </Grid>
              </Grid>

              {/* Observaciones */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionOutlinedIcon sx={{ fontSize: 18 }} /> Observaciones del Reclamo
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary' }}>
                  {claim?.observations || "Sin observaciones"}
                </Typography>
              </Box>

              {/* Motivo de Rechazo */}
              {claim?.status === "RECHAZADO" && claim?.reject_reason && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 2, border: '1px solid #ffcdd2' }}>
                  <Typography variant="subtitle2" sx={{ color: '#c62828', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CancelOutlinedIcon sx={{ fontSize: 18 }} /> Motivo de Rechazo
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b71c1c' }}>
                    {claim?.reject_reason}
                  </Typography>
                </Box>
              )}

              {/* Observaciones de Aprobación */}
              {claim?.status === "APROBADO" && claim?.approve_observations && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 2, border: '1px solid #c8e6c9' }}>
                  <Typography variant="subtitle2" sx={{ color: '#2e7d32', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 18 }} /> Observaciones de Aprobación
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1b5e20' }}>
                    {claim?.approve_observations}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Datos del Transporte */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShippingOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                Datos del Transporte
              </Typography>

              <InfoField label="Transportista" value={claim?.tracking?.transporter_data?.name} />
              <InfoField label="Número de Placa" value={claim?.tracking?.plate_number} />
              <InfoField label="Número de Rastra" value={claim?.tracking?.tariler_data?.code} />
              {claim?.tracking?.type === "IMPORT" && (
                <>
                  <InfoField label="No. Contenedor" value={claim?.tracking?.container_number} />
                  <InfoField label="No. Factura" value={claim?.tracking?.invoice_number} />
                </>
              )}
              {claim?.tracking?.type === "LOCAL" && (
                <InfoField label="Transferencia de Entrada" value={claim?.tracking?.input_document_number} />
              )}
              <InfoField label="Origen" value={claim?.origin_location_data?.name ? `${claim?.origin_location_data?.name} (${claim?.origin_location_data?.code})` : null} />
            </CardContent>
          </Card>
        </Grid>

        {/* Productos Afectados */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                Productos Afectados
                <Chip label={claim?.claim_products?.length || 0} size="small" sx={{ ml: 1, height: 20 }} />
              </Typography>

              {claim?.claim_products && claim.claim_products.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Código SAP</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Producto</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Cantidad</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Lote</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Fecha</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {claim.claim_products.map((product) => (
                        <TableRow key={product.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                              {product.sap_code}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{product.product_name}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={product.quantity} size="small" color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {product.batch || '--'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {new Date(product.created_at).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    textAlign: "center",
                    backgroundColor: alpha(theme.palette.warning.light, 0.1),
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <InventoryTwoToneIcon
                      sx={{
                        fontSize: 48,
                        color: theme.palette.warning.main,
                        mb: 1,
                      }}
                    />
                    <Typography variant="subtitle1" color="text.secondary">
                      No hay productos asociados a este reclamo
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1, maxWidth: 500 }}
                    >
                      Este reclamo no tiene productos detallados. Puede ser un
                      reclamo general o puede requerir actualización.
                    </Typography>
                  </Box>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Documentos Adjuntos */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                Documentos Adjuntos
              </Typography>
              <Grid container spacing={2}>
                <FilesPreview
                  files={claim?.claim_file ? [claim?.claim_file] : []}
                  label={islocal ? "Solicitud de Resolución" : "Archivo Claim"}
                  colWidth={4}
                />
                <FilesPreview
                  files={claim?.credit_memo_file ? [claim?.credit_memo_file] : []}
                  label="Memorandum"
                  colWidth={4}
                />
                <FilesPreview
                  files={claim?.observations_file ? [claim?.observations_file] : []}
                  label="Observaciones"
                  colWidth={4}
                />
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Fotografías del Contenedor/Rastra */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhotoLibraryIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                {islocal ? "Fotografías de la Rastra" : "Fotografías del Contenedor"}
              </Typography>
              <Grid container spacing={2}>
                <FilesPreview files={claim?.photos_container_closed || []} label={islocal ? "Rastra Cerrada" : "Contenedor Cerrado"} />
                <FilesPreview files={claim?.photos_container_one_open || []} label={islocal ? "1 Puerta/Lona Abierta" : "1 Puerta Abierta"} />
                <FilesPreview files={claim?.photos_container_two_open || []} label={islocal ? "2 Puertas Abiertas" : "2 Puertas Abiertas"} />
                <FilesPreview files={claim?.photos_container_top || []} label="Vista Superior" />
                <FilesPreview files={claim?.photos_during_unload || []} label="Durante la Descarga" />
                <FilesPreview files={claim?.photos_pallet_damage || []} label="Daños en Pallets" />
                <FilesPreview files={claim?.photos_production_batch || []} label="Lote de Producción" />
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Fotografías de Producto Dañado */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryTwoToneIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                Producto Dañado
              </Typography>
              <Grid container spacing={2}>
                <FilesPreview files={claim?.photos_damaged_product_base || []} label="Base del Producto (Lote/Vencimiento)" />
                <FilesPreview files={claim?.photos_damaged_product_dents || []} label="Abolladuras" />
                <FilesPreview files={claim?.photos_damaged_boxes || []} label="Cajas Dañadas" />
                <FilesPreview files={claim?.photos_grouped_bad_product || []} label="Producto Agrupado" />
                <FilesPreview files={claim?.photos_repalletized || []} label="Repaletizado" />
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {openTake && (
        <TakeClaimModal
          claim={claim || undefined}
          onClose={() => setOpenTake(false)}
          open={openTake}
        />
      )}
      {openReject && (
        <RejectClaimModal
          claim={claim || undefined}
          onClose={() => setOpenReject(false)}
          open={openReject}
        />
      )}
      {openAccept && (
        <AcceptClaimModal
          claim={claim || undefined}
          onClose={() => setOpenAccept(false)}
          open={openAccept}
        />
      )}
    </Box>
  );
}

function FilesPreview({
  files,
  label,
  colWidth = 3,
}: {
  label: string;
  files?: ClaimFile[];
  colWidth?: number;
}) {
  const [selectedFile, setSelectedFile] = useState<ClaimFile | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDownloadFile(index: number) {
    try {
      const file = files?.[index];
      if (!file) return;
      setLoading(true);
      const respuesta = await fetch(file.access_url);
      if (!respuesta.ok) throw new Error('Error al descargar el archivo');

      const blob = await respuesta.blob();
      const enlace = document.createElement('a');
      enlace.href = URL.createObjectURL(blob);
      enlace.download = file.name;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(enlace.href);
    } catch (error) {
      console.error('Error:', error);
    }
    finally {
      setLoading(false);
    }
  }

  const handlePreviewArchivo = async (index: number) => {
    const file = files?.[index];
    if (!file) return;

    const url = new URL(file.access_url);
    const path = url.pathname;
    const filename = path.substring(path.lastIndexOf("tracker/") + 8);

    setSelectedFile({ ...file, extension: filename.split(".").pop() || "" });
  };

  if (!files) return null;

  return (
    <Grid item xs={12} sm={6} md={colWidth}>
      {/* Header de la sección */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {label}
        </Typography>
        {files.length > 0 && (
          <Chip label={files.length} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
        )}
      </Box>

      {files.length === 0 ? (
        <Box sx={{
          p: 2,
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'grey.300',
          bgcolor: 'grey.50',
          textAlign: 'center',
          minHeight: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <InsertDriveFileIcon sx={{ fontSize: 32, color: 'grey.400', mb: 1 }} />
          <Typography variant="caption" color="text.secondary">
            Sin archivos
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {files.map((file, index) => {
            const extension = file.name?.split(".")?.pop();
            const isImage = ["jpg", "jpeg", "png", "webp"].includes(extension || "");
            const isPdf = extension === "pdf";
            const isSpreadsheet = ["xlsx", "xls", "csv"].includes(extension || "");

            return (
              <Box
                key={index}
                sx={{
                  width: files.length === 1 ? '100%' : 120,
                  height: files.length === 1 ? 180 : 120,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'relative',
                  cursor: isImage || isPdf ? 'pointer' : 'default',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    borderColor: 'primary.main',
                    '& .file-overlay': { opacity: 1 }
                  },
                }}
                onClick={() => { if (isImage || isPdf) handlePreviewArchivo(index); }}
              >
                {isImage ? (
                  <>
                    <img
                      src={file.access_url}
                      alt={`Archivo ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Box
                      className="file-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <ZoomInIcon sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                  </>
                ) : (
                  <Box sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isPdf ? '#ffebee' : isSpreadsheet ? '#e8f5e9' : 'grey.100',
                  }}>
                    {isPdf ? (
                      <PictureAsPdfTwoToneIcon sx={{ fontSize: 40 }} color="error" />
                    ) : isSpreadsheet ? (
                      <TableChartIcon sx={{ fontSize: 40 }} color="success" />
                    ) : (
                      <InsertDriveFileIcon sx={{ fontSize: 40 }} color="action" />
                    )}
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, color: 'text.secondary', mt: 0.5 }}>
                      .{extension}
                    </Typography>
                  </Box>
                )}

                {/* Botón de descarga */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    display: 'flex',
                    gap: 0.5,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); handleDownloadFile(index); }}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.9)',
                      '&:hover': { bgcolor: 'white' },
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    {loading ? <CircularProgress size={16} /> : <DownloadIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Modales de vista previa */}
      {selectedFile && selectedFile.extension === "pdf" && (
        <PDFPreviewModal file={selectedFile.access_url} onClose={() => setSelectedFile(null)} />
      )}
      {selectedFile &&
        ["jpg", "jpeg", "png", "webp"].includes(selectedFile.extension || "") && (
          <ImagePreviewModal
            image={selectedFile.access_url}
            onClose={() => setSelectedFile(null)}
          />
        )}
    </Grid>
  );
}
