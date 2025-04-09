import { useState, useEffect, useMemo } from "react";
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
import { PDFDownloadLink } from "@react-pdf/renderer";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import PictureAsPdfTwoToneIcon from "@mui/icons-material/PictureAsPdfTwoTone";
import Box from "@mui/material/Box";
import logo_ch from "../../../assets/logo-ch.png";
import QRToBase64 from "../../claim/components/QRToBase64";

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

  const salidaTableData = outputTypeData?.required_details
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

  const outputRowCellStyles =
    outputTypeData && outputTypeData.required_details
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
                    outputTypeData.required_details
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

// Componente para manejar la precarga de imágenes y la descarga del PDF
const PDFDownloader = ({
  seguimiento,
  outputTypeData,
  driver,
  op1,
  op2,
  outputLocation,
}: TrakerPDFDocumentProps) => {
  const [imageBase64_1, setImageBase64_1] = useState<string | null>(null);
  const [imageBase64_2, setImageBase64_2] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Verificar si hay imágenes para cargar
        const file1IsImage = seguimiento.file_data_1 &&
          ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(
            (seguimiento.file_data_1.extension || '').toLowerCase()
          );

        const file2IsImage = seguimiento.file_data_2 &&
          ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(
            (seguimiento.file_data_2.extension || '').toLowerCase()
          );

        // Cargar imágenes en paralelo
        const promises = [];

        if (file1IsImage && seguimiento.file_data_1?.access_url) {
          promises.push(
            convertImageToBase64(seguimiento.file_data_1.access_url)
              .then(base64 => setImageBase64_1(base64))
          );
        }

        if (file2IsImage && seguimiento.file_data_2?.access_url) {
          promises.push(
            convertImageToBase64(seguimiento.file_data_2.access_url)
              .then(base64 => setImageBase64_2(base64))
          );
        }

        // Si no hay imágenes, simplemente finalizamos la carga
        if (promises.length === 0) {
          setIsLoading(false);
          return;
        }

        // Esperar a que todas las imágenes se carguen (con un timeout máximo)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Tiempo de carga excedido")), 15000)
        );

        await Promise.race([
          Promise.all(promises),
          timeoutPromise
        ]);

        setIsLoading(false);
      } catch (error) {
        console.error("Error al cargar imágenes:", error);
        setError("No se pudieron cargar las imágenes. Se generará el PDF sin ellas.");
        setIsLoading(false);
      }
    };

    loadImages();
  }, [seguimiento]);


  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  return (
    <Box>
      <QRToBase64 value={`${import.meta.env.VITE_JS_FRONTEND_URL}/tracker/detail/${seguimiento.id}`} logoSrc="/logo-qr.png" onReady={(dataUrl) => setQrDataUrl(dataUrl)} />
      {isLoading ? (
        <Button
          startIcon={<CircularProgress size={20} />}
          variant="contained"
          color="secondary"
          disabled
          sx={{
            mt: 'auto',
            borderRadius: '5px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
            textTransform: 'none',
            minWidth: '140px'
          }}
        >
          Preparando PDF...
        </Button>
      ) : (
        <PDFDownloadLink
          document={
            <TrakerPDFDocument
              seguimiento={seguimiento}
              outputTypeData={outputTypeData}
              driver={driver}
              op1={op1}
              op2={op2}
              outputLocation={outputLocation}
              imageBase64_1={imageBase64_1}
              imageBase64_2={imageBase64_2}
              qrDataUrl={qrDataUrl || undefined}
            />
          }
          fileName={`TRK-${seguimiento.id?.toString().padStart(5, "0")}.pdf`}
          style={{ textDecoration: 'none' }}
        >
          {({ loading }) => (
            <Button
              startIcon={loading ? <CircularProgress size={20} /> : <PictureAsPdfTwoToneIcon />}
              variant="outlined"
              color="secondary"
              disabled={loading}
              size="small"

            >
              {loading ? "Generando PDF..." : "Descargar PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      )}

      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default PDFDownloader;