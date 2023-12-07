import {
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { toast } from "sonner";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useForm } from "react-hook-form";
import CloudUploadTwoToneIcon from '@mui/icons-material/CloudUploadTwoTone';
import { createT2Tracking } from '../../../store/seguimiento/t2TrackingThunk';
import { useAppDispatch, useAppSelector } from '../../../store/store';
import { useNavigate } from "react-router-dom";

const PreSalePage = () => {
  const [file, setfile] = useState<{
    file: File | null;
    fileName: string | null;
  }>({ file: null, fileName: null });
  const [obs, setobs] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    loading
  } = useAppSelector(state => state.seguimiento.t2Tracking);
  const handleClickSave = () => {
    formRef.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true })
    );
  };

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

  const { handleSubmit } = useForm({
    defaultValues: {
      file: null,
    },
  });

  const handleSubmitForm = () => {
    const formData = new FormData();
    formData.append("file", file.file as Blob);
    formData.append("observations", obs as string);
    dispatch(createT2Tracking(formData, (id: number) => navigate(`/tracker-t2/detail/${id}`)));
  };

  return (
    <Container maxWidth="xl">
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        <Grid item xs={12} display="flex" justifyContent="space-between">
          <Typography variant="h5" component="h1" fontWeight={400}>
            T2 - Carga de preventa
          </Typography>
          <Button
            variant="contained"
            color="success"
            size="medium"
            onClick={handleClickSave}
            disabled={file.file === null || loading}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> :
                <CloudUploadTwoToneIcon />}
          >
            Cargar preventa
          </Button>
        </Grid>
      </Grid>
      <Grid item xs={12} md={12} lg={12}>
        <Typography variant="body2" textAlign="start" sx={{ mb: 1 }}>
          Cargar archivo de preventa para el T2, al finalizar presione el botón "Cargar"
        </Typography>
        <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
      </Grid>
      <form ref={formRef} onSubmit={handleSubmit(handleSubmitForm, () => { })}>
        <Grid item xs={12} md={12} lg={12}>
          <TextField
            id="outlined-basic"
            label="Observaciones"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            sx={{ marginTop: 2 }}
            onChange={(e) => setobs(e.target.value)}
            value={obs}
          />
        </Grid>
        <Grid item xs={12} md={12} lg={12}>
          <Typography
            variant="body1"
            textAlign="start"
            sx={{ mb: 1, marginTop: 2 }}
            color="text.secondary"
          >
            Adjuntar archivo, solo se admiten archivos .xlsx
          </Typography>
          <FileUploader
            name="file"
            label="Arrastre un archivo o haga click para seleccionar uno"
            dropMessageStyle={{ backgroundColor: "red" }}
            maxSize={20}
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
      </form>
    </Container>
  );
};

export default PreSalePage;
