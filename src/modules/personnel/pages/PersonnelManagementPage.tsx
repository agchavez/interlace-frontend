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
  Card,
  CardContent,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useState } from "react";
import PostAddTwoToneIcon from "@mui/icons-material/PostAddTwoTone";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import PersonOffTwoToneIcon from "@mui/icons-material/PersonOffTwoTone";
import VisibilityTwoToneIcon from "@mui/icons-material/VisibilityTwoTone";
import BadgeIcon from "@mui/icons-material/Badge";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useNavigate } from "react-router-dom";
import { useGetPersonnelProfilesQuery } from "../services/personnelApi";
import type { PersonnelProfileList } from "../../../interfaces/personnel";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
      id={`personnel-tabpanel-${index}`}
      aria-labelledby={`personnel-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `personnel-tab-${index}`,
    "aria-controls": `personnel-tabpanel-${index}`,
  };
}

export const PersonnelManagementPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [activeTab, setActiveTab] = useState(0);
  const [showActions, setShowActions] = useState(false);

  // Obtener personal activo
  const { data, isLoading, isFetching } = useGetPersonnelProfilesQuery({
    is_active: true,
    limit: 50,
    offset: 0,
  });

  const personnelList = data?.results || [];

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreatePersonnel = () => {
    navigate("/personnel/create");
  };

  const handleEditCurrent = () => {
    if (personnelList[activeTab]) {
      navigate(`/personnel/detail/${personnelList[activeTab].id}`);
    }
  };

  const handleViewDetails = () => {
    if (personnelList[activeTab]) {
      navigate(`/personnel/profile/${personnelList[activeTab].id}`);
    }
  };

  const handleDoubleClick = (personId: number) => {
    navigate(`/personnel/profile/${personId}`);
  };

  const handleDeactivate = () => {
    // TODO: Implementar lógica de desactivación
    console.log("Desactivar personal", personnelList[activeTab]);
  };

  useEffect(() => {
    setShowActions(personnelList.length > 0);
  }, [personnelList]);

  const renderPersonnelDetails = (person: PersonnelProfileList) => {
    return (
      <Grid container spacing={3}>
        {/* Header Card */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
                <Avatar
                  sx={{
                    width: { xs: 60, sm: 80 },
                    height: { xs: 60, sm: 80 },
                    bgcolor: "primary.main",
                    fontSize: { xs: "1.5rem", sm: "2rem" },
                  }}
                >
                  {person.full_name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 700, mb: 0.5 }}>
                    {person.full_name}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                    <Chip
                      label={person.employee_code}
                      icon={<BadgeIcon />}
                      size="small"
                      color="primary"
                    />
                    <Chip
                      label={person.hierarchy_level_display}
                      size="small"
                      color="secondary"
                    />
                    <Chip
                      label={person.is_active ? "Activo" : "Inactivo"}
                      size="small"
                      color={person.is_active ? "success" : "default"}
                    />
                    {person.has_system_access && (
                      <Chip label="Acceso al sistema" size="small" variant="outlined" />
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Información Básica */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                <BadgeIcon color="primary" />
                Información Básica
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                    Email:
                  </Typography>
                  <Typography variant="body2">{person.email || "N/A"}</Typography>
                </Box>
                {person.username && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BadgeIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                      Usuario:
                    </Typography>
                    <Typography variant="body2">{person.username}</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Información Organizacional */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                <BusinessIcon color="primary" />
                Organización
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <BusinessIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                    Centro:
                  </Typography>
                  <Typography variant="body2">{person.center_name}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <WorkIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                    Área:
                  </Typography>
                  <Typography variant="body2">{person.area_name}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Información Laboral */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                <WorkIcon color="primary" />
                Información Laboral
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <WorkIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                    Posición:
                  </Typography>
                  <Typography variant="body2">{person.position}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <WorkIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                    Tipo:
                  </Typography>
                  <Typography variant="body2">{person.position_type_display}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarTodayIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                    Ingreso:
                  </Typography>
                  <Typography variant="body2">
                    {format(new Date(person.hire_date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarTodayIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                    Antigüedad:
                  </Typography>
                  <Typography variant="body2">
                    {person.years_of_service} {person.years_of_service === 1 ? "año" : "años"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Estadísticas */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Estadísticas
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Personal Supervisado:
                  </Typography>
                  <Chip label={person.supervised_personnel_count || 0} size="small" color="primary" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Container maxWidth="xl">
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        <Grid item xs={12}>
          <Typography variant="h5" component="h1" fontWeight={400}>
            Gestión de Personal - Activos
          </Typography>
          <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
        </Grid>

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
            disabled={isLoading || isFetching}
            startIcon={
              isLoading || isFetching ? (
                <CircularProgress size={20} />
              ) : (
                <PostAddTwoToneIcon color="inherit" fontSize="small" />
              )
            }
            onClick={handleCreatePersonnel}
          >
            <Typography
              variant="body2"
              component="span"
              fontWeight={400}
              color={"gray.700"}
            >
              {isLoading ? "Cargando..." : "Nuevo Personal"}
            </Typography>
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              {personnelList.length > 0 ? (
                <Tabs
                  value={activeTab}
                  onChange={handleChange}
                  variant={isMobile ? "scrollable" : "scrollable"}
                  scrollButtons="auto"
                  aria-label="personnel tabs"
                >
                  {personnelList.map((person, index) => (
                    <Tab
                      key={person.id}
                      label={`${person.employee_code} - ${person.full_name}`}
                      {...a11yProps(index)}
                      onDoubleClick={() => handleDoubleClick(person.id)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    />
                  ))}
                </Tabs>
              ) : (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Typography variant="body1" color="text.secondary">
                    {isLoading ? "Cargando personal..." : "No hay personal activo"}
                  </Typography>
                </Box>
              )}
            </Box>

            {personnelList.map((person, index) => (
              <CustomTabPanel value={activeTab} index={index} key={person.id}>
                {renderPersonnelDetails(person)}
              </CustomTabPanel>
            ))}
          </Box>
        </Grid>

        {showActions && (
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
                onClick={handleDeactivate}
                startIcon={<PersonOffTwoToneIcon color="inherit" fontSize="small" />}
              >
                <Typography
                  variant="body2"
                  component="span"
                  fontWeight={400}
                  color={"gray.700"}
                >
                  Desactivar
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
                color="info"
                size="medium"
                fullWidth
                onClick={handleViewDetails}
                startIcon={<VisibilityTwoToneIcon color="inherit" fontSize="small" />}
              >
                <Typography
                  variant="body2"
                  component="span"
                  fontWeight={400}
                  color={"gray.700"}
                >
                  Ver Detalles
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
                onClick={handleEditCurrent}
                endIcon={<EditTwoToneIcon color="inherit" fontSize="small" />}
              >
                <Typography
                  variant="body2"
                  component="span"
                  fontWeight={400}
                  color={"gray.700"}
                >
                  Editar
                </Typography>
              </Button>
            </Grid>
            <Grid item xs={12} sx={{ marginTop: 5 }}></Grid>
          </>
        )}
      </Grid>
    </Container>
  );
};
