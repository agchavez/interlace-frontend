/**
 * Componente para captura de firma digital usando Canvas HTML5
 */
import { useRef, useEffect, useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Clear as ClearIcon, Check as CheckIcon } from '@mui/icons-material';

interface SignatureCaptureProps {
  onSignatureCapture: (signatureBlob: Blob | null) => void;
  width?: number;
  height?: number;
  disabled?: boolean;
}

export const SignatureCapture = ({
  onSignatureCapture,
  width = 400,
  height = 200,
  disabled = false,
}: SignatureCaptureProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [width, height]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (hasSignature) {
      saveSignature();
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      onSignatureCapture(blob);
    }, 'image/png');
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    setHasSignature(false);
    onSignatureCapture(null);
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom color="text.secondary">
        Firma del Beneficiario
      </Typography>
      <Paper
        variant="outlined"
        sx={{
          p: 1,
          bgcolor: disabled ? 'grey.100' : 'white',
          borderRadius: 1,
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            width: '100%',
            height: 'auto',
            touchAction: 'none',
            cursor: disabled ? 'not-allowed' : 'crosshair',
            border: '1px solid #e0e0e0',
            borderRadius: 4,
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </Paper>
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={clearSignature}
          disabled={!hasSignature || disabled}
        >
          Limpiar
        </Button>
        {hasSignature && (
          <Typography
            variant="caption"
            color="success.main"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <CheckIcon fontSize="small" />
            Firma capturada
          </Typography>
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Firme en el recuadro blanco usando el dedo o mouse
      </Typography>
    </Box>
  );
};
