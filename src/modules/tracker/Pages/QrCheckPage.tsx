import { FunctionComponent } from "react";
import { CheckForm } from "../components/CheckForm";
import { useGetTrackerByIdQuery } from "../../../store/seguimiento/trackerApi";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { parseTrackerSeguimiento } from "../../../store/seguimiento/trackerThunk";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import {
  Container,
  Divider,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

interface QRCheckPageProps {}

const QRCheckPage: FunctionComponent<QRCheckPageProps> = () => {
  const [searchParams] = useSearchParams();

  // query params tracker_id

  const tracker_id = searchParams.get('tracker_id');
  const navigate = useNavigate();
  const { data, error, isLoading } = useGetTrackerByIdQuery(tracker_id || skipToken, {
    skip: !tracker_id,
  });

  if (isLoading) return <div>Cargando...</div>;
  if (error || !data) return <Navigate to="/tracker/manage" />;
  return (
    <Container maxWidth="xl" sx={{ marginTop: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} display={"flex"} alignContent={"center"}>
          <IconButton onClick={() => navigate(-1)} title="Regresar">
            <ArrowBack color="primary" fontSize="medium" />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight={400}>
            TRK-{tracker_id?.padStart(5, "0")}
          </Typography>
          <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
        </Grid>
        <Grid item xs={12}>
          <CheckForm
            disable={true}
            indice={0}
            seguimiento={parseTrackerSeguimiento(data)}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default QRCheckPage;
