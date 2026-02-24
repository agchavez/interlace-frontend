import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import { FunctionComponent, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { toast } from "sonner";
import { OrderStore, addOutOrder } from "../../../store/order";
import BootstrapDialogTitle from "../../ui/components/BootstrapDialogTitle";
import { FileUploader } from "react-drag-drop-files";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { FleetType, OutOrderType } from "../../../interfaces/orders";

interface CreateCheckProps {
  open: boolean;
  handleClose?:
    | ((event: object, reason: "backdropClick" | "escapeKeyDown") => void)
    | undefined;
    order: OrderStore;
}

interface FormValues {
  fleet: FleetType | null;
  type: OutOrderType | null;
  document_number: string | null;
  document: File | null;
  vehicle: string;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const OutOrderModal: FunctionComponent<CreateCheckProps> = ({
  open,
  handleClose,
  order,
}) => {
  const loading = useAppSelector((state) => state.maintenance.loading);
  const [dragging, setDragging] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const dispatch = useAppDispatch();
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      fleet: null,
      type: null,
      document_number: null,
      document: null,
    },
  });

  const handleSubmitForm = (data: FormValues) => {
    if(!order || !order.id) return
    if(!data.fleet) return
    if(!data.type) return
    if(!data.document_number) return
    dispatch(
      addOutOrder({
        order: order.id,
        fleet: data.fleet??undefined,
        type: data.type,
        document_number: data.document_number,
        document: data.document??undefined,
        document_name: data.document?.name,
        vehicle: data.vehicle,
      })
    );
    reset();
    handleClose && handleClose({}, "backdropClick");
  };

  const handleClickCreate = () => {
    formRef.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true })
    );
  };

  const handleFileChange = (file: File) => {
    setValue("document", file); // Guardar el archivo en el estado o en las referencias
  };

  const file = watch("document");

  return (
    <BootstrapDialog
      open={open}
      onClose={handleClose}
      fullWidth={true}
      maxWidth="md"
    >
      <BootstrapDialogTitle
        id="customized-dialog-title"
        onClose={() => {
          handleClose && handleClose({}, "backdropClick");
        }}
      >
        Crear Salida de Pedido
      </BootstrapDialogTitle>

      <DialogContent dividers>
        <Box>
          <Container maxWidth="xl">
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body2" component="h2"></Typography>
              </Grid>
              <Grid item xs={12}>
                <form onSubmit={handleSubmit(handleSubmitForm)} ref={formRef}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label" size="small">
                          Flota
                        </InputLabel>
                        <Select
                          size="small"
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          value={watch("fleet") ?? ""}
                          label="Flota"
                          defaultValue=""
                          onChange={(event: SelectChangeEvent<string>) => {
                            setValue("fleet", event.target.value as FleetType);
                          }}
                          error={errors.fleet ? true : false}
                        >
                          <MenuItem value="PROPIEDAD">Propiedad</MenuItem>
                          <MenuItem value="TERCERA">Tercera</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label" size="small">
                          Tipo
                        </InputLabel>
                        <Select
                          size="small"
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          // value={age}
                          value={watch("type") ?? ""}
                          label="Tipo"
                          defaultValue=""
                          onChange={(event: SelectChangeEvent<string>) => {
                            setValue("type", event.target.value as OutOrderType);
                          }}
                          error={errors.type ? true : false}
                        >
                          <MenuItem value="T1">T1</MenuItem>
                          <MenuItem value="T2">T2</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Número de Documento"
                        variant="outlined"
                        size="small"
                        {...register("document_number")}
                        onChange={(e) => {
                          if (e.target.value === "") return;
                          const value = e.target.value;
                          setValue("document_number", value);
                        }}
                        error={errors.document_number ? true : false}
                        helperText={errors.document_number?.message}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Vehículo"
                        variant="outlined"
                        size="small"
                        {...register("vehicle")}
                        onChange={(e) => {
                          if (e.target.value === "") return;
                          const value = e.target.value;
                          setValue("vehicle", value);
                        }}
                        error={errors.vehicle ? true : false}
                        helperText={errors.vehicle?.message}
                      />
                    </Grid>
                    <Grid item xs={12}>
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
                          toast.error("No se admiten archivos mayores a 10 MB")
                        }
                      >
                        <Paper
                          style={{
                            width: "100%",
                            border: "2px dashed #aaaaaa",
                            borderRadius: 5,
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden",
                            height: 100,
                            gap: 2,
                            backgroundColor: dragging
                              ? "#F0E68C"
                              : "transparent",
                          }}
                        >
                          <CloudUploadIcon
                            style={{
                              fontSize: 35,
                              color: "#aaaaaa",
                            }}
                          />
                          <Typography
                            variant="body1"
                            style={{ color: "#aaaaaa" }}
                            textAlign="center"
                          >
                            {dragging
                              ? "Suelta el Documento"
                              : file != null
                              ? file.name
                              : "Documento"}
                          </Typography>
                          <input type="file" style={{ display: "none" }} />
                        </Paper>
                      </FileUploader>
                    </Grid>
                  </Grid>
                </form>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClickCreate}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          disabled={loading}
        >
          Crear
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default OutOrderModal;
