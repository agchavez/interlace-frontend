import { Box, Typography, Divider } from '@mui/material';

const AppFooter = () => {
  const projectName = import.meta.env.VITE_JS_APP_NAME;
  const projectVersion = import.meta.env.VITE_JS_APP_VERSION;
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 1,
        px: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1
      }}
    >
        <Divider orientation="vertical" flexItem />

        <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={300}
      >
        © {currentYear} {projectName || 'Interlace'} - Todos los derechos reservados
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={300}
        >
          Versión {projectVersion || '1.0.0'}
        </Typography>
        <Divider orientation="vertical" flexItem />

      </Box>
    </Box>
  );
};

export default AppFooter;

