import React from 'react';
import {
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';

interface StandardDrawerHeaderProps {
  title: string;
  icon?: React.ReactNode;
  onClose: () => void;
  onReset?: () => void;
}

export const StandardDrawerHeader: React.FC<StandardDrawerHeaderProps> = ({
  title,
  icon,
  onClose,
  onReset,
}) => {
  return (
    <Box
      sx={{
        bgcolor: '#1c2536',
        color: 'white',
        py: 1,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {onReset && (
          <IconButton
            onClick={onReset}
            size="small"
            title="Limpiar filtros"
            sx={{
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <RotateLeftIcon fontSize="small" />
          </IconButton>
        )}
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      <IconButton
        onClick={onClose}
        size="small"
        sx={{
          color: 'white',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};
