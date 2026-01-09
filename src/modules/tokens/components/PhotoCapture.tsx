/**
 * Componente para captura de foto usando cámara o archivo
 */
import { useRef, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  FlipCameraIos as FlipCameraIcon,
} from '@mui/icons-material';

interface PhotoCaptureProps {
  onPhotoCapture: (photoFile: File | null) => void;
  label?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

export const PhotoCapture = ({
  onPhotoCapture,
  label = 'Foto',
  maxSizeMB = 5,
  disabled = false,
}: PhotoCaptureProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`El archivo no debe exceder ${maxSizeMB}MB`);
      return;
    }

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onPhotoCapture(file);
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      setStream(mediaStream);
      setCameraOpen(true);

      // Wait for dialog to render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('No se pudo acceder a la cámara. Por favor, permita el acceso o use la opción de subir archivo.');
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraOpen(false);
  };

  const switchCamera = async () => {
    // Stop current stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    // Switch facing mode
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: false,
      });
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        // Create file from blob
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });

        // Create preview
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        onPhotoCapture(file);

        closeCamera();
      },
      'image/jpeg',
      0.9
    );
  };

  const clearPhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onPhotoCapture(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom color="text.secondary">
        {label}
      </Typography>

      {previewUrl ? (
        <Paper
          variant="outlined"
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 1,
          }}
        >
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              width: '100%',
              maxHeight: 200,
              objectFit: 'contain',
              display: 'block',
            }}
          />
          {!disabled && (
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': { bgcolor: 'error.dark' },
              }}
              onClick={clearPhoto}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Paper>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: disabled ? 'grey.100' : 'grey.50',
            borderStyle: 'dashed',
            borderRadius: 1,
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<CameraIcon />}
              onClick={openCamera}
              disabled={disabled}
            >
              Cámara
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              Subir
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            JPG, PNG (máx. {maxSizeMB}MB)
          </Typography>
        </Paper>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Camera Dialog */}
      <Dialog open={cameraOpen} onClose={closeCamera} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Capturar Foto</Typography>
          <IconButton onClick={closeCamera}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              position: 'relative',
              bgcolor: 'black',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                maxHeight: 400,
                display: 'block',
              }}
            />
            <IconButton
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(255,255,255,0.3)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' },
              }}
              onClick={switchCamera}
            >
              <FlipCameraIcon />
            </IconButton>
          </Box>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCamera} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={capturePhoto} variant="contained" startIcon={<CameraIcon />}>
            Capturar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
