import { Document, Page, View, StyleSheet, Image } from "@react-pdf/renderer";
import PDFText from "../../ui/components/pdfDocs/PDFText";

import { format } from "date-fns-tz";

import PDFTitle from "../../ui/components/pdfDocs/PDFTitle";
import PDFSubTitle from "../../ui/components/pdfDocs/PDFSubTitle";
import { Claim } from "../../../store/claim/claimApi";

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
  divider: {
    backgroundColor: 'gray',
    height: 1,
    width: '100%', // Adjust the width according to your layout
    marginBottom: 10,
  },
  subTitle: {
    marginBottom: 5,
  }
});

interface TrakerPDFDocumentProps {
  claim?: Claim;
}

function ClaimPDF({
  claim: seguimiento,
}: TrakerPDFDocumentProps) {
  const inputRowCellStyles = [
    { flex: 1 },
    { flex: 2 },
    { flex: 1 },
    { flex: 1 },
  ];

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
        <View style={{ ...styles.section }}>
          <Image src="/logo.png" style={{ width: 200 }} />
        </View>
        <View style={{ ...styles.divider }} />
        <View style={{ ...styles.section, backgroundColor: "#1c2536" }}>
          <PDFTitle style={{ color: "white", fontSize: 30 }}>
            CLAIM-{seguimiento?.id?.toString().padStart(5, "0")}
          </PDFTitle>
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
                  {seguimiento?format(new Date(seguimiento?.created_at), "dd/MM/yyyy"):""}
                </PDFText>
              </View>

            </View>
            <View style={{ flexDirection: "row", paddingRight: 10 }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Centro distribución:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>
                  {/* {seguimiento?.distributorCenterName} */}
                </PDFText>
              </View>

            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Número de Rastra:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                {/* <PDFText>{seguimiento?.rastra.code}</PDFText> */}
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Tipo:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>
                  {/* {seguimiento?.type === "IMPORT" ? "Importación" : "Local"} */}
                </PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Transportista:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                {/* <PDFText>{seguimiento?.transporter.name}</PDFText> */}
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Tractor:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                {/* <PDFText>{seguimiento?.transporter.tractor}</PDFText> */}
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Cabezal:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                {/* <PDFText>{seguimiento?.transporter.code}</PDFText> */}
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
                {/* <PDFText>{seguimiento.plateNumber}</PDFText> */}
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 125 }}>
                <PDFText>Localidad de origen:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>
                  {/* {seguimiento.originLocationData?.name}- */}
                  {/* {seguimiento.originLocationData?.code} */}
                </PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 125 }}>
                <PDFText>Conductor:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>
                  {/* {seguimiento.type === "LOCAL"
                    ? `${driver?.first_name}`
                    : `${seguimiento.driverImport}`} */}
                </PDFText>
              </View>
            </View>

            {/* {seguimiento.type === "IMPORT" && (
              <View style={{ flexDirection: "row" }}>
                <View style={{ minWidth: 125 }}>
                  <PDFText>No. Contenedor:</PDFText>
                </View>
                <View style={{ flex: 1 }}>
                  <PDFText>{seguimiento.containernumber}</PDFText>
                </View>
              </View>
            )} */}
            {/* {seguimiento.type === "LOCAL" ? (
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
            )} */}
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 125 }}>
                <PDFText>N° de Traslado 5001:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                {/* <PDFText>{seguimiento.transferNumber}</PDFText> */}
              </View>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <PDFSubTitle style={{ ...styles.subTitle }}>Observaciones:</PDFSubTitle>
          <View style={{ flex: 1 }}>
            {/* <PDFText>{seguimiento.observation || "--"}</PDFText> */}
          </View>
        </View>
        <View style={styles.section}></View>
        <View style={styles.section}>
          <PDFSubTitle style={{ ...styles.subTitle }}>Entrada de producto:</PDFSubTitle>
          {/* <PDFTable
            data={entradaTableData}
            header={["N° Sap", "Producto", "Pallets", "Fecha Expiración"]}
            headerCellsStyle={inputRowCellStyles}
            rowCellsStyle={inputRowCellStyles}
          /> */}
        </View>
        { (
          <>
            <View style={{ display: "flex", flexDirection: "row" }}>
              <View style={{ ...styles.section, flex: 1 }}>
                <PDFSubTitle style={{ ...styles.subTitle }}>Datos del Operador:</PDFSubTitle>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ minWidth: 100 }}>
                    <PDFText>Tiempo de entrada:</PDFText>
                  </View>
                  <View style={{ flex: 1 }}>
                    {/* <PDFText>
                      {(tiempoEntrada &&
                        tiempoEntrada !== null &&
                        format(tiempoEntrada, "HH:mm:ss", {
                          locale: es,
                          timeZone: "America/Tegucigalpa",
                        })) ||
                        "00:00:00"}
                    </PDFText> */}
                  </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ minWidth: 100 }}>
                    <PDFText>Tiempo de salida:</PDFText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <PDFText>
                      {/* {(tiempoSalida &&
                        tiempoSalida !== null &&
                        format(tiempoSalida, "HH:mm:ss")) ||
                        "00:00:00"} */}
                    </PDFText>
                  </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ minWidth: 100 }}>
                    <PDFText>Tiempo invertido:</PDFText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <PDFText>
                      {/* {tiempoSalida && tiempoEntrada && tiempoEntrada !== null
                        ? formatDistance(tiempoEntrada, tiempoSalida, {
                          locale: es,
                        })
                        : "--:--:--"} */}
                    </PDFText>
                  </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ minWidth: 100 }}>
                    <PDFText>Operador 1:</PDFText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <PDFText>
                      {/* {op1?.first_name} {op1?.last_name} */}
                    </PDFText>
                  </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ minWidth: 100 }}>
                    <PDFText>Operador 2:</PDFText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <PDFText>
                      {/* {op2?.first_name} {op2?.last_name} */}
                    </PDFText>
                  </View>
                </View>
              </View>

              <View style={{ ...styles.section, flex: 1 }}>
                <PDFSubTitle style={{ ...styles.subTitle }}>Salida de producto:</PDFSubTitle>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ minWidth: 120 }}>
                    <PDFText>N° de Doc. Salida:</PDFText>
                  </View>
                  <View style={{ flex: 1 }}>
                    {/* <PDFText>{seguimiento.documentNumberExit}</PDFText> */}
                  </View>
                </View>

                <View style={{ flexDirection: "row" }}>
                  <View style={{ minWidth: 120 }}>
                    <PDFText>Contabilizado: </PDFText>
                  </View>
                  <View style={{ flex: 1 }}>
                    {/* <PDFText>{seguimiento.accounted}</PDFText> */}
                  </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ minWidth: 120 }}>
                    <PDFText>Localidad de Envío:</PDFText>
                  </View>
                  <View style={{ flex: 1 }}>
                    {/* <PDFText>{outputLocation?.name}</PDFText> */}
                  </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ minWidth: 120 }}>
                    <PDFText>Unidad cargada con:</PDFText>
                  </View>
                  <View style={{ flex: 1 }}>
                    {/* <PDFText>{outputTypeData?.name}</PDFText> */}
                  </View>
                </View>
              </View>
            </View>

            {/* {outputTypeData && (
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
            )} */}


          </>
        )}
      </Page>
    </Document>
  );
}

export default ClaimPDF;
