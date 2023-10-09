import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  styled,
  tableCellClasses,
} from "@mui/material";
import { useState } from "react";

// iCONS
import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";

import { useAppDispatch } from "../../../store";
import { Seguimiento } from "../../../store/seguimiento/seguimientoSlice";
import AgregarProductoModal from "./AgregarProductoModal";
import { AutoCompleteBase } from "../../ui/components/BaseAutocomplete";
import { useAppSelector } from "../../../store/store";
import { useForm } from "react-hook-form";
import { CheckFormType, Tracker } from "../../../interfaces/tracking";
import { OperatorSelect } from "../../ui/components/OperatorSelect";
import { DriverSelect } from "../../ui/components";
import { LocationSelect } from "../../ui/components/LocationSelect";
import AgregarProductoSalida from "./AgregarProductoSalida";
import { OutPutDetail } from "./OutPutDetail";
import {
  updateTracking,
  chanceStatusTracking,
} from "../../../store/seguimiento/trackerThunk";
import { formatDistance, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { format } from "date-fns-tz";
import { ProductoEntradaTableRow } from "./ProductoEntradaTableRow";
import { EditNote } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ShowCodeDriver } from "./ShowCodeDriver";
import { ShowRoute } from "./ShowRoute";

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export const CheckForm = ({
  seguimiento,
  indice,
  disable,
}: {
  seguimiento: Seguimiento;
  indice: number;
  disable: boolean;
}) => {
  const dispatch = useAppDispatch();
  const [open, setopen] = useState(false);
  const { outputType } = useAppSelector((state) => state.maintenance);
  const centro_distribucion = useAppSelector(
    (state) => state.auth.user?.centro_distribucion
  );
  const user = useAppSelector((state) => state.auth.user);
  // function updateSeguimientoDatosOperador(datos: DatosOperador): unknown {
  //     if (!seguimiento) return;

  //     dispatch(updateSeguimiento({
  //         ...seguimiento,
  //         datosOperador: {
  //             ...seguimiento.datosOperador,
  //             ...datos
  //         },
  //         index: indice
  //     }))
  // }
  const { control, register, watch } = useForm<CheckFormType>({
    defaultValues: {
      ...seguimiento,
      outputType: seguimiento.outputType?.toString(),
      driver: seguimiento.driver !== null ? seguimiento.driver : undefined,
    },
  });
  const tiempoEntrada = seguimiento?.timeStart
    ? new Date(seguimiento?.timeStart)
    : null;
  const tiempoSalida = seguimiento?.timeEnd
    ? new Date(seguimiento?.timeEnd)
    : null;

  async function sendDataToBackend<T>(fieldName: keyof Tracker, value: T) {
    dispatch(updateTracking(indice, seguimiento.id, { [fieldName]: value }));
  }
  const [openOutput, setopenOutput] = useState(false);
  const outputTypeData = outputType.find(
    (d) => d.id === Number(watch("outputType"))
  );
  const navigate = useNavigate();
  const handleEditState = () => {
    dispatch(
      chanceStatusTracking("EDITED", seguimiento.id, () =>
        navigate("/tracker/check/?id=" + seguimiento.id)
      )
    );
  };
  return (
    <>
      <AgregarProductoSalida
        open={openOutput}
        handleClose={() => setopenOutput(false)}
      />
      {open && (
        <AgregarProductoModal open={open} handleClose={() => setopen(false)} />
      )}
      <Grid container spacing={2} sx={{ marginTop: 2, marginBottom: 5 }}>
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 2,
              }}
            >
              <Typography
                variant="h6"
                component="h1"
                fontWeight={400}
                color={"gray.500"}
              >
                Datos principales
              </Typography>
              <Typography>
                {disable ? "Revisado:" : "Tiempo en revision:"}
                <Chip
                  label={formatDistanceToNow(
                    new Date(seguimiento?.created_at),
                    { addSuffix: true, locale: es }
                  )}
                />
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ padding: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6} lg={4} xl={3}>
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={400}
                    color={"gray.500"}
                  >
                    Tipo
                  </Typography>
                  <Divider />
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={600}
                    color={"gray.500"}
                  >
                    {seguimiento?.type === "IMPORT" ? "Importación" : "Local"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={4} xl={3}>
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={400}
                    color={"gray.500"}
                  >
                    Transportista
                  </Typography>
                  <Divider />
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={600}
                    color={"gray.500"}
                  >
                    {seguimiento?.transporter.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={4} xl={3}>
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={400}
                    color={"gray.500"}
                  >
                    Tractor
                  </Typography>
                  <Divider />
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={600}
                    color={"gray.500"}
                  >
                    {seguimiento?.transporter.tractor}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={4} xl={3}>
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={400}
                    color={"gray.500"}
                  >
                    Cabezal
                  </Typography>
                  <Divider />
                  <Typography
                    variant="body1"
                    component="h1"
                    fontWeight={600}
                    color={"gray.500"}
                  >
                    {seguimiento?.transporter.code}
                  </Typography>
                </Grid>
                {disable && (
                  <Grid item xs={12} md={6} lg={4} xl={3}>
                    <Typography
                      variant="body1"
                      component="h1"
                      fontWeight={400}
                      color={"gray.500"}
                    >
                      Revisado por:
                    </Typography>
                    <Divider />
                    <Typography
                      variant="body1"
                      component="h1"
                      fontWeight={600}
                      color={"gray.500"}
                    >
                      {seguimiento?.userName}
                    </Typography>
                  </Grid>
                )}
                {disable && seguimiento?.completed_date && (
                  <Grid item xs={12} md={6} lg={4} xl={3}>
                    <Typography
                      variant="body1"
                      component="h1"
                      fontWeight={400}
                      color={"gray.500"}
                    >
                      Completado el:
                    </Typography>
                    <Divider />
                    <Typography
                      variant="body1"
                      component="h1"
                      fontWeight={600}
                      color={"gray.500"}
                    >
                      {format(
                        new Date(seguimiento?.completed_date),
                        "dd/MM/yyyy",
                        {
                          timeZone: "America/Tegucigalpa",
                        }
                      )}
                    </Typography>
                  </Grid>
                )}
                {disable && (
                  <Grid item xs={12} md={6} lg={4} xl={4}>
                    <Typography
                      variant="body1"
                      component="h1"
                      fontWeight={400}
                      color={"gray.500"}
                    >
                      Estado:
                    </Typography>
                    <Divider />
                    <Typography
                      variant="body1"
                      component="h1"
                      fontWeight={600}
                      color={"gray.500"}
                    >
                      <Chip
                        sx={{ mt: 0.5 }}
                        label={
                          seguimiento?.status === "COMPLETE"
                            ? "Completado"
                            : seguimiento?.status === "PENDING"
                            ? "Pendiente"
                            : "En atención"
                        }
                        color={
                          seguimiento?.status === "COMPLETE"
                            ? "success"
                            : seguimiento?.status === "PENDING"
                            ? "warning"
                            : "info"
                        }
                        size="medium"
                        variant="outlined"
                      />
                    </Typography>
                  </Grid>
                )}
                {user !== null &&
                  +user?.id === seguimiento.user &&
                  disable &&
                  seguimiento?.status === "PENDING" && (
                    <Grid item xs={12} md={6} lg={4} xl={3}>
                      <Typography
                        variant="body1"
                        component="h1"
                        fontWeight={600}
                        color={"gray.500"}
                      >
                        <Button
                          variant="outlined"
                          color="secondary"
                          fullWidth
                          onClick={() => handleEditState()}
                          startIcon={<EditNote />}
                        >
                          Editar
                        </Button>
                      </Typography>
                    </Grid>
                  )}
              </Grid>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight={400}
            color={"white"}
            align="center"
            bgcolor={"#1c2536"}
          >
            TRK-{seguimiento.id?.toString().padStart(5, "0")}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6} sx={{ marginTop: 1 }}>
          <Divider>
            <Typography
              variant="body1"
              component="h1"
              fontWeight={400}
              color={"gray.500"}
            >
              Datos generales
            </Typography>
          </Divider>
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="outlined-basic"
                label="Numero de placa"
                variant="outlined"
                size="small"
                autoComplete="off"
                disabled={disable}
                {...register("plateNumber")}
                onBlur={(e) =>
                  sendDataToBackend("plate_number", e.target.value || null)
                }
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <LocationSelect
                control={control}
                name="originLocation"
                placeholder="Localidad de Origen"
                locationId={watch("originLocation")}
                label="Localidad de Origen"
                disabled={disable}
                onChange={(e) =>
                  sendDataToBackend("origin_location", e?.id || null)
                }
              />
            </Grid>
            <Grid item xs={10} md={10}>
              {seguimiento.type === "LOCAL" ? (
                <DriverSelect
                  control={control}
                  name="driver"
                  placeholder="Conductor"
                  disabled={disable}
                  driver={watch("driver") || undefined}
                  onChange={(e) => sendDataToBackend("driver", e?.id || null)}
                />
              ) : (
                <TextField
                  fullWidth
                  id="outlined-basic"
                  label="Conductor"
                  variant="outlined"
                  size="small"
                  disabled={disable}
                  {...register("driverImport")}
                  onBlur={(e) =>
                    sendDataToBackend("driver_import", e.target.value || null)
                  }
                />
              )}
            </Grid>
            <Grid item xs={2} md={2}>
              {watch("driver") && (
                <ShowCodeDriver driverId={watch("driver") || undefined} />
              )}
            </Grid>
            {seguimiento?.type === "IMPORT" && (
              <Grid item xs={12} md={12}>
                <TextField
                  fullWidth
                  id="outlined-basic"
                  label="No. contenedor"
                  variant="outlined"
                  size="small"
                  disabled={disable}
                  {...register("containernumber")}
                  onBlur={(e) =>
                    sendDataToBackend(
                      "container_number",
                      e.target.value || null
                    )
                  }
                />
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              {seguimiento?.type === "LOCAL" ? (
                <TextField
                  fullWidth
                  id="outlined-basic"
                  label="Tranferencia de entrada"
                  variant="outlined"
                  size="small"
                  type="number"
                  disabled={disable}
                  {...register("documentNumber")}
                  onBlur={(e) =>
                    sendDataToBackend(
                      "input_document_number",
                      e.target.value || null
                    )
                  }
                />
              ) : (
                <TextField
                  fullWidth
                  id="outlined-basic"
                  label="No. Factura"
                  variant="outlined"
                  size="small"
                  type="text"
                  disabled={disable}
                  {...register("invoiceNumber")}
                  onBlur={(e) =>
                    sendDataToBackend("invoice_number", e.target.value || null)
                  }
                />
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="outlined-basic"
                label="N° de Traslado 5001"
                variant="outlined"
                size="small"
                disabled={disable}
                type="number"
                {...register("transferNumber")}
                onBlur={(e) =>
                  sendDataToBackend("transfer_number", e.target.value || null)
                }
              />
            </Grid>
          </Grid>
        </Grid>

        {seguimiento.type === "LOCAL" && (
          <Grid item xs={12} md={6} sx={{ marginTop: 1 }}>
            <Divider>
              <Typography
                variant="body1"
                component="h1"
                fontWeight={400}
                color={"gray.500"}
              >
                Datos operador
              </Typography>
            </Divider>
            <Grid container spacing={2} sx={{ marginTop: 2 }}>
              <Grid item xs={12} md={6} lg={4}>
                <Typography
                  variant="body1"
                  component="h1"
                  fontWeight={400}
                  color={"gray.500"}
                >
                  Tiempo de entrada
                </Typography>
                <Divider />
                <Typography
                  variant="body2"
                  component="h1"
                  fontWeight={400}
                  color={"gray.500"}
                >
                  {(tiempoEntrada &&
                    tiempoEntrada !== null &&
                    format(tiempoEntrada, "HH:mm:ss", {
                      locale: es,
                      timeZone: "America/Tegucigalpa",
                    })) ||
                    "00:00:00"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <Typography
                  variant="body1"
                  component="h1"
                  fontWeight={400}
                  color={"gray.500"}
                >
                  Tiempo de salida
                </Typography>
                <Divider />
                <Typography
                  variant="body2"
                  component="h1"
                  fontWeight={400}
                  color={"gray.500"}
                >
                  {(tiempoSalida &&
                    tiempoSalida !== null &&
                    format(tiempoSalida, "HH:mm:ss")) ||
                    "00:00:00"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <Typography
                  variant="body1"
                  component="h1"
                  fontWeight={400}
                  color={"gray.500"}
                >
                  Tiempo invertido
                </Typography>
                <Divider />
                <Typography
                  variant="body2"
                  component="h1"
                  fontWeight={400}
                  color={"gray.500"}
                >
                  {tiempoSalida && tiempoEntrada && tiempoEntrada !== null
                    ? formatDistance(tiempoEntrada, tiempoSalida, {
                        locale: es,
                      })
                    : "--:--:--"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6} sx={{ marginTop: "4px" }}>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  color="success"
                  disabled={tiempoEntrada ? true : false || disable}
                  onClick={() => {
                    sendDataToBackend("input_date", new Date().toISOString());
                    // updateSeguimientoDatosOperador({ tiempoEntrada: new Date() })
                  }}
                >
                  Registrar entrada
                </Button>
              </Grid>
              <Grid item xs={12} md={6} sx={{ marginTop: "4px" }}>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  color="error"
                  disabled={
                    tiempoEntrada === undefined ||
                    tiempoEntrada === null ||
                    (tiempoSalida !== undefined && tiempoSalida !== null) ||
                    disable
                  }
                  onClick={() => {
                    sendDataToBackend("output_date", new Date().toISOString());
                    // updateSeguimientoDatosOperador({ tiempoSalida: new Date() })
                  }}
                >
                  Registrar salida
                </Button>
              </Grid>
              <Grid item xs={12}>
                <OperatorSelect
                  control={control}
                  distributionCenterId={centro_distribucion || null}
                  name="opm1"
                  label="Operador #1"
                  operatorId={watch("opm1")}
                  disabled={disable}
                  invalidId={watch("opm2")}
                  onChange={(e) =>
                    sendDataToBackend("operator_1", e?.id || null)
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <OperatorSelect
                  control={control}
                  distributionCenterId={centro_distribucion || null}
                  name="opm2"
                  disabled={disable}
                  label="Operador #2"
                  operatorId={watch("opm2")}
                  invalidId={watch("opm1")}
                  onChange={(e) =>
                    sendDataToBackend("operator_2", e?.id || null)
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        )}
        <Grid item xs={12} sx={{ marginTop: 1 }} md={6}>
          <Divider>
            <Typography
              variant="body1"
              component="h1"
              fontWeight={400}
              color={"gray.500"}
            >
              Entrada de producto
            </Typography>
          </Divider>
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            {!disable && (
              <>
                {" "}
                <Grid item xs={12} md={12} lg={4} xl={4}></Grid>
                <Grid item xs={12} md={6} lg={4} xl={4}></Grid>
                <Grid item xs={12} md={6} lg={4} xl={4}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    color="secondary"
                    startIcon={<AddTwoToneIcon />}
                    disabled={
                      watch("originLocation") === undefined ||
                      watch("originLocation") === null ||
                      (watch("documentNumber")?.toString() === "" &&
                        watch("invoiceNumber")?.toString() === "")
                    }
                    onClick={() => {
                      setopen(true);
                    }}
                  >
                    Agregar producto
                  </Button>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Table size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Detalle</StyledTableCell>
                    <StyledTableCell align="right">No. SAP</StyledTableCell>
                    <StyledTableCell align="right">Producto</StyledTableCell>
                    <StyledTableCell align="right">
                      Total pallets
                    </StyledTableCell>
                    {!disable && (
                      <StyledTableCell align="right">Acciones</StyledTableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {seguimiento?.detalles.map((detalle, index) => {
                    return (
                      <ProductoEntradaTableRow
                        key={detalle.name}
                        row={detalle}
                        seguimiento={seguimiento}
                        index={index}
                        indexSeguimiento={indice}
                        disable={disable}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </Grid>
        {seguimiento.type === "LOCAL" && (
          <Grid item xs={12} sx={{ marginTop: 1 }} md={6}>
            <Divider>
              <Typography
                variant="body1"
                component="h1"
                fontWeight={400}
                color={"gray.500"}
              >
                Salida de producto
              </Typography>
            </Divider>
            <Grid container spacing={1} sx={{ marginTop: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="outlined-basic"
                  label="N° de Doc. Salida"
                  variant="outlined"
                  size="small"
                  type="number"
                  disabled={disable}
                  {...register("documentNumberExit")}
                  onBlur={(e) =>
                    sendDataToBackend(
                      "output_document_number",
                      e.target.value || null
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="outlined-basic"
                  label="Contabilizado"
                  variant="outlined"
                  size="small"
                  type="number"
                  disabled={disable}
                  {...register("accounted")}
                  onBlur={(e) =>
                    sendDataToBackend("accounted", e.target.value || null)
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LocationSelect
                  control={control}
                  name="outputLocation"
                  placeholder="Localidad de Envío"
                  locationId={watch("outputLocation")}
                  label="Localidad de Envío"
                  disabled={disable}
                  onChange={(e) =>
                    sendDataToBackend("destination_location", e?.id)
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <AutoCompleteBase
                  control={control}
                  name="outputType"
                  placeholder="Unidad Cargada con"
                  disabled={disable}
                  options={outputType.map((d) => ({
                    label: d.name,
                    id: d.id?.toString(),
                  }))}
                  onChange={(e) => sendDataToBackend("output_type", e)}
                />
              </Grid>
              <Grid item xs={12}>
                <ShowRoute
                  distributorCenterId={seguimiento.distributorCenter}
                  locationId={watch("outputLocation")}
                />
              </Grid>
              {outputTypeData && (
                <>
                  {outputTypeData?.required_details && !disable && (
                    <Grid item xs={12} md={6} lg={4} xl={4}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        color="secondary"
                        startIcon={<AddTwoToneIcon />}
                        onClick={() => setopenOutput(true)}
                      >
                        Agregar producto de salida
                      </Button>
                    </Grid>
                  )}
                  <OutPutDetail
                    seguimiento={seguimiento}
                    disable={disable}
                    outputType={outputTypeData}
                  />
                </>
              )}
            </Grid>
          </Grid>
        )}
      </Grid>
    </>
  );
};
