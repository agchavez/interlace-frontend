import {
  Box,
  Button,
  Container,
  Dialog,
  // DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  styled,
} from "@mui/material";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  removeFile,
  uploadFile,
} from "../../../store/seguimiento/trackerThunk";
import { Seguimiento } from "../../../store/seguimiento/seguimientoSlice";
import PublishTwoToneIcon from "@mui/icons-material/PublishTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import AttachFileTwoToneIcon from "@mui/icons-material/AttachFileTwoTone";
import SaveTwoToneIcon from "@mui/icons-material/SaveTwoTone";

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
  const [originalFileName, setOriginalFileName] = useState<string | null>("");
  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
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
  };

  const saveFilename = () => {
    if (seguimeintoActual === undefined) return;
    if (file_name === null) return;
    dispatch(
      uploadFile(seguimeintoActual, seguimiento.id, {
        archivo_name: file_name,
        archivo: null,
      })
    );
  };

  const handleClickGuardar = () => {
    formRef.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true })
    );
  };

  const handleClickEliminar = () => {
    if (seguimeintoActual !== undefined) {
      dispatch(
        removeFile(seguimeintoActual, seguimiento.id, () => {
          setValue("fileName", "");
          set_file_name("");
          setOriginalFileName(null);
        })
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]; // Obtener el primer archivo seleccionado
    const formFileName = file ? file.name : null;
    setValue("file", file); // Guardar el archivo en el estado o en las referencias
    setValue("fileName", formFileName);
    set_file_name(formFileName); // Guardar el nombre del archivo en el estado o en las referencias
    file !== null && setOriginalFileName(file.name);
  };

  console.log(originalFileName);

  useEffect(() => {
    if (open) {
      setValue("fileName", seguimiento.archivo_name);
      set_file_name(seguimiento.archivo_name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <BootstrapDialog
        open={open}
        onClose={handleClose}
        fullWidth={true}
        maxWidth="xs"
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
                    <Grid container spacing={2}>
                      <>
                        <Grid item xs={12}>
                          <Grid container>
                            <Grid item flexGrow={1}>
                              <Button
                                component="label"
                                variant="contained"
                                color="primary"
                              >
                                Elegir Archivo
                                <AttachFileTwoToneIcon />
                                <input
                                  type="file"
                                  hidden
                                  onChange={handleFileChange}
                                />
                              </Button>
                            </Grid>
                            <Grid item flexGrow={1}>
                              <Button
                                variant="contained"
                                color="success"
                                onClick={handleClickGuardar}
                                fullWidth
                              >
                                Subir
                                <PublishTwoToneIcon />
                              </Button>
                            </Grid>
                          </Grid>
                          {originalFileName}
                        </Grid>
                        {seguimiento.is_archivo_up && (
                          <Grid item xs={12}>
                            <Grid container>
                              <Grid item flexGrow={1}>
                                <TextField
                                  id="outlined-basic"
                                  variant="outlined"
                                  label="Nombre de archivo"
                                  size="small"
                                  value={file_name}
                                  fullWidth
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setValue("fileName", value);
                                    set_file_name(value);
                                  }}
                                  error={errors.fileName ? true : false}
                                  helperText={errors.fileName?.message}
                                />
                              </Grid>
                              {seguimiento.is_archivo_up && (
                                <IconButton onClick={saveFilename}>
                                  <SaveTwoToneIcon />
                                </IconButton>
                              )}
                            </Grid>
                          </Grid>
                        )}
                      </>

                      {seguimiento.is_archivo_up && (
                        <Grid item xs={12}>
                          <Button
                            variant="contained"
                            component="label"
                            color="error"
                            onClick={handleClickEliminar}
                            fullWidth
                          >
                            Eliminar archivo
                            <DeleteTwoToneIcon />
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </form>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </DialogContent>
      </BootstrapDialog>
    </>
  );
};

export default ArchivoModal;
