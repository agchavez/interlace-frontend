import {
  Container,
  Typography,
  Grid,
  Divider,
  Box,
  Tabs,
  Tab,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { useSearchParams } from "react-router-dom";
import FloatLoading from "../../tracker/components/FloatLoading";
import { ClaimCard } from "../components/ClaimCard";
// import { useGetDriverQuery } from "../../../store/maintenance/maintenanceApi";
import {getAllClaims, getClaimById} from "../../../store/claim/claimThunks.ts";
import ArchivoModal from "../components/ClaimDetail.tsx";


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

export const ClaimReviewPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [archivoOpen, setArchivoOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { claims, loading, selectedClaim } = useAppSelector((state) => state.claim);
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  // const { data: driverData, isLoading: loadingDriver } = useGetDriverQuery({
  //   id: selectedClaim?.tracking?.driver !== null ? selectedClaim?.tracking?.driver : undefined,
  //   limit: 1,
  //   offset: 0,
  // });

  const handleChangeTab = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    if (id) {
      dispatch(getClaimById(Number(id)));
    }
  }, [id, dispatch]);

  // const handleDownloadArchivo = () => {
  //   if (selectedClaim?.tracking?.id) {
  //     // Implement download functionality
  //   }
  // };

  useEffect(() => {
    dispatch(getAllClaims({}))
  }, []);

  return (
    <>
      {archivoOpen && selectedClaim?.tracking && (
        <ArchivoModal
          open={archivoOpen}
          handleClose={() => setArchivoOpen(false)}
          seguimiento={selectedClaim.tracking}
        />
      )}
      <Container maxWidth="xl">
        <Grid container spacing={1} sx={{ marginTop: 2 }}>
          <Grid item xs={12}>
            <Typography variant="h5" component="h1" fontWeight={400}>
              Revisión de Reclamos
            </Typography>
            <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
          </Grid>
          <FloatLoading visible={loading} />

          <Grid item xs={12} md={8} lg={9} xl={10}>
            {selectedClaim && (
              <Typography variant="h6" sx={{ mt: 1 }}>
                Reclamo #{selectedClaim.id} - Tracking TRK-{selectedClaim.tracking?.id?.toString().padStart(5, '0')}
              </Typography>
            )}
          </Grid>


          {claims.length > 0 && (
            <Grid item xs={12}>
              <Box sx={{ width: "100%" }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={activeTab}
                    onChange={handleChangeTab}
                    aria-label="claim tabs"
                  >
                    {claims.map((claim, index) => (
                      <Tab
                        key={index}
                        label={`Reclamo #${claim.id}`}
                        {...a11yProps(index)}
                      />
                    ))}
                  </Tabs>
                </Box>

                {claims.map((claim, index) => (
                  <CustomTabPanel
                    value={activeTab}
                    index={index}
                    key={claim.id}
                  >
                    <ClaimCard claim={{
                      id: claim.id,
                      tracking_id: claim.tracker,
                      trailer: claim.tracking?.trailer.toString() || "",
                      distributor_center: claim.tracking?.distributor_center.toString() || "",
                      created_at: claim.created_at,
                      status: claim.status,
                      reason: claim.description,
                      is_archivo_up: claim.claim_file !== null,
                      archivo_name: claim.claim_file?.name,
                    }} />
                  </CustomTabPanel>
                ))}
              </Box>
            </Grid>
          )}

          {selectedClaim && (
            <>
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Divider />
              </Grid>

              <Grid item xs={12} md={4} lg={3} xl={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="medium"
                  fullWidth
                  onClick={() => setArchivoOpen(true)}
                >
                  <Typography variant="body2" component="span" fontWeight={400} color="gray.700">
                    Ver Archivos
                  </Typography>
                </Button>
              </Grid>

              <Grid item xs={12} md={4} lg={3} xl={8}></Grid>

              <Grid item xs={12} md={4} lg={3} xl={2}>
                <Button
                  variant="contained"
                  color="success"
                  size="medium"
                  fullWidth
                  onClick={() => {/* Implementation for claim approval */}}
                >
                  <Typography variant="body2" component="span" fontWeight={400} color="gray.700">
                    Aprobar Reclamo
                  </Typography>
                </Button>
              </Grid>
            </>
          )}

          {!selectedClaim && !loading && (
            <Grid item xs={12} sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="h6" color="textSecondary">
                Seleccione un reclamo para revisar o ingrese un ID en la URL
              </Typography>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
};