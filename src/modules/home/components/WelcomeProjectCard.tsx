import { Card, Typography, Divider, Box, Chip } from '@mui/material';
import image from '../../../assets/layout.png';
import { useAppSelector } from '../../../store';

const WelcomeProjectCard = () => {
  const { user } = useAppSelector(state => state.auth);
  const projectName = import.meta.env.VITE_JS_APP_NAME;
  const projectVersion = import.meta.env.VITE_JS_APP_VERSION;

  return (
    <Card elevation={1} sx={{
      p: 2,
      borderRadius: 2,
      height: '100%',
      background: 'linear-gradient(135deg, #ffffff 0%, #1976d2 100%)',
      backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(25,118,210,0.1) 100%)'
    }}>
      <Box sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: '100%',
        flexWrap: 'wrap',
        gap: 2
      }}>
        {/* Imagen principal */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img src={image} alt="layout" width={40} style={{ marginRight: '16px' }} />
        </Box>

        {/* Información de bienvenida */}
        <Box sx={{ flex: 1, minWidth: '200px' }}>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={300}
            sx={{ mb: 0.5 }}
          >
            Bienvenido(a)
          </Typography>
          <Typography
            variant="h6"
            color="secondary"
            fontWeight={500}
            sx={{ lineHeight: 1.2 }}
          >
            {user?.first_name} {user?.last_name}
          </Typography>
        </Box>

        {/* Divisor */}
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Información del sistema */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={300}
            >
              Sistema:
            </Typography>
            <Typography
              variant="subtitle1"
              color="primary"
              fontWeight={600}
              sx={{ lineHeight: 1.2 }}
            >
              {projectName || 'Tracker'}
            </Typography>
          </Box>
        </Box>

        {/* Chip de versión */}
        <Box>
          <Chip
            label={`v${projectVersion || '1.0.0'}`}
            variant="outlined"
            color="primary"
            size="small"
            sx={{
              fontWeight: 500,
              fontSize: '0.75rem'
            }}
          />
        </Box>
      </Box>
    </Card>
  );
};

export default WelcomeProjectCard;
