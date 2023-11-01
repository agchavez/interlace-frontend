import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextareaAutosize as BaseTextareaAutosize,
  Typography,
  styled,
} from "@mui/material";
import { FunctionComponent, useRef, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { updateTracking } from "../../../store/seguimiento/trackerThunk";
import { Seguimiento } from "../../../store/seguimiento/seguimientoSlice";

interface ObservationModalProps {
  open: boolean;
  seguimiento: Seguimiento;
  handleClose?:
    | ((event: object, reason: "backdropClick" | "escapeKeyDown") => void)
    | undefined;
}

interface FormValues {
  observation: string | null;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const ObservationModal: FunctionComponent<ObservationModalProps> = ({
  open,
  seguimiento,
  handleClose,
}) => {
  const dispatch = useAppDispatch();
  const seguimeintoActual = useAppSelector(
    (state) => state.seguimiento.seguimeintoActual
  );
  const loading = useAppSelector((state) => state.maintenance.loading);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setFocus,
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      observation: seguimiento.observation,
    },
  });
  // FOcus al abrir el modal
  useEffect(() => {
    setTimeout(() => {
      setFocus("observation");
    }, 100);
  }, [open, setFocus]);

  useEffect(() => {
    if (open) {
      setValue("observation", seguimiento.observation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, seguimiento.observation]);

  const handleSubmitForm = (data: FormValues) => {
    dispatch(
      updateTracking(seguimeintoActual || 0, seguimiento.id, {
        observation: data.observation || null,
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

  return (
    <>
      <BootstrapDialog
        open={open}
        onClose={handleClose}
        fullWidth={true}
        maxWidth="md"
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Observaciones
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
                    <Textarea
                      id="outlined-basic"
                      {...register("observation")}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: errors.observation
                          ? "1px solid red"
                          : "1px solid #d9d9d9",
                        resize: "none",
                        fontSize: "15px",
                        fontFamily: "inherit",
                      }}
                      onChange={(e) => {
                        if (e.target.value === "") return;
                        const value = e.target.value;
                        setValue("observation", value);
                      }}
                    />
                    {errors.observation && (
                      <Typography color="red" margin="4px 0" fontSize="0.75em">
                        {errors.observation.message}
                      </Typography>
                    )}
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
            Guardar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </>
  );
};

export default ObservationModal;

const blue = {
  100: "#DAECFF",
  200: "#b6daff",
  400: "#3399FF",
  500: "#007FFF",
  600: "#0072E5",
  900: "#003A75",
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

const Textarea = styled(BaseTextareaAutosize)(
  ({ theme }) => `
    width: 320px;
    font-family: IBM Plex Sans, sans-serif;
    font-size: 1em;
    font-weight: 400;
    line-height: 1.5;
    padding: 8px 12px;
    border-radius: 8px;
    color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
    background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
    border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
    box-shadow: 0px 2px 2px ${
      theme.palette.mode === "dark" ? grey[900] : grey[50]
    };

    &:hover {
      border-color: ${blue[400]};
    }

    &:focus {
      border-color: ${blue[400]};
      box-shadow: 0 0 0 3px ${
        theme.palette.mode === "dark" ? blue[600] : blue[200]
      };
    }

    // firefox
    &:focus-visible {
      outline: 0;
    }
  `
);
