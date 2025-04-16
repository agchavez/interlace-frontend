import {
  Container,
  Typography,
  Grid,
  Divider,
  Box,
  Tabs,
  Tab,
  Button,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { CheckForm } from "../components/CheckForm";
import CreateCheckModal from "../components/CrearSeguimientoModal";
import PostAddTwoToneIcon from "@mui/icons-material/PostAddTwoTone";
import { useAppDispatch, useAppSelector } from "../../../store";
import { setSeguimientoActual } from "../../../store/seguimiento/seguimientoSlice";
import { EliminarSeguimientoModal } from "../components/EliminarSeguimientoModal";
import { getOpenTrackings } from "../../../store/seguimiento/trackerThunk";
import { CompletarSeguimientoModal } from "../components/CompletarSeguimientoModal";
import FloatLoading from "../components/FloatLoading";
import { useSearchParams } from "react-router-dom";
import {ClaimModal} from "../components/ClaimDialog.tsx";
import ClaimEditModal from "../components/ClaimEditModal.tsx";
import CheckBoxTwoToneIcon from '@mui/icons-material/CheckBoxTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import PausePresentationTwoToneIcon from '@mui/icons-material/PausePresentationTwoTone';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export const CheckPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [, setValue] = useState(0);
  const [eliminarOpen, setEliminarOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false)
  const [completarOpen, setCompletarOpen] = useState({
    open: false,
    completed: true,
  });
  const { seguimientos, seguimeintoActual, loading } = useAppSelector(
    (state) => state.seguimiento
  );
  const { user } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCloseDeleteModal = () => {
    setEliminarOpen(false);
  };

  const handleCloseCompleteModal = () => {
    setCompletarOpen({
      open: false,
      completed: true,
    });
  };

  const handleClickPending = () => {
    setCompletarOpen({
      open: true,
      completed: false,
    });
  };

  const handleClickDelete = () => {
    
    setEliminarOpen(true);
  };
  useEffect(() => {
    // get pending trackings
    dispatch(getOpenTrackings());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.centro_distribucion]);

  const handleClickCompletar = () => {
    setCompletarOpen({
      open: true,
      completed: true,
    });
    // dispatch(completeTracker())
  };
  useEffect(() => {
    if (id !== null && seguimientos.length > 0) {
      const index = seguimientos.findIndex(
        (seguimiento) => seguimiento.id === +id
      );
      if (index !== -1) {
        dispatch(setSeguimientoActual(index));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, seguimientos]);
  return (
    <>
      {showCreateModal && (
        <CreateCheckModal
          open={showCreateModal}
          handleClose={handleCloseCreateModal}
        />
      )}
      {claimOpen && seguimientos.length > 0 && (
          seguimientos[seguimeintoActual || 0]?.claim ? (
              <ClaimEditModal
                  open={claimOpen}
                  onClose={() => setClaimOpen(false)}
                  claimId={seguimientos[seguimeintoActual || 0].claim!}
                  seguimiento={seguimientos[seguimeintoActual || 0]}
              />
          ) : (
              <ClaimModal
                  tracker={seguimientos[seguimeintoActual || 0].id}
                  open={claimOpen}
                  onClose={() => setClaimOpen(false)}
                  type={seguimientos[seguimeintoActual || 0].type}
                  seguimiento={seguimientos[seguimeintoActual || 0]}
              />
          )
      )}

      <EliminarSeguimientoModal
        index={seguimeintoActual || 0}
        open={eliminarOpen}
        handleClose={handleCloseDeleteModal}
        seguimientoId={
          seguimientos[seguimeintoActual || 0] &&
          seguimientos[seguimeintoActual || 0].id
        }
      />
      <CompletarSeguimientoModal
        open={completarOpen.open}
        handleClose={handleCloseCompleteModal}
        copleted={completarOpen.completed}
      />
      <Container maxWidth="xl">
        <Grid container spacing={1} sx={{ marginTop: 2 }}>
          <Grid item xs={12}>
            <Typography variant="h5" component="h1" fontWeight={400}>
              T1 - En Atención
            </Typography>
            <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
          </Grid>
          <FloatLoading visible={loading} />
          <Grid item xs={12} md={8} lg={9} xl={10}></Grid>
          <Grid
            item
            xs={12}
            md={4}
            lg={3}
            xl={2}
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              fullWidth
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={20} />
                ) : (
                  <PostAddTwoToneIcon color="inherit" fontSize="small" />
                )
              }
              onClick={() => setShowCreateModal(true)}
            >
              <Typography
                variant="body2"
                component="span"
                fontWeight={400}
                color={"gray.700"}
              >
                {loading ? "Cargando..." : "Nuevo Tracking"}
              </Typography>
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ width: "100%" }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={seguimeintoActual || 0}
                  onChange={handleChange}
                  aria-label="basic tabs example"
                >
                  {seguimientos.map((seguimiento, index) => {
                    return (
                      <Tab
                        key={index}
                        label={seguimiento.rastra.code}
                        {...a11yProps(index)}
                        onClick={() => dispatch(setSeguimientoActual(index))}
                      />
                    );
                  })}
                </Tabs>
              </Box>
              {seguimientos.map((seguimiento, index) => {
                return (
                  <CustomTabPanel
                    value={seguimeintoActual || 0}
                    index={index}
                    key={seguimiento.id}
                  >
                    <CheckForm
                      seguimiento={seguimiento}
                      indice={index}
                      disable={false}
                      openClaim={()=> setClaimOpen(true)}
                    />
                  </CustomTabPanel>
                );
              })}
            </Box>
          </Grid>
          {seguimientos.length > 0 && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
              </Grid>
              <Grid
                item
                xs={12}
                md={3}
                lg={3}
                xl={2}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button
                  variant="contained"
                  color="error"
                  size="medium"
                  fullWidth
                  onClick={handleClickDelete}
                  startIcon={
                    <DeleteTwoToneIcon color="inherit" fontSize="small" />
                  }
                >
                  <Typography
                    variant="body2"
                    component="span"
                    fontWeight={400}
                    color={"gray.700"}
                  >
                    {"Eliminar"}
                  </Typography>
                </Button>
              </Grid>
              <Grid item xs={12} md={3} lg={3} xl={6}></Grid>
              <Grid
                item
                xs={12}
                md={3}
                lg={3}
                xl={2}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  size="medium"
                  fullWidth
                  onClick={handleClickPending}
                  startIcon={
                    <PausePresentationTwoToneIcon color="inherit" fontSize="small" />
                  }
                >
                  <Typography
                    variant="body2"
                    component="span"
                    fontWeight={400}
                    color={"gray.700"}
                  >
                    Pendiente
                  </Typography>
                </Button>
              </Grid>
              <Grid
                item
                xs={12}
                md={3}
                lg={3}
                xl={2}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button
                  variant="contained"
                  color="success"
                  size="medium"
                  fullWidth
                  onClick={handleClickCompletar}
                  endIcon={
                    <CheckBoxTwoToneIcon color="inherit" fontSize="small" />
                  }
                >
                  <Typography
                    variant="body2"
                    component="span"
                    fontWeight={400}
                    color={"gray.700"}
                  >
                    Completar
                  </Typography>
                </Button>
              </Grid>
              <Grid item xs={12} sx={{ marginTop: 5 }}></Grid>
            </>
          )}
        </Grid>
      </Container>
    </>
  );
};
