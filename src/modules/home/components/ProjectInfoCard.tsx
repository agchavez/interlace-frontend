import { Card, Typography, Divider, Box } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const ProjectInfoCard = () => {
  const projectName = import.meta.env.VITE_JS_APP_NAME;
  const projectVersion = import.meta.env.VITE_JS_APP_VERSION;

  return (
    <Card elevation={0} sx={{
      p: 2,
      borderRadius: 2,
      backgroundColor: '#f8f9fa',
      height: '100%'
    }}>
      <Box sx={{ display: "flex", alignItems: "center", height: '100%' }}>
        <Box>
          <InfoOutlinedIcon color="primary" sx={{ fontSize: 40 }} />
        </Box>
        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
        <Box>
          <Typography
            variant="body2"
            component="h6"
            style={{ textAlign: "start" }}
            color="text.secondary"
            fontWeight={300}
          >
            Sistema
          </Typography>
          <Divider />
          <Typography
            variant="h6"
            component="p"
            style={{ textAlign: "start" }}
            color="primary"
            fontWeight={500}
          >
            {projectName || 'Tracker'}
          </Typography>
          <Typography
            variant="body2"
            component="p"
            style={{ textAlign: "start" }}
            color="text.secondary"
            fontWeight={300}
          >
            Versión {projectVersion || '1.0.0'}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default ProjectInfoCard;

