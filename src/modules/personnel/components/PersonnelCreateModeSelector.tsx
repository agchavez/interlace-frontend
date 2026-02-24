import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
} from '@mui/material';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BootstrapDialogTitle from '../../ui/components/BootstrapDialogTitle';

type CreateMode = 'personnel_only' | 'existing_user' | 'new_user';

interface Props {
  open: boolean;
  onClose: () => void;
  onModeSelect: (mode: CreateMode) => void;
}

interface ModeOption {
  mode: CreateMode;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  gradient: string;
}

export const PersonnelCreateModeSelector: React.FC<Props> = ({ open, onClose, onModeSelect }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const modes: ModeOption[] = [
    {
      mode: 'personnel_only',
      icon: <PersonOffIcon sx={{ fontSize: 80 }} />,
      title: 'Solo Personal',
      description: 'Crear un registro de personal sin acceso al sistema. Ideal para empleados operativos.',
      color: theme.palette.info.main,
      gradient: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`,
    },
    {
      mode: 'existing_user',
      icon: <PersonSearchIcon sx={{ fontSize: 80 }} />,
      title: 'Vincular Usuario Existente',
      description: 'Buscar un usuario del sistema y crear su perfil de personal. Los datos se auto-completarán.',
      color: theme.palette.success.main,
      gradient: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
    },
    {
      mode: 'new_user',
      icon: <PersonAddIcon sx={{ fontSize: 80 }} />,
      title: 'Crear Usuario Nuevo',
      description: 'Registrar un nuevo usuario y su perfil de personal. Tendrá acceso completo al sistema.',
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
    },
  ];

  const handleSelect = (mode: CreateMode) => {
    onModeSelect(mode);
    // Don't close here - let parent component handle closing after mode is selected
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          background: `linear-gradient(145deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        },
      }}
    >
      <BootstrapDialogTitle id="mode-selector-dialog-title" onClose={onClose}>
        <Typography variant="h6" fontWeight={600} color={'#fff'}>
          Crear Nuevo Personal
        </Typography>
      </BootstrapDialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 4, md: 6 } }}>
        <Fade in={open} timeout={500}>
          <Box>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 5 } }}>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                Selecciona el tipo de registro que deseas crear
              </Typography>
            </Box>

            {/* Mode Cards */}
            <Grid container spacing={{ xs: 2, md: 4 }}>
              {modes.map((option, index) => (
                <Grid item xs={12} md={4} key={option.mode}>
                  <Zoom in={open} timeout={500 + index * 200}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        border: `2px solid ${theme.palette.divider}`,
                        borderRadius: 4,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: theme.palette.background.paper,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: option.gradient,
                          transform: 'scaleX(0)',
                          transformOrigin: 'left',
                          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        },
                        '&:hover': {
                          transform: 'translateY(-12px)',
                          boxShadow: `0 12px 40px -10px ${option.color}40`,
                          borderColor: option.color,
                          '&::before': {
                            transform: 'scaleX(1)',
                          },
                          '& .mode-icon': {
                            transform: 'scale(1.15)',
                            color: option.color,
                          },
                          '& .mode-title': {
                            color: option.color,
                          },
                          '& .arrow-icon': {
                            transform: 'translateX(8px)',
                            opacity: 1,
                          },
                        },
                      }}
                    >
                      <CardActionArea
                        onClick={() => handleSelect(option.mode)}
                        sx={{ height: '100%', p: 0 }}
                      >
                        <CardContent sx={{ p: 4, textAlign: 'center', minHeight: 320 }}>
                          {/* Icon */}
                          <Box
                            className="mode-icon"
                            sx={{
                              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                              display: 'inline-block',
                              color: theme.palette.text.secondary,
                              mb: 3,
                            }}
                          >
                            {option.icon}
                          </Box>

                          {/* Title */}
                          <Typography
                            className="mode-title"
                            variant="h5"
                            fontWeight={700}
                            gutterBottom
                            sx={{
                              transition: 'color 0.3s ease',
                              mb: 2,
                            }}
                          >
                            {option.title}
                          </Typography>

                          {/* Description */}
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 3,
                              lineHeight: 1.7,
                              minHeight: 60,
                            }}
                          >
                            {option.description}
                          </Typography>

                          {/* Action */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1,
                              mt: 'auto',
                              pt: 2,
                            }}
                          >
                            <Typography
                              variant="button"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.875rem',
                              }}
                            >
                              Seleccionar
                            </Typography>
                            <ArrowForwardIcon
                              className="arrow-icon"
                              sx={{
                                transition: 'all 0.3s ease',
                                opacity: 0.6,
                                fontSize: '1.25rem',
                              }}
                            />
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: { xs: 3, md: 4 } }}>
              <Typography variant="caption" color="text.secondary">
                Puedes cambiar esta configuración después en el perfil del empleado
              </Typography>
            </Box>
          </Box>
        </Fade>
      </DialogContent>
    </Dialog>
  );
};
