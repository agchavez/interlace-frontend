import { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
interface QRCodeScannerProps {
  id: string;
  onRead?: (text: string) => unknown;
}
const QRCodeScanner = ({ id, onRead: cb }: QRCodeScannerProps) => {
  useEffect(() => {
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    let html5QrcodeScanner = new Html5Qrcode(id);
    async function onScanSuccess(decodedText: string) {
      await html5QrcodeScanner.stop();
      cb && cb(decodedText);
    }
    html5QrcodeScanner.start(
      { facingMode: "environment" },
      config,
      onScanSuccess,
      undefined
    );
    return () => {
      if (html5QrcodeScanner.isScanning) html5QrcodeScanner.stop();
    };
  }, []);
  return <div id={id}></div>;
};

export default QRCodeScanner;
