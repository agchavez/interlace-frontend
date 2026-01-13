import { useEffect } from 'react';
import QRCode from 'qrcode';

interface QRWithEmbeddedLogoProps {
  value: string;
  logoSrc?: string;
  size?: number;
  onReady: (dataUrl: string) => void;
}

const QRWithEmbeddedLogo: React.FC<QRWithEmbeddedLogoProps> = ({ value, logoSrc, size = 256, onReady }) => {

  useEffect(() => {
    const generateQR = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      await QRCode.toCanvas(canvas, value, { width: size, errorCorrectionLevel: 'Q', margin: 2 });

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Si hay logo, dibujarlo
      if (logoSrc) {
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        logo.src = logoSrc;

        logo.onload = () => {
          const logoSize = size * 0.20;
          const x = (size - logoSize) / 2;
          const y = (size - logoSize) / 2;

          const padding = 8;
          ctx.fillStyle = 'white';
          ctx.fillRect(x - padding / 2, y - padding / 2, logoSize + padding, logoSize + padding);

          ctx.drawImage(logo, x, y, logoSize, logoSize);

          const dataUrl = canvas.toDataURL('image/png');
          onReady(dataUrl);
        };
      } else {
        // Sin logo, devolver el QR directamente
        const dataUrl = canvas.toDataURL('image/png');
        onReady(dataUrl);
      }
    };

    generateQR();
  }, [value, logoSrc, size, onReady]);

  return null;
};

export default QRWithEmbeddedLogo;
