import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Avatar,
  IconButton,
  Typography,
  Paper,
  alpha,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface PhotoUploadProps {
  value?: File | string | null;
  onChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const [preview, setPreview] = useState<string | null>(
    typeof value === 'string' ? value : null
  );

  // Actualizar preview cuando cambia el valor (ej: al cargar datos en modo edición)
  useEffect(() => {
    if (typeof value === 'string') {
      setPreview(value);
    } else if (value === null) {
      setPreview(null);
    }
    // Si value es un File, el preview se manejará en onDrop
  }, [value]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      onChange(file);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    multiple: false,
    disabled,
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        {...getRootProps()}
        elevation={0}
        sx={{
          position: 'relative',
          border: '2px dashed',
          borderColor: error
            ? 'error.main'
            : isDragActive
            ? 'primary.main'
            : 'divider',
          borderRadius: 3,
          padding: 3,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: isDragActive
            ? alpha('#dcbb20', 0.05)
            : 'background.paper',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': disabled
            ? {}
            : {
                borderColor: 'primary.main',
                backgroundColor: alpha('#dcbb20', 0.03),
              },
        }}
      >
        <input {...getInputProps()} />

        {preview ? (
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              src={preview}
              sx={{
                width: 160,
                height: 160,
                margin: '0 auto',
                border: '4px solid',
                borderColor: 'background.paper',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              }}
            />
            {!disabled && (
              <IconButton
                onClick={handleDelete}
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  backgroundColor: 'error.main',
                  color: 'white',
                  width: 36,
                  height: 36,
                  '&:hover': {
                    backgroundColor: 'error.dark',
                  },
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                }}
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ) : (
          <Box>
            <Box
              sx={{
                width: 120,
                height: 120,
                margin: '0 auto 16px',
                borderRadius: '50%',
                backgroundColor: alpha('#dcbb20', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}
            >
              {isDragActive ? (
                <CloudUploadIcon
                  sx={{ fontSize: 48, color: 'primary.main' }}
                />
              ) : (
                <PhotoCameraIcon
                  sx={{ fontSize: 48, color: 'text.secondary' }}
                />
              )}
            </Box>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Inter',
                fontWeight: 600,
                color: 'text.primary',
                mb: 1,
              }}
            >
              {isDragActive
                ? 'Suelta la imagen aquí'
                : 'Foto de perfil'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Inter',
                color: 'text.secondary',
                fontSize: '0.875rem',
              }}
            >
              Arrastra una imagen o haz clic para seleccionar
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'Inter',
                color: 'text.disabled',
                display: 'block',
                mt: 1,
              }}
            >
              JPG, PNG o WEBP (máx. 5MB)
            </Typography>
          </Box>
        )}
      </Paper>

      {error && (
        <Typography
          variant="caption"
          sx={{
            fontFamily: 'Inter',
            color: 'error.main',
            display: 'block',
            mt: 1,
            ml: 2,
          }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
};
