import { useState, useMemo } from "react";
import { Document, Page, View, StyleSheet, Image } from "@react-pdf/renderer";
import PDFText from "../../ui/components/pdfDocs/PDFText";
import { Seguimiento } from "../../../store/seguimiento/seguimientoSlice";
import PDFTable from "../../ui/components/pdfDocs/Table";
import { formatDistance, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { OutputType } from "../../../interfaces/tracking";
import outputTypeDataToShow from "../../../config/outputTypeData";
import { format } from "date-fns-tz";
import {
  Driver,
  LocationType,
  Operator,
} from "../../../interfaces/maintenance";
import PDFTitle from "../../ui/components/pdfDocs/PDFTitle";
import PDFSubTitle from "../../ui/components/pdfDocs/PDFSubTitle";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import PictureAsPdfTwoToneIcon from "@mui/icons-material/PictureAsPdfTwoTone";
import Box from "@mui/material/Box";
import logo_ch from "../../../assets/logo-ch.png";
import QRToBase64 from "../../claim/components/QRToBase64";
import Backdrop from '@mui/material/Backdrop';

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "white",
    padding: "0.5cm",
  },
  section: { paddingVertical: 5 },
  title: {
    textAlign: "center",
    fontSize: 20,
  },
  divider: {
    backgroundColor: 'gray',
    height: 1,
    width: '100%',
    marginBottom: 10,
  },
  subTitle: {
    marginBottom: 5,
  },
  imageContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  documentImage: {
    width: '100%',
    height: 600,
    objectFit: 'contain',
    marginHorizontal: 'auto',
    marginBottom: 8,
    border: '1pt solid #ddd',
  },
  imageCaption: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 5,
    color: '#666',
  },
  imagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  imageItem: {
    width: '100%',
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

interface TrakerPDFDocumentProps {
  seguimiento: Seguimiento;
  outputTypeData?: OutputType;
  driver?: Driver;
  op1?: Operator;
  op2?: Operator;
  qrDataUrl?: string;
  outputLocation?: LocationType;
  imageBase64_1?: string | null;
  imageBase64_2?: string | null;
}

function TrakerPDFDocument({
  seguimiento,
  outputTypeData,
  driver,
  op1,
  op2,
  outputLocation,
  imageBase64_1,
  imageBase64_2,
  qrDataUrl,
}: TrakerPDFDocumentProps) {
  const entradaTableData = seguimiento.detalles
    .map((det) => {
      const rows =
        det.history?.map((h) => [
          det.sap_code,
          det.name,
          h.pallets,
          h.date && format(new Date(parseISO(h.date.split("T")[0])), "yyyy-MM-dd"),
        ]) || [];
      return rows;
    })
    .flat(1);

  // FUNCIONALIDAD HÍBRIDA: Lógica corregida para mostrar datos híbridos
  const salidaTableData = outputTypeData?.required_details || outputTypeData?.required_orders
    ? seguimiento.detallesSalida?.map((detail) => [
        detail.sap_code,
        detail.name,
        detail.amount,
        detail.expiration_date,
      ]) || []
    : outputTypeDataToShow
      .find((ot) => ot.name.toUpperCase() === outputTypeData?.name)
      ?.rows.map((row) => [row.material, row.description, row.quantity]) ||
    [];

  // FUNCIONALIDAD HÍBRIDA: Estilos corregidos para datos híbridos
  const outputRowCellStyles =
    outputTypeData && (outputTypeData.required_details || outputTypeData.required_orders)
      ? [{ flex: 1 }, { flex: 2 }, { flex: 1 }, { flex: 1 }]
      : [{ flex: 1 }, { flex: 2 }, { flex: 1 }];

  const inputRowCellStyles = [
    { flex: 1 },
    { flex: 2 },
    { flex: 1 },
    { flex: 1 },
  ];

  const tiempoEntrada = seguimiento?.timeStart
    ? new Date(seguimiento?.timeStart)
    : null;
  const tiempoSalida = seguimiento?.timeEnd
    ? new Date(seguimiento?.timeEnd)
    : null;


  const flagurl = useMemo(() => {
      const country_code = seguimiento?.country_code.toLowerCase();
      return `https://flagcdn.com/h240/${country_code}.png`;
    }, [seguimiento?.country_code]);



  // Verificar si hay archivos de imagen
  const hasImages = seguimiento.file_data_1 || seguimiento.file_data_2;

  // Determinar las extensiones de los archivos para saber si son imágenes
  const isFileImage = (extension: string | undefined | null) => {
    if (!extension) return false;
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension.toLowerCase());
  };

  // Verificar si los archivos son imágenes
  const file1IsImage = seguimiento.file_data_1 && isFileImage(seguimiento.file_data_1.extension);
  const file2IsImage = seguimiento.file_data_2 && isFileImage(seguimiento.file_data_2.extension);

  // Determinar nombres de los documentos según el tipo de seguimiento
  const getDocumentName = (fileNum: number) => {
    if (seguimiento.type === "IMPORT") {
      return fileNum === 1 ? "Gate Pass" : "Factura";
    } else {
      return `Documento`;
    }
  };

  return (
    <Document
      title="Datos Tracker"
      language="es"
      style={{ fontFamily: "Helvetica" }}
      author="AbinBev"
      creator="AbinBev Tracker"
      keywords="Tracker, AbinBev, PDF, Seguimiento"
    >
      <Page size="LETTER" style={styles.page}>
        <View
          style={{ ...styles.section, display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flex: 1, alignItems: "flex-start" }}>
            <Image src="/logo.png" style={{ width: 180 }} />
          </View>
          
          {seguimiento?.country_code === "HN" && (
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Image src={logo_ch} style={{ width: 130 }} />
            </View>
          )}
        </View>
        <View style={{ ...styles.divider }} />
        
        <View
          style={{
            ...styles.section,
            backgroundColor: "#1c2536",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <View style={{ marginLeft: 10 }}>
            <Image
              src={flagurl}
              style={{ width: 100 }}
            />
          </View>
          <View
            style={{
              flex: 1,
              paddingLeft: -30,
              alignContent: "center",
              justifyContent: "center",
            }}
          >
            <PDFTitle style={{ color: "white", fontSize: 30 }}>
              TRK-{seguimiento.id?.toString().padStart(5, "0")}
            </PDFTitle>
          </View>
          <View style={{ marginLeft: 10, marginRight: 10, borderRadius: 7 }}>
            <Image src={qrDataUrl||''} style={{ width: 50, borderRadius: 7 }} />
          </View>
        </View>
        <View style={{ display: "flex", flexDirection: "row" }}>
          <View style={{ ...styles.section, flex: 1 }}>
            <PDFSubTitle style={{ ...styles.subTitle }}>Datos principales:</PDFSubTitle>
            <View style={{ flexDirection: "row", paddingRight: 10 }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Fecha de registro:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>
                  {format(new Date(seguimiento?.created_at), "dd/MM/yyyy")}
                </PDFText>
              </View>

            </View>
            <View style={{ flexDirection: "row", paddingRight: 10 }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Centro distribución:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>
                  {seguimiento?.distributorCenterName}
                </PDFText>
              </View>

            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Número de Rastra:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>{seguimiento?.rastra.code}</PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Tipo:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>
                  {seguimiento?.type === "IMPORT" ? "Importación" : "Local"}
                </PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Transportista:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>{seguimiento?.transporter.name}</PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Tractor:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>{seguimiento?.transporter.tractor}</PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Cabezal:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>{seguimiento?.transporter.code}</PDFText>
              </View>
            </View>
          </View>

          <View style={{ ...styles.section, flex: 1 }}>
            <PDFSubTitle style={{ ...styles.subTitle }}>Datos generales:</PDFSubTitle>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 125 }}>
                <PDFText>Numero de placa:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>{seguimiento.plateNumber}</PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 125 }}>
                <PDFText>Localidad de origen:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>
                  {seguimiento.originLocationData?.name}-
                  {seguimiento.originLocationData?.code}
                </PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 125 }}>
                <PDFText>Conductor:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>
                  {seguimiento.type === "LOCAL"
                    ? `${driver?.first_name}`
                    : `${seguimiento.driverImport}`}
                </PDFText>
              </View>
            </View>

            {seguimiento.type === "IMPORT" && (
              <View style={{ flexDirection: "row" }}>
                <View style={{ minWidth: 125 }}>
                  <PDFText>No. Contenedor:</PDFText>
                </View>
                <View style={{ flex: 1 }}>
                  <PDFText>{seguimiento.containernumber}</PDFText>
                </View>
              </View>
            )}
            {seguimiento.type === "LOCAL" ? (
              <View style={{ flexDirection: "row" }}>
                <View style={{ minWidth: 125 }}>
                  <PDFText>Transferencia de entrada:</PDFText>
                </View>
                <View style={{ flex: 1 }}>
                  <PDFText>{seguimiento.documentNumber}</PDFText>
                </View>
              </View>
            ) : (
              <View style={{ flexDirection: "row" }}>
                <View style={{ minWidth: 125 }}>
                  <PDFText>No. Factura:</PDFText>
                </View>
                <View style={{ flex: 1 }}>
                  <PDFText>{seguimiento.invoiceNumber}</PDFText>
                </View>
              </View>
            )}
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 125 }}>
                <PDFText>ZTRIC - N° de Ingreso 5001:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>{seguimiento.transferNumber}</PDFText>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <PDFSubTitle style={{ ...styles.subTitle }}>Observaciones:</PDFSubTitle>
          <View style={{ flex: 1 }}>
            <PDFText>{seguimiento.observation || "--"}</PDFText>
          </View>
        </View>
        <View style={styles.section}></View>
        <View style={styles.section}>
          <PDFSubTitle style={{ ...styles.subTitle }}>Entrada de producto:</PDFSubTitle>
          <PDFTable
            data={entradaTableData}
            header={["N° Sap", "Producto", "Pallets", "Fecha Expiración"]}
            headerCellsStyle={inputRowCellStyles}
            rowCellsStyle={inputRowCellStyles}
          />
        </View>
        {seguimiento.type === "LOCAL" && (
          <>
            <View style={{ display: "flex", flexDirection: "row" }}>
              <View style={{ ...styles.section, flex: 1 }}>
                <PDFSubTitle style={{ ...styles.subTitle }}>Datos del Operador:</PDFSubTitle>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ minWidth: 100 }}>
                    <PDFText>Tiempo de entrada:</PDFText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <PDFText>
                      {(tiempoEntrada &&
                        tiempoEntrada !== null &&
                        format(tiempoEntrada, "HH:mm:ss", {
                          locale: es,
                          timeZone: "America/Tegucigalpa",
                        })) ||
                        "00:00:00"}
                    </PDFText>
                  </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ minWidth: 100 }}>
                    <PDFText>Tiempo de salida:</PDFText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <PDFText>
                      {(tiempoSalida &&
                        tiempoSalida !== null &&
                        format(tiempoSalida, "HH:mm:ss")) ||
                        "00:00:00"}
                    </PDFText>
                  </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ minWidth: 100 }}>
                    <PDFText>Tiempo invertido:</PDFText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <PDFText>
                      {tiempoSalida && tiempoEntrada && tiempoEntrada !== null
                        ? formatDistance(tiempoEntrada, tiempoSalida, {
                          locale: es,
                        })
                        : "--:--:--"}
                    </PDFText>
                  </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ minWidth: 100 }}>
                    <PDFText>Operador 1:</PDFText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <PDFText>
                      {op1?.first_name} {op1?.last_name}
                    </PDFText>
                  </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ minWidth: 100 }}>
                    <PDFText>Operador 2:</PDFText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <PDFText>
                      {op2?.first_name} {op2?.last_name}
                    </PDFText>
                  </View>
                </View>
              </View>

              <View style={{ ...styles.section, flex: 1 }}>
                <PDFSubTitle style={{ ...styles.subTitle }}>Salida de producto:</PDFSubTitle>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ minWidth: 120 }}>
                    <PDFText>Transferencia de salida:</PDFText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <PDFText>{seguimiento.documentNumberExit}</PDFText>
                  </View>
                </View>

                <View style={{ flexDirection: "row" }}>
                  <View style={{ minWidth: 120 }}>
                    <PDFText>Contabilizado: </PDFText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <PDFText>{seguimiento.accounted}</PDFText>
                  </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ minWidth: 120 }}>
                    <PDFText>Localidad de Envío:</PDFText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <PDFText>{outputLocation?.name}</PDFText>
                  </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ minWidth: 120 }}>
                    <PDFText>Unidad cargada con:</PDFText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <PDFText>{outputTypeData?.name}</PDFText>
                  </View>
                </View>
              </View>
            </View>

            {outputTypeData && (
              <View style={styles.section}>
                <PDFSubTitle style={{ ...styles.subTitle }}>Salida de producto:</PDFSubTitle>
                <PDFTable
                  data={salidaTableData}
                  header={
                    outputTypeData.required_details || outputTypeData.required_orders
                      ? ["N° Sap", "Producto", "Cantidad", "Fecha Expiración"]
                      : ["Material", "Texto Breve", "Cantidad"]
                  }
                  headerCellsStyle={outputRowCellStyles}
                  rowCellsStyle={outputRowCellStyles}
                />
              </View>
            )}
          </>
        )}


      </Page>

      {hasImages && (file1IsImage || file2IsImage) && (
        <>
          {file1IsImage && seguimiento.file_data_1 && (
            <Page size="LETTER" style={styles.page}>
              <View style={{ ...styles.section, marginBottom: 10 }}>
                <PDFTitle style={{ color: "#1c2536", fontSize: 18, marginBottom: 10 }}>
                  {seguimiento.type === "IMPORT" ? "Documentos de Importación" : "Documentos adjuntos"}
                </PDFTitle>
                <View style={{ ...styles.divider, marginBottom: 20 }} />

                <View style={styles.imageItem}>
                  <PDFText style={{ ...styles.imageCaption, fontSize: 12, fontWeight: 'bold', marginBottom: 10 }}>
                    {getDocumentName(1)}
                  </PDFText>
                  <Image
                    src={imageBase64_1 || seguimiento.file_data_1.access_url}
                    style={styles.documentImage}
                  />
                </View>
              </View>
            </Page>
          )}

          {file2IsImage && seguimiento.file_data_2 && (
            <Page size="LETTER" style={styles.page}>
              <View style={{ ...styles.section, marginBottom: 10 }}>

                <View style={{ ...styles.divider, marginBottom: 20 }} />

                <View style={styles.imageItem}>
                  <PDFText style={{ ...styles.imageCaption, fontSize: 12, fontWeight: 'bold', marginBottom: 10 }}>
                    {getDocumentName(2)}
                  </PDFText>
                  <Image
                    src={imageBase64_2 || seguimiento.file_data_2.access_url}
                    style={styles.documentImage}
                  />
                  <PDFText style={{ ...styles.imageCaption, fontSize: 10, marginTop: 5 }}>
                    {seguimiento.file_data_2.name || 'Documento 2'}
                  </PDFText>
                </View>
              </View>
            </Page>
          )}
        </>
      )}
    </Document>
  );
}

// Componente para manejar la descarga del PDF bajo demanda
const PDFDownloader = ({
  seguimiento,
  outputTypeData,
  driver,
  op1,
  op2,
  outputLocation,
}: TrakerPDFDocumentProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>("Preparando...");

  // Función para convertir URL de imagen a base64
  const convertImageToBase64 = async (url: string): Promise<string | null> => {
    try {
      // Usar XMLHttpRequest para mayor compatibilidad
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          if (xhr.status === 200) {
            const blob = new Blob([xhr.response]);
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => {
              console.error("Error al leer la imagen como base64");
              resolve(null);
            };
            reader.readAsDataURL(blob);
          } else {
            console.error("Error al cargar imagen:", xhr.status);
            resolve(null);
          }
        };
        xhr.onerror = () => {
          console.error("Error de red al cargar imagen");
          resolve(null);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
      });
    } catch (error) {
      console.error("Error al convertir imagen a base64:", error);
      return null;
    }
  };

  // Función para descargar el PDF
  const downloadPDF = (blob: Blob) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TRK-${seguimiento.id?.toString().padStart(5, "0")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Función para preparar los datos y generar el PDF
  const handleGeneratePDF = async () => {
    if (isProcessing || !qrDataUrl) return;
    
    setIsProcessing(true);
    setProgressMessage("Obteniendo información...");
    setError(null);

    try {
      // 1. Preparar las imágenes para el PDF
      setProgressMessage("Cargando archivos...");
      const file1IsImage = seguimiento.file_data_1 &&
        ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(
          (seguimiento.file_data_1.extension || '').toLowerCase()
        );

      const file2IsImage = seguimiento.file_data_2 &&
        ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(
          (seguimiento.file_data_2.extension || '').toLowerCase()
        );

      const promises: Promise<any>[] = [];
      let imageBase64_1: string | null = null;
      let imageBase64_2: string | null = null;

      if (file1IsImage && seguimiento.file_data_1?.access_url) {
        promises.push(
          convertImageToBase64(seguimiento.file_data_1.access_url)
            .then(base64 => { imageBase64_1 = base64; })
        );
      }

      if (file2IsImage && seguimiento.file_data_2?.access_url) {
        promises.push(
          convertImageToBase64(seguimiento.file_data_2.access_url)
            .then(base64 => { imageBase64_2 = base64; })
        );
      }

      // Esperar a que todas las promesas se resuelvan con timeout
      if (promises.length > 0) {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Tiempo de carga excedido")), 15000)
        );

        await Promise.race([
          Promise.all(promises),
          timeoutPromise
        ]);
      }

      // 2. Generar PDF y mostrar progreso
      setProgressMessage("Generando PDF...");
      
      // Usar react-pdf/renderer para generar el PDF
      const { pdf } = await import('@react-pdf/renderer');
      const blob = await pdf(
        <TrakerPDFDocument
          seguimiento={seguimiento}
          outputTypeData={outputTypeData}
          driver={driver}
          op1={op1}
          op2={op2}
          outputLocation={outputLocation}
          imageBase64_1={imageBase64_1}
          imageBase64_2={imageBase64_2}
          qrDataUrl={qrDataUrl}
        />
      ).toBlob();
      
      // 3. Descargar el PDF generado
      setProgressMessage("Descargando PDF...");
      
      // Pequeña pausa para mostrar el mensaje de descarga
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Descargar el archivo
      downloadPDF(blob);
      
      // Finalizar con éxito
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error al generar PDF:", error);
      setError("No se pudo generar el PDF. Por favor intente de nuevo.");
      setIsProcessing(false);
    }
  };

  return (
    <Box>
      {/* Componente QRToBase64 que siempre está presente pero invisible */}
      <Box sx={{ display: 'none' }}>
        <QRToBase64 
          value={`${import.meta.env.VITE_JS_FRONTEND_URL}/tracker/detail/${seguimiento.id}`} 
          logoSrc="/logo-qr.png" 
          onReady={(dataUrl) => setQrDataUrl(dataUrl)} 
        />
      </Box>

      {/* Botón visible para el usuario que inicia todo el proceso */}
      <Button
        startIcon={<PictureAsPdfTwoToneIcon />}
        variant="contained"
        color="secondary"
        onClick={handleGeneratePDF}
        disabled={isProcessing || !qrDataUrl}
        size="small"
        sx={{
          borderRadius: '5px',
          textTransform: 'none',
          minWidth: '140px'
        }}
      >
        Descargar PDF
      </Button>

      {/* Backdrop para mostrar el progreso con diseño mejorado y colores más suaves */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: theme => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(3px)',
          borderRadius: 2,
          backgroundColor: 'rgba(28, 37, 54, 0.15)' // color-sidebar-primary con opacidad
        }}
        open={isProcessing}
      >
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          maxWidth: 260,
          textAlign: 'center',
          p: 2.5,
          borderRadius: 2,
          background: 'linear-gradient(145deg, rgba(231, 207, 15, 0.15) 0%, rgba(17, 15, 13, 0.75) 100%)',
          boxShadow: '0 8px 16px rgba(17, 15, 13, 0.3)',
          border: '1px solid rgba(231, 207, 15, 0.2)'
        }}>
          <Box sx={{ 
            position: 'relative', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            mb: 1
          }}>
            <CircularProgress 
              size={46} 
              thickness={3} 
              sx={{ 
                color: '#e7cf0f', // color-primary
                opacity: 0.9
              }} 
            />
            <Box sx={{ 
              position: 'absolute', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <PictureAsPdfTwoToneIcon sx={{ fontSize: 20, color: '#fff' }} />
            </Box>
          </Box>
          
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 500,
              letterSpacing: 0.3,
              fontSize: '1rem',
              color: '#e7cf0f' // color-primary
            }}
          >
            {progressMessage}
          </Typography>
          
          <Box sx={{ 
            width: '75%', 
            mt: 0.5,
            position: 'relative',
            height: 2,
            backgroundColor: 'rgba(148, 156, 166, 0.3)', // text-sidebar-primary con opacidad
            borderRadius: 1,
            overflow: 'hidden'
          }}>
            <Box 
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                background: 'linear-gradient(90deg, rgba(231, 207, 15, 0.3) 0%, rgba(231, 207, 15, 0.9) 50%, rgba(231, 207, 15, 0.3) 100%)',
                animation: 'progressAnimation 1.5s infinite ease-in-out',
                width: '30%',
                borderRadius: 1,
                '@keyframes progressAnimation': {
                  '0%': {
                    left: '-30%',
                  },
                  '100%': {
                    left: '100%',
                  }
                }
              }} 
            />
          </Box>
          
          <Typography 
            variant="caption" 
            sx={{ 
              opacity: 0.9, 
              mt: 0.5,
              fontSize: '0.675rem',
              color: '#949ca6' // text-sidebar-primary
            }}
          >
            No cierre esta ventana
          </Typography>
        </Box>
      </Backdrop>

      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default PDFDownloader;