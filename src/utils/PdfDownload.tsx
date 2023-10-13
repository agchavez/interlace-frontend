import ReactPDF, { PDFDownloadLink } from "@react-pdf/renderer";

interface PdfDownload {
  document: JSX.Element;
  clickable:
    | React.ReactNode
    | ((params: ReactPDF.BlobProviderParams) => React.ReactNode);
}

function PdfDownload({ document, clickable }: PdfDownload) {
  return (
    <PDFDownloadLink document={document} fileName="mi-pdf-react.pdf">
      {clickable}
    </PDFDownloadLink>
  );
}

export default PdfDownload;
