import XLSX from 'xlsx'

type CellType = string | number | null;

interface exportToCSVOptions {
    data: CellType[][];
    filename: string;
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

export async function exportToXLSX({ data, filename }: exportToCSVOptions): Promise<void> {
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hoja1');
    const blob = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blobURL = URL.createObjectURL(new Blob([blob], { type: 'application/octet-stream' }));
    const a = document.createElement('a');
    a.href = blobURL;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(blobURL);
}

