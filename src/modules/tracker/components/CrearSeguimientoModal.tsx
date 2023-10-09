import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  styled,
} from "@mui/material";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAppDispatch } from "../../../store";
import { TrailerSelect, TransporterSelect } from "../../ui/components";
import { Trailer, Transporter } from "../../../interfaces/maintenance";
import { createTracking } from "../../../store/seguimiento/trackerThunk";

interface CreateCheckProps {
  open: boolean;
  handleClose?:
    | ((event: object, reason: "backdropClick" | "escapeKeyDown") => void)
    | undefined;
}

interface FormValues {
  rastraId: number;
  transporter: number;
  type: string;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const CreateCheckModal: FunctionComponent<CreateCheckProps> = ({
  open,
  handleClose,
}) => {
  const schema = yup.object().shape({
    rastraId: yup
      .number()
      .required("Este campo es requerido")
      .min(1, "Seleccione una rastra"),
    transporter: yup
      .number()
      .required("Este campo es requerido")
      .min(1, "Seleccione un transportista"),
    // solo admite LOCAL o IMPORT
    type: yup
      .string()
      .required("Este campo es requerido")
      .matches(/^(LOCAL|IMPORT)$/, "Solo admite LOCAL o IMPORT"),
  });

  const [trailer, settrailer] = useState<Trailer | null>(null);
  const [transporter, setTransporter] = useState<Transporter | null>(null);

  const dispach = useAppDispatch();

  const formRef = useRef<HTMLFormElement>(null);

  const {
    handleSubmit,
    reset,
    setFocus,
    control,
    register,
    watch,
    formState: { isValid, errors },
    setValue,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      rastraId: 0,
      transporter: 0,
      type: "LOCAL",
    },
  });

  useEffect(() => {
    if (open) {
      reset();
      settrailer(null);
      setTransporter(null);
    }
  }, [open, reset]);

  const handleChangeTrailer = (value: Trailer | null) => {
    if (value) {
      settrailer(value);
      setValue("rastraId", value.id);
    }
  };

  const handleChangeTDriver = (value: Transporter | null) => {
    if (value) {
      setTransporter(value);
    }
  };

  const handleSubmitForm = (data: FormValues) => {
    if (trailer && transporter) {
      dispach(
        createTracking({
          trailer: trailer.id,
          transporter: transporter.id,
          type: data.type,
        })
      );
      //dispach(setSeguimientoActual(seguimientos.length))
    }
  };

  const handleClickCreate = () => {
    formRef.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true })
    );
    if (!isValid) return;
    handleClose && handleClose({}, "backdropClick");
    reset();
  };

  useEffect(() => {
    setTimeout(() => {
      setFocus("rastraId");
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <BootstrapDialog
        open={open}
        onClose={handleClose}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Datos Generales del Tracking
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
              <Grid container spacing={0}>
                <Grid item xs={12}>
                  <form onSubmit={handleSubmit(handleSubmitForm)} ref={formRef}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        {open && (
                          <TrailerSelect
                            control={control}
                            registered={true}
                            name="rastraId"
                            placeholder="Seleccione una rastra"
                            trailerId={trailer?.id}
                            onChange={handleChangeTrailer}
                          />
                        )}
                      </Grid>
                      <Grid item xs={12}>
                        <TransporterSelect
                          control={control}
                          name="transporter"
                          placeholder="Seleccione un transportista"
                          onChange={handleChangeTDriver}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl
                          fullWidth
                          size="small"
                          variant="outlined"
                          error={!!errors.type}
                        >
                          <InputLabel id="demo-simple-select-label">
                            Tipo
                          </InputLabel>
                          <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Tipo"
                            error={!!errors.type}
                            {...register("type")}
                            value={watch("type")}
                          >
                            <MenuItem value="LOCAL">Locales</MenuItem>
                            <MenuItem value="IMPORT">Importado</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </form>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickCreate}>Crear</Button>
        </DialogActions>
      </BootstrapDialog>
    </>
  );
};

export default CreateCheckModal;
