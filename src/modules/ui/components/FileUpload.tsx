import React, { useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  LinearProgress,
  Alert,
  Chip,
  useTheme,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  acceptedFormats?: string[];
  maxSizeInMB?: number;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  currentFileName?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedFormats = ['pdf', 'jpg', 'jpeg', 'png'],
  maxSizeInMB = 5,
  label = 'Subir Documento',
  error,
  helperText,
  disabled = false,
  currentFileName,
}) => {
  const theme = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return <PictureAsPdfIcon />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return <ImageIcon />;
    return <InsertDriveFileIcon />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Validar tamaño
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return `El archivo excede el tamaño máximo de ${maxSizeInMB}MB`;
    }

    // Validar formato
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
      return `Formato no permitido. Formatos aceptados: ${acceptedFormats.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        setSelectedFile(null);
        onFileSelect(null);
        return;
      }

      setUploadError('');
      setSelectedFile(file);
      onFileSelect(file);
    },
    [acceptedFormats, maxSizeInMB, onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [disabled, handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setUploadError('');
    onFileSelect(null);
  }, [onFileSelect]);

  const displayFileName = selectedFile?.name || currentFileName;

  return (
    <Box>
      {label && (
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
          {label}
        </Typography>
      )}

      <Paper
        variant="outlined"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          p: 3,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          bgcolor: isDragging
            ? 'action.hover'
            : displayFileName
            ? 'background.paper'
            : 'background.default',
          border: error
            ? `2px dashed ${theme.palette.error.main}`
            : isDragging
            ? `2px dashed ${theme.palette.primary.main}`
            : '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          transition: 'all 0.3s ease',
          opacity: disabled ? 0.6 : 1,
          '&:hover': {
            borderColor: disabled ? 'divider' : 'primary.main',
            bgcolor: disabled ? 'background.default' : 'action.hover',
          },
        }}
        onClick={() => !disabled && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept={acceptedFormats.map((f) => `.${f}`).join(',')}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />

        {!displayFileName ? (
          <Box>
            <CloudUploadIcon
              sx={{
                fontSize: 48,
                color: isDragging ? 'primary.main' : 'text.secondary',
                mb: 2,
              }}
            />
            <Typography variant="body1" sx={{ mb: 1 }}>
              {isDragging
                ? 'Suelta el archivo aquí'
                : 'Arrastra y suelta un archivo aquí o haz clic para seleccionar'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Formatos: {acceptedFormats.join(', ').toUpperCase()} • Tamaño máx: {maxSizeInMB}MB
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Box sx={{ color: 'primary.main' }}>{getFileIcon(displayFileName)}</Box>
              <Box sx={{ textAlign: 'left', flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {displayFileName}
                </Typography>
                {selectedFile && (
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(selectedFile.size)}
                  </Typography>
                )}
              </Box>
            </Box>
            {!disabled && (
              <IconButton
                size="small"
                onClick={handleRemoveFile}
                sx={{
                  color: 'error.main',
                  '&:hover': { bgcolor: 'error.lighter' },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}
      </Paper>

      {(uploadError || error) && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {uploadError || error}
        </Alert>
      )}

      {helperText && !uploadError && !error && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};
