import React from 'react';
import {
  DialogTitle,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface StandardDialogTitleProps {
  title: string;
  icon?: React.ReactNode;
  onClose: () => void;
}

export const StandardDialogTitle: React.FC<StandardDialogTitleProps> = ({
  title,
  icon,
  onClose,
}) => {
  return (
    <DialogTitle
      sx={{
        bgcolor: '#1c2536',
        color: 'white',
        py: 2,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {icon}
        <Typography variant="h6" fontWeight={600}>
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
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  );
};
