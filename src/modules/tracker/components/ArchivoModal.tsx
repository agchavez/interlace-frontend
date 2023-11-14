import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Typography,
  styled,
} from "@mui/material";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { uploadFile } from "../../../store/seguimiento/trackerThunk";
import { Seguimiento } from "../../../store/seguimiento/seguimientoSlice";
import { FileUploader } from "react-drag-drop-files";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { toast } from "sonner";

interface ArchivoModalProps {
  open: boolean;
  seguimiento: Seguimiento;
  handleClose?:
    | ((event: object, reason: "backdropClick" | "escapeKeyDown") => void)
    | undefined;
}

interface FormValues {
  file: File | null;
  fileName: string | null;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const ArchivoModal: FunctionComponent<ArchivoModalProps> = ({
  open,
  seguimiento,
  handleClose,
}) => {
  const dispatch = useAppDispatch();
  const seguimeintoActual = useAppSelector(
    (state) => state.seguimiento.seguimeintoActual
  );
  // const loading = useAppSelector((state) => state.maintenance.loading);
  const formRef = useRef<HTMLFormElement>(null);

  const [file_name, set_file_name] = useState<string | null>("");
  const [dragging, setDragging] = useState(false);
  const { handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      file: null,
      fileName: null,
    },
  });

  const handleSubmitForm = (data: FormValues) => {
    if (seguimeintoActual === undefined) return;
    if (data.file === null && file_name === null) return;
    dispatch(
      uploadFile(seguimeintoActual, seguimiento.id, {
        archivo_name: file_name,
        archivo: data.file,
      })
    );
    handleClose && handleClose({}, "backdropClick")
  };

  const handleClickGuardar = () => {
    formRef.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true })
    );
  };

  useEffect(() => {
    if (open) {
      setValue("fileName", seguimiento.archivo_name);
      set_file_name(seguimiento.archivo_name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleFileChange = (file: File) => {
    const formFileName = file ? file.name : null;
    setValue("file", file); // Guardar el archivo en el estado o en las referencias
    setValue("fileName", formFileName);
    set_file_name(formFileName); // Guardar el nombre del archivo en el estado o en las referencias
  };

  const file = watch("file");

  return (
    <>
      <BootstrapDialog
        open={open}
        onClose={handleClose}
        fullWidth={true}
        maxWidth="lg"
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Archivo para tracker TRK-
          {seguimiento.id?.toString().padStart(5, "0")}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => handleClose && handleClose({}, "backdropClick")}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
            textDecoration: "underline", // Agrega un subrayado para hacerlo parecer un enlace
            cursor: "pointer", // Cambia el cursor al estilo "mano" para indicar que es interactivo
          }}
          color="primary"
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Box>
            <Container maxWidth="xl">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <form onSubmit={handleSubmit(handleSubmitForm)} ref={formRef}>
                    <FileUploader
                      name="file"
                      label="Arrastre un archivo o haga click para seleccionar uno"
                      dropMessageStyle={{ backgroundColor: "red" }}
                      maxSize={20}
                      multiple={false}
                      onDraggingStateChange={(d: boolean) => setDragging(d)}
                      onDrop={handleFileChange}
                      onSelect={handleFileChange}
                      onSizeError = {()=>toast.error("No se admiten archivos de archivos mayores a 20 MB")}
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
                            ? file.name
                            : "Arrastra y suelta archivos aquí o haz clic para seleccionar archivos"}
                        </Typography>
                        <input type="file" style={{ display: "none" }} />
                      </Paper>
                    </FileUploader>
                  </form>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickGuardar} disabled={file === null} variant="outlined">
            Subir
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </>
  );
};

export default ArchivoModal;
