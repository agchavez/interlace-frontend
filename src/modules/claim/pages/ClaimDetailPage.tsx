// Detalles de un reclamo
import {
  Box,
  Card,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Claim,
  ClaimFile,
  useChangeClaimStatusMutation,
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
import { Controller, useForm } from "react-hook-form";
import { useAppSelector } from "../../../store";
import { toast } from "sonner";
import TableChartIcon from "@mui/icons-material/TableChart";

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

export default function ClaimDetailPage() {
  const { id } = useParams();
  const [claim, setClaim] = useState<Claim | null>(null);

  const { data, refetch } = useGetClaimByIdQuery(Number(id));

  const { user } = useAppSelector((state) => state.auth);

  const { control, watch, setValue } = useForm<{
    status: string;
  }>({
    defaultValues: {
      status: claim?.status || "",
    },
  });

  useEffect(() => {
    if (data) {
      setClaim(data);
      setValue("status", data.status);
    }
  }, [data]);

  useEffect(() => {
    refetch();
  }, [id, refetch]);

  const [updateStatus, { isLoading, isSuccess, error }] =
    useChangeClaimStatusMutation();
  
    useEffect(() => {
    if (isSuccess && !isLoading) {
      toast.success("Estado actualizado con éxito");
    }
  }, [isSuccess, isLoading, error, refetch]);

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value;
    setValue("status", newStatus);

    const formData = new FormData();
    formData.append("status", newStatus);

    try {
      await updateStatus(
        {
          id: id ? parseInt(id) : 0,
          new_state: newStatus,
          changed_by_id: user?.id || 0,
        },
      ).unwrap();
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  };
  return (
    <>
      <Grid container spacing={1} sx={{ marginTop: 2, marginBottom: 5 }}>
        <Grid item xs={12}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight={400}
            color={"white"}
            align="center"
            bgcolor={"#1c2536"}
          >
            CLAIM-{claim?.id?.toString().padStart(5, "0")}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
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
                    Tipo de Reclamo
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
                    Estado del Reclamo
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <FormControl size="small" fullWidth>
                        <InputLabel id="tipo-label">
                          Estado del Reclamo
                        </InputLabel>
                        <Select
                          labelId="tipo-label"
                          id="tipo"
                          {...field}
                          value={watch("status") || ""}
                          label="Estado del Reclamo"
                          MenuProps={MenuProps}
                          onChange={handleChange}
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
            <Grid item container xs={12}>
              <FilesPreview
                files={claim?.claim_file ? [claim?.claim_file] : []}
                label="Archivo Claim (PDF/Excel)"
                claim_id={claim?.id || 0}
              />
              <FilesPreview
                files={claim?.credit_memo_file ? [claim?.credit_memo_file] : []}
                label="Nota de Crédito (PDF)"
                claim_id={claim?.id || 0}
              />
              <FilesPreview
                files={
                  claim?.observations_file ? [claim?.observations_file] : []
                }
                label="Observaciones (PDF)"
                claim_id={claim?.id || 0}
              />
            </Grid>
          </Card>
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
          label="Contenedor Cerrado"
          claim_id={claim?.id || 0}
        />
        <FilesPreview
          files={claim?.photos_container_one_open || []}
          label="Contenedor Con 1 Puerta Abierta"
          claim_id={claim?.id || 0}
        />
        <FilesPreview
          files={claim?.photos_container_two_open || []}
          label="Contenedor con 2 puertas abiertas"
          claim_id={claim?.id || 0}
        />
        <FilesPreview
          files={claim?.photos_container_top || []}
          label="Vista Superior del contenido del contenedor"
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
        {/* {
          claim?.claim_type === "DAÑOS_CALIDAD_TRANSPORTE" && (
            <> */}
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
        {/* </>
          )
        } */}
      </Grid>
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

      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filenameDownload); // Nombre del archivo a descargar
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // Limpieza de memoria
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

  if (!files) return null;
  if (files.length === 0)
    return (
      <Grid item xs={12} sm={6} md={4}>
        <Typography variant="body2">{label}</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", mt: 2, minHeight: 200 }}>
          <Box
            key={1}
            sx={{
              position: "relative",
              width: files.length > 1 ? 100 : "100%",
              mr: 1,
              mb: 1,
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                minHeight: 100,
                display: "flex",
                position: "initial",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                border: "1px dashed grey",
                borderRadius: 1,
                backgroundColor: "rgba(255, 255, 255, 0.7)",
              }}
            >
              <InsertDriveFileIcon sx={{ fontSize: 30 }} color="error" />
              <Typography variant="caption">No hay Archivos</Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
    );

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="body2">{label}</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", mt: 2, minHeight: 200 }}>
        {files?.map((preview, index) => {
          const extension = preview.name.split(".").pop();
          return (
            <Box
              key={index}
              sx={{
                position: "relative",
                width: files.length > 1 ? 100 : "100%",
                mr: 1,
                mb: 1,
              }}
            >
              {extension === "pdf" ? (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    minHeight: 100,
                    display: "flex",
                    position: "initial",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    border: "1px dashed grey",
                    borderRadius: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  <PictureAsPdfTwoToneIcon
                    sx={{ fontSize: 30 }}
                    color="error"
                  />
                  <Typography variant="caption">PDF {index + 1}</Typography>
                </Box>
              ) : extension === "jpg" ||
                extension === "jpeg" ||
                extension === "png" ||
                extension === "webp" ? (
                <img
                  src={preview.access_url}
                  alt={`preview ${index}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                />
              ) : ["xlsx", "xls", "csv"].includes(extension || "") ? (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    minHeight: 100,
                    display: "flex",
                    position: "initial",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    border: "1px dashed grey",
                    borderRadius: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  <TableChartIcon
                    sx={{ fontSize: 30 }}
                    color="success"
                  />
                  <Typography variant="caption" textTransform={"uppercase"}>{extension} {index + 1}</Typography>
                </Box>
              ) : (
                <Typography variant="caption">{extension}</Typography>
              )}
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                }}
                onClick={() => handleDownloadArchivo(index)}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
              {["jpg", "jpeg", "png", "webp", "pdf"].includes(
                extension || ""
              ) && (
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                  }}
                  onClick={() => handlePreviewArchivo(index)}
                >
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          );
        })}
      </Box>
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
