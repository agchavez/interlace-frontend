import { Button, Divider, Grid, Paper, TextField, Typography } from '@mui/material';
import { FC, useState } from 'react'
import { FileUploader } from 'react-drag-drop-files';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadTwoToneIcon from '@mui/icons-material/CloudDownloadTwoTone';
import { toast } from 'sonner';
import XLSX from 'xlsx'


interface Props {
    file: { file: File | null, fileName: string | null } | null;
    reason: string | null;
    setreason: (reason: string) => void;
    handleFileChange: (file: File) => void;
}
export const NewAdjustmentForm: FC<Props> = ({ file, reason, setreason, handleFileChange }) => {
    const [dragging, setDragging] = useState(false);
    const handleDownload = () => {
        const ws = XLSX.utils.aoa_to_sheet([
            ["tracker_id", "codigo_sap", "fecha_vencimiento", "cantidad"],
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Hoja1');
        XLSX.writeFile(wb, 'reajuste_inventario.xlsx');
        const blob = XLSX.write(wb, { bookType: 'csv', type: 'array' });
        const blobURL = URL.createObjectURL(new Blob([blob], { type: 'application/octet-stream' }));
        const a = document.createElement('a');
        a.href = blobURL;
        a.download = 'reajuste_inventario.xlsx';
        a.click();
        URL.revokeObjectURL(blobURL);
    }
    return (
        <>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <Typography variant="body1" textAlign="start" sx={{ mb: 1 }} color="text.secondary">
                        Complete el siguiente formulario para registrar un reajuste de inventario, al confirmar registrará el reajuste y se actualizará el inventario, decargue el archivo de ejemplo para ver el formato de los datos.
                        <Button variant="text" color="primary" size="small" sx={{ ml: 1 }} endIcon={<CloudDownloadTwoToneIcon />} onClick={handleDownload}>
                            Descargar plantilla
                        </Button>
                    </Typography>
                    <Divider />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Motivo de reajuste"
                        variant="outlined"
                        size="small"
                        multiline
                        rows={4}
                        value={reason}
                        onChange={(e) => setreason(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body1" textAlign="start" sx={{ mb: 1 }} color="text.secondary">
                        Adjuntar archivo, solo se admiten archivos .xlsx
                    </Typography>
                    <FileUploader
                        name="file"
                        label="Arrastre un archivo o haga click para seleccionar uno"
                        dropMessageStyle={{ backgroundColor: "red" }}
                        maxSize={10}
                        multiple={false}
                        onDraggingStateChange={(d: boolean) => setDragging(d)}
                        onDrop={handleFileChange}
                        onSelect={handleFileChange}
                        onSizeError={() => toast.error("No se admiten archivos de archivos mayores a 20 MB")}
                    >
                        <Paper
                            style={{
                                width: "100%",
                                height: 200,
                                border: "2px dashed #aaaaaa",
                                borderRadius: 5,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                position: "relative",
                                overflow: "hidden",
                                backgroundColor: dragging ? "#F0E68C" : "transparent",
                            }}
                        >
                            <CloudUploadIcon
                                style={{
                                    fontSize: 40,
                                    color: "#aaaaaa",
                                }}
                            />
                            <Typography
                                variant="body1"
                                style={{ color: "#aaaaaa" }}
                                textAlign="center"
                            >
                                {dragging
                                    ? "Suelta el Archivo"
                                    : file != null
                                        ? file.fileName
                                        : "Arrastra y suelta archivos aquí o haz clic para seleccionar archivos"}
                            </Typography>
                            <input type="file" style={{ display: "none" }} />
                        </Paper>
                    </FileUploader>
                </Grid>
            </Grid>
        </>
    )
}
