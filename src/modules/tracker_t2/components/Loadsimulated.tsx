import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, Grid, LinearProgress, Paper, Typography } from '@mui/material';
import { FC, useState } from 'react';
import BootstrapDialogTitle from '../../ui/components/BoostrapDialog';
import { useAppDispatch, useAppSelector } from '../../../store';
import { FileUploader } from 'react-drag-drop-files';
import { toast } from 'sonner';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useParams } from 'react-router-dom';
import { generateSimulation } from '../../../store/seguimiento/t2TrackingThunk';

interface LoadsimulatedProps {
    isOpen: boolean;
    onClose: () => void;
    refresh: () => void;
}

export const Loadsimulated: FC<LoadsimulatedProps> = ({ isOpen, onClose, refresh }) => {

    const { id } = useParams<{ id: string }>();
    const { loading } = useAppSelector((state) => state.seguimiento.t2Tracking);
    const [file, setfile] = useState<{
        file: File | null;
        fileName: string | null;
    }>({ file: null, fileName: null });
    const [dragging, setDragging] = useState(false);
    const dispatch = useAppDispatch();
    const handleLoadSimulated = () => {
        if (file.file === null || id === undefined) {
            toast.error("Debe seleccionar un archivo");
            return;
        }
        dispatch(
            generateSimulation(file.file, +id, () => {
                refresh && refresh();
                onClose();
            })
        );
    }


    const handleFileChange = (file: File) => {
        // Solo se admiten .xlsx
        if (
            file.type !==
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
            toast.error("Solo se admiten archivos .xlsx");
            return;
        }
        setfile({ file: file, fileName: file.name });
    };

    return (
        <>
            <Dialog open={isOpen} onClose={loading ? undefined : onClose}
                fullWidth maxWidth="md">
                <BootstrapDialogTitle id="customized-dialog-title" onClose={loading ? undefined : onClose}>
                    <Typography variant="h6" component="div" fontWeight={400}>
                        Generar simulación
                    </Typography>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Alert severity={'warning'}>
                        No cierre esta ventana hasta que se haya completado la carga de los datos
                    </Alert>
                    <Grid container spacing={2} sx={{ marginTop: 2 }}>
                        {loading && (
                            <Grid item xs={12} md={12} lg={12}>
                                <LinearProgress
                                    sx={{ width: "100%", height: 5 }}
                                />
                            </Grid>
                        )}
                        <Grid item xs={12} md={12} lg={12}>
                            <Typography
                                variant="body1"
                                textAlign="start"
                                sx={{ mb: 1, marginTop: 0 }}
                                color="text.secondary"
                            >
                                Adjuntar archivo con los datos SAP, solo se admiten archivos .xlsx
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
                                onSizeError={() =>
                                    toast.error("No se admiten archivos de archivos mayores a 20 MB")
                                }
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
                                            : file.file != null
                                                ? file.fileName
                                                : "Arrastra y suelta archivos aquí o haz clic para seleccionar archivos"}
                                    </Typography>
                                    <input type="file" style={{ display: "none" }} />
                                </Paper>
                            </FileUploader>
                        </Grid>
                    </Grid>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleLoadSimulated}
                        variant="contained"
                        color="secondary"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : undefined}
                    >
                        Cargar simulación
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
