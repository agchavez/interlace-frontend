import { Document, Page, View, StyleSheet, Image } from "@react-pdf/renderer";
import PDFText from "../../ui/components/pdfDocs/PDFText";

import { format } from "date-fns-tz";

import PDFTitle from "../../ui/components/pdfDocs/PDFTitle";
import PDFSubTitle from "../../ui/components/pdfDocs/PDFSubTitle";
import { Claim } from "../../../store/claim/claimApi";
import PDFTable from "../../ui/components/pdfDocs/Table";
import { useEffect, useMemo, useState } from "react";

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
    backgroundColor: "gray",
    height: 1,
    width: "100%", // Adjust the width according to your layout
    marginBottom: 10,
  },
  subTitle: {
    marginBottom: 5,
  },
});

interface TrakerPDFDocumentProps {
  claim?: Claim;
  imageUrl?: string;
  qrDataUrl?: string;
}

function ClaimPDF({
  claim,
  imageUrl = "https://flagcdn.com/h240/hn.png",
  qrDataUrl,
}: TrakerPDFDocumentProps) {
  const inputRowCellStyles = [
    { flex: 1 },
    { flex: 2 },
    { flex: 1 },
    { flex: 1 },
  ];

  const claimTableData = useMemo(() => claim?.claim_products.map((product) => {
    const row = [product.sap_code, product.product_name, product.quantity, product.batch, new Date(product.created_at).toLocaleDateString()];
    return row;
  }), [claim?.claim_products]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setImageBase64] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImage() {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImageBase64(reader.result);
        }
      };
    }

    if (imageUrl) {
      fetchImage();
    }
  }, [imageUrl]);

  const flagurl = useMemo(() => {
    const country_code = claim?.tracking?.distributor_center_data?.country_code.toLowerCase();
    return `https://flagcdn.com/h240/${country_code}.png`;
  }, [claim?.tracking?.distributor_center_data?.country_code]);

  const islocal = claim?.type === "ALERT_QUALITY";

  const seguimiento = claim?.tracking;

  return (
    <Document
      title={islocal ? "Datos Alerta de Calidad" : "Datos CLAIM"}
      language="es"
      style={{ fontFamily: "Helvetica" }}
      author="AC Solutions"
      creator="Tracker"
      keywords="Tracker, PDF, Seguimiento, Claim, Alerta de Calidad"
    >
      <Page size="LETTER" style={styles.page}>
        <View
          style={{ ...styles.section, display: "flex", flexDirection: "row" }}
        >
          <View style={{ flex: 1 }}>
                      </View>
          <View style={{ flex: islocal? 1: 0.5, textAlign: "right", color: "red" }}>
            <PDFTitle style={{ fontSize: islocal? 20: 30, textAlign: "right" }}>
              {
                islocal ? "Alerta de Calidad" : "CLAIM"
              }
            </PDFTitle>
            <PDFText>Evidencia Fotográfica</PDFText>
          </View>
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
              TRK-{claim?.tracking?.id?.toString().padStart(5, "0")}
            </PDFTitle>
          </View>
          {qrDataUrl && (
            <View style={{ marginLeft: 10, marginRight: 10, borderRadius: 7 }}>
              <Image src={qrDataUrl} style={{ width: 50, borderRadius: 7 }} />
            </View>
          )}
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
                  {seguimiento?.created_at && format(new Date(seguimiento?.created_at), "dd/MM/yyyy")}
                </PDFText>
              </View>

            </View>
            <View style={{ flexDirection: "row", paddingRight: 10 }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Centro distribución:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>
                  {seguimiento?.distributor_center_data?.name}
                </PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Número de Rastra:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>{seguimiento?.tariler_data?.code}</PDFText>
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
                <PDFText>{seguimiento?.transporter_data?.name}</PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Tractor:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>{seguimiento?.transporter_data.tractor}</PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Cabezal:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>{seguimiento?.transporter_data?.code}</PDFText>
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
                <PDFText>{seguimiento?.plate_number}</PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 125 }}>
                <PDFText>Localidad de origen:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>
                  {claim?.origin_location_data?.name}-
                  {claim?.origin_location_data?.code}
                </PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 125 }}>
                <PDFText>Conductor:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>
                  {seguimiento?.type === "LOCAL"
                    ? `${claim?.driver_data?.first_name}`
                    : `${seguimiento?.driver_import}`}
                </PDFText>
              </View>
            </View>

            {seguimiento?.type === "IMPORT" && (
              <View style={{ flexDirection: "row" }}>
                <View style={{ minWidth: 125 }}>
                  <PDFText>No. Contenedor:</PDFText>
                </View>
                <View style={{ flex: 1 }}>
                  <PDFText>{seguimiento?.container_number}</PDFText>
                </View>
              </View>
            )}
            {seguimiento?.type === "LOCAL" ? (
              <View style={{ flexDirection: "row" }}>
                <View style={{ minWidth: 125 }}>
                  <PDFText>Transferencia de entrada:</PDFText>
                </View>
                <View style={{ flex: 1 }}>
                  <PDFText>{seguimiento.input_document_number}</PDFText>
                </View>
              </View>
            ) : (
              <View style={{ flexDirection: "row" }}>
                <View style={{ minWidth: 125 }}>
                  <PDFText>No. Factura:</PDFText>
                </View>
                <View style={{ flex: 1 }}>
                  <PDFText>{seguimiento?.invoice_number}</PDFText>
                </View>
              </View>
            )}
            <View style={{ flexDirection: "row" }}>
              <View style={{ minWidth: 125 }}>
                <PDFText>N° de Traslado 5001:</PDFText>
              </View>
              <View style={{ flex: 1 }}>
                <PDFText>{seguimiento?.transfer_number}</PDFText>
              </View>
            </View>
          </View>
        </View>
        {
          claim?.status === "RECHAZADO" && (
            <View style={styles.section}>
              <PDFSubTitle style={{ ...styles.subTitle }}>
                Motivo de Rechazo:
              </PDFSubTitle>
              <View style={{ flex: 1 }}>
                <PDFText>{claim?.reject_reason || "--"}</PDFText>
              </View>
            </View>
          )
        }
        <View style={styles.section}>
          <PDFSubTitle style={{ ...styles.subTitle }}>
            Observaciones:
          </PDFSubTitle>
          <View style={{ flex: 1 }}>
            <PDFText>{claim?.observations || "--"}</PDFText>
          </View>
        </View>
        <View style={styles.section}></View>
        <View style={styles.section}>
          <PDFSubTitle style={{ ...styles.subTitle }}>
            Productos Afectados:
          </PDFSubTitle>
          <PDFTable
            data={claimTableData || []}
            header={[
              "N° Sap",
              "Producto",
              "Cajas Afectadas",
              "Lote",
              "Fecha Expiración",
            ]}
            headerCellsStyle={inputRowCellStyles}
            rowCellsStyle={inputRowCellStyles}
          />
        </View>
      </Page>
      {/* Imagenes del claim */}
      {/* Contenedor cerrado */}
      {(claim?.photos_container_closed.length || 0) > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.section}>
            <PDFSubTitle style={{ ...styles.subTitle }}>
              {
                islocal?"Imágenes de la Alerta de Calidad":"Imagenes del Claim"
              }
            </PDFSubTitle>
            <View style={{ ...styles.divider }} />
            <View style={{ flexDirection: "row", paddingBottom: 10 }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>{islocal ? "Rastra con Puerta/Lona Cerrada" : "Contenedor Cerrado"}</PDFText>
              </View>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {claim?.photos_container_closed.map((photo) => (
                <View key={photo.id} style={{ height: "300px", width: "100%", marginBottom: 10 }}>
                  <Image
                    src={photo.access_url}
                    style={{ height: "300px", marginHorizontal: "auto" }}
                  />
                </View>
              ))}
            </View>
          </View>
        </Page>
      )}
      {/* Contenedor con 1 puerta */}
      {(claim?.photos_container_one_open.length || 0) > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.section}>
            <PDFSubTitle style={{ ...styles.subTitle }}>
              {islocal?"Imágenes de la Alerta de Calidad":"Imagenes del Claim"}
            </PDFSubTitle>
            <View style={{ ...styles.divider }} />
            <View style={{ flexDirection: "row", paddingBottom: 10 }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>{islocal ? "Rastra Con 1 Puerta/Lona Abierta" : "Contenedor Con 1 Puerta Abierta"}</PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {claim?.photos_container_one_open.map((photo) => (
                <View key={photo.id} style={{ height: "300px", width: "100%", marginBottom: 10 }}>
                  <Image
                    src={photo.access_url}
                    style={{ height: "300px", marginHorizontal: "auto" }}
                  />
                </View>
              ))}
            </View>
          </View>
        </Page>
      )}

      {/* Contenedor con 2 puertas */}
      {(claim?.photos_container_two_open.length || 0) > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.section}>
            <PDFSubTitle style={{ ...styles.subTitle }}>
              {islocal?"Imágenes de la Alerta de Calidad":"Imagenes del Claim"}
            </PDFSubTitle>
            <View style={{ ...styles.divider }} />
            <View style={{ flexDirection: "row", paddingBottom: 10 }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>{islocal ? "Rastra Con 2 Puertas Abiertas" : "Contenedor con 2 puertas abiertas"}</PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {claim?.photos_container_two_open.map((photo) => (
                <View key={photo.id} style={{ height: "300px", width: "100%", marginBottom: 10 }}>
                  <Image
                    src={photo.access_url}
                    style={{ height: "300px", marginHorizontal: "auto" }}
                  />
                </View>
              ))}
            </View>
          </View>
        </Page>
      )}

      {/* Contenedor superior */}
      {(claim?.photos_container_top.length || 0) > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.section}>
            <PDFSubTitle style={{ ...styles.subTitle }}>
              {islocal?"Imágenes de la Alerta de Calidad":"Imagenes del Claim"}
            </PDFSubTitle>
            <View style={{ ...styles.divider }} />
            <View style={{ flexDirection: "row", paddingBottom: 10 }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>{islocal ? "Vista Superior del Contenido de la Rastra" : "Vista Superior del contenido del contenedor"}</PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {claim?.photos_container_top.map((photo) => (
                <View key={photo.id} style={{ height: "300px", width: "100%", marginBottom: 10 }}>
                  <Image
                    src={photo.access_url}
                    style={{ height: "300px", marginHorizontal: "auto" }}
                  />
                </View>
              ))}
            </View>
          </View>
        </Page>
      )}

      {/* Durante descarga */}
      {(claim?.photos_during_unload.length || 0) > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.section}>
            <PDFSubTitle style={{ ...styles.subTitle }}>
              {islocal?"Imágenes de la Alerta de Calidad":"Imagenes del Claim"}
            </PDFSubTitle>
            <View style={{ ...styles.divider }} />
            <View style={{ flexDirection: "row", paddingBottom: 10 }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Fotografía durante la descarga:</PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {claim?.photos_during_unload.map((photo) => (
                <View key={photo.id} style={{ height: "300px", width: "100%", marginBottom: 10 }}>
                  <Image
                    src={photo.access_url}
                    style={{ height: "300px", marginHorizontal: "auto" }}
                  />
                </View>
              ))}
            </View>
          </View>
        </Page>
      )}
      {/* Pallets */}
      {(claim?.photos_pallet_damage.length || 0) > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.section}>
            <PDFSubTitle style={{ ...styles.subTitle }}>
              {islocal?"Imágenes de la Alerta de Calidad":"Imagenes del Claim"}
            </PDFSubTitle>
            <View style={{ ...styles.divider }} />
            <View style={{ flexDirection: "row", paddingBottom: 10 }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Fisuras/abolladuras de pallets:</PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {claim?.photos_pallet_damage.map((photo) => (
                <View key={photo.id} style={{ height: "300px", width: "100%", marginBottom: 10 }}>
                  <Image
                    src={photo.access_url}
                    style={{ height: "300px", marginHorizontal: "auto" }}
                  />
                </View>
              ))}
            </View>
          </View>
        </Page>
      )}
      {/* Production batch */}
      {(claim?.photos_production_batch.length || 0) > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.section}>
            <PDFSubTitle style={{ ...styles.subTitle }}>
              {"Imágenes de lote de producción"}
            </PDFSubTitle>
            <View style={{ ...styles.divider }} />
            <View style={{ flexDirection: "row", paddingBottom: 10 }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Lote de Producción:</PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {claim?.photos_production_batch.map((photo) => (
                <View key={photo.id} style={{ height: "300px", width: "100%", marginBottom: 10 }}>
                  <Image
                    src={photo.access_url}
                    style={{ height: "300px", marginHorizontal: "auto" }}
                  />
                </View>
              ))}
            </View>
          </View>
        </Page>
      )}
      {/* Daños por Calidad y Transporte */}
      {/* Base de la lata/botella (fecha de vencimiento y lote) */}
      {(claim?.photos_damaged_product_base.length || 0) > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.section}>
            <PDFSubTitle style={{ ...styles.subTitle }}>
              {islocal?"Imágenes de la Alerta de Calidad":"Imagenes del Claim"}
            </PDFSubTitle>
            <PDFSubTitle style={{ ...styles.subTitle }}>
              Producto Dañado
            </PDFSubTitle>
            <View style={{ ...styles.divider }} />
            <View style={{ flexDirection: "row", paddingBottom: 10 }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>
                  Base de la lata/botella (fecha de vencimiento y lote):
                </PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {claim?.photos_damaged_product_base.map((photo) => (
                <View key={photo.id} style={{ height: "300px", width: "100%", marginBottom: 10 }}>
                  <Image
                    src={photo.access_url}
                    style={{ height: "300px", marginHorizontal: "auto" }}
                  />
                </View>
              ))}
            </View>
          </View>
        </Page>
      )}
      {/* Abolladuras (mínimo 3 diferentes) */}
      {(claim?.photos_damaged_product_dents.length || 0) > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.section}>
            <PDFSubTitle style={{ ...styles.subTitle }}>
              {islocal?"Imágenes de la Alerta de Calidad":"Imagenes del Claim"}
            </PDFSubTitle>
            <PDFSubTitle style={{ ...styles.subTitle }}>
              Producto Dañado
            </PDFSubTitle>
            <View style={{ ...styles.divider }} />
            <View style={{ flexDirection: "row", paddingBottom: 10 }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Abolladuras (mínimo 3 diferentes):</PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {claim?.photos_damaged_product_dents.map((photo) => (
                <View key={photo.id} style={{ height: "300px", width: "100%", marginBottom: 10 }}>
                  <Image
                    src={photo.access_url}
                    style={{ height: "300px", marginHorizontal: "auto" }}
                  />
                </View>
              ))}
            </View>
          </View>
        </Page>
      )}
      {/* Cajas dañadas por golpes o problemas de calidad */}
      {(claim?.photos_damaged_boxes.length || 0) > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.section}>
            <PDFSubTitle style={{ ...styles.subTitle }}>
              {islocal?"Imágenes de la Alerta de Calidad":"Imagenes del Claim"}
            </PDFSubTitle>
            <PDFSubTitle style={{ ...styles.subTitle }}>
              Producto Dañado
            </PDFSubTitle>
            <View style={{ ...styles.divider }} />
            <View style={{ flexDirection: "row", paddingBottom: 10 }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>
                  Cajas dañadas por golpes o problemas de calidad:
                </PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {claim?.photos_damaged_boxes.map((photo) => (
                <View key={photo.id} style={{ height: "300px", width: "100%", marginBottom: 10 }}>
                  <Image
                    src={photo.access_url}
                    style={{ height: "300px", marginHorizontal: "auto" }}
                  />
                </View>
              ))}
            </View>
          </View>
        </Page>
      )}
      {/* Producto en mal estado agrupado en 1 pallet */}
      {(claim?.photos_grouped_bad_product.length || 0) > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.section}>
            <PDFSubTitle style={{ ...styles.subTitle }}>
              {islocal?"Imágenes de la Alerta de Calidad":"Imagenes del Claim"}
            </PDFSubTitle>
            <PDFSubTitle style={{ ...styles.subTitle }}>
              Producto Dañado
            </PDFSubTitle>
            <View style={{ ...styles.divider }} />
            <View style={{ flexDirection: "row", paddingBottom: 10 }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>Producto en mal estado agrupado en 1 pallet:</PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {claim?.photos_grouped_bad_product.map((photo) => (
                <View key={photo.id} style={{ height: "300px", width: "100%", marginBottom: 10 }}>
                  <Image
                    src={photo.access_url}
                    style={{ height: "300px", marginHorizontal: "auto" }}
                  />
                </View>
              ))}
            </View>
          </View>
        </Page>
      )}
      {/* Repaletizado por identificación de producto dañado */}
      {(claim?.photos_repalletized.length || 0) > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.section}>
            <PDFSubTitle style={{ ...styles.subTitle }}>
              {islocal?"Imágenes de la Alerta de Calidad":"Imagenes del Claim"}
            </PDFSubTitle>
            <PDFSubTitle style={{ ...styles.subTitle }}>
              Producto Dañado
            </PDFSubTitle>
            <View style={{ ...styles.divider }} />
            <View style={{ flexDirection: "row", paddingBottom: 10 }}>
              <View style={{ minWidth: 100 }}>
                <PDFText>
                  Repaletizado por identificación de producto dañado:
                </PDFText>
              </View>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {claim?.photos_repalletized.map((photo) => (
                <View key={photo.id} style={{ height: "300px", width: "100%", marginBottom: 10 }}>
                  <Image
                    src={photo.access_url}
                    style={{ height: "300px", marginHorizontal: "auto" }}
                  />
                </View>
              ))}
            </View>
          </View>
        </Page>
      )}
    </Document>
  );
}

export default ClaimPDF;
