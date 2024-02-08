import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import { FunctionComponent, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { toast } from "sonner";
import { createLocationAndRoute } from "../../../store/order";
import BootstrapDialogTitle from "../../ui/components/BoostrapDialog";

interface CreateCheckProps {
  open: boolean;
  handleClose?:
    | ((event: object, reason: "backdropClick" | "escapeKeyDown") => void)
    | undefined;
}

interface FormValues {
  name: string | null;
  code: string | null;
  routeCode: string | null;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const AddClientModal: FunctionComponent<CreateCheckProps> = ({
  open,
  handleClose,
}) => {
  const loading = useAppSelector((state) => state.maintenance.loading);
  const distributor_center = useAppSelector(
    (state) => state.auth.user?.centro_distribucion
  );
  const formRef = useRef<HTMLFormElement>(null);
  const dispatch = useAppDispatch();
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setFocus,
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      name: null,
      code: null,
      routeCode: null,
    },
  });
  // FOcus al abrir el modal
  useEffect(() => {
    setTimeout(() => {
      setFocus("name");
    }, 100);
  }, [open, setFocus]);

  const handleSubmitForm = (data: FormValues) => {
    if (data.code === null || data.name === null || data.routeCode === null)
      return toast.error("faltan datos");
    if (distributor_center === undefined || distributor_center === null)
      return toast.error("Este usuario no tiene centro de distribucion");
    dispatch(
      createLocationAndRoute({
        name: data.name,
        code: data.code,
        routeCode: data.routeCode,
        distributor_center: distributor_center,
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
    <BootstrapDialog
      open={open}
      onClose={handleClose}
      fullWidth={true}
      maxWidth="md"
    >
      <BootstrapDialogTitle id="customized-dialog-title" onClose={() => { handleClose && handleClose({}, "backdropClick") }}>
        Nuevo Cliente
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
                      <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Nombre"
                        variant="outlined"
                        size="small"
                        {...register("name")}
                        onChange={(e) => {
                          if (e.target.value === "") return;
                          const value = e.target.value;
                          setValue("name", value);
                        }}
                        error={errors.name ? true : false}
                        helperText={errors.name?.message}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Codigo"
                        variant="outlined"
                        size="small"
                        {...register("code")}
                        onChange={(e) => {
                          if (e.target.value === "") return;
                          const value = e.target.value;
                          setValue("code", value);
                        }}
                        error={errors.code ? true : false}
                        helperText={errors.code?.message}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Codigo de Ruta"
                        variant="outlined"
                        size="small"
                        {...register("routeCode")}
                        onChange={(e) => {
                          if (e.target.value === "") return;
                          const value = e.target.value;
                          setValue("routeCode", value);
                        }}
                        error={errors.routeCode ? true : false}
                        helperText={errors.routeCode?.message}
                      />
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
          Agregar
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default AddClientModal;
