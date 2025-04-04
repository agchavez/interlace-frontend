import {
  Badge,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  styled,
  tableCellClasses,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";

// iCONS
import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";
import FileCopyTwoToneIcon from '@mui/icons-material/FileCopyTwoTone';
import { useAppDispatch } from "../../../store";
import {
  Seguimiento,
} from "../../../store/seguimiento/seguimientoSlice";
import AgregarProductoModal from "./AgregarProductoModal";
import { AutoCompleteBase } from "../../ui/components/BaseAutocomplete";
import { useAppSelector } from "../../../store/store";
import { useForm } from "react-hook-form";
import { CheckFormType, Tracker } from "../../../interfaces/tracking";
import { OperatorSelect } from "../../ui/components/OperatorSelect";
import { DriverSelect } from "../../ui/components";
import { LocationSelect } from "../../ui/components/LocationSelect";
import AgregarProductoSalida from "./AgregarProductoSalida";
import { OutPutDetail } from "./OutPutDetail";
import {
  updateTracking,
  chanceStatusTracking,
  // downloadFile,
} from "../../../store/seguimiento/trackerThunk";

// import CloudDownloadTwoToneIcon from '@mui/icons-material/CloudDownloadTwoTone';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import { formatDistance, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { format } from "date-fns-tz";
import { ProductoEntradaTableRow } from "./ProductoEntradaTableRow";
import { EditNote, EditTwoTone } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ShowCodeDriver } from "./ShowCodeDriver";
import { ShowRoute } from "./ShowRoute";
// import TrakerPDFDocument from "./TrackerPDF";
// import { PDFDownloadLink } from "@react-pdf/renderer";
// import PictureAsPdfTwoToneIcon from "@mui/icons-material/PictureAsPdfTwoTone";

import {
  useGetDriverQuery,
  useGetLocationsQuery,
  useGetOperatorByDistributionCenterQuery,
} from "../../../store/maintenance/maintenanceApi";
import ObservationModal from "./ObservationModal";
import { SelectOrderTrackerModal } from "./SelectOrderTrackerModal";
import CloudUploadTwoToneIcon from "@mui/icons-material/CloudUploadTwoTone";
import AssignmentLateTwoToneIcon from "@mui/icons-material/AssignmentLateTwoTone";
import TrackerFilesModal from "./TrackerFilesModal";
// import { toast } from "sonner";
import PDFDownloader from "./TrackerPDFV2";
import { QRCodeSVG } from "qrcode.react";

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export const CheckForm = ({
  seguimiento,
  indice,
  disable,
  openClaim
}: {
  seguimiento: Seguimiento;
  indice: number;
  disable: boolean;
  openClaim: () => void;
}) => {
  const dispatch = useAppDispatch();
  const [open, setopen] = useState(false);
  const [openObservationModal, setOpenObservationModal] = useState(false);
  const [openArchivoModal, setOpenArchivoModal] = useState(false);
  const { outputType } = useAppSelector((state) => state.maintenance);
  const centro_distribucion = useAppSelector(
    (state) => state.auth.user?.centro_distribucion
  );
  const user = useAppSelector((state) => state.auth.user);
  const { control, register, watch, setValue } = useForm<CheckFormType>({
    defaultValues: {
      ...seguimiento,
      outputType: seguimiento.outputType?.toString(),
      driver: seguimiento.driver !== null ? seguimiento.driver : undefined,
    },
  });
  const { data: dataDriver } = useGetDriverQuery({
    id: seguimiento.driver !== null ? seguimiento.driver : undefined,
    limit: 1,
    offset: 0,
  });
  const { data: dataOp1 } =
    useGetOperatorByDistributionCenterQuery({
      id: seguimiento.driver !== null ? seguimiento.opm1 : undefined,
      limit: 1,
      offset: 0,
    });
  const { data: dataOp2 } =
    useGetOperatorByDistributionCenterQuery({
      limit: 1,
      offset: 0,
      id: seguimiento.driver !== null ? seguimiento.opm2 : undefined,
    });
  const { data: dataOutputLocation } =
    useGetLocationsQuery({
      id: seguimiento.driver !== null ? seguimiento.outputLocation : undefined,
      limit: 1,
      offset: 0,
    });
  const tiempoEntrada = seguimiento?.timeStart
    ? new Date(seguimiento?.timeStart)
    : null;
  const tiempoSalida = seguimiento?.timeEnd
    ? new Date(seguimiento?.timeEnd)
    : null;

  async function sendDataToBackend<T>(fieldName: keyof Tracker, value: T) {
    dispatch(updateTracking(indice, seguimiento.id, { [fieldName]: value }));
  }
  const [openOutput, setopenOutput] = useState(false);
  const outputTypeData = outputType.find(
    (d) => d.id === Number(watch("outputType"))
  );
  const navigate = useNavigate();
  const handleEditState = () => {
    dispatch(
      chanceStatusTracking("EDITED", seguimiento.id, () =>
        navigate("/tracker/check/?id=" + seguimiento.id)
      )
    );
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));



  //   const handleClickDescargar = async () => {
  //   // Función auxiliar para descargar archivos sin redirección
  //   const downloadFileWithoutRedirect = async (url: string, fileName: string) => {
  //     try {

  //       // Usar XMLHttpRequest que tiene mejor manejo de descargas de archivos binarios
  //       const xhr = new XMLHttpRequest();
  //       xhr.open('GET', url, true);
  //       xhr.responseType = 'blob';

  //       // Manejar la respuesta
  //       xhr.onload = function() {
  //         if (xhr.status === 200) {
  //           // Crear objeto URL
  //           const blob = new Blob([xhr.response]);
  //           const blobUrl = window.URL.createObjectURL(blob);

  //           // Crear elemento temporal para la descarga
  //           const downloadLink = document.createElement('a');
  //           downloadLink.style.display = 'none';
  //           downloadLink.href = blobUrl;
  //           downloadLink.download = fileName;

  //           // Agregar, hacer clic y eliminar
  //           document.body.appendChild(downloadLink);
  //           downloadLink.click();

  //           // Limpiar después de un breve delay para asegurar que la descarga inicie
  //           setTimeout(() => {
  //             document.body.removeChild(downloadLink);
  //             window.URL.revokeObjectURL(blobUrl);
  //           }, 200);

  //         } else {
  //           throw new Error(`Error al descargar: ${xhr.status}`);
  //         }
  //       };

  //       xhr.onerror = function() {
  //         throw new Error('Error de red al intentar descargar el archivo');
  //       };

  //       // Iniciar la descarga
  //       xhr.send();

  //     } catch (error) {
  //       console.error(`Error al descargar ${fileName}:`, error);
  //       toast.error(`No se pudo descargar ${fileName}`);
  //     }
  //   };

  //   // Descargar el archivo 1 si existe
  //   if (seguimiento.file_data_1) {
  //     const url = seguimiento.file_data_1.access_url;
  //     const nombre = seguimiento.file_data_1.name || 'documento1';
  //     await downloadFileWithoutRedirect(url, nombre);
  //   }

  //   // Descargar el archivo 2 si existe
  //   if (seguimiento.file_data_2) {
  //     // Pequeña pausa para asegurar que el primer archivo tenga tiempo de iniciar su descarga
  //     await new Promise(resolve => setTimeout(resolve, 700));

  //     const url = seguimiento.file_data_2.access_url;
  //     const nombre = seguimiento.file_data_2.name || 'documento2';
  //     await downloadFileWithoutRedirect(url, nombre);
  //   }
  // };

  const [openOrderModal, setopenOrderModal] = useState<boolean>(false);

  return (
    <>
      <AgregarProductoSalida
        open={openOutput}
        handleClose={() => setopenOutput(false)}
      />
      <ObservationModal
        open={openObservationModal}
        seguimiento={seguimiento}
        handleClose={() => setOpenObservationModal(false)}
      />
      <TrackerFilesModal
        open={openArchivoModal}
        tracker={seguimiento}
        onClose={() => setOpenArchivoModal(false)}
      />
      {openOrderModal && (
        <SelectOrderTrackerModal
          open={openOrderModal}
          handleClose={() => setopenOrderModal(false)}
          seguimiento={seguimiento}
          indice={indice}
          setLocalidadValue={(value: number) => setValue("outputLocation", value)}
        />
      )}
      {open && (
        <AgregarProductoModal open={open} handleClose={() => setopen(false)} />
      )}
      <Grid container spacing={1} sx={{ marginTop: 2, marginBottom: 5 }}>
                              <Grid container spacing={1} sx={{ marginTop: 2, marginBottom: 3 }}>
                  <Grid item xs={12}>
                    <Typography
                      variant="h4"
                      component="h1"
                      fontWeight={400}
                      bgcolor={"#1c2536"}
                      color={"white"}
                      align="center"
                      borderRadius={2}
                      sx={{
                        border: "1px solid #1c2536",
                        padding: "8px 16px",
                        paddingLeft: "95px", // Aumentado para dar más espacio al texto principal
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "visible",
                        minHeight: "64px" // Aumentado ligeramente
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          left: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 3px 5px rgba(0,0,0,0.2)",
                            border: "3px solid white", // Aumentado
                            overflow: "hidden",
                            borderRadius: "8px",
                            padding: "0px" // Agregado padding para espacio interno
                          }}
                        >
                          <QRCodeSVG
                            value={`${import.meta.env.VITE_JS_FRONTEND_URL}/tracker/detail/${seguimiento?.id}`}
                            imageSettings={{
                              src: "/logo-qr.png",
                              height: 15,
                              width: 15,
                              excavate: true,
                            }}
                            size={50}
                            level="Q"
                          
                          />
                        </Box>
                      </Box>
                      TRK-{seguimiento.id?.toString().padStart(5, "0")}
                    </Typography>
                  </Grid>
                </Grid>
        {/* <Grid
          item
          xs={12}
          container
          justifyContent="flex-end"
          justifyItems="flex-end"
          alignItems="center"
          gap={1}
        >
          <IconButton color="error" onClick={openClaim}>
            <AssignmentLateTwoToneIcon fontSize="large" />
          </IconButton>
          <PDFDownloadLink
            fileName={`TRK-${seguimiento.id?.toString().padStart(5, "0")}`}
            document={
              <TrakerPDFDocument
                seguimiento={seguimiento}
                outputTypeData={outputTypeData}
                driver={dataDriver?.results[0]}
                op1={
                  seguimiento.opm1 !== undefined && seguimiento.opm1 !== null
                    ? dataOp1?.results[0]
                    : undefined
                }
                op2={
                  seguimiento.opm2 !== undefined && seguimiento.opm1 !== null
                    ? dataOp2?.results[0]
                    : undefined
                }
                outputLocation={dataOutputLocation?.results[0]}
              />
            }
          >
            {({ loading: pdfLoading }) => {
              const loading =
                pdfLoading ||
                loadingDriver ||
                loadingOP1 ||
                loadingOP2 ||
                loadingOutputData;
              return (
                <IconButton color="secondary" disabled={loading}>
                  <PictureAsPdfTwoToneIcon fontSize="large" />
                </IconButton>
              );
            }}
          </PDFDownloadLink>
        </Grid> */}
        <Grid item xs={12} md={8} sx={{ marginTop: 1 }}>
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
                component="h2"
                fontWeight={500}
                color="gray.500"
                align="center"
                gutterBottom
              >
                Datos principales
              </Typography>
              <Typography>
                {disable ? "Revisado:" : "Tiempo en revision:"}
                <Chip
                  label={formatDistanceToNow(
                    new Date(seguimiento?.created_at),
                    { addSuffix: true, locale: es }
                  )}
                />
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
                    Rastra
                  </Typography>
                  <Divider />
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={600}
                    color={"gray.500"}
                  >
                    {seguimiento?.rastra.code}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={6} lg={4} xl={3}>
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={400}
                    color={"gray.500"}
                  >
                    Tipo
                  </Typography>
                  <Divider />
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={600}
                    color={"gray.500"}
                  >
                    {seguimiento?.type === "IMPORT" ? "Importación" : "Local"}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={6} lg={4} xl={3}>
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={400}
                    color={"gray.500"}
                  >
                    Transportista
                  </Typography>
                  <Divider />
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={600}
                    color={"gray.500"}
                  >
                    {seguimiento?.transporter.name}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={6} lg={4} xl={3}>
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={400}
                    color={"gray.500"}
                  >
                    Tractor
                  </Typography>
                  <Divider />
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={600}
                    color={"gray.500"}
                  >
                    {seguimiento?.transporter.tractor}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={6} lg={4} xl={3}>
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={400}
                    color={"gray.500"}
                  >
                    Cabezal
                  </Typography>
                  <Divider />
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={600}
                    color={"gray.500"}
                  >
                    {seguimiento?.transporter.code}
                  </Typography>
                </Grid>
                {/* <Grid item xs={12} md={6} lg={4} xl={3}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: 'space-between', mt: 0 }}>

                    <Typography
                      variant="body1"
                      fontWeight={400}
                      color={"gray.500"}
                    >
                      Documento
                    </Typography>
                    {!disable && (
                      <Button
                        onClick={() => setOpenArchivoModal(true)}
                        size="small"
                        variant="text"
                        color="primary"
                        style={{ height: 20 }}
                        startIcon={<CloudUploadTwoToneIcon />}
                      >
                        Cargar
                      </Button>
                    )}
                  </Box>
                  <Divider />
                  {seguimiento.is_archivo_up ?
                    <Chip
                      onClick={handleClickDescargar}
                      label={seguimiento.archivo_name}
                      variant="outlined"
                      color="secondary"
                      icon={<CloudUploadTwoToneIcon color="secondary" />}
                      size="medium"
                      sx={{ mt: 1 }}
                    />
                    :
                    '--'
                  }
                </Grid> */}
                {disable && (
                  <Grid item xs={12} md={6} lg={4} xl={3}>
                    <Typography
                      variant="body1"
                      component="h1"
                      fontWeight={400}
                      color={"gray.500"}
                    >
                      Revisado por:
                    </Typography>
                    <Divider />
                    <Typography
                      variant="body1"
                      component="h1"
                      fontWeight={600}
                      color={"gray.500"}
                    >
                      {seguimiento?.userName}
                    </Typography>
                  </Grid>
                )}
                {disable && seguimiento?.completed_date && (
                  <Grid item xs={6} md={6} lg={4} xl={3}>
                    <Typography
                      variant="body1"
                      component="h1"
                      fontWeight={400}
                      color={"gray.500"}
                    >
                      Completado el:
                    </Typography>
                    <Divider />
                    <Typography
                      variant="body1"
                      component="h1"
                      fontWeight={600}
                      color={"gray.500"}
                    >
                      {format(
                        new Date(seguimiento?.completed_date),
                        "dd/MM/yyyy",
                        {
                          timeZone: "America/Tegucigalpa",
                        }
                      )}
                    </Typography>
                  </Grid>
                )}
                {disable && (
                  <Grid item xs={6} md={6} lg={4} xl={3}>
                    <Typography
                      variant="body1"
                      component="h1"
                      fontWeight={400}
                      color={"gray.500"}
                    >
                      Estado:
                    </Typography>
                    <Divider />
                    <Typography
                      variant="body1"
                      component="h1"
                      fontWeight={600}
                      color={"gray.500"}
                    >
                      <Chip
                        sx={{ mt: 0.5 }}
                        label={
                          seguimiento?.status === "COMPLETE"
                            ? "Completado"
                            : seguimiento?.status === "PENDING"
                              ? "Pendiente"
                              : "En atención"
                        }
                        color={
                          seguimiento?.status === "COMPLETE"
                            ? "success"
                            : seguimiento?.status === "PENDING"
                              ? "warning"
                              : "info"
                        }
                        size="medium"
                        variant="outlined"
                      />
                    </Typography>
                  </Grid>
                )}
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
                    {!disable && (
                      <Button onClick={() => setOpenObservationModal(true)}>
                        Editar
                      </Button>
                    )}
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
                      {seguimiento?.observation || "--"}
                    </Typography>
                  </pre>
                </Grid>

                {user !== null &&
                  +user?.id === seguimiento.user &&
                  disable &&
                  seguimiento?.status === "PENDING" && (
                    <Grid item xs={12} md={6} lg={4} xl={3}>
                      <Typography
                        variant="body1"
                        component="h1"
                        fontWeight={600}
                        color={"gray.500"}
                      >
                        <Button
                          variant="outlined"
                          color="secondary"
                          fullWidth
                          onClick={() => handleEditState()}
                          startIcon={<EditNote />}
                        >
                          Editar
                        </Button>
                      </Typography>
                    </Grid>
                  )}
              </Grid>
            </Box>
          </Card>
        </Grid>
        {/* Tarjeta de Documentos */}
        <Grid item xs={12} md={2} sx={{ marginTop: 1 }}>
          <Card
            sx={{
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'visible',
              boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
              }
            }}
          >
            {/* Botón de acción flotante */}
            <IconButton
              onClick={() => setOpenArchivoModal(true)}
              disabled={disable}
              sx={{
                position: 'absolute',
                top: -15,
                right: -15,
                backgroundColor: 'white',
                boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.grey[100]
                },
                zIndex: 2,
                width: 40,
                height: 40
              }}
            >
              <CloudUploadTwoToneIcon color={disable ? "disabled" : "primary"} />
            </IconButton>

            {/* Contenido de la tarjeta */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 2,
                flexDirection: "column",
                flex: 1,
                pt: 3
              }}
            >
              <Typography
                variant="h6"
                component="h2"
                fontWeight={500}
                color="gray.500"
                align="center"
                gutterBottom
              >
                Documentos
              </Typography>
              <Divider sx={{ width: '100%', mb: 2 }} />

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  gap: 2
                }}
              >
                {seguimiento.file_1 || seguimiento.file_2 ? (
                  <>
                    <Box
                      sx={{
                        position: 'relative',
                        mb: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <FileCopyTwoToneIcon color="secondary" sx={{ fontSize: 68 }} />
                      <Badge
                        badgeContent={seguimiento.file_1 && seguimiento.file_2 ? 2 : seguimiento.file_1 ? 1 : seguimiento.file_2 ? 1 : 0}
                        color="primary"
                        sx={{
                          position: 'absolute',
                          top: -10,
                          right: -10
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 2 }}>

                      {/* <PDFDownloadLink
                        fileName={`TRK-${seguimiento.id?.toString().padStart(5, "0")}`}
                        document={
                          <TrakerPDFDocument
                            seguimiento={seguimiento}
                            outputTypeData={outputTypeData}
                            driver={dataDriver?.results[0]}
                            op1={
                              seguimiento.opm1 !== undefined && seguimiento.opm1 !== null
                                ? dataOp1?.results[0]
                                : undefined
                            }
                            op2={
                              seguimiento.opm2 !== undefined && seguimiento.opm1 !== null
                                ? dataOp2?.results[0]
                                : undefined
                            }
                            outputLocation={dataOutputLocation?.results[0]}
                          />
                        }
                      >
                        {({ loading: pdfLoading }) => {
                          const loading =
                            pdfLoading ||
                            loadingDriver ||
                            loadingOP1 ||
                            loadingOP2 ||
                            loadingOutputData;
                          return (
                            <IconButton
                              color="secondary"
                              disabled={loading}
                              sx={{
                                backgroundColor: (theme) => theme.palette.grey[100],
                                '&:hover': {
                                  backgroundColor: (theme) => theme.palette.grey[200]
                                }
                              }}
                            >
                              <PictureAsPdfTwoToneIcon />
                            </IconButton>
                          );
                        }}
                      </PDFDownloadLink> */}
                      <PDFDownloader
                        seguimiento={seguimiento}
                        outputTypeData={outputTypeData}
                        driver={dataDriver?.results[0]}
                        op1={seguimiento.opm1 !== undefined && seguimiento.opm1 !== null
                          ? dataOp1?.results[0]
                          : undefined}
                        op2={seguimiento.opm2 !== undefined && seguimiento.opm1 !== null
                          ? dataOp2?.results[0]
                          : undefined}
                        outputLocation={dataOutputLocation?.results[0]}
                      />
                    </Box>
                  </>
                ) : (
                  <>
                    <Box sx={{ position: 'relative', textAlign: 'center', mb: 2 }}>
                      <FileCopyTwoToneIcon color="disabled" sx={{ fontSize: 70, opacity: 0.4 }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ fontWeight: 500 }}>
                      No hay documentos cargados
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      onClick={() => setOpenArchivoModal(true)}
                      startIcon={<CloudUploadTwoToneIcon />}
                      disabled={disable}
                      sx={{
                        mt: 'auto',
                        borderRadius: '20px',
                        textTransform: 'none'
                      }}
                    >
                      Cargar documento
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Tarjeta de Alertas/Reclamos */}
        <Grid item xs={12} md={2} sx={{ marginTop: 1 }}>
          <Card
            sx={{
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'visible',
              boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
              }
            }}
          >
            {/* Botón de acción flotante */}
            <IconButton
              onClick={openClaim}
              sx={{
                position: 'absolute',
                top: -15,
                right: -15,
                backgroundColor: seguimiento.claim ? '#fef0f0' : 'white',
                color: seguimiento.claim ? 'error.main' : 'inherit',
                boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                '&:hover': {
                  backgroundColor: seguimiento.claim ? '#fee6e6' : (theme) => theme.palette.grey[100]
                },
                zIndex: 2,
                width: 40,
                height: 40
              }}
            >
              <AssignmentLateTwoToneIcon color={seguimiento.claim ? "error" : "action"} />
            </IconButton>

            {/* Contenido de la tarjeta */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 2,
                flexDirection: "column",
                flex: 1,
                pt: 3,
                backgroundColor: seguimiento.claim ? 'rgba(244, 67, 54, 0.03)' : 'transparent'
              }}
            >
              <Typography
                variant="h6"
                component="h2"
                fontWeight={500}
                color={seguimiento.claim ? "error.main" : "gray.500"}
                align="center"
                gutterBottom
              >
                {seguimiento?.type === "IMPORT" ? "Reclamos" : "Alertas de Calidad"}
              </Typography>
              <Divider sx={{
                width: '100%',
                mb: 2,
                borderColor: seguimiento.claim ? 'rgba(244, 67, 54, 0.2)' : 'inherit'
              }} />

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  gap: 2
                }}
              >
                {seguimiento.claim ? (
                  <>
                    <Box
                      sx={{
                        position: 'relative',
                        mb: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <AssignmentLateTwoToneIcon color="error" sx={{ fontSize: 68 }} />
                      <Badge
                        badgeContent="!"
                        color="error"
                        sx={{
                          position: 'absolute',
                          top: -5,
                          right: -10
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="error" align="center" sx={{ fontWeight: 600 }}>
                      {seguimiento?.type === "IMPORT" ? "Claim registrado" : "Alerta de Calidad registrada"}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      color="error"
                      onClick={openClaim}
                      startIcon={<VisibilityTwoToneIcon />}
                      sx={{
                        mt: 'auto',
                        borderRadius: '5px',
                        boxShadow: '0 4px 8px rgba(244, 67, 54, 0.25)',
                        textTransform: 'none'
                      }}
                    >
                      Ver detalles
                    </Button>
                  </>
                ) : (
                  <>
                    <Box sx={{ position: 'relative', textAlign: 'center', mb: 2 }}>
                      <AssignmentLateTwoToneIcon color="disabled" sx={{ fontSize: 70, opacity: 0.4 }} />
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: 'text.disabled',
                          fontWeight: 'bold'
                        }}
                      >
                        0
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ fontWeight: 500 }}>
                      No hay {seguimiento?.type === "IMPORT" ? "reclamos" : "alertas de calidad"}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      color="warning"
                      onClick={openClaim}
                      startIcon={<AddTwoToneIcon />}
                      sx={{
                        mt: 'auto',
                        borderRadius: '5px',
                        textTransform: 'none'
                      }}
                    >
                      Registrar
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} sx={{ marginTop: 1 }}>
          <Divider>
            <Typography
              variant="body1"
              component="h1"
              fontWeight={400}
              color={"gray.500"}
            >
              Datos generales
            </Typography>
          </Divider>
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="outlined-basic"
                label="Numero de placa"
                variant="outlined"
                size="small"
                autoComplete="off"
                disabled={disable}
                {...register("plateNumber")}
                onBlur={(e) =>
                  sendDataToBackend("plate_number", e.target.value || null)
                }
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <LocationSelect
                control={control}
                name="originLocation"
                placeholder="Localidad de Origen"
                locationId={watch("originLocation")}
                label="Localidad de Origen"
                disabled={disable}
                onChange={(e) =>
                  sendDataToBackend("origin_location", e?.id || null)
                }
              />
            </Grid>
            <Grid item xs={12} md={10}>
              {seguimiento.type === "LOCAL" ? (
                <DriverSelect
                  control={control}
                  name="driver"
                  placeholder="Conductor"
                  disabled={disable}
                  driver={watch("driver") || undefined}
                  onChange={(e) => sendDataToBackend("driver", e?.id || null)}
                />
              ) : (
                <TextField
                  fullWidth
                  id="outlined-basic"
                  label="Conductor"
                  variant="outlined"
                  size="small"
                  disabled={disable}
                  autoComplete="off"
                  {...register("driverImport")}
                  onBlur={(e) =>
                    sendDataToBackend("driver_import", e.target.value || null)
                  }
                />
              )}
            </Grid>
            <Grid item xs={2} md={2}>
              {watch("driver") && (
                <ShowCodeDriver driverId={watch("driver") || undefined} />
              )}
            </Grid>
            {seguimiento?.type === "IMPORT" && (
              <Grid item xs={12} md={12}>
                <TextField
                  fullWidth
                  id="outlined-basic"
                  label="No. contenedor"
                  variant="outlined"
                  size="small"
                  disabled={disable}
                  autoComplete="off"
                  {...register("containernumber")}
                  onBlur={(e) =>
                    sendDataToBackend(
                      "container_number",
                      e.target.value || null
                    )
                  }
                />
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              {seguimiento?.type === "LOCAL" ? (
                <TextField
                  fullWidth
                  id="outlined-basic"
                  label="Tranferencia de entrada"
                  variant="outlined"
                  size="small"
                  type="number"
                  autoComplete="off"
                  disabled={disable}
                  {...register("documentNumber")}
                  onBlur={(e) =>
                    sendDataToBackend(
                      "input_document_number",
                      e.target.value || null
                    )
                  }
                />
              ) : (
                <TextField
                  fullWidth
                  id="outlined-basic"
                  label="No. Factura"
                  variant="outlined"
                  size="small"
                  type="text"
                  autoComplete="off"
                  disabled={disable}
                  {...register("invoiceNumber")}
                  onBlur={(e) =>
                    sendDataToBackend("invoice_number", e.target.value || null)
                  }
                />
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="outlined-basic"
                label="ZTRIC - N° de Ingreso 5001"
                variant="outlined"
                size="small"
                disabled={disable}
                type="number"
                autoComplete="off"
                {...register("transferNumber")}
                onBlur={(e) =>
                  sendDataToBackend("transfer_number", e.target.value || null)
                }
              />
            </Grid>
          </Grid>
        </Grid>

        {seguimiento.type === "LOCAL" && (
          <Grid item xs={12} md={6} sx={{ marginTop: 1 }}>
            <Divider>
              <Typography
                variant="body1"
                component="h1"
                fontWeight={400}
                color={"gray.500"}
              >
                Productividad
              </Typography>
            </Divider>
            <Grid container spacing={2} sx={{ marginTop: 2 }}>
              <Grid item xs={6} md={6} lg={4}>
                <Typography
                  variant="body1"
                  component="h1"
                  fontWeight={400}
                  color={"gray.500"}
                >
                  Inicio descarga
                </Typography>
                <Divider />
                <Typography
                  variant="body2"
                  component="h1"
                  fontWeight={400}
                  color={"gray.500"}
                >
                  {(tiempoEntrada &&
                    tiempoEntrada !== null &&
                    format(tiempoEntrada, "HH:mm:ss", {
                      locale: es,
                      timeZone: "America/Tegucigalpa",
                    })) ||
                    "00:00:00"}
                </Typography>
              </Grid>
              <Grid item xs={6} md={6} lg={4}>
                <Typography
                  variant="body1"
                  component="h1"
                  fontWeight={400}
                  color={"gray.500"}
                >
                  Finalización de descarga
                </Typography>
                <Divider />
                <Typography
                  variant="body2"
                  component="h1"
                  fontWeight={400}
                  color={"gray.500"}
                >
                  {(tiempoSalida &&
                    tiempoSalida !== null &&
                    format(tiempoSalida, "HH:mm:ss")) ||
                    "00:00:00"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <Typography
                  variant="body1"
                  component="h1"
                  fontWeight={400}
                  color={"gray.500"}
                >
                  TAT
                </Typography>
                <Divider />
                <Typography
                  variant="body2"
                  component="h1"
                  fontWeight={400}
                  color={"gray.500"}
                >
                  {tiempoSalida && tiempoEntrada && tiempoEntrada !== null
                    ? formatDistance(tiempoEntrada, tiempoSalida, {
                      locale: es,
                    })
                    : "--:--:--"}
                </Typography>
              </Grid>

              <Grid item xs={6} md={6} sx={{ marginTop: "4px" }}>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  color="success"
                  disabled={tiempoEntrada ? true : false || disable}
                  onClick={() => {
                    sendDataToBackend("input_date", new Date().toISOString());
                    // updateSeguimientoDatosOperador({ tiempoEntrada: new Date() })
                  }}
                >
                  Iniciar descarga
                </Button>
              </Grid>
              <Grid item xs={6} md={6} sx={{ marginTop: "4px" }}>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  color="error"
                  disabled={
                    tiempoEntrada === undefined ||
                    tiempoEntrada === null ||
                    (tiempoSalida !== undefined && tiempoSalida !== null) ||
                    disable
                  }
                  onClick={() => {
                    sendDataToBackend("output_date", new Date().toISOString());
                    // updateSeguimientoDatosOperador({ tiempoSalida: new Date() })
                  }}
                >
                  Finalizar descarga
                </Button>
              </Grid>
              <Grid item xs={12}>
                <OperatorSelect
                  control={control}
                  distributionCenterId={centro_distribucion || null}
                  name="opm1"
                  label="Operador #1"
                  operatorId={watch("opm1")}
                  disabled={disable}
                  invalidId={watch("opm2")}
                  onChange={(e) =>
                    sendDataToBackend("operator_1", e?.id || null)
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <OperatorSelect
                  control={control}
                  distributionCenterId={centro_distribucion || null}
                  name="opm2"
                  disabled={disable}
                  label="Operador #2"
                  operatorId={watch("opm2")}
                  invalidId={watch("opm1")}
                  onChange={(e) =>
                    sendDataToBackend("operator_2", e?.id || null)
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        )}
        <Grid item xs={12} sx={{ marginTop: 1 }} md={6}>
          <Divider>
            <Typography
              variant="body1"
              component="h1"
              fontWeight={400}
              color={"gray.500"}
            >
              Entrada de producto
            </Typography>
          </Divider>
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            {!disable && (
              <>
                {" "}
                <Grid item xs={12} md={12} lg={4} xl={4}></Grid>
                <Grid item xs={12} md={6} lg={4} xl={4}></Grid>
                <Grid item xs={12} md={6} lg={4} xl={4}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    color="secondary"
                    startIcon={<AddTwoToneIcon />}
                    disabled={
                      watch("originLocation") === undefined ||
                      watch("originLocation") === null ||
                      (watch("documentNumber")?.toString() === "" &&
                        watch("invoiceNumber")?.toString() === "")
                    }
                    onClick={() => {
                      setopen(true);
                    }}
                  >
                    Agregar producto
                  </Button>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Table size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Detalle</StyledTableCell>
                    <StyledTableCell align={isMobile ? "left" : "right"}>
                      Material
                      </StyledTableCell>
                    {!isMobile && <StyledTableCell align="right">Texto Breve de Material</StyledTableCell>}
                    <StyledTableCell align="right">
                      Pallets
                    </StyledTableCell>
                    {!disable && (
                      <StyledTableCell align="right">Acciones</StyledTableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {seguimiento?.detalles.map((detalle, index) => {
                    return (
                      <ProductoEntradaTableRow
                        key={detalle.name}
                        row={detalle}
                        seguimiento={seguimiento}
                        index={index}
                        indexSeguimiento={indice}
                        disable={disable}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </Grid>
        {seguimiento.type === "LOCAL" && (
          <Grid item xs={12} sx={{ marginTop: 1 }} md={6}>
            <Divider>
              <Typography
                variant="body1"
                component="h1"
                fontWeight={400}
                color={"gray.500"}
              >
                Salida de producto
              </Typography>
            </Divider>
            <Grid container spacing={1} sx={{ marginTop: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="outlined-basic"
                  label="Transferencia de salida"
                  variant="outlined"
                  size="small"
                  type="number"
                  disabled={disable}
                  {...register("documentNumberExit")}
                  onBlur={(e) =>
                    sendDataToBackend(
                      "output_document_number",
                      e.target.value || null
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="outlined-basic"
                  label="Contabilizado"
                  variant="outlined"
                  size="small"
                  type="number"
                  disabled={disable}
                  {...register("accounted")}
                  onBlur={(e) =>
                    sendDataToBackend("accounted", e.target.value || null)
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LocationSelect
                  control={control}
                  name="outputLocation"
                  placeholder="Localidad de Envío"
                  locationId={watch("outputLocation")}
                  label="Localidad de Envío"
                  disabled={disable}
                  onChange={(e) =>
                    sendDataToBackend("destination_location", e?.id)
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <AutoCompleteBase
                  control={control}
                  name="outputType"
                  placeholder="Unidad Cargada con"
                  disabled={disable}
                  options={outputType.map((d) => ({
                    label: d.name,
                    id: d.id?.toString(),
                  }))}
                  onChange={(e) => sendDataToBackend("output_type", e)}
                />
              </Grid>
              <Grid item xs={12}>
                <ShowRoute
                  distributorCenterId={seguimiento.distributorCenter}
                  locationId={watch("outputLocation")}
                />
              </Grid>
              {outputTypeData && (
                <>
                  {outputTypeData.required_orders && !disable && (
                    <Grid item xs={12} md={6} lg={4} xl={4}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        color="secondary"
                        startIcon={<EditTwoTone />}
                        onClick={() => setopenOrderModal(true)}
                      >
                        Pedido
                      </Button>
                    </Grid>
                  )}
                  {outputTypeData?.required_details && !disable && (
                    <Grid item xs={12} md={6} lg={4} xl={4}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        color="secondary"
                        startIcon={<AddTwoToneIcon />}
                        onClick={() => setopenOutput(true)}
                      >
                        Agregar producto de salida
                      </Button>
                    </Grid>
                  )}
                  <OutPutDetail
                    seguimiento={seguimiento}
                    disable={disable}
                    outputType={outputTypeData}
                  />
                </>
              )}
            </Grid>
          </Grid>
        )}
      </Grid>
    </>
  );
};
