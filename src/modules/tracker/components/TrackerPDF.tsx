import { Document, Page, View, StyleSheet, Image } from "@react-pdf/renderer";
import PDFText from "../../ui/components/pdfDocs/PDFText";
import { Seguimiento } from "../../../store/seguimiento/seguimientoSlice";
import PDFTable from "../../ui/components/pdfDocs/Table";
import { formatDistance } from "date-fns";
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
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "white",
    padding: "0.5cm",
  },
  section: { paddingVertical: 11 },
  title: {
    textAlign: "center",
    fontSize: 20,
  },
});

interface TrakerPDFDocumentProps {
  seguimiento: Seguimiento;
  outputTypeData?: OutputType;
  driver?: Driver;
  op1?: Operator;
  op2?: Operator;
  outputLocation?: LocationType;
}

function TrakerPDFDocument({
  seguimiento,
  outputTypeData,
  driver,
  op1,
  op2,
  outputLocation,
}: TrakerPDFDocumentProps) {
  const entradaTableData = seguimiento.detalles
    .map((det) => {
      const rows =
        det.history?.map((h) => [
          det.sap_code,
          det.name,
          h.pallets,
          h.date && format(new Date(h.date), "yyyy-MM-dd"),
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

  return (
    <Document
      title="Datos Tracker"
      language="es"
      style={{ fontFamily: "Helvetica" }}
    >
      <Page size="LETTER" style={styles.page}>
        <View style={{ ...styles.section }}>
          <Image src="/logo.png" style={{ width: 200 }} />
        </View>
        <View style={{ ...styles.section, backgroundColor: "#1c2536" }}>
          <PDFTitle style={{ color: "white", fontSize: 30 }}>
            TRK-{seguimiento.id?.toString().padStart(5, "0")}
          </PDFTitle>
        </View>
        <View style={{ display: "flex", flexDirection: "row" }}>
          <View style={{ ...styles.section, flex: 1 }}>
            <PDFSubTitle>Datos principales:</PDFSubTitle>
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
            <PDFSubTitle>Datos generales:</PDFSubTitle>
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
                <PDFText>N° de Traslado 5001:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>{seguimiento.transferNumber}</PDFText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <PDFSubTitle>Entrada de producto:</PDFSubTitle>
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
                <PDFSubTitle>Datos del Operador:</PDFSubTitle>
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
                <PDFSubTitle>Salida de producto:</PDFSubTitle>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ minWidth: 120 }}>
                    <PDFText>N° de Doc. Salida:</PDFText>
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
              <PDFSubTitle>Salida de producto:</PDFSubTitle>
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
    </Document>
  );
}

export default TrakerPDFDocument;
