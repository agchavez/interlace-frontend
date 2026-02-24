// PeriodMassUploadDialog.tsx

import { useState } from "react";
import {
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Divider,
    Grid,
    Paper,
} from "@mui/material";

import DialogTitle from "../../ui/components/BootstrapDialogTitle";
import { BootstrapDialog } from "../../tracker/components/ClaimDialog";
import { FileUploader } from "react-drag-drop-files";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { toast } from "sonner";

import { useMassImportPeriodsMutation } from "../../../store/maintenance/maintenanceApi";
import ExcelDownloader from "../../ui/components/DownloadExcel";

interface Props {
    open: boolean;
    onClose: () => void;
}

export function PeriodMassUploadDialog({ open, onClose }: Props) {
    const [dragging, setDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // RTK Query
    const [massImportPeriods] = useMassImportPeriodsMutation();

    const handleFileChange = (filePicked: File) => {
        setSelectedFile(filePicked);
    };

    async function handleImport() {
        if (!selectedFile) {
            toast.error("Por favor, selecciona un archivo .xlsx primero");
            return;
        }

        try {
            // Construir FormData
            const formData = new FormData();
            formData.append("file", selectedFile);

            await massImportPeriods(formData).unwrap();

            toast.success("Importación masiva realizada con éxito");
            onClose();
        } catch (error: unknown) {
            toast.error("Error al importar el archivo Excel");
        }
    }

    return (
        <BootstrapDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle onClose={onClose} id="mass-upload-dialog-title">
                <Typography variant="h6" color="white" fontWeight={400}>
                    Carga Masiva de Períodos (Excel)
                </Typography>
            </DialogTitle>
            <Divider sx={{ mt: 1 }} />
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="body1" textAlign="start" sx={{ mb: 1 }} color="text.secondary">
                            Selecciona un archivo .xlsx que contenga varios Períodos para importar.
                        </Typography>
                        <Divider />
                    </Grid>

                    <Grid item xs={12} display="flex" justifyContent="flex-end">
                        <ExcelDownloader />
                    </Grid>

                    <Grid item xs={12}>
                        <FileUploader
                            name="file"
                            label="Arrastra un archivo o haz clic para seleccionar uno"
                            maxSize={20}
                            multiple={false}
                            onDraggingStateChange={(drag: boolean | ((prevState: boolean) => boolean)) => setDragging(drag)}
                            onDrop={(file: File) => handleFileChange(file)}
                            onSelect={(file: File) => handleFileChange(file)}
                            onSizeError={() => toast.error("El archivo excede el límite de 20 MB")}
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
                                    backgroundColor: dragging ? "#F0E68C" : "transparent",
                                }}
                            >
                                <CloudUploadIcon style={{ fontSize: 40, color: "#aaaaaa" }} />
                                <Typography variant="body1" style={{ color: "#aaaaaa" }} textAlign="center">
                                    {dragging
                                        ? "Suelta el archivo"
                                        : selectedFile
                                            ? selectedFile.name
                                            : "Arrastra y suelta o haz clic para seleccionar un archivo .xlsx"}
                                </Typography>
                            </Paper>
                        </FileUploader>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button variant="contained" onClick={handleImport}>
                    Importar
                </Button>
            </DialogActions>
        </BootstrapDialog>
    );
}
