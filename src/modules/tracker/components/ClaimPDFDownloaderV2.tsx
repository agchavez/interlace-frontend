import { useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import PictureAsPdfTwoToneIcon from "@mui/icons-material/PictureAsPdfTwoTone";
import Box from "@mui/material/Box";
import QRToBase64 from "../../claim/components/QRToBase64";
import Backdrop from "@mui/material/Backdrop";
import ClaimPDF from "./ClaimPDF";
import { Claim } from "../../../store/claim/claimApi";

interface ClaimPDFDownloaderProps {
  claim?: Claim;
}

// Componente para manejar la descarga del PDF bajo demanda
const ClaimPDFDownloader = ({ claim }: ClaimPDFDownloaderProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] =
    useState<string>("Preparando...");

  // Función para descargar el PDF
  const downloadPDF = (blob: Blob) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CLAIM-${claim?.id?.toString().padStart(5, "0")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

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
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.send();
      });
    } catch (error) {
      console.error("Error al convertir imagen a base64:", error);
      return null;
    }
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

      // 2. Generar PDF y mostrar progreso
      setProgressMessage("Generando PDF...");

      // Usar react-pdf/renderer para generar el PDF
      const { pdf } = await import("@react-pdf/renderer");

      // traer imagenes de la claim
      const promises: Promise<void>[] = [];
      const imagePhotosContainerClosed: string[] = [];
      const imagePhotosContainerOneOpen: string[] = [];
      const imagePhotosContainerTwoOpen: string[] = [];
      const imagePhotosContainerTop: string[] = [];
      const imagePhotosDuringUnload: string[] = [];
      const imagePhotosPalletDamage: string[] = [];
      const imagePhotosProductionBatch: string[] = [];
      const imagePhotosDamagedProductBase: string[] = [];
      const imagePhotosDamagedProductDents: string[] = [];
      const imagePhotosDamagedBoxes: string[] = [];
      const imagePhotosGroupedBadProduct: string[] = [];
      const imagePhotosRepalletized: string[] = [];

      if (
        claim?.photos_container_closed &&
        claim.photos_container_closed.length > 0
      ) {
        const imagePhotosContainerClosedPromises =
          claim.photos_container_closed.map((photo) =>
            convertImageToBase64(photo.access_url).then((base64) => {
              base64 && imagePhotosContainerClosed?.push(base64);
            })
          );
        promises.push(...imagePhotosContainerClosedPromises);
      }

      if (
        claim?.photos_container_one_open &&
        claim.photos_container_one_open.length > 0
      ) {
        const imagePhotosContainerOneOpenPromises =
          claim.photos_container_one_open.map((photo) =>
            convertImageToBase64(photo.access_url).then((base64) => {
              base64 && imagePhotosContainerOneOpen?.push(base64);
            })
          );
        promises.push(...imagePhotosContainerOneOpenPromises);
      }

      if (
        claim?.photos_container_two_open &&
        claim.photos_container_two_open.length > 0
      ) {
        const imagePhotosContainerTwoOpenPromises =
          claim.photos_container_two_open.map((photo) =>
            convertImageToBase64(photo.access_url).then((base64) => {
              base64 && imagePhotosContainerTwoOpen?.push(base64);
            })
          );
        promises.push(...imagePhotosContainerTwoOpenPromises);
      }

      if (
        claim?.photos_container_top &&
        claim.photos_container_top.length > 0
      ) {
        const imagePhotosContainerTopPromises = claim.photos_container_top.map(
          (photo) =>
            convertImageToBase64(photo.access_url).then((base64) => {
              base64 && imagePhotosContainerTop?.push(base64);
            })
        );
        promises.push(...imagePhotosContainerTopPromises);
      }

      if (
        claim?.photos_during_unload &&
        claim.photos_during_unload.length > 0
      ) {
        const imagePhotosDuringUnloadPromises = claim.photos_during_unload.map(
          (photo) =>
            convertImageToBase64(photo.access_url).then((base64) => {
              base64 && imagePhotosDuringUnload?.push(base64);
            })
        );
        promises.push(...imagePhotosDuringUnloadPromises);
      }

      if (
        claim?.photos_pallet_damage &&
        claim.photos_pallet_damage.length > 0
      ) {
        const imagePhotosPalletDamagePromises = claim.photos_pallet_damage.map(
          (photo) =>
            convertImageToBase64(photo.access_url).then((base64) => {
              base64 && imagePhotosPalletDamage?.push(base64);
            })
        );
        promises.push(...imagePhotosPalletDamagePromises);
      }

      if (
        claim?.photos_production_batch &&
        claim.photos_production_batch.length > 0
      ) {
        const imagePhotosProductionBatchPromises =
          claim.photos_production_batch.map((photo) =>
            convertImageToBase64(photo.access_url).then((base64) => {
              base64 && imagePhotosProductionBatch?.push(base64);
            })
          );
        promises.push(...imagePhotosProductionBatchPromises);
      }

      if (
        claim?.photos_damaged_product_base &&
        claim.photos_damaged_product_base.length > 0
      ) {
        const imagePhotosDamagedProductBasePromises =
          claim.photos_damaged_product_base.map((photo) =>
            convertImageToBase64(photo.access_url).then((base64) => {
              base64 && imagePhotosDamagedProductBase?.push(base64);
            })
          );
        promises.push(...imagePhotosDamagedProductBasePromises);
      }

      if (
        claim?.photos_damaged_product_dents &&
        claim.photos_damaged_product_dents.length > 0
      ) {
        const imagePhotosDamagedProductDentsPromises =
          claim.photos_damaged_product_dents.map((photo) =>
            convertImageToBase64(photo.access_url).then((base64) => {
              base64 && imagePhotosDamagedProductDents?.push(base64);
            })
          );
        promises.push(...imagePhotosDamagedProductDentsPromises);
      }

      if (
        claim?.photos_damaged_boxes &&
        claim.photos_damaged_boxes.length > 0
      ) {
        const imagePhotosDamagedBoxesPromises = claim.photos_damaged_boxes.map(
          (photo) =>
            convertImageToBase64(photo.access_url).then((base64) => {
              base64 && imagePhotosDamagedBoxes?.push(base64);
            })
        );
        promises.push(...imagePhotosDamagedBoxesPromises);
      }

      if (
        claim?.photos_grouped_bad_product &&
        claim.photos_grouped_bad_product.length > 0
      ) {
        const imagePhotosGroupedBadProductPromises =
          claim.photos_grouped_bad_product.map((photo) =>
            convertImageToBase64(photo.access_url).then((base64) => {
              base64 && imagePhotosGroupedBadProduct?.push(base64);
            })
          );
        promises.push(...imagePhotosGroupedBadProductPromises);
      }

      if (claim?.photos_repalletized && claim.photos_repalletized.length > 0) {
        const imagePhotosRepalletizedPromises = claim.photos_repalletized.map(
          (photo) =>
            convertImageToBase64(photo.access_url).then((base64) => {
              base64 && imagePhotosRepalletized?.push(base64);
            })
        );
        promises.push(...imagePhotosRepalletizedPromises);
      }

      // Esperar a que todas las promesas se resuelvan con timeout
      if (promises.length > 0) {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Tiempo de carga excedido")), 15000)
        );

        await Promise.race([Promise.all(promises), timeoutPromise]);
      }

      if (!claim || claim.id === undefined) {
        throw new Error("Claim o su ID es undefined");
      }

      const claimData: Claim = {
        ...claim,
        photos_container_closed:
          claim?.photos_container_closed?.map((photo, index) => {
            return { ...photo, access_url: imagePhotosContainerClosed[index] };
          }) || [],
        photos_container_one_open:
          claim?.photos_container_one_open?.map((photo, index) => {
            return { ...photo, access_url: imagePhotosContainerOneOpen[index] };
          }) || [],
        photos_container_two_open:
          claim?.photos_container_two_open?.map((photo, index) => {
            return { ...photo, access_url: imagePhotosContainerTwoOpen[index] };
          }) || [],
        photos_container_top:
          claim?.photos_container_top?.map((photo, index) => {
            return { ...photo, access_url: imagePhotosContainerTop[index] };
          }) || [],
        photos_during_unload:
          claim?.photos_during_unload?.map((photo, index) => {
            return { ...photo, access_url: imagePhotosDuringUnload[index] };
          }) || [],
        photos_pallet_damage:
          claim?.photos_pallet_damage?.map((photo, index) => {
            return { ...photo, access_url: imagePhotosPalletDamage[index] };
          }) || [],
        photos_production_batch:
          claim?.photos_production_batch?.map((photo, index) => {
            return { ...photo, access_url: imagePhotosProductionBatch[index] };
          }) || [],
        photos_damaged_product_base:
          claim?.photos_damaged_product_base?.map((photo, index) => {
            return {
              ...photo,
              access_url: imagePhotosDamagedProductBase[index],
            };
          }) || [],
        photos_damaged_product_dents:
          claim?.photos_damaged_product_dents?.map((photo, index) => {
            return {
              ...photo,
              access_url: imagePhotosDamagedProductDents[index],
            };
          }) || [],
        photos_damaged_boxes:
          claim?.photos_damaged_boxes?.map((photo, index) => {
            return { ...photo, access_url: imagePhotosDamagedBoxes[index] };
          }) || [],
        photos_grouped_bad_product:
          claim?.photos_grouped_bad_product?.map((photo, index) => {
            return {
              ...photo,
              access_url: imagePhotosGroupedBadProduct[index],
            };
          }) || [],
        photos_repalletized:
          claim?.photos_repalletized?.map((photo, index) => {
            return { ...photo, access_url: imagePhotosRepalletized[index] };
          }) || [],
      };

      const blob = await pdf(
        <ClaimPDF
          claim={claimData}
          imageUrl="/logo.png"
          qrDataUrl={qrDataUrl}
        />
      ).toBlob();

      // 3. Descargar el PDF generado
      setProgressMessage("Descargando PDF...");

      // Pequeña pausa para mostrar el mensaje de descarga
      await new Promise((resolve) => setTimeout(resolve, 500));

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
      <Box sx={{ display: "none" }}>
        <QRToBase64
          value={`${import.meta.env.VITE_JS_FRONTEND_URL}/tracker/detail/${
            claim?.id
          }`}
          logoSrc="/logo-qr.png"
          onReady={(dataUrl) => setQrDataUrl(dataUrl)}
        />
      </Box>

      {/* Botón visible para el usuario que inicia todo el proceso */}
      <Button
        startIcon={<PictureAsPdfTwoToneIcon />}
        variant="contained"
        color="error"
        onClick={handleGeneratePDF}
        disabled={isProcessing || !qrDataUrl}
        size="small"
        sx={{
          borderRadius: "5px",
          textTransform: "none",
          minWidth: "140px",
        }}
      >
        Descargar PDF
      </Button>

      {/* Backdrop para mostrar el progreso con diseño mejorado y colores más suaves */}
      <Backdrop
        sx={{
          color: "#00f",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: "blur(3px)",
          borderRadius: 2,
          backgroundColor: "rgba(54, 32, 28, 0.15)", // color-sidebar-primary con opacidad
        }}
        open={isProcessing}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            maxWidth: 260,
            textAlign: "center",
            p: 2.5,
            borderRadius: 2,
            background:
              "linear-gradient(145deg, rgba(231, 69, 15, 0.15) 0%, rgba(17, 14, 13, 0.75) 100%)",
            boxShadow: "0 8px 16px rgba(17, 14, 13, 0.3)",
            border: "1px solid rgba(231, 40, 15, 0.2)",
          }}
        >
          <Box
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 1,
            }}
          >
            <CircularProgress
              size={46}
              thickness={3}
              sx={{
                color: "#e72f0fff", // color-primary
                opacity: 0.9,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PictureAsPdfTwoToneIcon sx={{ fontSize: 20, color: "#000" }} />
            </Box>
          </Box>

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 500,
              letterSpacing: 0.3,
              fontSize: "1rem",
              color: "#000000ff", // color-primary
            }}
          >
            {progressMessage}
          </Typography>

          <Box
            sx={{
              width: "75%",
              mt: 0.5,
              position: "relative",
              height: 2,
              backgroundColor: "rgba(148, 156, 166, 0.3)", // text-sidebar-primary con opacidad
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                background:
                  "linear-gradient(90deg, rgba(242, 108, 55, 0.5) 0%, rgba(231, 55, 15, 0.9) 50%, rgba(236, 100, 32, 0.62) 100%)",
                animation: "progressAnimation 1.5s infinite ease-in-out",
                width: "30%",
                borderRadius: 1,
                "@keyframes progressAnimation": {
                  "0%": {
                    left: "-30%",
                  },
                  "100%": {
                    left: "100%",
                  },
                },
              }}
            />
          </Box>

          <Typography
            variant="caption"
            sx={{
              opacity: 0.9,
              mt: 0.5,
              fontSize: "0.675rem",
              color: "#000000ff", // text-sidebar-primary
            }}
          >
            No cierre esta ventana
          </Typography>
        </Box>
      </Backdrop>

      {error && (
        <Typography
          variant="caption"
          color="error"
          sx={{ display: "block", mt: 1 }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default ClaimPDFDownloader;
