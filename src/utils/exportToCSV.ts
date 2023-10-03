import XLSX from 'xlsx'

type CellType = string | number | null;

interface exportToCSVOptions {
    data: CellType[][];
    filename: string;
    dateStart?: string;
    dateEnd?: string;
}

export async function exportToCSV({ data, filename }: exportToCSVOptions): Promise<void> {
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hoja1');
    const blob = XLSX.write(wb, { bookType: 'csv', type: 'array' });
    const blobURL = URL.createObjectURL(new Blob([blob], { type: 'application/octet-stream' }));
    const a = document.createElement('a');
    a.href = blobURL;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(blobURL);
}



export async function exportToXLSX({ data, filename, dateEnd, dateStart }: exportToCSVOptions): Promise<void> {
    const currentDate = new Date();
    const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
    
    // Crear una nueva hoja con los datos y la información de fecha y hora
    const wsData = [
    ['Reporte Generado el:', dateStart? `Desde:` : '', dateEnd? `Hasta:` : ''],
    [
        formattedDate,
        dateStart? dateStart : '',
        dateEnd? dateEnd : ''
    ], 
    [],
    ...data];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Aplicar bordes solo a las celdas del apartado de fecha
    const dateCellStart = XLSX.utils.encode_cell({ r: 0, c: 0 });
    const dateCellEnd = XLSX.utils.encode_cell({ r: 0, c: 1 });
    ws[dateCellStart].s = {
        border: { bottom: { style: 'thin', color: { auto: 1 } } }
    };
    ws[dateCellEnd].s = {
        border: { bottom: { style: 'thin', color: { auto: 1 } } }
    };

    // Crear el libro y agregar la hoja con bordes
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hoja1');

    // Generar el archivo Excel
    const blob = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blobURL = URL.createObjectURL(new Blob([blob], { type: 'application/octet-stream' }));

    // Descargar el archivo
    const a = document.createElement('a');
    a.href = blobURL;
    a.download = filename;
    a.click();

    // Liberar el objeto URL
    URL.revokeObjectURL(blobURL);
}



