// Detalles de un reclamo
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
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
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Claim,
  ClaimFile,
  useDownloadDocumentQuery,
  useGetClaimByIdQuery,
} from "../../../store/claim/claimApi";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PictureAsPdfTwoToneIcon from "@mui/icons-material/PictureAsPdfTwoTone";
import ClaimPDF from "../../tracker/components/ClaimPDF";
// import download icon
import DownloadIcon from "@mui/icons-material/Download";
// import zoom in icon
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { PDFPreviewModal } from "../../ui/components/PDFPreviewModal";
import { ImagePreviewModal } from "../../ui/components/ImagePreviewModal";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import TableChartIcon from "@mui/icons-material/TableChart";
// Añadir estas importaciones al inicio del archivo
import { useTheme } from "@mui/material";
import PhotoCameraTwoToneIcon from "@mui/icons-material/PhotoCameraTwoTone";
import InventoryIcon from "@mui/icons-material/Inventory";
import InventoryTwoToneIcon from "@mui/icons-material/InventoryTwoTone";
import RejectClaimModal from "../components/RejectClaimModal";
import AcceptClaimModal from "../components/AcceptClaimModal";
import TakeClaimModal from "../components/TakeClaimModal";
import AssignmentTurnedInTwoToneIcon from '@mui/icons-material/AssignmentTurnedInTwoTone';
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';

const claimStatuses = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_REVISION", label: "En Revisión" },
  { value: "RECHAZADO", label: "Rechazado" },
  { value: "APROBADO", label: "Aprobado" },
];

const claimTypes = [
  { value: "FALTANTE", label: "Faltante" },
  { value: "SOBRANTE", label: "Sobrante" },
  {
    value: "DAÑOS_CALIDAD_TRANSPORTE",
    label: "Daños por Calidad y Transporte",
  },
];

interface ClaimDetailPageProps {
  canEditStatus?: boolean;
}

export default function ClaimDetailPage({
  canEditStatus = false,
}: ClaimDetailPageProps) {
  const theme = useTheme(); // Add this line to access the theme object
  const { id } = useParams();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [openTake, setOpenTake] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [openAccept, setOpenAccept] = useState(false);

  const { data, refetch } = useGetClaimByIdQuery(Number(id));

  useEffect(() => {
    if (data) {
      setClaim(data);
    }
  }, [data]);

  useEffect(() => {
    refetch();
  }, [id, refetch]);
  console.log(claim);

  const islocal = claim?.type === "ALERT_QUALITY";

  return (
    <>
      <Grid container spacing={1} sx={{ marginTop: 2, marginBottom: 5, mx: 2 }}>
        <Grid item xs={12} md={11}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight={400}
            color={"#1c2536"}
            align="center"
            borderRadius={2}
            sx={{
              border: "1px solid #1c2536",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              padding: "8px 16px",
            }}
          >
            {claim?.tracking?.distributor_center_data?.country_code && (
              <Box
                component="img"
                src={`https://flagcdn.com/w80/${claim?.tracking?.distributor_center_data.country_code.toLowerCase()}.png`}
                srcSet={`https://flagcdn.com/w80/${claim?.tracking?.distributor_center_data.country_code.toLowerCase()}.png 2x`}
                alt={claim?.tracking?.distributor_center_data.country_code}
                sx={{
                  width: 60,
                  height: 40,
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: "2px",
                  boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
                }}
              />
            )}
            TRK-{claim?.tracking?.id?.toString().padStart(5, "0")}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          md={1}
          container
          justifyContent="flex-end"
          justifyItems="flex-end"
          alignItems="center"
          gap={1}
        >
          <PDFDownloadLink
            fileName={
              claim ? `CLAIM-${claim.id?.toString().padStart(5, "0")}` : ""
            }
            document={<ClaimPDF claim={claim ? claim : undefined} />}
          >
            {({ loading: pdfLoading }) => {
              const loading = pdfLoading;
              return (
                <IconButton color="secondary" disabled={loading}>
                  <PictureAsPdfTwoToneIcon fontSize="large" />
                </IconButton>
              );
            }}
          </PDFDownloadLink>
        </Grid>

        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 2,
              }}
            >
              <Typography
                variant="h6"
                component="h1"
                fontWeight={400}
                color={"gray.500"}
              >
                Datos Generales
              </Typography>
              {/* Boton de editar datos */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                {canEditStatus && claim?.status === "PENDIENTE" && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="medium"
                    onClick={() => setOpenTake(true)}
                    startIcon={<AssignmentTurnedInTwoToneIcon />}
                  >
                    <Typography
                      variant="body2"
                      component="span"
                      fontWeight={400}
                      color={"secondary"}
                    >
                      {islocal ? "Tomar Alerta de Calidad" : "Tomar Reclamo"}
                    </Typography>
                  </Button>
                )}
                {canEditStatus && claim?.status === "EN_REVISION" && (
                  <Button
                    variant="contained"
                    color="error"
                    size="medium"
                    onClick={() => setOpenReject(true)}
                    startIcon={<CancelTwoToneIcon />}
                  >
                    <Typography
                      variant="body2"
                      component="span"
                      fontWeight={400}
                    >
                      Rechazar
                    </Typography>
                  </Button>
                )}
                {canEditStatus && claim?.status === "EN_REVISION" && (
                  <Button
                    variant="contained"
                    color="success"
                    size="medium"
                    onClick={() => setOpenAccept(true)}
                    startIcon={<AssignmentTurnedInTwoToneIcon />}
                  >
                    <Typography
                      variant="body2"
                      component="span"
                      fontWeight={400}
                    >
                      Aprobar
                    </Typography>
                  </Button>
                )}
              </Box>
            </Box>
            <Divider />
            <Box sx={{ padding: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={6} lg={4} xl={3}>
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={400}
                    color={"gray.500"}
                  >
                    {islocal ? "Motivo de Alerta de Calidad" : "Tipo de Reclamo"} 
                  </Typography>
                  <Divider />
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={600}
                    color={"gray.500"}
                  >
                    {
                      claimTypes.find((t) => t.value === claim?.claim_type)
                        ?.label
                    }
                  </Typography>
                </Grid>
                <Grid item xs={6} md={6} lg={4} xl={3}>
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={400}
                    color={"gray.500"}
                  >
                    Centro de Distribución
                  </Typography>
                  <Divider />
                  <Chip
                      sx={{ cursor: "default" }}
                      label={claim?.tracking?.distributor_center_data.name}
                      size={"small"}
                      avatar={
                          // <Box
                          //     component="img"
                          //     src={`https://flagcdn.com/w20/${row.data_country.flag.toLowerCase()}.png`}
                          //     srcSet={`https://flagcdn.com/w40/${row.data_country.flag.toLowerCase()}.png 2x`}
                          //     alt=""
                          //     sx={{ width: 20, height: 14, ml: 1 }}
                          // />
                          <Avatar
                              src={`https://flagcdn.com/w80/${claim?.tracking?.distributor_center_data.country_code.toLowerCase()}.png`}
                              alt={claim?.tracking?.distributor_center_data.country_code}
                              sizes={"small"}
                              />
                      }
                  />
                </Grid>
                <Grid item xs={6} md={6} lg={4} xl={3}>
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={400}
                    color={"gray.500"}
                  >
                    Numero de Reclamo
                  </Typography>
                  <Divider />
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={600}
                    color={"gray.500"}
                  >
                    {claim?.claim_number}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={6} lg={4} xl={3}>
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={400}
                    color={"gray.500"}
                  >
                    Tracking
                  </Typography>
                  <Divider />
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={600}
                    color={"gray.500"}
                  >
                    TRK-{claim?.tracking?.id?.toString().padStart(5, "0")}
                  </Typography>
                </Grid>

                {/* Documento de Descarte */}
                <Grid item xs={6} md={6} lg={4} xl={3}>
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={400}
                    color={"gray.500"}
                  >
                    Documento de Descarte{" "}
                  </Typography>
                  <Divider />
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={400}
                    color={"gray.500"}
                  >
                    {claim?.discard_doc}
                  </Typography>
                </Grid>

                {/* Estado del Reclamo */}
                <Grid item xs={6} md={6} lg={4} xl={3}>
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={400}
                    color={"gray.500"}
                  >
                    Estado del Reclamo
                  </Typography>
                  <Divider />
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={600}
                    color={"gray.500"}
                  >
                    {claim?.status &&
                      claimStatuses.find(
                        (status) => status.value === claim.status
                      )?.label}
                  </Typography>
                </Grid>

                {/* Motivo de Rechazo */}
                {claim?.status === "RECHAZADO" && (
                  <Grid item xs={12}>
                    <Typography
                      variant="body1"
                      component="h1"
                      fontWeight={400}
                      color={"gray.500"}
                    >
                      Motivo de Rechazo
                    </Typography>
                    <Divider />
                    <Typography
                      variant="body1"
                      component="h1"
                      fontWeight={600}
                      color={"gray.500"}
                    >
                      {claim?.reject_reason}
                    </Typography>
                  </Grid>
                )}

                {/* Observaciones */}
                <Grid item xs={12}>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography
                      variant="body1"
                      component="h1"
                      fontWeight={400}
                      color={"gray.500"}
                    >
                      Observaciones
                    </Typography>
                  </Grid>
                  <Divider />
                  <pre>
                    <Typography
                      variant="body1"
                      component="h1"
                      fontWeight={600}
                      color={"gray.500"}
                      // que se acomode al texto
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {claim?.observations || "--"}
                    </Typography>
                  </pre>
                </Grid>
              </Grid>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ my: 3, p: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  pb: 1,
                }}
              >
                <InventoryIcon sx={{ mr: 1 }} />
                Productos asociados al reclamo
              </Typography>

              {claim?.claim_products && claim.claim_products.length > 0 ? (
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    mb: 3,
                  }}
                >
                  <Table
                    size="small"
                    aria-label="tabla de productos reclamados"
                  >
                    <TableHead
                      sx={{ backgroundColor: theme.palette.background.default }}
                    >
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Código SAP
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Producto
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold" }}>
                          Cantidad
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                          Fecha
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {claim.claim_products.map((product) => (
                        <TableRow
                          key={product.id}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.primary.light,
                                0.1
                              ),
                            },
                            transition: "background-color 0.2s",
                          }}
                        >
                          <TableCell component="th" scope="row">
                            <Typography
                              variant="body2"
                              fontFamily="monospace"
                              fontWeight={500}
                            >
                              {product.sap_code}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {product.product_name}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={product.quantity}
                              size="small"
                              sx={{
                                minWidth: "60px",
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.1
                                ),
                                color: theme.palette.primary.main,
                                fontWeight: "bold",
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {new Date(
                                product.created_at
                              ).toLocaleDateString()}
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
            </Box>
          </Card>
          <Divider sx={{ my: 2 }} />
          <Grid item container xs={12}>
            <FilesPreview
              files={claim?.claim_file ? [claim?.claim_file] : []}
              label={islocal ? "Solicitud de Resolución (PDF/Excel)" : "Archivo Claim (PDF/Excel)"}
              claim_id={claim?.id || 0}
            />
            <FilesPreview
              files={claim?.credit_memo_file ? [claim?.credit_memo_file] : []}
              label="Memorandum de Credito (PDF)"
              claim_id={claim?.id || 0}
            />
            <FilesPreview
              files={claim?.observations_file ? [claim?.observations_file] : []}
              label="Observaciones (PDF)"
              claim_id={claim?.id || 0}
            />
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Grid item container xs={12}>
          <Divider>
            <Typography variant="body2" color="textSecondary">
              Fotografías
            </Typography>
          </Divider>
        </Grid>
        <FilesPreview
          files={claim?.photos_container_closed || []}
          label={islocal ? "Rastra con Puerta/Lona Cerrada" : "Contenedor Cerrado"}
          claim_id={claim?.id || 0}
        />
        <FilesPreview
          files={claim?.photos_container_one_open || []}
          label={islocal ? "Rastra Con 1 Puerta/Lona Abierta" : "Contenedor Con 1 Puerta Abierta"}
          claim_id={claim?.id || 0}
        />
        <FilesPreview
          files={claim?.photos_container_two_open || []}
          label={islocal ? "Rastra Con 2 Puertas Abiertas" : "Contenedor con 2 puertas abiertas"}
          claim_id={claim?.id || 0}
        />
        <FilesPreview
          files={claim?.photos_container_top || []}
          label={islocal ? "Vista Superior del Contenido de la Rastra" : "Vista Superior del contenido del contenedor"}
          claim_id={claim?.id || 0}
        />
        <FilesPreview
          files={claim?.photos_during_unload || []}
          label="Fotografía durante la descarga"
          claim_id={claim?.id || 0}
        />
        <FilesPreview
          files={claim?.photos_pallet_damage || []}
          label="Fisuras/abolladuras de pallets"
          claim_id={claim?.id || 0}
        />
        {claim?.claim_type === "DAÑOS_CALIDAD_TRANSPORTE" && (
          <>
            <Grid item container xs={12}>
              <Divider>
                <Typography variant="body2" color="textSecondary">
                  Producto dañado
                </Typography>
              </Divider>
            </Grid>
            <FilesPreview
              files={claim?.photos_damaged_product_base || []}
              label="Base de la lata/botella (fecha de vencimiento y lote)"
              claim_id={claim?.id || 0}
            />
            <FilesPreview
              files={claim?.photos_damaged_product_dents || []}
              label="Abolladuras (mínimo 3 diferentes)"
              claim_id={claim?.id || 0}
            />
            <FilesPreview
              files={claim?.photos_damaged_boxes || []}
              label="Cajas dañadas por golpes o problemas de calidad"
              claim_id={claim?.id || 0}
            />
            <FilesPreview
              files={claim?.photos_grouped_bad_product || []}
              label="Producto en mal estado agrupado en 1 pallet"
              claim_id={claim?.id || 0}
            />

            <FilesPreview
              files={claim?.photos_repalletized || []}
              label="Repaletizado por identificación de producto dañado"
              claim_id={claim?.id || 0}
            />
          </>
        )}
      </Grid>
      {
        openTake && (
          <TakeClaimModal
            claim={claim || undefined}
            onClose={() => setOpenTake(false)}
            open={openTake}
          />
        )
      }
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
    </>
  );
}

function FilesPreview({
  files,
  label,
  claim_id,
}: {
  label: string;
  files?: ClaimFile[];
  claim_id: number;
}) {
  const theme = useTheme(); // Añadir este hook
  const [selectedFile, setSelectedFile] = useState<ClaimFile | null>(null);
  const [filenameDownload, setFilenameDownload] = useState<string | null>(null);
  const [filenamePreview, setFilenamePreview] = useState<string | null>(null);

  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const { data: fileBlob, isFetching } = useDownloadDocumentQuery(
    { filename: filenameDownload || "", claim_id: claim_id || 0 },
    { skip: !filenameDownload } // Evita ejecutar la consulta si no hay un filename
  );

  const { data: fileBlobPreview, isFetching: isFetchingPreview } =
    useDownloadDocumentQuery(
      { filename: filenamePreview || "", claim_id: claim_id || 0 },
      { skip: !filenamePreview } // Evita ejecutar la consulta si no hay un filename
    );

  useEffect(() => {
    if (isFetching) return;
    const handleDownload = () => {
      if (!filenameDownload) return;
      if (!fileBlob) return;

      // Implementar descarga sin redirección (usando XMLHttpRequest)
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.setAttribute("download", filenameDownload); // Nombre del archivo a descargar
      document.body.appendChild(link);
      link.click();

      // Limpiar después de un breve delay para asegurar que la descarga inicie
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url); // Limpieza de memoria
      }, 200);

      setFilenameDownload(null);
    };
    handleDownload();
  }, [filenameDownload, fileBlob, isFetching]);

  useEffect(() => {
    if (isFetchingPreview) return;

    if (filenamePreview && fileBlobPreview) {
      const url = URL.createObjectURL(fileBlobPreview);
      setFileUrl(url);
    }
  }, [filenamePreview, fileBlobPreview, isFetchingPreview]);

  const handleDownloadArchivo = async (index: number) => {
    // Implement download functionality
    const file = files?.[index];
    if (!file) return;
    const url = new URL(file.access_url);
    const path = url.pathname;
    const filename = path.substring(path.lastIndexOf("tracker/") + 8);
    setFilenameDownload(filename);
  };

  const handlePreviewArchivo = async (index: number) => {
    const file = files?.[index];
    if (!file) return;

    const url = new URL(file.access_url);
    const path = url.pathname;
    const filename = path.substring(path.lastIndexOf("tracker/") + 8);

    setFilenamePreview(filename);
    setSelectedFile({ ...file, extension: filename.split(".").pop() || "" });
  };

  // Obtener el icono adecuado según la extensión del archivo
  const getFileIcon = (extension: string | undefined) => {
    if (!extension)
      return <InsertDriveFileIcon sx={{ fontSize: 30 }} color="disabled" />;

    if (extension === "pdf") {
      return <PictureAsPdfTwoToneIcon sx={{ fontSize: 30 }} color="error" />;
    } else if (["jpg", "jpeg", "png", "webp"].includes(extension)) {
      return <PhotoCameraTwoToneIcon sx={{ fontSize: 30 }} color="primary" />;
    } else if (["xlsx", "xls", "csv"].includes(extension)) {
      return <TableChartIcon sx={{ fontSize: 30 }} color="success" />;
    } else {
      return <InsertDriveFileIcon sx={{ fontSize: 30 }} color="action" />;
    }
  };

  // Contenedor común para todos los tipos de archivos
  const fileContainer = {
    height: 200,
    display: "flex",
    flexDirection: "column",
    border: "1px solid",
    borderColor: theme.palette.divider,
    borderRadius: 1,
    p: 1,
    m: 1,
    position: "relative",
    transition: "all 0.2s",
    "&:hover": {
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      borderColor: theme.palette.primary.light,
    },
  };

  if (!files) return null;

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Box
        sx={{
          borderBottom: `2px solid ${theme.palette.primary.main}`,
          mb: 1,
          pb: 0.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {getFileIcon(files?.[0]?.name.split(".").pop())}
        <Typography variant="subtitle1" fontWeight={500}>
          {label}
        </Typography>
      </Box>

      {files.length === 0 ? (
        // Placeholder uniforme cuando no hay archivos
        <Box
          sx={{
            ...fileContainer,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.palette.background.default,
            height: 200,
            cursor: "default",
          }}
        >
          <InsertDriveFileIcon
            sx={{ fontSize: 50, color: theme.palette.text.disabled, mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary" align="center">
            No hay documentos disponibles
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", mt: 1, minHeight: 200 }}>
          {files.map((file, index) => {
            const extension = file.name.split(".").pop();
            const isImage = ["jpg", "jpeg", "png", "webp"].includes(
              extension || ""
            );
            const isPdf = extension === "pdf";
            const isSpreadsheet = ["xlsx", "xls", "csv"].includes(
              extension || ""
            );

            return (
              <Box
                key={index}
                sx={{
                  ...fileContainer,
                  width: files.length > 1 ? 140 : "100%",
                }}
              >
                {/* Parte superior - Contenido del archivo */}
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    borderRadius: 1,
                    cursor: isImage || isPdf ? "pointer" : "default",
                    position: "relative",
                    "&:hover .preview-overlay": {
                      opacity: 1,
                    },
                  }}
                  onClick={() => {
                    if (isImage || isPdf) handlePreviewArchivo(index);
                  }}
                >
                  {isImage ? (
                    <>
                      <img
                        src={file.access_url}
                        alt={`Documento ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <Box
                        className="preview-overlay"
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          backgroundColor: "rgba(0,0,0,0.5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: 0,
                          transition: "opacity 0.2s",
                        }}
                      >
                        <ZoomInIcon sx={{ color: "white", fontSize: 28 }} />
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ textAlign: "center" }}>
                      {isPdf ? (
                        <PictureAsPdfTwoToneIcon
                          sx={{ fontSize: 50 }}
                          color="error"
                        />
                      ) : isSpreadsheet ? (
                        <TableChartIcon sx={{ fontSize: 50 }} color="success" />
                      ) : (
                        <InsertDriveFileIcon
                          sx={{ fontSize: 50 }}
                          color="action"
                        />
                      )}
                      <Typography
                        variant="caption"
                        display="block"
                        textTransform="uppercase"
                      >
                        {extension}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Parte inferior - Nombre del archivo y acciones */}
                <Box
                  sx={{
                    mt: 1,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    pt: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textAlign: "center",
                    }}
                  >
                    {file.name.split("/").pop()}
                  </Typography>
                </Box>

                {/* Botones de acción */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    backgroundColor: "rgba(255,255,255,0.8)",
                    borderRadius: "4px",
                    padding: "2px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleDownloadArchivo(index)}
                    sx={{ mb: isImage || isPdf ? 0.5 : 0 }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>

                  {(isImage || isPdf) && (
                    <IconButton
                      size="small"
                      onClick={() => handlePreviewArchivo(index)}
                    >
                      <ZoomInIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Modales de vista previa */}
      {selectedFile && selectedFile.extension === "pdf" && fileUrl && (
        <PDFPreviewModal file={fileUrl} onClose={() => setSelectedFile(null)} />
      )}
      {selectedFile &&
        ["jpg", "jpeg", "png", "webp"].includes(selectedFile.extension || "") &&
        fileUrl && (
          <ImagePreviewModal
            image={fileUrl}
            onClose={() => setSelectedFile(null)}
          />
        )}
    </Grid>
  );
}
