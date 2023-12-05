import {
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { toast } from "sonner";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useForm } from "react-hook-form";

const PreSalePage = () => {
  const [file, setfile] = useState<{
    file: File | null;
    fileName: string | null;
  }>({ file: null, fileName: null });
  const [dragging, setDragging] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

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
    console.log("submit")
  };

  return (
    <Container maxWidth="xl">
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        <Grid item xs={12} display="flex" justifyContent="space-between">
          <Typography variant="h5" component="h1" fontWeight={400}>
            T2 - Preventa
          </Typography>
          <Button
            variant="contained"
            color="success"
            size="medium"
            onClick={handleClickSave}
          >
            Cargar
          </Button>
        </Grid>
        <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
      </Grid>
      <form ref={formRef} onSubmit={handleSubmit(handleSubmitForm, () => {})}>
        <Grid item xs={12} md={12} lg={12}>
          <Typography
            variant="body1"
            textAlign="start"
            sx={{ mb: 1 }}
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
