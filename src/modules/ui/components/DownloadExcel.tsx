import * as XLSX from "xlsx";
import { useGetDistributorCentersQuery } from "../../../store/maintenance/maintenanceApi";
import { CircularProgress } from "@mui/material";
import DownloadIcon from "@mui/icons-material/DownloadtwoTone";
import { Button } from "@mui/material";
import { Cloud, CloudDownloadTwoTone } from "@mui/icons-material";

const ExcelDownloader = () => {
  const { data, isLoading, isFetching } = useGetDistributorCentersQuery({
    limit: 1000,
    offset: 0,
    search: "",
  });
  const handleDownload = () => {
    // === HOJA 1 ===
    const cabeceraHoja1 = [
      ["producto", "centro_distribucion", "fecha_inicial", "label"],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(cabeceraHoja1);

    // Aplicar formato de texto a columna C (fecha_inicial)
    const maxRows = 1000;
    for (let row = 2; row <= maxRows; row++) {
        const cellRef = `C${row}`;
        worksheet[cellRef] = {
            t: 's',
            v: "'",
            z: '@',
        };
    }

    // === INSTRUCCIONES ===
    const instrucciones = [
      ["Instrucciones"],
      ["1. El archivo debe tener el formato de Excel (.xlsx)"],
      ["2. La Hoja 1 debe tener las columnas: producto, centro_distribucion, fecha_inicial, label"],
      ["3. producto: Código sap del producto"],
      ["4. centro_distribucion: Id del centro de distribución debe ser un número entero (ver la hoja Centros de Distribución)"],
      ["5. fecha_inicial: Fecha de inicio del período"],
      ["6. label: Tipo de período (A, B, C) en mayúsculas"],
    ];
    const worksheetInstrucciones = XLSX.utils.aoa_to_sheet(instrucciones);

    // === CENTROS DE DISTRIBUCIÓN ===
    const centro_distribucion = (data?.results || [])
      .map((dc) => ({ id: dc.id, nombre: dc.name }))
      .sort((a, b) => a.id - b.id);

    const worksheetCentros = XLSX.utils.json_to_sheet(centro_distribucion);

    // === LIBRO DE TRABAJO ===
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hoja 1", true);
    XLSX.utils.book_append_sheet(
      workbook,
      worksheetInstrucciones,
      "Instrucciones"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      worksheetCentros,
      "Centros de Distribución"
    );

    // === GENERAR Y DESCARGAR ===
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_periodos.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      type="submit"
      variant="text"
      color="primary"
      disabled={isLoading || isFetching}
      onClick={handleDownload}
      endIcon={isLoading ? <CircularProgress size={24} /> : <CloudDownloadTwoTone />}
      fullWidth={false}
    >
      Descargar Plantilla
    </Button>
  );
};

export default ExcelDownloader;
