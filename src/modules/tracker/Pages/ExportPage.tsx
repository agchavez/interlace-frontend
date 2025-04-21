// ReportExportPage.tsx
import React, { useState } from "react";
import {
  Container,
  Typography,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Drawer,
  IconButton,
  CircularProgress,
  CardMedia,
  Paper,
  useTheme,
  alpha,
  Fade,
  Snackbar,
  Alert,
} from "@mui/material";
import FilterListTwoToneIcon from "@mui/icons-material/FilterListTwoTone";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, Controller } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import { isValid } from "date-fns";
import { useAppSelector } from "../../../store";

interface ReportForm {
  date_start: string;
  date_end: string;
}

export function ReportExportPage() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const theme = useTheme();
  
  const softPrimary = alpha(theme.palette.primary.main, 0.85);
  
  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight="500" mb={1}>
          Exportación de Datos
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={2}>
          Selecciona el tipo de reporte que deseas exportar
        </Typography>
        <Divider />
      </Box>

      <Fade in={true} timeout={800}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              elevation={2}
              sx={{
                height: '100%', 
                borderRadius: 3,
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                boxShadow: '0 8px 20px -12px rgba(0,0,0,0.2)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 14px 28px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardMedia
                sx={{ 
                  height: 160,
                  background: `linear-gradient(135deg, ${softPrimary} 0%, ${theme.palette.primary.main} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DescriptionOutlinedIcon sx={{ fontSize: 80, color: 'white', opacity: 0.85 }} />
              </CardMedia>
              <CardContent sx={{ pt: 3, pb: 2 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Reporte de Trackers
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Exporta los datos de trackers en un rango de fechas específico en formato Excel.
                  Incluye toda la información necesaria para tus análisis y reportes.
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 3 }}>
                <Button
                  startIcon={<FilterListTwoToneIcon />}
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => setOpenDrawer(true)}
                  sx={{ 
                    borderRadius: 6,
                    py: 1.2,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${softPrimary} 100%)`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                    }
                  }}
                >
                  Seleccionar Fechas
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Fade>

      <ExportDrawer open={openDrawer} onClose={() => setOpenDrawer(false)} />
    </Container>
  );
}

const ExportDrawer: React.FC<{ open: boolean; onClose: () => void }> = ({
    open,
    onClose,
  }) => {
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const theme = useTheme();
    const token = useAppSelector((state) => state.auth.token);
    const { control, handleSubmit } = useForm<ReportForm>({
      defaultValues: { date_start: "", date_end: "" },
    });
  
    const onSubmit = async (data: ReportForm) => {
      setLoading(true);
      const { date_start, date_end } = data;
      const API_URL = import.meta.env.VITE_JS_APP_API_URL || 'http://127.0.0.1:8000';
      
      const url = `${API_URL}/api/tracker/report/?date_start=${date_start}&date_end=${date_end}`;
      
      try {
        const response = await fetch(url, { method: "GET", headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) {
          throw new Error("Error al generar el reporte");
        }
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `reporte_trackers_${date_start}_a_${date_end}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        
        setNotification({
          open: true,
          message: 'Reporte descargado correctamente',
          severity: 'success'
        });
        
        setTimeout(() => {
          onClose();
        }, 500);
      } catch (err) {
        console.error(err);
        setNotification({
          open: true,
          message: 'No se pudo descargar el reporte. Intente nuevamente.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    const handleCloseAlert = () => {
      setNotification({...notification, open: false});
    };
  
    // Helper function to ensure dates are handled correctly
    const formatDateWithoutTimezoneOffset = (date: Date | null): string => {
      if (!date || !isValid(date)) return '';
      
      // Get year, month, day components and create a date string
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    };
  
    return (
      <>
        <Drawer 
          anchor="right" 
          open={open} 
          onClose={() => !loading && onClose()}
          PaperProps={{
            sx: { 
              borderTopLeftRadius: 16, 
              borderBottomLeftRadius: 16,
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            }
          }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              width: 400, 
              p: 4, 
              height: '100%', 
              position: 'relative',
              background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.8)}, ${theme.palette.background.paper})`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Typography variant="h5" fontWeight={500}>
                Exportar Reporte
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => !loading && onClose()}
                disabled={loading}
                sx={{ 
                  color: 'grey.600',
                  bgcolor: 'grey.100',
                  '&:hover': {
                    bgcolor: 'grey.200'
                  }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 4 }} />
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Selecciona el rango de fechas para exportar los datos en un archivo Excel.
            </Typography>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <Typography variant="subtitle2" gutterBottom sx={{ ml: 0.5 }}>
                Período de tiempo
              </Typography>
              <Controller
                name="date_start"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Fecha Inicio"
                    slotProps={{ 
                      textField: { 
                        size: "medium", 
                        fullWidth: true,
                        sx: { mb: 3 },
                        variant: "outlined"
                      }
                    }}
                    value={
                      isValid(new Date(field.value))
                        ? new Date(field.value)
                        : null
                    }
                    onChange={(date) => {
                      if (date && isValid(date)) {
                        // Use the helper function to prevent timezone issues
                        field.onChange(formatDateWithoutTimezoneOffset(date));
                      }
                    }}
                    format="dd/MM/yyyy"
                    disabled={loading}
                  />
                )}
              />
              <Controller
                name="date_end"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Fecha Fin"
                    slotProps={{ 
                      textField: { 
                        size: "medium", 
                        fullWidth: true,
                        variant: "outlined"
                      } 
                    }}
                    value={
                      isValid(new Date(field.value))
                        ? new Date(field.value)
                        : null
                    }
                    onChange={(date) => {
                      if (date && isValid(date)) {
                        // Use the helper function to prevent timezone issues
                        field.onChange(formatDateWithoutTimezoneOffset(date));
                      }
                    }}
                    format="dd/MM/yyyy"
                    disabled={loading}
                  />
                )}
              />
              <Box sx={{ mt: 5 }}>
                <Button
                  startIcon={loading ? null : <CloudDownloadIcon />}
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  sx={{ 
                    py: 1.5,
                    borderRadius: 8,
                    position: 'relative',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 6px 15px rgba(0,0,0,0.25)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Exportar Excel"
                  )}
                </Button>
              </Box>
              <Box sx={{ mt: 1 }}>
                <Button 
                  fullWidth 
                  variant="text" 
                  onClick={() => !loading && onClose()} 
                  disabled={loading}
                  sx={{ mt: 1 }}
                >
                  Cancelar
                </Button>
              </Box>
            </form>
          </Paper>
        </Drawer>
        
        <Snackbar 
          open={notification.open} 
          autoHideDuration={6000} 
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseAlert} 
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </>
    );
  };

export default ReportExportPage;