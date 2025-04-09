import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Grid,
  CircularProgress,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import ImageTwoToneIcon from '@mui/icons-material/ImageTwoTone';
import ReceiptTwoToneIcon from '@mui/icons-material/ReceiptTwoTone';
import PhotoCameraTwoToneIcon from '@mui/icons-material/PhotoCameraTwoTone';
import AssignmentTurnedInTwoToneIcon from '@mui/icons-material/AssignmentTurnedInTwoTone';

import { toast } from "sonner";
import { Seguimiento } from "../../../store/seguimiento/seguimientoSlice";
import { useUploadFileMutation } from "../../../store/seguimiento/trackerApi";
import { ImagePreviewDropzone } from "../../ui/components/ImagePreviewDropzone";
import { PDFPreviewModal } from "../../ui/components/PDFPreviewModal";


interface TrackerFilesModalProps {
  open: boolean;
  onClose: () => void;
  tracker: Seguimiento;
  disable: boolean;
}
const TrackerFilesModal: React.FC<TrackerFilesModalProps> = ({
  open,
  onClose,
  tracker,
  disable,
}) => {
  const theme = useTheme();
  const [uploadFile, { isLoading: isUpdating }] = useUploadFileMutation();
  
  // States para file_1
  const [newFile1, setNewFile1] = useState<File | null>(null);
  const [deleteFile1, setDeleteFile1] = useState(false);

  // States para file_2
  const [newFile2, setNewFile2] = useState<File | null>(null);
  const [deleteFile2, setDeleteFile2] = useState(false);
  
  // Estado para preview de imágenes y PDF
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewPDF, setPreviewPDF] = useState<string | null>(null);

  // Determina si el archivo es un PDF
  const isPDF = (fileName: string) => {
    return fileName.toLowerCase().endsWith('.pdf');
  };

  useEffect(() => {
    if (open) {
      // Al abrir, reiniciamos flags
      setNewFile1(null);
      setDeleteFile1(false);
      setNewFile2(null);
      setDeleteFile2(false);
      setPreviewImage(null);
      setPreviewPDF(null);
    }
  }, [open]);

  // Si no hay tracker o ID, no renderizamos
  if (!tracker || !tracker.id) return null;

  const isImported = tracker.type === "IMPORT";
  
  // Obtener los nombres adecuados para los documentos según el tipo
  const getDocumentLabel = (docNum: number) => {
    if (isImported) {
      return docNum === 1 ? "Foto #1 - Gate Pass" : "Foto #2 - Factura";
    } else {
      return docNum === 1 ? "Documento" : "Documento";
    }
  };

  // Obtener el icono adecuado para cada documento
  const getDocumentIcon = (docNum: number) => {
    if (isImported) {
      return docNum === 1 ? 
        <AssignmentTurnedInTwoToneIcon color="primary" /> : 
        <ReceiptTwoToneIcon color="primary" />;
    } else {
      const fileData = docNum === 1 ? tracker.file_data_1 : tracker.file_data_2;
      if (!fileData) return <ImageTwoToneIcon color="primary" />;
      
      const fileName = fileData.name.toLowerCase();
      
      if (fileName.endsWith('.pdf')) {
        return <ReceiptTwoToneIcon color="primary" />;
      } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        return <AssignmentTurnedInTwoToneIcon color="primary" />;
      } else {
        return <ImageTwoToneIcon color="primary" />;
      }
    }
  };

  // Manejar descarga de archivos sin redireccionar
  const handleDownloadFile = (url: string, fileName: string) => {
    try {
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob);
          const element = document.createElement('a');
          element.href = blobUrl;
          element.download = fileName.split('/').pop() || 'archivo';
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          
          window.URL.revokeObjectURL(blobUrl);
          document.body.removeChild(element);
          toast.success(`Descargando ${fileName.split('/').pop()}`);
        })
        .catch(error => {
          console.error("Error al descargar con fetch:", error);
          fallbackDownload(url, fileName);
        });
    } catch (error) {
      console.error("Error al descargar archivo:", error);
      fallbackDownload(url, fileName);
    }
  };

  // Método alternativo de descarga como fallback
  const fallbackDownload = (url: string, fileName: string) => {
    try {
      const element = document.createElement('a');
      element.href = url;
      element.download = fileName.split('/').pop() || 'archivo';
      element.target = '_blank';
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success(`Descargando ${fileName.split('/').pop()}`);
    } catch (error) {
      console.error("Error en fallback de descarga:", error);
      toast.error("No se pudo descargar el archivo");
    }
  };

  // Función para previsualizar un archivo
  const handlePreviewFile = (url: string, fileName: string) => {
    if (isPDF(fileName)) {
      setPreviewPDF(url);
    } else {
      setPreviewImage(url);
    }
  };

  // Componente para previsualizar un archivo (imagen u otro tipo)
  const FilePreview: React.FC<{
    url: string;
    name: string;
    onRemove?: () => void;
  }> = ({ url, name, onRemove }) => {
    const fileName = name.split('/').pop() || '';
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
    const isPDFFile = isPDF(fileName);
    
    return (
      <Box
        sx={{
          position: "relative",
          border: "1px solid",
          borderColor: theme.palette.primary.light,
          borderRadius: 1,
          width: 140,
          height: 150,
          p: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 12px ${theme.palette.primary.light}20`,
        }}
      >
        {isImage ? (
          <Box
            sx={{
              width: '100%',
              height: '70%',
              position: 'relative',
              cursor: 'pointer',
              mb: 1,
              '&:hover .zoom-icon': {
                opacity: 1,
              }
            }}
            onClick={() => handlePreviewFile(url, fileName)}
          >
            <img
              src={url}
              alt={fileName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 4
              }}
            />
            <Box
              className="zoom-icon"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s',
                borderRadius: 4
              }}
            >
              <ZoomInIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '70%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
              backgroundColor: theme.palette.grey[100],
              borderRadius: 1,
              cursor: 'pointer',
            }}
            onClick={() => handlePreviewFile(url, fileName)}
          >
            {isPDFFile ? (
              <ReceiptTwoToneIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            ) : fileName.endsWith('.doc') || fileName.endsWith('.docx') ? (
              <AssignmentTurnedInTwoToneIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            ) : (
              <ImageTwoToneIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            )}
            <Typography variant="caption" sx={{ mt: 1, color: theme.palette.text.secondary }}>
              {fileName.split('.').pop()?.toUpperCase()}
            </Typography>
            
            <Box
              className="zoom-icon"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s',
                borderRadius: 1,
                '&:hover': {
                  opacity: 1,
                }
              }}
            >
              <ZoomInIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
          </Box>
        )}
        
        <Typography
          variant="caption"
          sx={{
            textAlign: "center",
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            width: '100%'
          }}
        >
          {fileName}
        </Typography>
        
        {!disable && onRemove && (
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              backgroundColor: theme.palette.background.paper,
              '&:hover': {
                backgroundColor: theme.palette.error.light+'20',
              }
            }}
            onClick={onRemove}
          >
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        )}
        
        {disable && (
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              backgroundColor: theme.palette.background.paper,
              '&:hover': {
                backgroundColor: theme.palette.primary.light+'20',
              }
            }}
            onClick={() => handleDownloadFile(url, name)}
          >
            <DownloadIcon fontSize="small" color="primary" />
          </IconButton>
        )}
      </Box>
    );
  };

  // Componente para previsualizar una imagen nueva
  const NewImagePreview: React.FC<{
    file: File;
    onRemove: () => void;
  }> = ({ file, onRemove }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    useEffect(() => {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }, [file]);

    return (
      <Box
        sx={{
          position: "relative",
          border: "1px solid",
          borderColor: theme.palette.success.light,
          borderRadius: 1,
          width: 140,
          height: 150,
          p: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 12px ${theme.palette.success.light}20`
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            backgroundColor: theme.palette.success.main,
            color: '#fff',
            fontSize: '0.7rem',
            px: 0.8,
            py: 0.1,
            borderBottomRightRadius: 6
          }}
        >
          Nuevo
        </Box>
        
        {previewUrl && !isPDF(file.name) ? (
          <Box
            sx={{
              width: '100%',
              height: '70%',
              position: 'relative',
              cursor: 'pointer',
              mb: 1
            }}
            onClick={() => previewUrl && setPreviewImage(previewUrl)}
          >
            <img
              src={previewUrl}
              alt={file.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 4
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '70%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
              backgroundColor: theme.palette.grey[100],
              borderRadius: 1,
            }}
          >
            {isPDF(file.name) ? (
              <ReceiptTwoToneIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />
            ) : file.name.endsWith('.doc') || file.name.endsWith('.docx') ? (
              <AssignmentTurnedInTwoToneIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />
            ) : (
              <ImageTwoToneIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />
            )}
            <Typography variant="caption" sx={{ mt: 1, color: theme.palette.text.secondary }}>
              {file.name.split('.').pop()?.toUpperCase()}
            </Typography>
          </Box>
        )}
        
        <Typography 
          variant="caption" 
          sx={{ 
            textAlign: "center", 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            width: '100%'
          }}
        >
          {file.name}
        </Typography>
        
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            backgroundColor: theme.palette.background.paper,
            '&:hover': {
              backgroundColor: theme.palette.error.light+'20',
            }
          }}
          onClick={onRemove}
        >
          <DeleteIcon fontSize="small" color="error" />
        </IconButton>
      </Box>
    );
  };

  // Componente para lugar vacío de imagen
  const EmptyImagePlaceholder: React.FC<{
    docNum: number;
  }> = ({ docNum }) => {
    return (
      <Box
        sx={{
          position: "relative",
          border: "1px dashed",
          borderColor: theme.palette.divider,
          borderRadius: 1,
          width: 140,
          height: 150,
          p: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: theme.palette.background.default
        }}
      >
        <PhotoCameraTwoToneIcon sx={{ fontSize: 40, color: theme.palette.text.disabled, mb: 1 }} />
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
          {isImported ? 
            (docNum === 1 ? "Sin Gate Pass" : "Sin Factura") : 
            "Sin documento"}
        </Typography>
      </Box>
    );
  };

  // Componente para imagen que será eliminada
  const DeletedImagePlaceholder: React.FC<{
    name: string;
    onCancel: () => void;
  }> = ({ name, onCancel }) => {
    return (
      <Box
        sx={{
          position: "relative",
          border: "1px dashed",
          borderColor: theme.palette.error.main,
          borderRadius: 1,
          width: 140,
          height: 150,
          p: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: theme.palette.error.light+'10'
        }}
      >
        <DeleteIcon color="error" sx={{ fontSize: 36, mb: 1 }} />
        <Typography variant="caption" color="error" align="center">
          Se eliminará
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            width: '100%',
            mt: 0.5
          }}
        >
          {name}
        </Typography>
        <Button 
          size="small" 
          sx={{ mt: 1 }} 
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </Box>
    );
  };

  // Manejadores de inputs (selección de archivo)
  const handleSelectFile1 = (file: File | null) => {
    if (disable || !file) return;
    setNewFile1(file);
    setDeleteFile1(false);
  };
  
  const handleRemoveFile1 = () => {
    if (disable) return;
    setDeleteFile1(true);
    setNewFile1(null);
  };

  const handleSelectFile2 = (file: File | null) => {
    if (disable || !file) return;
    setNewFile2(file);
    setDeleteFile2(false);
  };
  
  const handleRemoveFile2 = () => {
    if (disable) return;
    setDeleteFile2(true);
    setNewFile2(null);
  };

  // Al guardar => FormData + patch
  const handleSave = async () => {
    try {
      const fd = new FormData();

      // file_1
      if (newFile1) {
        fd.append("file_1", newFile1);
      }
      if (deleteFile1) {
        fd.append("delete_file_1", "true");
      }

      // file_2
      if (newFile2) {
        fd.append("file_2", newFile2);
      }
      if (deleteFile2) {
        fd.append("delete_file_2", "true");
      }

      await uploadFile({ trackerId: tracker.id, formData: fd }).unwrap();
      toast.success(isImported ? "Fotografías actualizadas correctamente" : "Documentos actualizados correctamente");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar archivos");
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: theme.palette.secondary.main,
          color: 'white',
          padding: 1,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhotoCameraTwoToneIcon />
            <Typography variant="h6">
              {isImported ? "Fotografías de importación" : "Documentos"} - TRK-{tracker.id?.toString().padStart(5, "0")}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 500 }}>
            {disable ? (
              isImported 
                ? "Visualización de fotografías de Gate Pass y Factura para este tracker de importación." 
                : "Visualización de documentos asociados a este tracker."
            ) : (
              isImported 
                ? "Gestione las fotografías de Gate Pass y Factura para este tracker de importación."
                : "Utilice esta sección para subir, ver o eliminar documentos asociados a este tracker."
            )}
          </Typography>
          
          <Grid container spacing={3}>
            {/* Documento 1 */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  minHeight: 280,
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      pb: 1,
                      borderBottom: '1px solid',
                      borderColor: theme.palette.divider
                    }}
                  >
                    {getDocumentIcon(1)}
                    {getDocumentLabel(1)}
                  </Typography>
                  
                  <Box sx={{ display: "flex", justifyContent: 'center', mb: 2, minHeight: 150 }}>
                    {!disable && newFile1 ? (
                      <NewImagePreview file={newFile1} onRemove={() => setNewFile1(null)} />
                    ) : !disable && deleteFile1 && tracker.file_data_1 ? (
                      <DeletedImagePlaceholder 
                        name={tracker.file_data_1.name} 
                        onCancel={() => setDeleteFile1(false)} 
                      />
                    ) : tracker.file_data_1 ? (
                      <FilePreview 
                        url={tracker.file_data_1.access_url} 
                        name={tracker.file_data_1.name}
                        onRemove={!disable ? handleRemoveFile1 : undefined}
                      />
                    ) : (
                      <EmptyImagePlaceholder docNum={1} />
                    )}
                  </Box>
                </Box>
                
                {!disable && !deleteFile1 && !newFile1 && (
                  <Box sx={{ mt: 2 }}>
                    <ImagePreviewDropzone
                      files={[]}
                      onFilesChange={(files) => handleSelectFile1(files[0] || null)}
                      label="Seleccionar un documento"
                      accept={isImported ? 
                        { 'image/*': ['.jpg', '.jpeg', '.png'] } : 
                        {
                          'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
                          'application/pdf': ['.pdf'],
                          'application/msword': ['.doc'],
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                        }
                      }
                      maxFiles={1}
                      sxDrop={{ height: 80 }}
                    />
                  </Box>
                )}
                
                {!disable && (newFile1 || deleteFile1) && (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mt: 'auto', 
                      pt: 2, 
                      color: deleteFile1 ? 'error.main' : 'success.main',
                      borderTop: '1px solid',
                      borderColor: theme.palette.divider
                    }}
                  >
                    {deleteFile1 ? (
                      <>
                        <DeleteIcon fontSize="small" color="error" />
                        <Typography variant="body2" color="error.main">
                          El archivo será eliminado al guardar
                        </Typography>
                      </>
                    ) : (
                      <>
                        <CheckCircleTwoToneIcon fontSize="small" color="success" />
                        <Typography variant="body2" color="success.main">
                          Nuevo documento listo para subir
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
                
                {disable && tracker.file_data_1 && (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mt: 'auto', 
                      pt: 2, 
                      borderTop: '1px solid',
                      borderColor: theme.palette.divider
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Haga clic para previsualizar o use el botón de descarga.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
            
            {/* Documento 2 - Solo para importación */}
            {isImported && <Grid item xs={12} md={6}>
              <Box
                sx={{
                  minHeight: 280,
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      pb: 1,
                      borderBottom: '1px solid',
                      borderColor: theme.palette.divider
                    }}
                  >
                    {getDocumentIcon(2)}
                    {getDocumentLabel(2)}
                  </Typography>
                  
                  <Box sx={{ display: "flex", justifyContent: 'center', mb: 2, minHeight: 150 }}>
                    {!disable && newFile2 ? (
                      <NewImagePreview file={newFile2} onRemove={() => setNewFile2(null)} />
                    ) : !disable && deleteFile2 && tracker.file_data_2 ? (
                      <DeletedImagePlaceholder 
                        name={tracker.file_data_2.name} 
                        onCancel={() => setDeleteFile2(false)} 
                      />
                    ) : tracker.file_data_2 ? (
                      <FilePreview 
                        url={tracker.file_data_2.access_url} 
                        name={tracker.file_data_2.name}
                        onRemove={!disable ? handleRemoveFile2 : undefined}
                      />
                    ) : (
                      <EmptyImagePlaceholder docNum={2} />
                    )}
                  </Box>
                </Box>
                
                {!disable && !deleteFile2 && !newFile2 && (
                  <Box sx={{ mt: 2 }}>
                    <ImagePreviewDropzone
                      files={[]}
                      onFilesChange={(files) => handleSelectFile2(files[0] || null)}
                      label="Seleccionar un documento"
                      accept={isImported ? 
                        { 'image/*': ['.jpg', '.jpeg', '.png'] } : 
                        {
                          'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
                          'application/pdf': ['.pdf'],
                          'application/msword': ['.doc'],
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                        }
                      }
                      maxFiles={1}
                      sxDrop={{ height: 80 }}
                    />
                  </Box>
                )}
                
                {!disable && (newFile2 || deleteFile2) && (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mt: 'auto', 
                      pt: 2, 
                      color: deleteFile2 ? 'error.main' : 'success.main',
                      borderTop: '1px solid',
                      borderColor: theme.palette.divider
                    }}
                  >
                    {deleteFile2 ? (
                      <>
                        <DeleteIcon fontSize="small" color="error" />
                        <Typography variant="body2" color="error.main">
                          El archivo será eliminado al guardar
                        </Typography>
                      </>
                    ) : (
                      <>
                        <CheckCircleTwoToneIcon fontSize="small" color="success" />
                        <Typography variant="body2" color="success.main">
                          Nuevo documento listo para subir
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
                
                {disable && tracker.file_data_2 && (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mt: 'auto', 
                      pt: 2, 
                      borderTop: '1px solid',
                      borderColor: theme.palette.divider
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Haga clic para previsualizar o use el botón de descarga.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>}
          </Grid>
          
          {!disable && (newFile1 || deleteFile1 || newFile2 || deleteFile2) && (
            <Box 
              sx={{ 
                mt: 3, 
                p: 2, 
                borderRadius: 2, 
                bgcolor: theme.palette.primary.light + '10',
                border: '1px solid',
                borderColor: theme.palette.primary.light
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                Resumen de cambios
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                {newFile1 && (
                  <Typography component="li" variant="body2">
                    Se agregará un nuevo documento para {getDocumentLabel(1)}: <b>{newFile1.name}</b>
                  </Typography>
                )}
                {deleteFile1 && tracker.file_data_1 && (
                  <Typography component="li" variant="body2" color="error.main">
                    Se eliminará el documento de {getDocumentLabel(1)}: <b>{tracker.file_data_1.name}</b>
                  </Typography>
                )}
                {newFile2 && (
                  <Typography component="li" variant="body2">
                    Se agregará un nuevo documento para {getDocumentLabel(2)}: <b>{newFile2.name}</b>
                  </Typography>
                )}
                {deleteFile2 && tracker.file_data_2 && (
                  <Typography component="li" variant="body2" color="error.main">
                    Se eliminará el documento de {getDocumentLabel(2)}: <b>{tracker.file_data_2.name}</b>
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: theme.palette.divider }}>
          <Button 
            onClick={onClose} 
            color="inherit"
          >
            {disable ? "Cerrar" : "Cancelar"}
          </Button>
          
          {!disable && (
            <Button 
              variant="contained" 
              onClick={handleSave} 
              disabled={isUpdating || (
                !newFile1 && 
                !deleteFile1 && 
                !newFile2 && 
                !deleteFile2
              )}
              startIcon={isUpdating ? <CircularProgress size={20} /> : null}
            >
              {isUpdating ? "Actualizando..." : "Guardar Cambios"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Modal de vista previa de imágenes */}
      {previewImage && (
        <Dialog 
          open={!!previewImage} 
          onClose={() => setPreviewImage(null)}
          maxWidth="lg"
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Typography variant="h6">Vista previa de imagen</Typography>
            <Box>
              <IconButton 
                onClick={() => {
                  let fileName = "";
                  if (tracker.file_data_1 && tracker.file_data_1.access_url === previewImage) {
                    fileName = tracker.file_data_1.name;
                  } else if (tracker.file_data_2 && tracker.file_data_2.access_url === previewImage) {
                    fileName = tracker.file_data_2.name;
                  }
                  if (fileName) {
                    handleDownloadFile(previewImage, fileName);
                  }
                }}
                sx={{ mr: 1 }}
              >
                <DownloadIcon />
              </IconButton>
              <IconButton onClick={() => setPreviewImage(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
            <img 
              src={previewImage} 
              alt="Vista previa" 
              style={{ 
                width: '100%', 
                maxHeight: '80vh', 
                objectFit: 'contain'
              }} 
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Modal de vista previa de PDF usando PDFPreviewModal */}
      {previewPDF && (
        <PDFPreviewModal
          file={previewPDF}
          onClose={() => setPreviewPDF(null)}
        />
      )}
    </>
  );
};

export default TrackerFilesModal;